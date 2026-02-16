import { Skeleton } from '@/components/ui/skeleton'

export default function SoapDemoLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-200 mb-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
