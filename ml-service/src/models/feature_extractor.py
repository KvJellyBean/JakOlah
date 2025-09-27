"""
CNN Feature Extraction for Jakarta Waste Classification
Extracts features using ResNet50 and MobileNetV3 matching 02-feature-extraction.ipynb approach.
"""

import numpy as np
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from typing import Dict, List, Tuple, Optional
import logging
from pathlib import Path
import time

logger = logging.getLogger(__name__)

class CNNFeatureExtractor:
    """
    CNN feature extraction using ResNet50 and MobileNetV3.
    Generates feature vectors compatible with trained SVM models.
    """
    
    def __init__(self, device: Optional[str] = None):
        """
        Initialize CNN feature extractor with both model architectures.
        
        Args:
            device: PyTorch device ('cpu', 'cuda', etc.). Auto-detect if None.
        """
        # Auto-detect device if not specified
        if device is None:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        else:
            self.device = torch.device(device)
        
        logger.info(f"Using device: {self.device}")
        
        # Initialize models
        self.models = {}
        self.feature_sizes = {}
        self._load_models()
        
    def _load_models(self):
        """Load and prepare CNN models for feature extraction."""
        try:
            # Load ResNet50 (pretrained on ImageNet)
            self.models['resnet50'] = self._load_resnet50()
            self.feature_sizes['resnet50'] = 2048  # ResNet50 feature size
            
            # Load MobileNetV3 (pretrained on ImageNet)
            self.models['mobilenetv3'] = self._load_mobilenetv3()
            self.feature_sizes['mobilenetv3'] = 960  # MobileNetV3-Large feature size
            
            logger.info("CNN models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load CNN models: {str(e)}")
            raise RuntimeError(f"Model loading failed: {str(e)}")
    
    def _load_resnet50(self) -> nn.Module:
        """
        Load ResNet50 model for feature extraction.
        
        Returns:
            ResNet50 model with classifier removed (returns features)
        """
        # Load pretrained ResNet50
        model = models.resnet50(weights=models.ResNet50_Weights.IMAGENET1K_V2)
        
        # Remove the final classification layer to get features
        # ResNet50 architecture: ... -> avgpool -> fc
        # We want features after avgpool (before fc)
        model = nn.Sequential(*list(model.children())[:-1])  # Remove fc layer
        
        # Add global average pooling and flatten for consistent output
        model.add_module('global_avg_pool', nn.AdaptiveAvgPool2d((1, 1)))
        model.add_module('flatten', nn.Flatten())
        
        model.eval()  # Set to evaluation mode
        model.to(self.device)
        
        return model
    
    def _load_mobilenetv3(self) -> nn.Module:
        """
        Load MobileNetV3 model for feature extraction.
        
        Returns:
            MobileNetV3 model with classifier removed (returns features)
        """
        # Load pretrained MobileNetV3-Large
        model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2)
        
        # Remove the final classification layers to get features
        # MobileNetV3 architecture: features -> avgpool -> classifier
        # We want features after avgpool (before classifier)
        feature_extractor = nn.Sequential(
            model.features,  # All convolutional layers
            model.avgpool,   # Global average pooling
            nn.Flatten()     # Flatten for consistent output
        )
        
        feature_extractor.eval()  # Set to evaluation mode
        feature_extractor.to(self.device)
        
        return feature_extractor
    
    def extract_features(self, 
                        preprocessed_image: np.ndarray, 
                        model_name: str = 'both') -> Dict[str, np.ndarray]:
        """
        Extract features from preprocessed image using specified CNN model(s).
        
        Args:
            preprocessed_image: Preprocessed image array with shape (1, 3, 224, 224)
            model_name: Model to use ('resnet50', 'mobilenetv3', or 'both')
            
        Returns:
            Dictionary with model names as keys and feature vectors as values
            
        Raises:
            ValueError: If model_name is invalid or feature extraction fails
        """
        start_time = time.time()
        
        try:
            # Validate input shape
            if preprocessed_image.shape != (1, 3, 224, 224):
                raise ValueError(f"Expected input shape (1, 3, 224, 224), got {preprocessed_image.shape}")
            
            # Convert numpy array to PyTorch tensor
            input_tensor = torch.from_numpy(preprocessed_image).float().to(self.device)
            
            features = {}
            
            if model_name == 'both' or model_name == 'resnet50':
                features['resnet50'] = self._extract_single_model(input_tensor, 'resnet50')
            
            if model_name == 'both' or model_name == 'mobilenetv3':
                features['mobilenetv3'] = self._extract_single_model(input_tensor, 'mobilenetv3')
            
            # Validate model_name
            if model_name not in ['both', 'resnet50', 'mobilenetv3']:
                raise ValueError(f"Invalid model_name: {model_name}. Use 'resnet50', 'mobilenetv3', or 'both'")
            
            extraction_time = time.time() - start_time
            logger.info(f"Feature extraction completed in {extraction_time:.3f}s. Models: {list(features.keys())}")
            
            return features
            
        except Exception as e:
            logger.error(f"Feature extraction failed: {str(e)}")
            raise ValueError(f"Feature extraction failed: {str(e)}")
    
    def _extract_single_model(self, input_tensor: torch.Tensor, model_name: str) -> np.ndarray:
        """
        Extract features using a single CNN model.
        
        Args:
            input_tensor: Preprocessed image tensor
            model_name: Name of the model to use
            
        Returns:
            Feature vector as numpy array
        """
        model = self.models[model_name]
        
        with torch.no_grad():  # Disable gradient computation for inference
            features = model(input_tensor)
            
        # Convert to numpy and remove batch dimension
        feature_vector = features.cpu().numpy().squeeze()  # Shape: (feature_size,)
        
        # Validate output shape
        expected_size = self.feature_sizes[model_name]
        if feature_vector.shape != (expected_size,):
            raise RuntimeError(f"Unexpected feature shape for {model_name}: {feature_vector.shape}, expected ({expected_size},)")
        
        return feature_vector
    
    def get_feature_size(self, model_name: str) -> int:
        """
        Get feature vector size for specified model.
        
        Args:
            model_name: Name of the model
            
        Returns:
            Feature vector size
        """
        if model_name not in self.feature_sizes:
            raise ValueError(f"Unknown model: {model_name}")
        return self.feature_sizes[model_name]
    
    def get_available_models(self) -> List[str]:
        """
        Get list of available CNN models.
        
        Returns:
            List of available model names
        """
        return list(self.models.keys())
    
    def benchmark_extraction(self, preprocessed_image: np.ndarray, runs: int = 10) -> Dict[str, float]:
        """
        Benchmark feature extraction performance.
        
        Args:
            preprocessed_image: Sample preprocessed image
            runs: Number of benchmark runs
            
        Returns:
            Dictionary with average extraction times per model
        """
        results = {}
        
        for model_name in self.models.keys():
            times = []
            for _ in range(runs):
                start_time = time.time()
                self.extract_features(preprocessed_image, model_name)
                times.append(time.time() - start_time)
            
            avg_time = sum(times) / len(times)
            results[model_name] = avg_time
            
        logger.info(f"Benchmark results (avg over {runs} runs): {results}")
        return results

