import { Skeleton } from '@/components/ui/skeleton'

export default function PatientAIConsultaLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Skeleton className="w-5 h-5 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] p-6 space-y-4">
            {/* AI Welcome Message */}
            <div className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 max-w-[80%] bg-neutral-100 rounded-2xl p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-full" />
              ))}
            </div>
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-12 rounded-lg" />
              <Skeleton className="w-12 h-12 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
