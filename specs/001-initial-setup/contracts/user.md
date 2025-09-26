# User Profile API Contract

## GET /api/user/profile

**Purpose**: Retrieve user's profile information

**Headers**: `Authorization: Bearer {access_token}`

**Response 200 (Success)**:

```typescript
{
  user: {
    user_id: string;
    full_name: string;
    email: string;
    role: "user" | "admin";
    profile_image?: string; // Supabase Storage URL
    location: {
      latitude?: number;
      longitude?: number;
      permission_granted: boolean;
      updated_at?: string; // ISO 8601
    }
    statistics: {
      total_classifications: number;
      classifications_this_month: number;
      favorite_category: string; // most classified category
      accuracy_trend: "improving" | "stable" | "declining"; // based on confidence scores
    }
    created_at: string;
    updated_at: string;
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

## PUT /api/user/profile

**Purpose**: Update user profile information

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:

```typescript
{
  full_name?: string; // min 2 chars, max 100 chars
  profile_image?: File; // optional image upload
  location?: {
    latitude: number; // -90 to 90
    longitude: number; // -180 to 180
    permission_granted: boolean;
  }
}
```

**Response 200 (Success)**:

```typescript
{
  message: string; // "Profile updated successfully"
  user: {
    user_id: string;
    full_name: string;
    email: string;
    profile_image?: string;
    location: {
      latitude?: number;
      longitude?: number;
      permission_granted: boolean;
      updated_at: string;
    }
    updated_at: string;
  }
}
```

**Response 400 (Validation Error)**:

```typescript
{
  error: string; // "Validation failed"
  details: string[];
}
```

**Response 401 (Unauthorized)**:

```typescript
{
  error: string; // "Authentication required"
}
```

---

## DELETE /api/user/account

**Purpose**: Delete user account and all associated data (FR-014, FR-014a)

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:

```typescript
{
  confirmation: string; // must be "DELETE" to confirm
  password: string; // current password for security
}
```

**Response 200 (Success)**:

```typescript
{
  message: string; // "Account deleted successfully"
  deleted_data: {
    classifications_deleted: number;
    images_deleted: number;
    profile_deleted: boolean;
  }
}
```

**Response 400 (Invalid Confirmation)**:

```typescript
{
  error: string; // "Invalid confirmation. Type 'DELETE' to confirm."
}
```

**Response 401 (Invalid Password)**:

```typescript
{
  error: string; // "Invalid password"
}
```

**Response 401 (Unauthorized)**:

```typescript
{
  error: string; // "Authentication required"
}
```

---

## POST /api/user/location

**Purpose**: Update user location for facility recommendations

**Headers**: `Authorization: Bearer {access_token}`

**Request Body**:

```typescript
{
  latitude: number; // -90 to 90, Jakarta area preferred
  longitude: number; // -180 to 180, Jakarta area preferred
  permission_granted: boolean; // explicit consent (constitutional requirement)
}
```

**Response 200 (Success)**:

```typescript
{
  message: string; // "Location updated successfully"
  location: {
    latitude: number;
    longitude: number;
    permission_granted: boolean;
    updated_at: string; // ISO 8601
  }
  nearby_facilities_count: number; // number of facilities within 10km
}
```

**Response 400 (Invalid Coordinates)**:

```typescript
{
  error: string; // "Invalid coordinates"
  details: string; // specific validation message
}
```

**Response 401 (Unauthorized)**:

```typescript
{
  error: string; // "Authentication required"
}
```
