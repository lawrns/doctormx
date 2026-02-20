/**
 * Client-Side Error Handler
 *
 * This module contains client-safe error handling functions.
 * Separated from handler.ts which contains server-only code (NextResponse).
 *
 * Usage in React components:
 * ```tsx
 * import { handleClientError, createToastError } from '@/lib/errors/client-handler'
 * import { useTranslations } from 'next-intl';
 * 
 * function MyComponent() {
 *   const t = useTranslations('errors');
 *   // Use t() for translated error messages
 * }
 * ```
 */

import type { AppError } from './AppError';
import type { EmergencyDetectedError } from './AppError';
import { logger } from '@/lib/observability/logger';
import {
  ERROR_CODES,
  getErrorTranslationKey,
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
 * Get translated error message using next-intl's t function
 * 
 * Usage:
 * ```tsx
 * const t = useTranslations('errors');
 * const message = getTranslatedErrorMessage(error, t);
 * ```
 */
export function getTranslatedErrorMessage(
  error: AppError | string,
  t: (key: string) => string
): string {
  const code = typeof error === 'string' ? error : error.code;
  const translationKey = getErrorTranslationKey(code);
  
  if (translationKey) {
    // Extract the nested key path (e.g., 'errors.medical.recordError' -> 'medical.recordError')
    const keyParts = translationKey.replace('errors.', '').split('.');
    if (keyParts.length === 2) {
      const [category, key] = keyParts;
      // Try to get the translation - t function from useTranslations handles nested keys
      try {
        const translated = t(`${category}.${key}`);
        if (translated && translated !== `${category}.${key}`) {
          return translated;
        }
      } catch {
        // Translation not found, fall through to generic
      }
    }
  }
  
  // Return generic error message
  return t('generic.unknown');
}

/**
 * Get error title based on error type
 * 
 * Usage:
 * ```tsx
 * const t = useTranslations('errors');
 * const title = getErrorTitle(error, t);
 * ```
 */
export function getErrorTitle(
  error: AppError | string,
  t: (key: string) => string
): string {
  const code = typeof error === 'string' ? error : error.code;
  
  // Determine title based on error code prefix
  if (code.startsWith('EMG_')) {
    return t('titles.medicalAttentionRequired');
  }
  if (code.startsWith('AUTH_')) {
    return t('titles.authentication');
  }
  if (code.startsWith('VAL_')) {
    return t('titles.validation');
  }
  if (code.startsWith('RATE_')) {
    return t('titles.limitReached');
  }
  
  return t('titles.error');
}

/**
 * Legacy client-side error handler for React components
 * Returns user-friendly message and logs to console
 *
 * CLIENT-SAFE: Can be used in 'use client' components
 * 
 * @deprecated Use getTranslatedErrorMessage with useTranslations hook for i18n support
 */
export function handleClientError(
  error: unknown,
  context?: Omit<ErrorContext, 'ipAddress' | 'userAgent'>
): string {
  logError(error, context);

  if (error instanceof Error && 'code' in error) {
    // Fallback to legacy message or generic
    const appError = error as AppError;
    const { getPatientMessage } = require('./messages');
    return getPatientMessage(appError);
  }

  return 'Ha ocurrido un error. Por favor, intente nuevamente.';
}

/**
 * Create a toast/notification friendly error object
 * for use with UI components like Sonner
 *
 * CLIENT-SAFE: Can be used in 'use client' components
 * 
 * For i18n support, use createTranslatedToastError instead
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
 * Create a toast/notification friendly error object with i18n support
 * for use with UI components like Sonner
 *
 * CLIENT-SAFE: Can be used in 'use client' components
 * 
 * Usage:
 * ```tsx
 * const t = useTranslations('errors');
 * const toastError = createTranslatedToastError(error, t);
 * toast.error(toastError.title, { description: toastError.description });
 * ```
 */
export function createTranslatedToastError(
  error: unknown,
  t: (key: string) => string
): {
  title: string;
  description: string;
  variant?: 'destructive' | 'warning' | 'default';
} {
  let title = t('titles.error');
  let description: string;
  let variant: 'destructive' | 'warning' | 'default' = 'default';

  if (error instanceof Error && 'code' in error) {
    const appError = error as AppError;
    description = getTranslatedErrorMessage(appError, t);

    // Determine variant based on severity
    if (appError.statusCode >= 500 || isEmergencyError(appError)) {
      variant = 'destructive';
    } else if (appError.statusCode >= 400) {
      variant = 'warning';
    }

    // Set title based on error type
    switch (appError.name) {
      case 'EmergencyDetectedError':
        title = t('titles.medicalAttentionRequired');
        break;
      case 'ValidationError':
        title = t('titles.validation');
        break;
      case 'AuthenticationError':
        title = t('titles.authentication');
        break;
      case 'RateLimitError':
        title = t('titles.limitReached');
        break;
      default:
        title = t('titles.error');
    }
  } else if (error instanceof Error) {
    description = error.message || t('generic.unknown');
  } else {
    description = t('generic.unknown');
  }

  return { title, description, variant };
}

/**
 * Error boundary fallback component helper
 * Extracts error info for display
 *
 * CLIENT-SAFE: Can be used in ErrorBoundary components
 * 
 * For i18n support, use getTranslatedErrorInfo instead
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
      : 'Algo Salió Mal',
    message: handleClientError(error),
    showRetry: isOperational && !isEmergency,
    showHome: !isEmergency
  };
}

/**
 * Error boundary fallback component helper with i18n support
 * Extracts error info for display
 *
 * CLIENT-SAFE: Can be used in ErrorBoundary components
 * 
 * Usage:
 * ```tsx
 * const t = useTranslations('errors');
 * const errorInfo = getTranslatedErrorInfo(error, t);
 * ```
 */
export function getTranslatedErrorInfo(
  error: unknown,
  t: (key: string) => string
): {
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

  let message: string;
  if (error instanceof Error && 'code' in error) {
    message = getTranslatedErrorMessage(error as AppError, t);
  } else if (error instanceof Error) {
    message = error.message || t('generic.unknown');
  } else {
    message = t('generic.unknown');
  }

  return {
    title: isEmergency
      ? t('titles.medicalAttentionRequired')
      : t('titles.somethingWentWrong'),
    message,
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
    const error = Object.assign(new Error(`Field "${fieldName}" is required`), {
      code,
      statusCode: 400,
      isOperational: true,
      field: fieldName,
    }) as Error & { code: string; statusCode: number; isOperational: boolean; field: string };
    throw error;
  }
}

/**
 * Hook for using error translations in client components
 * Returns helper functions that use the next-intl t function
 * 
 * Usage:
 * ```tsx
 * import { useErrorTranslations } from '@/lib/errors/client-handler';
 * 
 * function MyComponent() {
 *   const t = useTranslations('errors');
 *   const { getErrorMessage, getErrorTitle, createToastError } = useErrorTranslations(t);
 *   
 *   const handleError = (error) => {
 *     const { title, description } = createToastError(error);
 *     toast.error(title, { description });
 *   };
 * }
 * ```
 */
export function useErrorTranslations(t: (key: string) => string) {
  return {
    /**
     * Get translated error message for an error
     */
    getErrorMessage: (error: AppError | string) => getTranslatedErrorMessage(error, t),
    
    /**
     * Get translated error title for an error
     */
    getErrorTitle: (error: AppError | string) => getErrorTitle(error, t),
    
    /**
     * Create a toast error object with translations
     */
    createToastError: (error: unknown) => createTranslatedToastError(error, t),
    
    /**
     * Get error info for error boundaries with translations
     */
    getErrorInfo: (error: unknown) => getTranslatedErrorInfo(error, t),
    
    /**
     * Get generic error messages
     */
    genericMessages: {
      unknown: t('generic.unknown'),
      internalError: t('generic.internalError'),
      unexpected: t('generic.unexpected'),
    },
    
    /**
     * Get error titles
     */
    titles: {
      error: t('titles.error'),
      attentionRequired: t('titles.attentionRequired'),
      validation: t('titles.validation'),
      authentication: t('titles.authentication'),
      limitReached: t('titles.limitReached'),
      medicalAttentionRequired: t('titles.medicalAttentionRequired'),
      somethingWentWrong: t('titles.somethingWentWrong'),
    }
  };
}
