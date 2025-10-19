"""
Feature Extractor
MobileNetV3 CNN for extracting features from cropped waste images
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
    MobileNetV3-Large feature extractor for waste classification
    Extracts 960-dimensional features from images
    CRITICAL: Uses StandardScaler for feature normalization (same as training)
    """
    
    def __init__(self, scaler_path: Optional[str] = None):
        """
        Initialize MobileNetV3-Large feature extractor
        
        Args:
            scaler_path: Path to mobilenet_scaler.pkl (REQUIRED for production!)
        """
        self.model = None
        self.scaler = None
        self.feature_dim = 960
        self.scaler_path = scaler_path
        self._load_model()
        self._load_scaler()
    
    def _load_model(self):
        """Load MobileNetV3-Large without top layer with optimizations"""
        try:
            logger.info("Loading MobileNetV3-Large feature extractor")
            
            # Load MobileNetV3-Large pretrained on ImageNet
            # pooling='avg' gives us global average pooling (960-dim features)
            self.model = MobileNetV3Large(
                include_top=False,
                weights='imagenet',
                pooling='avg',
                input_shape=(224, 224, 3)
            )
            
            # Set to inference mode (not trainable)
            self.model.trainable = False
            
            # Warm up model (first prediction is slow due to graph compilation)
            logger.info("Warming up MobileNetV3 model...")
            dummy_image = np.zeros((1, 224, 224, 3), dtype=np.float32)
            _ = self.model.predict(dummy_image, verbose=0)
            
            logger.info(f"✓ Feature extractor loaded. Output dimension: {self.feature_dim}")
            
        except Exception as e:
            logger.error(f"Failed to load feature extractor: {e}")
            raise
    
    def _load_scaler(self):
        """Load StandardScaler from training (CRITICAL!)"""
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
        Extract features from image (RGB, 0-255)
        Uses EXACT same normalization as training (ImageNet standard)
        
        Args:
            image: Raw resized image (224x224x3, RGB, 0-255 range)
            
        Returns:
            Feature vector (960 dimensions)
        """
        try:
            # Ensure image has batch dimension
            if len(image.shape) == 3:
                image = np.expand_dims(image, axis=0)
            
            # Apply EXACT same preprocessing as training:
            # 1. Convert to float32
            # 2. Scale to [0, 1]
            # 3. Normalize with ImageNet mean/std (PyTorch standard)
            preprocessed = image.astype(np.float32) / 255.0
            
            # ImageNet normalization (same as PyTorch training)
            mean = np.array([0.485, 0.456, 0.406])
            std = np.array([0.229, 0.224, 0.225])
            preprocessed = (preprocessed - mean) / std
            
            # Extract features
            features = self.model.predict(preprocessed, verbose=0)
            
            # Apply StandardScaler normalization (same as training!)
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
