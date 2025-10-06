"""
Waste Classifier
Loads MobileNetV3 + SVM model for waste category classification
"""
import numpy as np
import pickle
from typing import Dict, Tuple
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class WasteClassifier:
    """
    Wrapper for MobileNetV3 + SVM classifier
    Classifies waste objects into categories
    """
    
    # Category mapping
    CATEGORIES = {
        0: "Organik",
        1: "Anorganik", 
        2: "Lainnya"
    }
    
    def __init__(self, model_path: str):
        """
        Initialize classifier with trained SVM model
        
        Args:
            model_path: Path to .pkl model file (MobileNetV3_poly_model.pkl)
        """
        self.model_path = model_path
        self.model = None
        self.feature_extractor = None
        
        self._load_model()
    
    def _load_model(self):
        """Load pickled SVM model"""
        try:
            logger.info(f"Loading classification model from {self.model_path}")
            
            with open(self.model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            # Check if model is dict with separate components or just SVM
            if isinstance(model_data, dict):
                self.model = model_data.get('svm', model_data.get('model'))
                self.feature_extractor = model_data.get('feature_extractor')
                logger.info("Loaded model with feature extractor")
            else:
                self.model = model_data
                logger.info("Loaded SVM model only")
            
            logger.info(f"Classifier loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load classification model: {e}")
            raise
    
    def classify(self, features: np.ndarray) -> Tuple[str, float, Dict[str, float]]:
        """
        Classify waste object from features
        
        Args:
            features: Extracted features (already normalized)
            
        Returns:
            (category_name, confidence, all_confidences)
        """
        try:
            # Ensure features are 2D array
            if len(features.shape) == 1:
                features = features.reshape(1, -1)
            
            # Get prediction and probabilities
            prediction = self.model.predict(features)[0]
            
            # Get confidence scores
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(features)[0]
            elif hasattr(self.model, 'decision_function'):
                # For SVM without probability=True, use decision function
                decision_scores = self.model.decision_function(features)[0]
                # Convert to pseudo-probabilities using softmax
                probabilities = self._softmax(decision_scores)
            else:
                # Fallback: assign 1.0 to predicted class, 0.0 to others
                probabilities = np.zeros(len(self.CATEGORIES))
                probabilities[prediction] = 1.0
            
            # Map to category names
            category_name = self.CATEGORIES.get(int(prediction), "Lainnya")
            confidence = float(probabilities[prediction])
            
            # All confidences
            all_confidences = {
                self.CATEGORIES[i]: float(probabilities[i])
                for i in range(len(self.CATEGORIES))
            }
            
            logger.info(f"Classified as {category_name} with confidence {confidence:.2f}")
            return category_name, confidence, all_confidences
            
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            # Return default
            return "Lainnya", 0.0, {cat: 0.0 for cat in self.CATEGORIES.values()}
    
    def classify_batch(self, features_list: list) -> list:
        """
        Classify multiple waste objects
        
        Args:
            features_list: List of feature arrays
            
        Returns:
            List of (category, confidence, all_confidences) tuples
        """
        results = []
        for features in features_list:
            result = self.classify(features)
            results.append(result)
        return results
    
    def _softmax(self, x: np.ndarray) -> np.ndarray:
        """
        Compute softmax values for array
        
        Args:
            x: Input array
            
        Returns:
            Softmax probabilities
        """
        if len(x.shape) == 1:
            # Handle 1D array
            exp_x = np.exp(x - np.max(x))
            return exp_x / exp_x.sum()
        else:
            # Handle 2D array
            exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
            return exp_x / exp_x.sum(axis=1, keepdims=True)
    
    @staticmethod
    def get_category_color(category: str) -> str:
        """
        Get display color for category
        
        Args:
            category: Category name
            
        Returns:
            Color string (for frontend)
        """
        colors = {
            "Organik": "#22c55e",      # green-500
            "Anorganik": "#3b82f6",    # blue-500
            "Lainnya": "#eab308"       # yellow-500
        }
        return colors.get(category, "#6b7280")  # gray-500 default
