/**
 * Client-Side Error Handler
 *
 * This module contains client-safe error handling functions.
 * Separated from handler.ts which contains server-only code (NextResponse).
 *
 * Usage in React components:
 * ```tsx
 * import { handleClientError, createToastError } from '@/lib/errors/client-handler'
 * ```
 */

import type { AppError } from './AppError';
import type { EmergencyDetectedError } from './AppError';
import { logger } from '@/lib/observability/logger';
import {
  getPatientMessage,
  getDeveloperMessage,
  isEmergencyError,
} from './messages';

/**
 * Error severity levels for logging
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error context for logging
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  method?: string;
  userAgent?: string;
  timestamp?: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Structured error log entry
 */
interface ErrorLogEntry {
  severity: ErrorSeverity;
  code: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  isOperational: boolean;
  timestamp: string;
}

/**
 * Log error to console (and potentially external logging service)
 * In production, this should integrate with Sentry, DataDog, etc.
 *
 * CLIENT-SAFE: Uses console for logging instead of server-side logger
 */
export function logError(error: unknown, context: ErrorContext = {}): void {
  const timestamp = new Date().toISOString();

  // Ensure timestamp is in context
  context.timestamp = timestamp;

  let logEntry: ErrorLogEntry;

  if (error instanceof Error && 'code' in error) {
    // It's an AppError or subclass
    const appError = error as AppError;

    logEntry = {
      severity: determineSeverity(appError),
      code: appError.code,
      message: appError.message,
      stack: appError.stack,
      context,
      isOperational: appError.isOperational,
      timestamp
    };

    // Special handling for emergency errors
    if ('severity' in appError && typeof appError.severity === 'string') {
      logEntry.severity = appError.severity as ErrorSeverity;
    }
  } else if (error instanceof Error) {
    // Standard Error
    logEntry = {
      severity: ErrorSeverity.HIGH,
      code: 'UNKNOWN_ERROR',
      message: error.message,
      stack: error.stack,
      context,
      isOperational: false,
      timestamp
    };
  } else {
    // Unknown error type
    logEntry = {
      severity: ErrorSeverity.MEDIUM,
      code: 'UNKNOWN_ERROR',
      message: String(error),
      context,
      isOperational: false,
      timestamp
    };
  }

  // Log to logger with appropriate level
  const { severity, ...logContext } = logEntry;
  const message = `[ERROR] ${logEntry.message}`;

  switch (logEntry.severity) {
    case ErrorSeverity.CRITICAL:
    case ErrorSeverity.HIGH:
      logger.error(message, logContext);
      break;
    case ErrorSeverity.MEDIUM:
      logger.warn(message, logContext);
      break;
    case ErrorSeverity.LOW:
      logger.info(message, logContext);
      break;
  }

  // FUTURE_ENHANCEMENT: Send to external logging service (Sentry, DataDog, etc.)
  // if (typeof window !== 'undefined') {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * Determine error severity based on error type and code
 */
function determineSeverity(error: AppError): ErrorSeverity {
  // Emergency errors are always critical
  if (error.name === 'EmergencyDetectedError') {
    const emergencyError = error as EmergencyDetectedError;
    const severity = emergencyError.severity || 'critical';
    // Convert lowercase severity to enum
    const severityMap: Record<string, ErrorSeverity> = {
      'low': ErrorSeverity.LOW,
      'medium': ErrorSeverity.MEDIUM,
      'high': ErrorSeverity.HIGH,
      'critical': ErrorSeverity.CRITICAL,
    };
    return severityMap[severity] || ErrorSeverity.CRITICAL;
  }

  // Red flag detection is high severity
  if (error.code === 'MED_004') {
    return ErrorSeverity.HIGH;
  }

  // Authentication/authorization are medium severity
  if (error.statusCode === 401 || error.statusCode === 403) {
    return ErrorSeverity.MEDIUM;
  }

  // Validation errors are low severity
  if (error.statusCode === 400) {
    return ErrorSeverity.LOW;
  }

  // Server errors (500+) are high severity
  if (error.statusCode >= 500) {
    return ErrorSeverity.HIGH;
  }

  // Default to medium
  return ErrorSeverity.MEDIUM;
}

/**
 * Client-side error handler for React components
 * Returns user-friendly message and logs to console
 *
 * CLIENT-SAFE: Can be used in 'use client' components
 */
export function handleClientError(
  error: unknown,
  context?: Omit<ErrorContext, 'ipAddress' | 'userAgent'>
): string {
  logError(error, context);

  if (error instanceof Error && 'code' in error) {
    return getPatientMessage(error as AppError);
  }

  return 'Ha ocurrido un error. Por favor, intente nuevamente.';
}

/**
 * Create a toast/notification friendly error object
 * for use with UI components like Sonner
 *
 * CLIENT-SAFE: Can be used in 'use client' components
 */
export function createToastError(error: unknown): {
  title: string;
  description: string;
  variant?: 'destructive' | 'warning' | 'default';
} {
  let title = 'Error';
  let description = handleClientError(error);
  let variant: 'destructive' | 'warning' | 'default' = 'default';

  if (error instanceof Error && 'code' in error) {
    const appError = error as AppError;

    // Determine variant based on severity
    if (appError.statusCode >= 500 || isEmergencyError(appError)) {
      variant = 'destructive';
    } else if (appError.statusCode >= 400) {
      variant = 'warning';
    }

    // Set title based on error type
    switch (appError.name) {
      case 'EmergencyDetectedError':
        title = 'Atención Requerida';
        break;
      case 'ValidationError':
        title = 'Validación';
        break;
      case 'AuthenticationError':
        title = 'Autenticación';
        break;
      case 'RateLimitError':
        title = 'Límite Alcanzado';
        break;
      default:
        title = 'Error';
    }
  }

  return { title, description, variant };
}

/**
 * Error boundary fallback component helper
 * Extracts error info for display
 *
 * CLIENT-SAFE: Can be used in ErrorBoundary components
 */
export function getErrorInfo(error: unknown): {
  title: string;
  message: string;
  showRetry: boolean;
  showHome: boolean;
} {
  const isEmergency = error instanceof Error && 'code' in error
    ? isEmergencyError(error as AppError)
    : false;

  const isOperational = error instanceof Error && 'isOperational' in error
    ? (error as AppError).isOperational
    : false;

  return {
    title: isEmergency
      ? 'Atención Médica Requerida'
      : 'Algo Saló Mal',
    message: handleClientError(error),
    showRetry: isOperational && !isEmergency,
    showHome: !isEmergency
  };
}

/**
 * Type guard to check if error is an AppError
 *
 * CLIENT-SAFE: Can be used anywhere
 */
export function isAppError(error: unknown): error is AppError {
  return (
    error instanceof Error &&
    'code' in error &&
    'statusCode' in error &&
    'isOperational' in error
  );
}

/**
 * Assert that a value is not null/undefined
 * Throws a ValidationError if it is
 *
 * CLIENT-SAFE: Can be used in client code for runtime validation
 */
export function assertPresent<T>(
  value: T | null | undefined,
  fieldName: string,
  code = 'VAL_003'
): asserts value is T {
  if (value === null || value === undefined) {
    const error = new Error(`Field "${fieldName}" is required`) as any;
    error.code = code;
    error.statusCode = 400;
    error.isOperational = true;
    error.field = fieldName;
    throw error;
  }
}
