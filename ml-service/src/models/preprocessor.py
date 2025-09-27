"""
Image Preprocessing Pipeline for Jakarta Waste Classification
Preprocesses raw images for CNN feature extraction compatible with trained models.
"""

import numpy as np
from PIL import Image
import io
from typing import Union, Tuple
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ImagePreprocessor:
    """
    Image preprocessing pipeline matching training approach from 01-preprocessing.ipynb
    Handles mobile image input and prepares for CNN feature extraction.
    """
    
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        """
        Initialize preprocessor with target image dimensions.
        
        Args:
            target_size: Target image dimensions (height, width) for CNN models
        """
        self.target_size = target_size
        self.mean = np.array([0.485, 0.456, 0.406])  # ImageNet mean
        self.std = np.array([0.229, 0.224, 0.225])   # ImageNet std
        
    def preprocess_image(self, image_input: Union[bytes, str, Image.Image]) -> np.ndarray:
        """
        Complete preprocessing pipeline for raw image input.
        
        Args:
            image_input: Raw image as bytes, file path, or PIL Image
            
        Returns:
            Preprocessed image array ready for CNN feature extraction
            Shape: (1, 3, 224, 224) - batch_size=1, channels=3, height=224, width=224
            
        Raises:
            ValueError: If image format is unsupported or processing fails
        """
        try:
            # Load image
            image = self._load_image(image_input)
            
            # Resize to target dimensions
            image = self._resize_image(image)
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
                
            # Convert to numpy array
            image_array = np.array(image, dtype=np.float32)
            
            # Normalize to [0, 1]
            image_array = image_array / 255.0
            
            # Apply ImageNet normalization (matching CNN training)
            image_array = self._normalize_imagenet(image_array)
            
            # Convert to tensor format: (H, W, C) -> (C, H, W)
            image_array = np.transpose(image_array, (2, 0, 1))
            
            # Add batch dimension: (C, H, W) -> (1, C, H, W)
            image_array = np.expand_dims(image_array, axis=0)
            
            logger.info(f"Image preprocessed successfully. Output shape: {image_array.shape}")
            return image_array
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {str(e)}")
            raise ValueError(f"Failed to preprocess image: {str(e)}")
    
    def _load_image(self, image_input: Union[bytes, str, Image.Image]) -> Image.Image:
        """
        Load image from various input formats.
        
        Args:
            image_input: Image as bytes, file path, or PIL Image
            
        Returns:
            PIL Image object
        """
        if isinstance(image_input, bytes):
            # Load from bytes (e.g., from HTTP request)
            return Image.open(io.BytesIO(image_input))
        elif isinstance(image_input, (str, Path)):
            # Load from file path
            return Image.open(image_input)
        elif isinstance(image_input, Image.Image):
            # Already a PIL Image
            return image_input
        else:
            raise ValueError(f"Unsupported image input type: {type(image_input)}")
    
    def _resize_image(self, image: Image.Image) -> Image.Image:
        """
        Resize image to target dimensions using high-quality resampling.
        
        Args:
            image: PIL Image to resize
            
        Returns:
            Resized PIL Image
        """
        # Use LANCZOS for high-quality downsampling (mobile images are typically larger)
        return image.resize(self.target_size, Image.Resampling.LANCZOS)
    
    def _normalize_imagenet(self, image_array: np.ndarray) -> np.ndarray:
        """
        Apply ImageNet normalization (zero mean, unit variance).
        
        Args:
            image_array: Image array in range [0, 1] with shape (H, W, C)
            
        Returns:
            Normalized image array
        """
        # ImageNet normalization: (x - mean) / std
        normalized = (image_array - self.mean) / self.std
        return normalized.astype(np.float32)
    
    def validate_image(self, image_input: Union[bytes, str, Image.Image]) -> dict:
        """
        Validate image properties before preprocessing.
        
        Args:
            image_input: Raw image input
            
        Returns:
            Dictionary with validation results and image metadata
        """
        try:
            image = self._load_image(image_input)
            
            # Get image metadata
            metadata = {
                'format': image.format,
                'mode': image.mode,
                'size': image.size,  # (width, height)
                'width': image.width,
                'height': image.height,
                'is_valid': True,
                'error': None
            }
            
            # Validation checks
            min_size = 32  # Minimum dimension
            max_size = 4096  # Maximum dimension to prevent memory issues
            
            if image.width < min_size or image.height < min_size:
                metadata['is_valid'] = False
                metadata['error'] = f"Image too small. Minimum size: {min_size}x{min_size}"
            elif image.width > max_size or image.height > max_size:
                metadata['is_valid'] = False
                metadata['error'] = f"Image too large. Maximum size: {max_size}x{max_size}"
            elif image.mode not in ['RGB', 'RGBA', 'L', 'P']:
                metadata['is_valid'] = False
                metadata['error'] = f"Unsupported image mode: {image.mode}"
            
            return metadata
            
        except Exception as e:
            return {
                'is_valid': False,
                'error': f"Image validation failed: {str(e)}",
                'format': None,
                'mode': None,
                'size': None,
                'width': None,
                'height': None
            }

# Global preprocessor instance for reuse
_preprocessor = None

def get_preprocessor(target_size: Tuple[int, int] = (224, 224)) -> ImagePreprocessor:
    """
    Get global preprocessor instance (singleton pattern for performance).
    
    Args:
        target_size: Target image dimensions
        
    Returns:
        ImagePreprocessor instance
    """
    global _preprocessor
    if _preprocessor is None or _preprocessor.target_size != target_size:
        _preprocessor = ImagePreprocessor(target_size)
    return _preprocessor

def preprocess_image_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Convenience function for preprocessing image from bytes.
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        Preprocessed image array ready for CNN feature extraction
    """
    preprocessor = get_preprocessor()
    return preprocessor.preprocess_image(image_bytes)

def validate_image_bytes(image_bytes: bytes) -> dict:
    """
    Convenience function for validating image from bytes.
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        Validation results dictionary
    """
    preprocessor = get_preprocessor()
    return preprocessor.validate_image(image_bytes)