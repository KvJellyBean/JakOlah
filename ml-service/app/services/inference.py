"""
Inference Service
Menggabungkan detector dan MobileNetV3-SVM classifier untuk klasifikasi sampah
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
    Service inference utama untuk klasifikasi sampah
    Mengorkestrasi pipeline deteksi dan klasifikasi
    """
    
    def __init__(
        self,
        detector_model_path: str,
        classifier_model_path: str,
        scaler_path: str = None,
        confidence_threshold: float = 0.4,
        max_detections: int = 10
    ):
        """
        Inisialisasi service inference dengan model
        
        Args:
            detector_model_path: Path ke detector TFLite
            classifier_model_path: Path ke classifier SVM
            scaler_path: Path ke StandardScaler .pkl (WAJIB!)
            confidence_threshold: Confidence minimum untuk deteksi
            max_detections: Jumlah maksimum objek yang dikembalikan
        """
        self.confidence_threshold = confidence_threshold
        self.max_detections = max_detections
        
        # Muat model
        logger.info("Initializing inference service...")
        self.detector = YOLODetector(confidence_threshold)
        self.feature_extractor = FeatureExtractor(scaler_path=scaler_path)
        self.classifier = WasteClassifier(classifier_model_path)
        logger.info("Inference service ready")
    
    def process_image(self, image: np.ndarray) -> Dict:
        """
        Proses gambar melalui full inference pipeline:
        1. YOLO mendeteksi objek (bounding boxes)
        2. MobileNetV3 mengekstrak fitur dari setiap deteksi
        3. SVM mengklasifikasi kategori sampah
        
        Args:
            image: Input gambar (RGB numpy array)
            
        Returns:
            Dictionary dengan deteksi dan metadata
        """
        start_time = time.time()
        
        try:
            # Validasi gambar input
            if not validate_image(image, min_size=(224, 224)):
                return {
                    'detections': [],
                    'processing_time_ms': 0,
                    'error': 'Image too small (minimum 224x224 required)'
                }
            
            # Step 1: Deteksi objek YOLO
            detections = self.detector.detect(image)
            
            if not detections:
                return {
                    'detections': [],
                    'processing_time_ms': int((time.time() - start_time) * 1000),
                    'message': 'No objects detected in image'
                }
            
            # Step 2: Proses setiap deteksi dengan CNN-SVM classifier
            results = []
            height, width = image.shape[:2]
            
            for i, detection in enumerate(detections[:self.max_detections]):
                try:
                    # Konversi normalized box ke koordinat pixel
                    box = detection['box']  # [ymin, xmin, ymax, xmax] normalized
                    
                    # Scale ke ukuran gambar original
                    ymin, xmin, ymax, xmax = box
                    x = int(xmin * width)
                    y = int(ymin * height)
                    bbox_width = int((xmax - xmin) * width)
                    bbox_height = int((ymax - ymin) * height)
                    
                    # Lewati deteksi yang terlalu kecil (kemungkinan false positives)
                    if bbox_width < 50 or bbox_height < 50:
                        logger.debug(f"Skipping detection {i}: bbox too small ({bbox_width}x{bbox_height})")
                        continue
                    
                    # Crop region yang terdeteksi (tanpa expansion - gunakan tight crop)
                    cropped = crop_image(image, (x, y, bbox_width, bbox_height), padding=10)
                    
                    if cropped is None or cropped.size == 0:
                        logger.warning(f"Failed to crop detection {i}")
                        continue
                    
                    # Preprocess untuk klasifikasi (resize ke 224x224)
                    preprocessed = preprocess_for_classification(cropped)
                    
                    # Ekstrak fitur dengan MobileNetV3
                    features = self.feature_extractor.extract(preprocessed)
                    
                    # Klasifikasi dengan SVM
                    category, confidence, all_confidences = self.classifier.classify(features)
                    
                    yolo_class = detection.get('class_name', 'unknown')
                    yolo_conf = detection.get('confidence', 0.0)
                    
                    final_category = category
                    final_confidence = confidence
                    classification_source = "svm"
                    
                    if confidence < 0.8 and yolo_conf > 0.15:
                        final_category = yolo_class
                        final_confidence = yolo_conf
                        classification_source = "yolo_fallback"
                        logger.info(f"[Detection {i+1}] Using YOLO fallback: {final_category} (SVM conf too low: {confidence:.2%})")
                    
                    # Bangun hasil
                    result = {
                        'category': final_category,
                        'confidence': round(final_confidence, 3),
                        'classification_source': classification_source,
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
    

# Instance global inference service
_inference_service: Optional[InferenceService] = None


def get_inference_service(
    detector_path: str = None,
    classifier_path: str = None,
    scaler_path: str = None,
    confidence_threshold: float = 0.4,
    force_reload: bool = False
) -> InferenceService:
    """
    Dapatkan atau buat instance global inference service
    
    Args:
        detector_path: Path ke model YOLO (opsional, auto-download jika None)
        classifier_path: Path ke classifier SVM (.pkl)
        scaler_path: Path ke StandardScaler (.pkl) - WAJIB!
        confidence_threshold: Confidence minimum untuk deteksi (default: 0.4)
        force_reload: Paksa reload model
        
    Returns:
        Instance inference service
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
