import { Skeleton, SkeletonDoctorList, SkeletonCard } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Skeleton className="h-12 w-3/4 mx-auto mb-6 bg-white/20" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-8 bg-white/20" />
            <div className="flex justify-center gap-4">
              <Skeleton className="h-12 w-40 bg-white/30" />
              <Skeleton className="h-12 w-40 bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Skeleton */}
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-12" />
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-64 mx-auto mb-12" />
          <SkeletonDoctorList count={4} />
        </div>
      </section>
    </div>
  )
}
