import { Skeleton } from '@/components/ui/skeleton'

export default function DoctorsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-[200] bg-card border-b border-border h-14 flex items-center">
        <div className="max-w-[1440px] mx-auto w-full px-6 flex items-center gap-4">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="hidden sm:block flex-1 max-w-[560px] h-9 rounded-lg" />
          <div className="ml-auto flex gap-1">
            <Skeleton className="w-[30px] h-[30px] rounded-md" />
            <Skeleton className="w-[30px] h-[30px] rounded-md" />
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr_380px] h-[calc(100vh-56px)] overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex flex-col border-r border-border p-5 gap-6 bg-card">
          {[1, 2, 3, 4].map((section) => (
            <div key={section}>
              <Skeleton className="h-3 w-24 rounded mb-3" />
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-5 w-full rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Results skeleton */}
        <div className="flex flex-col overflow-y-auto">
          <div className="sticky top-0 z-10 px-5 py-3.5 border-b border-border bg-card flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-48 rounded mb-1" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>

          <div className="p-4 flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-[8px] overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_210px]">
                <div className="p-4 border-r border-border/60 flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-[58px] h-[58px] rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-3 w-32 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1 mt-1">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
                <div className="p-3 bg-secondary/50 flex flex-col gap-2">
                  <Skeleton className="h-3 w-24 rounded" />
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
                      <Skeleton key={j} className="h-10 rounded-md" />
                    ))}
                  </div>
                  <Skeleton className="h-7 w-full rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map skeleton */}
        <div className="hidden lg:block border-l border-border bg-secondary" />
      </div>
    </div>
  )
}
