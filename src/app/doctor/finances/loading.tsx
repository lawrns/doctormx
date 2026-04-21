import { Skeleton, SkeletonCard, SkeletonTable } from '@/components'

export default function FinancesLoading() {
  return (
    <div className="min-h-screen bg-secondary/50">
      {/* Header skeleton */}
      <header className="bg-card shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 lg:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Skeleton className="w-6 h-6 lg:hidden" />
            <Skeleton className="h-8 w-28 lg:w-32" />
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <Skeleton className="h-6 w-20 lg:w-24 rounded-full" />
            <Skeleton className="hidden md:block h-4 w-32" />
            <Skeleton className="h-4 w-20 lg:w-24" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar skeleton - hidden on mobile */}
        <aside className="hidden lg:block w-64 bg-card border-r min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="w-6 h-6 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl">
            <Skeleton className="h-9 w-32 lg:w-40 mb-2" />
            <Skeleton className="h-5 w-56 lg:w-72 mb-8" />

            <div className="space-y-6">
              {/* Stats skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>

              {/* Transactions skeleton */}
              <div className="bg-card rounded-lg shadow border p-6">
                <Skeleton className="h-6 w-48 lg:w-56 mb-4" />
                <SkeletonTable rows={5} cols={4} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
