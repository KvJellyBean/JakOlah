"""
Classification API Endpoint for Jakarta Waste Classification ML Service
FastAPI endpoint integrating complete inference pipeline: preprocess → extract → classify
"""

from fastapi import APIRouter, File, UploadFile, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
import time
from typing import Optional, Dict, Any
import traceback

# Import our ML pipeline components
from ..models.preprocessor import get_preprocessor, validate_image_bytes
from ..models.feature_extractor import get_feature_extractor
from ..models.classifier import get_classifier
from ..utils.logger import get_logger, create_request_id, log_classification, LoggedOperation

# Create API router
router = APIRouter(prefix="/api", tags=["classification"])

# Initialize logger
logger = get_logger()

@router.post("/classify")
async def classify_image(
    request: Request,
    file: UploadFile = File(...),
    model_name: Optional[str] = None,
    use_ensemble: bool = False
):
    """
    Classify waste image using trained ML models.
    
    Complete inference pipeline: preprocess → extract → classify
    
    Args:
        file: Image file (JPEG/PNG)
        model_name: Specific SVM model to use (optional)
                   Options: mobilenetv3_poly, mobilenetv3_rbf, resnet50_poly, resnet50_rbf
        use_ensemble: Whether to use ensemble prediction (default: False)
    
    Returns:
        JSON response with classification results:
        {
            "success": true,
            "request_id": "uuid",
            "prediction": "Organik|Anorganik|Lainnya",
            "confidence": 0.95,
            "probabilities": {
                "Organik": 0.95,
                "Anorganik": 0.03,
                "Lainnya": 0.02
            },
            "model_info": {
                "model_used": "resnet50_rbf",
                "cnn_backbone": "resnet50",
                "svm_kernel": "rbf"
            },
            "processing_time": {
                "total": 1.234,
                "preprocessing": 0.123,
                "feature_extraction": 0.891,
                "classification": 0.020,
                "validation": 0.200
            },
            "image_metadata": {
                "format": "JPEG",
                "size": [1024, 768],
                "file_size": 102400
            }
        }
    """
    request_id = create_request_id()
    processing_times = {}
    image_metadata = {}
    
    # Log API request
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    logger.log_api_request(
        method="POST",
        endpoint="/api/classify",
        request_id=request_id,
        client_ip=client_ip,
        user_agent=user_agent
    )
    
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file uploaded")
        
        # Check file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png']
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file type. Allowed: {allowed_types}"
            )
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Get file size for metadata
        file_size = len(image_bytes)
        
        # Step 1: Image validation and preprocessing
        with LoggedOperation("image_validation", {"request_id": request_id}) as op:
            preprocessor = get_preprocessor()
            
            # Validate image
            validation_result = validate_image_bytes(image_bytes)
            if not validation_result['is_valid']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid image: {validation_result['error']}"
                )
            
            # Store image metadata
            image_metadata = {
                'format': validation_result['format'],
                'size': [validation_result['width'], validation_result['height']],
                'mode': validation_result['mode'],
                'file_size': file_size,
                'filename': file.filename
            }
        
        processing_times['validation'] = op.start_time and time.time() - op.start_time or 0
        
        with LoggedOperation("image_preprocessing", {"request_id": request_id}) as op:
            # Preprocess image
            preprocessed_image = preprocessor.preprocess_image(image_bytes)
        
        processing_times['preprocessing'] = time.time() - op.start_time
        
        # Step 2: Feature extraction
        with LoggedOperation("feature_extraction", {"request_id": request_id}) as op:
            feature_extractor = get_feature_extractor()
            
            # Determine which features to extract based on model_name
            if model_name:
                # Extract features only for the specific model's backbone
                classifier = get_classifier()
                if model_name not in classifier.get_available_models():
                    available_models = classifier.get_available_models()
                    raise HTTPException(
                        status_code=400,
                        detail=f"Model '{model_name}' not available. Available models: {available_models}"
                    )
                
                model_info = classifier.get_model_info(model_name)
                cnn_backbone = model_info['cnn_backbone']
                features = feature_extractor.extract_features(preprocessed_image, cnn_backbone)
            else:
                # Extract features from both backbones for best model selection
                features = feature_extractor.extract_features(preprocessed_image, 'both')
        
        processing_times['feature_extraction'] = time.time() - op.start_time
        
        # Step 3: SVM classification
        with LoggedOperation("svm_classification", {"request_id": request_id}) as op:
            classifier = get_classifier()
            classification_result = classifier.predict(
                features=features,
                model_name=model_name,
                use_ensemble=use_ensemble
            )
        
        processing_times['classification'] = time.time() - op.start_time
        
        # Calculate total processing time
        total_time = sum(processing_times.values())
        processing_times['total'] = total_time
        
        # Prepare response
        response_data = {
            "success": True,
            "request_id": request_id,
            "prediction": classification_result['prediction'],
            "confidence": classification_result['confidence'],
            "probabilities": classification_result['probabilities'],
            "model_info": classification_result['model_info'],
            "processing_time": processing_times,
            "image_metadata": image_metadata
        }
        
        # Include individual results if ensemble was used
        if 'individual_results' in classification_result:
            response_data['ensemble_details'] = {
                'individual_results': classification_result['individual_results'],
                'num_models': len(classification_result['individual_results'])
            }
        
        # Log successful classification
        log_classification(
            request_id=request_id,
            image_metadata=image_metadata,
            processing_times=processing_times,
            classification_result=classification_result,
            success=True
        )
        
        # Check performance target (<3 seconds)
        if total_time > 3.0:
            logger.main_logger.warning(f"Classification time exceeded target: {total_time:.3f}s > 3.0s")
        
        return JSONResponse(content=response_data)
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
        
    except Exception as e:
        # Log error
        error_context = {
            'request_id': request_id,
            'filename': file.filename if file else None,
            'content_type': file.content_type if file else None,
            'traceback': traceback.format_exc()
        }
        
        logger.log_error("classification_pipeline", e, error_context, request_id)
        
        # Log failed classification attempt
        log_classification(
            request_id=request_id,
            image_metadata=image_metadata,
            processing_times=processing_times,
            classification_result={},
            success=False,
            error_message=str(e)
        )
        
        # Return error response
        raise HTTPException(
            status_code=500,
            detail=f"Classification failed: {str(e)}"
        )

