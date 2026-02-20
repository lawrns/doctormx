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
import { AppError, ValidationError } from './AppError';
import type { EmergencyDetectedError } from './AppError';
import { logger } from '@/lib/observability/logger';
import {
  getPatientMessage,
  getPatientMessageAsync,
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
  locale?: string;
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
    const severity = emergencyError.severity ?? 'critical';
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
 * 
 * Note: For i18n support, use handleErrorAsync instead
 * @deprecated Use handleErrorAsync for full i18n support
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
      return handleEmergencyError(appError, context.locale);
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
          message: context.locale === 'en' 
            ? 'An internal error has occurred. Please try again.'
            : 'Ha ocurrido un error interno. Por favor, intente nuevamente.',
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
        message: context.locale === 'en'
          ? 'An unexpected error has occurred. Please try again.'
          : 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.',
        developerMessage: String(error)
      }
    },
    { status: 500 }
  );
}

/**
 * Handle error with i18n support
 * This is the recommended error handler for API routes with full translation support
 * 
 * Usage:
 * ```ts
 * return await handleErrorAsync(error, { locale: 'es' });
 * ```
 */
export async function handleErrorAsync(
  error: unknown,
  context: ErrorContext = {}
): Promise<NextResponse> {
  // Log the error
  logError(error, context);

  // Determine if it's an AppError
  if (error instanceof Error && 'code' in error) {
    const appError = error as AppError;

    // Get translated message
    const patientMessage = await getPatientMessageAsync(appError, context.locale);

    // Check for emergency errors - may need special handling
    if (isEmergencyError(appError)) {
      return handleEmergencyErrorAsync(appError, context.locale);
    }

    // Return formatted error response
    return NextResponse.json(
      {
        success: false,
        error: {
          code: appError.code,
          message: patientMessage,
          developerMessage: getDeveloperMessage(appError),
          ...(appError.toJSON() as object)
        }
      },
      { status: appError.statusCode }
    );
  }

  // Handle standard errors
  if (error instanceof Error) {
    const genericMessage = await getGenericErrorMessage(context.locale, 'internalError');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: genericMessage,
          developerMessage: error.message
        }
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  const genericMessage = await getGenericErrorMessage(context.locale, 'unexpected');
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: genericMessage,
        developerMessage: String(error)
      }
    },
    { status: 500 }
  );
}

/**
 * Helper to get generic error messages with i18n
 */
async function getGenericErrorMessage(locale: string | undefined, key: 'unknown' | 'internalError' | 'unexpected'): Promise<string> {
  const { getTranslations } = await import('next-intl/server');
  const t = await getTranslations({ locale: locale ?? 'es', namespace: 'errors' });
  return t(`generic.${key}`);
}

/**
 * Handle emergency-detected errors with special response
 * @deprecated Use handleEmergencyErrorAsync for i18n support
 */
function handleEmergencyError(error: AppError, locale?: string): NextResponse {
  const emergencyError = error as EmergencyDetectedError;

  const emergencyContactMessage = locale === 'en'
    ? 'If your symptoms are severe, call 911 or go to the emergency room.'
    : 'Si sus síntomas son graves, llame al 911 o acuda a urgencias.';

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
          message: emergencyContactMessage
        }
      }
    },
    { status: emergencyError.statusCode || 422 }
  );
}

/**
 * Handle emergency-detected errors with i18n support
 */
async function handleEmergencyErrorAsync(error: AppError, locale?: string): Promise<NextResponse> {
  const emergencyError = error as EmergencyDetectedError;

  const { getTranslations } = await import('next-intl/server');
  const t = await getTranslations({ locale: locale ?? 'es', namespace: 'errors' });
  
  const patientMessage = await getPatientMessageAsync(error, locale);
  const emergencyContactMessage = t('emergency.contact911');

  return NextResponse.json(
    {
      success: false,
      error: {
        code: emergencyError.code,
        message: patientMessage,
        developerMessage: getDeveloperMessage(emergencyError),
        severity: emergencyError.severity,
        detectedSymptoms: emergencyError.detectedSymptoms,
        requiresImmediateAction: true,
        emergencyContact: {
          phone: '911',
          message: emergencyContactMessage
        }
      }
    },
    { status: emergencyError.statusCode || 422 }
  );
}

