import { Skeleton, SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'

export default function DoctorAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <Skeleton className="h-6 w-40 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <Skeleton className="h-6 w-40 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <Skeleton className="h-6 w-48 mb-6" />
          <SkeletonTable rows={5} cols={4} />
        </div>
      </div>
    </div>
  )
}
