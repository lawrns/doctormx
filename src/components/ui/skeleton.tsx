import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

// =============================================================================
// SKELETON VARIANTS
// =============================================================================

type SkeletonCardProps = {
  variant?: 'default' | 'doctor' | 'appointment'
  className?: string
}

function SkeletonCard({ variant = 'default', className }: SkeletonCardProps) {
  if (variant === 'doctor') {
    return (
      <div className={cn(
        "bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--border-default)]",
        className
      )}>
        <div className="flex items-start gap-4 mb-4">
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-24 w-full mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 flex-1" />
          <Skeleton className="h-8 w-20 flex-1" />
        </div>
      </div>
    )
  }

  if (variant === 'appointment') {
    return (
      <div className={cn(
        "bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--border-default)]",
        className
      )}>
        <div className="flex items-start gap-4 mb-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    )
  }

  // default variant
  return (
    <div className={cn(
      "bg-[var(--color-surface)] p-6 rounded-lg border border-[var(--border-default)]",
      className
    )}>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-full mb-4" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

function SkeletonDoctorCard({ className }: { className?: string }) {
  return <SkeletonCard variant="doctor" className={className} />
}

function SkeletonDoctorList({ count = 4 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDoctorCard key={i} />
      ))}
    </div>
  )
}

function SkeletonAppointmentList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} variant="appointment" />
      ))}
    </div>
  )
}

function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden">
      <div className="border-b border-[var(--border-default)] pb-3 mb-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 py-3 border-b border-[var(--border-default)]">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton,
  SkeletonCard,
  SkeletonStatCards,
  SkeletonDoctorCard,
  SkeletonDoctorList,
  SkeletonAppointmentList,
  SkeletonTable
}
