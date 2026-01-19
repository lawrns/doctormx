'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect user's prefers-reduced-motion setting
 * Returns true if user prefers reduced motion, false otherwise
 *
 * Usage:
 * const prefersReducedMotion = useReducedMotion()
 * const animationProps = prefersReducedMotion ? {} : { whileHover: { scale: 1.05 } }
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if matchMedia is available (SSR safety)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Returns animation variants that respect reduced motion preference
 * Pass the full variants when motion is allowed, returns empty/reduced variants when not
 */
export function useMotionVariants<T extends Record<string, unknown>>(
  fullVariants: T,
  reducedVariants?: Partial<T>
): T | Partial<T> {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return reducedVariants || {}
  }

  return fullVariants
}
