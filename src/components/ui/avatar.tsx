"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Avatar size variants for different use cases
const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "size-6",
        sm: "size-8",
        default: "size-10",
        lg: "size-12",
        xl: "size-16",
        "2xl": "size-20",
        "3xl": "size-24",
      },
      border: {
        none: "",
        default: "ring-2 ring-background",
        primary: "ring-2 ring-primary",
        secondary: "ring-2 ring-secondary",
        white: "ring-2 ring-white",
      },
      status: {
        none: "",
        online: "",
        offline: "",
        away: "",
        busy: "",
      },
    },
    defaultVariants: {
      size: "default",
      border: "none",
      status: "none",
    },
  }
)

// Status indicator colors
const statusVariants = cva(
  "absolute bottom-0 right-0 rounded-full ring-2 ring-background",
  {
    variants: {
      status: {
        online: "bg-green-500",
        offline: "bg-gray-400",
        away: "bg-yellow-500",
        busy: "bg-red-500",
      },
      size: {
        xs: "size-1.5",
        sm: "size-2",
        default: "size-2.5",
        lg: "size-3",
        xl: "size-3.5",
        "2xl": "size-4",
        "3xl": "size-4",
      },
    },
    defaultVariants: {
      status: "offline",
      size: "default",
    },
  }
)

// Avatar fallback variants for different styles
const fallbackVariants = cva(
  "flex size-full items-center justify-center rounded-full bg-muted font-medium",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        gradient: "bg-gradient-to-br from-primary to-secondary text-white",
      },
      size: {
        xs: "text-[10px]",
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
        "3xl": "text-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  status?: "online" | "offline" | "away" | "busy" | "none"
}

function Avatar({
  className,
  size,
  border,
  status,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size, border, status }), className)}
      {...props}
    />
  )
}

interface AvatarImageProps
  extends React.ComponentProps<typeof AvatarPrimitive.Image> {}

function AvatarImage({ className, ...props }: AvatarImageProps) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  )
}

interface AvatarFallbackProps
  extends React.ComponentProps<typeof AvatarPrimitive.Fallback>,
    VariantProps<typeof fallbackVariants> {}

function AvatarFallback({
  className,
  variant,
  size,
  ...props
}: AvatarFallbackProps) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(fallbackVariants({ variant, size }), className)}
      {...props}
    />
  )
}

// Status indicator component
interface AvatarStatusProps extends VariantProps<typeof statusVariants> {
  className?: string
}

function AvatarStatus({ status, size, className }: AvatarStatusProps) {
  if (!status) return null

  return (
    <span
      className={cn(statusVariants({ status, size }), className)}
      aria-label={`Status: ${status}`}
    />
  )
}

// Pre-built avatar components for common use cases

// User avatar with initials fallback
interface UserAvatarProps extends Omit<AvatarProps, "children"> {
  src?: string
  alt: string
  name: string
  fallbackVariant?: VariantProps<typeof fallbackVariants>["variant"]
}

function UserAvatar({
  src,
  alt,
  name,
  size,
  border,
  status,
  fallbackVariant = "gradient",
  className,
}: UserAvatarProps) {
  // Generate initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative inline-block">
      <Avatar size={size} border={border} status={status} className={className}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback variant={fallbackVariant} size={size}>
          {initials}
        </AvatarFallback>
      </Avatar>
      {status && status !== "none" && (
        <AvatarStatus status={status} size={size} />
      )}
    </div>
  )
}

// Doctor avatar with online status
interface DoctorAvatarProps extends Omit<UserAvatarProps, "status"> {
  isOnline?: boolean
}

function DoctorAvatar({
  isOnline = false,
  border = "white",
  ...props
}: DoctorAvatarProps) {
  return (
    <UserAvatar
      {...props}
      border={border}
      status={isOnline ? "online" : "offline"}
    />
  )
}

// Group avatar (overlapping)
interface AvatarGroupProps {
  children: React.ReactNode
  max?: number
  className?: string
}

function AvatarGroup({ children, max, className }: AvatarGroupProps) {
  const childrenArray = React.Children.toArray(children)
  const displayCount = max ? Math.min(childrenArray.length, max) : childrenArray.length
  const remaining = max && childrenArray.length > max ? childrenArray.length - max : 0

  return (
    <div className={cn("flex -space-x-2", className)}>
      {childrenArray.slice(0, displayCount)}
      {remaining > 0 && (
        <div className="relative flex size-8 items-center justify-center rounded-full bg-muted ring-2 ring-background">
          <span className="text-xs font-medium text-muted-foreground">
            +{remaining}
          </span>
        </div>
      )}
    </div>
  )
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
  UserAvatar,
  DoctorAvatar,
  AvatarGroup,
  avatarVariants,
  fallbackVariants,
  statusVariants,
}
