# Doctor.mx API - Quick Reference Guide

## Essential Information

**Base URLs:**
- Production: `https://doctormx.com/api`
- Staging: `https://staging.doctormx.com/api`
- Local: `http://localhost:3000/api`

**Authentication:** Supabase session cookies (`sb-access-token`, `sb-refresh-token`)

**Default Rate Limits:**
- Auth: 5-10 req / 5 min
- AI: 15-30 req / 1 min
- API Read: 200 req / 1 min
- API Write: 50 req / 1 min
- Premium: 500 req / 1 min

---

## Common Operations

### 1. Patient Booking Flow

```typescript
// Step 1: Get available doctors
GET /api/directory/recommended?specialty=Cardiología

// Step 2: Get available dates
GET /api/doctors/{doctorId}/available-dates?startDate=2026-03-01&endDate=2026-03-31

// Step 3: Get time slots for specific date
GET /api/doctors/{doctorId}/slots?date=2026-03-15

// Step 4: Create appointment
POST /api/appointments
{
  "doctorId": "uuid",
  "date": "2026-03-15",
  "time": "14:30"
}

// Step 5: Create payment
POST /api/create-payment-intent
{
  "appointmentId": "uuid",
  "amount": 50000,
  "currency": "MXN"
}

// Step 6: Confirm appointment (via Stripe webhook)
// Handled automatically by /api/webhooks/stripe
```

### 2. AI Consultation Flow

```typescript
// Option A: Conversational AI
POST /api/ai/consult
{
  "messages": [
    { "role": "user", "content": "Tengo dolor de cabeza..." }
  ]
}

// Option B: SOAP Stream (Multi-specialist)
POST /api/soap/stream
{
  "patientId": "uuid",
  "subjective": {
    "chiefComplaint": "Dolor de cabeza",
    "symptomsDescription": "...",
    "symptomDuration": "3 días",
    "symptomSeverity": 7,
    "onsetType": "gradual"
  },
  "objective": {
    "patientAge": 35,
    "patientGender": "female"
  }
}
// Returns Server-Sent Events (SSE)
```

### 3. Doctor Onboarding Flow

```typescript
// Step 1: Complete profile
POST /api/doctor/onboarding
{
  "yearsExperience": 10,
  "bio": "Médico especialista en...",
  "licenseNumber": "12345678",
  "priceCents": 50000
}

// Step 2: Set availability
POST /api/doctor/availability
{
  "availability": [
    {
      "day_of_week": 1,
      "start_time": "09:00",
      "end_time": "17:00"
    }
  ]
}

// Step 3: Subscribe to premium
POST /api/premium/checkout
{
  "tier": "pro"
}
```

---

## Endpoint Categories

### 🏥 Clinical Operations
| Category | Base Path | Key Endpoints |
|----------|-----------|---------------|
| Appointments | `/appointments` | Create, cancel, video URL |
| Prescriptions | `/prescriptions` | Create, PDF, send |
| Consultations | `/consultation-notes` | Get, create |
| SOAP Notes | `/soap-notes` | Generate, approve |

### 🤖 AI Services
| Category | Base Path | Features |
|----------|-----------|----------|
| AI Consult | `/ai/consult` | Conversational AI, multi-specialist |
| AI Copilot | `/ai/copilot` | Diagnosis, treatment, summary |
| AI Vision | `/ai/vision` | Image analysis |
| Transcription | `/ai/transcription` | Audio to text |
| SOAP Stream | `/soap/stream` | Real-time multi-specialist consultation |

### 👤 User Management
| Category | Base Path | Roles |
|----------|-----------|-------|
| Patient | `/patient` | Profile, medical history, appointments |
| Doctor | `/doctor` | Availability, onboarding, badges |
| Directory | `/directory`, `/doctors` | Search, profiles, scheduling |

### 💳 Payments & Subscriptions
| Category | Base Path | Description |
|----------|-----------|-------------|
| Plans | `/subscriptions/plans` | Get available plans |
| Subscriptions | `/subscriptions` | Manage subscription |
| Payments | `/create-payment-intent` | Create payment |
| Premium | `/premium` | Premium features |
| Webhooks | `/webhooks/stripe` | Payment notifications |

### 📋 Questionnaires
| Category | Base Path | Description |
|----------|-----------|-------------|
| Start | `/questionnaire/start` | Begin adaptive questionnaire |
| Messages | `/questionnaire/message` | Send answers |
| Complete | `/questionnaire/{id}/complete` | Finish questionnaire |

### 📊 Analytics
| Category | Base Path | Access |
|----------|-----------|--------|
| Admin | `/analytics/admin` | Admin only |
| Doctor | `/analytics/doctor` | Doctor only |
| Export | `/analytics/export` | Admin only |
| Revenue | `/analytics/revenue` | Admin only |

