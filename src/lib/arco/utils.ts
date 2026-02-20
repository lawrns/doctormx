/**
 * ARCO Utility Functions
 *
 * Shared utility functions used across ARCO system modules
 * Prevents code duplication and ensures consistency
 *
 * @module arco/utils
 */

// ================================================
// BUSINESS DAY CALCULATIONS
// ================================================

/**
 * Mexican holidays (observances)
 * These dates are excluded from business day calculations
 */
const MEXICAN_HOLIDAYS = [
  '01-01', // New Year's Day (Año Nuevo)
  '02-05', // Constitution Day (Día de la Constitución)
  '03-21', // Benito Juárez's Birthday (Natalicio de Benito Juárez)
  '05-01', // Labor Day (Día del Trabajo)
  '09-16', // Independence Day (Día de la Independencia)
  '11-20', // Revolution Day (Día de la Revolución)
  '12-25', // Christmas Day (Navidad)
]

/**
 * Format a date as MM-DD string for holiday comparison
 */
function formatDateAsMonthDay(date: Date): string {
  return date.toISOString().slice(5, 10)
}

/**
 * Check if a date is a Mexican holiday
 */
function isMexicanHoliday(date: Date): boolean {
  const monthDay = formatDateAsMonthDay(date)
  return MEXICAN_HOLIDAYS.includes(monthDay)
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // 0 = Sunday, 6 = Saturday
}

/**
 * Check if a date is a business day (not weekend or holiday)
 */
function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isMexicanHoliday(date)
}

/**
 * Calculate business days between two dates
 * Excludes weekends and Mexican holidays as per LFPDPPP
 *
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of business days
 *
 * @example
 * calculateBusinessDays('2024-01-01', '2024-01-15') // Returns 10
 */
export function calculateBusinessDays(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  // Normalize to midnight for consistent counting
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  let businessDays = 0
  let current = new Date(start)

  // Handle edge case where start > end
  if (current > end) {
    return 0
  }

  // Count business days (exclusive of end date)
  while (current < end) {
    if (isBusinessDay(current)) {
      businessDays++
    }
    current.setDate(current.getDate() + 1)
  }

  return businessDays
}

/**
 * Add business days to a date
 * Returns the date that is the specified number of business days in the future
 *
 * @param startDate - Starting date
 * @param businessDays - Number of business days to add
 * @returns Resulting date
 *
 * @example
 * addBusinessDays('2024-01-01', 20) // Returns 2024-01-31 (approximately)
 */
export function addBusinessDays(
  startDate: Date | string,
  businessDays: number
): Date {
  const result = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate)
  let daysAdded = 0
  let remainingDays = businessDays

  // Handle negative or zero input
  if (remainingDays <= 0) {
    return result
  }

  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1)

    if (isBusinessDay(result)) {
      remainingDays--
    }
    daysAdded++
  }

  return result
}

/**
 * Check if a date is a business day
 *
 * @param date - Date to check
 * @returns True if the date is a business day
 */
export function isDateBusinessDay(date: Date | string): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date
  return isBusinessDay(checkDate)
}

/**
 * Get the next business day after a given date
 *
 * @param date - Starting date
 * @returns The next business day
 */
export function getNextBusinessDay(date: Date | string): Date {
  const result = typeof date === 'string' ? new Date(date) : new Date(date)

  do {
    result.setDate(result.getDate() + 1)
  } while (!isBusinessDay(result))

  return result
}

// ================================================
// DATE FORMATTING UTILITIES
// ================================================

/**
 * Format date in Spanish locale format
 *
 * @param date - Date to format
 * @returns Formatted date string (e.g., "15 de enero, 2024")
 */
