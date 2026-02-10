# Enhanced TypeScript Type Definitions

This directory contains the enhanced type definition system for Doctor.mx, designed to improve type safety and catch bugs at compile time.

## Overview

The type system is organized into three main modules:

1. **Branded Types** (`branded-types.ts`) - Type-safe entity IDs
2. **Error Types** (`error-types.ts`) - Discriminated union error handling
3. **Database Types** (`database.ts`) - Type-safe database operations

## File Structure

```
src/types/
├── index.ts              # Main exports and application types
├── branded-types.ts      # Type-safe ID types
├── error-types.ts        # Discriminated union errors
├── database.ts          # Database schema types
├── soap.ts              # SOAP note types
├── soap-analytics.ts    # SOAP analytics types
├── examples/
│   └── usage-examples.ts # Usage examples
└── __tests__/
    ├── branded-types.test.ts
    └── error-types.test.ts
```

## Branded Types

### What are Branded Types?

Branded types prevent mixing different entity IDs at compile time. For example, you cannot accidentally pass a `DoctorId` where a `UserId` is expected.

### Usage

```typescript
import { toUserId, toDoctorId, type UserId, type DoctorId } from '@/types'

// Create typed IDs
const userId: UserId = toUserId('user-123')
const doctorId: DoctorId = toDoctorId('doctor-456')

// Function that requires a specific ID type
function getUserProfile(id: UserId) {
  // Implementation
}

// This works
getUserProfile(userId)

// This causes a compile-time error
// getUserProfile(doctorId) // ❌ Error: DoctorId is not assignable to UserId
```

### Safe Conversion

```typescript
import { toUserIdSafe, isValidUUID } from '@/types'

// Validate before converting
const userId = toUserIdSafe('some-input-id')
if (userId) {
  // We know it's a valid UUID here
  console.log('Valid user ID:', userId)
} else {
  console.log('Invalid user ID format')
}

// Or check UUID format
if (isValidUUID('550e8400-e29b-41d4-a716-446655440000')) {
  console.log('Valid UUID')
}
```

## Error Types

### Discriminated Union Errors

The error types use discriminated unions to ensure all error cases are handled correctly.

### Usage

```typescript
import {
  createValidationError,
  createAuthError,
  createNotFoundError,
  type AppError,
  isValidationError,
  isAuthError,
  getUserMessage
} from '@/types'

// Create errors
const error: AppError = createValidationError('Invalid email', 'email')

// Type guards
if (isValidationError(error)) {
  console.log(`Field: ${error.field}`)
}

// Get user-friendly message (Spanish)
const message = getUserMessage(error)
console.log(message) // "Validación fallida: Invalid email"

// Handle all error types exhaustively
function handleError(error: AppError): string {
  switch (error.type) {
    case 'ValidationError':
      return `Validation failed: ${error.message}`
    case 'AuthError':
      return `Auth error: ${error.code}`
    case 'NotFoundError':
      return `Not found: ${error.resource}`
    // ... all other cases
    default:
      const _exhaustiveCheck: never = error // Ensures all cases handled
      return _exhaustiveCheck
  }
}
```

### Available Error Types

- `ValidationError` - Input validation failed
- `AuthError` - Authentication/authorization errors
- `NotFoundError` - Resource not found
- `DatabaseError` - Database operation failed
- `NetworkError` - Network request failed
- `HealthcareError` - Healthcare-specific errors
- `PaymentError` - Payment processing errors
- `RateLimitError` - Rate limit exceeded
- `ConfigurationError` - System configuration error
- `VideoCallError` - Video consultation errors
- `FileUploadError` - File upload errors

## Database Types

### Schema-Aligned Types

Database types align with the Supabase migrations and provide type-safe database operations.

### Usage

```typescript
import {
  type DoctorRow,
  type AppointmentRow,
  type DoctorWithRelations,
  type AppointmentInsert,
  type AppointmentUpdate,
  TABLES
} from '@/types'

// Use database row types
const doctor: DoctorRow = {
  id: 'doctor-123',
  status: 'approved',
  bio: 'Cardiologist',
  languages: ['es', 'en'],
  // ... all required fields
}

// Use relation types
const doctorWithProfile: DoctorWithRelations = {
  id: 'doctor-123',
  profile: { /* profile data */ },
  status: 'approved',
  // ... all fields
}

// Use insert types (excludes auto-generated fields)
const newAppointment: AppointmentInsert = {
  doctor_id: 'doctor-123',
  patient_id: 'patient-456',
  start_ts: '2024-01-01T10:00:00Z',
  end_ts: '2024-01-01T11:00:00Z',
  status: 'pending_payment',
  // ... no id or created_at
}

// Use table name constants
const tableName = TABLES.APPOINTMENTS // 'appointments'
```

