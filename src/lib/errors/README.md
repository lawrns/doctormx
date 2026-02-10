# Global Error Handler System for Doctor.mx

Comprehensive error handling system with healthcare-specific error types, Spanish patient messages, and structured logging.

## Features

- **Healthcare-Specific Error Types**: Specialized classes for medical scenarios
- **Bilingual Messages**: Spanish for patients, English for developers
- **Emergency Detection**: Special handling for critical medical situations
- **Structured Logging**: Context-rich error logging for debugging
- **Type Safety**: Full TypeScript support with type guards
- **UI Integration**: Toast/notification friendly error objects

## Installation

The error handler is already installed in `src/lib/errors/`. Import from the index:

```typescript
import {
  EmergencyDetectedError,
  PrescriptionError,
  handleError,
  logError
} from '@/lib/errors';
```

## Error Types

### Base Error Class

```typescript
import { AppError } from '@/lib/errors';

const error = new AppError(
  'CUSTOM_001',  // Unique error code
  500,          // HTTP status code
  'Error message',
  true          // Is operational (expected) error
);
```

### Healthcare-Specific Errors

#### EmergencyDetectedError
Use when AI detects critical symptoms:

```typescript
throw new EmergencyDetectedError(
  ERROR_CODES.EMERGENCY_DETECTED,
  'Critical symptoms detected',
  'critical',              // severity: 'low' | 'medium' | 'high' | 'critical'
  ['chest pain', 'dyspnea'] // detected symptoms
);
```

#### PrescriptionError
Use for drug interactions, allergies, dosage issues:

```typescript
throw new PrescriptionError(
  ERROR_CODES.DRUG_INTERACTION,
  'Interaction detected',
  'Ibuprofen',              // drug name
  'drug-drug'               // interaction type
);
```

#### DiagnosisError
Use for low confidence or conflicting diagnoses:

```typescript
throw new DiagnosisError(
  ERROR_CODES.DIAGNOSIS_LOW_CONFIDENCE,
  'Insufficient data for diagnosis',
  0.45,                     // confidence score
  ['Flu', 'COVID-19']      // alternative diagnoses
);
```

#### AppointmentError
Use for booking conflicts and availability issues:

```typescript
throw new AppointmentError(
  ERROR_CODES.APPOINTMENT_CONFLICT,
  'Time slot unavailable',
  'doctor-123',             // doctor ID
  '2024-02-15T14:00:00Z',  // requested time
  'conflict'               // reason
);
```

### General Error Classes

- `AuthenticationError` - Login/session issues (401)
- `AuthorizationError` - Permission issues (403)
- `ValidationError` - Input validation (400)
- `NotFoundError` - Resource not found (404)
- `RateLimitError` - Rate limiting (429)
- `ExternalServiceError` - Third-party API failures (502)
- `ConsentError` - Privacy consent issues (403)
- `PaymentError` - Stripe/payment issues (402)
- `VideoConsultationError` - Video call issues (500)

## Usage Examples

### API Route Handler

```typescript
import { handleError, ERROR_CODES, AppointmentError } from '@/lib/errors';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const appointment = await bookAppointment(body);

    return NextResponse.json({ success: true, data: appointment });
  } catch (error) {
    return handleError(error, {
      userId: session?.user?.id,
      route: '/api/appointments/book',
      method: 'POST'
    });
  }
}
```

### Client-Side Error Handling

```typescript
'use client';

import { handleClientError, createToastError, ERROR_CODES } from '@/lib/errors';
import { toast } from 'sonner';

async function submitConsultation(data: ConsultationData) {
  try {
    const response = await fetch('/api/ai/consult', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Consultation failed');
    }

    return await response.json();
  } catch (error) {
    const toastError = createToastError(error);
    toast.error(toastError.title, {
      description: toastError.description
    });
  }
}
```

### Route Handler Wrapper

```typescript
import { createRouteHandler, ERROR_CODES } from '@/lib/errors';

const handler = createRouteHandler('/api/ai/consult', 'POST');

export async function POST(request: NextRequest) {
  return handler(async () => {
    // Your route logic here
    return NextResponse.json({ success: true });
  }, { userId: session?.user?.id });
}
```

### Assert Present Helper

```typescript
import { assertPresent, ValidationError, ERROR_CODES } from '@/lib/errors';

function processPatientData(data: PatientData | null) {
  assertPresent(data, 'patientData', 'NF_002');
  // TypeScript now knows data is not null
  console.log(data.name);
}
```

## Error Codes

All error codes are defined in `ERROR_CODES`:

