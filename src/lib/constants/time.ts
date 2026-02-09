/**
 * Time-related constants for Doctor.mx
 * Durations, expirations, and time limits
 */

export const TIME = {
  // Video call durations
  VIDEO_CALL_DEFAULT_EXPIRATION_SECONDS: 3600, // 1 hour
  VIDEO_CALL_EXTENDED_EXPIRATION_SECONDS: 7200, // 2 hours

  // Payment expiration
  OXXO_EXPIRATION_DAYS: 3,

  // AI service timeouts
  AI_REQUEST_TIMEOUT_MS: 30000, // 30 seconds

  // Retry limits
  MAX_RETRIES: 3,

  // Session limits
  MAX_MESSAGES_PER_SESSION: 20, // Pre-consultation
  MAX_AUDIO_MINUTES: 60, // Typical consultation

  // Urgency timeframes
  URGENT_CARE_HOURS: 2,
  EMERGENCY_CARE_HOURS: 0, // Immediate
  NON_URGENT_HOURS: 24,

  // Appointment times
  DEFAULT_APPOINTMENT_DURATION_MINUTES: 30,
  EXTENDED_APPOINTMENT_DURATION_MINUTES: 60,

  // Notification delays
  RECEIPT_NOTIFICATION_DELAY_MS: 500,
} as const

export type TimeKey = keyof typeof TIME