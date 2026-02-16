import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'

export default function AdminAnalyticsLoading() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <Skeleton className="h-6 w-48 mb-6" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="bg-white rounded-xl p-6 border border-neutral-200">
            <Skeleton className="h-6 w-48 mb-6" />
            <SkeletonTable rows={5} cols={3} />
          </div>
        </div>
      </div>
    </div>
  )
}
