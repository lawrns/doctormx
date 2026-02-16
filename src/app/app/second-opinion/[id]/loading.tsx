import { Skeleton } from '@/components/ui/skeleton'

export default function SecondOpinionDetailLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
