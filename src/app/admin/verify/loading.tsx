import { Skeleton } from '@/components/ui/skeleton'

export default function AdminVerifyLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-neutral-100">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
