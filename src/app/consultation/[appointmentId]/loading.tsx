import { Skeleton } from '@/components/ui/skeleton'

export default function ConsultationLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Area */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl overflow-hidden aspect-video mb-4">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-12 h-12 rounded-full" />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Doctor Info */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-12 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Skeleton className="flex-1 h-10 rounded-lg" />
                <Skeleton className="w-10 h-10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
