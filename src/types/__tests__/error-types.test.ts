/**
 * Type Safety Tests for Error Types
 *
 * These tests verify discriminated union error handling works correctly.
 */

import { describe, it, expect, vi } from 'vitest'
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

describe('Error Types', () => {
  describe('Error Creation', () => {
    it('should create ValidationError with correct properties', () => {
      const error = createValidationError('Invalid input', 'email', 'test')
      expect(error.type).toBe('ValidationError')
      expect(error.message).toBe('Invalid input')
      expect(error.field).toBe('email')
      expect(error.value).toBe('test')
      expect(error.timestamp).toBeDefined()
    })

    it('should create AuthError with correct properties', () => {
      const error = createAuthError('Invalid credentials', 'INVALID_CREDENTIALS')
      expect(error.type).toBe('AuthError')
      expect(error.message).toBe('Invalid credentials')
      expect(error.code).toBe('INVALID_CREDENTIALS')
      expect(error.timestamp).toBeDefined()
    })

    it('should create NotFoundError with correct properties', () => {
      const error = createNotFoundError('User not found', 'user', 'user-123')
      expect(error.type).toBe('NotFoundError')
      expect(error.message).toBe('User not found')
      expect(error.resource).toBe('user')
      expect(error.resourceId).toBe('user-123')
      expect(error.timestamp).toBeDefined()
    })

    it('should create DatabaseError with correct properties', () => {
      const originalError = new Error('DB error')
      const error = createDatabaseError('Query failed', originalError)
      expect(error.type).toBe('DatabaseError')
      expect(error.message).toBe('Query failed')
      expect(error.originalError).toBe(originalError)
      expect(error.timestamp).toBeDefined()
    })

    it('should create NetworkError with correct properties', () => {
      const error = createNetworkError('Request failed', 500, '/api/test')
      expect(error.type).toBe('NetworkError')
      expect(error.message).toBe('Request failed')
      expect(error.status).toBe(500)
      expect(error.url).toBe('/api/test')
      expect(error.timestamp).toBeDefined()
    })

    it('should create HealthcareError with correct properties', () => {
      const error = createHealthcareError('Invalid license', 'INVALID_MEDICAL_LICENSE')
      expect(error.type).toBe('HealthcareError')
      expect(error.message).toBe('Invalid license')
      expect(error.code).toBe('INVALID_MEDICAL_LICENSE')
      expect(error.timestamp).toBeDefined()
    })

    it('should create PaymentError with correct properties', () => {
      const error = createPaymentError('Payment failed', 'PAYMENT_FAILED', 'stripe')
      expect(error.type).toBe('PaymentError')
      expect(error.message).toBe('Payment failed')
      expect(error.code).toBe('PAYMENT_FAILED')
      expect(error.provider).toBe('stripe')
      expect(error.timestamp).toBeDefined()
    })

    it('should create RateLimitError with correct properties', () => {
      const resetAt = new Date(Date.now() + 60000).toISOString()
      const error = createRateLimitError('Too many requests', 100, 0, resetAt)
      expect(error.type).toBe('RateLimitError')
      expect(error.message).toBe('Too many requests')
      expect(error.limit).toBe(100)
      expect(error.remaining).toBe(0)
      expect(error.resetAt).toBe(resetAt)
      expect(error.timestamp).toBeDefined()
    })

    it('should create ConfigurationError with correct properties', () => {
      const error = createConfigurationError('Missing API key', 'API_KEY', 'string')
      expect(error.type).toBe('ConfigurationError')
      expect(error.message).toBe('Missing API key')
      expect(error.setting).toBe('API_KEY')
      expect(error.expected).toBe('string')
      expect(error.timestamp).toBeDefined()
    })

    it('should create VideoCallError with correct properties', () => {
      const error = createVideoCallError('Room not found', 'ROOM_NOT_FOUND', 'room-123')
      expect(error.type).toBe('VideoCallError')
      expect(error.message).toBe('Room not found')
      expect(error.code).toBe('ROOM_NOT_FOUND')
      expect(error.roomId).toBe('room-123')
      expect(error.timestamp).toBeDefined()
    })

    it('should create FileUploadError with correct properties', () => {
      const error = createFileUploadError(
        'File too large',
        'FILE_TOO_LARGE',
        'photo.jpg',
        10 * 1024 * 1024,
        5 * 1024 * 1024
      )
      expect(error.type).toBe('FileUploadError')
      expect(error.message).toBe('File too large')
      expect(error.code).toBe('FILE_TOO_LARGE')
      expect(error.fileName).toBe('photo.jpg')
      expect(error.fileSize).toBe(10 * 1024 * 1024)
      expect(error.maxSize).toBe(5 * 1024 * 1024)
      expect(error.timestamp).toBeDefined()
    })
  })

  describe('Type Guards', () => {
    const errors: AppError[] = [
      createValidationError('Invalid input', 'email', 'test'),
      createAuthError('Invalid credentials', 'INVALID_CREDENTIALS'),
      createNotFoundError('User not found', 'user', 'user-123'),
      createDatabaseError('Query failed'),
      createNetworkError('Request failed', 500, '/api/test'),
      createHealthcareError('Invalid license', 'INVALID_MEDICAL_LICENSE'),
      createPaymentError('Payment failed', 'PAYMENT_FAILED', 'stripe'),
      createRateLimitError('Too many requests', 100, 0, new Date().toISOString()),
      createConfigurationError('Missing API key', 'API_KEY', 'string'),
      createVideoCallError('Room not found', 'ROOM_NOT_FOUND', 'room-123'),
      createFileUploadError('File too large', 'FILE_TOO_LARGE'),
    ]

    it('isValidationError should identify ValidationError correctly', () => {
      expect(isValidationError(errors[0])).toBe(true)
      expect(isValidationError(errors[1])).toBe(false)
    })

    it('isAuthError should identify AuthError correctly', () => {
      expect(isAuthError(errors[1])).toBe(true)
      expect(isAuthError(errors[0])).toBe(false)
    })

    it('isNotFoundError should identify NotFoundError correctly', () => {
      expect(isNotFoundError(errors[2])).toBe(true)
      expect(isNotFoundError(errors[0])).toBe(false)
    })

    it('isDatabaseError should identify DatabaseError correctly', () => {
      expect(isDatabaseError(errors[3])).toBe(true)
      expect(isDatabaseError(errors[0])).toBe(false)
    })

    it('isNetworkError should identify NetworkError correctly', () => {
      expect(isNetworkError(errors[4])).toBe(true)
      expect(isNetworkError(errors[0])).toBe(false)
    })

    it('isHealthcareError should identify HealthcareError correctly', () => {
      expect(isHealthcareError(errors[5])).toBe(true)
      expect(isHealthcareError(errors[0])).toBe(false)
    })

    it('isPaymentError should identify PaymentError correctly', () => {
      expect(isPaymentError(errors[6])).toBe(true)
      expect(isPaymentError(errors[0])).toBe(false)
    })

    it('isRateLimitError should identify RateLimitError correctly', () => {
      expect(isRateLimitError(errors[7])).toBe(true)
      expect(isRateLimitError(errors[0])).toBe(false)
    })

    it('isConfigurationError should identify ConfigurationError correctly', () => {
      expect(isConfigurationError(errors[8])).toBe(true)
      expect(isConfigurationError(errors[0])).toBe(false)
    })

    it('isVideoCallError should identify VideoCallError correctly', () => {
      expect(isVideoCallError(errors[9])).toBe(true)
      expect(isVideoCallError(errors[0])).toBe(false)
    })

    it('isFileUploadError should identify FileUploadError correctly', () => {
      expect(isFileUploadError(errors[10])).toBe(true)
      expect(isFileUploadError(errors[0])).toBe(false)
    })
  })

  describe('Discriminated Union Type Narrowing', () => {
    function handleErrorExample(error: AppError): string {
      switch (error.type) {
        case 'ValidationError':
          return `Validation failed for ${error.field ?? 'unknown field'}`
        case 'AuthError':
          return `Auth error: ${error.code}`
        case 'NotFoundError':
          return `Not found: ${error.resource}`
        case 'DatabaseError':
          return `Database error: ${error.message}`
        case 'NetworkError':
          return `Network error: ${error.status ?? 'unknown status'}`
        case 'HealthcareError':
          return `Healthcare error: ${error.code}`
        case 'PaymentError':
          return `Payment error: ${error.provider ?? 'unknown provider'}`
        case 'RateLimitError':
          return `Rate limit: ${error.remaining}/${error.limit}`
        case 'ConfigurationError':
          return `Configuration error: ${error.setting}`
        case 'VideoCallError':
          return `Video call error: ${error.code}`
        case 'FileUploadError':
          return `File upload error: ${error.code}`
        default:
          const _exhaustiveCheck: never = error
          return _exhaustiveCheck
      }
    }

    it('should handle all error types correctly', () => {
      expect(handleErrorExample(createValidationError('Test', 'field'))).toBe('Validation failed for field')
      expect(handleErrorExample(createAuthError('Test', 'UNAUTHORIZED'))).toBe('Auth error: UNAUTHORIZED')
      expect(handleErrorExample(createNotFoundError('Test', 'user'))).toBe('Not found: user')
      expect(handleErrorExample(createDatabaseError('Test'))).toBe('Database error: Test')
      expect(handleErrorExample(createNetworkError('Test', 404))).toBe('Network error: 404')
      expect(handleErrorExample(createHealthcareError('Test', 'DOCTOR_UNAVAILABLE'))).toBe('Healthcare error: DOCTOR_UNAVAILABLE')
      expect(handleErrorExample(createPaymentError('Test', 'PAYMENT_FAILED'))).toBe('Payment error: unknown provider')
      expect(handleErrorExample(createPaymentError('Test', 'PAYMENT_FAILED', 'stripe'))).toBe('Payment error: stripe')
      expect(handleErrorExample(createRateLimitError('Test', 100, 50, new Date().toISOString()))).toBe('Rate limit: 50/100')
      expect(handleErrorExample(createConfigurationError('Test', 'KEY', 'string'))).toBe('Configuration error: KEY')
      expect(handleErrorExample(createVideoCallError('Test', 'ROOM_NOT_FOUND'))).toBe('Video call error: ROOM_NOT_FOUND')
      expect(handleErrorExample(createFileUploadError('Test', 'FILE_TOO_LARGE'))).toBe('File upload error: FILE_TOO_LARGE')
    })
  })

  describe('User Messages', () => {
    it('should return Spanish message for ValidationError', () => {
      const error = createValidationError('Invalid input', 'email')
      expect(getUserMessage(error)).toBe('Validación fallida: Invalid input')
    })

    it('should return Spanish message for AuthError', () => {
      const error = createAuthError('Invalid credentials', 'INVALID_CREDENTIALS')
      expect(getUserMessage(error)).toBe('Error de autenticación. Por favor inicia sesión nuevamente.')
    })

    it('should return Spanish message for NotFoundError', () => {
      const error = createNotFoundError('User not found', 'user')
      expect(getUserMessage(error)).toBe('No se encontró: User not found')
    })

    it('should return Spanish message for DatabaseError', () => {
      const error = createDatabaseError('Query failed')
      expect(getUserMessage(error)).toBe('Error al guardar los cambios. Por favor intenta nuevamente.')
    })

    it('should return Spanish message for NetworkError', () => {
      const error = createNetworkError('Request failed')
      expect(getUserMessage(error)).toBe('Error de conexión. Por favor verifica tu internet e intenta nuevamente.')
    })

    it('should return Spanish message for HealthcareError', () => {
      const error = createHealthcareError('Invalid license', 'INVALID_MEDICAL_LICENSE')
      expect(getUserMessage(error)).toBe('Error médico: Invalid license')
    })

    it('should return Spanish message for PaymentError', () => {
      const error = createPaymentError('Payment failed', 'PAYMENT_FAILED')
      expect(getUserMessage(error)).toBe('Error de pago: Payment failed')
    })

    it('should return Spanish message for RateLimitError', () => {
      const error = createRateLimitError('Too many requests', 100, 0, new Date().toISOString())
      expect(getUserMessage(error)).toBe('Has excedido el límite de solicitudes. Por favor espera unos minutos.')
    })

    it('should return Spanish message for ConfigurationError', () => {
      const error = createConfigurationError('Missing API key', 'API_KEY', 'string')
      expect(getUserMessage(error)).toBe('Error de configuración del sistema. Por favor contacta soporte.')
    })

    it('should return Spanish message for VideoCallError', () => {
      const error = createVideoCallError('Room not found', 'ROOM_NOT_FOUND')
      expect(getUserMessage(error)).toBe('Error de video: Room not found')
    })

    it('should return Spanish message for FileUploadError', () => {
      const error = createFileUploadError('File too large', 'FILE_TOO_LARGE')
      expect(getUserMessage(error)).toBe('Error al subir archivo: File too large')
    })
  })

  describe('withErrorHandling', () => {
    it('should return data on success', async () => {
      const { data, error } = await withErrorHandling(async () => {
        return 'success'
      })
      expect(data).toBe('success')
      expect(error).toBeUndefined()
    })

    it('should return error on thrown AppError', async () => {
      const { data, error } = await withErrorHandling(async () => {
        throw createAuthError('Test error', 'UNAUTHORIZED')
      })
      expect(data).toBeUndefined()
      expect(error).toBeDefined()
      expect(error?.type).toBe('AuthError')
      if (error && isAuthError(error)) {
        expect(error.code).toBe('UNAUTHORIZED')
      }
    })

    it('should return error on thrown regular Error', async () => {
      const { data, error } = await withErrorHandling(async () => {
        throw new Error('Regular error')
      })
      expect(data).toBeUndefined()
      expect(error).toBeDefined()
      expect(error?.type).toBe('DatabaseError')
      expect(error?.message).toBe('Regular error')
    })

    it('should return error on thrown non-Error value', async () => {
      const { data, error } = await withErrorHandling(async () => {
        throw 'string error'
      })
      expect(data).toBeUndefined()
      expect(error).toBeDefined()
      expect(error?.type).toBe('DatabaseError')
      expect(error?.message).toBe('Unknown error occurred')
    })

    it('should call error handler when provided', async () => {
      const mockHandler = vi.fn()
      await withErrorHandling(async () => {
        throw new Error('Test')
      }, mockHandler)
      expect(mockHandler).toHaveBeenCalledTimes(1)
    })
  })
})
