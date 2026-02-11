'use client'

import { cn } from '@/lib/utils'

/**
 * SkeletonCard Component - WCAG 2.1 AA Compliant
 *
 * Loading placeholder that matches the Card component structure.
 * Provides visual feedback while content is loading.
 *
 * @example
 * ```tsx
 * <SkeletonCard className="w-full h-32" />
 * <SkeletonCard header footer className="w-full" />
 * ```
 */

interface SkeletonCardProps {
  /**
   * Whether to show header skeleton
   */
  header?: boolean

  /**
   * Whether to show footer skeleton
   */
  footer?: boolean

  /**
   * Number of skeleton lines in body
   */
  lines?: number

  /**
   * Whether to show avatar skeleton (in header)
   */
  avatar?: boolean

  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * ARIA label for screen readers
   */
  ariaLabel?: string
}

export function SkeletonCard({
  header = false,
  footer = false,
  lines = 3,
  avatar = false,
  size = 'md',
  className = '',
  ariaLabel = 'Cargando...',
}: SkeletonCardProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  }

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        paddingClasses[size],
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {header && (
        <div className="flex items-center gap-3 mb-4">
          {avatar && (
            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          )}
          <div className="space-y-2 flex-1">
            <div className={cn('bg-muted rounded animate-pulse', sizeClasses[size]} style={{ width: '40%' }} />
            <div className={cn('bg-muted rounded animate-pulse', sizeClasses.sm)} style={{ width: '60%' }} />
          </div>
        </div>
      )}

      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-muted rounded animate-pulse',
              sizeClasses[size]
            )}
            style={{
              width: i === lines - 1 ? '70%' : '100%',
            }}
          />
        ))}
      </div>

      {footer && (
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <div className="h-9 bg-muted rounded animate-pulse flex-1" />
          <div className="h-9 bg-muted rounded animate-pulse flex-1" />
        </div>
      )}

      <span className="sr-only">{ariaLabel}</span>
    </div>
  )
}

/**
 * SkeletonList - Multiple skeleton cards in a list
 */
export function SkeletonList({
  count = 3,
  ...props
}: SkeletonCardProps & { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} {...props} />
      ))}
    </div>
  )
}

/**
 * SkeletonTable - Loading placeholder for tables
 */
export function SkeletonTable({
  rows = 5,
  cols = 4,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div
      className="w-full"
      role="status"
      aria-live="polite"
      aria-label="Cargando tabla..."
    >
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-2 border-b">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="h-4 bg-muted rounded animate-pulse"
            style={{ width: `${100 / cols}%` }}
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-3 border-b">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-3 bg-muted/50 rounded animate-pulse"
              style={{ width: `${100 / cols}%` }}
            />
          ))}
        </div>
      ))}

      <span className="sr-only">Cargando tabla...</span>
    </div>
  )
}

/**
 * SkeletonAvatar - Loading placeholder for user avatars
 */
export function SkeletonAvatar({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <div
      className={cn(
        'rounded-full bg-muted animate-pulse',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Cargando avatar..."
    />
  )
}

/**
 * SkeletonText - Loading placeholder for text
 */
export function SkeletonText({
  lines = 2,
  className = '',
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Cargando texto...">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-muted rounded animate-pulse"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  )
}
