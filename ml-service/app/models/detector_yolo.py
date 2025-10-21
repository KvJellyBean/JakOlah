"""
YOLO Detector
YOLOv11 untuk deteksi objek umum
"""
import numpy as np
import cv2
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    logger.warning("ultralytics not installed. YOLO detector will not work.")


class YOLODetector:
    """
    Detector objek YOLOv11
    Mendeteksi objek umum dalam gambar menggunakan YOLO pretrained
    """
    
    def __init__(self, confidence_threshold: float = 0.4):
        """
        Inisialisasi detector YOLO
        
        Args:
            confidence_threshold: Confidence minimum untuk deteksi (default: 0.4)
        """
        if not YOLO_AVAILABLE:
            raise ImportError(
                "ultralytics package not installed. "
                "Install with: pip install ultralytics"
            )
        
        self.confidence_threshold = confidence_threshold
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Muat model YOLOv11 dengan optimasi"""
        try:
            logger.info("Loading YOLOv11 model...")
            # Muat model custom terlatih dengan optimasi performa
            self.model = YOLO('./models/best.pt')
            
            # Warm up model (prediksi pertama selalu lambat)
            logger.info("Warming up YOLO model...")
            dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
            _ = self.model(dummy_image, conf=self.confidence_threshold, verbose=False)
            
            logger.info("✓ YOLOv11 model loaded and warmed up")
            
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise
    
    def detect(self, image: np.ndarray) -> List[Dict]:
        """
        Deteksi objek dalam gambar dengan setting teroptimasi
        
        Args:
            image: Gambar input (RGB numpy array, HxWx3)
            
        Returns:
            List deteksi dengan format:
            [
                {
                    'box': [ymin, xmin, ymax, xmax],  # Koordinat normalized
                    'confidence': float,
                    'class_id': int,
                    'class_name': str
                },
                ...
            ]
        """
        try:
            if image is None or len(image.shape) != 3:
                logger.error("Invalid image format")
                return []
            
            height, width = image.shape[:2]
            
            # Jalankan YOLO inference dengan setting teroptimasi
            # imgsz=640 untuk tradeoff kecepatan-akurasi yang lebih baik
            # max_det=10 untuk membatasi deteksi
            # agnostic_nms=True untuk NMS yang lebih baik
            results = self.model(
                image, 
                conf=self.confidence_threshold,
                imgsz=640,
                max_det=10,
                agnostic_nms=True,
                verbose=False
            )
            
            detections = []
            
            # Proses hasil
            for result in results:
                boxes = result.boxes
                
                for box in boxes:
                    # Dapatkan koordinat box (format xyxy)
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    
                    # Konversi ke koordinat normalized [ymin, xmin, ymax, xmax]
                    normalized_box = [
                        float(y1 / height),  # ymin
                        float(x1 / width),   # xmin
                        float(y2 / height),  # ymax
                        float(x2 / width)    # xmax
                    ]
                    
                    # Dapatkan confidence dan class
                    conf = float(box.conf[0].cpu().numpy())
                    cls = int(box.cls[0].cpu().numpy())
                    class_name = self.model.names[cls]
                    
                    detection = {
                        'box': normalized_box,
                        'confidence': conf,
                        'class_id': cls,
                        'class_name': class_name
                    }
                    
                    detections.append(detection)
            
            if detections:
                logger.info(f"[YOLO] Detected {len(detections)} objects")
            
            return detections
            
        except Exception as e:
            logger.error(f"YOLO detection failed: {e}")
            return []
