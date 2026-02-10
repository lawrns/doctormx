/**
 * Discriminated Union Types for Error Handling
 *
 * These types provide type-safe error handling with discriminated unions.
 * This ensures all error cases are handled properly at compile time.
 */

/**
 * Base error type with common properties
 */
interface BaseError {
  message: string
  timestamp: string
  stack?: string
}

/**
 * Validation Error - When input validation fails
 */
export interface ValidationError extends BaseError {
  type: 'ValidationError'
  field?: string
  value?: unknown
}

/**
 * Authentication Error - When auth operations fail
 */
export interface AuthError extends BaseError {
  type: 'AuthError'
  code:
    | 'INVALID_CREDENTIALS'
    | 'TOKEN_EXPIRED'
    | 'TOKEN_INVALID'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'SESSION_EXPIRED'
}

/**
 * Not Found Error - When a resource doesn't exist
 */
export interface NotFoundError extends BaseError {
  type: 'NotFoundError'
  resource:
    | 'user'
    | 'doctor'
    | 'patient'
    | 'appointment'
    | 'payment'
    | 'prescription'
    | 'specialty'
    | 'conversation'
    | 'message'
    | 'subscription'
    | 'availability'
  resourceId?: string
}

/**
 * Database Error - When database operations fail
 */
export interface DatabaseError extends BaseError {
  type: 'DatabaseError'
  code?: string
  originalError?: unknown
  query?: string
}

/**
 * Network Error - When network requests fail
 */
export interface NetworkError extends BaseError {
  type: 'NetworkError'
  status?: number
  url?: string
  method?: string
}

/**
 * Healthcare/Domain Error - For healthcare-specific errors
 */
export interface HealthcareError extends BaseError {
  type: 'HealthcareError'
  code:
    | 'INVALID_MEDICAL_LICENSE'
    | 'PRESCRIPTION_EXPIRED'
    | 'APPOINTMENT_CONFLICT'
    | 'DOCTOR_UNAVAILABLE'
    | 'PATIENT_INELIGIBLE'
    | 'INSUFFICIENT_INFORMATION'
    | 'MEDICAL_RECORD_NOT_FOUND'
  details?: Record<string, unknown>
}

/**
 * Payment Error - For payment-related errors
 */
export interface PaymentError extends BaseError {
  type: 'PaymentError'
  code:
    | 'PAYMENT_FAILED'
    | 'PAYMENT_CANCELLED'
    | 'PAYMENT_REQUIRES_ACTION'
    | 'INSUFFICIENT_FUNDS'
    | 'CARD_DECLINED'
    | 'INVALID_PAYMENT_METHOD'
  provider?: 'stripe' | 'openpay' | 'mercadopago'
  providerCode?: string
}

/**
 * Rate Limit Error - When rate limits are exceeded
 */
export interface RateLimitError extends BaseError {
  type: 'RateLimitError'
  limit: number
  remaining: number
  resetAt: string
}

/**
 * Configuration Error - When service configuration is invalid
 */
export interface ConfigurationError extends BaseError {
  type: 'ConfigurationError'
  setting: string
  expected: string
  received?: unknown
}

/**
 * Video Call Error - For video consultation errors
 */
export interface VideoCallError extends BaseError {
  type: 'VideoCallError'
  code:
    | 'ROOM_NOT_FOUND'
    | 'ROOM_EXPIRED'
    | 'CONNECTION_FAILED'
    | 'MEDIA_PERMISSION_DENIED'
    | 'DOCTOR_NOT_AVAILABLE'
  roomId?: string
}

/**
 * File Upload Error - For file upload related errors
 */
export interface FileUploadError extends BaseError {
  type: 'FileUploadError'
  code:
    | 'FILE_TOO_LARGE'
    | 'INVALID_FILE_TYPE'
    | 'UPLOAD_FAILED'
    | 'QUOTA_EXCEEDED'
  fileName?: string
  fileSize?: number
  maxSize?: number
  allowedTypes?: string[]
}

/**
 * Union type of all possible application errors
 */
export type AppError =
  | ValidationError
  | AuthError
  | NotFoundError
  | DatabaseError
  | NetworkError
  | HealthcareError
  | PaymentError
  | RateLimitError
  | ConfigurationError
  | VideoCallError
  | FileUploadError

/**
 * Type guard for ValidationError
 */
export function isValidationError(error: AppError): error is ValidationError {
  return error.type === 'ValidationError'
}

/**
 * Type guard for AuthError
 */
export function isAuthError(error: AppError): error is AuthError {
  return error.type === 'AuthError'
}

/**
 * Type guard for NotFoundError
 */
export function isNotFoundError(error: AppError): error is NotFoundError {
  return error.type === 'NotFoundError'
}

/**
 * Type guard for DatabaseError
 */
export function isDatabaseError(error: AppError): error is DatabaseError {
  return error.type === 'DatabaseError'
}

/**
 * Type guard for NetworkError
 */
export function isNetworkError(error: AppError): error is NetworkError {
  return error.type === 'NetworkError'
}

/**
 * Type guard for HealthcareError
 */
export function isHealthcareError(error: AppError): error is HealthcareError {
  return error.type === 'HealthcareError'
}

/**
 * Type guard for PaymentError
 */
export function isPaymentError(error: AppError): error is PaymentError {
  return error.type === 'PaymentError'
}

/**
 * Type guard for RateLimitError
 */
export function isRateLimitError(error: AppError): error is RateLimitError {
  return error.type === 'RateLimitError'
}

/**
 * Type guard for ConfigurationError
 */