## Application Types

### High-Level Domain Models

The main `index.ts` exports high-level application types used throughout the codebase.

```typescript
import {
  type Profile,
  type Doctor,
  type Appointment,
  type Payment,
  type ChatConversation,
  type ChatMessage,
  UserRole,
  DoctorStatus,
  AppointmentStatus,
  PaymentStatus
} from '@/types'

// Usage in components and API routes
const doctor: Doctor = {
  id: 'doctor-123',
  status: 'approved',
  profile: { /* ... */ },
  // ... other fields
}
```

## Best Practices

### 1. Use Branded IDs

Always use branded ID types for function parameters instead of plain strings:

```typescript
// Good
function getDoctor(id: DoctorId) { /* ... */ }

// Avoid
function getDoctor(id: string) { /* ... */ }
```

### 2. Handle Errors Exhaustively

Use discriminated unions to ensure all error cases are handled:

```typescript
// Good - TypeScript enforces exhaustive checking
function handleResult(result: ApiResult<T>) {
  switch (result.type) {
    case 'success':
      // ...
    case 'error':
      // ...
  }
}

// Avoid - may miss error cases
function handleResult(result: ApiResult<T>) {
  if (result.success) {
    // ...
  } else {
    // What if we forget to handle some errors?
  }
}
```

### 3. Use Database Types

Use database types for type-safe database operations:

```typescript
// Good - Type-safe insert
const appointment: AppointmentInsert = {
  doctor_id: doctorId,
  patient_id: patientId,
  // ... TypeScript ensures all required fields
}

// Avoid - Untyped objects
const appointment = {
  doctor_id: doctorId,
  patient_id: patientId,
  // ... may forget required fields
}
```

### 4. Use Type Guards

Use type guards to narrow discriminated unions:

```typescript
// Good - Type-safe narrowing
if (isValidationError(error)) {
  console.log(error.field) // TypeScript knows field exists
}

// Avoid - Type assertions
if ((error as ValidationError).field) {
  console.log((error as ValidationError).field)
}
```

## Migration Guide

### Existing Code

When updating existing code to use the new type system:

1. **Replace string IDs with branded IDs**:
   ```typescript
   // Before
   function getDoctor(id: string) { /* ... */ }

   // After
   function getDoctor(id: DoctorId) { /* ... */ }
   ```

2. **Replace error throwing with discriminated unions**:
   ```typescript
   // Before
   throw new Error('User not found')

   // After
   return createNotFoundError('User not found', 'user')
   ```

3. **Use database types for DB operations**:
   ```typescript
   // Before
   const doctor = await supabase.from('doctors').select('*')

   // After
   const doctor: DoctorRow | null = await supabase
     .from(TABLES.DOCTORS)
     .select('*')
     .single()
   ```

## Testing

Type safety tests are provided in the `__tests__` directory:

```bash
# Run type checking
npx tsc --noEmit

# Check specific files
npx tsc --noEmit src/types/branded-types.ts
npx tsc --noEmit src/types/error-types.ts
npx tsc --noEmit src/types/database.ts
```

## Benefits

### Compile-Time Safety

- Catch bugs before runtime
- Prevent mixing incompatible entity IDs
- Ensure all error cases are handled

### Better Developer Experience

- Improved IDE autocomplete
- Self-documenting code
- Easier refactoring

### Type Inference

- TypeScript infers types from discriminated unions
- No manual type assertions needed
- Exhaustive checking ensures all cases handled

## Examples

See `src/types/examples/usage-examples.ts` for comprehensive examples of using the enhanced type system.

## Contributing

When adding new types:

1. Add branded ID types to `branded-types.ts`
2. Add error types to `error-types.ts`
3. Add database types to `database.ts`
4. Re-export from `index.ts` if needed
5. Add usage examples
6. Update this README

## Resources

- [TypeScript Branded Types](https://basarat.gitbook.io/typescript/type-system/typeguard#branded-types)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types)
