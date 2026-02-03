import { Skeleton } from '@/components/ui/skeleton'

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto">
      <div className="flex-1 p-4 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            {i % 2 !== 0 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
            <div className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? 'bg-blue-500' : 'bg-gray-100'} rounded-2xl p-4`}>
              <Skeleton className={`h-4 w-48 ${i % 2 === 0 ? 'bg-blue-400' : 'bg-gray-200'}`} />
              <Skeleton className={`h-4 w-32 ${i % 2 === 0 ? 'bg-blue-400' : 'bg-gray-200'}`} />
            </div>
            {i % 2 === 0 && <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />}
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}
