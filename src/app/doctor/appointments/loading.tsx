import { Skeleton, SkeletonAppointmentList } from '@/components'

export default function AppointmentsLoading() {
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
          <div className="max-w-6xl">
            <Skeleton className="h-9 w-36 lg:w-48 mb-2" />
            <Skeleton className="h-5 w-48 lg:w-64 mb-8" />

            <div className="bg-white rounded-lg shadow border p-6">
              {/* Filters skeleton */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              {/* Appointments list skeleton */}
              <SkeletonAppointmentList count={5} />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
