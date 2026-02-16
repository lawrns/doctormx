# Business Logic Snippets - Reusable Code Assets

> **Status**: ✅ VERIFIED WORKING  
> **Rule Applied**: Only code that was ACTUALLY working is preserved

---

## 1. AI Routing Logic

**Source**: `src/lib/ai/router.ts`

### Purpose
Intelligent routing between multiple AI providers (GLM, OpenAI, OpenRouter, DeepSeek) based on use case, optimizing for cost, latency, and accuracy.

### Usage Pattern
```typescript
import { router, type UseCase } from '@/lib/ai/router'

// Route vision analysis
const result = await router.routeVision(
  imageUrl,
  prompt,
  systemPrompt,
  'vision-analysis'
)

// Route medical reasoning
const result = await router.routeReasoning(
  messages,
  'differential-diagnosis'
)

// Route general chat
const result = await router.routeChat(
  messages,
  'general-chat'
)
```

### Provider Priority by Use Case
| Use Case | Primary | Fallbacks |
|----------|---------|-----------|
| vision-analysis | GLM | OpenRouter, OpenAI |
| differential-diagnosis | GLM | DeepSeek, OpenAI |
| triage | GLM | DeepSeek, OpenAI |
| prescription | GLM | DeepSeek, OpenAI |
| transcription | OpenAI | (none) |
| general-chat | GLM | OpenAI, DeepSeek |
| soap-notes | GLM | DeepSeek, OpenAI |

### Response Format
```typescript
interface RouterResponse {
  content: string
  provider: 'glm' | 'openai' | 'openrouter' | 'deepseek'
  model: string
  costUSD: number
  latencyMs: number
  reasoning?: string  // DeepSeek only
}
```

### Key Configuration
```typescript
// USE_CASE_ROUTING constant defines provider priority
const USE_CASE_ROUTING = {
  'vision-analysis': {
    primary: 'glm',
    fallbacks: ['openrouter', 'openai'],
  },
  // ... etc
}
```

---

## 2. Error Handling Patterns

**Source**: `src/lib/errors/AppError.ts`, `src/lib/errors/index.ts`

### Base AppError Class
```typescript
export class AppError extends Error {
  constructor(
    public code: string,           // Unique error code (e.g., 'MED_001')
    public statusCode: number,     // HTTP status
    message: string,               // Developer message
    public isOperational = true    // Expected vs unexpected
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      name: this.name
    }
  }
}
```

### Specialized Error Classes

```typescript
// Medical/Emergency errors
class EmergencyDetectedError extends AppError {
  constructor(
    code: string,
    message: string,
    public severity: 'low' | 'medium' | 'high' | 'critical',
    public detectedSymptoms?: string[]
  ) {
    super(code, 422, message, true)
  }
}

// Prescription errors
class PrescriptionError extends AppError {
  constructor(
    code: string,
    message: string,
    public drugName?: string,
    public interactionType?: 'drug-drug' | 'drug-allergy' | 'drug-condition' | 'dosage' | 'contraindication'
  ) {
    super(code, 422, message, true)
  }
}

// Authentication/Authorization
class AuthenticationError extends AppError {
  constructor(code: string, message: string) {
    super(code, 401, message, true)
  }
}

class AuthorizationError extends AppError {
  constructor(
    code: string,
    message: string,
    public requiredRole?: string
  ) {
    super(code, 403, message, true)
  }
}

// Validation
class ValidationError extends AppError {
  constructor(
    code: string,
    message: string,
    public field?: string,
    public validationErrors?: Array<{ field: string; message: string }>
  ) {
    super(code, 400, message, true)
  }
}

// Not Found
class NotFoundError extends AppError {
  constructor(
    code: string,
    message: string,
    public resourceType?: string,
    public resourceId?: string
  ) {
    super(code, 404, message, true)
  }
}

// Rate Limiting
class RateLimitError extends AppError {
  constructor(
    code: string,
    message: string,
    public retryAfter?: number,
    public limit?: number
  ) {
    super(code, 429, message, true)
  }
}

// Payment
class PaymentError extends AppError {
  constructor(
    code: string,
    message: string,
    public paymentIntentId?: string,
    public stripeCode?: string
  ) {
    super(code, 402, message, true)
  }
}
```

