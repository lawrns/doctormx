import { Skeleton, SkeletonCard } from '@/components'

export default function DoctorDashboardLoading() {
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
            <Skeleton className="h-9 w-48 lg:w-64 mb-2" />
            <Skeleton className="h-5 w-64 lg:w-80 mb-8" />

            {/* Stats skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>

            {/* Appointments skeleton */}
            <div className="bg-card rounded-lg shadow border p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-40 lg:w-48" />
                <Skeleton className="h-4 w-16 lg:w-20" />
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-24 lg:w-32 mb-1" />
                        <Skeleton className="h-3 w-12 lg:w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16 lg:w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
