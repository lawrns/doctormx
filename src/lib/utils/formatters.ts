/**
 * Formatting utilities for display
 * 
 * Provides consistent formatting for currency, dates, times, and names
 * using Mexican Spanish locale (es-MX).
 */

/**
 * Format a price amount in cents to Mexican Peso currency string
 * 
 * @param cents - Amount in cents (e.g., 10000 for $100.00)
 * @param currency - Currency code (default: 'MXN')
 * @returns Formatted currency string (e.g., "$100" or "$100.50")
 * 
 * @example
 * ```ts
 * formatCurrency(10000) // "$100"
 * formatCurrency(10050) // "$101"
 * formatCurrency(10000, 'USD') // "$100.00"
 * ```
 */
export function formatCurrency(cents: number, currency: string = 'MXN'): string {
  const amount = cents / 100
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a date to Mexican Spanish locale string
 * 
 * @param date - Date object or ISO string
 * @returns Formatted date (e.g., "15 de enero de 2024")
 * 
 * @example
 * ```ts
 * formatDate('2024-01-15') // "15 de enero de 2024"
 * formatDate(new Date()) // "11 de febrero de 2026"
 * ```
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Format a time to Mexican Spanish locale string
 * 
 * @param date - Date object or ISO string
 * @returns Formatted time (e.g., "14:30")
 * 
 * @example
 * ```ts
 * formatTime('2024-01-15T14:30:00') // "14:30"
 * ```
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format a doctor's name with appropriate prefix
 * 
 * Adds "Dr." prefix if not already present. Handles both "Doctor" 
 * and "Doctora" variations.
 * 
 * @param name - Doctor's name
 * @returns Formatted name with prefix (e.g., "Dr. Juan Pérez")
 * 
 * @example
 * ```ts
 * formatDoctorName('Juan Pérez') // "Dr. Juan Pérez"
 * formatDoctorName('Dr. Juan Pérez') // "Dr. Juan Pérez"
 * formatDoctorName('Dra. María López') // "Dra. María López"
 * ```
 */
export function formatDoctorName(name: string | null | undefined): string {
  if (!name) return 'Doctor'
  const cleanName = name.trim()
  if (cleanName.toLowerCase().startsWith('dr.') || cleanName.toLowerCase().startsWith('dra.')) {
    return cleanName
  }
  if (cleanName.toLowerCase().startsWith('doctor') || cleanName.toLowerCase().startsWith('doctora')) {
    return cleanName
  }
  return `Dr. ${cleanName}`
}

/**
 * Format a Mexican phone number to standard format
 * 
 * Handles various input formats and normalizes to: +52 1 XXX XXX XXXX
 * 
 * @param phone - Phone number string (various formats accepted)
 * @returns Formatted phone number or original if format unknown
 * 
 * @example
 * ```ts
 * formatPhoneNumber('5512345678') // "+52 1 551 234 5678"
 * formatPhoneNumber('+52 1 5512345678') // "+52 1 551 234 5678"
 * ```
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Mexican mobile numbers: 11 digits starting with 52
  if (digits.length === 11 && digits.startsWith('52')) {
    return `+52 1 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  
  // Mexican mobile numbers: 10 digits (add country code)
  if (digits.length === 10) {
    return `+52 1 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  
  // If already has country code but no formatting
  if (digits.length === 12 && digits.startsWith('521')) {
    return `+52 1 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
  }
  
  // Return original if doesn't match expected patterns
  return phone
}

/**
 * Map language code to display name in Spanish
 * 
 * @param code - ISO 639-1 language code
 * @returns Display name in Spanish or the code if unknown
 * 
 * @example
 * ```ts
 * formatLanguageName('es') // "Español"
 * formatLanguageName('en') // "Inglés"
 * formatLanguageName('xx') // "xx"
 * ```
 */
export function formatLanguageName(code: string): string {
  const languageMap: Record<string, string> = {
    'es': 'Español',
    'en': 'Inglés',
    'fr': 'Francés',
    'de': 'Alemán',
    'it': 'Italiano',
    'pt': 'Portugués',
    'zh': 'Chino',
    'ja': 'Japonés',
    'ko': 'Coreano',
    'ar': 'Árabe',
    'ru': 'Ruso',
  }
  return languageMap[code] || code
}
