"""
Feature Extractor
MobileNetV3 CNN for extracting features from cropped waste images
"""
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV3Large
from tensorflow.keras.applications.mobilenet_v3 import preprocess_input
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class FeatureExtractor:
    """
    MobileNetV3-Large feature extractor for waste classification
    Extracts 960-dimensional features from images
    """
    
    def __init__(self):
        """Initialize MobileNetV3-Large feature extractor"""
        self.model = None
        self.feature_dim = 960
        self._load_model()
    
    def _load_model(self):
        """Load MobileNetV3-Large without top layer"""
        try:
            logger.info("Loading MobileNetV3-Large feature extractor")
            
            # Load MobileNetV3-Large pretrained on ImageNet
            # pooling='avg' gives us global average pooling
            # This produces 960-dimensional features
            self.model = MobileNetV3Large(
                include_top=False,
                weights='imagenet',
                pooling='avg',
                input_shape=(224, 224, 3)
            )
            
            # Set to inference mode (not trainable)
            self.model.trainable = False
            
            logger.info(f"Feature extractor loaded. Output dimension: {self.feature_dim}")
            
        except Exception as e:
            logger.error(f"Failed to load feature extractor: {e}")
            raise
    
    def extract(self, image: np.ndarray) -> np.ndarray:
        """
        Extract features from preprocessed image
        
        Args:
            image: Preprocessed image (224x224x3, ImageNet normalized)
            
        Returns:
            Feature vector (960 dimensions)
        """
        try:
            # Ensure image has batch dimension
            if len(image.shape) == 3:
                image = np.expand_dims(image, axis=0)
            
            # Apply MobileNetV3 preprocessing (different from manual normalization)
            # This uses the same preprocessing as training
            preprocessed = preprocess_input(image.copy())
            
            # Extract features
            features = self.model.predict(preprocessed, verbose=0)
            
            # Return features as 1D array
            return features.flatten()
            
        except Exception as e:
            logger.error(f"Feature extraction failed: {e}")
            return np.zeros(self.feature_dim)
    
    def extract_batch(self, images: list) -> np.ndarray:
        """
        Extract features from multiple images
        
        Args:
            images: List of preprocessed images
            
        Returns:
            Feature matrix (n_images x 960)
        """
        try:
            # Stack images into batch
            batch = np.stack(images, axis=0)
            
            # Apply preprocessing
            preprocessed = preprocess_input(batch.copy())
            
            # Extract features for all images
            features = self.model.predict(preprocessed, verbose=0)
            
            return features
            
        except Exception as e:
            logger.error(f"Batch feature extraction failed: {e}")
            return np.zeros((len(images), self.feature_dim))
