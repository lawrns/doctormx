import { Skeleton } from '@/components/ui/skeleton'

export default function ConsentDetailLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="bg-white rounded-xl p-8 border border-neutral-200">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-8" />
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
