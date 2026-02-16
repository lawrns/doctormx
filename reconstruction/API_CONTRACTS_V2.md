# 📡 API Contracts V2 - DoctorMX Reconstruction

> **Document Version:** 1.0  
> **Date:** 2026-02-16  
> **Purpose:** Clean API design based on lessons learned from v1 failures  
> **Standard:** RESTful API with standardized response format

---

## 📋 Executive Summary

The original API had **inconsistent response formats**, missing validation, no versioning, and inadequate security. This document defines the **clean, standardized API contracts** for reconstruction.

**Key Improvements:**
1. Single standardized response format
2. Mandatory Zod validation on all routes
3. API versioning (`/api/v1/`)
4. Consistent error handling
5. Security baked-in (CSRF, rate limiting, RLS)

---

## 🌐 API Standards

### Base URL

```
Production:  https://api.doctor.mx/v1
Staging:     https://api-staging.doctor.mx/v1
Development: http://localhost:3000/api/v1
```

### HTTP Methods

| Method | Usage | Idempotent |
|--------|-------|------------|
| GET | Read resources | Yes |
| POST | Create resources | No |
| PUT | Full update | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove resources | Yes |

### Standard Response Format

```typescript
// All responses follow this structure
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: ResponseMeta;
}

interface APIError {
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;  // For debugging
}

interface ResponseMeta {
  timestamp: string;
  requestId: string;
  pagination?: PaginationMeta;
}

interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Success Examples

```json
// Single resource
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dr. María González",
    "specialty": "Cardiología"
  },
  "meta": {
    "timestamp": "2026-02-16T14:30:00Z",
    "requestId": "req_abc123"
  }
}

// List with pagination
{
  "success": true,
  "data": [
    { "id": "1", "name": "Dr. A" },
    { "id": "2", "name": "Dr. B" }
  ],
  "meta": {
    "timestamp": "2026-02-16T14:30:00Z",
    "requestId": "req_abc123",
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Error Examples

```json
// Validation error (400)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "phone", "message": "Required field missing" }
    ],
    "traceId": "req_abc123"
  },
  "meta": {
    "timestamp": "2026-02-16T14:30:00Z",
    "requestId": "req_abc123"
  }
}

// Not found (404)
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Doctor with id '123' not found",
    "traceId": "req_abc123"
  }
}

// Unauthorized (401)
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "traceId": "req_abc123"
  }
}

// Rate limited (429)
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "details": {
      "retryAfter": 60
    }
  }
}
```

---

## 🔐 Authentication

### JWT Token

```http
Authorization: Bearer <jwt_token>
```

### Session Cookie

```http
Cookie: sb-access-token=<token>; sb-refresh-token=<token>
```

### CSRF Protection

All state-changing requests (POST, PUT, PATCH, DELETE) require CSRF token:

```http
X-CSRF-Token: <csrf_token>
```

---

## 📚 API Endpoints

### Authentication

#### POST `/auth/login`

Authenticate user and return tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "patient"
    },
    "session": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresAt": "2026-02-16T20:30:00Z"
    }
  }
}
```

#### POST `/auth/register`

Register new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "Juan Pérez",
  "role": "patient",
  "phone": "+52 1 55 1234 5678"
}
```

#### POST `/auth/logout`

Invalidate current session.

#### POST `/auth/refresh`

Refresh access token using refresh token.

---

### Doctors

#### GET `/doctors`

List doctors with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| specialty | string | Filter by specialty slug |
| city | string | Filter by city |
| available | boolean | Only show available doctors |
| minRating | number | Minimum rating (1-5) |
| maxPrice | number | Maximum price in cents |
| page | number | Page number (default: 1) |
| perPage | number | Items per page (default: 20, max: 100) |
| sort | string | Sort field: `rating`, `price`, `experience` |
| order | string | Sort order: `asc`, `desc` |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "fullName": "Dr. María González",
      "photoUrl": "https://cdn.doctor.mx/doctors/uuid.jpg",
      "specialties": [
        { "id": "uuid", "name": "Cardiología", "slug": "cardiologia" }
      ],
      "yearsExperience": 15,
      "rating": {
        "average": 4.8,
        "count": 127
      },
      "price": {
        "cents": 50000,
        "currency": "MXN",
        "formatted": "$500"
      },
      "location": {
        "city": "Ciudad de México",
        "state": "CDMX"
      },
      "languages": ["es", "en"],
      "nextAvailable": "2026-02-17T10:00:00Z"
    }
  ],
  "meta": {
    "timestamp": "2026-02-16T14:30:00Z",
    "requestId": "req_abc123",
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### GET `/doctors/:id`

Get detailed doctor profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "fullName": "Dr. María González",
    "photoUrl": "https://cdn.doctor.mx/doctors/uuid.jpg",
    "bio": "Cardióloga con 15 años de experiencia...",
    "specialties": [...],
    "education": [
      {
        "institution": "UNAM",
        "degree": "Doctorado en Medicina",
        "year": 2010
      }
    ],
    "certifications": [...],
    "yearsExperience": 15,
    "rating": { "average": 4.8, "count": 127 },
    "reviews": [
      {
        "id": "uuid",
        "patientName": "Anónimo",
        "rating": 5,
        "comment": "Excelente atención",
        "date": "2026-01-15T10:00:00Z"
      }
    ],
    "price": { "cents": 50000, "currency": "MXN" },
    "availability": {
      "hasSlots": true,
      "nextSevenDays": ["2026-02-17", "2026-02-18", "2026-02-19"]
    }
  }
}
```

#### GET `/doctors/:id/slots`

Get available time slots for a doctor.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| from | date | Start date (ISO 8601) |
| to | date | End date (ISO 8601, max 30 days) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "2026-02-17": [
      { "start": "09:00", "end": "09:30", "available": true },
      { "start": "09:30", "end": "10:00", "available": false },
      { "start": "10:00", "end": "10:30", "available": true }
    ],
    "2026-02-18": [...]
  }
}
```

