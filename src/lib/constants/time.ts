/**
 * Time-related constants for Doctor.mx
 * Durations, expirations, and time limits
 */

export const TIME = {
  // Video call durations
  VIDEO_CALL_DEFAULT_EXPIRATION_SECONDS: 3600, // 1 hour
  VIDEO_CALL_EXTENDED_EXPIRATION_SECONDS: 7200, // 2 hours

  // Time units in seconds
  SECOND: 1,
  MINUTE_IN_SECONDS: 60,
  HOUR_IN_SECONDS: 3600,
  DAY_IN_SECONDS: 86400,
  WEEK_IN_SECONDS: 604800,

  // Time units in milliseconds
  SECOND_IN_MS: 1000,
  MINUTE_IN_MS: 60000,
  HOUR_IN_MS: 3600000,
  DAY_IN_MS: 86400000,

  // Payment expiration
  OXXO_EXPIRATION_DAYS: 3,

  // AI service timeouts
  AI_REQUEST_TIMEOUT_MS: 30000, // 30 seconds

  // Retry limits
  MAX_RETRIES: 3,

  // Session limits
  MAX_MESSAGES_PER_SESSION: 20, // Pre-consultation
  MAX_AUDIO_MINUTES: 60, // Typical consultation
  MAX_AUDIO_DURATION_SECONDS: 3600, // 1 hour

  // Urgency timeframes
  URGENT_CARE_HOURS: 2,
  EMERGENCY_CARE_HOURS: 0, // Immediate
  NON_URGENT_HOURS: 24,

  // Appointment times
  DEFAULT_APPOINTMENT_DURATION_MINUTES: 30,
  EXTENDED_APPOINTMENT_DURATION_MINUTES: 60,

  // Notification delays
  RECEIPT_NOTIFICATION_DELAY_MS: 500,

  // Video call timing
  VIDEO_CALL_PRE_START_MINUTES: 15,
  VIDEO_CALL_POST_END_HOURS: 2,

  // Rate limiting windows
  RATE_LIMIT_WINDOW_SHORT: 60, // 1 minute
  RATE_LIMIT_WINDOW_MEDIUM: 300, // 5 minutes
  RATE_LIMIT_WINDOW_LONG: 3600, // 1 hour

  // Cache TTL values
  CACHE_TTL_MINIMAL: 60, // 1 minute
  CACHE_TTL_SHORT: 300, // 5 minutes
  CACHE_TTL_LONG: 3600, // 1 hour
  CACHE_TTL_EXTENDED: 86400, // 24 hours
} as const

export type TimeKey = keyof typeof TIME

