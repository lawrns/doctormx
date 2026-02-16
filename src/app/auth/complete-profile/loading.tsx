import { Skeleton } from '@/components/ui/skeleton'

export default function CompleteProfileLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                {i < 3 && <Skeleton className="w-16 h-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto mb-8" />
          
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-28 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="flex justify-between pt-4">
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
