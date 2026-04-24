import * as React from 'react'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  children?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeader({ eyebrow, title, children, align = 'left', className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-6 max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow ? (
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-[-0.045em] text-foreground sm:text-4xl">
        {title}
      </h2>
      {children ? (
        <div className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {children}
        </div>
      ) : null}
    </div>
  )
}