@router.get("/models")
async def get_available_models():
    """
    Get information about available models.
    
    Returns:
        JSON response with available models and their information
    """
    try:
        classifier = get_classifier()
        feature_extractor = get_feature_extractor()
        
        response_data = {
            "success": True,
            "svm_models": classifier.get_available_models(),
            "cnn_models": feature_extractor.get_available_models(),
            "model_details": classifier.get_model_info(),
            "categories": classifier.CATEGORIES,
            "feature_sizes": {
                model: feature_extractor.get_feature_size(model) 
                for model in feature_extractor.get_available_models()
            }
        }
        
        return JSONResponse(content=response_data)
        
    except Exception as e:
        logger.log_error("get_models", e)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get model information: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify service status.
    
    Returns:
        JSON response with service health information
    """
    try:
        # Check if models are loaded
        classifier = get_classifier()
        feature_extractor = get_feature_extractor()
        
        health_info = {
            "status": "healthy",
            "service": "jakarta-waste-ml",
            "timestamp": time.time(),
            "models_loaded": {
                "svm_models": len(classifier.get_available_models()),
                "cnn_models": len(feature_extractor.get_available_models())
            }
        }
        
        return JSONResponse(content=health_info)
        
    except Exception as e:
        logger.log_error("health_check", e)
        health_info = {
            "status": "unhealthy",
            "service": "jakarta-waste-ml",
            "timestamp": time.time(),
            "error": str(e)
        }
        
        return JSONResponse(content=health_info, status_code=503)

@router.post("/benchmark")
async def benchmark_models(file: UploadFile = File(...), runs: int = 5):
    """
    Benchmark classification performance across all models.
    
    Args:
        file: Test image file
        runs: Number of benchmark runs (default: 5)
    
    Returns:
        JSON response with benchmark results
    """
    if runs > 20:  # Limit to prevent abuse
        raise HTTPException(status_code=400, detail="Maximum 20 benchmark runs allowed")
    
    request_id = create_request_id()
    
    try:
        # Read and preprocess image
        image_bytes = await file.read()
        preprocessor = get_preprocessor()
        
        # Validate image
        validation_result = validate_image_bytes(image_bytes)
        if not validation_result['is_valid']:
            raise HTTPException(status_code=400, detail=f"Invalid image: {validation_result['error']}")
        
        preprocessed_image = preprocessor.preprocess_image(image_bytes)
        
        # Extract features
        feature_extractor = get_feature_extractor()
        features = feature_extractor.extract_features(preprocessed_image, 'both')
        
        # Benchmark classification
        classifier = get_classifier()
        benchmark_results = classifier.benchmark_prediction(features, runs)
        
        # Benchmark feature extraction
        feature_benchmark = feature_extractor.benchmark_extraction(preprocessed_image, runs)
        
        response_data = {
            "success": True,
            "request_id": request_id,
            "benchmark_runs": runs,
            "results": {
                "feature_extraction": feature_benchmark,
                "classification": benchmark_results
            },
            "image_metadata": {
                "format": validation_result['format'],
                "size": [validation_result['width'], validation_result['height']]
            }
        }
        
        return JSONResponse(content=response_data)
        
    except Exception as e:
        logger.log_error("benchmark", e, {"request_id": request_id})
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")

# Export router for main application
__all__ = ["router"]