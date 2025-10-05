# API Contract: POST /api/classify-frame

## Endpoint

`POST /api/classify-frame`

## Purpose

Processes an image frame from the user's camera to detect and classify waste objects into three categories (Organik, Anorganik, Lainnya) with bounding boxes and confidence scores.

## Request

### Headers

- `Content-Type: multipart/form-data`
- `Accept: application/json`

### Body (FormData)

```typescript
interface ClassifyFrameRequest {
  image: File | Blob; // Image file (JPEG/PNG, max 5MB)
  sessionId: string; // Unique session identifier
  timestamp?: string; // ISO 8601 timestamp (optional)
}
```

### Example Request

```javascript
const formData = new FormData();
formData.append("image", imageBlob);
formData.append("sessionId", "session-123");
formData.append("timestamp", "2025-10-04T10:30:00Z");

fetch("/api/classify-frame", {
  method: "POST",
  body: formData,
});
```

## Response

### Success Response (200 OK)

```typescript
interface ClassifyFrameResponse {
  success: true;
  data: {
    detections: WasteDetection[];
    processingTime: number; // milliseconds
    sessionId: string;
    timestamp: string; // ISO 8601
  };
}

interface WasteDetection {
  id: string; // Unique detection ID
  category: "Organik" | "Anorganik" | "Lainnya";
  confidence: number; // 0.0 - 1.0
  boundingBox: {
    x: number; // Pixel coordinates
    y: number;
    width: number;
    height: number;
  };
  alternativeResults?: Array<{
    category: "Organik" | "Anorganik" | "Lainnya";
    confidence: number;
  }>;
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "detections": [
      {
        "id": "det-001",
        "category": "Organik",
        "confidence": 0.87,
        "boundingBox": {
          "x": 120,
          "y": 80,
          "width": 150,
          "height": 200
        },
        "alternativeResults": [
          {
            "category": "Lainnya",
            "confidence": 0.13
          }
        ]
      }
    ],
    "processingTime": 342,
    "sessionId": "session-123",
    "timestamp": "2025-10-04T10:30:01.234Z"
  }
}
```

### Error Responses

#### 400 Bad Request

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**Common Error Codes:**

- `INVALID_IMAGE`: Image format not supported or corrupted
- `IMAGE_TOO_LARGE`: Image exceeds 5MB limit
- `MISSING_SESSION_ID`: Session ID not provided
- `INVALID_SESSION_ID`: Session ID format invalid

#### 413 Payload Too Large

```json
{
  "success": false,
  "error": {
    "code": "PAYLOAD_TOO_LARGE",
    "message": "Image file exceeds maximum size of 5MB"
  }
}
```

#### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please wait before trying again.",
    "details": {
      "retryAfter": 30
    }
  }
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "CLASSIFICATION_FAILED",
    "message": "Unable to process image for classification"
  }
}
```

## Validation Rules

### Request Validation

- Image must be JPEG or PNG format
- Image size must not exceed 5MB
- Image dimensions must be at least 224x224 pixels
- Session ID must be valid UUID v4 format
- Timestamp must be valid ISO 8601 format (if provided)

### Response Validation

- All detections must have valid bounding boxes within image dimensions
- Confidence scores must be between 0.0 and 1.0
- Category must be one of: 'Organik', 'Anorganik', 'Lainnya'
- Processing time must be positive number
- Alternative results must be sorted by confidence (descending)

## Performance Requirements

- Response time should be under 500ms for typical mobile images
- Support concurrent requests from multiple users
- Graceful handling of ML service unavailability
- Automatic retry logic for transient failures

## Security Considerations

- Validate image file type and content
- Sanitize all input parameters
- Rate limiting per session ID
- No persistent storage of uploaded images
- HTTPS only for image transmission

## Business Rules

- If no waste objects detected, return empty detections array
- Minimum confidence threshold of 0.3 for valid detections
- Maximum of 10 objects detected per image
- Session timeout after 30 minutes of inactivity
- Log processing metrics for performance monitoring

## Testing Scenarios

### Happy Path

1. Upload valid JPEG image with visible waste
2. Verify detection results with correct categories
3. Confirm bounding boxes are accurate
4. Check confidence scores are reasonable

### Edge Cases

1. Upload image with no detectable waste objects
2. Upload image with multiple waste items
3. Upload very low quality/blurry image
4. Upload image with unusual lighting conditions

### Error Cases

1. Upload oversized image (>5MB)
2. Upload invalid file format
3. Send request without image
4. Send request with invalid session ID
