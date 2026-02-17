/**
 * Error Boundary Adapter
 *
 * Adapts between our ErrorState component props and react-error-boundary's
 * expected FallbackRender interface.
 *
 * This resolves type conflicts between library v5.x and our component prop types.
 *
 * @module error/ErrorBoundaryAdapter
 */

'use client'

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { ErrorState } from './error-state'
import { logger } from '@/lib/observability/logger'

/**
 * Props that react-error-boundary passes to FallbackRender
 * error is unknown (as per library v5.x), should be narrowed by consumer
 */
export interface FallbackRenderProps {
  error: unknown
  resetErrorBoundary: () => void
}

/**
 * Default error fallback using our ErrorState component
 */
function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackRenderProps) {
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

/**
 * ErrorBoundaryAdapter - Wrapper around react-error-boundary
 *
 * Provides type-safe interface compatible with our ErrorState component
 * while using react-error-boundary's error catching mechanism.
 */
export interface ErrorBoundaryAdapterProps {
  /**
   * Custom fallback component
   */
  fallback?: React.ComponentType<FallbackRenderProps>

  /**
   * Custom fallback render function
   */
  fallbackRender?: (props: FallbackRenderProps) => React.ReactNode

  /**
   * Error handler callback
   * error is unknown (as per library v5.x)
   */
  onError?: (error: unknown, errorInfo: React.ErrorInfo) => void

  /**
   * Reset callback
   */
  onReset?: () => void

  /**
   * Reset keys that trigger boundary reset when changed
   */
  resetKeys?: Array<string | number>

  /**
   * Children to wrap
   */
  children: React.ReactNode
}

export function ErrorBoundaryAdapter({
  fallback,
  fallbackRender,
  onError,
  onReset,
  resetKeys = [],
  children,
}: ErrorBoundaryAdapterProps) {
  const handleError = (error: unknown, errorInfo: React.ErrorInfo) => {
    // Narrow error from unknown to Error for logging
    const errorObj = error instanceof Error ? error : new Error(String(error))

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      logger.error('[ErrorBoundaryAdapter] Error caught:', { error: errorObj.message, errorInfo })
    }

    // Log to observability platform if available
    if (typeof window !== 'undefined' && (window as any).logger) {
      ;(window as any).logger.error('[ErrorBoundaryAdapter]', {
        error: errorObj.message,
        stack: errorObj.stack,
        componentStack: errorInfo.componentStack,
      })
    }

    // Call custom error handler
    onError?.(error, errorInfo)
  }

  const handleReset = () => {
    onReset?.()
  }

  // Two separate render paths based on what's provided
  if (fallbackRender) {
    return (
      <ReactErrorBoundary
        fallbackRender={fallbackRender}
        onError={handleError}
        onReset={handleReset}
        resetKeys={resetKeys}
      >
        {children}
      </ReactErrorBoundary>
    )
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || DefaultErrorFallback}
      onError={handleError}
      onReset={handleReset}
      resetKeys={resetKeys}
    >
      {children}
    </ReactErrorBoundary>
  )
}

ErrorBoundaryAdapter.displayName = 'ErrorBoundaryAdapter'

/**
 * Re-export ErrorState for convenience
 */
export { ErrorState } from './error-state'
export type { ErrorStateProps } from './error-state'
