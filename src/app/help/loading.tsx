import { Skeleton } from '@/components/ui/skeleton'

export default function HelpLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>

        {/* Search */}
        <Skeleton className="h-12 w-full mb-12 rounded-lg" />

        {/* FAQ Categories */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="h-5 w-48" />
                </div>
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
