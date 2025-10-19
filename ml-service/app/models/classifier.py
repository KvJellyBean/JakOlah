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
        """Load pickled SVM model with multiple fallback methods"""
        try:
            logger.info(f"Loading classification model from {self.model_path}")
            
            # Try Method 1: Standard pickle
            try:
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                logger.info("✓ Loaded with pickle")
            except Exception as e1:
                logger.warning(f"pickle failed: {e1}")
                
                # Try Method 2: joblib
                try:
                    import joblib
                    model_data = joblib.load(self.model_path)
                    logger.info("✓ Loaded with joblib")
                except Exception as e2:
                    logger.warning(f"joblib failed: {e2}")
                    
                    # Try Method 3: pickle with different protocol
                    try:
                        import pickle5 as pickle_fallback
                        with open(self.model_path, 'rb') as f:
                            model_data = pickle_fallback.load(f)
                        logger.info("✓ Loaded with pickle5")
                    except:
                        # Final fallback: Try reading as binary and unpickling
                        logger.error("All loading methods failed!")
                        raise Exception(f"Cannot load model file. Tried pickle, joblib, pickle5. Original errors: pickle={e1}, joblib={e2}")
            
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
                # Use CALIBRATED conversion for better confidence estimates
                probabilities = self._calibrate_scores(decision_scores)
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
            
            return category_name, confidence, all_confidences
            
        except Exception as e:
            logger.error(f"Classification failed: {e}")
            # Return default
            return "Lainnya", 0.0, {cat: 0.0 for cat in self.CATEGORIES.values()}
    
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
    
    def _calibrate_scores(self, scores: np.ndarray) -> np.ndarray:
        """
        Apply temperature scaling to decision scores for better calibration
        Uses temperature T=2.0 to reduce overconfidence
        
        Args:
            scores: Raw decision function scores
            
        Returns:
            Calibrated probabilities
        """
        temperature = 2.0  # Higher = more uncertain, lower = more confident
        scaled_scores = scores / temperature
        return self._softmax(scaled_scores)
