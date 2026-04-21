import { Skeleton } from '@/components'

export default function ProfileLoading() {
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
          <div className="max-w-4xl">
            <Skeleton className="h-9 w-36 lg:w-48 mb-2" />
            <Skeleton className="h-5 w-64 lg:w-80 mb-8" />

            {/* Personal info skeleton */}
            <div className="bg-card rounded-lg shadow border p-6 mb-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid md:grid-cols-2 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Professional info skeleton */}
            <div className="bg-card rounded-lg shadow border p-6 mb-6">
              <Skeleton className="h-6 w-56 mb-4" />
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-4 w-36 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div>
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-44 mb-2" />
                  <Skeleton className="h-24 w-full rounded-lg" />
                </div>
              </div>
            </div>

            {/* Rates skeleton */}
            <div className="bg-card rounded-lg shadow border p-6 mb-6">
              <Skeleton className="h-6 w-28 mb-4" />
              <div>
                <Skeleton className="h-4 w-40 mb-2" />
                <Skeleton className="h-10 w-48 rounded-lg" />
              </div>
            </div>

            {/* Stats skeleton */}
            <div className="bg-card rounded-lg shadow border p-6">
              <Skeleton className="h-6 w-36 mb-4" />
              <div className="grid md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Skeleton className="h-12 w-36 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
