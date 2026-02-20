"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface RadioGroupProps extends React.ComponentProps<typeof RadioGroupPrimitive.Root> {}

function RadioGroup({
  className,
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

export interface RadioGroupItemProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  /** Accessible label for the radio item. Required when no visible label is present */
  'aria-label'?: string
  /** ID of element(s) that describe the radio item */
  'aria-describedby'?: string
  /** ID of element that provides error message */
  errorId?: string
  /** ID of element that provides additional description */
  descriptionId?: string
}

function RadioGroupItem({
  className,
  errorId,
  descriptionId,
  ...props
}: RadioGroupItemProps) {
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
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // WCAG: Minimum 24px visual size for better touch targets
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square h-6 w-6 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
