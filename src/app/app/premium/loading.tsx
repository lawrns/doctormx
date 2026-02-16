import { Skeleton } from '@/components/ui/skeleton'

export default function PatientPremiumLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`bg-white rounded-2xl p-8 border ${i === 2 ? 'border-primary-500 ring-2 ring-primary-500' : 'border-neutral-200'}`}>
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-12 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-8" />
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

        {/* FAQ Section */}
        <div className="bg-white rounded-xl p-8 border border-neutral-200">
          <Skeleton className="h-6 w-48 mx-auto mb-8" />
          <div className="space-y-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="w-5 h-5 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
