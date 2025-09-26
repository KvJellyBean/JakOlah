# Admin Dashboard API Contract

## GET /api/admin/dashboard

**Purpose**: Retrieve comprehensive admin analytics (FR-011)

**Headers**: `Authorization: Bearer {admin_access_token}`

**Response 200 (Success)**:

```typescript
{
  summary: {
    total_classifications: number;
    registered_users_count: number;
    active_users_last_30_days: number;
    classifications_today: number;
    classifications_this_week: number;
    classifications_this_month: number;
  }
  classification_by_category: {
    organik: {
      count: number;
      percentage: number;
    }
    anorganik: {
      count: number;
      percentage: number;
    }
    lainnya: {
      count: number;
      percentage: number;
    }
  }
  classification_distribution: {
    daily: Array<{
      date: string; // YYYY-MM-DD
      organik: number;
      anorganik: number;
      lainnya: number;
      total: number;
    }>;
    weekly: Array<{
      week_start: string; // YYYY-MM-DD
      organik: number;
      anorganik: number;
      lainnya: number;
      total: number;
    }>;
  }
  user_activity: {
    new_registrations_this_month: number;
    top_users_by_classifications: Array<{
      user_id: string;
      full_name: string; // anonymized after first name
      classification_count: number;
      last_active: string; // ISO 8601
    }>;
  }
  system_performance: {
    average_classification_time: number; // milliseconds
    success_rate: number; // percentage
    low_confidence_rate: number; // percentage of classifications < 70%
  }
  generated_at: string; // ISO 8601
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
  error: string; // "Admin access required"
}
```

---

## GET /api/admin/users

**Purpose**: Retrieve all active user classifications history

**Headers**: `Authorization: Bearer {admin_access_token}`

**Query Parameters**:

```typescript
{
  page?: number; // default: 1
  limit?: number; // default: 50, max: 200
  sort_by?: "created_at" | "classification_count" | "last_active"; // default: created_at
  sort_order?: "asc" | "desc"; // default: desc
  active_since?: string; // ISO 8601 date - filter users active since date
}
```

**Response 200 (Success)**:

```typescript
{
  users: Array<{
    user_id: string;
    full_name: string;
    email: string; // partially masked: u***@domain.com
    role: "user" | "admin";
    classification_count: number;
    last_classification: string; // ISO 8601, null if no classifications
    created_at: string;
    last_active: string; // ISO 8601
    location_permission: boolean;
  }>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_users: number;
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

**Response 403 (Forbidden)**:

```typescript
{
  error: string; // "Admin access required"
}
```

---

## GET /api/admin/classifications

**Purpose**: Retrieve all system classifications with user details

**Headers**: `Authorization: Bearer {admin_access_token}`

**Query Parameters**:

```typescript
{
  page?: number; // default: 1
  limit?: number; // default: 50, max: 200
  category?: "Organik" | "Anorganik" | "Lainnya";
  user_id?: string; // filter by specific user
  start_date?: string; // ISO 8601 date
  end_date?: string; // ISO 8601 date
  low_confidence_only?: boolean; // filter for confidence < 70%
}
```

**Response 200 (Success)**:

```typescript
{
  classifications: Array<{
    classification_id: string;
    user: {
      user_id: string;
      full_name: string; // anonymized after first name
      email: string; // partially masked
    };
    category: string;
    category_code: string;
    confidence: number;
    confidence_scores: {
      organik: number;
      anorganik: number;
      lainnya: number;
    };
    low_confidence_warning: boolean;
    processing_time: number; // milliseconds
    created_at: string;
  }>;
  pagination: {
    current_page: number;
    total_pages: number;
    total_classifications: number;
    items_per_page: number;
  }
  aggregates: {
    average_confidence: number;
    low_confidence_count: number;
    category_breakdown: {
      organik: number;
      anorganik: number;
      lainnya: number;
    }
  }
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
  error: string; // "Admin access required"
}
```
