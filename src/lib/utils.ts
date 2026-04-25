import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(cents: number, currency: string = 'MXN'): string {
  const amount = cents / 100
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

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
 * Format Mexican phone number
 * Supports formats: +52 1 XXX XXX XXXX or (XXX) XXX-XXXX
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
 * Language code to display name mapper
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

/**
 * Safe error capture — logs to console and attempts Sentry reporting.
 * Never throws; safe in both client and server contexts.
 */
export function captureError(
  err: unknown,
  context: string,
  level: 'warning' | 'error' = 'error',
): void {
  console.error(`[${context}]`, err)
  try {
    const Sentry = require('@sentry/react')
    const error = err instanceof Error ? err : new Error(String(err))
    Sentry?.captureException(error, { level })
  } catch {
    // Sentry not available in this context (e.g. server-side); logging is sufficient
  }
}
