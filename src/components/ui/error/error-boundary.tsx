'use client'

import React from 'react'
import {
  ErrorBoundaryAdapter,
  FallbackRenderProps,
  ErrorState,
} from './ErrorBoundaryAdapter'
import { logger } from '@/lib/observability/logger'

/**
 * Enhanced Error Boundary Component - WCAG 2.1 AA Compliant
 *
 * Catches JavaScript errors anywhere in component tree,
 * logs them, and displays a fallback UI.
 *
 * Features:
 * - Error logging to observability platform
 * - User-friendly error messages in Spanish
 * - Recovery actions
 * - Development mode error details
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 *
 * <ErrorBoundary
 *   fallback={({ error, resetErrorBoundary }) => <CustomFallback error={error} onRetry={resetErrorBoundary} />}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */

export interface ErrorBoundaryProps {
  /**
   * Fallback component to render on error
   */
  fallback?: React.ComponentType<FallbackRenderProps>
  fallbackRender?: (props: FallbackRenderProps) => React.ReactNode

  /**
   * Callback when error is caught
   * error is unknown (as per library v5.x)
   */
  onError?: (error: unknown, errorInfo: React.ErrorInfo) => void

  /**
   * Callback for recovery
   */
  onReset?: () => void

  /**
   * Reset keys that trigger reset when changed
   */
  resetKeys?: Array<string | number>

  /**
   * Children to render
   */
  children: React.ReactNode
}

const defaultFallback = ({ error, resetErrorBoundary }: FallbackRenderProps) => {
  // Narrow error from unknown to Error for display
  const errorObj = error instanceof Error ? error : new Error(String(error))

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <ErrorState
        title="Algo inesperado ocurrió"
        message="Lo sentimos, hubo un error. Si continúa, contacta a soporte."
        onRetry={resetErrorBoundary}
        retryText="Recargar página"
        type="generic"
        errorCode={process.env.NODE_ENV === 'development' ? errorObj.name : undefined}
      />
    </div>
  )
}

export function ErrorBoundary({
  fallback = defaultFallback,
  onError,
  onReset,
  resetKeys = [],
  children,
}: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryAdapter
      fallback={fallback}
      fallbackRender={undefined}
      onError={onError}
      onReset={onReset}
      resetKeys={resetKeys}
    >
      {children}
    </ErrorBoundaryAdapter>
  )
}

/**
 * withErrorBoundary HOC
 * Wraps a component with error boundary
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

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

/**
 * useErrorHandler Hook
 * Allows throwing errors from event handlers
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  if (error) {
    throw error
  }

  return setError
}

/**
 * AsyncErrorBoundary - For async operation errors
 */
interface AsyncErrorBoundaryState {
  error: Error | null
}

export class AsyncErrorBoundary extends React.Component<
  {
    fallback?: React.ComponentType<FallbackRenderProps>
    children: React.ReactNode
  },
  AsyncErrorBoundaryState
> {
  constructor(props: { fallback?: React.ComponentType<FallbackRenderProps>; children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('AsyncErrorBoundary:', { error: error.message, errorInfo })
    }
  }

  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback || defaultFallback
      return (
        <Fallback
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ error: null })}
        />
      )
    }

    return this.props.children
  }
}

/**
 * MedicalErrorBoundary - Specialized for medical context
 * Shows empathetic error messages for clinical workflows
 */
export function MedicalErrorBoundary({
  children,
  onReset,
}: {
  children: React.ReactNode
  onReset?: () => void
}) {
  const medicalFallback = ({ error, resetErrorBoundary }: FallbackRenderProps) => {
    // Narrow error from unknown to Error for display
    const errorObj = error instanceof Error ? error : new Error(String(error))

    return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div
        className="max-w-md w-full p-6 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
        role="alert"
        aria-live="assertive"
      >
        <div className="text-center space-y-4">
          {/* Empathetic icon */}
          <div className="flex justify-center">
            <svg
              className="h-12 w-12 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Empathetic message */}
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Lo sentimos, algo salió mal
          </h2>

          <p className="text-gray-600 dark:text-gray-400">
            Tu información es importante para nosotros. Por favor intenta nuevamente.
            Si el problema persiste, nuestro equipo médico te ayudará.
          </p>

          {/* Recovery action */}
          <button
            onClick={() => {
              resetErrorBoundary()
              onReset?.()
            }}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Intentar nuevamente
          </button>

          {/* Support contact */}
          <p className="text-sm text-gray-500 dark:text-gray-500">
            ¿Necesitas ayuda? Contacta a{' '}
            <a href="/soporte" className="text-red-600 hover:underline">
              soporte médico
            </a>
          </p>

          {/* Error details in development */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">
                Detalles técnicos
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-32">
                {errorObj.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
    )
  }

  return (
    <ErrorBoundary
      fallback={medicalFallback}
      resetKeys={[]}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * GlobalErrorBoundary - Place at app root
 * Catches all unhandled errors
 */
export function GlobalErrorBoundary({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary
      onError={(error) => {
        // Send to error tracking service
        if (typeof window !== 'undefined' && (window as any).Sentry) {
          ;(window as any).Sentry.captureException(error)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Re-export types for convenience
 */
export type { FallbackRenderProps }
export { ErrorBoundaryAdapter }
