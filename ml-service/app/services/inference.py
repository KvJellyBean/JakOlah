"""
Inference Service
Combines detector, feature extractor, and classifier for end-to-end inference
"""
import numpy as np
import time
import uuid
from typing import List, Dict, Optional
import logging

from app.models.detector import WasteDetector
from app.models.feature_extractor import FeatureExtractor
from app.models.classifier import WasteClassifier
from app.utils.image_processing import (
    preprocess_for_detection,
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
        confidence_threshold: float = 0.3,
        max_detections: int = 10
    ):
        """
        Initialize inference service with models
        
        Args:
            detector_model_path: Path to TFLite detector
            classifier_model_path: Path to SVM classifier
            confidence_threshold: Minimum confidence for detections
            max_detections: Maximum number of objects to return
        """
        self.confidence_threshold = confidence_threshold
        self.max_detections = max_detections
        
        # Load models
        logger.info("Initializing inference service...")
        self.detector = WasteDetector(detector_model_path, confidence_threshold)
        self.feature_extractor = FeatureExtractor()
        self.classifier = WasteClassifier(classifier_model_path)
        logger.info("Inference service ready")
    
    def process_image(self, image: np.ndarray) -> Dict:
        """
        Process image through full inference pipeline
        
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
            
            # Step 1: Preprocess for detection
            preprocessed, original_size, scale_factors = preprocess_for_detection(image)
            
            # Step 2: Run object detection
            detections = self.detector.detect(preprocessed)
            
            if not detections:
                return {
                    'detections': [],
                    'processing_time_ms': int((time.time() - start_time) * 1000),
                    'message': 'No waste objects detected'
                }
            
            # Step 3: Process each detection
            results = []
            for i, detection in enumerate(detections[:self.max_detections]):
                try:
                    # Convert normalized box to pixel coordinates
                    box = detection['box']  # [ymin, xmin, ymax, xmax] normalized
                    
                    # Scale to original image size
                    ymin, xmin, ymax, xmax = box
                    x = int(xmin * original_size[1])
                    y = int(ymin * original_size[0])
                    width = int((xmax - xmin) * original_size[1])
                    height = int((ymax - ymin) * original_size[0])
                    
                    # Crop detected region with padding
                    cropped = crop_image(image, (x, y, width, height), padding=10)
                    
                    if cropped is None or cropped.size == 0:
                        logger.warning(f"Failed to crop detection {i}")
                        continue
                    
                    # Preprocess crop for classification
                    classified_input = preprocess_for_classification(cropped)
                    
                    # Extract features
                    features = self.feature_extractor.extract(classified_input)
                    
                    # Classify
                    category, confidence, all_confidences = self.classifier.classify(features)
                    
                    # Build result
                    result = {
                        'id': str(uuid.uuid4()),
                        'category': category,
                        'confidence': round(confidence, 3),
                        'bbox': {
                            'x': x,
                            'y': y,
                            'width': width,
                            'height': height
                        },
                        'normalized_bbox': {
                            'xmin': float(xmin),
                            'ymin': float(ymin),
                            'xmax': float(xmax),
                            'ymax': float(ymax)
                        },
                        'all_confidences': {
                            k: round(v, 3) for k, v in all_confidences.items()
                        }
                    }
                    
                    results.append(result)
                    
                except Exception as e:
                    logger.error(f"Failed to process detection {i}: {e}")
                    continue
            
            processing_time = int((time.time() - start_time) * 1000)
            
            logger.info(f"Processed {len(results)} detections in {processing_time}ms")
            
            return {
                'detections': results,
                'processing_time_ms': processing_time,
                'image_size': {
                    'width': original_size[1],
                    'height': original_size[0]
                }
            }
            
        except Exception as e:
            logger.error(f"Inference failed: {e}")
            return {
                'detections': [],
                'processing_time_ms': int((time.time() - start_time) * 1000),
                'error': str(e)
            }
    
    def process_batch(self, images: List[np.ndarray]) -> List[Dict]:
        """
        Process multiple images
        
        Args:
            images: List of input images
            
        Returns:
            List of result dictionaries
        """
        results = []
        for i, image in enumerate(images):
            logger.info(f"Processing image {i+1}/{len(images)}")
            result = self.process_image(image)
            results.append(result)
        return results


# Global inference service instance
_inference_service: Optional[InferenceService] = None


def get_inference_service(
    detector_path: str = None,
    classifier_path: str = None,
    force_reload: bool = False
) -> InferenceService:
    """
    Get or create global inference service instance
    
    Args:
        detector_path: Path to detector model
        classifier_path: Path to classifier model
        force_reload: Force reload models
        
    Returns:
        Inference service instance
    """
    global _inference_service
    
    if _inference_service is None or force_reload:
        if detector_path is None or classifier_path is None:
            raise ValueError("Model paths required for first initialization")
        
        _inference_service = InferenceService(
            detector_model_path=detector_path,
            classifier_model_path=classifier_path
        )
    
    return _inference_service
