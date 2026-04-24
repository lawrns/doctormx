import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "bg-card text-card-foreground border border-[var(--card-border)] shadow-[var(--card-shadow)] transition-[transform,border-color,box-shadow,background-color] duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "rounded-[var(--card-radius-standard)] p-[var(--card-padding-default)]",
        interactive:
          "rounded-[var(--card-radius-standard)] p-[var(--card-padding-default)] hover:-translate-y-px hover:border-primary/18 hover:shadow-[var(--card-shadow-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0",
        stat: "rounded-[var(--card-radius-standard)] p-[var(--card-padding-compact)]",
        feature: "rounded-[var(--card-radius-standard)] p-[var(--card-padding-default)]",
        step: "rounded-[var(--card-radius-standard)] p-[var(--card-padding-default)] shadow-none",
        testimonial: "rounded-[var(--card-radius-standard)] p-[var(--card-padding-comfortable)]",
        preview: "rounded-[var(--card-radius-hero)] p-[var(--card-padding-comfortable)]",
        chip: "rounded-[var(--card-radius-standard)] px-3 py-2 shadow-none",
      },
      tone: {
        light: "",
        tint: "bg-[hsl(var(--surface-tint)/0.42)]",
        dark: "border-[var(--card-border-dark)] bg-white/8 text-white shadow-none",
        ghost: "bg-transparent shadow-none",
      },
      density: {
        compact: "p-[var(--card-padding-compact)]",
        default: "",
        comfortable: "p-[var(--card-padding-comfortable)]",
        hero: "p-[var(--card-padding-hero)]",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      tone: "light",
      density: "default",
    },
  }
)

export interface CardProps extends React.ComponentProps<"div">, VariantProps<typeof cardVariants> {
  asChild?: boolean
}

function Card({ className, variant, tone, density, asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="card"
      className={cn(cardVariants({ variant, tone, density }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-[15px] font-semibold leading-5 tracking-[-0.02em] text-[hsl(var(--text-primary))]", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-[13px] leading-5 text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
