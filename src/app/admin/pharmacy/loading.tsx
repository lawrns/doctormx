import { Skeleton } from '@/components/ui/skeleton'

export default function AdminPharmacyLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-12 w-40 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="grid grid-cols-6 gap-4 p-4 border-b border-neutral-200 bg-neutral-50">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 border-b border-neutral-100 items-center">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
