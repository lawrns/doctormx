'use client'

import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { forwardRef } from 'react'

export interface DxButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'coral' | 'ghost'
  size?: 'default' | 'lg'
  asChild?: boolean
}

export const DxButton = forwardRef<HTMLButtonElement, DxButtonProps>(
  ({ className, variant = 'primary', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const variants: Record<string, string> = {
      primary: 'bg-[hsl(var(--ink))] text-[hsl(var(--surface-card))] border border-transparent hover:bg-[hsl(var(--ink)/0.88)]',
      coral: 'bg-[hsl(var(--danger))] text-white border border-transparent hover:bg-[hsl(var(--danger)/0.88)]',
      ghost: 'bg-transparent text-[hsl(var(--ink))] border border-[hsl(var(--border-color))] hover:bg-[hsl(var(--secondary))]',
    }

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius)-2px)] font-semibold cursor-pointer transition-all duration-200 ease-out active:scale-[0.98]',
          size === 'default' ? 'px-6 py-3 text-sm' : 'px-7 py-4 text-[0.9375rem]',
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
DxButton.displayName = 'DxButton'
