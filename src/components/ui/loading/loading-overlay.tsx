'use client'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/Spinner'

/**
 * LoadingOverlay Component - WCAG 2.1 AA Compliant
 *
 * Full-screen loading overlay that blocks interaction while content loads.
 * Focuses on accessibility and user feedback.
 *
 * @example
 * ```tsx
 * <LoadingOverlay message="Procesando tu consulta..." />
 * <LoadingOverlay message="Guardando cambios..." progress={45} />
 * ```
 */

interface LoadingOverlayProps {
  /**
   * Message to display to user
   */
  message: string

  /**
   * Progress percentage (optional)
   */
  progress?: number

  /**
   * Whether the overlay is visible
   */
  isVisible?: boolean

  /**
   * Whether operation is complete
   */
  isComplete?: boolean

  /**
   * Completion message
   */
  completeMessage?: string

  /**
   * Whether to show spinner
   */
  showSpinner?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Estimated time remaining (seconds)
   */
  estimatedTime?: number
}

export function LoadingOverlay({
  message,
  progress,
  isVisible = true,
  isComplete = false,
  completeMessage = '¡Completado!',
  showSpinner = true,
  className = '',
  estimatedTime,
}: LoadingOverlayProps) {
  if (!isVisible) return null

  const displayMessage = isComplete ? completeMessage : message
  const displayProgress = isComplete ? 100 : progress

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-background/80 backdrop-blur-sm',
        'transition-opacity duration-200',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-overlay-title"
      aria-describedby="loading-overlay-desc"
    >
      <div
        className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg max-w-md mx-4"
        role="status"
        aria-live="polite"
      >
        {/* Spinner or progress */}
        {progress !== undefined ? (
          <div className="w-full">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            {showSpinner && (
              <div className="flex justify-center mt-4">
                <Spinner size="sm" />
              </div>
            )}
          </div>
        ) : showSpinner ? (
          <Spinner size="lg" />
        ) : null}

        {/* Message */}
        <div className="text-center space-y-2">
          <h2
            id="loading-overlay-title"
            className="text-lg font-semibold text-foreground"
          >
            {displayMessage}
          </h2>
          {progress !== undefined && !isComplete && (
            <p
              id="loading-overlay-desc"
              className="text-sm text-muted-foreground"
            >
              {Math.round(displayProgress)}% completado
              {estimatedTime && ` • ~${estimatedTime} seg restantes`}
            </p>
          )}
          {isComplete && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✓ Operación completada
            </p>
          )}
        </div>

        {/* Screen reader announcements */}
        <span className="sr-only">
          {isComplete
            ? completeMessage
            : progress !== undefined
            ? `${message}: ${displayProgress} por ciento completado`
            : message
          }
        </span>
      </div>
    </div>
  )
}

/**
 * PageLoading - Full page loading state for page transitions
 */
export function PageLoading({
  message = 'Cargando...',
  className = '',
}: {
  message?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center',
        'bg-background',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-muted-foreground">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    </div>
  )
}

/**
 * InlineLoading - Inline loading indicator for components
 */
export function InlineLoading({
  message = 'Cargando...',
  size = 'sm',
  className = '',
}: {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size={size} className={sizeClasses[size]} />
      <span className="text-sm text-muted-foreground">{message}</span>
      <span className="sr-only">{message}</span>
    </div>
  )
}

/**
 * SuspenseLoading - Loading state for React Suspense boundaries
 */
export function SuspenseLoading({
  message = 'Cargando...',
}: {
  message?: string
}) {
  return (
    <div
      className="flex items-center justify-center p-8"
      role="status"
      aria-live="polite"
    >
      <InlineLoading message={message} />
    </div>
  )
}

/**
 * useLoadingOverlay - Hook for managing loading overlay state
 */
export function useLoadingOverlay() {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState<number | undefined>(undefined)
  const [isComplete, setIsComplete] = useState(false)

  const show = (msg: string, prog?: number) => {
    setIsVisible(true)
    setMessage(msg)
    setProgress(prog)
    setIsComplete(false)
  }

  const update = (prog: number, msg?: string) => {
    setProgress(prog)
    if (msg) setMessage(msg)
    if (prog >= 100) {
      setIsComplete(true)
    }
  }

  const hide = () => {
    setIsVisible(false)
    // Reset state after animation
    setTimeout(() => {
      setProgress(undefined)
      setIsComplete(false)
    }, 200)
  }

  const complete = (msg?: string) => {
    setProgress(100)
    setIsComplete(true)
    if (msg) setMessage(msg)
    setTimeout(hide, 1500)
  }

  return {
    isVisible,
    message,
    progress,
    isComplete,
    show,
    update,
    hide,
    complete,
    setIsVisible,
  }
}
