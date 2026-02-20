/**
 * Numeric constants for Doctor.mx
 * Magic numbers extracted from codebase
 */

export const NUMERIC = {
  // Percentages
  PERCENT_10: 0.10,
  PERCENT_20: 0.20,
  PERCENT_40: 0.40,
  PERCENT_50: 0.50,
  PERCENT_60: 0.60,
  PERCENT_100: 1.00,

  // Platform fee percentage (40%)
  PLATFORM_FEE_PERCENT: 0.40,

  // Bundle savings percentage
  BUNDLE_SAVINGS_PERCENT: 20,

  // Time conversion multipliers
  MS_PER_SECOND: 1000,
  MS_PER_MINUTE: 60000,
  MS_PER_HOUR: 3600000,
  MS_PER_DAY: 86400000,

  // Minutes to milliseconds
  MINUTES_TO_MS: 60000,
  HOURS_TO_MS: 3600000,

  // Bytes to MB conversion
  BYTES_PER_KB: 1024,
  BYTES_PER_MB: 1024 * 1024,

  // Random number ranges
  RANDOM_TRACKING_MIN: 100000,
  RANDOM_TRACKING_MAX: 900000,
  RANDOM_SUFFIX_MIN: 100,
  RANDOM_SUFFIX_MAX: 1000,
  RANDOM_CEDULA_MIN: 1000000,
  RANDOM_CEDULA_MAX: 10000000,

  // Pagination defaults
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE_NUMBER: 1,

  // Rate limiting
  RATE_LIMIT_CHAT: 20,
  RATE_LIMIT_AI: 10,
  RATE_LIMIT_AUTH: 5,
  RATE_LIMIT_GENERAL: 100,

  // Retry counts
  DEFAULT_RETRY_ATTEMPTS: 3,
  DEFAULT_RETRY_COUNT: 3,

  // Array lengths
  MAX_DISPLAY_ITEMS: 10,
  DEFAULT_TRUNCATE_LENGTH: 100,

  // Order progression
  ORDER_PROGRESSION_STAGES: 4,

  // Tax
  TAX_RATE_IVA: 0.16,

  // Appointment duration
  DEFAULT_APPOINTMENT_DURATION_MINUTES: 30,

  // SLA days
  SLA_DEFAULT_DAYS: 20,
  SLA_WARNING_DAYS: 15,
  SLA_CRITICAL_DAYS: 18,

  // Retention
  DEFAULT_RETENTION_YEARS: 5,

  // Subscription
  SUBSCRIPTION_DAY_SECONDS: 86400,

  // Confidence calculation
  CONFIDENCE_DECIMAL_PLACES: 2,
} as const

export type NumericKey = keyof typeof NUMERIC
