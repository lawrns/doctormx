import { Skeleton } from '@/components/ui/skeleton'

export default function DoctorOnboardingLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="w-full max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="text-center">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                {i < 4 && <Skeleton className="w-16 h-1" />}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-96 mx-auto mb-8" />
          
          <div className="space-y-6">
            {/* Form Fields */}
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
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-lg" />
                ))}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-neutral-200">
              <Skeleton className="h-12 w-32 rounded-lg" />
              <Skeleton className="h-12 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
