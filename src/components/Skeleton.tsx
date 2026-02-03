import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    />
  )
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border border-gray-200 p-4', className)}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-20 w-full mb-4" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function SkeletonStatCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

interface SkeletonAppointmentListProps {
  count?: number
}

export function SkeletonAppointmentList({ count = 5 }: SkeletonAppointmentListProps) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  cols?: number
}

export function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps) {
  return (
    <div className="rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <Skeleton className="h-4 w-full" />
      </div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="p-4 border-b border-gray-200 last:border-0">
          <div className="flex gap-4">
            {[...Array(cols)].map((_, j) => (
              <Skeleton key={j} className="h-4 w-1/4" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
