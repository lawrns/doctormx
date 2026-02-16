import { Skeleton } from '@/components/ui/skeleton'

export default function PatientProfileLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <Skeleton className="h-8 w-48 mb-8" />

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-neutral-200 text-center">
              <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-5 w-40 mx-auto mb-2" />
              <Skeleton className="h-4 w-32 mx-auto mb-4" />
              <Skeleton className="h-8 w-32 mx-auto rounded-full" />
            </div>
          </div>

          {/* Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-40 mb-6" />
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-4 w-28 mb-2" />
                  <Skeleton className="h-12 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <Skeleton className="h-12 w-40 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
