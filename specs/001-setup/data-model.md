# Data Model: JakOlah

## Core Entities

### WasteItem (Runtime Only - Not Persisted)

Represents a detected waste object in the camera frame (exists only during active session).

**Attributes**:

- `id`: Unique identifier for the detection instance
- `category`: Classification result ('Organik', 'Anorganik', 'Lainnya')
- `confidence`: Confidence score (0.0 - 1.0)
- `boundingBox`: Object containing coordinates {x, y, width, height}
- `timestamp`: Detection timestamp (ISO 8601)
- `sessionId`: Temporary session identifier (browser-based)

**Validation Rules**:

- Category must be one of the three valid types
- Confidence must be between 0.0 and 1.0
- Bounding box coordinates must be within image dimensions
- No persistent storage - cleared when session ends

### Classification (Runtime Only - Not Persisted)

Represents the AI model's categorization result.

**Attributes**:

- `category`: Waste category ('Organik', 'Anorganik', 'Lainnya')
- `confidence`: Confidence percentage (0-100)
- `modelVersion`: Version of the ML model used (if using TensorFlow.js)
- `processingTime`: Time taken for classification (milliseconds)
- `alternativeResults`: Array of other possible classifications with scores

**Note**: Results exist only in browser memory during active session.

### DisposalFacility (Persisted in Database)

Represents waste management facilities in Jakarta based on ERD provided.

**Attributes** (matching ERD):

- `facility_id`: Primary key
- `facility_name`: Facility name in Indonesian
- `facility_type`: Type ('TPS', 'TPA', 'Bank Sampah', 'Recycling Center')
- `latitude`: Latitude coordinate
- `longitude`: Longitude coordinate
- `address`: Full address in Jakarta
- `city`: City/area in Jakarta
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### WasteCategory (Persisted in Database)

Represents the three waste categories based on ERD.

**Attributes** (matching ERD):

- `waste_category_id`: Primary key
- `category_name`: Category name ('Organik', 'Anorganik', 'Lainnya')
- `category_code`: Short code for category
- `description`: Description of waste category
- `created_at`: Record creation timestamp
- `updated_at`: Last update timestamp

### LocationData (Runtime Only - Not Persisted)

Represents geographic information calculated in real-time.

**Attributes**:

- `userCoordinates`: Current location from browser geolocation API
- `nearbyFacilities`: Array of facilities within search radius
- `searchRadius`: Distance radius for facility search (meters)
- `calculatedDistances`: Distances to each facility
- `mapBounds`: Current map viewport bounds

**Note**: No user location data is stored - only used temporarily for calculations.

## Database Schema (Supabase) - Based on Provided ERD

### Tables

#### waste_category

