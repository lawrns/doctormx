import { Skeleton } from '@/components/ui/skeleton'

export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
          <Skeleton className="h-8 w-48 mx-auto mb-6" />
          
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-4 w-32 ml-auto" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          <div className="my-6 flex items-center gap-4">
            <Skeleton className="flex-1 h-px" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="flex-1 h-px" />
          </div>

          <Skeleton className="h-12 w-full rounded-lg" />
          
          <div className="mt-6 text-center">
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
