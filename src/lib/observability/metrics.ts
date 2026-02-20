// Metrics Collection
// Track counters, gauges, and histograms for monitoring

import { createServiceClient } from '@/lib/supabase/service'
import { logger } from '@/lib/observability/logger'
import { TIME, LIMITS } from '@/lib/constants'

export type MetricType = 'counter' | 'gauge' | 'histogram'

export interface MetricLabels {
  [key: string]: string
}

interface MetricData {
  name: string
  type: MetricType
  value: number
  labels?: MetricLabels
  timestamp: Date
}

// In-memory buffer for batching
const metricsBuffer: MetricData[] = []
const BUFFER_SIZE = LIMITS.PAGINATION_DEFAULT_PAGE_SIZE * 5 // 100
// Flush interval for metrics batch (10 seconds)
const FLUSH_INTERVAL_MS = TIME.METRICS_FLUSH_INTERVAL_MS

// Interval tracking for cleanup
let flushIntervalId: NodeJS.Timeout | null = null
let isInitialized = false

// Flush metrics to database
async function flushMetrics() {
  if (metricsBuffer.length === 0) return
  
  const metrics = metricsBuffer.splice(0, metricsBuffer.length)
  
  try {
    const supabase = await createServiceClient()
    
    await supabase.from('metrics').insert(
      metrics.map(m => ({
        name: m.name,
        type: m.type,
        value: m.value,
        labels: m.labels,
        recorded_at: m.timestamp.toISOString(),
      }))
    )
  } catch (error) {
    logger.error('Error recording metric', { error: (error as Error).message }, error as Error)
    // Re-add failed metrics to buffer (up to limit)
    metricsBuffer.push(...metrics.slice(0, BUFFER_SIZE - metricsBuffer.length))
  }
}

/**
 * Start the metrics flush interval
 * Safe to call multiple times - will only start once
 * @returns Cleanup function to stop the interval
 */
export function startMetricsFlush(): () => void {
  if (typeof setInterval === 'undefined') return () => {}
  if (isInitialized) return () => stopMetricsFlush()
  
  isInitialized = true
  flushIntervalId = setInterval(flushMetrics, FLUSH_INTERVAL_MS)
  
  // Also flush on page hide/unload
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
  }
  
  // Return cleanup function
  return () => stopMetricsFlush()
}

/**
 * Stop the metrics flush interval and cleanup
 */
export function stopMetricsFlush(): void {
  if (flushIntervalId) {
    clearInterval(flushIntervalId)
    flushIntervalId = null
  }
  isInitialized = false
  
  // Remove event listeners
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)
  }
  
  // Final flush
  flushMetrics()
}

/**
 * Flush metrics when page becomes hidden
 */
function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden') {
    flushMetrics()
  }
}

/**
 * Flush metrics before page unload
 */
function handleBeforeUnload(): void {
  flushMetrics()
}

function recordMetric(data: MetricData) {
  metricsBuffer.push(data)
  
  // Flush if buffer is full
  if (metricsBuffer.length >= BUFFER_SIZE) {
    flushMetrics()
  }
}

export const metrics = {
  // Increment a counter
  increment(name: string, value = 1, labels?: MetricLabels) {
    recordMetric({
      name,
      type: 'counter',
      value,
      labels,
      timestamp: new Date(),
    })
  },
  
  // Set a gauge value
  gauge(name: string, value: number, labels?: MetricLabels) {
    recordMetric({
      name,
      type: 'gauge',
      value,
      labels,
      timestamp: new Date(),
    })
  },
  
  // Record a histogram value (timing, etc)
  histogram(name: string, value: number, labels?: MetricLabels) {
    recordMetric({
      name,
      type: 'histogram',
      value,
      labels,
      timestamp: new Date(),
    })
  },
  
  // Record API request metrics
  apiRequest(path: string, method: string, statusCode: number, durationMs: number) {
    metrics.increment('api_requests_total', 1, { path, method, status: String(statusCode) })
    metrics.histogram('api_request_duration_ms', durationMs, { path, method })
  },
  
  // Record feature flag evaluation
  featureFlagEvaluation(flagKey: string, enabled: boolean) {
    metrics.increment('feature_flag_evaluations', 1, { 
      flag: flagKey, 
      enabled: String(enabled) 
    })
  },
  
  // Record second opinion metrics
  secondOpinion: {
    created() { metrics.increment('second_opinion_created') },
    submitted() { metrics.increment('second_opinion_submitted') },
    completed() { metrics.increment('second_opinion_completed') },
  },
  
  // Record referral metrics
  referrals: {
    created() { metrics.increment('referral_created') },
    accepted() { metrics.increment('referral_accepted') },
    completed() { metrics.increment('referral_completed') },
  },
  
  // Record SOAP note metrics
  soapNotes: {
    generated() { metrics.increment('soap_note_generated') },
    approved() { metrics.increment('soap_note_approved') },
    tokensUsed(tokens: number) { 
      metrics.histogram('soap_note_tokens', tokens) 
    },
  },
  
  // Force flush (for testing or shutdown)
  flush: flushMetrics,
}

// Note: Auto-start removed to prevent memory leaks
// Use startMetricsFlush() or initMetrics() instead and call cleanup on unmount/shutdown
// Example:
//   const cleanup = initMetrics();
//   // ... later on shutdown/unmount:
//   cleanup();

/**
 * Initialize metrics with explicit cleanup
 * Use this in apps instead of startMetricsFlush for better lifecycle management
 * @returns Cleanup function to stop all metrics flushing
 */
export function initMetrics(): () => void {
  return startMetricsFlush()
}

export default metrics