```sql
CREATE TABLE waste_category (
  waste_category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL UNIQUE, -- 'Organik', 'Anorganik', 'Lainnya'
  category_code VARCHAR(10) NOT NULL UNIQUE, -- Short code like 'ORG', 'ANORG', 'LAIN'
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### waste_facility

```sql
CREATE TABLE waste_facility (
  facility_id SERIAL PRIMARY KEY,
  facility_name VARCHAR(255) NOT NULL,
  facility_type VARCHAR(50) NOT NULL, -- 'TPS', 'TPA', 'Bank Sampah', 'Recycling Center'
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL, -- Area/city in Jakarta
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### waste_facility_category (Junction Table)

```sql
CREATE TABLE waste_facility_category (
  facility_id INTEGER REFERENCES waste_facility(facility_id) ON DELETE CASCADE,
  waste_category_id INTEGER REFERENCES waste_category(waste_category_id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (facility_id, waste_category_id)
);
```

### Indexes

```sql
-- Spatial queries optimization
CREATE INDEX idx_waste_facility_coordinates ON waste_facility (latitude, longitude);
CREATE INDEX idx_waste_facility_type ON waste_facility (facility_type);
CREATE INDEX idx_waste_facility_city ON waste_facility (city);

-- Junction table optimization
CREATE INDEX idx_facility_category_facility ON waste_facility_category (facility_id);
CREATE INDEX idx_facility_category_category ON waste_facility_category (waste_category_id);
```

### Initial Data (seed.sql)

```sql
-- Insert waste categories
INSERT INTO waste_category (category_name, category_code, description) VALUES
('Organik', 'ORG', 'Sampah organik seperti sisa makanan, daun, dll'),
('Anorganik', 'ANORG', 'Sampah anorganik seperti plastik, logam, kaca, dll'),
('Lainnya', 'LAIN', 'Sampah lain yang tidak termasuk kategori organik/anorganik');

-- Example facilities (will need real Jakarta data)
INSERT INTO waste_facility (facility_name, facility_type, latitude, longitude, address, city) VALUES
('TPS Menteng', 'TPS', -6.1944, 106.8294, 'Jl. Menteng Raya No. 15', 'Jakarta Pusat'),
('Bank Sampah Sejahtera', 'Bank Sampah', -6.2615, 106.8106, 'Jl. Kemang Selatan No. 99', 'Jakarta Selatan'),
('TPA Bantar Gebang', 'TPA', -6.3374, 107.0052, 'Bantar Gebang', 'Bekasi');

-- Link facilities with accepted waste types
INSERT INTO waste_facility_category (facility_id, waste_category_id) VALUES
-- TPS Menteng accepts all types
(1, 1), (1, 2), (1, 3),
-- Bank Sampah only accepts Anorganik
(2, 2),
-- TPA accepts all types
(3, 1), (3, 2), (3, 3);
```

## API Data Formats

### Classification Request

```javascript
// JavaScript object structure
const classificationRequest = {
  image: File | Blob,
  sessionId: string, // Browser-generated UUID
  timestamp: string, // ISO 8601
};
```

### Classification Response

```javascript
const classificationResponse = {
  success: boolean,
  detections: [
    {
      category: "Organik" | "Anorganik" | "Lainnya",
      confidence: number, // 0.0 - 1.0
      boundingBox: {
        x: number,
        y: number,
        width: number,
        height: number,
      },
      alternativeResults: [
        {
          category: string,
          confidence: number,
        },
      ],
    },
  ],
  processingTime: number,
  sessionId: string,
};
```

### Facility Request

```javascript
const facilityRequest = {
  category?: 'Organik' | 'Anorganik' | 'Lainnya',
  userLocation?: {
    latitude: number,
    longitude: number
  },
  radius?: number, // meters, default 5000
  limit?: number   // max results, default 50
};
```

### Facility Response

```javascript
const facilityResponse = {
  success: boolean,
  facilities: [
    {
      facility_id: number,
      facility_name: string,
      facility_type: string,
      address: string,
      city: string,
      coordinates: {
        latitude: number,
        longitude: number
      },
      distance?: number, // meters from user (if location provided)
      acceptedWasteTypes: ['Organik', 'Anorganik', 'Lainnya']
    }
  ],
  totalCount: number,
  searchRadius: number
};

## Relationships

### Entity Relationships (Database)
- **WasteCategory** (1) → (many) **WasteFacilityCategory**: Categories can be accepted by multiple facilities
- **WasteFacility** (1) → (many) **WasteFacilityCategory**: Facilities can accept multiple waste types
- **WasteFacilityCategory**: Junction table linking facilities to accepted waste categories

### Runtime Data Flow (No Persistence)
1. **Camera Capture**: Browser → WasteItem (temp object)
2. **Classification**: WasteItem → Classification (via ML API or TensorFlow.js)
3. **Facility Lookup**: Classification.category + Browser geolocation → Database query → Facilities[]
4. **Display**: WasteItem + Classification + Facilities[] → UI
5. **Session End**: All runtime data cleared from browser memory

### Data Privacy Approach
- **No User Data Storage**: No user accounts, sessions, or location history
- **Runtime Only**: Detection results exist only in browser memory
- **Temporary Processing**: Images processed and immediately discarded
- **Geolocation**: Used only for real-time facility search, not stored

## Performance Considerations

### Caching Strategy
- **Facility Data**: Cache facility information in browser localStorage for 24 hours
- **Classification Results**: Keep only current detection results in browser memory
- **Map Tiles**: Browser cache for map rendering performance
- **TensorFlow.js Models**: Cache downloaded models in browser for offline inference

### Data Limits
- **Image Size**: Maximum 5MB per classification request
- **Browser Memory**: Limit detection history to last 10 results per session
- **Facility Search**: Maximum 100 facilities per request
- **Search Radius**: Default 5km, maximum 50km

### Cleanup Policies
- **Browser Session**: Clear all detection data when user closes app
- **Temporary Images**: Process and discard immediately (no storage)
- **Location Data**: Use only for immediate facility search, then discard
- **Model Cache**: TensorFlow.js models persist in browser cache for performance

### JavaScript vs TensorFlow.js Considerations
- **Client-side Inference**: TensorFlow.js allows local processing for privacy
- **Fallback to Server**: FastAPI service as backup if client-side inference fails
- **Model Size**: Consider model size vs performance trade-offs for mobile devices
- **Browser Compatibility**: Ensure TensorFlow.js works across target browsers
```
