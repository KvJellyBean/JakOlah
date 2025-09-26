# Facilities API Contract

## GET /api/facilities

**Purpose**: Retrieve waste management facilities with optional filtering

**Headers**: `Authorization: Bearer {access_token}` (optional for public info access)

**Query Parameters**:

```typescript
{
  user_lat?: number; // user latitude for distance calculation
  user_lng?: number; // user longitude for distance calculation
  radius?: number; // search radius in kilometers, default: 10, max: 50
  facility_type?: "TPS" | "TPA" | "Bank Sampah"; // filter by type
  accepts_category?: "Organik" | "Anorganik" | "Lainnya"; // filter by accepted waste
  limit?: number; // default: 20, max: 100
}
```

**Response 200 (Success)**:

```typescript
{
  facilities: Array<{
    facility_id: string;
    facility_name: string;
    facility_type: "TPS" | "TPA" | "Bank Sampah";
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
    distance?: number; // in kilometers, if user location provided
    accepted_categories: Array<{
      category_name: "Organik" | "Anorganik" | "Lainnya";
      category_code: "ORG" | "ANO" | "LAI";
    }>
    acceptance_rules: string; // description of what this facility accepts (FR-016)
  }>
  user_location?: {
    latitude: number;
    longitude: number;
  } // echoed back if provided
  search_radius: number; // actual radius used
  total_facilities: number;
}
```

**Response 400 (Invalid Parameters)**:

```typescript
{
  error: string; // "Invalid location or search parameters"
  details: string;
}
```

---

## GET /api/facilities/:facility_id

**Purpose**: Get detailed information about a specific facility

**Response 200 (Success)**:

```typescript
{
  facility: {
    facility_id: string;
    facility_name: string;
    facility_type: "TPS" | "TPA" | "Bank Sampah";
    address: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    }
    accepted_categories: Array<{
      category_name: string;
      category_code: string;
      description: string; // category-specific acceptance details
    }>;
    acceptance_rules: string; // detailed rules for this facility type
    operational_info: string; // general operational information
    last_updated: string; // ISO 8601
  }
}
```

**Response 404 (Not Found)**:

```typescript
{
  error: string; // "Facility not found"
}
```

---

## GET /api/facilities/map-data

**Purpose**: Get facilities data optimized for map display (OpenStreetMap + Leaflet)

**Query Parameters**:

```typescript
{
  bounds: {
    north: number; // bounding box coordinates
    south: number;
    east: number;
    west: number;
  }
  facility_type?: "TPS" | "TPA" | "Bank Sampah";
  accepts_category?: "Organik" | "Anorganik" | "Lainnya";
}
```

**Response 200 (Success)**:

```typescript
{
  features: Array<{
    type: "Feature";
    geometry: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude] for GeoJSON compatibility
    };
    properties: {
      facility_id: string;
      name: string;
      type: "TPS" | "TPA" | "Bank Sampah";
      address: string;
      accepted_categories: string[]; // category codes
      popup_content: string; // pre-formatted HTML for map popups
    };
  }>;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
  count: number;
}
```

**Response 400 (Invalid Bounds)**:

```typescript
{
  error: string; // "Invalid bounding box coordinates"
}
```