/**
 * Wrap an async function with error handling
 * Useful for API route handlers
 * 
 * @deprecated Use withErrorHandlingAsync for i18n support
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>,
  context?: ErrorContext
): Promise<T | NextResponse> {
  return handler().catch((error) => handleError(error, context));
}

/**
 * Wrap an async function with error handling and i18n support
 * Useful for API route handlers
 * 
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return withErrorHandlingAsync(async () => {
 *     // Your handler code
 *   }, { locale: 'es' });
 * }
 * ```
 */
export function withErrorHandlingAsync<T>(
  handler: () => Promise<T>,
  context?: ErrorContext
): Promise<T | NextResponse> {
  return handler().catch((error) => handleErrorAsync(error, context));
}

/**
 * Create an error handler for a specific route
 * Provides route-specific context automatically
 * 
 * @deprecated Use createRouteHandlerAsync for i18n support
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
 * Create an error handler for a specific route with i18n support
 * Provides route-specific context automatically
 * 
 * Usage:
 * ```ts
 * const handler = createRouteHandlerAsync('/api/consult', 'POST');
 * return await handler(async () => { ... }, { locale: 'es' });
 * ```
 */
export function createRouteHandlerAsync(route: string, method: string) {
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
      return handleErrorAsync(error, context);
    }
  };
}

/**
 * Client-side error handler for React components
 * Returns user-friendly message and logs to console
 * 
 * Note: This is kept in server handler for backward compatibility.
 * For client components, import from '@/lib/errors/client-handler' instead.
 */
export function handleClientError(
  error: unknown,
  context?: Omit<ErrorContext, 'ipAddress' | 'userAgent'>
): string {
  logError(error, context);

  if (error instanceof Error && 'code' in error) {
    return getPatientMessage(error as AppError);
  }

  return context?.locale === 'en'
    ? 'An error has occurred. Please try again.'
    : 'Ha ocurrido un error. Por favor, intente nuevamente.';
}

/**
 * Create a toast/notification friendly error object
 * for use with UI components like Sonner
 * 
 * Note: This is kept in server handler for backward compatibility.
 * For client components, import from '@/lib/errors/client-handler' instead.
 */
export function createToastError(error: unknown, locale?: string): {
  title: string;
  description: string;
  variant?: 'destructive' | 'warning' | 'default';
} {
  let title = locale === 'en' ? 'Error' : 'Error';
  let description = handleClientError(error, { locale });
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
        title = locale === 'en' ? 'Attention Required' : 'Atención Requerida';
        break;
      case 'ValidationError':
        title = locale === 'en' ? 'Validation' : 'Validación';
        break;
      case 'AuthenticationError':
        title = locale === 'en' ? 'Authentication' : 'Autenticación';
        break;
      case 'RateLimitError':
        title = locale === 'en' ? 'Limit Reached' : 'Límite Alcanzado';
        break;
      default:
        title = locale === 'en' ? 'Error' : 'Error';
    }
  }

  return { title, description, variant };
}

/**
 * Error boundary fallback component helper
 * Extracts error info for display
 */
export function getErrorInfo(error: unknown, locale?: string): {
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
      ? (locale === 'en' ? 'Medical Attention Required' : 'Atención Médica Requerida')
      : (locale === 'en' ? 'Something Went Wrong' : 'Algo Salió Mal'),
    message: handleClientError(error, { locale }),
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
    throw new ValidationError(
      code,
      `Field "${fieldName}" is required`,
      fieldName
    );
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
    throw new AppError(errorCode, 500, errorMessage, true);
  }
}
