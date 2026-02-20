'use client'

/**
 * Lazy Motion - Dynamically loads framer-motion to reduce initial bundle size
 * 
 * This module provides:
 * 1. Dynamic imports for framer-motion components
 * 2. Skeleton loaders during component load
 * 3. Reduced motion support
 * 
 * Usage:
 * - For critical above-fold animations: use direct imports from 'framer-motion'
 * - For below-fold animations: use lazy imports from this module
 */

import dynamic from 'next/dynamic'
import { ReactNode, ComponentType } from 'react'

// ============================================
// SKELETON LOADERS
// ============================================

interface SkeletonProps {
  className?: string
  children?: ReactNode
  height?: string | number
  width?: string | number
}

/**
 * Generic animation skeleton placeholder
 */
export function AnimationSkeleton({ 
  className = '', 
  children,
  height,
  width 
}: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-neutral-100/50 ${className}`}
      style={{ 
        height: height ?? 'auto', 
        width: width ?? 'auto',
        minHeight: height ? undefined : '20px'
      }}
    >
      {children}
    </div>
  )
}

/**
 * Card skeleton for feature cards, stat cards, etc.
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white rounded-lg p-6 border border-neutral-200/60 ${className}`}>
      <div className="w-14 h-14 bg-neutral-200 rounded-2xl mb-5" />
      <div className="h-6 bg-neutral-200 rounded mb-3 w-3/4" />
      <div className="h-4 bg-neutral-200 rounded mb-2" />
      <div className="h-4 bg-neutral-200 rounded w-5/6" />
    </div>
  )
}

/**
 * Hero section skeleton
 */
export function HeroSkeleton() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Avatar skeleton */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-neutral-200 rounded-full animate-pulse" />
        </div>
        {/* Headline skeleton */}
        <div className="h-16 bg-neutral-200 rounded mb-6 animate-pulse max-w-3xl mx-auto" />
        <div className="h-16 bg-neutral-200 rounded mb-6 animate-pulse max-w-2xl mx-auto" />
        {/* Subheadline skeleton */}
        <div className="h-8 bg-neutral-200 rounded mb-8 animate-pulse max-w-2xl mx-auto" />
        {/* CTA skeleton */}
        <div className="h-14 bg-neutral-200 rounded-2xl animate-pulse max-w-md mx-auto" />
      </div>
    </section>
  )
}

/**
 * Stats section skeleton
 */
export function StatsSkeleton() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-10 bg-neutral-200 rounded mb-4 animate-pulse max-w-md mx-auto" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-neutral-200 rounded-2xl animate-pulse" />
              <div className="h-10 bg-neutral-200 rounded mb-2 animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Feature section skeleton
 */
export function FeaturesSkeleton() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-8 bg-neutral-200 rounded mb-4 animate-pulse max-w-xs mx-auto" />
          <div className="h-12 bg-neutral-200 rounded mb-4 animate-pulse max-w-lg mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Testimonial section skeleton
 */
export function TestimonialsSkeleton() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="h-12 bg-neutral-200 rounded mb-4 animate-pulse max-w-lg mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-neutral-200 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded mb-4" />
              <div className="h-4 bg-neutral-200 rounded mb-4" />
              <div className="h-4 bg-neutral-200 rounded mb-6 w-4/5" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neutral-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded mb-2 w-24" />
                  <div className="h-3 bg-neutral-200 rounded w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// LAZY LANDING PAGE SECTIONS
// ============================================

/**
 * Lazy-loaded HeroSection - below-fold content can defer loading
 */
export const LazyHeroSection = dynamic(
  () => import('@/components/landing/HeroSection').then(mod => ({ default: mod.HeroSection })),
  {
    ssr: false,
    loading: () => <HeroSkeleton />
  }
)

/**
 * Lazy-loaded FeaturesSection
 */
export const LazyFeaturesSection = dynamic(
  () => import('@/components/landing/FeaturesSection').then(mod => ({ default: mod.FeaturesSection })),
  {
    ssr: false,
    loading: () => <FeaturesSkeleton />
  }
)

/**
 * Lazy-loaded StatsSection
 */
export const LazyStatsSection = dynamic(
  () => import('@/components/landing/StatsSection').then(mod => ({ default: mod.StatsSection })),
  {
    ssr: false,
    loading: () => <StatsSkeleton />
  }
)

/**
 * Lazy-loaded TestimonialsSection
 */
export const LazyTestimonialsSection = dynamic(
  () => import('@/components/landing/TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })),
  {
    ssr: false,
    loading: () => <TestimonialsSkeleton />
  }
)

// ============================================
// LAZY ANIMATION COMPONENTS
// ============================================

/**
 * Lazy-loaded motion components for below-fold content
 */
export const LazyMotionDiv = dynamic(
  () => import('framer-motion').then(mod => {
    const Component = ({ children, className, ...props }: React.ComponentProps<typeof mod.motion.div>) => {
      return <mod.motion.div className={className} {...props}>{children}</mod.motion.div>
    }
    return { default: Component }
  }),
  {
    ssr: false,
    loading: () => <AnimationSkeleton />
  }
)

export const LazyMotionSpan = dynamic(
  () => import('framer-motion').then(mod => {
    const Component = ({ children, className, ...props }: React.ComponentProps<typeof mod.motion.span>) => {
      return <mod.motion.span className={className} {...props}>{children}</mod.motion.span>
    }
    return { default: Component }
  }),
  {
    ssr: false,
    loading: () => <span className="animate-pulse" />
  }
)

// ============================================
// UTILITY HOOKS FOR LAZY LOADING
// ============================================

/**
 * Hook to determine if animations should be lazy loaded
 * Based on connection speed and user preferences
 */
export function shouldLazyLoadAnimations(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return false
  
  // Check for slow connection
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (connection) {
    // Save data mode - disable animations
    if (connection.saveData) return true
    // Slow connection - lazy load
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') return true
  }
  
  return true
}

/**
 * Get animation loading strategy based on device capabilities
 */
export function getAnimationStrategy(): 'eager' | 'lazy' | 'none' {
  if (typeof window === 'undefined') return 'eager'
  
  // Check for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'none'
  }
  
  // Check connection
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (connection) {
    if (connection.saveData) return 'none'
    if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') return 'lazy'
  }
  
  return 'lazy'
}
