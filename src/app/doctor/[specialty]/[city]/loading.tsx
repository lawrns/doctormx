import { Skeleton, SkeletonDoctorList } from '@/components/ui/skeleton'

export default function SpecialtyCityLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-48 mb-6" />
        <SkeletonDoctorList count={8} />
      </div>
    </div>
  )
}
