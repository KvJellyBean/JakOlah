"""
Image Processing Utilities
Handles image preprocessing for ML models
"""
import cv2
import numpy as np
from PIL import Image
import io
import base64
from typing import Tuple, Optional


def decode_base64_image(base64_string: str) -> np.ndarray:
    """
    Decode base64 string to numpy array image
    
    Args:
        base64_string: Base64 encoded image string
        
    Returns:
        numpy array representing the image
    """
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64 to bytes
    image_bytes = base64.b64decode(base64_string)
    
    # Convert bytes to PIL Image
    image = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Convert to numpy array
    image_array = np.array(image)
    
    return image_array


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


def resize_image(
    image: np.ndarray,
    target_size: Tuple[int, int],
    maintain_aspect_ratio: bool = True
) -> Tuple[np.ndarray, Tuple[float, float]]:
    """
    Resize image to target size
    
    Args:
        image: Input image as numpy array
        target_size: (width, height) tuple
        maintain_aspect_ratio: Whether to maintain aspect ratio
        
    Returns:
        Tuple of (resized_image, scale_factors)
    """
    original_height, original_width = image.shape[:2]
    target_width, target_height = target_size
    
    if maintain_aspect_ratio:
        # Calculate scaling factor
        scale = min(target_width / original_width, target_height / original_height)
        new_width = int(original_width * scale)
        new_height = int(original_height * scale)
        
        # Resize image
        resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
        
        # Create canvas with target size
        canvas = np.zeros((target_height, target_width, 3), dtype=np.uint8)
        
        # Center the resized image on canvas
        y_offset = (target_height - new_height) // 2
        x_offset = (target_width - new_width) // 2
        canvas[y_offset:y_offset+new_height, x_offset:x_offset+new_width] = resized
        
        scale_x = new_width / original_width
        scale_y = new_height / original_height
    else:
        # Direct resize
        canvas = cv2.resize(image, target_size, interpolation=cv2.INTER_LINEAR)
        scale_x = target_width / original_width
        scale_y = target_height / original_height
    
    return canvas, (scale_x, scale_y)


def normalize_image(image: np.ndarray, method: str = 'standard') -> np.ndarray:
    """
    Normalize image for model input
    
    Args:
        image: Input image as numpy array
        method: Normalization method ('standard', 'imagenet', 'zero_one')
        
    Returns:
        Normalized image
    """
    image = image.astype(np.float32)
    
    if method == 'standard':
        # Normalize to [-1, 1]
        image = (image / 127.5) - 1.0
    elif method == 'imagenet':
        # ImageNet mean and std
        mean = np.array([123.675, 116.28, 103.53])
        std = np.array([58.395, 57.12, 57.375])
        image = (image - mean) / std
    elif method == 'zero_one':
        # Normalize to [0, 1]
        image = image / 255.0
    else:
        raise ValueError(f"Unknown normalization method: {method}")
    
    return image


def preprocess_for_detection(
    image: np.ndarray,
    input_size: Tuple[int, int] = (256, 256)  # Match TFLite model input
) -> Tuple[np.ndarray, Tuple[int, int], Tuple[float, float]]:
    """
    Preprocess image for object detection model
    
    Args:
        image: Input image as numpy array
        input_size: Target input size for model
        
    Returns:
        Tuple of (preprocessed_image, original_size, scale_factors)
    """
    original_height, original_width = image.shape[:2]
    original_size = (original_width, original_height)
    
    # Resize image
    resized, scale_factors = resize_image(image, input_size, maintain_aspect_ratio=True)
    
    # Normalize
    normalized = normalize_image(resized, method='zero_one')
    
    # Add batch dimension
    preprocessed = np.expand_dims(normalized, axis=0)
    
    return preprocessed, original_size, scale_factors


def preprocess_for_classification(
    image: np.ndarray,
    input_size: Tuple[int, int] = (224, 224)
) -> np.ndarray:
    """
    Preprocess image for classification model (MobileNetV3)
    
    Args:
        image: Input image as numpy array
        input_size: Target input size for model
        
    Returns:
        Preprocessed image ready for classification
    """
    # Resize without maintaining aspect ratio for classification
    resized, _ = resize_image(image, input_size, maintain_aspect_ratio=False)
    
    # Normalize using standard method
    normalized = normalize_image(resized, method='imagenet')
    
    return normalized


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


def adjust_brightness_contrast(
    image: np.ndarray,
    brightness: float = 0,
    contrast: float = 1.0
) -> np.ndarray:
    """
    Adjust image brightness and contrast
    
    Args:
        image: Input image
        brightness: Brightness adjustment (-100 to 100)
        contrast: Contrast adjustment (0.5 to 1.5)
        
    Returns:
        Adjusted image
    """
    adjusted = cv2.convertScaleAbs(image, alpha=contrast, beta=brightness)
    return adjusted


def enhance_image_quality(image: np.ndarray) -> np.ndarray:
    """
    Enhance image quality for better detection
    
    Args:
        image: Input image
        
    Returns:
        Enhanced image
    """
    # Apply denoising
    denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
    
    # Enhance contrast using CLAHE
    lab = cv2.cvtColor(denoised, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    enhanced_lab = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2RGB)
    
    return enhanced
