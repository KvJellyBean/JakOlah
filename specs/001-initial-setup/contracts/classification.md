# Classification API Contract

## POST /api/classify

**Purpose**: Submit image for waste classification

**Headers**: `Authorization: Bearer {access_token}`

**Request Body** (multipart/form-data):

```typescript
{
  image: File; // JPEG/PNG/WebP, max 10MB (FR-001)
}
```

**Response 200 (Success)**:

```typescript
{
  classification_id: string; // UUID
  result: {
    category: "Organik" | "Anorganik" | "Lainnya"; // (FR-002)
    category_code: "ORG" | "ANO" | "LAI";
    confidence: number; // percentage (FR-003)
    low_confidence_warning?: boolean; // true if confidence < 70% (FR-003a)
  }
  confidence_scores: {
    organik: number; // 0-100
    anorganik: number; // 0-100
    lainnya: number; // 0-100
  }
  recommendations: {
    disposal_guidance: string; // rule-based recommendations (FR-005)
    education_content: string; // Jakarta-specific best practices
  }
  nearby_facilities: Array<{
    facility_id: string;
    facility_name: string;
    facility_type: "TPS" | "TPA" | "Bank Sampah";
    distance: number; // in kilometers
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
    accepts_category: boolean; // whether this facility accepts the classified waste type
  }>
  processing_time: number; // milliseconds (performance monitoring)
  created_at: string; // ISO 8601
}
```

**Response 400 (Invalid Image)**:

```typescript
{
  error: string; // "Invalid image format or size"
  details: string; // specific validation message
}
```

**Response 401 (Unauthorized)**:

```typescript
{
  error: string; // "Authentication required for classification" (FR-007)
}
```

**Response 413 (File Too Large)**:

```typescript
{
  error: string; // "Image size exceeds 10MB limit"
}
```

**Response 422 (Non-Waste Object)**:

```typescript
{
  error: string; // "Unable to classify: image does not contain recognizable waste"
  suggestion: string; // "Please upload a clear image of waste items"
}
```

**Response 503 (Service Unavailable)**:

```typescript
{
  error: string; // "Classification service temporarily unavailable"
  retry_after: number; // seconds
}
```

---

## GET /api/classify/history

**Purpose**: Retrieve user's classification history (FR-008)

**Headers**: `Authorization: Bearer {access_token}`

**Query Parameters**:

```typescript
{
  page?: number; // default: 1
  limit?: number; // default: 20, max: 100
  category?: "Organik" | "Anorganik" | "Lainnya"; // filter by category
  start_date?: string; // ISO 8601 date
  end_date?: string; // ISO 8601 date
}
```

**Response 200 (Success)**:

```typescript
{
  classifications: Array<{
    classification_id: string;
    category: string;
    category_code: string;
    confidence: number;
    image_url: string; // signed URL from Supabase Storage
    created_at: string;
    low_confidence_warning?: boolean;
  }>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  }
}
```

**Response 401 (Unauthorized)**:

```typescript
{
  error: string; // "Authentication required"
}
```

---

## DELETE /api/classify/:classification_id

**Purpose**: Delete specific classification from history

**Headers**: `Authorization: Bearer {access_token}`

**Response 200 (Success)**:

```typescript
{
  message: string; // "Classification deleted successfully"
}
```

**Response 401 (Unauthorized)**:

```typescript
{
  error: string; // "Authentication required"
}
```

**Response 403 (Forbidden)**:

```typescript
{
  error: string; // "You can only delete your own classifications"
}
```

**Response 404 (Not Found)**:

```typescript
{
  error: string; // "Classification not found"
}
```

---

## DELETE /api/classify/history

**Purpose**: Delete all user classification history (FR-014)

**Headers**: `Authorization: Bearer {access_token}`

**Response 200 (Success)**:

```typescript
{
  message: string; // "All classification history deleted successfully"
  deleted_count: number;
}
```

**Response 401 (Unauthorized)**:

```typescript
{
  error: string; // "Authentication required"
}
```