### Usage in API Routes
```typescript
import { handleError, EmergencyDetectedError } from '@/lib/errors'

export async function POST(request: Request) {
  try {
    // ... logic
    if (hasEmergencySymptoms) {
      throw new EmergencyDetectedError(
        'EMG_001',
        'Critical symptoms detected',
        'critical',
        ['chest pain', 'shortness of breath']
      )
    }
  } catch (error) {
    return handleError(error, { userId, route: '/api/ai/consult' })
  }
}
```

---

## 3. Validation Schemas (Zod)

**Source**: `src/lib/validation/schemas.ts`

### Doctor Onboarding
```typescript
export const doctorOnboardingSchema = z.object({
  yearsExperience: z.number().int().min(0).max(75),
  bio: z.string().max(2000).trim(),
  licenseNumber: z.string().regex(/^[A-Z0-9]{6,20}$/, 'License number must be 6-20 alphanumeric characters'),
  priceCents: z.number().int().min(10000).max(500000),
  availability: z.array(z.object({
    day: z.number().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
  })).optional()
})
```

### Appointment Creation
```typescript
export const appointmentSchema = z.object({
  doctorId: z.string().uuid('Invalid doctor ID'),
  slotId: z.string().uuid('Invalid slot ID').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM').optional(),
  notes: z.string().max(1000).optional(),
  reason: z.string().max(500).optional()
})
```

### Prescription
```typescript
export const prescriptionSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  medications: z.array(z.object({
    name: z.string().min(1, 'Medication name required'),
    dosage: z.string().min(1, 'Dosage required'),
    frequency: z.string().min(1, 'Frequency required'),
    duration: z.string().min(1, 'Duration required'),
    instructions: z.string().optional()
  })).min(1, 'At least one medication required'),
  diagnosis: z.string().optional(),
  notes: z.string().max(2000).optional()
})
```

### Payment Intent
```typescript
export const paymentIntentSchema = z.object({
  appointmentId: z.string().uuid('Invalid appointment ID'),
  amount: z.number().int().min(100).max(10000000),
  currency: z.string().length(3).default('mxn')
})
```

### Validation Helper
```typescript
export async function validateBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: z.ZodError }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

// Usage
const validation = await validateBody(request, appointmentSchema)
if (!validation.success) {
  return NextResponse.json(
    { error: 'Validation failed', details: validation.error.flatten() },
    { status: 400 }
  )
}
```

---

## 4. Security Utilities

### CSRF Protection

**Source**: `src/lib/csrf.ts`

```typescript
// Generate token
export function generateCSRFToken(): CSRFToken {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  return { token, header: 'x-csrf-token' }
}

// Validate token (timing-safe)
export function validateCSRFToken(
  request: NextRequest,
  sessionToken: string,
  detailed?: boolean
): boolean | CSRFValidationResult

// Set secure cookie
export function setCSRFCookie(response: NextResponse, token: string): void {
  response.cookies.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  })
}

// Check if CSRF required for method
export function requiresCSRFProtection(request: NextRequest): boolean {
  return ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method.toUpperCase())
}
```

### Field-Level Encryption

**Source**: `src/lib/encryption.ts`

```typescript
// Encryption Service for PHI (Protected Health Information)
export class EncryptionService {
  // Encrypt single value
  encrypt(plaintext: string, associatedData?: string): EncryptedData
  
  // Decrypt single value
  decrypt(encrypted: EncryptedData): string
  
  // Encrypt object fields
  encryptObject<T extends Record<string, unknown>>(obj: T, fields: string[]): T
  
  // Decrypt object fields
  decryptObject<T extends Record<string, unknown>>(obj: T, fields: string[]): T
  
  // PHI-specific encryption
  encryptPHI(data: string, patientId?: string): EncryptedData
  decryptPHI(encrypted: EncryptedData): string
  
  // Medical-specific encryption
  encryptDiagnosis(diagnosis: string, patientId?: string): EncryptedData
  encryptNotes(notes: string, consultationId?: string): EncryptedData
  encryptPrescription(prescription: PrescriptionData, patientId?: string): EncryptedData
}

// Singleton instance
export const encryptionService = new EncryptionService()

// Encrypted model factory
export function createEncryptedModel<T extends DatabaseRecord>(fields: string[]) {
  return {
    fields,
    encrypt(data: T) { return encryptionService.encryptObject(data, fields) },
    decrypt(data: T) { return encryptionService.decryptObject(data, fields) },
    encryptMany(records: T[]) { return encryptionService.batchEncrypt(records, fields) },
    decryptMany(records: T[]) { return encryptionService.batchDecrypt(records, fields) },
    isEncrypted(data: T, field: string) { return encryptionService.isEncrypted(data[field]) },
  }
}
```

