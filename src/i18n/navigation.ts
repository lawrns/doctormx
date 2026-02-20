/**
 * i18n Navigation
 * 
 * Helper functions for locale-aware navigation.
 */

import { createNavigation } from 'next-intl/navigation'
import { locales, defaultLocale } from './config'

// Create navigation helpers with locale support
export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only show locale prefix for non-default locale
})

/**
 * Get the path without locale prefix
 */
export function getPathWithoutLocale(pathname: string): string {
  const localePattern = new RegExp(`^/(${locales.join('|')})(/|$)`)
  return pathname.replace(localePattern, '/') || '/'
}

/**
 * Check if path is a valid internal path
 */
export function isValidPath(path: string): boolean {
  // Exclude API routes and system files
  if (path.startsWith('/api/') || path.startsWith('/_')) {
    return false
  }
  return true
}
