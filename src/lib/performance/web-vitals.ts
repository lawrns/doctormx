/**
 * Web Vitals Tracking for Doctor.mx
 * Monitors Core Web Vitals metrics for performance optimization
 *
 * Metrics tracked:
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Initial load
 * - LCP (Largest Contentful Paint) - Loading performance
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Interactivity (Chrome 108+)
 *
 * Note: FID (First Input Delay) is deprecated and replaced by INP in Chrome 108+
 *
 * @see https://web.dev/vitals/
 */

// web-vitals v5.x - Usando el submódulo de attribution para métricas detalladas
import {
  onCLS,
  onFCP,
  onLCP,
  onTTFB,
  onINP,
} from 'web-vitals/attribution'

import { logger } from '@/lib/observability/logger'

// Importar tipos desde el módulo principal
import type { Metric } from 'web-vitals'

// Definir MetricRating manualmente para web-vitals v5.x
export type MetricRating = 'good' | 'needs-improvement' | 'poor'

// Type definitions for Web Vitals metrics (v5.x compatible)
export type WebVitalMetric =
  | 'CLS'
  | 'FCP'
  | 'LCP'
  | 'TTFB'
  | 'INP'

// Interfaz extendida para nuestras métricas
export interface WebVitalsMetric extends Metric {
  name: WebVitalMetric
  rating: MetricRating
}

export interface WebVitalsConfig {
  /** Enable debug logging to console */
  debug?: boolean
  /** Endpoint URL for sending metrics */
  endpoint?: string
  /** Sample rate (0-1) for sending metrics */
  sampleRate?: number
  /** Enable Sentry integration */
  enableSentry?: boolean
  /** Thresholds for rating metrics */
  thresholds?: {
    [key in WebVitalMetric]?: {
      good: number
      needsImprovement: number
    }
  }
}

// Default configuration
const DEFAULT_CONFIG: WebVitalsConfig = {
  debug: process.env.NODE_ENV === 'development',
  endpoint: '/api/metrics/web-vitals',
  sampleRate: 1.0,
  enableSentry: true,
  thresholds: {
    CLS: { good: 0.1, needsImprovement: 0.25 },
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTFB: { good: 800, needsImprovement: 1800 },
    INP: { good: 200, needsImprovement: 500 },
  },
}

// Current configuration
let currentConfig: WebVitalsConfig = { ...DEFAULT_CONFIG }

/**
 * Get rating for a metric value
 */
function getMetricRating(
  name: WebVitalMetric,
  value: number,
  thresholds: WebVitalsConfig['thresholds'] = DEFAULT_CONFIG.thresholds
): MetricRating {
  const threshold = thresholds?.[name]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

/**
 * Send metric to analytics endpoint
 */
async function sendToEndpoint(metric: WebVitalsMetric, config: WebVitalsConfig): Promise<void> {
  if (!config.endpoint) return

  // Apply sampling
  if (config.sampleRate && Math.random() > config.sampleRate) {
    return
  }

  // Prepare payload
  const payload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    entries: metric.entries.map(entry => ({
      name: entry.name,
      startTime: entry.startTime,
      duration: (entry as PerformanceEntry).duration ?? 0,
    })),
    navigationType: metric.navigationType,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  }

  try {
    // Use sendBeacon if available for better reliability during page unload
    if (navigator.sendBeacon && config.endpoint) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      })
      navigator.sendBeacon(config.endpoint, blob)
    } else if (config.endpoint) {
      // Fallback to fetch with keepalive
      await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
    }
  } catch (error) {
    // Silently fail - don't impact user experience
    if (config.debug) {
      logger.warn('[Web Vitals] Failed to send metric:', undefined, error as Error)
    }
  }
}

/**
 * Send metric to Sentry for performance monitoring
 */
