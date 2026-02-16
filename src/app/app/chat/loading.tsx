import { Skeleton } from '@/components/ui/skeleton'

export default function PatientChatLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Conversations List */}
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="divide-y divide-neutral-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : ''}`}>
                  {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full" />}
                  <div className={`max-w-[70%] ${i % 2 === 0 ? 'items-end' : ''}`}>
                    <Skeleton className="h-16 w-64 rounded-2xl" />
                    <Skeleton className="h-3 w-12 mt-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-neutral-200">
              <div className="flex gap-3">
                <Skeleton className="flex-1 h-12 rounded-lg" />
                <Skeleton className="w-12 h-12 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
