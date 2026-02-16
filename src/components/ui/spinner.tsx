'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  /**
   * Size of the spinner
   */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /**
   * Additional CSS classes
   */
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

/**
 * Spinner Component
 *
 * Loading indicator using Lucide's Loader2 icon with animation
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
      aria-hidden="true"
    />
  )
}

/**
 * FullScreenSpinner - Full page loading state
 */
export function FullScreenSpinner({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}
