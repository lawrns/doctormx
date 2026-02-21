// Metrics Collection
// Track counters, gauges, and histograms for monitoring

import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

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
const BUFFER_SIZE = 100
const FLUSH_INTERVAL_MS = 10000

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
    logger.error({ err: error }, '[Metrics] Flush error')
    // Re-add failed metrics to buffer (up to limit)
    metricsBuffer.push(...metrics.slice(0, BUFFER_SIZE - metricsBuffer.length))
  }
}

// Periodic flush
if (typeof setInterval !== 'undefined') {
  setInterval(flushMetrics, FLUSH_INTERVAL_MS)
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

export default metrics
