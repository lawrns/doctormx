/**
 * Global Error Handler System for Doctor.mx
 *
 * This module provides comprehensive error handling with:
 * - Healthcare-specific error types
 * - Spanish patient-friendly messages
 * - English developer messages
 * - Structured logging with context
 * - Emergency detection handling
 * - Full i18n support via next-intl
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
 * // Handle in API route (legacy)
 * try {
 *   // ... code
 * } catch (error) {
 *   return handleError(error, { userId, route: '/api/ai/consult' });
 * }
 *
 * // Handle in API route with i18n (recommended)
 * try {
 *   // ... code
 * } catch (error) {
 *   return handleErrorAsync(error, { userId, route: '/api/ai/consult', locale: 'es' });
 * }
 * ```
 *
 * @example
 * ```tsx
 * // In client components with i18n
 * import { useErrorTranslations } from '@/lib/errors/client-handler';
 * import { useTranslations } from 'next-intl';
 *
 * function MyComponent() {
 *   const t = useTranslations('errors');
 *   const { getErrorMessage, createToastError } = useErrorTranslations(t);
 *   
 *   const handleError = (error) => {
 *     const { title, description } = createToastError(error);
 *     toast.error(title, { description });
 *   };
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
  handleErrorAsync,
  logError,
  withErrorHandling,
  withErrorHandlingAsync,
  createRouteHandler,
  createRouteHandlerAsync,
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
  getPatientMessageAsync,
  getDeveloperMessage,
  isValidErrorCode,
  getEmergencyErrorCodes,
  isEmergencyError,
  getErrorTranslationKey,
} from './messages';

// Re-export types for convenience
export type { AppError as AppErrorType } from './AppError';
export type { ErrorContext } from './handler';

// Client-specific exports (can be used in 'use client' components)
// Import from '@/lib/errors/client-handler' for client-side code
export {
  handleClientError as handleClientErrorLegacy,
  createToastError as createToastErrorLegacy,
  getErrorInfo as getErrorInfoLegacy,
} from './client-handler';