---

### Appointments

#### POST `/appointments`

Create new appointment.

**Request:**
```json
{
  "doctorId": "uuid",
  "startTime": "2026-02-17T10:00:00Z",
  "reasonForVisit": "Dolor de pecho",
  "symptoms": ["dolor_toracico", "fatiga"],
  "isUrgent": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "doctorId": "uuid",
    "patientId": "uuid",
    "startTime": "2026-02-17T10:00:00Z",
    "endTime": "2026-02-17T10:30:00Z",
    "status": "pending_payment",
    "price": { "cents": 50000, "currency": "MXN" },
    "paymentIntent": {
      "clientSecret": "pi_xxx_secret_yyy",
      "amount": 50000
    },
    "expiresAt": "2026-02-17T09:55:00Z"
  }
}
```

**Errors:**
- `409 CONFLICT` - Slot already booked
- `422 UNPROCESSABLE` - Slot outside doctor's availability

#### GET `/appointments`

List user's appointments.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| from | date | Filter by start date |
| to | date | Filter by end date |
| role | string | `patient` or `doctor` (defaults to current user role) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "doctor": {
        "id": "uuid",
        "fullName": "Dr. María González",
        "photoUrl": "...",
        "specialty": "Cardiología"
      },
      "startTime": "2026-02-17T10:00:00Z",
      "endTime": "2026-02-17T10:30:00Z",
      "status": "confirmed",
      "price": { "cents": 50000, "currency": "MXN" },
      "videoRoomUrl": "https://daily.co/room-xxx",
      "canJoin": false,
      "joinableAt": "2026-02-17T09:45:00Z"
    }
  ]
}
```

#### GET `/appointments/:id`

Get appointment details.

#### PATCH `/appointments/:id`

Update appointment (limited fields).

**Request:**
```json
{
  "reasonForVisit": "Updated reason",
  "notes": "Additional notes"
}
```

#### POST `/appointments/:id/cancel`

Cancel appointment.

**Request:**
```json
{
  "reason": "patient_request",
  "notes": "Paciente solicita cancelar"
}
```

---

### Payments

#### POST `/payments/create-intent`

Create Stripe PaymentIntent.

**Request:**
```json
{
  "appointmentId": "uuid",
  "paymentMethod": "card" // or "oxxo"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_yyy",
    "paymentIntentId": "pi_xxx",
    "amount": 50000,
    "currency": "MXN",
    "paymentMethod": "card",
    "oxxoVoucherUrl": null // Only for OXXO
  }
}
```

#### POST `/payments/confirm`

Confirm payment (webhook handler).

---

### User Profile

#### GET `/user/profile`

Get current user profile.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Juan Pérez",
    "role": "patient",
    "phone": "+52 1 55 1234 5678",
    "photoUrl": "https://cdn.doctor.mx/avatars/uuid.jpg",
    "preferences": {
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      },
      "language": "es-MX"
    },
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

#### PATCH `/user/profile`

Update user profile.

#### GET `/user/appointments`

Get user's appointments (alias for `/appointments`).

#### GET `/user/medical-history`

Get medical history (patients only).

---

### ARCO (Data Privacy - Mexico Compliance)

#### GET `/arco/requests`

List user's ARCO requests.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Filter by type: ACCESS, RECTIFY, CANCEL, OPPOSE |
| status | string | Filter by status |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "ACCESS",
      "title": "Solicitud de acceso a datos",
      "status": "completed",
      "createdAt": "2026-01-15T10:00:00Z",
      "dueDate": "2026-02-12T10:00:00Z",
      "completedAt": "2026-01-20T14:30:00Z"
    }
  ]
}
```

#### POST `/arco/requests`

Create new ARCO request.

**Request:**
```json
{
  "type": "ACCESS",
  "title": "Solicitud de acceso a datos",
  "description": "Solicito copia de todos mis datos personales",
  "dataScope": ["profiles", "appointments", "payments"],
  "justification": "Ejercicio de derecho ARCO"
}
```

---

### AI Services

#### POST `/ai/preconsulta`

