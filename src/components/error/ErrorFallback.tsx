'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home, LifeBuoy } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ErrorFallback Props
 */
export interface ErrorFallbackProps {
  /**
   * The error that was caught
   */
  error: Error | null

  /**
   * React error info with component stack
   */
  errorInfo?: React.ErrorInfo | null

  /**
   * Callback to retry/reset the error boundary
   */
  onRetry?: () => void

  /**
   * Context name for the error boundary (e.g., 'Dashboard', 'Chat')
   */
  context?: string

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Custom title for the error message
   */
  title?: string

  /**
   * Custom message for the error
   */
  message?: string

  /**
   * Whether to show the home button
   */
  showHomeButton?: boolean

  /**
   * Whether to show support contact
   */
  showSupportLink?: boolean
}

/**
 * ErrorFallback Component - ARCH-012
 *
 * Displays a user-friendly error message with retry functionality.
 * WCAG 2.1 AA compliant with proper ARIA attributes.
 *
 * Features:
 * - User-friendly Spanish error messages
 * - Retry functionality with visual feedback
 * - Error details in development mode
 * - Accessible with proper ARIA attributes
 * - Responsive design
 *
 * @example
 * ```tsx
 * <ErrorFallback
 *   error={error}
 *   onRetry={() => resetErrorBoundary()}
 *   context="Dashboard"
 * />
 * ```
 */
export function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  context,
  className,
  title,
  message,
  showHomeButton = true,
  showSupportLink = true,
}: ErrorFallbackProps) {
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = async () => {
    if (isRetrying || !onRetry) return

    setIsRetrying(true)

    // Small delay to show the retrying state
    await new Promise((resolve) => setTimeout(resolve, 300))

    onRetry()
    setIsRetrying(false)
  }

  const defaultTitle = context
    ? `Error en ${context}`
    : 'Algo salió mal'

  const defaultMessage = context
    ? `Lo sentimos, hubo un problema al cargar ${context.toLowerCase()}. Por favor intenta de nuevo.`
    : 'Lo sentimos, ocurrió un error inesperado. Por favor intenta de nuevo.'

  return (
    <div
      className={cn(
        'flex min-h-[400px] items-center justify-center p-4',
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className={cn(
          'w-full max-w-md rounded-lg border border-destructive/20',
          'bg-destructive/5 dark:bg-destructive/10',
          'p-6 shadow-sm'
        )}
      >
        {/* Error Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'rounded-full bg-destructive/10 p-3',
              'dark:bg-destructive/20'
            )}
          >
            <AlertTriangle
              className="h-8 w-8 text-destructive"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Error Title */}
        <h2 className="text-center text-lg font-semibold text-foreground mb-2">
          {title || defaultTitle}
        </h2>

        {/* Error Message */}
        <p className="text-center text-muted-foreground mb-6">
          {message || defaultMessage}
        </p>

        {/* Retry Button */}
        {onRetry && (
          <div className="flex justify-center mb-4">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className={cn(
                'inline-flex items-center gap-2',
                'px-4 py-2 rounded-md',
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
              aria-label={isRetrying ? 'Reintentando...' : 'Intentar de nuevo'}
              aria-busy={isRetrying}
            >
              <RefreshCw
                className={cn('h-4 w-4', isRetrying && 'animate-spin')}
                aria-hidden="true"
              />
              {isRetrying ? 'Reintentando...' : 'Intentar de nuevo'}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {showHomeButton && (
            <a
              href="/"
              className={cn(
                'inline-flex items-center gap-2',
                'px-4 py-2 rounded-md text-sm',
                'border border-input bg-background',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-colors'
              )}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Ir al inicio
            </a>
          )}

          {showSupportLink && (
            <a
              href="/soporte"
              className={cn(
                'inline-flex items-center gap-2',
                'px-4 py-2 rounded-md text-sm',
                'border border-input bg-background',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'transition-colors'
              )}
            >
              <LifeBuoy className="h-4 w-4" aria-hidden="true" />
              Contactar soporte
            </a>
          )}
        </div>

        {/* Error Details in Development */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 border-t border-destructive/20 pt-4">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
              Detalles técnicos (solo desarrollo)
            </summary>
            <div className="mt-3 space-y-2">
              <div className="rounded bg-destructive/10 p-3 overflow-auto">
                <p className="text-xs font-mono text-destructive">
                  <strong>Error:</strong> {error.name}: {error.message}
                </p>
              </div>
              {error.stack && (
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                  {error.stack}
                </pre>
              )}
              {errorInfo?.componentStack && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Component Stack:
                  </p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Compact Error Fallback for inline usage
 */
export function CompactErrorFallback({
  error,
  onRetry,
  className,
}: Omit<ErrorFallbackProps, 'errorInfo' | 'context' | 'title' | 'message' | 'showHomeButton' | 'showSupportLink'>) {
  const [isRetrying, setIsRetrying] = React.useState(false)

  const handleRetry = async () => {
    if (isRetrying || !onRetry) return

    setIsRetrying(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    onRetry()
    setIsRetrying(false)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-md',
        'border border-destructive/20 bg-destructive/5',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertTriangle
        className="h-5 w-5 text-destructive flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground truncate">
          {error?.message || 'Error inesperado'}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className={cn(
            'p-1.5 rounded-md',
            'hover:bg-destructive/10',
            'focus:outline-none focus:ring-2 focus:ring-destructive',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors'
          )}
          aria-label="Reintentar"
        >
          <RefreshCw
            className={cn('h-4 w-4 text-destructive', isRetrying && 'animate-spin')}
          />
        </button>
      )}
    </div>
  )
}

export default ErrorFallback
