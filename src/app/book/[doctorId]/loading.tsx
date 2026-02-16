import { Skeleton } from '@/components/ui/skeleton'

export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Info Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-neutral-200 sticky top-8">
              <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-8 w-48 mb-6" />
              
              {/* Calendar Skeleton */}
              <div className="mb-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-lg" />
                  ))}
                </div>
              </div>

              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
