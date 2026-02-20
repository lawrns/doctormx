/**
 * Skeleton loader for AI Consultation page
 * Shown while the heavy AI consultation component is loading
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles } from 'lucide-react'

export function AiConsultaSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header Skeleton */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-20" />
            <div className="text-right">
              <Skeleton className="h-4 w-24 mb-1" />
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="w-2 h-2 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Chat Interface Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <Skeleton className="h-5 w-32 bg-white/50 mb-1" />
                <Skeleton className="h-4 w-40 bg-white/30" />
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="p-6 space-y-4 min-h-[400px] max-h-[500px]">
            {/* AI Welcome Message */}
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%] w-full">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            {/* User Message Placeholder */}
            <div className="flex justify-end">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl px-4 py-3 max-w-[60%] w-full">
                <Skeleton className="h-4 w-full bg-white/30" />
              </div>
            </div>

            {/* Loading Dots */}
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
              <Skeleton className="flex-1 h-12 rounded-xl" />
              <Skeleton className="h-12 w-24 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="mt-6 text-center">
          <Skeleton className="h-3 w-96 mx-auto mb-1" />
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </main>
    </div>
  )
}
