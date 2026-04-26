import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface))] flex items-center justify-center">
      <div className="w-full max-w-3xl p-6 space-y-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-lg" />
        <div className="space-y-3 pt-6">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
