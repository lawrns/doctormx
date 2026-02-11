/**
 * Limits and sizes constants for Doctor.mx
 * File sizes, rate limits, and other numeric limits
 */

export const LIMITS = {
  // File size limits (in bytes)
  FILE_SIZE_AVATAR_MAX: 5 * 1024 * 1024, // 5MB
  FILE_SIZE_DOCUMENT_MAX: 10 * 1024 * 1024, // 10MB
  FILE_SIZE_IMAGE_MAX: 5 * 1024 * 1024, // 5MB
  FILE_SIZE_AUDIO_MAX: 50 * 1024 * 1024, // 50MB

  // Text length limits
  TEXT_MAX_LENGTH_SHORT: 500,
  TEXT_MAX_LENGTH_MEDIUM: 1000,

  // Rate limiting
  RATE_LIMIT_REQUESTS_HIGH: 500,

  // Pagination
  PAGINATION_DEFAULT_LIMIT: 100,
  PAGINATION_MAX_LIMIT: 1000,

  // Performance thresholds
  PERFORMANCE_P95_THRESHOLD_MS: 300,
  PERFORMANCE_P99_THRESHOLD_MS: 500,
  PERFORMANCE_SLOW_REQUEST_THRESHOLD_MS: 500,

  // Debounce delays
  DEBOUNCE_SEARCH_MS: 300,
  DEBOUNCE_BUTTON_MS: 500,

  // Retry configuration
  RETRY_DELAY_MS: 1000,
  RETRY_BACKOFF_MULTIPLIER: 2,
  MAX_RETRIES: 3,

  // Content truncation
  CONTENT_TRUNCATE_LENGTH_SHORT: 300,
  CONTENT_TRUNCATE_LENGTH_MEDIUM: 400,
  CONTENT_TRUNCATE_LENGTH_LONG: 500,

  // Webhook timestamp tolerance
  WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS: 300, // 5 minutes
} as const

export type LimitsKey = keyof typeof LIMITS
