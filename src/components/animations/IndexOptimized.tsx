'use client'

/**
 * Optimized Animation Components
 * 
 * This module provides CSS-based alternatives to framer-motion animations
 * for cases where bundle size is more important than animation complexity.
 * 
 * Use these when:
 * - The component is above the fold (needs to load immediately)
 * - Bundle size is a priority
 * - Simple animations (fade, slide, scale) are sufficient
 */

import { ReactNode } from 'react'

// ============================================
// CSS-BASED ANIMATION COMPONENTS
// ============================================

interface AnimationProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

/**
 * Fade in from bottom using CSS animations
 * Replaces: FadeInUp from framer-motion
 */
export function FadeInUpCSS({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: AnimationProps) {
  return (
    <div
      className={`animate-fade-in-up ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Fade in using CSS animations
 * Replaces: FadeIn from framer-motion
 */
export function FadeInCSS({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: AnimationProps) {
  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Scale in using CSS animations
 * Replaces: ScaleIn from framer-motion
 */
export function ScaleInCSS({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: AnimationProps) {
  return (
    <div
      className={`animate-scale-in ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Slide in from left using CSS animations
 * Replaces: SlideInLeft from framer-motion
 */
export function SlideInLeftCSS({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: AnimationProps) {
  return (
    <div
      className={`animate-slide-in-left ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Slide in from right using CSS animations
 * Replaces: SlideInRight from framer-motion
 */
export function SlideInRightCSS({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '' 
}: AnimationProps) {
  return (
    <div
      className={`animate-slide-in-right ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Hover scale effect using CSS
 * Replaces: HoverScale from framer-motion
 */
export function HoverScaleCSS({ 
  children, 
  className = '' 
}: Omit<AnimationProps, 'delay' | 'duration'>) {
  return (
    <div className={`hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 ${className}`}>
      {children}
    </div>
  )
}

/**
 * Stagger container using CSS
 * Note: CSS-only stagger is limited; consider using dynamic imports for complex stagger
 */
export function StaggerContainerCSS({ 
  children, 
  className = '' 
}: Omit<AnimationProps, 'delay' | 'duration'>) {
  return (
    <div className={`stagger-children ${className}`}>
      {children}
    </div>
  )
}

/**
 * Stagger item for use with StaggerContainerCSS
 */
export function StaggerItemCSS({ 
  children, 
  delay = 0,
  className = '' 
}: AnimationProps) {
  return (
    <div 
      className={`animate-fade-in-up ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

// ============================================
// INTERSECTION OBSERVER HOOK FOR SCROLL ANIMATIONS
// ============================================

import { useEffect, useRef, useState } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

/**
 * Hook to trigger animations when element enters viewport
 * Replaces: whileInView from framer-motion
 */
export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

/**
 * Scroll-triggered fade in using Intersection Observer
 * Replaces: ScrollFadeIn from framer-motion
 */
export function ScrollFadeInCSS({ 
  children, 
  className = '' 
}: Omit<AnimationProps, 'delay' | 'duration'>) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '-50px' })

  return (
    <div
      ref={ref}
      className={`transition-all duration-600 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// ============================================
// UTILITY EXPORTS
// ============================================

/**
 * CSS animation class names for use in existing components
 */
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-fade-in-up',
  scaleIn: 'animate-scale-in',
  slideInLeft: 'animate-slide-in-left',
  slideInRight: 'animate-slide-in-right',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
} as const

/**
 * Utility to add animation delay inline styles
 */
export function getAnimationDelay(delayMs: number): { animationDelay: string } {
  return { animationDelay: `${delayMs}ms` }
}

/**
 * Utility to add animation duration inline styles
 */
export function getAnimationDuration(durationMs: number): { animationDuration: string } {
  return { animationDuration: `${durationMs}ms` }
}
