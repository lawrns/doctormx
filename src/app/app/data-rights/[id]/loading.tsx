/**
 * Loading Skeleton for ARCO Request Detail Page
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-md border-b border-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Status Banner Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-7 w-64 mb-2" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <div className="flex gap-4 mb-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Details Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-full rounded" />
              </div>
            </div>

            <Skeleton className="h-16 w-full rounded-lg" />

            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded" />
              <Skeleton className="h-10 w-24 rounded" />
            </div>

            <Skeleton className="h-24 w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Timeline Card Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-7 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="w-px h-24 bg-gray-200" />
                  </div>
                  <div className="flex-1 p-4 rounded-lg border bg-gray-50">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
