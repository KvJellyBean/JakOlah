from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
import logging

# Import our API router and logging
from src.api.classification import router as classification_router
from src.utils.logger import get_logger

# Load environment variables
load_dotenv()

# Initialize ML service logger
ml_logger = get_logger()

app = FastAPI(
    title="JakOlah ML Service",
    description="Jakarta Waste Classification Machine Learning API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development
        "http://127.0.0.1:3000",
        # Add production URLs when deployed
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(classification_router)

@app.on_event("startup")
async def startup_event():
    """Initialize ML models and log startup information"""
    try:
        # Log startup
        config = {
            "service": "JakOlah ML Service",
            "version": "1.0.0",
            "port": int(os.getenv("PORT", 8000)),
            "environment": os.getenv("ENVIRONMENT", "development")
        }
        ml_logger.log_startup_info(config)
        
        # Initialize models (this will load them into memory)
        from src.models.classifier import get_classifier
        from src.models.feature_extractor import get_feature_extractor
        from src.models.preprocessor import get_preprocessor
        
        # Load models
        classifier = get_classifier()
        feature_extractor = get_feature_extractor()
        preprocessor = get_preprocessor()
        
        # Log model information
        model_info = {
            "svm_models": classifier.get_available_models(),
            "cnn_models": feature_extractor.get_available_models(),
            "categories": classifier.CATEGORIES
        }
        ml_logger.log_model_info(model_info)
        
        ml_logger.main_logger.info("ML Service startup completed successfully")
        
    except Exception as e:
        ml_logger.log_error("startup", e)
        raise

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "message": "JakOlah ML Service is running",
        "service": "Jakarta Waste Classification ML API",
        "version": "1.0.0",
        "status": "healthy",
        "endpoints": {
            "classify": "/api/classify",
            "models": "/api/models", 
            "health": "/api/health",
            "benchmark": "/api/benchmark",
            "docs": "/docs"
        }
    }

@app.get("/ping")
async def health_check():
    """Simple health check for monitoring"""
    try:
        from src.models.classifier import get_classifier
        from src.models.feature_extractor import get_feature_extractor
        
        classifier = get_classifier()
        feature_extractor = get_feature_extractor()
        
        return {
            "status": "healthy",
            "service": "JakOlah ML Service", 
            "version": "1.0.0",
            "models_loaded": {
                "svm_models": len(classifier.get_available_models()),
                "cnn_models": len(feature_extractor.get_available_models())
            }
        }
    except Exception as e:
        ml_logger.log_error("health_check", e)
        return JSONResponse(
            content={
                "status": "unhealthy",
                "service": "JakOlah ML Service",
                "version": "1.0.0",
                "error": str(e)
            },
            status_code=503
        )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
    # Configure logging level
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # Remove in production
        log_level=log_level,
        access_log=True
    )