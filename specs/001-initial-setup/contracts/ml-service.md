# ML Inference Microservice API Contract

## POST /predict

**Purpose**: Perform waste classification using CNN+SVM pipeline

**Content-Type**: `multipart/form-data`

**Request Body**:

```python
# Multipart form data
{
    "image": File  # Binary image data (JPEG/PNG/WebP, max 10MB)
}
```

**Response 200 (Success)**:

```json
{
  "category": "Organik" | "Anorganik" | "Lainnya",
  "confidence": 85.42,
  "scores": {
    "organik": 85.42,
    "anorganik": 12.38,
    "lainnya": 2.20
  },
  "processing_time": 1247,
  "model_version": "1.0.0",
  "features_extracted": true,
  "timestamp": "2025-09-25T10:30:00Z"
}
```

**Response 400 (Invalid Input)**:

```json
{
  "error": "validation_error",
  "message": "Invalid image format or corrupted file",
  "details": {
    "supported_formats": ["JPEG", "PNG", "WebP"],
    "max_size_mb": 10,
    "received_format": "unknown",
    "file_size_mb": 0.0
  }
}
```

**Response 413 (File Too Large)**:

```json
{
  "error": "file_too_large",
  "message": "Image size exceeds maximum allowed size",
  "details": {
    "max_size_mb": 10,
    "received_size_mb": 15.2
  }
}
```

**Response 422 (Non-Waste Object)**:

```json
{
  "error": "unclassifiable",
  "message": "Image does not contain recognizable waste objects",
  "details": {
    "confidence_threshold": 0.3,
    "max_confidence": 0.15,
    "suggestion": "Please upload a clear image of waste items"
  }
}
```

**Response 429 (Rate Limited)**:

```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "details": {
    "limit": 100,
    "window": "minute",
    "retry_after": 45
  }
}
```

**Response 500 (Model Error)**:

```json
{
  "error": "model_error",
  "message": "Internal model processing error",
  "details": {
    "error_id": "uuid-error-tracking",
    "timestamp": "2025-09-25T10:30:00Z"
  }
}
```

---

## GET /health

**Purpose**: Health check for the ML microservice

**Response 200 (Healthy)**:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "1.0.0",
  "uptime_seconds": 3600,
  "memory_usage": {
    "used_mb": 512,
    "total_mb": 2048
  },
  "gpu_available": false,
  "last_prediction": "2025-09-25T10:29:45Z"
}
```

**Response 503 (Unhealthy)**:

```json
{
  "status": "unhealthy",
  "model_loaded": false,
  "errors": ["Model failed to load", "Insufficient memory"],
  "uptime_seconds": 120
}
```

---

## GET /metrics

**Purpose**: Performance metrics for monitoring

**Response 200 (Success)**:

```json
{
  "predictions_total": 15420,
  "predictions_last_hour": 234,
  "average_processing_time_ms": 1247,
  "accuracy_rate": 0.9234,
  "low_confidence_rate": 0.078,
  "error_rate": 0.012,
  "category_distribution": {
    "organik": 0.45,
    "anorganik": 0.38,
    "lainnya": 0.17
  },
  "model_performance": {
    "cnn_feature_extraction_ms": 856,
    "svm_classification_ms": 391,
    "preprocessing_ms": 145,
    "postprocessing_ms": 23
  },
  "system_metrics": {
    "cpu_usage": 0.65,
    "memory_usage": 0.25,
    "disk_usage": 0.12
  }
}
```

---

## POST /batch-predict

**Purpose**: Process multiple images in batch (for admin/testing)

**Content-Type**: `multipart/form-data`

**Request Body**:

```python
{
    "images": List[File],  # Multiple image files
    "batch_id": str       # Optional batch identifier
}
```

**Response 200 (Success)**:

```json
{
  "batch_id": "batch-uuid",
  "results": [
    {
      "filename": "image1.jpg",
      "category": "Organik",
      "confidence": 89.23,
      "scores": {
        "organik": 89.23,
        "anorganik": 8.45,
        "lainnya": 2.32
      },
      "processing_time": 1156
    },
    {
      "filename": "image2.jpg",
      "error": "unclassifiable",
      "message": "Low confidence classification"
    }
  ],
  "summary": {
    "total_images": 2,
    "successful": 1,
    "failed": 1,
    "total_processing_time": 2543,
    "average_processing_time": 1271
  },
  "timestamp": "2025-09-25T10:30:00Z"
}
```

---

## Error Response Schema

All error responses follow this consistent format:

```typescript
{
  error: string; // error code/type
  message: string; // human-readable error message
  details?: object; // additional context and debugging info
  timestamp?: string; // ISO 8601 timestamp
  request_id?: string; // for tracking/debugging
}
```

## Performance Requirements

- **Processing Time**: Must complete within 3 seconds (FR-004)
- **Concurrency**: Support multiple concurrent requests
- **Memory**: Efficient model loading and memory management
- **Accuracy**: >90% accuracy on test dataset (constitutional requirement)
- **Availability**: 99.5% uptime target
