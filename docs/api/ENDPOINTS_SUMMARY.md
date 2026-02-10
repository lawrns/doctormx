# Doctor.mx API - Endpoints Summary

## Overview

Complete listing of all API endpoints available in the Doctor.mx platform, organized by category.

## Base URL

- **Production**: `https://doctormx.com/api`
- **Staging**: `https://staging.doctormx.com/api`
- **Local**: `http://localhost:3000/api`

---

## Authentication (`/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/login` | No | User login |
| POST | `/auth/register` | No | User registration |
| POST | `/auth/reset-password` | No | Request password reset |
| POST | `/auth/verify` | No | Verify email/token |

**Rate Limits:**
- Login: 5 requests / 5 minutes
- Register: 3 requests / 5 minutes
- Reset Password: 3 requests / 1 hour
- Verify: 10 requests / 5 minutes

---

## Appointments (`/appointments`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/appointments` | Yes | Patient | Create new appointment |
| POST | `/appointments/{id}/cancel` | Yes | Patient/Doctor | Cancel appointment |
| GET | `/appointments/{id}/video` | Yes | Patient/Doctor | Get video consultation URL |

**Rate Limits:**
- Create: 50 requests / 1 minute
- Cancel/Video: 100 requests / 1 minute

**Security Note:**
- Patient ID is obtained exclusively from authenticated session, never from request body
- Prevents booking fraud and unauthorized access

---

## AI Consultation (`/ai`)

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| POST | `/ai/consult` | Yes | 20/min (100 Premium) | Conversational AI consultation |
| POST | `/ai/copilot/diagnosis` | Yes (Doctor) | 30/min | Get diagnosis suggestions |
| POST | `/ai/copilot/suggestions` | Yes (Doctor) | 30/min | Get treatment suggestions |
| POST | `/ai/copilot/summary` | Yes (Doctor) | 30/min | Generate consultation summary |
| POST | `/ai/vision/analyze` | Yes | 15/min | Analyze medical image |
| GET | `/ai/vision/result/{id}` | Yes | 100/min | Get image analysis result |
| POST | `/ai/transcription` | Yes | 10/min | Transcribe consultation audio |
| POST | `/ai/followup` | Yes | 10/min | Generate follow-up plan |
| POST | `/ai/preconsulta` | Yes | 20/min | Pre-consultation AI chat |
| POST | `/ai/questionnaire` | Yes | 10/min | AI-powered questionnaire |
| POST | `/ai/quota` | Yes | 100/min | Check AI usage quota |
| POST | `/ai/structure-soap` | Yes (Doctor) | 30/min | Structure SOAP notes |

**AI Consult Features:**
- Multi-specialist consultation (4 specialists in parallel)
- Dynamic specialist selection based on symptoms
- Red flag (emergency) detection
- RAG (Retrieval-Augmented Generation) with medical knowledge base
- Medical source citations
- Urgency level assessment
- Treatment recommendations

**AI Copilot Features:**
- Diagnosis suggestions with confidence scores
- Treatment recommendations
- Consultation summarization
- SOAP note structuring

---

## SOAP Consultation (`/soap`)

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| POST | `/soap/consult` | Yes | 20/min | SOAP consultation |
| POST | `/soap/stream` | Yes | 20/min | SOAP consultation with SSE streaming |
| GET | `/soap/consult/{id}` | Yes | 100/min | Get SOAP consultation result |

**SOAP Stream Features:**
- 4 specialists in parallel (GP, Dermatologist, Internist, Psychiatrist)
- Server-Sent Events (SSE) for real-time updates
- 60-second timeout (extended)
- Full SOAP note generation
- Consensus building
- Treatment planning

---

## Prescriptions (`/prescriptions`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/prescriptions` | Yes | Doctor | Create prescription |
| POST | `/prescriptions/preview` | Yes (Doctor) | Doctor | Preview prescription |
| POST | `/prescriptions/send` | Yes (Doctor) | Doctor | Send prescription to patient |
| GET | `/prescriptions/{id}/pdf` | Yes | Doctor/Patient | Download prescription PDF |
| POST | `/prescriptions/{id}/send` | Yes | Doctor | Send specific prescription |

---

## Patient Management (`/patient`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/patient/profile` | Yes | Patient | Get patient profile |
| PUT | `/patient/profile` | Yes | Patient | Update patient profile |
| GET | `/patient/medical-history` | Yes | Patient | Get medical history |
| GET | `/patient/appointments` | Yes | Patient | Get patient appointments |

**Rate Limits:**
- Profile (GET): 100 requests / 1 minute
- Profile (PUT): 50 requests / 1 minute
- Medical History: 100 requests / 1 minute
- Appointments: 100 requests / 1 minute

---

## Doctor Management (`/doctor`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/doctor/availability` | Yes | Doctor | Set availability |
| POST | `/doctor/onboarding` | Yes | Doctor | Complete onboarding |
| GET | `/doctor/badges` | Yes | Doctor | Get doctor badges |
| POST | `/doctor/verify-cedula` | Yes | Doctor | Verify medical license |
| GET | `/doctor/analytics/ai-referrals` | Yes | Doctor | Get AI referral analytics |

