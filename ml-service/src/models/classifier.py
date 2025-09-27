"""
SVM Inference for Jakarta Waste Classification
Loads trained SVM models and performs classification with confidence scores.
"""

import numpy as np
import joblib
import os
from typing import Dict, Tuple, Optional, List
import logging
from pathlib import Path
import time

logger = logging.getLogger(__name__)

class SVMClassifier:
    """
    SVM classifier using trained models for waste classification.
    Supports multiple CNN-SVM model combinations with ensemble capabilities.
    """
    
    # Waste categories (matching training data)
    CATEGORIES = ['Organik', 'Anorganik', 'Lainnya']
    
    def __init__(self, model_dir: str = None):
        """
        Initialize SVM classifier with trained models.
        
        Args:
            model_dir: Directory containing trained .pkl model files
        """
        self.model_dir = model_dir or self._get_default_model_dir()
        self.models = {}
        self.model_info = {}
        self._load_models()
        
    def _get_default_model_dir(self) -> str:
        """Get default model directory path."""
        # Get path to model-result directory relative to ml-service
        current_dir = Path(__file__).parent.parent.parent.parent  # ml-service/src/models -> project root
        model_dir = current_dir / "model-result"
        return str(model_dir)
    
    def _load_models(self):
        """Load all available trained SVM models."""
        model_files = {
            'mobilenetv3_poly': 'MobileNetV3_poly_model.pkl',
            'mobilenetv3_rbf': 'MobileNetV3_rbf_model.pkl',
            'resnet50_poly': 'ResNet50_poly_model.pkl',
            'resnet50_rbf': 'ResNet50_rbf_model.pkl'
        }
        
        for model_name, filename in model_files.items():
            try:
                model_path = os.path.join(self.model_dir, filename)
                
                if os.path.exists(model_path):
                    model = joblib.load(model_path)
                    self.models[model_name] = model
                    
                    # Extract model info
                    cnn_type = model_name.split('_')[0]  # mobilenetv3 or resnet50
                    kernel_type = model_name.split('_')[1]  # poly or rbf
                    
                    self.model_info[model_name] = {
                        'cnn_backbone': cnn_type,
                        'svm_kernel': kernel_type,
                        'filename': filename,
                        'classes': self.CATEGORIES
                    }
                    
                    logger.info(f"Loaded model: {model_name} from {filename}")
                else:
                    logger.warning(f"Model file not found: {model_path}")
                    
            except Exception as e:
                logger.error(f"Failed to load model {model_name}: {str(e)}")
        
        if not self.models:
            raise RuntimeError(f"No SVM models loaded from {self.model_dir}")
        
        logger.info(f"Successfully loaded {len(self.models)} SVM models")
    
    def predict(self, 
                features: Dict[str, np.ndarray], 
                model_name: Optional[str] = None,
                use_ensemble: bool = False) -> Dict:
        """
        Perform classification using SVM models.
        
        Args:
            features: Dictionary with CNN feature vectors
                     Keys: 'resnet50', 'mobilenetv3'
                     Values: Feature vectors as numpy arrays
            model_name: Specific model to use (optional)
            use_ensemble: Whether to use ensemble prediction
            
        Returns:
            Dictionary with prediction results including:
            - prediction: Predicted category
            - confidence: Confidence score (0-1)
            - probabilities: Class probabilities
            - model_used: Model(s) used for prediction
            - individual_results: Results from each model (if ensemble)
        """
        start_time = time.time()
        
        try:
            if use_ensemble:
                result = self._predict_ensemble(features)
            else:
                if model_name:
                    result = self._predict_single_model(features, model_name)
                else:
                    # Use best available model based on features
                    result = self._predict_best_model(features)
            
            prediction_time = time.time() - start_time
            result['prediction_time'] = prediction_time
            
            logger.info(f"Prediction completed in {prediction_time:.3f}s. Result: {result['prediction']} (confidence: {result['confidence']:.3f})")
            
            return result
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise ValueError(f"SVM prediction failed: {str(e)}")
    
    def _predict_single_model(self, features: Dict[str, np.ndarray], model_name: str) -> Dict:
        """
        Predict using a single specified model.
        
        Args:
            features: CNN feature vectors
            model_name: Name of the model to use
            
        Returns:
            Prediction results dictionary
        """
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not available. Available models: {list(self.models.keys())}")
        
        # Get required CNN features for this model
        cnn_type = self.model_info[model_name]['cnn_backbone']
        
        if cnn_type not in features:
            raise ValueError(f"Required features '{cnn_type}' not available in input")
        
        feature_vector = features[cnn_type]
        model = self.models[model_name]
        
        # Make prediction
        prediction = model.predict([feature_vector])[0]
        
        # Get class probabilities if available
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba([feature_vector])[0]
            confidence = np.max(probabilities)
            
            # Create probability dictionary
            prob_dict = {category: prob for category, prob in zip(self.CATEGORIES, probabilities)}
        else:
            # Fallback: use decision function if available
            if hasattr(model, 'decision_function'):
                decision_scores = model.decision_function([feature_vector])[0]
                # Convert decision scores to pseudo-probabilities using softmax
                exp_scores = np.exp(decision_scores - np.max(decision_scores))
                probabilities = exp_scores / np.sum(exp_scores)
                confidence = np.max(probabilities)
                prob_dict = {category: prob for category, prob in zip(self.CATEGORIES, probabilities)}
            else:
                # No probability information available
                confidence = 0.5  # Default confidence
                prob_dict = {category: 1.0/len(self.CATEGORIES) for category in self.CATEGORIES}
                prob_dict[prediction] = 1.0  # Assign full confidence to prediction
        
        return {
            'prediction': prediction,
            'confidence': float(confidence),
            'probabilities': {k: float(v) for k, v in prob_dict.items()},
            'model_used': model_name,
            'model_info': self.model_info[model_name]
        }
    
    def _predict_best_model(self, features: Dict[str, np.ndarray]) -> Dict:
        """
        Predict using the best available model based on available features.
        
        Args:
            features: CNN feature vectors
            
        Returns:
            Prediction results dictionary
        """
        # Priority order: prefer newer/better models
        model_priority = [
            'resnet50_rbf',      # ResNet50 + RBF kernel (often best performance)
            'resnet50_poly',     # ResNet50 + Polynomial kernel
            'mobilenetv3_rbf',   # MobileNetV3 + RBF kernel (good mobile performance)
            'mobilenetv3_poly'   # MobileNetV3 + Polynomial kernel
        ]
        
        for model_name in model_priority:
            if model_name not in self.models:
                continue
            
            cnn_type = self.model_info[model_name]['cnn_backbone']
            if cnn_type in features:
                logger.info(f"Using best available model: {model_name}")
                return self._predict_single_model(features, model_name)
        
        raise ValueError("No compatible models available for the provided features")
    
    def _predict_ensemble(self, features: Dict[str, np.ndarray]) -> Dict:
        """
        Predict using ensemble of all available models.
        
        Args:
            features: CNN feature vectors
            
        Returns:
            Ensemble prediction results dictionary
        """
        individual_results = []
        all_probabilities = []
        
        # Get predictions from all available models
        for model_name in self.models.keys():
            try:
                cnn_type = self.model_info[model_name]['cnn_backbone']
                if cnn_type in features:
                    result = self._predict_single_model(features, model_name)
                    individual_results.append(result)
                    all_probabilities.append(list(result['probabilities'].values()))
            except Exception as e:
                logger.warning(f"Model {model_name} failed in ensemble: {str(e)}")
                continue
        
        if not individual_results:
            raise ValueError("No models available for ensemble prediction")
        
        # Average probabilities across all models
        avg_probabilities = np.mean(all_probabilities, axis=0)
        
        # Get ensemble prediction and confidence
        predicted_idx = np.argmax(avg_probabilities)
        prediction = self.CATEGORIES[predicted_idx]
        confidence = avg_probabilities[predicted_idx]
        
        prob_dict = {category: prob for category, prob in zip(self.CATEGORIES, avg_probabilities)}
        
        return {
            'prediction': prediction,
            'confidence': float(confidence),
            'probabilities': {k: float(v) for k, v in prob_dict.items()},
            'model_used': 'ensemble',
            'model_info': {
                'type': 'ensemble',
                'models_used': [r['model_used'] for r in individual_results],
                'num_models': len(individual_results)
            },
            'individual_results': individual_results
        }
    
    def get_available_models(self) -> List[str]:
        """
        Get list of available SVM models.
        
        Returns:
            List of available model names
        """
        return list(self.models.keys())
    
    def get_model_info(self, model_name: Optional[str] = None) -> Dict:
        """
        Get information about loaded models.
        
        Args:
            model_name: Specific model name (optional)
            
        Returns:
            Model information dictionary
        """
        if model_name:
            if model_name not in self.model_info:
                raise ValueError(f"Model {model_name} not available")
            return self.model_info[model_name]
        else:
            return self.model_info
    
    def benchmark_prediction(self, features: Dict[str, np.ndarray], runs: int = 10) -> Dict[str, float]:
        """
        Benchmark prediction performance across models.
        
        Args:
            features: Sample feature vectors
            runs: Number of benchmark runs
            
        Returns:
            Dictionary with average prediction times per model
        """
        results = {}
        
        for model_name in self.models.keys():
            cnn_type = self.model_info[model_name]['cnn_backbone']
            if cnn_type not in features:
                continue
            
            times = []
            for _ in range(runs):
                start_time = time.time()
                self._predict_single_model(features, model_name)
                times.append(time.time() - start_time)
            
            avg_time = sum(times) / len(times)
            results[model_name] = avg_time
        
        logger.info(f"Benchmark results (avg over {runs} runs): {results}")
        return results

# Global classifier instance for reuse
_classifier = None

def get_classifier(model_dir: Optional[str] = None) -> SVMClassifier:
    """
    Get global SVM classifier instance (singleton pattern for performance).
    
    Args:
        model_dir: Directory containing model files
        
    Returns:
        SVMClassifier instance
    """
    global _classifier
    if _classifier is None or (model_dir and _classifier.model_dir != model_dir):
        _classifier = SVMClassifier(model_dir)
    return _classifier

def classify_features(features: Dict[str, np.ndarray], 
                     model_name: Optional[str] = None,
                     use_ensemble: bool = False) -> Dict:
    """
    Convenience function for feature classification.
    
    Args:
        features: CNN feature vectors
        model_name: Specific model to use (optional)
        use_ensemble: Whether to use ensemble prediction
        
    Returns:
        Classification results dictionary
    """
    classifier = get_classifier()
    return classifier.predict(features, model_name, use_ensemble)

def get_category_names() -> List[str]:
    """
    Get list of waste categories.
    
    Returns:
        List of category names
    """
    return SVMClassifier.CATEGORIES.copy()