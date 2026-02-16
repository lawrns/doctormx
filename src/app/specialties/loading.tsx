import { Skeleton } from '@/components/ui/skeleton'

export default function SpecialtiesLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Search Bar */}
        <Skeleton className="h-12 w-full max-w-xl mb-8 rounded-lg" />

        {/* Specialties Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="w-12 h-12 rounded-lg mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