export function formatDateSpanish(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date and time in Spanish locale format
 *
 * @param date - Date to format
 * @returns Formatted date-time string
 */
export function formatDateTimeSpanish(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ================================================
// TIME PERIOD CALCULATIONS
// ================================================

/**
 * SLA time periods in business days for different request types
 */
export const SLA_PERIODS = {
  /** Standard ARCO requests: 20 business days (LFPDPPP) */
  ARCO_STANDARD: 20,

  /** Urgent ARCO requests: 10 business days */
  ARCO_URGENT: 10,

  /** Data deletion requests: 30 business days (extended processing) */
  DELETION_EXTENDED: 30,

  /** Rectification requests: 15 business days (verification required) */
  RECTIFICATION: 15,

  /** Opposition requests: 20 business days */
  OPPOSITION: 20,
} as const

/**
 * Calculate due date for ARCO request based on SLA
 *
 * @param startDate - When the request was created
 * @param requestType - Type of ARCO request
 * @param isUrgent - Whether request is marked urgent
 * @returns Due date for the request
 */
export function calculateArcoDueDate(
  startDate: Date | string,
  requestType: 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE' | 'default' = 'default',
  isUrgent = false
): Date {
  let slaDays: number = SLA_PERIODS.ARCO_STANDARD

  if (isUrgent) {
    slaDays = SLA_PERIODS.ARCO_URGENT
  } else {
    switch (requestType) {
      case 'RECTIFY':
        slaDays = SLA_PERIODS.RECTIFICATION
        break
      case 'CANCEL':
        slaDays = SLA_PERIODS.DELETION_EXTENDED
        break
      case 'OPPOSE':
        slaDays = SLA_PERIODS.OPPOSITION
        break
      default:
        slaDays = SLA_PERIODS.ARCO_STANDARD
    }
  }

  return addBusinessDays(startDate, slaDays)
}

/**
 * Calculate risk level for ARCO request based on time remaining
 *
 * @param dueDate - Request due date
 * @returns Risk level and remaining business days
 */
export function calculateSlaRiskLevel(
  dueDate: Date | string
): {
  level: 'low' | 'medium' | 'high' | 'critical'
  remainingBusinessDays: number
  isOverdue: boolean
} {
  const now = new Date()
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const remainingDays = calculateBusinessDays(now, due)

  if (remainingDays < 0) {
    return {
      level: 'critical',
      remainingBusinessDays: remainingDays,
      isOverdue: true,
    }
  }

  if (remainingDays <= 3) {
    return {
      level: 'high',
      remainingBusinessDays: remainingDays,
      isOverdue: false,
    }
  }

  if (remainingDays <= 7) {
    return {
      level: 'medium',
      remainingBusinessDays: remainingDays,
      isOverdue: false,
    }
  }

  return {
    level: 'low',
    remainingBusinessDays: remainingDays,
    isOverdue: false,
  }
}

// ================================================
// VALIDATION UTILITIES
// ================================================

/**
 * Validate if a date is within acceptable range for ARCO requests
 * Ensures dates are not in the past (more than 1 day) or too far in future
 *
 * @param date - Date to validate
 * @returns True if date is valid
 */
export function isValidArcoDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const oneYearFromNow = new Date(now)
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  return d >= yesterday && d <= oneYearFromNow
}

/**
 * Validate RFC (Mexican tax ID) format
 * Supports both individual and company RFC formats
 *
 * Individual: XXXX000000XXX (4 letters + 6 digits + 3 alphanumeric)
 * Company: XXX000000XXX (3 letters + 6 digits + 3 alphanumeric)
 *
 * @deprecated Use validateRFC from '@/lib/validation' instead for consistent validation
 * @param rfc - RFC to validate
 * @returns True if RFC format is valid
 * 
 * @example
 * ```ts
 * // Legacy usage (deprecated)
 * isValidRfc('BADD110313HDF') // true
 * 
 * // Recommended usage
 * import { validateRFC } from '@/lib/validation'
 * const result = validateRFC('BADD110313HDF')
 * if (result.isValid) { ... }
 * ```
 */
export function isValidRfc(rfc: string): boolean {
  // Delegate to centralized validator
  const { validateRFC } = require('@/lib/validation/mexican-validators')
  return validateRFC(rfc).isValid
}

/**
 * Validate email format for ARCO notifications
 * Uses a more comprehensive regex than basic email validation
 *
 * @param email - Email address to validate
 * @returns True if email format is valid
 */
export function isValidEmail(email: string): boolean {
  // More comprehensive email regex that supports international formats
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  return emailRegex.test(email.trim())
}

/**
 * Validate Mexican phone number format
 * Supports both mobile and landline with optional +52 country code
 *
 * Mobile: 10 digits
 * Landline: Area code (2-3 digits) + 7 digits
 *
 * @param phone - Phone number to validate
 * @returns True if phone format is valid
 */
export function isValidMexicanPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\s/g, '').replace(/[-()]/g, '')

  // With country code: +52 followed by 10 digits
  const withCountry = /^\+52\d{10}$/

  // Mobile: 10 digits starting with specific prefixes
  const mobile = /^(044|045|055)?\d{10}$/

  // Landline: area code (2-3 digits) + 7 digits
  const landline = /^\d{9,10}$/

  return withCountry.test(cleanPhone) || mobile.test(cleanPhone) || landline.test(cleanPhone)
}

// ================================================
// ERROR FORMATTING
// ================================================

/**
 * Format ARCO error message for user display
 *
 * @param code - Error code
 * @param context - Additional context
 * @returns User-friendly error message in Spanish
 */
export function formatArcoError(
  code: string,
  context?: Record<string, unknown>
): string {
  const messages: Record<string, string> = {
    DUPLICATE_REQUEST: 'Ya tiene una solicitud activa de este tipo. Por favor espere a que se resuelva la solicitud actual.',
    REQUEST_NOT_FOUND: 'No se encontró la solicitud especificada.',
    INVALID_SCOPE: 'El alcance de datos solicitado no es válido.',
    VALIDATION_FAILED: 'La información proporcionada no es válida. Por favor verifíquela e inténte de nuevo.',
    UNAUTHORIZED: 'No está autorizado para realizar esta acción.',
    RATE_LIMITED: 'Ha excedido el límite de solicitudes. Por favor inténtelo más tarde.',
  }

  const baseMessage = messages[code] ?? 'Ocurrió un error al procesar su solicitud.'

  if (context && Object.keys(context).length > 0) {
    return `${baseMessage} Contexto: ${JSON.stringify(context)}`
  }

  return baseMessage
}
