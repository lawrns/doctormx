/**
 * i18n Configuration
 * 
 * Configuration for next-intl internationalization.
 * Supports Spanish (default) and English.
 */

import { getRequestConfig } from 'next-intl/server'

// Supported locales
export const locales = ['es', 'en'] as const
export type Locale = (typeof locales)[number]

// Default locale
export const defaultLocale: Locale = 'es'

// Locale display names
export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
}

// Locale flags/icons
export const localeFlags: Record<Locale, string> = {
  es: '🇲🇽',
  en: '🇺🇸',
}

/**
 * Get request configuration for next-intl
 */
export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  const validLocale = locale || defaultLocale
  if (!locales.includes(validLocale as Locale)) {
    throw new Error(`Invalid locale: ${validLocale}`)
  }

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
    timeZone: 'America/Mexico_City',
    now: new Date(),
  }
})
