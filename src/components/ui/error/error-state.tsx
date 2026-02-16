'use client'

import { cn } from '@/lib/utils'
import { AlertCircle, RefreshCw, AlertTriangle } from 'lucide-react'

/**
 * ErrorState Component - WCAG 2.1 AA Compliant
 *
 * Reusable error display with user-friendly Spanish messages
 * and recovery actions.
 *
 * @example
 * ```tsx
 * <ErrorState
 *   title="No pudimos cargar la información"
 *   message="Intenta de nuevo o contacta a soporte si continúa."
 *   onRetry={() => refetch()}
 * />
 * ```
 */

interface ErrorStateProps {
  /**
   * Error title (headline)
   */
  title?: string

  /**
   * Detailed error message
   */
  message?: string

  /**
   * Error type for styling and messaging
   */
  type?: 'network' | 'validation' | 'medical' | 'generic' | 'notFound'

  /**
   * Retry handler
   */
  onRetry?: () => void

  /**
   * Retry button text
   */
  retryText?: string

  /**
   * Whether retry is in progress
   */
  isRetrying?: boolean

  /**
   * Additional action buttons
   */
  actions?: React.ReactNode

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Whether to show icon
   */
  showIcon?: boolean

  /**
   * Custom error code to display
   */
  errorCode?: string
}

const errorMessages = {
  network: {
    title: 'No pudimos conectar',
    message: 'Hubo un problema de conexión. Intenta de nuevo.',
    icon: AlertCircle,
  },
  validation: {
    title: 'Por favor revisa los campos',
    message: 'Algunos datos necesitan corrección. Revisa los campos marcados.',
    icon: AlertTriangle,
  },
  medical: {
    title: 'Lo sentimos, hubo un error',
    message: 'No pudimos procesar tu solicitud. Por favor intenta nuevamente.',
    icon: AlertCircle,
  },
  notFound: {
    title: 'No encontrado',
    message: 'La información que buscas no está disponible.',
    icon: AlertCircle,
  },
  generic: {
    title: 'Algo salió mal',
    message: 'Si continúa, contacta a soporte técnico.',
    icon: AlertCircle,
  },
}

export function ErrorState({
  title,
  message,
  type = 'generic',
  onRetry,
  retryText = 'Intentar de nuevo',
  isRetrying = false,
  actions,
  size = 'md',
  className = '',
  showIcon = true,
  errorCode,
}: ErrorStateProps) {
  const config = errorMessages[type]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg',
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        'rounded-lg border border-destructive/20 bg-destructive/10',
        sizeClasses[size],
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic
    >
      {/* Icon */}
      {showIcon && (
        <div className="mb-3 text-destructive">
          <Icon className={iconSizes[size]} />
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-2">
        {title || config.title}
        {errorCode && (
          <span className="ml-2 text-xs text-muted-foreground">
            (Código: {errorCode})
          </span>
        )}
      </h3>

      {/* Message */}
      <p className="text-muted-foreground mb-4 max-w-md">
        {message || config.message}
      </p>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90',
              'focus:outline-none focus:ring-2 focus:ring-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
            aria-label={retryText}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Reintentando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {retryText}
              </>
            )}
          </button>
        )}
        {actions}
      </div>
    </div>
  )
}

/**
 * InlineError - Compact inline error message
 */
export function InlineError({
  message,
  className = '',
}: {
  message: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-destructive',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

/**
 * FormError - Error message for form fields
 */
export function FormError({
  message,
  fieldName,
  className = '',
}: {
  message: string
  fieldName?: string
  className?: string
}) {
  return (
    <div
      className={cn('text-sm text-destructive mt-1', className)}
      role="alert"
      aria-live="polite"
    >
      {fieldName && (
        <span className="font-medium">{fieldName}: </span>
      )}
      {message}
    </div>
  )
}

/**
 * ApiError - Error display for API failures
 */
export function ApiError({
  error,
  onRetry,
  isRetrying,
  className = '',
}: {
  error: { message?: string; code?: string; type?: string }
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}) {
  const getErrorType = (): 'network' | 'generic' => {
    if (error.type === 'network' || error.code === 'NETWORK_ERROR') {
      return 'network'
    }
    return 'generic'
  }

  return (
    <ErrorState
      type={getErrorType()}
      message={error.message}
      errorCode={error.code}
      onRetry={onRetry}
      isRetrying={isRetrying}
      className={className}
    />
  )
}

/**
 * ErrorStateProps - Export type for external use
 */
export type { ErrorStateProps }

/**
 * EmptyState - Not exactly an error, but related (no data state)
 */
export function EmptyState({
  title = 'No hay datos',
  message = 'No encontramos información para mostrar.',
  icon: Icon,
  action,
  className = '',
}: {
  title?: string
  message?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        'rounded-lg border border-dashed border-muted-foreground/25',
        className
      )}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div className="mb-4 text-muted-foreground/50">
          <Icon className="h-12 w-12" />
        </div>
      )}
      <h3 className="font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      {action}
    </div>
  )
}
