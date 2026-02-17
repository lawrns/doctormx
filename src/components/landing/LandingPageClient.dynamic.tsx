'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamically import heavy sections that use framer-motion extensively
// This splits the landing page bundle and improves initial load time

const StatsSection = dynamic(() => import('./StatsSection').then(mod => ({ default: mod.StatsSection })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
})

const DrSimeonShowcase = dynamic(() => import('./DrSimeonShowcase'), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-gray-50 animate-pulse" />,
})

const TestimonialsSection = dynamic(() => import('./TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
})

// Export the dynamic components for use in the main LandingPageClient
export { StatsSection, DrSimeonShowcase, TestimonialsSection }
