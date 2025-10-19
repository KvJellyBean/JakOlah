"""
Inference Service
Combines YOLO detector and MobileNetV3-SVM classifier for waste classification
"""
import numpy as np
import time
from typing import List, Dict, Optional
import logging

from app.models.detector_yolo import YOLODetector
from app.models.feature_extractor import FeatureExtractor
from app.models.classifier import WasteClassifier
from app.utils.image_processing import (
    preprocess_for_classification,
    crop_image,
    validate_image
)

logger = logging.getLogger(__name__)


class InferenceService:
    """
    Main inference service for waste classification
    Orchestrates detection and classification pipeline
    """
    
    def __init__(
        self,
        detector_model_path: str,
        classifier_model_path: str,
        scaler_path: str = None,
        confidence_threshold: float = 0.4,  # 🔧 Increased from 0.3 to 0.4 (reduce false positives)
        max_detections: int = 10
    ):
        """
        Initialize inference service with models
        
        Args:
            detector_model_path: Path to TFLite detector
            classifier_model_path: Path to SVM classifier
            scaler_path: Path to StandardScaler .pkl (REQUIRED!)
            confidence_threshold: Minimum confidence for detections
            max_detections: Maximum number of objects to return
        """
        self.confidence_threshold = confidence_threshold
        self.max_detections = max_detections
        
        # Load models
        logger.info("Initializing inference service...")
        self.detector = YOLODetector(confidence_threshold)
        self.feature_extractor = FeatureExtractor(scaler_path=scaler_path)
        self.classifier = WasteClassifier(classifier_model_path)
        logger.info("Inference service ready")
    
    def process_image(self, image: np.ndarray) -> Dict:
        """
        Process image through full inference pipeline:
        1. YOLO detects objects (bounding boxes)
        2. MobileNetV3 extracts features from each detection
        3. SVM classifies waste category
        
        Args:
            image: Input image (RGB numpy array)
            
        Returns:
            Dictionary with detections and metadata
        """
        start_time = time.time()
        
        try:
            # Validate input image
            if not validate_image(image, min_size=(224, 224)):
                return {
                    'detections': [],
                    'processing_time_ms': 0,
                    'error': 'Image too small (minimum 224x224 required)'
                }
            
            # Step 1: YOLO object detection
            detections = self.detector.detect(image)
            
            if not detections:
                return {
                    'detections': [],
                    'processing_time_ms': int((time.time() - start_time) * 1000),
                    'message': 'No objects detected in image'
                }
            
            # Step 2: Process each detection with CNN-SVM classifier
            results = []
            height, width = image.shape[:2]
            
            for i, detection in enumerate(detections[:self.max_detections]):
                try:
                    # Convert normalized box to pixel coordinates
                    box = detection['box']  # [ymin, xmin, ymax, xmax] normalized
                    
                    # Scale to original image size
                    ymin, xmin, ymax, xmax = box
                    x = int(xmin * width)
                    y = int(ymin * height)
                    bbox_width = int((xmax - xmin) * width)
                    bbox_height = int((ymax - ymin) * height)
                    
                    # Skip too small detections (likely false positives)
                    if bbox_width < 50 or bbox_height < 50:
                        logger.debug(f"Skipping detection {i}: bbox too small ({bbox_width}x{bbox_height})")
                        continue
                    
                    # Crop detected region (no expansion - use tight crop)
                    cropped = crop_image(image, (x, y, bbox_width, bbox_height), padding=10)
                    
                    if cropped is None or cropped.size == 0:
                        logger.warning(f"Failed to crop detection {i}")
                        continue
                    
                    # Preprocess for classification (resize to 224x224)
                    preprocessed = preprocess_for_classification(cropped)
                    
                    # Extract features with MobileNetV3
                    features = self.feature_extractor.extract(preprocessed)
                    
                    # Classify with SVM
                    category, confidence, all_confidences = self.classifier.classify(features)
                    
                    # HYBRID MODE: Use YOLO if SVM confidence is low
                    yolo_class = detection.get('class_name', 'unknown')
                    yolo_conf = detection.get('confidence', 0.0)
                    
                    # If SVM confidence < 0.6 AND YOLO confidence > 0.65, trust YOLO
                    final_category = category
                    final_confidence = confidence
                    classification_source = "svm"
                    
                    if confidence < 0.8 and yolo_conf > 0.15:
                        final_category = yolo_class
                        final_confidence = yolo_conf
                        classification_source = "yolo_fallback"
                        logger.info(f"[Detection {i+1}] Using YOLO fallback: {final_category} (SVM conf too low: {confidence:.2%})")
                    
                    # Build result
                    result = {
                        'category': final_category,
                        'confidence': round(final_confidence, 3),
                        'classification_source': classification_source,  # Track which model was used
                        'bbox': {
                            'x': x,
                            'y': y,
                            'width': bbox_width,
                            'height': bbox_height
                        },
                        'all_confidences': {
                            k: round(v, 3) for k, v in all_confidences.items()
                        },
                        'yolo_detection': {
                            'class': yolo_class,
                            'confidence': round(yolo_conf, 3)
                        }
                    }
                    
                    results.append(result)
                    logger.info(f"[Detection {i+1}] FINAL: {final_category} ({final_confidence:.2%}) via {classification_source}")
                    
                except Exception as e:
                    logger.error(f"Failed to process detection {i}: {e}")
                    continue
            
            processing_time = int((time.time() - start_time) * 1000)
            
            logger.info(f"✓ Processed {len(results)} detections in {processing_time}ms")
            
            return {
                'detections': results,
                'processing_time_ms': processing_time,
                'image_size': {
                    'width': width,
                    'height': height
                }
            }
            
        except Exception as e:
            logger.error(f"Inference failed: {e}")
            return {
                'detections': [],
                'processing_time_ms': int((time.time() - start_time) * 1000),
                'error': str(e)
            }
    

# Global inference service instance
_inference_service: Optional[InferenceService] = None


def get_inference_service(
    detector_path: str = None,
    classifier_path: str = None,
    scaler_path: str = None,
    confidence_threshold: float = 0.4,
    force_reload: bool = False
) -> InferenceService:
    """
    Get or create global inference service instance
    
    Args:
        detector_path: Path to YOLO model (optional, auto-downloads if None)
        classifier_path: Path to SVM classifier (.pkl)
        scaler_path: Path to StandardScaler (.pkl) - REQUIRED!
        confidence_threshold: Minimum confidence for detections (default: 0.4)
        force_reload: Force reload models
        
    Returns:
        Inference service instance
    """
    global _inference_service
    
    if _inference_service is None or force_reload:
        if classifier_path is None:
            raise ValueError("Classifier path required for initialization")
        
        _inference_service = InferenceService(
            detector_model_path=detector_path if detector_path else "",
            classifier_model_path=classifier_path,
            scaler_path=scaler_path,
            confidence_threshold=confidence_threshold
        )
    
    return _inference_service
