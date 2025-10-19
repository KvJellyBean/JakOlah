"""
Image Processing Utilities
Handles image preprocessing for ML models
"""
import cv2
import numpy as np
from PIL import Image
from typing import Tuple


def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Decode image bytes to numpy array
    
    Args:
        image_bytes: Raw image bytes
        
    Returns:
        numpy array representing the image
    """
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    
    # Decode image
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Failed to decode image")
    
    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    return image


def preprocess_for_classification(
    image: np.ndarray,
    input_size: Tuple[int, int] = (224, 224)
) -> np.ndarray:
    """
    Preprocess image for classification model (MobileNetV3)
    EXACT MATCH with training pipeline (PyTorch transforms)
    
    Args:
        image: Input image as numpy array (RGB, 0-255)
        input_size: Target input size for model
        
    Returns:
        Resized image (RGB, 0-255) ready for feature extractor
    """
    # Resize to 224x224 WITHOUT maintaining aspect ratio (same as training)
    # OpenCV resize uses (width, height) format
    resized = cv2.resize(image, input_size, interpolation=cv2.INTER_LINEAR)
    
    # Return raw resized image (0-255)
    # Feature extractor will apply ImageNet normalization
    return resized


def crop_image(
    image: np.ndarray,
    bbox: Tuple[int, int, int, int],
    padding: int = 10
) -> np.ndarray:
    """
    Crop image using bounding box with optional padding
    
    Args:
        image: Input image as numpy array
        bbox: Bounding box as (x, y, width, height)
        padding: Padding pixels around bbox
        
    Returns:
        Cropped image
    """
    height, width = image.shape[:2]
    x, y, w, h = bbox
    
    # Add padding
    x1 = max(0, x - padding)
    y1 = max(0, y - padding)
    x2 = min(width, x + w + padding)
    y2 = min(height, y + h + padding)
    
    # Crop
    cropped = image[y1:y2, x1:x2]
    
    return cropped


def validate_image(image: np.ndarray, min_size: Tuple[int, int] = (224, 224)) -> bool:
    """
    Validate image meets minimum requirements
    
    Args:
        image: Input image as numpy array
        min_size: Minimum (width, height) required
        
    Returns:
        True if valid, False otherwise
    """
    if image is None or len(image.shape) < 2:
        return False
    
    height, width = image.shape[:2]
    min_width, min_height = min_size
    
    if width < min_width or height < min_height:
        return False
    
    return True
