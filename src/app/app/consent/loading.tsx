import { Skeleton } from '@/components/ui/skeleton'

export default function ConsentLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>

        {/* Consents Table */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-neutral-200 bg-neutral-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          {/* Table Rows */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-neutral-100 items-center">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