### Rate Limiting Configuration

**Source**: `src/lib/rate-limit/config.ts`

```typescript
// Tiered rate limits by endpoint type
export const RATE_LIMIT_TIERS = {
  'auth:login': { requests: 5, window: 300 },           // 5 per 5 min
  'auth:register': { requests: 3, window: 300 },        // 3 per 5 min
  'payment:create': { requests: 10, window: 60 },       // 10 per min
  'ai:consult': { requests: 20, window: 60 },           // 20 per min
  'ai:vision': { requests: 15, window: 60 },            // 15 per min
  'api:read': { requests: 200, window: 60 },            // 200 per min
  'api:write': { requests: 50, window: 60 },            // 50 per min
  'premium:general': { requests: 500, window: 60 },     // Premium users
}

// Get tier based on route
export function getRateLimitTier(
  route: string,
  method: string,
  userRole?: string,
  isPremium?: boolean
): RateLimitTier
```

### Security Headers (Middleware)

**Source**: `src/middleware.ts`

```typescript
// CSP Policy for healthcare platform
const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://js.stripe.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https://*.stripe.com'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'https://*.stripe.com'],
  'frame-src': ["'self'", 'https://*.stripe.com', 'https://js.stripe.com'],
}

// Security headers applied to all responses
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', buildCSP())
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.delete('X-Powered-By')
  response.headers.delete('Server')
  return response
}
```

---

## 5. Structured Logging

**Source**: `src/lib/observability/logger.ts`

```typescript
export interface LogContext {
  userId?: string
  requestId?: string
  traceId?: string
  spanId?: string
  feature?: string
  [key: string]: unknown
}

export const logger = {
  debug: (message: string, context?: LogContext) => {},
  info: (message: string, context?: LogContext) => {},
  warn: (message: string, context?: LogContext, error?: Error) => {},
  error: (message: string, context?: LogContext, error?: Error) => {},
  
  // Child logger with preset context
  child: (defaultContext: LogContext) => logger,
  
  // Time async operations
  async time<T>(name: string, fn: () => Promise<T>, context?: LogContext): Promise<T>
}

// Usage
logger.info('User logged in', { userId: '123', feature: 'auth' })
logger.error('Payment failed', { userId: '123' }, error)

// With timing
const result = await logger.time('ai-consult', async () => {
  return await performConsultation()
}, { userId: '123' })
```

---

## 6. Branded Types (Type-Safe IDs)

**Source**: `src/types/branded-types.ts`

```typescript
// Type-safe IDs to prevent mixing different entity types
type UserId = string & { readonly __brand: 'UserId' }
type DoctorId = string & { readonly __brand: 'DoctorId' }
type PatientId = string & { readonly __brand: 'PatientId' }
type AppointmentId = string & { readonly __brand: 'AppointmentId' }

// Constructor functions
export function toUserId(id: string): UserId {
  if (!isValidUUID(id)) throw new Error('Invalid UUID format')
  return id as UserId
}

// Safe constructors (return null on invalid)
export function toUserIdSafe(id: string): UserId | null {
  return isValidUUID(id) ? (id as UserId) : null
}

// Validation
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}
```

---

## Summary: What to Keep

✅ **KEEP**:
- AI router with provider fallback logic
- Complete AppError hierarchy
- Zod validation schemas (clean versions)
- CSRF protection utilities
- Encryption service (AES-256-GCM)
- Rate limiting configuration
- Security headers middleware
- Structured logger
- Branded types for IDs

❌ **LEAVE BEHIND**:
- Duplicate error handling code
- Untested validation schemas
- Broken encryption implementations
- Unused utility functions
