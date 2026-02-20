# Doctor.mx API Documentation

## Overview

Complete OpenAPI 3.0.3 specification for the Doctor.mx telemedicine platform.

## Statistics

| Metric | Count |
|--------|-------|
| Total Endpoints | 132 |
| HTTP Methods | 144 |
| Categories | 29 |
| Schemas | 40+ |

## Quick Links

- **Interactive Documentation**: Open `index.html` in a browser or serve it with any static file server
- **OpenAPI Spec**: `../../openapi.yaml`

## API Categories

### Core Features
- **Health** - System health monitoring
- **Doctores** - Doctor directory and profiles
- **Appointments** - Appointment scheduling
- **Patients** - Patient profiles and medical history

### AI Services
- **AI** - AI-powered consultations, transcription, vision analysis
- **SOAP Notes** - Medical notes in SOAP format
- **Triage** - Emergency symptom evaluation
- **Questionnaire** - Adaptive medical questionnaires

### Medical Records
- **Consultation** - Consultation notes
- **Prescriptions** - Digital prescriptions
- **Second Opinion** - Second opinion requests
- **Referrals** - Doctor-to-doctor referrals

### Communication
- **Chat** - Patient-doctor messaging
- **Notifications** - Email notifications

### Compliance & Privacy
- **ARCO** - Data subject rights (Access, Rectification, Cancellation, Opposition)
- **Consent** - Consent management
- **Digital Signature** - Digital signatures for medical documents

### Payments & Subscriptions
- **Payments** - Stripe payment processing
- **Subscriptions** - Doctor subscription plans
- **Premium** - Premium features access

### Administration
- **Admin** - Administrative functions
- **Analytics** - Usage analytics and reporting
- **Cache** - Cache management

### Integrations
- **Pharmacy** - Pharmacy search and price comparison
- **Webhooks** - Stripe, Twilio, WhatsApp webhooks

## Authentication

The API uses Supabase Auth with Bearer tokens:

```
Authorization: Bearer <jwt_token>
```

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Viewing the Documentation

### Option 1: Direct File
Open `docs/api/index.html` directly in your browser (some browsers may block local file access to YAML).

### Option 2: Simple HTTP Server
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

Then navigate to `http://localhost:8080/docs/api/`

### Option 3: VS Code Extension
Install the "OpenAPI (Swagger) Editor" extension for VS Code to preview the YAML file.

## Validation

You can validate the OpenAPI spec using:

```bash
# Using swagger-cli (npm install -g swagger-cli)
swagger-cli validate openapi.yaml

# Using openapi-generator (npm install -g @openapitools/openapi-generator-cli)
openapi-generator-cli validate -i openapi.yaml
```

## Generating Client SDKs

```bash
# Generate TypeScript client
openapi-generator-cli generate -i openapi.yaml -g typescript-fetch -o ./sdk/typescript

# Generate Python client
openapi-generator-cli generate -i openapi.yaml -g python -o ./sdk/python

# Generate Go client
openapi-generator-cli generate -i openapi.yaml -g go -o ./sdk/go
```

## API Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-16 | Initial OpenAPI 3.0.3 specification |

## Support

For API support, contact: soporte@doctor.mx
