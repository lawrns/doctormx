# Error Handler Integration Guide

This guide shows how to integrate the global error handler into existing Doctor.mx API routes.

## Quick Migration

### Before (Without Error Handler)

```typescript
// src/app/api/ai/consult/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Manual error checking
    if (!body.symptoms) {
      return NextResponse.json(
        { error: 'Symptoms are required' },
        { status: 400 }
      );
    }

    // Some operation
    const result = await analyzeSymptoms(body.symptoms);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### After (With Error Handler)

```typescript
// src/app/api/ai/consult/route.ts
import { NextRequest } from 'next/server';
import {
  handleError,
  ValidationError,
  EmergencyDetectedError,
  ERROR_CODES
} from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Use ValidationError for validation
    if (!body.symptoms) {
      throw new ValidationError(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        'Symptoms are required',
        'symptoms'
      );
    }

    // Check for emergencies
    const emergencyCheck = await checkForEmergencies(body.symptoms);
    if (emergencyCheck.detected) {
      throw new EmergencyDetectedError(
        ERROR_CODES.EMERGENCY_DETECTED,
        'Critical symptoms detected',
        emergencyCheck.severity,
        emergencyCheck.symptoms
      );
    }

    const result = await analyzeSymptoms(body.symptoms);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Automatic error handling with context
    return handleError(error, {
      route: '/api/ai/consult',
      method: 'POST',
      userId: body.userId
    });
  }
}
```

## Migration Checklist

### 1. Replace Manual Error Returns

**Find:**
```typescript
return NextResponse.json({ error: 'message' }, { status: 400 });
```

**Replace with:**
```typescript
throw new ValidationError(ERROR_CODES.INVALID_INPUT, 'message');
```

### 2. Add Error Handler to Try/Catch

**Find:**
```typescript
} catch (error) {
  console.error(error);
  return NextResponse.json({ error: 'Error' }, { status: 500 });
}
```

**Replace with:**
```typescript
} catch (error) {
  return handleError(error, {
    route: '/api/your-route',
    method: 'POST'
  });
}
```

### 3. Use Specific Error Types

| Scenario | Error Class | Example |
|----------|-------------|---------|
| Authentication fails | `AuthenticationError` | `throw new AuthenticationError(ERROR_CODES.AUTH_INVALID_CREDENTIALS, 'Invalid credentials')` |
| Permission denied | `AuthorizationError` | `throw new AuthorizationError(ERROR_CODES.ACCESS_DENIED, 'Not allowed')` |
| Input validation | `ValidationError` | `throw new ValidationError(ERROR_CODES.INVALID_FORMAT, 'Invalid email', 'email')` |
| Resource not found | `NotFoundError` | `throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, 'User not found', 'User', userId)` |
| Rate limit | `RateLimitError` | `throw new RateLimitError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many requests', 60, 10)` |
| Emergency detected | `EmergencyDetectedError` | `throw new EmergencyDetectedError(ERROR_CODES.EMERGENCY_DETECTED, 'Emergency', 'critical', ['chest pain'])` |
| Drug interaction | `PrescriptionError` | `throw new PrescriptionError(ERROR_CODES.DRUG_INTERACTION, 'Interaction detected', 'Ibuprofen', 'drug-drug')` |
| Appointment conflict | `AppointmentError` | `throw new AppointmentError(ERROR_CODES.APPOINTMENT_CONFLICT, 'Slot taken', doctorId, time, 'conflict')` |

## API Route Template

```typescript
// src/app/api/your-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleError, ValidationError, ERROR_CODES } from '@/lib/errors';
import { getSession } from '@/lib/auth';

// Context for error logging
const ERROR_CONTEXT = {
  route: '/api/your-route',
  method: 'POST'
};

export async function POST(request: NextRequest) {
  try {
    // 1. Get session
    const session = await getSession();
    if (!session?.user) {
      throw new AuthenticationError(
        ERROR_CODES.AUTH_UNAUTHORIZED,
        'Authentication required'
      );
    }

    // 2. Parse and validate input
    const body = await request.json();
    if (!body.requiredField) {
      throw new ValidationError(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        'requiredField is required',
        'requiredField'
      );
    }

    // 3. Perform operation
    const result = await yourBusinessLogic(body);

    // 4. Return success
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    // 5. Handle errors automatically
    return handleError(error, {
      ...ERROR_CONTEXT,
      userId: session?.user?.id
    });
  }
}
```

## Client-Side Integration

### React Component with Toast

```typescript
'use client';

import { useState } from 'react';
import { createToastError } from '@/lib/errors';
import { toast } from 'sonner';

export function MyForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(data))
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Error handler will format the error
        throw new Error(errorData.error?.message || 'Request failed');
      }

      const result = await response.json();
      toast.success('Operation successful');

    } catch (error) {
      // Create toast-friendly error object
      const toastError = createToastError(error);

      // Show appropriate toast based on variant
      if (toastError.variant === 'destructive') {
        toast.error(toastError.title, {
          description: toastError.description,
          duration: 10000 // Longer for critical errors
        });
      } else {
        toast.warning(toastError.title, {
          description: toastError.description
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Service Layer Integration

```typescript
// src/lib/services/ai-service.ts
import {
  EmergencyDetectedError,
  ExternalServiceError,
  ERROR_CODES
} from '@/lib/errors';

