import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  /** Accessible label for the input. Use when visible label is not present */
  'aria-label'?: string;
  /** ID of element(s) that describe the input */
  'aria-describedby'?: string;
  /** ID of element that provides additional description */
  descriptionId?: string;
  /** ID of element that provides error message */
  errorId?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, descriptionId, errorId, ...props }, ref) => {
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
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          // WCAG: Minimum 44px touch target for mobile accessibility
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input min-h-[44px] w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
