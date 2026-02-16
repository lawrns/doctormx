import { Skeleton } from '@/components/ui/skeleton'

export default function ChatConversationLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          {/* Messages */}
          <div className="h-[500px] p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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
              <Skeleton className="w-10 h-12 rounded-lg" />
              <Skeleton className="flex-1 h-12 rounded-lg" />
              <Skeleton className="w-12 h-12 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
