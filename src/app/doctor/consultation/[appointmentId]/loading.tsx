import { Skeleton } from '@/components/ui/skeleton'

export default function DoctorConsultationLoading() {
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
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
