from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from datetime import datetime
from pathlib import Path
import os

from app.services.inference import get_inference_service
from app.utils.image_processing import decode_image_bytes, validate_image

# Konfigurasi logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Buat aplikasi FastAPI
app = FastAPI(
    title="JakOlah ML Service",
    description="Real-time waste classification service for JakOlah application",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Konfigurasi CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Server dev Next.js
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Path model
BASE_DIR = Path(__file__).parent.parent  # direktori ml-service
MODELS_DIR = BASE_DIR / "models"
DETECTOR_PATH = MODELS_DIR / "best.pt"
CLASSIFIER_PATH = MODELS_DIR / "MobileNetV3_poly_model.pkl"
SCALER_PATH = MODELS_DIR / "mobilenet_scaler.pkl"

# Service inference global
inference_service = None


@app.on_event("startup")
async def startup_event():
    """Muat model ML saat startup"""
    global inference_service
    
    try:
        logger.info("Loading ML models...")
        
        # Cek file yang diperlukan
        if not CLASSIFIER_PATH.exists():
            logger.error(f"Classifier model not found: {CLASSIFIER_PATH}")
            logger.error("Please copy MobileNetV3_poly_model.pkl to ml-service/models/ folder")
            return
        
        if not SCALER_PATH.exists():
            logger.error(f"StandardScaler not found: {SCALER_PATH}")
            logger.error("Please copy mobilenet_scaler.pkl to ml-service/models/ folder")
            logger.error("WITHOUT scaler, predictions will be INCORRECT!")
            return
        
        # Inisialisasi service inference
        inference_service = get_inference_service(
            detector_path=str(DETECTOR_PATH),
            classifier_path=str(CLASSIFIER_PATH),
            scaler_path=str(SCALER_PATH),
            confidence_threshold=0.4
        )
        
        logger.info("✓ ML models loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        logger.error("Service will run but classification endpoint will fail")

@app.get("/")
async def root():
    """Endpoint health check"""
    return {
        "status": "healthy",
        "service": "JakOlah ML Service",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check detail dengan status service"""
    models_status = "loaded" if inference_service is not None else "not_loaded"
    
    return {
        "status": "healthy",
        "service": "JakOlah ML Service",
        "timestamp": datetime.now().isoformat(),
        "components": {
            "ml_models": models_status,
            "api": "healthy"
        }
    }


@app.post("/api/classify-frame")
async def classify_frame(image: UploadFile = File(...)):
    """
    Klasifikasi objek sampah pada gambar yang diupload
    
    Args:
        image: File gambar (multipart/form-data)
        
    Returns:
        JSON dengan objek terdeteksi dan klasifikasinya
    """
    try:
        # Cek apakah model sudah dimuat
        if inference_service is None:
            raise HTTPException(
                status_code=503,
                detail="ML models not loaded. Please check server logs."
            )
        
        # Validasi content type
        if not image.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {image.content_type}. Must be an image."
            )
        
        # Baca byte gambar
        image_bytes = await image.read()
        
        # Cek ukuran file (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if len(image_bytes) > max_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large: {len(image_bytes)} bytes. Maximum is {max_size} bytes (5MB)."
            )
        
        logger.info(f"Processing image: {image.filename} ({len(image_bytes)} bytes)")
        
        # Decode gambar
        try:
            decoded_image = decode_image_bytes(image_bytes)
        except Exception as e:
            logger.error(f"Failed to decode image: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to decode image: {str(e)}"
            )
        
        # Validasi dimensi gambar
        if not validate_image(decoded_image, min_size=(224, 224)):
            raise HTTPException(
                status_code=400,
                detail="Image too small. Minimum size is 224x224 pixels."
            )
        
        # Jalankan inference
        result = inference_service.process_image(decoded_image)
        
        # Cek error
        if 'error' in result:
            raise HTTPException(
                status_code=500,
                detail=result['error']
            )
        
        # Return hasil
        return {
            "success": True,
            "data": {
                "detections": result['detections'],
                "metadata": {
                    "processing_time_ms": result['processing_time_ms'],
                    "image_size": result.get('image_size', {}),
                    "num_detections": len(result['detections'])
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classification failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Classification failed: {str(e)}"
        )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler untuk response error yang lebih baik"""
    logger.error(f"Global exception handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred"
            }
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )