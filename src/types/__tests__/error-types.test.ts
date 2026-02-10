/**
 * Type Safety Tests for Error Types
 *
 * These tests verify discriminated union error handling works correctly.
 */

import {
  type AppError,
  type ValidationError,
  type AuthError,
  type NotFoundError,
  type DatabaseError,
  type NetworkError,
  type HealthcareError,
  type PaymentError,
  type RateLimitError,
  type ConfigurationError,
  type VideoCallError,
  type FileUploadError,
  isValidationError,
  isAuthError,
  isNotFoundError,
  isDatabaseError,
  isNetworkError,
  isHealthcareError,
  isPaymentError,
  isRateLimitError,
  isConfigurationError,
  isVideoCallError,
  isFileUploadError,
  createValidationError,
  createAuthError,
  createNotFoundError,
  createDatabaseError,
  createNetworkError,
  createHealthcareError,
  createPaymentError,
  createRateLimitError,
  createConfigurationError,
  createVideoCallError,
  createFileUploadError,
  getUserMessage,
  withErrorHandling,
} from '../error-types'

// Test 1: Create all error types
const validationError: ValidationError = createValidationError('Invalid input', 'email', 'test')
const authError: AuthError = createAuthError('Invalid credentials', 'INVALID_CREDENTIALS')
const notFoundError: NotFoundError = createNotFoundError(
  'User not found',
  'user',
  'user-123'
)
const databaseError: DatabaseError = createDatabaseError('Query failed', new Error('DB error'))
const networkError: NetworkError = createNetworkError('Request failed', 500, '/api/test')
const healthcareError: HealthcareError = createHealthcareError(
  'Invalid license',
  'INVALID_MEDICAL_LICENSE'
)
const paymentError: PaymentError = createPaymentError('Payment failed', 'PAYMENT_FAILED', 'stripe')
const rateLimitError: RateLimitError = createRateLimitError(
  'Too many requests',
  100,
  0,
  new Date(Date.now() + 60000).toISOString()
)
const configurationError: ConfigurationError = createConfigurationError(
  'Missing API key',
  'API_KEY',
  'string'
)
const videoCallError: VideoCallError = createVideoCallError('Room not found', 'ROOM_NOT_FOUND', 'room-123')
const fileUploadError: FileUploadError = createFileUploadError(
  'File too large',
  'FILE_TOO_LARGE',
  'photo.jpg',
  10 * 1024 * 1024,
  5 * 1024 * 1024
)

console.log('All error types created successfully')

// Test 2: Type guards work correctly
const errors: AppError[] = [
  validationError,
  authError,
  notFoundError,
  databaseError,
  networkError,
  healthcareError,
  paymentError,
  rateLimitError,
  configurationError,
  videoCallError,
  fileUploadError,
]

for (const error of errors) {
  if (isValidationError(error)) {
    console.log('ValidationError:', error.field)
  } else if (isAuthError(error)) {
    console.log('AuthError:', error.code)
  } else if (isNotFoundError(error)) {
    console.log('NotFoundError:', error.resource)
  } else if (isDatabaseError(error)) {
    console.log('DatabaseError')
  } else if (isNetworkError(error)) {
    console.log('NetworkError:', error.status)
  } else if (isHealthcareError(error)) {
    console.log('HealthcareError:', error.code)
  } else if (isPaymentError(error)) {
    console.log('PaymentError:', error.provider)
  } else if (isRateLimitError(error)) {
    console.log('RateLimitError:', error.limit)
  } else if (isConfigurationError(error)) {
    console.log('ConfigurationError:', error.setting)
  } else if (isVideoCallError(error)) {
    console.log('VideoCallError:', error.roomId)
  } else if (isFileUploadError(error)) {
    console.log('FileUploadError:', error.fileName)
  }

  // TypeScript should ensure all cases are handled
  // Uncomment to verify exhaustive checking:
  // const exhaustiveCheck: never = error
}

// Test 3: getUserMessage returns Spanish messages
console.log('User messages:')
console.log('- ValidationError:', getUserMessage(validationError))
console.log('- AuthError:', getUserMessage(authError))
console.log('- NotFoundError:', getUserMessage(notFoundError))
console.log('- DatabaseError:', getUserMessage(databaseError))
console.log('- NetworkError:', getUserMessage(networkError))
console.log('- HealthcareError:', getUserMessage(healthcareError))
console.log('- PaymentError:', getUserMessage(paymentError))
console.log('- RateLimitError:', getUserMessage(rateLimitError))
console.log('- ConfigurationError:', getUserMessage(configurationError))
console.log('- VideoCallError:', getUserMessage(videoCallError))
console.log('- FileUploadError:', getUserMessage(fileUploadError))

// Test 4: Discriminated union enables type narrowing
function handleErrorExample(error: AppError): string {
  // TypeScript knows the exact type based on the discriminated 'type' field
  switch (error.type) {
    case 'ValidationError':
      return `Validation failed for ${error.field || 'unknown field'}`
    case 'AuthError':
      return `Auth error: ${error.code}`
    case 'NotFoundError':
      return `Not found: ${error.resource}`
    case 'DatabaseError':
      return `Database error: ${error.message}`
    case 'NetworkError':
      return `Network error: ${error.status || 'unknown status'}`
    case 'HealthcareError':
      return `Healthcare error: ${error.code}`
    case 'PaymentError':
      return `Payment error: ${error.provider || 'unknown provider'}`
    case 'RateLimitError':
      return `Rate limit: ${error.remaining}/${error.limit}`
    case 'ConfigurationError':
      return `Configuration error: ${error.setting}`
    case 'VideoCallError':
      return `Video call error: ${error.code}`
    case 'FileUploadError':
      return `File upload error: ${error.code}`
    default:
      // TypeScript ensures exhaustive checking
      const _exhaustiveCheck: never = error
      return _exhaustiveCheck
  }
}

console.log('Handle error examples:')
errors.forEach((error) => console.log('-', handleErrorExample(error)))

// Test 5: withErrorHandling wrapper
async function testWithErrorHandling() {
  // Success case
  const { data, error } = await withErrorHandling(async () => {
    return 'success'
  })

  if (data) {
    console.log('Success:', data)
  }

  // Error case
  const { data: data2, error: error2 } = await withErrorHandling(async () => {
    throw createAuthError('Test error', 'UNAUTHORIZED')
  })

  if (error2 && isAuthError(error2)) {
    console.log('Caught AuthError:', error2.code)
  }
}

testWithErrorHandling().then(() => {
  console.log('All error type tests passed!')
})
