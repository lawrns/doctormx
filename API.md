# Doctor.mx API Documentation

Complete API reference for the Doctor.mx WhatsApp-first telemedicine platform.

## Table of Contents

- [Authentication](#authentication)
- [Public Endpoints](#public-endpoints)
- [Doctor Endpoints](#doctor-endpoints)
- [Pharmacy Endpoints](#pharmacy-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [WhatsApp Webhook](#whatsapp-webhook)
- [Data Models](#data-models)

---

## Authentication

All authenticated endpoints require a valid JWT token from Supabase Auth.

```
Authorization: Bearer <token>
```

---

## Public Endpoints

### POST /api/consults

Create a new consultation (from web or WhatsApp).

**Request:**
```json
{
  "patient_id": "uuid",
  "channel": "whatsapp|web",
  "specialty_hint": "string?"
}
```

**Response:**
```json
{
  "consult_id": "uuid",
  "price_mxn": 79,
  "status": "triage"
}
```

### POST /api/payments/checkout

Start payment checkout.

**Request:**
```json
{
  "consult_id": "uuid",
  "provider": "stripe|conekta|openpay",
  "method": "card|spei|oxxo|codi",
  "apply_credits": true
}
```

**Response:**
```json
{
  "payment_id": "uuid",
  "redirect_url": "string?",
  "amount_mxn": 79,
  "status": "requires_action|succeeded"
}
```

### GET /api/receipt/:id

Get shareable receipt with savings and CFDI.

**Response:**
```json
{
  "consult_id": "uuid",
  "patient_name": "string",
  "amount_mxn": 79,
  "savings": {
    "vs_presencial": 420,
    "vs_er": 2580
  },
  "cfdi": {
    "folio": "string",
    "uuid": "string",
    "pdf_url": "string"
  },
  "share_url": "string"
}
```

### POST /api/chat

AI-powered triage chat (existing endpoint).

**Request:**
```json
{
  "message": "string",
  "history": [],
  "intake": {}
}
```

**Response:**
```json
{
  "careLevel": "PRIMARY|ER",
  "redFlags": {},
  "message": "string"
}
```

---

## Doctor Endpoints

### POST /api/connect/verify

Submit doctor verification documents.

**Request:**
```json
{
  "cedula": "string",
  "docs": ["url1", "url2"]
}
```

**Response:**
```json
{
  "status": "pending|verified|rejected",
  "message": "string"
}
```

### GET /api/connect/consults

Get doctor's inbox with filters.

**Query Params:**
- `status`: triage|assigned|active|resolved
- `specialty`: string
- `limit`: number (default: 50)
- `offset`: number (default: 0)

**Response:**
```json
{
  "consults": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "patient_name": "string",
      "status": "assigned",
      "specialty": "Dermatología",
      "triage": {},
      "red_flags": [],
      "created_at": "timestamp"
    }
  ],
  "total": 123
}
```

### POST /api/connect/notes

Add NOM-004 compliant notes to consultation.

**Request:**
```json
{
  "consult_id": "uuid",
  "note": "richtext"
}
```

**Response:**
```json
{
  "success": true,
  "note_id": "uuid"
}
```

### POST /api/connect/erx

Issue electronic prescription.

**Request:**
```json
{
  "consult_id": "uuid",
  "items": [
    {
      "drug": "Paracetamol",
      "dose": "500mg",
      "freq": "Cada 8 horas",
      "days": 5,
      "instructions": "Tomar con alimentos"
    }
  ],
  "controlled": false,
  "notes": "string?"
}
```

**Response:**
```json
{
  "erx_id": "uuid",
  "qr_token": "ERX-xxxxxxxxxxxxx",
  "pdf_url": "string",
  "xml_url": "string",
  "status": "issued"
}
```

### POST /api/connect/payouts

Register or refresh payout account for doctor.

**Request:**
```json
{
  "bank": "string",
  "clabe": "string",
  "account_holder": "string"
}
```

**Response:**
```json
{
  "success": true,
  "payout_account_id": "string"
}
```

---

## Pharmacy Endpoints

### POST /api/pharmacy/claim

Claim prescription using QR token.

**Request:**
```json
{
  "qr_token": "ERX-xxxxxxxxxxxxx",
  "store_id": "PILOTO-001"
}
```

**Response:**
```json
{
  "fill_id": "uuid",
  "erx": {
    "id": "uuid",
    "patient_name": "string",
    "medications": [],
    "doctor": {}
  },
  "status": "received"
}
```

### POST /api/pharmacy/status

Update prescription fill status.

**Request:**
```json
{
  "erx_id": "uuid",
  "status": "received|ready|delivered",
  "prices": {
    "subtotal": 250,
    "discount": 25,
    "total": 225
  }?,
  "delivery_eta_minutes": 45?
}
```

**Response:**
```json
{
  "success": true,
  "updated_at": "timestamp"
}
```

### GET /api/pharmacy/analytics

Get pharmacy performance analytics.

**Query Params:**
- `period`: day|week|month|year
- `store_id`: string

**Response:**
```json
{
  "total_scans": 150,
  "total_consults_referred": 45,
  "total_fills": 120,
  "gmv": 28500,
  "adherence_rate": 0.85,
  "leaderboard_position": 3,
  "top_medications": [
    {"drug": "Paracetamol", "count": 25},
    {"drug": "Amoxicilina", "count": 18}
  ]
}
```

---

## Admin Endpoints

### GET /api/admin/leaderboards

Get leaderboards for pharmacies, doctors, and referrers.

**Query Params:**
- `type`: pharmacy|doctor|referrer
- `metric`: fills|gmv|consults|rating
- `period`: week|month|all

**Response:**
```json
{
  "leaderboard": [
    {
      "id": "uuid",
      "name": "Farmacia Piloto Centro",
      "metric_value": 150,
      "rank": 1,
      "change": "+5"
    }
  ]
}
```

### POST /api/admin/sla/refund

Auto-refund for Fast-Pass SLA miss.

**Request:**
```json
{
  "consult_id": "uuid",
  "reason": "sla_missed_48h"
}
```

**Response:**
```json
{
  "refund_id": "uuid",
  "amount_mxn": 79,
  "status": "succeeded"
}
```

---

## WhatsApp Webhook

### GET /api/whatsapp/webhook

Webhook verification endpoint for Meta.

**Query Params:**
- `hub.mode`: subscribe
- `hub.verify_token`: your-verify-token
- `hub.challenge`: string

**Response:**
```
hub.challenge (plain text)
```

### POST /api/whatsapp/webhook

Handle incoming WhatsApp messages and status updates.

**Request:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "string",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {},
            "messages": [
              {
                "from": "525512345678",
                "id": "wamid.xxx",
                "timestamp": "1234567890",
                "text": {
                  "body": "Hola"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true
}
```

**Event Types:**
- `message`: New message from user
- `status`: Message delivery status update
- `template`: Template message sent

---

## Health & Monitoring

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "online",
  "timestamp": "2025-10-14T12:00:00Z",
  "services": {
    "database": "healthy",
    "whatsapp": "healthy",
    "openai": "healthy"
  }
}
```

### GET /api/whatsapp/status

WhatsApp service status.

**Response:**
```json
{
  "status": "online",
  "activeSessions": 15,
  "timestamp": "2025-10-14T12:00:00Z"
}
```

---

## Data Models

### User
```typescript
{
  id: uuid;
  role: 'patient' | 'doctor' | 'admin' | 'pharmacy';
  phone: string;
  email: string;
  name: string;
  whatsapp_optin: boolean;
  created_at: timestamp;
}
```

### Doctor
```typescript
{
  user_id: uuid;
  cedula: string;
  specialties: string[];
  license_status: 'pending' | 'verified' | 'rejected';
  kpis: object;
  payout_account: object;
  calendar: object;
  bio: string;
  avg_response_sec: number;
  rating_avg: number;
}
```

### Consult
```typescript
{
  id: uuid;
  patient_id: uuid;
  doctor_id: uuid;
  channel: 'whatsapp' | 'web' | 'video';
  status: 'triage' | 'assigned' | 'active' | 'resolved' | 'er_redirect' | 'cancelled';
  price_mxn: number;
  paid: boolean;
  specialty: string;
  red_flags: string[];
  triage: object;
  notes: object;
  started_at: timestamp;
  ended_at: timestamp;
}
```

### E-Prescription (erx)
```typescript
{
  id: uuid;
  consult_id: uuid;
  doctor_id: uuid;
  patient_id: uuid;
  payload: {
    medications: Array<{
      drug: string;
      dose: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    notes: string;
    diagnosis: string;
  };
  controlled: boolean;
  status: 'issued' | 'routed' | 'filled' | 'cancelled';
  pdf_url: string;
  xml_url: string;
  qr_token: string;
}
```

### Payment
```typescript
{
  id: uuid;
  consult_id: uuid;
  provider: 'stripe' | 'conekta' | 'openpay';
  method: 'card' | 'spei' | 'oxxo' | 'codi';
  amount_mxn: number;
  fee_split: {
    patient_paid: number;
    credits_used: number;
    platform_fee: number;
    doctor_payout: number;
  };
  status: 'requires_action' | 'succeeded' | 'refunded' | 'failed';
  cfdi: object;
  provider_payment_id: string;
}
```

---

## Error Codes

- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `422` - Unprocessable Entity (validation failed)
- `500` - Internal Server Error
- `503` - Service Unavailable

**Error Response Format:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## Rate Limits

- Public endpoints: 100 requests/minute per IP
- Authenticated endpoints: 1000 requests/minute per user
- WhatsApp webhook: No limit (verified by signature)

---

## Webhooks & Events

Doctor.mx can send webhooks for important events:

- `consult.created`
- `consult.assigned`
- `consult.completed`
- `payment.succeeded`
- `payment.failed`
- `erx.issued`
- `erx.filled`
- `referral.completed`

Configure webhook URL in dashboard settings.

---

## SDK & Libraries

**JavaScript/TypeScript:**
```bash
npm install @doctor-mx/sdk
```

**Python:**
```bash
pip install doctor-mx
```

**Example:**
```typescript
import DoctorMX from '@doctor-mx/sdk';

const client = new DoctorMX({
  apiKey: process.env.DOCTOR_MX_API_KEY
});

const consult = await client.consults.create({
  patient_id: 'xxx',
  channel: 'whatsapp'
});
```

---

## Support

- **Documentation:** https://docs.doctor.mx
- **API Status:** https://status.doctor.mx
- **Support Email:** api@doctor.mx
- **Slack Community:** https://doctor-mx.slack.com

---

**Last Updated:** October 14, 2025
**API Version:** v1.0
