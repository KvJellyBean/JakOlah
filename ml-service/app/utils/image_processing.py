"""
Image Processing Utilities
Menangani preprocessing gambar untuk model ML
"""
import cv2
import numpy as np
from PIL import Image
from typing import Tuple


def decode_image_bytes(image_bytes: bytes) -> np.ndarray:
    """
    Decode byte gambar ke numpy array
    
    Args:
        image_bytes: Byte gambar raw
        
    Returns:
        numpy array yang merepresentasikan gambar
    """
    # Konversi byte ke numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    
    # Decode gambar
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise ValueError("Failed to decode image")
    
    # Konversi BGR ke RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
    return image


def preprocess_for_classification(
    image: np.ndarray,
    input_size: Tuple[int, int] = (224, 224)
) -> np.ndarray:
    """
    Preprocess gambar untuk model klasifikasi (MobileNetV3)
    COCOK PERSIS dengan pipeline training (transformasi PyTorch)
    
    Args:
        image: Gambar input sebagai numpy array (RGB, 0-255)
        input_size: Ukuran input target untuk model
        
    Returns:
        Gambar di-resize (RGB, 0-255) siap untuk feature extractor
    """
    # Resize ke 224x224 TANPA mempertahankan aspect ratio (sama seperti training)
    # Resize OpenCV menggunakan format (width, height)
    resized = cv2.resize(image, input_size, interpolation=cv2.INTER_LINEAR)
    
    # Return gambar resized raw (0-255)
    # Feature extractor akan menerapkan normalisasi ImageNet
    return resized


def crop_image(
    image: np.ndarray,
    bbox: Tuple[int, int, int, int],
    padding: int = 10
) -> np.ndarray:
    """
    Crop gambar menggunakan bounding box dengan padding opsional
    
    Args:
        image: Gambar input sebagai numpy array
        bbox: Bounding box sebagai (x, y, width, height)
        padding: Pixel padding di sekitar bbox
        
    Returns:
        Gambar yang di-crop
    """
    height, width = image.shape[:2]
    x, y, w, h = bbox
    
    # Tambahkan padding
    x1 = max(0, x - padding)
    y1 = max(0, y - padding)
    x2 = min(width, x + w + padding)
    y2 = min(height, y + h + padding)
    
    # Crop
    cropped = image[y1:y2, x1:x2]
    
    return cropped


def validate_image(image: np.ndarray, min_size: Tuple[int, int] = (224, 224)) -> bool:
    """
    Validasi gambar memenuhi persyaratan minimum
    
    Args:
        image: Gambar input sebagai numpy array
        min_size: Ukuran minimum (width, height) yang diperlukan
        
    Returns:
        True jika valid, False jika tidak
    """
    if image is None or len(image.shape) < 2:
        return False
    
    height, width = image.shape[:2]
    min_width, min_height = min_size
    
    if width < min_width or height < min_height:
        return False
    
    return True