export class AIService {
  async analyzeSymptoms(symptoms: string[]) {
    try {
      const response = await fetch('https://ai-api.example.com/analyze', {
        method: 'POST',
        body: JSON.stringify({ symptoms })
      });

      if (!response.ok) {
        throw new ExternalServiceError(
          ERROR_CODES.AI_SERVICE_ERROR,
          'AI service unavailable',
          'AI Analysis Service'
        );
      }

      const result = await response.json();

      // Check for red flags
      if (result.redFlags?.length > 0) {
        throw new EmergencyDetectedError(
          ERROR_CODES.RED_FLAG_DETECTED,
          'Red flags detected in symptom analysis',
          result.severity,
          result.redFlags
        );
      }

      return result;

    } catch (error) {
      // Re-throw known errors
      if (error instanceof EmergencyDetectedError ||
          error instanceof ExternalServiceError) {
        throw error;
      }

      // Wrap unknown errors
      throw new ExternalServiceError(
        ERROR_CODES.AI_SERVICE_ERROR,
        'AI service failed',
        'AI Analysis Service',
        error as Error
      );
    }
  }
}
```

## Testing with Error Handler

```typescript
// src/app/api/__tests__/your-route.test.ts
import { describe, it, expect } from 'vitest';
import { POST } from '../route';
import { EmergencyDetectedError, ERROR_CODES } from '@/lib/errors';

describe('API Route', () => {
  it('should handle emergency detection', async () => {
    const request = new Request('http://localhost:3000/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({
        symptoms: ['chest pain', 'shortness of breath']
      })
    });

    const response = await POST(request as any);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error.code).toBe(ERROR_CODES.EMERGENCY_DETECTED);
    expect(json.error.requiresImmediateAction).toBe(true);
  });
});
```

## Common Error Patterns

### Pattern 1: Validation

```typescript
// Validate required fields
if (!body.email) {
  throw new ValidationError(
    ERROR_CODES.MISSING_REQUIRED_FIELD,
    'Email is required',
    'email'
  );
}

// Validate format
if (!isValidEmail(body.email)) {
  throw new ValidationError(
    ERROR_CODES.INVALID_FORMAT,
    'Invalid email format',
    'email'
  );
}
```

### Pattern 2: Resource Not Found

```typescript
const user = await getUserById(id);
if (!user) {
  throw new NotFoundError(
    ERROR_CODES.USER_NOT_FOUND,
    'User not found',
    'User',
    id
  );
}
```

### Pattern 3: Permission Check

```typescript
if (session.user.role !== 'doctor') {
  throw new AuthorizationError(
    ERROR_CODES.ROLE_REQUIRED,
    'This action requires doctor privileges',
    'doctor'
  );
}
```

### Pattern 4: Business Logic Error

```typescript
const appointment = await bookAppointment(data);
if (appointment.conflict) {
  throw new AppointmentError(
    ERROR_CODES.APPOINTMENT_CONFLICT,
    'Time slot already booked',
    data.doctorId,
    data.timeSlot,
    'conflict'
  );
}
```

## Full Example: Prescription Route

```typescript
// src/app/api/prescription/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  handleError,
  PrescriptionError,
  ValidationError,
  AuthenticationError,
  ERROR_CODES
} from '@/lib/errors';
import { getSession } from '@/lib/auth';
import { validateDrug } from '@/lib/pharmacy';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getSession();
    if (!session?.user) {
      throw new AuthenticationError(
        ERROR_CODES.AUTH_UNAUTHORIZED,
        'Authentication required'
      );
    }

    // Only doctors can prescribe
    if (session.user.role !== 'doctor') {
      throw new AuthenticationError(
        ERROR_CODES.ROLE_REQUIRED,
        'Only doctors can generate prescriptions'
      );
    }

    // Parse request
    const body = await request.json();
    const { patientId, medications } = body;

    // Validate input
    if (!patientId || !meditations?.length) {
      throw new ValidationError(
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        'Patient ID and medications are required'
      );
    }

    // Check each medication
    for (const med of medications) {
      const validation = await validateDrug(med, patientId);

      if (!validation.isValid) {
        if (validation.type === 'interaction') {
          throw new PrescriptionError(
            ERROR_CODES.DRUG_INTERACTION,
            `Interaction with ${validation.interactingDrug}`,
            med.name,
            'drug-drug'
          );
        }

        if (validation.type === 'allergy') {
          throw new PrescriptionError(
            ERROR_CODES.ALLERGY_ALERT,
            `Patient allergic to ${med.name}`,
            med.name,
            'drug-allergy'
          );
        }
      }
    }

    // Generate prescription
    const prescription = await generatePrescription({
      patientId,
      medications,
      doctorId: session.user.id
    });

    return NextResponse.json({
      success: true,
      data: prescription
    });

  } catch (error) {
    return handleError(error, {
      route: '/api/prescription/generate',
      method: 'POST',
      userId: session?.user?.id
    });
  }
}
```

## Benefits

1. **Consistent error responses** - All errors follow the same format
2. **Patient-friendly messages** - Spanish messages automatically selected
3. **Context-rich logging** - Every error includes route, user, timestamp
4. **Emergency handling** - Special handling for critical situations
5. **Type safety** - Full TypeScript support
6. **Easy testing** - Predictable error objects
7. **Better UX** - Toast-friendly error objects for UI
