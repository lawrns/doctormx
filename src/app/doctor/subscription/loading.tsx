import { Skeleton } from '@/components/ui/skeleton'

export default function DoctorSubscriptionLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Skeleton className="h-8 w-64 mb-8" />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div>
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-neutral-100">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-3 border border-neutral-200 rounded-lg">
                    <Skeleton className="w-12 h-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded-lg mt-4" />
            </div>

            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
