"""
Feature Extractor
MobileNetV3-Large untuk mengekstrak fitur 960-dimensi dari objek sampah
Fitur ini kemudian digunakan oleh SVM classifier untuk klasifikasi kategori
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV3Large
from typing import Optional
import logging
import joblib
from pathlib import Path

logger = logging.getLogger(__name__)


class FeatureExtractor:
    """
    Feature extractor MobileNetV3-Large untuk klasifikasi sampah
    Mengekstrak fitur 960-dimensi dari gambar
    """
    
    def __init__(self, scaler_path: Optional[str] = None):
        """
        Inisialisasi feature extractor MobileNetV3-Large
        
        Args:
            scaler_path: Path ke mobilenet_scaler.pkl
        """
        self.model = None
        self.scaler = None
        self.feature_dim = 960
        self.scaler_path = scaler_path
        self._load_model()
        self._load_scaler()
    
    def _load_model(self):
        """Muat MobileNetV3-Large tanpa top layer dengan optimasi"""
        try:
            logger.info("Loading MobileNetV3-Large feature extractor")
            
            # Muat MobileNetV3-Large pretrained pada ImageNet
            # pooling='avg' memberikan global average pooling (fitur 960-dim)
            self.model = MobileNetV3Large(
                include_top=False,
                weights='imagenet',
                pooling='avg',
                input_shape=(224, 224, 3)
            )
            
            # Set ke mode inference (tidak trainable)
            self.model.trainable = False
            
            # Warm up model (prediksi pertama lambat karena kompilasi graph)
            logger.info("Warming up MobileNetV3 model...")
            dummy_image = np.zeros((1, 224, 224, 3), dtype=np.float32)
            _ = self.model.predict(dummy_image, verbose=0)
            
            logger.info(f"✓ Feature extractor loaded. Output dimension: {self.feature_dim}")
            
        except Exception as e:
            logger.error(f"Failed to load feature extractor: {e}")
            raise
    
    def _load_scaler(self):
        """Muat StandardScaler dari training (KRITIS!)"""
        try:
            if self.scaler_path and Path(self.scaler_path).exists():
                logger.info(f"Loading StandardScaler from {self.scaler_path}")
                self.scaler = joblib.load(self.scaler_path)
                logger.info("✓ StandardScaler loaded successfully")
            else:
                logger.warning("⚠️  No scaler provided - features will NOT be normalized!")
                logger.warning("This will cause INCORRECT predictions!")
                logger.warning("Please provide mobilenet_scaler.pkl from training")
                self.scaler = None
        except Exception as e:
            logger.error(f"Failed to load scaler: {e}")
            self.scaler = None
    
    def extract(self, image: np.ndarray) -> np.ndarray:
        """
        Ekstrak fitur dari gambar (RGB, 0-255)
        Menggunakan normalisasi yang SAMA PERSIS dengan training (standar ImageNet)
        
        Args:
            image: Gambar resized raw (224x224x3, RGB, range 0-255)
            
        Returns:
            Vector fitur (960 dimensi)
        """
        try:
            # Pastikan gambar memiliki dimensi batch
            if len(image.shape) == 3:
                image = np.expand_dims(image, axis=0)
            
            # Terapkan preprocessing yang SAMA PERSIS dengan training:
            # 1. Konversi ke float32 (TETAP 0-255, tidak di-scale ke 0-1!)
            # 2. Normalisasi dengan mean/std ImageNet dalam skala 0-255
            preprocessed = image.astype(np.float32)
            
            # Normalisasi ImageNet (sama dengan training: mean/std dalam skala 0-255)
            mean = np.array([0.485, 0.456, 0.406]) * 255.0  # [123.675, 116.28, 103.53]
            std = np.array([0.229, 0.224, 0.225]) * 255.0   # [58.395, 57.375, 57.375]
            preprocessed = (preprocessed - mean) / std
            
            # Ekstrak fitur
            features = self.model.predict(preprocessed, verbose=0)
            
            # Terapkan normalisasi StandardScaler (sama dengan training!)
            features_flat = features.flatten().reshape(1, -1)
            
            if self.scaler is not None:
                features_normalized = self.scaler.transform(features_flat)
                return features_normalized.flatten()
            else:
                logger.warning(f"⚠️  NO StandardScaler - predictions may be WRONG!")
                return features_flat.flatten()
            
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            return np.zeros(self.feature_dim)
