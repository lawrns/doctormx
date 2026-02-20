'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  /** Accessible label for the switch. Required when no visible label is present */
  'aria-label'?: string
  /** ID of element(s) that describe the switch */
  'aria-describedby'?: string
  /** ID of element that provides error message */
  errorId?: string
  /** ID of element that provides additional description */
  descriptionId?: string
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, errorId, descriptionId, ...props }, ref) => {
  // Build aria-describedby from description and error IDs
  const ariaDescribedBy = React.useMemo(() => {
    const ids: string[] = [];
    if (props['aria-describedby']) {
      return props['aria-describedby'];
    }
    if (descriptionId) ids.push(descriptionId);
    if (errorId) ids.push(errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [props['aria-describedby'], descriptionId, errorId]);

  return (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
        className
      )}
      aria-describedby={ariaDescribedBy}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0'
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
