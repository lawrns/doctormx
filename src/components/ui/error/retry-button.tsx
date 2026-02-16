'use client'

import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * RetryButton Component - WCAG 2.1 AA Compliant
 *
 * Button with retry functionality and exponential backoff.
 * Provides user feedback during retry attempts.
 *
 * @example
 * ```tsx
 * <RetryButton onRetry={fetchData} />
 * <RetryButton onRetry={fetchData} maxRetries={3} />
 * ```
 */

interface RetryButtonProps {
  /**
   * Retry handler function
   */
  onRetry: () => Promise<void> | void

  /**
   * Button text
   */
  label?: string

  /**
   * Text shown while retrying
   */
  retryingLabel?: string

  /**
   * Maximum number of retry attempts
   */
  maxRetries?: number

  /**
   * Initial backoff delay in ms
   */
  initialDelay?: number

  /**
   * Backoff multiplier (exponential)
   */
  backoffMultiplier?: number

  /**
   * Whether to show attempt count
   */
  showAttemptCount?: boolean

  /**
   * Custom error message
   */
  error?: string

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Current attempt number (for display)
   */
  attempt?: number

  /**
   * Whether button is disabled
   */
  disabled?: boolean

  /**
   * Whether currently retrying
   */
  isRetrying?: boolean
}

export function RetryButton({
  onRetry,
  label = 'Reintentar',
  retryingLabel = 'Reintentando...',
  maxRetries = 3,
  initialDelay = 1000,
  backoffMultiplier = 2,
  showAttemptCount = false,
  error,
  size = 'md',
  variant = 'primary',
  className = '',
  disabled = false,
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)

  const handleRetry = useCallback(async () => {
    if (isRetrying) return

    // Check max retries
    if (attempt >= maxRetries) {
      setLastError('Máximo de intentos alcanzado. Por favor recarga la página.')
      return
    }

    setIsRetrying(true)
    setLastError(null)

    try {
      await onRetry()
      setAttempt(0) // Reset on success
    } catch (err) {
      const newAttempt = attempt + 1
      setAttempt(newAttempt)

      // Calculate backoff delay
      const delay = initialDelay * Math.pow(backoffMultiplier, attempt)

      if (newAttempt < maxRetries) {
        setLastError(`Error. Reintentando en ${Math.round(delay / 1000)}s...`)

        // Auto-retry with backoff
        setTimeout(() => {
          handleRetry()
        }, delay)
      } else {
        setLastError('Máximo de intentos alcanzado. Por favor recarga la página.')
      }
    } finally {
      setIsRetrying(false)
    }
  }, [onRetry, attempt, maxRetries, initialDelay, backoffMultiplier, isRetrying])

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  }

  const isDisabled = disabled || isRetrying || attempt >= maxRetries

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRetry}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'rounded-md font-medium',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        aria-label={label}
        aria-busy={isRetrying}
      >
        <RefreshCw className={cn('h-4 w-4', isRetrying && 'animate-spin')} />
        {isRetrying ? retryingLabel : label}
        {showAttemptCount && attempt > 0 && (
          <span className="text-xs opacity-75">
            ({attempt}/{maxRetries})
          </span>
        )}
      </button>

      {/* Error message */}
      {(lastError || error) && (
        <p className="text-sm text-destructive" role="alert" aria-live="polite">
          {lastError || error}
        </p>
      )}
    </div>
  )
}

/**
 * useRetry - Hook for managing retry logic
 */
export function useRetry(
  fn: () => Promise<void>,
  options?: {
    maxRetries?: number
    initialDelay?: number
    backoffMultiplier?: number
  }
) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
  } = options || {}

  const [attempt, setAttempt] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const retry = useCallback(async () => {
    if (isRetrying) return

    setIsRetrying(true)
    setError(null)

    try {
      await fn()
      setAttempt(0)
    } catch (err) {
      const newAttempt = attempt + 1
      setAttempt(newAttempt)
      setError(err as Error)

      if (newAttempt < maxRetries) {
        const delay = initialDelay * Math.pow(backoffMultiplier, attempt)
        await new Promise((resolve) => setTimeout(resolve, delay))
        return retry()
      }
    } finally {
      setIsRetrying(false)
    }
  }, [fn, attempt, maxRetries, initialDelay, backoffMultiplier, isRetrying])

  const reset = useCallback(() => {
    setAttempt(0)
    setError(null)
    setIsRetrying(false)
  }, [])

  return {
    attempt,
    isRetrying,
    error,
    canRetry: attempt < maxRetries,
    retry,
    reset,
  }
}

/**
 * SmartRetryButton - Retry button with automatic retry logic
 */
export function SmartRetryButton({
  onRetry,
  ...props
}: Omit<RetryButtonProps, 'onRetry'> & {
  onRetry: () => Promise<void>
}) {
  const { attempt, isRetrying, error, canRetry, retry } = useRetry(onRetry)

  return (
    <RetryButton
      onRetry={retry}
      isRetrying={isRetrying}
      disabled={!canRetry}
      error={error?.message}
      attempt={attempt}
      {...props}
    />
  )
}