Submit pre-consultation questionnaire.

**Request:**
```json
{
  "symptoms": ["dolor de cabeza", "fiebre"],
  "duration": "3_dias",
  "severity": "moderate",
  "additionalInfo": "El dolor empeora por las noches"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "questionnaireId": "uuid",
    "triageResult": {
      "level": "non_urgent",
      "recommendedSpecialty": "medicina_general",
      "estimatedWaitTime": "15_minutes"
    },
    "suggestedQuestions": [
      "¿Ha tomado algún medicamento?",
      "¿Tiene alergias conocidas?"
    ],
    "disclaimer": "Esta evaluación no reemplaza la consulta médica..."
  }
}
```

---

## 🔒 Security Requirements

### Rate Limiting

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Auth (login/register) | 5 requests | 15 minutes |
| General API | 100 requests | 1 minute |
| AI endpoints | 20 requests | 1 minute |
| Booking | 10 requests | 1 minute |
| Webhooks | No limit (IP allowlist) |

**Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645021200
```

### CORS Policy

```
Allowed Origins:
- https://doctor.mx
- https://www.doctor.mx
- https://app.doctor.mx
- https://admin.doctor.mx

Allowed Methods: GET, POST, PUT, PATCH, DELETE
Allowed Headers: Content-Type, Authorization, X-CSRF-Token
Credentials: true
```

### Security Headers

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com;
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(self)
```

---

## 🧪 Implementation Template

```typescript
// src/app/api/v1/doctors/route.ts

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { success, error, validateRequest } from '@/lib/api/response';
import { requireAuth } from '@/lib/auth/server';
import { rateLimit } from '@/lib/rate-limit';
import { DoctorRepository } from '@/lib/repositories/doctor';

// Validation schemas
const QuerySchema = z.object({
  specialty: z.string().optional(),
  city: z.string().optional(),
  available: z.coerce.boolean().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(20),
  sort: z.enum(['rating', 'price', 'experience']).optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// GET /api/v1/doctors
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const { success: rateLimitOk } = await rateLimit(
      request.ip ?? 'anonymous',
      'general'
    );
    if (!rateLimitOk) {
      return error('RATE_LIMITED', 'Too many requests', 429);
    }

    // Parse query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const queryResult = QuerySchema.safeParse(searchParams);
    
    if (!queryResult.success) {
      return error(
        'VALIDATION_ERROR',
        'Invalid query parameters',
        400,
        queryResult.error.errors
      );
    }

    const query = queryResult.data;

    // Fetch data
    const repo = new DoctorRepository();
    const { doctors, total } = await repo.findMany({
      specialty: query.specialty,
      city: query.city,
      available: query.available,
      minRating: query.minRating,
      maxPrice: query.maxPrice,
      page: query.page,
      perPage: query.perPage,
      sort: query.sort,
      order: query.order,
    });

    // Calculate pagination
    const totalPages = Math.ceil(total / query.perPage);

    return success(doctors, {
      page: query.page,
      perPage: query.perPage,
      total,
      totalPages,
      hasNext: query.page < totalPages,
      hasPrev: query.page > 1,
    });
  } catch (err) {
    console.error('GET /api/v1/doctors error:', err);
    return error('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}

// POST /api/v1/doctors (admin only)
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await requireAuth();
    
    // Authorization
    if (session.user.role !== 'admin') {
      return error('FORBIDDEN', 'Admin access required', 403);
    }

    // CSRF check
    const csrfToken = request.headers.get('X-CSRF-Token');
    if (!csrfToken || !validateCSRF(session.user.id, csrfToken)) {
      return error('INVALID_CSRF', 'Invalid CSRF token', 403);
    }

    // Rate limiting
    const { success: rateLimitOk } = await rateLimit(
      session.user.id,
      'admin'
    );
    if (!rateLimitOk) {
      return error('RATE_LIMITED', 'Too many requests', 429);
    }

    // Validate request body
    const validation = await validateRequest(request, CreateDoctorSchema);
    if (validation.error) return validation.error;

    // Create doctor
    const repo = new DoctorRepository();
    const doctor = await repo.create(validation.data);

    return success(doctor);
  } catch (err) {
    if (err instanceof AppError) {
      return error(err.code, err.message, err.statusCode);
    }
    console.error('POST /api/v1/doctors error:', err);
    return error('INTERNAL_ERROR', 'An unexpected error occurred', 500);
  }
}
```

---

## 📋 Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| BAD_REQUEST | 400 | Malformed request |
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |
| SERVICE_UNAVAILABLE | 503 | Service temporarily unavailable |

---

## ✅ API Checklist

For every new endpoint:

- [ ] Uses standardized response format
- [ ] Has Zod validation for all inputs
- [ ] Implements proper error handling
- [ ] Has rate limiting
- [ ] Has authentication (if required)
- [ ] Has authorization checks
- [ ] Has CSRF protection (for mutations)
- [ ] Returns proper HTTP status codes
- [ ] Has OpenAPI documentation
- [ ] Has corresponding tests
