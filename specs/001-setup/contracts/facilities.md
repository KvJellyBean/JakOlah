# API Contract: GET /api/facilities

## Endpoint

`GET /api/facilities`

## Purpose

Retrieves waste disposal facilities in Jakarta based on waste category and user location, providing information needed for the interactive map display.

## Request

### Headers

- `Accept: application/json`

### Query Parameters

```typescript
interface FacilitiesQuery {
  category?: "Organik" | "Anorganik" | "Lainnya"; // Filter by waste type
  lat?: number; // User latitude
  lng?: number; // User longitude
  radius?: number; // Search radius in meters (default: 5000)
  limit?: number; // Max results (default: 50, max: 100)
  type?: string; // Facility type filter
}
```

### Example Requests

```
GET /api/facilities
GET /api/facilities?category=Organik&lat=-6.2088&lng=106.8456&radius=3000
GET /api/facilities?type=Bank%20Sampah&limit=20
```

## Response

### Success Response (200 OK)

```typescript
interface FacilitiesResponse {
  success: true;
  data: {
    facilities: DisposalFacility[];
    totalCount: number;
    searchParams: {
      category?: string;
      userLocation?: {
        latitude: number;
        longitude: number;
      };
      radius: number;
      limit: number;
    };
  };
}

interface DisposalFacility {
  id: number;
  name: string;
  type: "TPS" | "TPA" | "Bank Sampah" | "Recycling Center";
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // Meters from user location (if provided)
  operatingHours: OperatingHours;
  contactInfo?: {
    phone?: string;
    website?: string;
  };
  acceptedWasteTypes: Array<"Organik" | "Anorganik" | "Lainnya">;
  isActive: boolean;
}

interface OperatingHours {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
  notes?: string; // Special notes like "24/7" or holidays
}

interface TimeRange {
  open: string; // HH:mm format
  close: string; // HH:mm format
  isClosed?: boolean; // True if closed this day
}
```

### Example Success Response

```json
{
  "success": true,
  "data": {
    "facilities": [
      {
        "id": 1,
        "name": "TPS Menteng",
        "type": "TPS",
        "address": "Jl. Menteng Raya No. 15, Jakarta Pusat",
        "coordinates": {
          "latitude": -6.1944,
          "longitude": 106.8294
        },
        "distance": 1250,
        "operatingHours": {
          "monday": { "open": "06:00", "close": "18:00" },
          "tuesday": { "open": "06:00", "close": "18:00" },
          "wednesday": { "open": "06:00", "close": "18:00" },
          "thursday": { "open": "06:00", "close": "18:00" },
          "friday": { "open": "06:00", "close": "18:00" },
          "saturday": { "open": "06:00", "close": "18:00" },
          "sunday": { "isClosed": true }
        },
        "contactInfo": {
          "phone": "+62-21-12345678"
        },
        "acceptedWasteTypes": ["Organik", "Anorganik", "Lainnya"],
        "isActive": true
      },
      {
        "id": 2,
        "name": "Bank Sampah Sejahtera",
        "type": "Bank Sampah",
        "address": "Jl. Kemang Selatan No. 99, Jakarta Selatan",
        "coordinates": {
          "latitude": -6.2615,
          "longitude": 106.8106
        },
        "distance": 2780,
        "operatingHours": {
          "tuesday": { "open": "08:00", "close": "15:00" },
          "thursday": { "open": "08:00", "close": "15:00" },
          "saturday": { "open": "08:00", "close": "12:00" },
          "notes": "Khusus hari Selasa, Kamis, dan Sabtu"
        },
        "contactInfo": {
          "phone": "+62-812-3456-7890",
          "website": "https://banksampahsejahtera.com"
        },
        "acceptedWasteTypes": ["Anorganik"],
        "isActive": true
      }
    ],
    "totalCount": 23,
    "searchParams": {
      "category": "Organik",
      "userLocation": {
        "latitude": -6.2088,
        "longitude": 106.8456
      },
      "radius": 3000,
      "limit": 50
    }
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

- `INVALID_COORDINATES`: Latitude/longitude values out of valid range
- `INVALID_CATEGORY`: Category not one of valid waste types
- `INVALID_RADIUS`: Radius value out of acceptable range (100-50000)
- `INVALID_LIMIT`: Limit exceeds maximum allowed (100)

#### 422 Unprocessable Entity

```json
{
  "success": false,
  "error": {
    "code": "LOCATION_OUT_OF_BOUNDS",
    "message": "Provided coordinates are outside Jakarta metropolitan area",
    "details": {
      "providedLocation": {
        "latitude": -7.2575,
        "longitude": 112.7521
      },
      "validBounds": {
        "north": -5.9,
        "south": -6.7,
        "east": 107.2,
        "west": 106.5
      }
    }
  }
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Unable to retrieve facility data"
  }
}
```

## Query Parameter Details

### category (optional)

- **Type**: String enum
- **Values**: 'Organik', 'Anorganik', 'Lainnya'
- **Purpose**: Filter facilities that accept specific waste type
- **Default**: Returns all facilities regardless of accepted waste types

### lat, lng (optional, but required together)

- **Type**: Number (decimal degrees)
- **Range**: Jakarta area (-6.7 to -5.9 lat, 106.5 to 107.2 lng)
- **Purpose**: Calculate distance and sort by proximity
- **Validation**: Must be valid coordinates within Jakarta bounds

### radius (optional)

- **Type**: Number (meters)
- **Range**: 100 - 50000 (100m to 50km)
- **Default**: 5000 (5km)
- **Purpose**: Limit search area around user location

### limit (optional)

- **Type**: Number
- **Range**: 1 - 100
- **Default**: 50
- **Purpose**: Control response size and performance

### type (optional)

- **Type**: String
- **Values**: 'TPS', 'TPA', 'Bank Sampah', 'Recycling Center'
- **Purpose**: Filter by facility type
- \*\*Can be combined with category filter

## Business Rules

### Facility Filtering

- If category specified, only return facilities that accept that waste type
- If location provided, sort results by distance (closest first)
- Only return active facilities (isActive = true)
- Apply radius filter only when user location provided

### Distance Calculation

- Use Haversine formula for accurate distance calculation
- Round distances to nearest meter
- Maximum practical radius is 50km (entire Jakarta metro area)

### Operating Hours

- Provide complete weekly schedule when available
- Handle special cases (24/7, irregular hours)
- Include holiday/special notes
- Times in 24-hour format (HH:mm)

## Performance Requirements

- Response time under 200ms for typical queries
- Support for spatial indexing on coordinates
- Efficient filtering by category and type
- Pagination for large result sets

## Caching Strategy

- Cache facility data for 24 hours (infrequent changes)
- Use geographic bounds for cache keys
- Invalidate cache when facility data updated
- Client-side caching of search results

## Testing Scenarios

### Happy Path

1. Query all facilities without filters
2. Query by category with user location
3. Query by facility type with radius
4. Combine multiple filters

### Edge Cases

1. Query with user location at edge of Jakarta
2. Query with very small radius (no results)
3. Query with very large radius (many results)
4. Query for category not accepted by any facilities

### Error Cases

1. Invalid coordinates (outside Jakarta)
2. Invalid category value
3. Negative or zero radius
4. Limit exceeding maximum
