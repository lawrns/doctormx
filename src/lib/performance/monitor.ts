/**
 * Performance Monitoring for Doctor.mx
 * Tracks API response times and healthcare-critical operation metrics
 * Targets:
 * - Emergency detection <100ms p99
 * - API responses <500ms p95
 */

import { logger } from '@/lib/observability/logger'
import { metrics } from '@/lib/observability/metrics'

export type PerformanceOperation =
  | 'api_request'
  | 'emergency_detection'
  | 'red_flags_evaluation'
  | 'ai_consult'
  | 'database_query'
  | 'cache_lookup'
  | 'chat_message'
  | 'triage_evaluation'
  | 'soap_generation'

export interface PerformanceConfig {
  // p95 threshold in milliseconds
  p95ThresholdMs: number
  // p99 threshold in milliseconds
  p99ThresholdMs: number
  // Enable logging for slow requests
  logSlowRequests: boolean
  // Threshold for slow request warning (ms)
  slowRequestThresholdMs: number
}

// Healthcare-specific performance targets
export const HEALTHCARE_PERFORMANCE_TARGETS: Record<string, PerformanceConfig> = {
  // Emergency detection must be extremely fast
  emergency_detection: {
    p95ThresholdMs: 50,
    p99ThresholdMs: 100,
    logSlowRequests: true,
    slowRequestThresholdMs: 50,
  },
  red_flags_evaluation: {
    p95ThresholdMs: 50,
    p99ThresholdMs: 100,
    logSlowRequests: true,
    slowRequestThresholdMs: 50,
  },
  triage_evaluation: {
    p95ThresholdMs: 75,
    p99ThresholdMs: 150,
    logSlowRequests: true,
    slowRequestThresholdMs: 75,
  },
  // API responses should be under 500ms
  api_request: {
    p95ThresholdMs: 300,
    p99ThresholdMs: 500,
    logSlowRequests: true,
    slowRequestThresholdMs: 500,
  },
  // AI operations can be slower but should be monitored
  ai_consult: {
    p95ThresholdMs: 2000,
    p99ThresholdMs: 5000,
    logSlowRequests: true,
    slowRequestThresholdMs: 5000,
  },
  soap_generation: {
    p95ThresholdMs: 3000,
    p99ThresholdMs: 10000,
    logSlowRequests: true,
    slowRequestThresholdMs: 10000,
  },
  // Database operations
  database_query: {
    p95ThresholdMs: 100,
    p99ThresholdMs: 200,
    logSlowRequests: true,
    slowRequestThresholdMs: 200,
  },
  // Cache should be very fast
  cache_lookup: {
    p95ThresholdMs: 10,
    p99ThresholdMs: 50,
    logSlowRequests: true,
    slowRequestThresholdMs: 50,
  },
  // Chat messages
  chat_message: {
    p95ThresholdMs: 200,
    p99ThresholdMs: 500,
    logSlowRequests: true,
    slowRequestThresholdMs: 500,
  },
}

interface PerformanceMeasurement {
  operation: PerformanceOperation
  startTime: number
  labels?: Record<string, string>
  config: PerformanceConfig
}

/**
 * Start measuring performance for an operation
 */
export function startPerformanceMeasurement(
  operation: PerformanceOperation,
  labels?: Record<string, string>
): PerformanceMeasurement {
  return {
    operation,
    startTime: performance.now(),
    labels,
    config: HEALTHCARE_PERFORMANCE_TARGETS[operation] || HEALTHCARE_PERFORMANCE_TARGETS.api_request,
  }
}

/**
 * End performance measurement and record metrics
 */
export function endPerformanceMeasurement(measurement: PerformanceMeasurement): number {
  const duration = Math.round(performance.now() - measurement.startTime)
  const { operation, labels, config } = measurement

  // Record histogram metric
  metrics.histogram(`${operation}_duration_ms`, duration, labels)

  // Check if performance targets are met
  const isSlow = duration > config.slowRequestThresholdMs
  const isP99Exceeded = duration > config.p99ThresholdMs
  const isP95Exceeded = duration > config.p95ThresholdMs

  // Record SLA metrics
  metrics.increment(`${operation}_total`, 1, {
    ...labels,
    status: isP99Exceeded ? 'p99_exceeded' : isP95Exceeded ? 'p95_exceeded' : 'ok',
  })

  // Log slow requests
  if (isSlow && config.logSlowRequests) {
    logger.warn(`Slow ${operation}`, {
      duration_ms: duration,
      threshold_ms: config.slowRequestThresholdMs,
      ...labels,
    })
  }

  // Log critical performance issues
  if (isP99Exceeded) {
    logger.error(`Performance SLA exceeded for ${operation}`, {
      duration_ms: duration,
      p99_threshold_ms: config.p99ThresholdMs,
      p95_threshold_ms: config.p95ThresholdMs,
      ...labels,
    })
  }

  return duration
}

