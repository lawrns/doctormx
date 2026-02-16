import { Skeleton } from '@/components'

export default function AvailabilityLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
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
        <aside className="hidden lg:block w-64 bg-white border-r min-h-[calc(100vh-73px)]">
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
        <main id="main-content" className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl">
            <Skeleton className="h-9 w-40 lg:w-52 mb-2" />
            <Skeleton className="h-5 w-56 lg:w-72 mb-8" />

            <div className="bg-white rounded-lg shadow border p-6">
              <Skeleton className="h-6 w-48 mb-6" />

              {/* Days skeleton */}
              <div className="space-y-6">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 ml-8">
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                      </div>
                      <div>
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Skeleton className="h-12 w-48 rounded-lg" />
              </div>
            </div>

            <div className="mt-6">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
