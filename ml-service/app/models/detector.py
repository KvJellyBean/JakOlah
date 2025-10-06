"""
Object Detector
TensorFlow Lite model wrapper for waste object detection
"""
import numpy as np
import tensorflow as tf
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class WasteDetector:
    """
    Wrapper for TensorFlow Lite object detection model
    Detects waste objects in images
    """
    
    def __init__(self, model_path: str, confidence_threshold: float = 0.3):
        """
        Initialize detector with TFLite model
        
        Args:
            model_path: Path to .tflite model file
            confidence_threshold: Minimum confidence for valid detections
        """
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.interpreter = None
        self.input_details = None
        self.output_details = None
        self.input_shape = None
        
        self._load_model()
    
    def _load_model(self):
        """Load TFLite model and get input/output details"""
        try:
            logger.info(f"Loading detection model from {self.model_path}")
            
            # Load TFLite model
            self.interpreter = tf.lite.Interpreter(model_path=self.model_path)
            self.interpreter.allocate_tensors()
            
            # Get input and output tensors
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
            
            # Get input shape
            self.input_shape = self.input_details[0]['shape']
            
            logger.info(f"Model loaded successfully. Input shape: {self.input_shape}")
            logger.info(f"Number of outputs: {len(self.output_details)}")
            
        except Exception as e:
            logger.error(f"Failed to load detection model: {e}")
            raise
    
    def detect(self, image: np.ndarray) -> List[dict]:
        """
        Detect waste objects in image
        
        Args:
            image: Preprocessed image (already resized and normalized)
            
        Returns:
            List of detection dictionaries with boxes, scores, classes
        """
        try:
            # Ensure image has correct shape and type
            if len(image.shape) == 3:
                image = np.expand_dims(image, axis=0)
            
            image = image.astype(np.float32)
            
            # Set input tensor
            self.interpreter.set_tensor(self.input_details[0]['index'], image)
            
            # Run inference
            self.interpreter.invoke()
            
            # Get output tensors
            # Common TFLite detection model outputs:
            # 0: detection_boxes
            # 1: detection_classes
            # 2: detection_scores
            # 3: num_detections
            
            if len(self.output_details) >= 4:
                boxes = self.interpreter.get_tensor(self.output_details[0]['index'])[0]
                classes = self.interpreter.get_tensor(self.output_details[1]['index'])[0]
                scores = self.interpreter.get_tensor(self.output_details[2]['index'])[0]
                num_detections = int(self.interpreter.get_tensor(self.output_details[3]['index'])[0])
            else:
                # Alternative output format
                boxes = self.interpreter.get_tensor(self.output_details[0]['index'])[0]
                scores = self.interpreter.get_tensor(self.output_details[1]['index'])[0]
                classes = self.interpreter.get_tensor(self.output_details[2]['index'])[0]
                num_detections = len(scores)
            
            # Filter by confidence threshold
            detections = []
            for i in range(num_detections):
                score = float(scores[i])
                if score >= self.confidence_threshold:
                    detection = {
                        'box': boxes[i].tolist(),  # [ymin, xmin, ymax, xmax] normalized
                        'score': score,
                        'class': int(classes[i])
                    }
                    detections.append(detection)
            
            logger.info(f"Detected {len(detections)} objects above threshold {self.confidence_threshold}")
            return detections
            
        except Exception as e:
            logger.error(f"Detection failed: {e}")
            return []
    
    def convert_to_pixel_coords(
        self,
        boxes: List[List[float]],
        image_width: int,
        image_height: int
    ) -> List[Tuple[int, int, int, int]]:
        """
        Convert normalized box coordinates to pixel coordinates
        
        Args:
            boxes: List of normalized boxes [ymin, xmin, ymax, xmax]
            image_width: Original image width
            image_height: Original image height
            
        Returns:
            List of boxes as (x, y, width, height) in pixels
        """
        pixel_boxes = []
        for box in boxes:
            ymin, xmin, ymax, xmax = box
            
            x = int(xmin * image_width)
            y = int(ymin * image_height)
            width = int((xmax - xmin) * image_width)
            height = int((ymax - ymin) * image_height)
            
            pixel_boxes.append((x, y, width, height))
        
        return pixel_boxes
    
    def get_input_size(self) -> Tuple[int, int]:
        """
        Get required input size for model
        
        Returns:
            (width, height) tuple
        """
        if self.input_shape is None:
            return (320, 320)  # Default size
        
        # Input shape is typically [batch, height, width, channels]
        height = self.input_shape[1]
        width = self.input_shape[2]
        
        return (width, height)
