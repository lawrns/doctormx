/**
 * Usage Examples for Enhanced Type Definitions
 *
 * This file demonstrates how to use the new type-safe features:
 * 1. Branded types for entity IDs
 * 2. Discriminated union error handling
 * 3. Database types with proper relations
 * 
 * NOTE: This is example/demonstration code. Console statements are intentional
 * for educational purposes and should not be used in production code.
 */

import {
  // Branded types and converters
  toUserId,
  toDoctorId,
  toPatientId,
  toAppointmentId,
  toUserIdSafe,
  toDoctorIdSafe,
  // Error types and creators
  createAuthError,
  createNotFoundError,
  createValidationError,
  createPaymentError,
  isAuthError,
  isNotFoundError,
  isValidationError,
  type AppError,
  type UserId,
  type DoctorId,
  type PatientId,
  // Database types
  type ProfileRow,
  type DoctorRow,
  type AppointmentRow,
  type DoctorWithRelations,
} from '../index'

// ==========================================
// EXAMPLE 1: Using Branded Types
// ==========================================

/**
 * Function that requires a UserId
 * Using branded types prevents accidentally passing a DoctorId or PatientId
 */
function getUserProfile(userId: UserId): Promise<ProfileRow | null> {
  // Implementation would query the database
  console.log('Fetching profile for user:', userId)
  return Promise.resolve(null)
}

/**
 * Function that requires a DoctorId
 */
function getDoctorProfile(doctorId: DoctorId): Promise<DoctorRow | null> {
  console.log('Fetching doctor profile:', doctorId)
  return Promise.resolve(null)
}

// Usage example
const userId = toUserId('user-123')
const doctorId = toDoctorId('doctor-456')

// These work correctly
getUserProfile(userId)
getDoctorProfile(doctorId)

// These would cause type errors (uncomment to verify):
// getUserProfile(doctorId) // ❌ Error: DoctorId is not assignable to UserId
// getDoctorProfile(userId) // ❌ Error: UserId is not assignable to DoctorId

// Safe conversion with validation
const maybeUserId = toUserIdSafe('some-id-from-input')
if (maybeUserId) {
  // We know it's a valid UserId here
  getUserProfile(maybeUserId)
} else {
  console.log('Invalid user ID format')
}

// ==========================================
// EXAMPLE 2: Error Handling with Discriminated Unions
// ==========================================

/**
 * Function that returns a discriminated union error
 */
async function appointmentPayment(
  appointmentId: string,
  amountCents: number
): Promise<{ success: true } | { success: false; error: AppError }> {
  try {
    // Simulate payment processing
    if (!appointmentId) {
      return {
        success: false,
        error: createValidationError('Appointment ID is required', 'appointmentId'),
      }
    }

    // Simulate a payment failure
    if (amountCents <= 0) {
      return {
        success: false,
        error: createPaymentError('Invalid amount', 'PAYMENT_FAILED', 'stripe'),
      }
    }

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: createPaymentError('Payment processing failed', 'PAYMENT_FAILED', 'stripe'),
    }
  }
}

/**
 * Handle errors using discriminated unions
 * TypeScript ensures all error types are handled
 */
async function handlePaymentResult(
  result: Awaited<ReturnType<typeof appointmentPayment>>
): Promise<string> {
  // Check success first to narrow type
  if (result.success === true) {
    return 'Payment successful!'
  }

  // TypeScript now knows this is the error case
  // We can access result.error safely
  const error = result.error

  // TypeScript knows the exact type based on the 'type' field
  switch (error.type) {
    case 'ValidationError':
      return `Please correct: ${error.field ?? 'field'}`

    case 'PaymentError':
      if (error.code === 'PAYMENT_FAILED') {
        return 'Payment failed. Please try a different payment method.'
      }
      return `Payment error: ${error.message}`

    case 'AuthError':
      return 'Please log in again'

    case 'NotFoundError':
      return `Resource not found: ${error.resource}`

    case 'DatabaseError':
      return 'Database error. Please try again.'

    case 'NetworkError':
      return 'Network error. Please check your connection.'

    case 'HealthcareError':
      return `Medical error: ${error.message}`

    case 'RateLimitError':
      return `Too many requests. Please wait ${error.resetAt}`

    case 'ConfigurationError':
      return 'System configuration error'

    case 'VideoCallError':
      return `Video error: ${error.message}`

    case 'FileUploadError':
      return `Upload error: ${error.message}`

    default:
      // TypeScript ensures exhaustive checking
      const _exhaustiveCheck: never = error
      return _exhaustiveCheck
  }
}

