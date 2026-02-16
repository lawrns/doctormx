import { Skeleton } from '@/components/ui/skeleton'

export default function VideoConsultationLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="w-full aspect-video rounded-xl mb-4" />
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-12 h-12 rounded-full" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