/**
 * Measure async operation performance
 */
export async function measurePerformance<T>(
  operation: PerformanceOperation,
  fn: () => Promise<T>,
  labels?: Record<string, string>
): Promise<T> {
  const measurement = startPerformanceMeasurement(operation, labels)
  try {
    const result = await fn()
    endPerformanceMeasurement(measurement)
    return result
  } catch (error) {
    endPerformanceMeasurement(measurement)
    throw error
  }
}

/**
 * Performance monitoring wrapper for API routes
 */
export function withPerformanceMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  operation: PerformanceOperation,
  handler: T,
  options?: {
    labels?: (args: Parameters<T>) => Record<string, string>
  }
): T {
  return (async (...args: Parameters<T>) => {
    const labels = options?.labels?.(args) || {}
    return measurePerformance(operation, () => handler(...args), labels)
  }) as T
}

/**
 * Create performance middleware for Next.js API routes
 */
export function createPerformanceMiddleware(operation: PerformanceOperation) {
  return async (
    request: Request,
    handler: () => Promise<Response>
  ): Promise<Response> => {
    const url = new URL(request.url)
    const measurement = startPerformanceMeasurement(operation, {
      method: request.method,
      path: url.pathname,
    })

    try {
      const response = await handler()
      const duration = endPerformanceMeasurement(measurement)

      // Add performance headers in development
      if (process.env.NODE_ENV === 'development') {
        const newResponse = new Response(response.body, response)
        newResponse.headers.set('X-Response-Time', `${duration}ms`)
        newResponse.headers.set('X-Performance-Operation', operation)
        return newResponse
      }

      return response
    } catch (error) {
      endPerformanceMeasurement(measurement)
      throw error
    }
  }
}

/**
 * Quick performance check for emergency detection
 * Returns the duration in milliseconds
 */
export function measureEmergencyDetection<T>(
  fn: () => T,
  labels?: Record<string, string>
): { result: T; duration: number } {
  const measurement = startPerformanceMeasurement('emergency_detection', labels)
  const result = fn()
  const duration = endPerformanceMeasurement(measurement)
  return { result, duration }
}

/**
 * Verify if performance meets healthcare targets
 */
export function verifyPerformanceTargets(
  operation: PerformanceOperation,
  durationMs: number
): {
  meetsP95: boolean
  meetsP99: boolean
  threshold: { p95: number; p99: number }
} {
  const config = HEALTHCARE_PERFORMANCE_TARGETS[operation] || HEALTHCARE_PERFORMANCE_TARGETS.api_request
  return {
    meetsP95: durationMs <= config.p95ThresholdMs,
    meetsP99: durationMs <= config.p99ThresholdMs,
    threshold: {
      p95: config.p95ThresholdMs,
      p99: config.p99ThresholdMs,
    },
  }
}

/**
 * Get performance statistics for a specific operation
 * This queries the metrics table for recent performance data
 */
export async function getPerformanceStats(
  operation: PerformanceOperation,
  timeWindow: '1h' | '24h' | '7d' = '24h'
): Promise<{
  count: number
  avgMs: number
  p95Ms: number
  p99Ms: number
  maxMs: number
  slaCompliance: number
}> {
  // This would typically query the metrics table
  // For now, return placeholder data
  return {
    count: 0,
    avgMs: 0,
    p95Ms: 0,
    p99Ms: 0,
    maxMs: 0,
    slaCompliance: 100,
  }
}

export default {
  startPerformanceMeasurement,
  endPerformanceMeasurement,
  measurePerformance,
  measureEmergencyDetection,
  verifyPerformanceTargets,
  withPerformanceMonitoring,
  createPerformanceMiddleware,
  HEALTHCARE_PERFORMANCE_TARGETS,
}

