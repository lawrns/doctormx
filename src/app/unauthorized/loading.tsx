import { Skeleton } from '@/components/ui/skeleton'

export default function UnauthorizedLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6" />
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-full mx-auto mb-8" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-12 w-40 rounded-lg" />
          <Skeleton className="h-12 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
