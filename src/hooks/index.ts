/**
 * Hooks Barrel Export
 * 
 * Centralizes all custom hooks for easier imports.
 * 
 * @example
 * ```typescript
 * import { usePremiumAccess, useCookieConsent } from '@/hooks'
 * ```
 */

// Premium & Access
export { usePremiumAccess, useHasPremiumAccess, usePremiumFeatures } from './usePremiumAccess'

// Consent & Privacy
export { useCookieConsent } from './useCookieConsent'

// Form & Validation
export { useFormValidation } from './useFormValidation'

// UI & Accessibility
export { useReducedMotion } from './useReducedMotion'
export { useButtonState } from './useButtonState'

// User & Auth
export { useUser } from './useUser'

// Voice & Transcription
export { useVapi } from './useVapi'

// Analytics
export { useSoapAnalytics } from './useSoapAnalytics'
export { useVoiceToSOAP } from './useVoiceToSOAP'

// Re-export types
export type { UsePremiumAccessReturn, PremiumAccessState } from './usePremiumAccess'
