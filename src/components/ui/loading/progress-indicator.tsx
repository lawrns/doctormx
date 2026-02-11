'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

/**
 * ProgressIndicator Component - WCAG 2.1 AA Compliant
 *
 * Displays progress for long-running operations (> 3 seconds).
 * Announces progress to screen readers.
 *
 * @example
 * ```tsx
 * <ProgressIndicator progress={45} message="Subiendo archivo..." />
 * <ProgressIndicator progress={100} message="¡Completado!" isComplete />
 * ```
 */

interface ProgressIndicatorProps {
  /**
   * Progress percentage (0-100)
   */
  progress: number

  /**
   * Message to display
   */
  message: string

  /**
   * Whether the operation is complete
   */
  isComplete?: boolean

  /**
   * Completion message to show when done
   */
  completeMessage?: string

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Whether to show percentage text
   */
  showPercentage?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Whether to use indeterminate progress (spinner style)
   */
  indeterminate?: boolean
}

export function ProgressIndicator({
  progress,
  message,
  isComplete = false,
  completeMessage = '¡Completado!',
  size = 'md',
  showPercentage = true,
  className = '',
  indeterminate = false,
}: ProgressIndicatorProps) {
  const [announcedProgress, setAnnouncedProgress] = useState(0)

  // Announce progress changes to screen readers
  useEffect(() => {
    if (indeterminate) return

    // Throttle announcements to every 10% or when complete
    if (progress >= announcedProgress + 10 || progress === 100 || isComplete) {
      setAnnouncedProgress(progress)
    }
  }, [progress, isComplete, indeterminate, announcedProgress])

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  const displayMessage = isComplete ? completeMessage : message
  const displayProgress = isComplete ? 100 : progress

  if (indeterminate) {
    return (
      <div className={cn('w-full', className)} role="status" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className="flex-1 overflow-hidden">
            <div className={cn(
              'h-2 bg-muted rounded-full overflow-hidden',
              'relative'
            )}>
              <div className="absolute inset-0 bg-primary animate-pulse" />
            </div>
          </div>
          <span className={cn('text-muted-foreground whitespace-nowrap', textSizes[size])}>
            {message}
          </span>
        </div>
        <span className="sr-only">{message}</span>
      </div>
    )
  }

  return (
    <div
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuenow={displayProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={displayMessage}
      aria-live="polite"
    >
      <div className="space-y-2">
        {/* Progress bar */}
        <div className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeClasses[size]
        )}>
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, displayProgress))}%` }}
          />
        </div>

        {/* Message and percentage */}
        <div className="flex items-center justify-between">
          <span className={cn('text-foreground', textSizes[size])}>
            {displayMessage}
          </span>
          {showPercentage && !isComplete && (
            <span className={cn('text-muted-foreground', textSizes[size])}>
              {Math.round(displayProgress)}%
            </span>
          )}
          {isComplete && (
            <span className={cn('text-green-600 dark:text-green-400', textSizes[size])}>
              ✓
            </span>
          )}
        </div>
      </div>

      {/* Screen reader announcement */}
      <span className="sr-only">
        {announcedProgress === 100
          ? completeMessage
          : `${message}: ${announcedProgress} por ciento completado`
        }
      </span>
    </div>
  )
}

/**
 * useProgress - Hook for managing progress state
 */
export function useProgress(initialMessage: string = 'Procesando...') {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState(initialMessage)
  const [isComplete, setIsComplete] = useState(false)

  const start = (msg?: string) => {
    setIsComplete(false)
    setProgress(0)
    if (msg) setMessage(msg)
  }

  const update = (value: number, msg?: string) => {
    setProgress(Math.min(100, Math.max(0, value)))
    if (msg) setMessage(msg)
    if (value >= 100) {
      setIsComplete(true)
    }
  }

  const increment = (amount: number = 10, msg?: string) => {
    setProgress((p) => {
      const newValue = Math.min(100, p + amount)
      if (newValue >= 100) setIsComplete(true)
      return newValue
    })
    if (msg) setMessage(msg)
  }

  const complete = (msg?: string) => {
    setProgress(100)
    setIsComplete(true)
    if (msg) setMessage(msg)
  }

  const reset = (msg?: string) => {
    setProgress(0)
    setIsComplete(false)
    if (msg) setMessage(msg)
  }

  return {
    progress,
    message,
    isComplete,
    setProgress,
    setMessage,
    setIsComplete,
    start,
    update,
    increment,
    complete,
    reset,
  }
}

/**
 * StepProgress - Progress through defined steps
 */
interface Step {
  id: string
  label: string
}

interface StepProgressProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function StepProgress({ steps, currentStep, className = '' }: StepProgressProps) {
  return (
    <div
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-label={`Paso ${currentStep + 1} de ${steps.length}`}
    >
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep
          const isCurrent = index === currentStep
          const isPending = index > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm transition-colors',
                  isComplete && 'bg-primary border-primary text-primary-foreground',
                  isCurrent && 'border-primary text-primary bg-primary/10',
                  isPending && 'border-muted text-muted-foreground'
                )}
              >
                {isComplete ? '✓' : index + 1}
              </div>

              {/* Step label */}
              <div
                className={cn(
                  'ml-2 text-sm font-medium hidden sm:block',
                  isCurrent && 'text-primary',
                  isComplete && 'text-foreground',
                  isPending && 'text-muted-foreground'
                )}
              >
                {step.label}
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-colors',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * CircularProgress - Circular progress indicator
 */
export function CircularProgress({
  progress,
  size = 40,
  strokeWidth = 4,
  className = '',
}: {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      className={cn('inline-flex', className)}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${Math.round(progress)} por ciento completado`}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300"
        />
      </svg>
      <span className="sr-only">{Math.round(progress)}%</span>
    </div>
  )
}
