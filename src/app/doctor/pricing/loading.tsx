import { Skeleton } from '@/components/ui/skeleton'

export default function DoctorPricingLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Current Plan Card */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`bg-white rounded-2xl p-8 border ${i === 2 ? 'border-primary-500 ring-2 ring-primary-500' : 'border-neutral-200'}`}>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-32 mb-6" />
              <Skeleton className="h-12 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-8" />
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
