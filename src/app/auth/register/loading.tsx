import { Skeleton } from '@/components/ui/skeleton'

export default function RegisterLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
          <Skeleton className="h-8 w-48 mx-auto mb-6" />
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="w-5 h-5 rounded mt-0.5" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          <div className="mt-6 text-center">
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
