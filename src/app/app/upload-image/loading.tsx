import { Skeleton } from '@/components/ui/skeleton'

export default function UploadImageLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl p-8 border border-neutral-200 mb-8">
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 text-center">
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-5 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto mb-4" />
            <Skeleton className="h-10 w-32 mx-auto rounded-lg" />
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-5 h-5 rounded-full mt-0.5" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