# Global feature extractor instance for reuse
_feature_extractor = None

def get_feature_extractor(device: Optional[str] = None) -> CNNFeatureExtractor:
    """
    Get global feature extractor instance (singleton pattern for performance).
    
    Args:
        device: PyTorch device
        
    Returns:
        CNNFeatureExtractor instance
    """
    global _feature_extractor
    if _feature_extractor is None:
        _feature_extractor = CNNFeatureExtractor(device)
    return _feature_extractor

def extract_features_batch(preprocessed_images: List[np.ndarray], 
                         model_name: str = 'both') -> List[Dict[str, np.ndarray]]:
    """
    Extract features from multiple images.
    
    Args:
        preprocessed_images: List of preprocessed image arrays
        model_name: Model to use for extraction
        
    Returns:
        List of feature dictionaries (one per image)
    """
    extractor = get_feature_extractor()
    
    results = []
    for i, image in enumerate(preprocessed_images):
        try:
            features = extractor.extract_features(image, model_name)
            results.append(features)
        except Exception as e:
            logger.error(f"Failed to extract features for image {i}: {str(e)}")
            # Return empty features dict for failed extraction
            results.append({})
    
    return results

def extract_resnet50_features(preprocessed_image: np.ndarray) -> np.ndarray:
    """
    Convenience function for ResNet50 feature extraction.
    
    Args:
        preprocessed_image: Preprocessed image array
        
    Returns:
        ResNet50 feature vector
    """
    extractor = get_feature_extractor()
    features = extractor.extract_features(preprocessed_image, 'resnet50')
    return features['resnet50']

def extract_mobilenetv3_features(preprocessed_image: np.ndarray) -> np.ndarray:
    """
    Convenience function for MobileNetV3 feature extraction.
    
    Args:
        preprocessed_image: Preprocessed image array
        
    Returns:
        MobileNetV3 feature vector
    """
    extractor = get_feature_extractor()
    features = extractor.extract_features(preprocessed_image, 'mobilenetv3')
    return features['mobilenetv3']