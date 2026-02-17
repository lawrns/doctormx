'use client'

/**
 * Dynamically imported animation components
 * 
 * These components are lazy-loaded to reduce the initial bundle size.
 * Use these for non-critical animations that are below the fold or
 * not needed on initial page load.
 */

import dynamic from 'next/dynamic'
import type { HTMLMotionProps, Variants } from 'framer-motion'
import type { ReactNode } from 'react'

// Loading placeholder for animations
const AnimationPlaceholder = ({ children, className }: { children?: ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
)

// Dynamic imports for animation components
export const DynamicFadeInUp = dynamic(
  () => import('./index').then(mod => ({ default: mod.FadeInUp })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicFadeIn = dynamic(
  () => import('./index').then(mod => ({ default: mod.FadeIn })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicScaleIn = dynamic(
  () => import('./index').then(mod => ({ default: mod.ScaleIn })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicSlideInLeft = dynamic(
  () => import('./index').then(mod => ({ default: mod.SlideInLeft })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicSlideInRight = dynamic(
  () => import('./index').then(mod => ({ default: mod.SlideInRight })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicStaggerContainer = dynamic(
  () => import('./index').then(mod => ({ default: mod.StaggerContainer })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicStaggerItem = dynamic(
  () => import('./index').then(mod => ({ default: mod.StaggerItem })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicHoverScale = dynamic(
  () => import('./index').then(mod => ({ default: mod.HoverScale })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicScrollFadeIn = dynamic(
  () => import('./index').then(mod => ({ default: mod.ScrollFadeIn })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicAnimatedGradient = dynamic(
  () => import('./index').then(mod => ({ default: mod.AnimatedGradient })),
  { ssr: false, loading: () => <div className="absolute inset-0 -z-10" />
}
)

export const DynamicMorphingBlob = dynamic(
  () => import('./index').then(mod => ({ default: mod.MorphingBlob })),
  { ssr: false, loading: () => <div className="absolute rounded-full blur-3xl opacity-30" />
}
)

// Floating and Pulse elements are often below the fold - lazy load them
export const DynamicFloatingElement = dynamic(
  () => import('./index').then(mod => ({ default: mod.FloatingElement })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)

export const DynamicPulseElement = dynamic(
  () => import('./index').then(mod => ({ default: mod.PulseElement })),
  { ssr: false, loading: () => <AnimationPlaceholder /> }
)
