import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  /** Accessible label for the textarea. Use when visible label is not present */
  'aria-label'?: string;
  /** ID of element(s) that describe the textarea */
  'aria-describedby'?: string;
  /** ID of element that provides additional description */
  descriptionId?: string;
  /** ID of element that provides error message */
  errorId?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, descriptionId, errorId, ...props }, ref) => {
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
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
