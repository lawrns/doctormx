'use client'

import React from 'react'
import { ErrorFallback, ErrorFallbackProps } from './ErrorFallback'
import { captureException } from '@/utils/sentry'
import { logger } from '@/lib/observability/logger'

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary Props
 */
export interface ErrorBoundaryProps {
  /**
   * Children to render
   */
  children: React.ReactNode

  /**
   * Custom fallback component
   */
  fallback?: React.ComponentType<ErrorFallbackProps>

  /**
   * Callback when error is caught
   */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void

  /**
   * Callback for recovery/reset
   */
  onReset?: () => void

  /**
   * Reset keys that trigger reset when changed
   */
  resetKeys?: Array<string | number>

  /**
   * Context name for logging (e.g., 'Dashboard', 'Chat', 'Booking')
   */
  context?: string
}

/**
 * ErrorBoundary Component - ARCH-012
 *
 * Class-based error boundary that catches JavaScript errors anywhere in the
 * component tree, logs them to Sentry, and displays a fallback UI.
 *
 * Features:
 * - Error catching with getDerivedStateFromError
 * - Sentry integration for error reporting
 * - Custom fallback UI with retry functionality
 * - Reset capability via reset keys or manual reset
 * - WCAG 2.1 AA compliant
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * <ErrorBoundary
 *   fallback={CustomFallback}
 *   context="Dashboard"
 *   onError={(error, info) => console.log(error, info)}
 * >
 *   <Dashboard />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: NodeJS.Timeout | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo })

    const { context, onError } = this.props

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.error(`[ErrorBoundary${context ? `:${context}` : ''}] Error caught:`, {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      })
    }

    // Send to Sentry for error tracking
    captureException(error, {
      errorBoundary: context || 'generic',
      componentStack: errorInfo.componentStack,
      hasErrorInfo: true,
    })

    // Call optional error handler prop
    if (onError) {
      onError(error, errorInfo)
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props
    const { hasError } = this.state

    // If error boundary is in error state and resetKeys change, reset
    if (hasError && resetKeys && resetKeys.length > 0) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      )

      if (hasResetKeyChanged) {
        this.handleReset()
      }
    }
  }

  componentWillUnmount(): void {
    // Clean up any pending timeouts
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  handleReset = (): void => {
    const { onReset } = this.props

    // Call optional onReset callback
    if (onReset) {
      onReset()
    }

    // Clear the error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleRetry = (): void => {
    // Add a small delay to allow the UI to update before resetting
    this.resetTimeoutId = setTimeout(() => {
      this.handleReset()
    }, 100)
  }

  render(): React.ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback: CustomFallback, context } = this.props

    if (hasError) {
      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            context={context}
          />
        )
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={this.handleRetry}
          context={context}
        />
      )
    }

    return children
  }
}

/**
 * withErrorBoundary HOC
 * Wraps a component with error boundary for easy usage
 *
 * @example
 * ```tsx
 * const SafeComponent = withErrorBoundary(MyComponent, {
 *   context: 'MyFeature',
 *   fallback: MyCustomFallback,
 * })
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`

  return WrappedComponent
}

export default ErrorBoundary
