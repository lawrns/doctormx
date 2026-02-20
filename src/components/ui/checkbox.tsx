"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  /** Accessible label for the checkbox. Required when no visible label is present */
  'aria-label'?: string
  /** ID of element(s) that describe the checkbox */
  'aria-describedby'?: string
  /** ID of element that provides error message */
  errorId?: string
  /** ID of element that provides additional description */
  descriptionId?: string
}

function Checkbox({
  className,
  errorId,
  descriptionId,
  ...props
}: CheckboxProps) {
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
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
