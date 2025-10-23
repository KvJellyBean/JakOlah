"""
Waste Classifier
SVM classifier (MobileNetV3_poly_model.pkl) untuk klasifikasi kategori sampah
Input: Fitur 960-dimensi dari MobileNetV3 feature extractor
Output: Kategori sampah (Organik/Anorganik/Lainnya) dengan confidence score
"""
import numpy as np
import pickle
from typing import Dict, Tuple
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class WasteClassifier:
    """
    SVM classifier untuk kategori sampah
    Menerima fitur 960-dimensi dari MobileNetV3 feature extractor
    Mengeluarkan prediksi kategori: Organik, Anorganik, atau Lainnya
    """
    
    # Mapping kategori
    CATEGORIES = {
        0: "Organik",
        1: "Anorganik", 
        2: "Lainnya"
    }
    
    def __init__(self, model_path: str):
        """
        Inisialisasi classifier dengan model SVM terlatih
        
        Args:
            model_path: Path ke file model .pkl (MobileNetV3_poly_model.pkl)
        """
        self.model_path = model_path
        self.model = None
        self.feature_extractor = None
        
        self._load_model()
    
    def _load_model(self):
        """Muat model SVM pickle dengan beberapa metode fallback"""
        try:
            logger.info(f"Loading classification model from {self.model_path}")
            
            # Coba Metode 1: Pickle standar
            try:
                with open(self.model_path, 'rb') as f:
                    model_data = pickle.load(f)
                logger.info("✓ Loaded with pickle")
            except Exception as e1:
                logger.warning(f"pickle failed: {e1}")
                
                # Coba Metode 2: joblib
                try:
                    import joblib
                    model_data = joblib.load(self.model_path)
                    logger.info("✓ Loaded with joblib")
                except Exception as e2:
                    logger.warning(f"joblib failed: {e2}")
                    
                    # Coba Metode 3: pickle dengan protokol berbeda
                    try:
                        import pickle5 as pickle_fallback
                        with open(self.model_path, 'rb') as f:
                            model_data = pickle_fallback.load(f)
                        logger.info("✓ Loaded with pickle5")
                    except:
                        # Fallback terakhir: Coba baca sebagai binary dan unpickle
                        logger.error("All loading methods failed!")
                        raise Exception(f"Cannot load model file. Tried pickle, joblib, pickle5. Original errors: pickle={e1}, joblib={e2}")
            
            # Cek apakah model adalah dict dengan komponen terpisah atau hanya SVM
            if isinstance(model_data, dict):
                self.model = model_data.get('svm', model_data.get('model'))
                self.feature_extractor = model_data.get('feature_extractor')
                logger.info("Loaded model with feature extractor")
            else:
                self.model = model_data
                logger.info("Loaded SVM model")
            
            # DEBUG: Log model info
            logger.info(f"Model type: {type(self.model)}")
            logger.info(f"Model has predict_proba: {hasattr(self.model, 'predict_proba')}")
            logger.info(f"Model has decision_function: {hasattr(self.model, 'decision_function')}")
            if hasattr(self.model, 'classes_'):
                logger.info(f"Model classes: {self.model.classes_}")
            if hasattr(self.model, 'kernel'):
                logger.info(f"Model kernel: {self.model.kernel}")
            
            logger.info(f"✓ Classifier loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load classification model: {e}")
            raise
    
    def classify(self, features: np.ndarray) -> Tuple[str, float, Dict[str, float]]:
        """
        Klasifikasi objek sampah dari fitur
        
        Args:
            features: Fitur yang diekstrak (sudah dinormalisasi)
            
        Returns:
            (nama_kategori, confidence, semua_confidence)
        """
        try:
            # Pastikan fitur adalah array 2D
            if len(features.shape) == 1:
                features = features.reshape(1, -1)
            
            # Dapatkan prediksi dan probabilitas
            prediction = self.model.predict(features)[0]
            logger.info(f"SVM prediction: class={prediction}")
            
            # Dapatkan skor confidence
            if hasattr(self.model, 'predict_proba'):
                probabilities = self.model.predict_proba(features)[0]
            elif hasattr(self.model, 'decision_function'):
                # Untuk SVM tanpa probability=True, gunakan decision function
                decision_scores = self.model.decision_function(features)[0]
                # Gunakan konversi TERKALIBRASI untuk estimasi confidence yang lebih baik
                probabilities = self._calibrate_scores(decision_scores)
            else:
                # Fallback: berikan 1.0 ke kelas yang diprediksi, 0.0 ke lainnya
                probabilities = np.zeros(len(self.CATEGORIES))
                probabilities[prediction] = 1.0
            
            # Map ke nama kategori
            category_name = self.CATEGORIES.get(int(prediction), "Lainnya")
            confidence = float(probabilities[prediction])
            
            # Semua confidence
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
        Hitung nilai softmax untuk array
        
        Args:
            x: Array input
            
        Returns:
            Probabilitas softmax
        """
        if len(x.shape) == 1:
            # Handle array 1D
            exp_x = np.exp(x - np.max(x))
            return exp_x / exp_x.sum()
        else:
            # Handle array 2D
            exp_x = np.exp(x - np.max(x, axis=1, keepdims=True))
            return exp_x / exp_x.sum(axis=1, keepdims=True)
    
    def _calibrate_scores(self, scores: np.ndarray) -> np.ndarray:
        """
        Terapkan temperature scaling ke skor decision untuk kalibrasi yang lebih baik
        Menggunakan temperature T=2.0 untuk mengurangi overconfidence
        
        Args:
            scores: Skor raw decision function
            
        Returns:
            Probabilitas terkalibrasi
        """
        temperature = 2.0  # Lebih tinggi = lebih uncertain, lebih rendah = lebih confident
        scaled_scores = scores / temperature
        return self._softmax(scaled_scores)
