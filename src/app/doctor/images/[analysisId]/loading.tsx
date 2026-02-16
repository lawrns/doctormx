import { Skeleton } from '@/components/ui/skeleton'

export default function ImageAnalysisLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