---

## Directory (`/directory`, `/doctors`)

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| GET | `/directory/recommended` | No | 50/min | Get recommended doctors |
| GET | `/directory/profiles/{id}` | No | 100/min | Get doctor public profile |
| POST | `/directory/claim` | Yes | 10/min | Claim doctor profile |
| POST | `/directory/claim/{id}/verify` | Yes | 10/min | Verify profile claim |
| GET | `/doctors/{id}` | No | 100/min | Get doctor profile |
| GET | `/doctors/{id}/available-dates` | No | 100/min | Get available dates |
| GET | `/doctors/{id}/slots` | No | 100/min | Get time slots |

---

## Questionnaire (`/questionnaire`)

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| POST | `/questionnaire/start` | Yes | 10/min | Start adaptive questionnaire |
| POST | `/questionnaire/message` | Yes | 20/min | Send questionnaire answer |
| GET | `/questionnaire/{id}/state` | Yes | 100/min | Get questionnaire state |
| POST | `/questionnaire/{id}/complete` | Yes | 10/min | Mark questionnaire complete |
| GET | `/questionnaire/{id}/summary` | Yes | 100/min | Get questionnaire summary |
| POST | `/questionnaire/{id}/upload` | Yes | 10/min | Upload questionnaire file |

**Adaptive Questionnaire Features:**
- Dynamic question flow based on previous answers
- Specialized for medical consultations
- Supports multiple question types (choice, text, scale, multiple)
- Automatic triage based on responses

---

## Payments & Subscriptions (`/subscriptions`, `/premium`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/subscriptions/plans` | No | - | Get subscription plans |
| GET | `/subscriptions` | Yes | Doctor | Get current subscription |
| POST | `/subscriptions/upgrade` | Yes | Doctor | Upgrade subscription |
| GET | `/subscriptions/usage` | Yes | Doctor | Get usage statistics |
| GET | `/subscriptions/usage/ai` | Yes | Doctor | Get AI usage |
| GET | `/subscriptions/usage/image` | Yes | Doctor | Get image analysis usage |
| GET | `/subscriptions/usage/whatsapp` | Yes | Doctor | Get WhatsApp usage |
| POST | `/premium/checkout` | Yes | Doctor | Start premium checkout |
| POST | `/premium/purchase` | Yes | Doctor | Complete purchase |
| GET | `/premium/status` | Yes | Doctor | Get premium status |
| GET | `/premium/usage` | Yes | Doctor | Get premium usage |
| POST | `/premium/bill` | Yes | Doctor | Get billing info |

**Payment Endpoints:**
| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| POST | `/create-payment-intent` | Yes | 10/min | Create payment intent |
| POST | `/confirm-payment` | Yes | 10/min | Confirm payment |

---

## Webhooks (`/webhooks`)

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| POST | `/webhooks/stripe` | 100/min | Stripe payment webhooks |
| POST | `/webhooks/twilio` | 100/min | Twilio SMS/WhatsApp webhooks |
| POST | `/webhooks/whatsapp` | 100/min | WhatsApp message webhooks |
| POST | `/followups/callback` | 100/min | Follow-up callback webhook |
| POST | `/pharmacy/webhook` | 100/min | Pharmacy partnership webhook |

**Stripe Webhook Events:**
- `payment_intent.succeeded` - Card payment successful
- `payment_intent.payment_failed` - Card payment failed
- `payment_intent.canceled` - Payment canceled
- `charge.succeeded` - OXXO payment successful
- `charge.failed` - OXXO payment failed
- `checkout.session.completed` - Subscription checkout
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Subscription renewed
- `invoice.payment_failed` - Subscription renewal failed

---

## Analytics (`/analytics`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/analytics/admin` | Yes | Admin | Admin dashboard metrics |
| GET | `/analytics/doctor` | Yes | Doctor | Doctor performance metrics |
| GET | `/analytics/export` | Yes | Admin | Export analytics data |
| GET | `/analytics/revenue` | Yes | Admin | Revenue analytics |

---

## Chat (`/chat`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/chat/conversations` | Yes | List conversations |
| POST | `/chat/conversations` | Yes | Create conversation |
| GET | `/chat/conversations/{id}` | Yes | Get conversation details |
| POST | `/chat/messages` | Yes | Send message |
| POST | `/chat/messages/{id}/read` | Yes | Mark message as read |

---

## Notifications (`/notifications`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/notifications/email/appointment-confirmed` | Yes | Send appointment confirmation |
| POST | `/notifications/email/followup` | Yes | Send follow-up email |
| POST | `/notifications/email/payment-receipt` | Yes | Send payment receipt |
| POST | `/notifications/email/reminder` | Yes | Send appointment reminder |

---

## Second Opinion (`/second-opinion`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/second-opinion` | Yes | Request second opinion |
| GET | `/second-opinion/{id}` | Yes | Get second opinion status |
| POST | `/second-opinion/{id}/documents` | Yes | Upload documents |
| POST | `/second-opinion/{id}/submit` | Yes | Submit second opinion request |

