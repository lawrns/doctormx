/**
 * Skeleton loader for Authenticated AI Consultation page
 * Shown while the heavy authenticated AI consultation component is loading
 */

import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles } from 'lucide-react'

export function AiConsultaAppSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Navigation Skeleton */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto py-4">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
          {/* Header */}
          <header className="p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
          </header>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* AI Welcome */}
              <div className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>

              {/* User Message */}
              <div className="flex gap-3 justify-end">
                <div className="bg-blue-600 rounded-2xl px-4 py-3 max-w-[60%]">
                  <Skeleton className="h-4 w-48 bg-white/30" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              </div>

              {/* Loading Indicator */}
              <div className="flex items-center gap-2 text-gray-500">
                <Skeleton className="w-4 h-4 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>

          {/* Input Area */}
          <footer className="p-4 border-t flex-shrink-0 bg-white">
            <div className="flex gap-2">
              <Skeleton className="flex-1 h-12 rounded-xl" />
              <Skeleton className="w-12 h-12 rounded-lg" />
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
