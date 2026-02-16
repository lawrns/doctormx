/**
 * Video Consultation Configuration Constants - Doctor.mx
 *
 * Centralized configuration for video call providers and settings.
 *
 * @module constants/video
 * @see {@link ../config/constants.ts} - Original source
 */

/**
 * Supported video call providers
 */
export type VideoProvider = 'jitsi' | 'daily'

/**
 * Video consultation configuration
 * Defines the active provider and domain settings
 */
export const VIDEO_CONFIG = {
  /** Active video provider */
  PROVIDER: 'jitsi' as VideoProvider,

  /** Jitsi Meet domain for video calls */
  JITSI_DOMAIN: 'meet.jit.si',
} as const

/**
 * Video call quality presets
 */
export const VIDEO_QUALITY = {
  /** Low quality for poor connections */
  LOW: {
    resolution: '360p',
    frameRate: 15,
    bandwidth: 500, // kbps
  },
  /** Standard quality (default) */
  STANDARD: {
    resolution: '720p',
    frameRate: 30,
    bandwidth: 2500, // kbps
  },
  /** High quality for premium users */
  HIGH: {
    resolution: '1080p',
    frameRate: 30,
    bandwidth: 5000, // kbps
  },
} as const

/**
 * Video session timeouts and limits
 */
export const VIDEO_LIMITS = {
  /** Maximum duration for a video consultation in minutes */
  MAX_DURATION_MINUTES: 60,

  /** Grace period after consultation ends in minutes */
  GRACE_PERIOD_MINUTES: 5,

  /** Time before appointment to allow early entry in minutes */
  EARLY_ENTRY_MINUTES: 5,
} as const
