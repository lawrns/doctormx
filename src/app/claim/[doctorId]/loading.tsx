import { Skeleton } from '@/components/ui/skeleton'

export default function ClaimLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl p-8 border border-neutral-200">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded mt-0.5" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
