import { Skeleton, SkeletonDoctorList } from '@/components/ui/skeleton'

export default function DoctorsLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 border border-neutral-200 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Results Count */}
        <Skeleton className="h-5 w-48 mb-6" />

        {/* Doctors Grid */}
        <SkeletonDoctorList count={8} />

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