function sendToSentry(metric: WebVitalsMetric, config: WebVitalsConfig): void {
  if (!config.enableSentry || typeof window === 'undefined') return

  // Dynamic import to avoid issues during SSR
  import('@sentry/react').then(Sentry => {
    // Add metric as a breadcrumb
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${Math.round(metric.value * 100) / 100}`,
      level: metric.rating === 'good' ? 'info' : metric.rating === 'poor' ? 'error' : 'warning',
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
      },
    })

    // Send as transaction for poor metrics
    if (metric.rating === 'poor') {
      Sentry.captureMessage(
        `Poor ${metric.name}: ${Math.round(metric.value * 100) / 100}`,
        {
          level: 'warning',
          tags: {
            'web-vital': metric.name,
            'web-vital-rating': metric.rating,
          },
          extra: {
            value: metric.value,
            delta: metric.delta,
            entries: metric.entries,
          },
        }
      )
    }
  }).catch(() => {
    // Sentry not available, ignore
  })
}

/**
 * Report a Web Vital metric
 */
function reportMetric(metric: Metric): void {
  const webVitalMetric = metric as WebVitalsMetric

  // Log to console in debug mode
  if (currentConfig.debug) {
    const emoji = webVitalMetric.rating === 'good' ? '✅' : webVitalMetric.rating === 'poor' ? '❌' : '⚠️'
    logger.info(
      `[Web Vitals] ${emoji} ${webVitalMetric.name}: ${Math.round(webVitalMetric.value * 1000) / 1000} (${webVitalMetric.rating})`
    )
  }

  // Send to endpoint
  sendToEndpoint(webVitalMetric, currentConfig)

  // Send to Sentry
  sendToSentry(webVitalMetric, currentConfig)

  // Dispatch custom event for other listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('web-vital', {
        detail: webVitalMetric,
      })
    )
  }
}

/**
 * Configure Web Vitals tracking
 */
export function configureWebVitals(config: Partial<WebVitalsConfig>): void {
  currentConfig = { ...currentConfig, ...config }
}

/**
 * Get current Web Vitals configuration
 */
export function getWebVitalsConfig(): WebVitalsConfig {
  return { ...currentConfig }
}

/**
 * Manually trigger a metric report (for testing)
 */
export function reportWebVital(metric: Partial<WebVitalsMetric>): void {
  reportMetric(metric as Metric)
}

/**
 * Initialize Web Vitals tracking
 * 
 * Call this once in your application entry point (e.g., layout.tsx)
 * 
 * @example
 * ```tsx
 * useEffect(() => {
 *   initWebVitals({
 *     debug: process.env.NODE_ENV === 'development',
 *     enableSentry: true,
 *   })
 * }, [])
 * ```
 */
export function initWebVitals(config?: Partial<WebVitalsConfig>): () => void {
  // Skip on server-side
  if (typeof window === 'undefined') {
    return () => {}
  }

  // Apply custom configuration
  if (config) {
    configureWebVitals(config)
  }

  // Register all metric collectors (v5.x API)
  // En v5.x, las funciones solo reciben el callback, no hay opciones de ReportOpts
  onCLS(reportMetric)
  onFCP(reportMetric)
  onLCP(reportMetric)
  onTTFB(reportMetric)
  onINP(reportMetric)

  if (currentConfig.debug) {
    logger.info('[Web Vitals] Initialized with config:', { config: JSON.stringify(currentConfig) })
  }

  // Return cleanup function
  return () => {
    // Note: web-vitals doesn't provide an unsubscribe mechanism
    // The collectors run until page unload
    if (currentConfig.debug) {
      logger.info('[Web Vitals] Cleanup called (collectors continue until page unload)')
    }
  }
}

/**
 * Hook-style function for React components
 * Returns the current Web Vitals metrics (if any have been reported)
 */
export function useWebVitals() {
  // This is a placeholder for future React hook implementation
  // Currently metrics are reported via events and callbacks
  return {
    init: initWebVitals,
    configure: configureWebVitals,
    getConfig: getWebVitalsConfig,
  }
}

// Default export
export default {
  init: initWebVitals,
  configure: configureWebVitals,
  getConfig: getWebVitalsConfig,
  report: reportWebVital,
  getMetricRating,
}
