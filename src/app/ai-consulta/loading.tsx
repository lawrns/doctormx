import { Skeleton } from '@/components/ui/skeleton'

export default function AIConsultaLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-[500px] p-6 space-y-4">
            {/* AI Message */}
            <div className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 max-w-[80%]">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-4 justify-end">
              <div className="flex-1 max-w-[80%]">
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>

            {/* AI Message */}
            <div className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 max-w-[80%]">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex gap-4">
              <Skeleton className="flex-1 h-12 rounded-lg" />
              <Skeleton className="w-12 h-12 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
