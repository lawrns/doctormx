/**
 * Accessibility Components - WCAG 2.1 AA Compliant
 *
 * This module exports all accessibility components for easy importing.
 *
 * @example
 * ```tsx
 * import { SkipLink, useFocusTrap, LiveRegion } from '@/components/ui/accessibility'
 * ```
 */

export { SkipLink, MainContent, SkipLinks } from './skip-link'
export { useFocusTrap, FocusTrap, useStackableFocusTrap, type FocusableElement, type FocusTrapOptions } from './focus-trap'
export {
  LiveRegion,
  useLiveRegion,
  FormErrorLiveRegion,
  LoadingAnnouncement,
  GlobalLiveRegionProvider,
  useGlobalLiveRegion,
  type LiveRegionRole,
} from './live-region'

// Re-export for convenience
export { useReducedMotion, useMotionVariants } from '@/hooks/useReducedMotion'
