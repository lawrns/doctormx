import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

export default function PricingLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-8 border border-neutral-200">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-12 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-8" />
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 w-full" />
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
