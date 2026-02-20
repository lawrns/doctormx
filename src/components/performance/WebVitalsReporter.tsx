'use client'

/**
 * Web Vitals Reporter Component
 * 
 * Uses Next.js useReportWebVitals hook to track Core Web Vitals
 * and send metrics to analytics (Sentry and custom endpoint).
 * 
 * Metrics tracked:
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Initial load
 * - LCP (Largest Contentful Paint) - Loading performance
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Interactivity
 * 
 * @see https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals
 */

// Import Metric type from web-vitals package (Next.js 16+ compatible)
import { useReportWebVitals } from 'next/web-vitals'
import type { Metric } from 'web-vitals'
import { logger } from '@/lib/observability/logger'

export interface WebVitalsReporterProps {
  /** Enable debug logging to console */
  debug?: boolean
  /** Sample rate for sending metrics (0-1) */
  sampleRate?: number
  /** Custom endpoint URL for metrics */
  endpoint?: string
  /** Enable Sentry integration */
  enableSentry?: boolean
  /** Callback for custom metric handling */
  onMetric?: (metric: Metric) => void
}

/**
 * Get rating for a metric value based on thresholds
 */
function getMetricRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, { good: number; poor: number }> = {
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
    FID: { good: 100, poor: 300 },
  }

  const threshold = thresholds[name]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Get emoji for rating
 */
function getRatingEmoji(rating: string): string {
  switch (rating) {
    case 'good':
      return '✅'
    case 'poor':
      return '❌'
    case 'needs-improvement':
      return '⚠️'
    default:
      return 'ℹ️'
  }
}

/**
 * Send metric to custom analytics endpoint
 */
async function sendToAnalytics(metric: Metric, endpoint: string, sampleRate: number): Promise<void> {
  // Apply sampling
  if (Math.random() > sampleRate) {
    return
  }

  const rating = getMetricRating(metric.name, metric.value)

  // Prepare payload
  const payload = {
    name: metric.name,
    value: metric.value,
    rating,
    delta: metric.delta,
    entries: metric.entries,
    navigationType: metric.navigationType,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  }

  try {
    // Use sendBeacon if available for better reliability during page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: 'application/json',
      })
      navigator.sendBeacon(endpoint, blob)
    } else {
      // Fallback to fetch with keepalive
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
    }
  } catch (error) {
    // Silently fail - don't impact user experience
    logger.warn('[Web Vitals Reporter] Failed to send metric:', undefined, error as Error)
  }
}

/**
 * Send metric to Sentry for performance monitoring
 */
function sendToSentry(metric: Metric): void {
  if (typeof window === 'undefined') return

  const rating = getMetricRating(metric.name, metric.value)

  // Dynamic import to avoid issues during SSR
  import('@sentry/react').then(Sentry => {
    // Add metric as a breadcrumb
    Sentry.addBreadcrumb({
      category: 'web-vitals',
      message: `${metric.name}: ${Math.round(metric.value * 100) / 100}`,
      level: rating === 'good' ? 'info' : rating === 'poor' ? 'error' : 'warning',
      data: {
        name: metric.name,
        value: metric.value,
        rating,
        delta: metric.delta,
      },
    })

    // Send as transaction for poor metrics
    if (rating === 'poor') {
      Sentry.captureMessage(
        `Poor ${metric.name}: ${Math.round(metric.value * 100) / 100}`,
        {
          level: 'warning',
          tags: {
            'web-vital': metric.name,
            'web-vital-rating': rating,
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
 * Web Vitals Reporter Component
 * 
 * This component uses Next.js's useReportWebVitals hook to track
 * Core Web Vitals and send them to analytics.
 * 
 * Place this component in your root layout to track metrics across all pages.
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { WebVitalsReporter } from '@/components/performance/WebVitalsReporter'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitalsReporter debug={process.env.NODE_ENV === 'development'} />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function WebVitalsReporter({
  debug = process.env.NODE_ENV === 'development',
  sampleRate = 1.0,
  endpoint = '/api/metrics/web-vitals',
  enableSentry = true,
  onMetric,
}: WebVitalsReporterProps) {
  useReportWebVitals((metric) => {
    const rating = getMetricRating(metric.name, metric.value)

    // Log to console in debug mode
    if (debug) {
      const emoji = getRatingEmoji(rating)
      const valueFormatted = metric.name === 'CLS' 
        ? metric.value.toFixed(3) 
        : `${Math.round(metric.value)}ms`
      
      logger.info(
        `[Web Vitals] ${emoji} ${metric.name}: ${valueFormatted} (${rating})`
      )
    }

    // Send to custom endpoint
    if (endpoint) {
      sendToAnalytics(metric, endpoint, sampleRate)
    }

    // Send to Sentry
    if (enableSentry) {
      sendToSentry(metric)
    }

    // Dispatch custom event for other listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('web-vital', {
          detail: { ...metric, rating },
        })
      )
    }

    // Call custom callback if provided
    onMetric?.(metric)
  })

  // This component doesn't render anything
  return null
}

export default WebVitalsReporter
