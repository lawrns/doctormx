import { Skeleton } from '@/components/ui/skeleton'

export default function DoctorsLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-10 w-64 mb-8" />

        <div className="mb-8 p-6 border border-neutral-200 rounded-2xl">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <Skeleton className="w-40 h-12 rounded-xl" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-neutral-100">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
