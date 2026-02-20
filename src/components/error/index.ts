/**
 * Error Boundaries - ARCH-012
 *
 * Centralized error boundary components for graceful failure handling.
 * All components are WCAG 2.1 AA compliant and integrated with Sentry.
 *
 * @module error
 */

// Main ErrorBoundary component
export {
  ErrorBoundary,
  withErrorBoundary,
  type ErrorBoundaryProps,
} from './ErrorBoundary'

// ErrorFallback component
export {
  ErrorFallback,
  CompactErrorFallback,
  type ErrorFallbackProps,
} from './ErrorFallback'

// Re-export from existing ui/error for convenience
export {
  ErrorState,
  InlineError,
  FormError,
  ApiError,
  type ErrorStateProps,
} from '@/components/ui/error/error-state'

export {
  RetryButton,
  SmartRetryButton,
  useRetry,
} from '@/components/ui/error/retry-button'
