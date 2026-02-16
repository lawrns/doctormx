import { Skeleton } from '@/components/ui/skeleton'

export default function PharmacyAffiliateLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-80 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="bg-white rounded-xl p-8 border border-neutral-200">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