```typescript
// Medical errors
MEDICAL_RECORD_ERROR = 'MED_001'
SYMPTOM_ANALYSIS_FAILED = 'MED_003'
RED_FLAG_DETECTED = 'MED_004'

// Emergency errors
EMERGENCY_DETECTED = 'EMG_001'
CRITICAL_SYMPTOMS = 'EMG_002'

// Prescription errors
PRESCRIPTION_GENERATION_FAILED = 'RX_001'
DRUG_INTERACTION = 'RX_002'
ALLERGY_ALERT = 'RX_004'

// And more...
```

## Error Messages

### Patient Messages (Spanish)

```typescript
import { getPatientMessage, ERROR_CODES } from '@/lib/errors';

const message = getPatientMessage(ERROR_CODES.EMERGENCY_DETECTED);
// "Según los síntomas que describe, podría requerir atención médica urgente."
```

### Developer Messages (English)

```typescript
import { getDeveloperMessage, ERROR_CODES } from '@/lib/errors';

const message = getDeveloperMessage(ERROR_CODES.EMERGENCY_DETECTED);
// "Emergency symptoms detected by AI"
```

## Logging

Errors are automatically logged with context:

```typescript
import { logError } from '@/lib/errors';

try {
  // Some operation
} catch (error) {
  logError(error, {
    userId: 'user-123',
    sessionId: 'session-456',
    route: '/api/ai/consult',
    method: 'POST',
    userAgent: request.headers.get('user-agent'),
    additionalData: { symptomCount: 5 }
  });
}
```

Log entry format:
```json
{
  "severity": "critical",
  "code": "EMG_001",
  "message": "Emergency symptoms detected",
  "stack": "...",
  "context": {
    "userId": "user-123",
    "route": "/api/ai/consult",
    "timestamp": "2024-02-10T10:30:00.000Z"
  },
  "isOperational": true
}
```

## Emergency Handling

Emergency errors receive special handling:

1. **Response includes emergency contact**:
```json
{
  "emergencyContact": {
    "phone": "911",
    "message": "Si sus síntomas son graves, llame al 911"
  }
}
```

2. **Automatic critical severity logging**
3. **No retry option for users**

## Testing

```typescript
import {
  EmergencyDetectedError,
  isEmergencyError,
  getPatientMessage
} from '@/lib/errors';

describe('Emergency handling', () => {
  it('should detect emergency errors', () => {
    const error = new EmergencyDetectedError(
      'EMG_001',
      'Emergency',
      'critical'
    );

    expect(isEmergencyError(error)).toBe(true);
  });

  it('should show patient-friendly message', () => {
    const message = getPatientMessage('EMG_001');
    expect(message).toContain('atención médica');
  });
});
```

## Best Practices

1. **Always use specific error types** - Don't use generic Error
2. **Include context in logs** - userId, route, sessionId, etc.
3. **Use operational errors for expected cases** - validation, conflicts
4. **Use non-operational for bugs** - unexpected failures
5. **Never expose internal details to patients** - Use getPatientMessage()
6. **Log everything** - All errors are logged automatically by handleError()
7. **Handle emergencies specially** - isEmergencyError() check

## Integration with Sentry/External Services

To integrate with external logging services, modify `logError()` in `handler.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

export function logError(error: unknown, context: ErrorContext = {}) {
  // ... existing logic ...

  // Send to Sentry
  if (typeof window === 'undefined') {
    Sentry.captureException(error, {
      user: { id: context.userId },
      tags: {
        route: context.route,
        method: context.method,
        errorCode: logEntry.code
      },
      extra: context.additionalData
    });
  }
}
```

## API Reference

### Classes
- `AppError` - Base error class
- `EmergencyDetectedError` - Emergency symptoms
- `PrescriptionError` - Drug issues
- `DiagnosisError` - AI confidence
- `AppointmentError` - Booking issues
- `AuthenticationError` - Login issues
- `AuthorizationError` - Permission issues
- `ValidationError` - Input validation
- `NotFoundError` - Missing resources
- `RateLimitError` - API limits
- `ExternalServiceError` - Third-party failures
- `ConsentError` - Privacy issues
- `PaymentError` - Payment processing
- `VideoConsultationError` - Video calls

### Functions
- `handleError(error, context)` - Main error handler, returns NextResponse
- `logError(error, context)` - Structured logging
- `handleClientError(error, context)` - Client-side handler
- `createToastError(error)` - UI-friendly error object
- `getErrorInfo(error)` - Error boundary info
- `isAppError(error)` - Type guard
- `assertPresent(value, field, code)` - Assertion helper
- `getPatientMessage(error)` - Spanish message
- `getDeveloperMessage(error)` - English message
- `isEmergencyError(error)` - Emergency check
