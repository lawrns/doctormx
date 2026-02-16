/**
 * Utilities Barrel Export
 * 
 * Centralized exports for all utility functions.
 * Import from this file to access all utilities:
 * 
 * ```ts
 * import { cn, formatDate, formatCurrency } from '@/lib/utils'
 * ```
 */

// Tailwind class merging
export { cn } from './cn'

// Formatting utilities
export {
  formatCurrency,
  formatDate,
  formatTime,
  formatDoctorName,
  formatPhoneNumber,
  formatLanguageName,
} from './formatters'
