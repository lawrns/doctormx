/**
 * Server-Side Error Handler
 *
 * SERVER-ONLY: This module uses NextResponse which is only available on the server.
 * Do not import this file in client components ('use client').
 *
 * For client-side error handling, use '@/lib/errors/client-handler' instead.
 *
 * Usage in API routes:
 * ```ts
 * import { handleError, withErrorHandling } from '@/lib/errors/handler'
 * ```
 *
 * @module lib/errors/handler
 * @server-only
 */

import { NextResponse } from 'next/server';
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
 * Error context for logging (server-side includes IP)
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  route?: string;
  method?: string;
  userAgent?: string;
  ipAddress?: string;
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

  // Log to console with appropriate level
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
  // Sentry.captureException(error, { extra: context });
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
 * Handle error and return appropriate NextResponse
 * This is the main error handler for API routes
 */
export async function handleError(
  error: unknown,
  context: ErrorContext = {}
): Promise<NextResponse> {
  // Log the error
  logError(error, context);

  // Determine if it's an AppError
  if (error instanceof Error && 'code' in error) {
    const appError = error as AppError;

    // Check for emergency errors - may need special handling
    if (isEmergencyError(appError)) {
      return handleEmergencyError(appError);
    }

    // Return formatted error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: appError.code,
          message: getPatientMessage(appError),
          developerMessage: getDeveloperMessage(appError),
          ...(appError.toJSON() as object)
        }
      },
      { status: appError.statusCode }
    );
  }

  // Handle standard errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Ha ocurrido un error interno. Por favor, intente nuevamente.',
          developerMessage: error.message
        }
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.',
        developerMessage: String(error)
      }
    },
    { status: 500 }
  );
}

/**
 * Handle emergency-detected errors with special response
 */
function handleEmergencyError(error: AppError): NextResponse {
  const emergencyError = error as EmergencyDetectedError;

  return NextResponse.json(
    {
      success: false,
      error: {
        code: emergencyError.code,
        message: getPatientMessage(emergencyError),
        developerMessage: getDeveloperMessage(emergencyError),
        severity: emergencyError.severity,
        detectedSymptoms: emergencyError.detectedSymptoms,
        requiresImmediateAction: true,
        emergencyContact: {
          phone: '911',
          message: 'Si sus síntomas son graves, llame al 911 o acuda a urgencias.'
        }
      }
    },
    { status: emergencyError.statusCode || 422 }
  );
}

/**
 * Wrap an async function with error handling
 * Useful for API route handlers
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>,
  context?: ErrorContext
): Promise<T | NextResponse> {
  return handler().catch((error) => handleError(error, context));
}

/**
 * Create an error handler for a specific route
 * Provides route-specific context automatically
 */
export function createRouteHandler(route: string, method: string) {
  return async (
    handler: () => Promise<NextResponse>,
    requestContext?: Partial<ErrorContext>
  ): Promise<NextResponse> => {
    const context: ErrorContext = {
      route,
      method,
      ...requestContext
    };

    try {
      return await handler();
    } catch (error) {
      return handleError(error, context);
    }
  };
}

/**
 * Client-side error handler for React components
 * Returns user-friendly message and logs to console
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

/**
 * Async wrapper that throws standardized errors
 */
export async function throwOnError<T>(
  promise: Promise<T>,
  errorCode: string,
  errorMessage: string
): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    const appError = new Error(errorMessage) as any;
    appError.code = errorCode;
    appError.statusCode = 500;
    appError.isOperational = true;
    appError.originalError = error;
    throw appError;
  }
}