---

## Reviews (`/reviews`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/reviews` | Yes | Create review |
| GET | `/reviews/{id}` | No | Get review details |

---

## Referrals (`/referrals`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/referrals` | Yes | Get referrals |
| POST | `/referrals` | Yes | Create referral |
| GET | `/referrals/{id}` | Yes | Get referral details |

---

## Pharmacy Partnerships (`/pharmacy`)

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| POST | `/pharmacy/affiliate` | Yes | 10/min | Register as pharmacy partner |
| GET | `/pharmacy/earnings` | Yes | 30/min | Get pharmacy earnings |
| POST | `/pharmacy/recommend` | Yes | 20/min | Recommend medication |
| POST | `/pharmacy/refer` | Yes | 10/min | Refer patient to pharmacy |
| GET | `/pharmacy/search` | Yes | 30/min | Search medications |
| GET | `/pharmacy/sponsors` | No | 100/min | Get pharmacy sponsors |

---

## Triage (`/triage`)

| Method | Endpoint | Auth Required | Rate Limit | Description |
|--------|----------|---------------|------------|-------------|
| POST | `/triage` | Yes | 10/min | AI-powered triage assessment |

---

## System (`/cache`, `/user`, `/admin`, `/cron`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/cache/stats` | Yes | Admin | Get cache statistics |
| POST | `/cache/invalidate` | Yes | Admin | Invalidate cache |
| GET | `/user/quota` | Yes | - | Check user quota |
| POST | `/admin/premium` | Yes | Admin | Grant premium access |
| POST | `/admin/verify-doctor` | Yes | Admin | Verify doctor credentials |
| GET | `/admin/ai/metrics` | Yes | Admin | Get AI usage metrics |
| POST | `/admin/followups/verify` | Yes | Admin | Verify follow-up |
| POST | `/cron/followups` | System | - | Scheduled follow-up job |

---

## Consultation Notes (`/consultation-notes`, `/soap-notes`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/consultation-notes` | Yes | Doctor | Get consultation notes |
| GET | `/soap-notes/generate` | Yes | Doctor | Generate SOAP notes |
| POST | `/soap-notes/from-consultation` | Yes | Doctor | Create notes from consultation |
| POST | `/soap-notes/{id}/approve` | Yes | Doctor | Approve SOAP notes |

---

## Upload (`/upload`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/upload/avatar` | Yes | Upload avatar image |

---

## Anonymous (`/anonymous`)

| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| POST | `/anonymous/capture-email` | 5/min | Capture email for lead generation |

---

## Rate Limiting Tiers

### Authentication Endpoints
- **Login**: 5 requests / 5 minutes
- **Register**: 3 requests / 5 minutes
- **Reset Password**: 3 requests / 1 hour
- **Verify**: 10 requests / 5 minutes

### AI Endpoints
- **Consult**: 20 requests / 1 minute (100 for Premium)
- **Vision**: 15 requests / 1 minute
- **Transcription**: 10 requests / 1 minute
- **Copilot**: 30 requests / 1 minute
- **General AI**: 20 requests / 1 minute

### API Endpoints
- **Read Operations**: 200 requests / 1 minute
- **Write Operations**: 50 requests / 1 minute
- **Premium Users**: 500 requests / 1 minute

### Payment Endpoints
- **Create Payment**: 10 requests / 1 minute
- **Webhooks**: 100 requests / 1 minute

### General Endpoints
- **Standard**: 100 requests / 1 minute

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Response Headers

All API responses include the following headers when applicable:

```
X-RateLimit-Limit: <number>          # Total requests allowed
X-RateLimit-Remaining: <number>      # Requests remaining in window
X-RateLimit-Reset: <timestamp>       # Unix timestamp when limit resets
```

For rate limit errors (429):

```
Retry-After: <seconds>               # Seconds until retry is allowed
```

---

## Authentication & Authorization

### Session Management
- Authentication via Supabase session cookies
- Automatic token refresh
- Session timeout: 1 hour of inactivity

### Role-Based Access Control (RBAC)
- **patient**: Access to patient-specific endpoints
- **doctor**: Access to doctor-specific endpoints
- **admin**: Access to administrative endpoints

### Security Features
- CSRF protection for state-changing operations
- Rate limiting by IP and user ID
- Input validation with Zod schemas
- SQL injection prevention
- XSS protection

---

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available in:
- **YAML**: `/docs/api/openapi.yaml`
- **Postman Collection**: `/docs/api/postman_collection.json`

---

## Support & Resources

- **API Documentation**: `/docs/api/README.md`
- **Email**: api@doctormx.com
- **Status Page**: https://status.doctormx.com
- **Swagger UI**: Available at `/api/docs` (when deployed)

---

## Changelog

### v1.0.0 (2026-02-09)
- Initial API release
- 100+ endpoints across 15 categories
- Multi-specialist AI consultation
- Adaptive questionnaires
- Payment processing (Stripe, OXXO)
- Webhook integrations
- Rate limiting implementation
