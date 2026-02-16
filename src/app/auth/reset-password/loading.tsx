import { Skeleton } from '@/components/ui/skeleton'

export default function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
        </div>

        {/* Reset Password Form */}
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-sm">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-full mx-auto mb-6" />
          
          <div className="space-y-4">
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div>
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