---

## Request/Response Examples

### Successful Response (200)

```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response (4xx/5xx)

```json
{
  "error": "Error message",
  "details": { /* additional info */ },
  "redirect": "/path/to/redirect"  // optional
}
```

### Rate Limit Error (429)

```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## Authentication Examples

### Using Fetch

```typescript
const response = await fetch('https://doctormx.com/api/patient/profile', {
  method: 'GET',
  credentials: 'include',  // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
```

### Using Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
})

// Subsequent requests use the session automatically
```

---

## Rate Limit Headers

Every response includes:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1641234567
```

On rate limit error (429):

```
Retry-After: 60
```

---

## Error Handling

### Common Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response |
| 201 | Created | Get resource location |
| 400 | Bad Request | Fix request body |
| 401 | Unauthorized | Login again |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Verify resource ID |
| 429 | Too Many Requests | Retry after delay |
| 500 | Server Error | Contact support |

### Error Handling Pattern

```typescript
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = error.retryAfter || 60;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return fetch(url, options); // Retry
    }

    // Handle unauthorized
    if (response.status === 401) {
      window.location.href = '/auth/login';
      return;
    }

    throw new Error(error.error || 'Request failed');
  }

  return await response.json();
} catch (error) {
  console.error('API error:', error);
  throw error;
}
```

---

## Testing

### Using cURL

```bash
# Get plans (no auth)
curl https://doctormx.com/api/subscriptions/plans

# Get profile (requires auth cookie)
curl https://doctormx.com/api/patient/profile \
  --cookie "sb-access-token=YOUR_TOKEN"

# Create appointment (requires auth)
curl -X POST https://doctormx.com/api/appointments \
  --cookie "sb-access-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"doctorId":"uuid","date":"2026-03-15","time":"14:30"}'
```

### Using Postman

1. Import the Postman collection: `/docs/api/postman_collection.json`
2. Set environment variables:
   - `baseUrl`: `https://doctormx.com/api`
   - `accessToken`: Your session token
3. Use the "Doctor.mx API" collection for testing

---

## Webhooks

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://doctormx.com/api/webhooks/stripe`
3. Select events to listen for
4. Copy webhook secret to environment variables

**Events to subscribe to:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.succeeded` (OXXO)
- `charge.failed` (OXXO)
- `customer.subscription.*`
- `invoice.payment_*`

### Verifying Webhooks

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const signature = request.headers.get('stripe-signature')
const payload = await request.text()

try {
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    webhookSecret
  )

  // Process event
  console.log('Event type:', event.type)
} catch (error) {
  console.error('Webhook signature verification failed')
  return new Response('Invalid signature', { status: 400 })
}
```

---

## SDK Usage

### JavaScript/TypeScript

```typescript
import { DoctorMXClient } from '@doctormx/sdk'

const client = new DoctorMXClient({
  baseUrl: 'https://doctormx.com/api',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

// Get plans
const plans = await client.subscriptions.getPlans()

// Create appointment
const appointment = await client.appointments.create({
  doctorId: '...',
  date: '2026-03-15',
  time: '14:30'
})

// AI consultation
const result = await client.ai.consult({
  messages: [
    { role: 'user', content: 'Tengo dolor de cabeza...' }
  ]
})
```

---

## Best Practices

### 1. Rate Limiting
- Implement exponential backoff for retries
- Cache responses when appropriate
- Use premium tier for higher limits

### 2. Error Handling
- Always check response status
- Handle rate limit errors gracefully
- Log errors for debugging

### 3. Authentication
- Store session tokens securely
- Refresh tokens before expiration
- Handle session expiration gracefully

### 4. Webhooks
- Verify webhook signatures
- Process events asynchronously
- Implement idempotency for retries

### 5. Data Validation
- Validate request bodies before sending
- Use TypeScript schemas when available
- Handle validation errors on client

---

## Support & Resources

| Resource | URL |
|----------|-----|
| Full Documentation | `/docs/api/README.md` |
| Endpoints Summary | `/docs/api/ENDPOINTS_SUMMARY.md` |
| OpenAPI Spec | `/docs/api/openapi.yaml` |
| Postman Collection | `/docs/api/postman_collection.json` |
| Email Support | api@doctormx.com |
| Status Page | https://status.doctormx.com |

---

## Quick Links

- 📖 [Full API Documentation](./README.md)
- 📋 [Endpoints Summary](./ENDPOINTS_SUMMARY.md)
- 🔧 [OpenAPI Specification](./openapi.yaml)
- 📮 [Postman Collection](./postman_collection.json)
- 🚀 [Getting Started Guide](../operations/DEPLOYMENT_GUIDE.md)

---

**Last Updated:** 2026-02-09
**API Version:** 1.0.0
