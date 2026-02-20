/**
 * i18n Middleware
 * 
 * Handles locale detection, routing and cookie management.
 */

import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

export default createMiddleware({
  // Supported locales
  locales,
  
  // Default locale
  defaultLocale,
  
  // Strategy for locale prefix:
  // 'as-needed' - Only add locale prefix for non-default locale
  // 'always' - Always add locale prefix
  // 'never' - Never add locale prefix (use cookie only)
  localePrefix: 'as-needed',
  
  // Cookie configuration
  localeDetection: true,
})

export const config = {
  // Matcher for all paths except API routes, static files, etc.
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - Static files
    // - System files
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
