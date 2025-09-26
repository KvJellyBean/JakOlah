# Authentication API Contract

## POST /api/auth/register

**Purpose**: User registration with email verification

**Request Body**:

```typescript
{
  full_name: string; // min 2 chars, max 100 chars
  email: string; // valid email format
  password: string; // min 8 chars, complexity requirements
}
```

**Response 201 (Success)**:

```typescript
{
  message: string; // "Registration successful. Please check your email for verification."
  user: {
    id: string; // UUID
    email: string;
    full_name: string;
    role: "user";
    created_at: string; // ISO 8601
  }
}
```

**Response 400 (Validation Error)**:

```typescript
{
  error: string; // "Validation failed"
  details: string[]; // Array of specific validation errors
}
```

**Response 409 (Email Exists)**:

```typescript
{
  error: string; // "Email already registered"
}
```

---

## POST /api/auth/login

**Purpose**: User authentication with email/password

**Request Body**:

```typescript
{
  email: string;
  password: string;
}
```

**Response 200 (Success)**:

```typescript
{
  message: string; // "Login successful"
  user: {
    id: string;
    email: string;
    full_name: string;
    role: "user" | "admin";
    profile_image?: string;
  }
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: string; // ISO 8601
  }
}
```

**Response 401 (Invalid Credentials)**:

```typescript
{
  error: string; // "Invalid email or password"
}
```

**Response 403 (Unverified Email)**:

```typescript
{
  error: string; // "Please verify your email before logging in"
}
```

---

## POST /api/auth/forgot-password

**Purpose**: Password reset request

**Request Body**:

```typescript
{
  email: string;
}
```

**Response 200 (Success)**:

```typescript
{
  message: string; // "Password reset email sent"
}
```

**Response 404 (Email Not Found)**:

```typescript
{
  error: string; // "Email not found"
}
```

---

## POST /api/auth/logout

**Purpose**: User session termination

**Headers**: `Authorization: Bearer {access_token}`

**Response 200 (Success)**:

```typescript
{
  message: string; // "Logged out successfully"
}
```

**Response 401 (Unauthorized)**:

```typescript
{
  error: string; // "Invalid or expired token"
}
```
