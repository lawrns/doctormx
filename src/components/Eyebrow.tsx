'use client'

import { cn } from '@/lib/utils'

interface EyebrowProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function Eyebrow({ children, className, as: Component = 'span' }: EyebrowProps) {
  return (
    <Component
      className={cn(
        'inline-flex items-center gap-2',
        'font-mono text-[11px] font-medium uppercase tracking-[0.16em]',
        'text-[hsl(var(--public-muted))]',
        className
      )}
    >
      <span className="inline-block h-px w-6 bg-current" aria-hidden="true" />
      {children}
    </Component>
  )
}
