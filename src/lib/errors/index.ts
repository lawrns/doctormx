/**
 * Global Error Handler System for Doctor.mx
 *
 * This module provides comprehensive error handling with:
 * - Healthcare-specific error types
 * - Spanish patient-friendly messages
 * - English developer messages
 * - Structured logging with context
 * - Emergency detection handling
 *
 * @example
 * ```typescript
 * import { EmergencyDetectedError, handleError } from '@/lib/errors';
 *
 * // Throw an error
 * throw new EmergencyDetectedError(
 *   'EMG_001',
 *   'Critical symptoms detected',
 *   'critical',
 *   ['chest pain', 'shortness of breath']
 * );
 *
 * // Handle in API route
 * try {
 *   // ... code
 * } catch (error) {
 *   return handleError(error, { userId, route: '/api/ai/consult' });
 * }
 * ```
 */

// Export all error classes
export {
  AppError,
  MedicalError,
  EmergencyDetectedError,
  PrescriptionError,
  DiagnosisError,
  AppointmentError,
  AuthenticationError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ExternalServiceError,
  ConsentError,
  PaymentError,
  VideoConsultationError
} from './AppError';

// Export error handler functions
export {
  handleError,
  logError,
  withErrorHandling,
  createRouteHandler,
  handleClientError,
  createToastError,
  getErrorInfo,
  isAppError,
  assertPresent,
  throwOnError,
  ErrorSeverity
} from './handler';

// Export error messages and utilities
export {
  ERROR_CODES,
  PATIENT_MESSAGES,
  DEVELOPER_MESSAGES,
  getPatientMessage,
  getDeveloperMessage,
  isValidErrorCode,
  getEmergencyErrorCodes,
  isEmergencyError
} from './messages';

// Re-export types for convenience
export type { AppError as AppErrorType } from './AppError';
export type { ErrorContext } from './handler';

