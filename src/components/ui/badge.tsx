import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-[var(--public-radius-control)] border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,background-color,border-color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/15",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive/12 text-destructive [a&]:hover:bg-destructive/18 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20",
        outline:
          "border-border/90 bg-card/70 text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-transparent bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]",
        info:
          "border-transparent bg-[hsl(var(--brand-ocean)/0.12)] text-[hsl(var(--brand-ocean))]",
        warning:
          "border-transparent bg-[hsl(var(--brand-gold)/0.18)] text-[hsl(var(--brand-gold))]",
        luxe:
          "border-[hsl(var(--brand-clay)/0.3)] bg-[linear-gradient(135deg,hsl(var(--surface-quiet)),hsl(var(--surface-strong)))] text-[hsl(var(--text-secondary))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
