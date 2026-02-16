import { Skeleton } from '@/components/ui/skeleton'

export default function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-neutral-200 text-center">
          <Skeleton className="w-20 h-20 rounded-full mx-auto mb-6" />
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-full mx-auto mb-2" />
          <Skeleton className="h-4 w-3/4 mx-auto mb-8" />
          <Skeleton className="h-12 w-full rounded-lg mb-4" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