// Usage example
async function processPayment() {
  const result = await appointmentPayment('apt-123', 5000)
  const message = await handlePaymentResult(result)
  console.log(message)
}

// ==========================================
// EXAMPLE 3: Database Types with Relations
// ==========================================

/**
 * Function that returns a doctor with their profile and specialties
 */
async function getDoctorWithProfile(
  doctorId: DoctorId
): Promise<DoctorWithRelations | null> {
  // In a real implementation, this would join the doctores and profiles tables
  console.log('Fetching doctor with profile for:', doctorId)

  // Example of what the joined data might look like
  const doctor: DoctorWithRelations = {
    id: doctorId,
    profile: {
      id: doctorId,
      role: 'doctor',
      full_name: 'Dr. Maria Garcia',
      phone: '+52-55-1234-5678',
      photo_url: null,
      created_at: new Date().toISOString(),
    },
    status: 'approved',
    bio: 'Especialista en cardiología',
    languages: ['es', 'en'],
    license_number: '123456',
    years_experience: 10,
    city: 'Mexico City',
    state: 'CDMX',
    country: 'MX',
    price_cents: 50000,
    currency: 'MXN',
    rating_avg: 4.8,
    rating_count: 150,
  }

  return doctor
}

/**
 * Function using database row types
 */
async function createAppointment(
  doctorId: DoctorId,
  patientId: PatientId,
  startTime: Date,
  endTime: Date
): Promise<AppointmentRow> {
  // TypeScript ensures we provide all required fields
  const appointment: AppointmentRow = {
    id: crypto.randomUUID(),
    doctor_id: doctorId,
    patient_id: patientId,
    start_ts: startTime.toISOString(),
    end_ts: endTime.toISOString(),
    status: 'pending_payment',
    reason_for_visit: null,
    notes: null,
    video_room_url: null,
    cancellation_reason: null,
    cancelled_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // In a real implementation, this would insert into the database
  return appointment
}

// ==========================================
// EXAMPLE 4: Type-safe API responses
// ==========================================

/**
 * API response type using discriminated unions
 */
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: AppError }

/**
 * API endpoint function
 */
async function getDoctorApi(
  doctorId: string
): Promise<ApiResponse<DoctorWithRelations>> {
  // Validate input
  const validatedId = toDoctorIdSafe(doctorId)
  if (!validatedId) {
    return {
      success: false,
      error: createValidationError('Invalid doctor ID format', 'doctorId', doctorId),
    }
  }

  // Fetch doctor
  const doctor = await getDoctorWithProfile(validatedId)
  if (!doctor) {
    return {
      success: false,
      error: createNotFoundError('Doctor not found', 'doctor', doctorId),
    }
  }

  return { success: true, data: doctor }
}

/**
 * Usage in a Next.js API route
 */
async function handleApiRequest(request: Request) {
  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get('doctorId') ?? ''

  const response = await getDoctorApi(doctorId)

  // Use type predicate to narrow the discriminated union
  // The 'success' property is the discriminator
  if (response.success === true) {
    // Success case - TypeScript knows data is available
    return Response.json({ data: response.data })
  }

  // TypeScript now knows response is the error case
  // We can access response.error safely
  const error = response.error

  if (isValidationError(error)) {
    return Response.json(
      { error: `Validation failed for ${error.field ?? 'field'}` },
      { status: 400 }
    )
  }

  if (isNotFoundError(error)) {
    return Response.json(
      { error: `${error.resource} not found` },
      { status: 404 }
    )
  }

  if (isAuthError(error)) {
    return Response.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  // Generic error response
  return Response.json(
    { error: error.message },
    { status: 500 }
  )
}

// ==========================================
// Summary
// ==========================================

/*
 * Key Benefits:
 *
 * 1. Branded Types (branded-types.ts):
 *    - Prevent mixing different entity IDs at compile time
 *    - Catch bugs before runtime
 *    - Self-documenting code
 *
 * 2. Discriminated Union Errors (error-types.ts):
 *    - Exhaustive error handling (TypeScript enforces all cases)
 *    - Type-safe error discrimination
 *    - Centralized error creation and handling
 *
 * 3. Database Types (database.ts):
 *    - Type-safe database operations
 *    - Proper relation types
 *    - Insert/Update helpers
 *
 * 4. All Together:
 *    - Compile-time type safety
 *    - Better IDE autocomplete
 *    - Self-documenting code
 *    - Fewer runtime errors
 */

export {
  // Export for testing
  getUserProfile,
  getDoctorProfile,
  appointmentPayment,
  handlePaymentResult,
  getDoctorWithProfile,
  createAppointment,
  getDoctorApi,
  handleApiRequest,
}
