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

    const variants = {
      primary: 'btn-dx-primary',
      coral: 'btn-dx-coral',
      ghost: 'btn-dx-ghost',
    }

    return (
      <Comp
        className={cn(variants[variant], size === 'lg' && 'btn-dx-lg', className)}
        ref={ref}
        {...props}
      />
    )
  }
)
DxButton.displayName = 'DxButton'
