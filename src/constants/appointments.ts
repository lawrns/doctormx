/**
 * Appointment Configuration Constants - Doctor.mx
 *
 * Centralized configuration for appointment scheduling, durations,
 * and availability settings.
 *
 * @module constants/appointments
 * @see {@link ../config/constants.ts} - Original source
 */

/**
 * Appointment scheduling configuration
 * Defines default durations, advance booking limits, and access windows
 */
export const APPOINTMENT_CONFIG = {
  /** Default appointment duration in minutes */
  DURATION_MINUTES: 30,

  /** Maximum days in advance for booking appointments */
  MAX_ADVANCE_DAYS: 30,

  /** Interval between available time slots in minutes */
  SLOT_INTERVAL_MINUTES: 30,

  /** Minutes before appointment when pre-consultation becomes available */
  PRE_CONSULTATION_ACCESS_MINUTES: 10,
} as const

/**
 * Medical specialties available in the platform
 * Each specialty has a unique slug and display name
 */
export const SPECIALTIES = [
  { slug: 'general', name: 'Medicina General' },
  { slug: 'pediatria', name: 'Pediatría' },
  { slug: 'ginecologia', name: 'Ginecología' },
  { slug: 'dermatologia', name: 'Dermatología' },
  { slug: 'cardiologia', name: 'Cardiología' },
  { slug: 'psicologia', name: 'Psicología' },
  { slug: 'nutricion', name: 'Nutrición' },
] as const

/**
 * Type for specialty slugs derived from SPECIALTIES array
 */
export type SpecialtySlug = typeof SPECIALTIES[number]['slug']

/**
 * Type for specialty names derived from SPECIALTIES array
 */
export type SpecialtyName = typeof SPECIALTIES[number]['name']