export function isConfigurationError(error: AppError): error is ConfigurationError {
  return error.type === 'ConfigurationError'
}

/**
 * Type guard for VideoCallError
 */
export function isVideoCallError(error: AppError): error is VideoCallError {
  return error.type === 'VideoCallError'
}

/**
 * Type guard for FileUploadError
 */
export function isFileUploadError(error: AppError): error is FileUploadError {
  return error.type === 'FileUploadError'
}

/**
 * Create a ValidationError
 */
export function createValidationError(
  message: string,
  field?: string,
  value?: unknown
): ValidationError {
  return {
    type: 'ValidationError',
    message,
    field,
    value,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create an AuthError
 */
export function createAuthError(message: string, code: AuthError['code']): AuthError {
  return {
    type: 'AuthError',
    message,
    code,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a NotFoundError
 */
export function createNotFoundError(
  message: string,
  resource: NotFoundError['resource'],
  resourceId?: string
): NotFoundError {
  return {
    type: 'NotFoundError',
    message,
    resource,
    resourceId,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a DatabaseError
 */
export function createDatabaseError(
  message: string,
  originalError?: unknown,
  query?: string
): DatabaseError {
  return {
    type: 'DatabaseError',
    message,
    originalError,
    query,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a NetworkError
 */
export function createNetworkError(
  message: string,
  status?: number,
  url?: string,
  method?: string
): NetworkError {
  return {
    type: 'NetworkError',
    message,
    status,
    url,
    method,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a HealthcareError
 */
export function createHealthcareError(
  message: string,
  code: HealthcareError['code'],
  details?: Record<string, unknown>
): HealthcareError {
  return {
    type: 'HealthcareError',
    message,
    code,
    details,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a PaymentError
 */
export function createPaymentError(
  message: string,
  code: PaymentError['code'],
  provider?: PaymentError['provider'],
  providerCode?: string
): PaymentError {
  return {
    type: 'PaymentError',
    message,
    code,
    provider,
    providerCode,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a RateLimitError
 */
export function createRateLimitError(
  message: string,
  limit: number,
  remaining: number,
  resetAt: string
): RateLimitError {
  return {
    type: 'RateLimitError',
    message,
    limit,
    remaining,
    resetAt,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a ConfigurationError
 */
export function createConfigurationError(
  message: string,
  setting: string,
  expected: string,
  received?: unknown
): ConfigurationError {
  return {
    type: 'ConfigurationError',
    message,
    setting,
    expected,
    received,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a VideoCallError
 */
export function createVideoCallError(
  message: string,
  code: VideoCallError['code'],
  roomId?: string
): VideoCallError {
  return {
    type: 'VideoCallError',
    message,
    code,
    roomId,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Create a FileUploadError
 */
export function createFileUploadError(
  message: string,
  code: FileUploadError['code'],
  fileName?: string,
  fileSize?: number,
  maxSize?: number,
  allowedTypes?: string[]
): FileUploadError {
  return {
    type: 'FileUploadError',
    message,
    code,
    fileName,
    fileSize,
    maxSize,
    allowedTypes,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Handle errors with type-safe discriminated union handling
 * This function ensures all error types are handled
 */
export function handleError(error: AppError): never {
  // Log the error for debugging
  console.error(`[${error.type}] ${error.message}`, {
    timestamp: error.timestamp,
    ...error,
  })

  // In a real application, you might want to:
  // - Send errors to a monitoring service (e.g., Sentry)
  // - Return user-friendly error messages
  // - Perform cleanup operations

  throw error
}

/**
 * Get a user-friendly error message based on error type
 */
export function getUserMessage(error: AppError): string {
  switch (error.type) {
    case 'ValidationError':
      return `Validación fallida: ${error.message}`
    case 'AuthError':
      return 'Error de autenticación. Por favor inicia sesión nuevamente.'
    case 'NotFoundError':
      return `No se encontró: ${error.message}`
    case 'DatabaseError':
      return 'Error al guardar los cambios. Por favor intenta nuevamente.'
    case 'NetworkError':
      return 'Error de conexión. Por favor verifica tu internet e intenta nuevamente.'
    case 'HealthcareError':
      return `Error médico: ${error.message}`
    case 'PaymentError':
      return `Error de pago: ${error.message}`
    case 'RateLimitError':
      return 'Has excedido el límite de solicitudes. Por favor espera unos minutos.'
    case 'ConfigurationError':
      return 'Error de configuración del sistema. Por favor contacta soporte.'
    case 'VideoCallError':
      return `Error de video: ${error.message}`
    case 'FileUploadError':
      return `Error al subir archivo: ${error.message}`
    default:
      // TypeScript ensures all cases are handled
      const _exhaustiveCheck: never = error
      return 'Error desconocido'
  }
}

/**
 * Wrap an async function with error handling
 * Converts thrown errors into AppError types
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorHandler?: (error: AppError) => void
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await fn()
    return { data }
  } catch (err) {
    let appError: AppError

    if (isAppError(err)) {
      appError = err
    } else if (err instanceof Error) {
      appError = {
        type: 'DatabaseError',
        message: err.message,
        originalError: err,
        timestamp: new Date().toISOString(),
      }
    } else {
      appError = {
        type: 'DatabaseError',
        message: 'Unknown error occurred',
        originalError: err,
        timestamp: new Date().toISOString(),
      }
    }

    if (errorHandler) {
      errorHandler(appError)
    }

    return { error: appError }
  }
}

/**
 * Type guard to check if unknown error is an AppError
 */
function isAppError(err: unknown): err is AppError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    'message' in err &&
    'timestamp' in err
  )
}
