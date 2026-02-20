/**
 * Web Vitals Metrics Endpoint
 * 
 * Receives Core Web Vitals metrics from the browser.
 * Stores metrics for analysis and performance monitoring.
 * 
 * POST /api/metrics/web-vitals
 * 
 * @see https://web.dev/vitals/
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import { metrics } from '@/lib/observability/metrics'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Validation schema for Web Vitals metric
// Note: FID is deprecated in web-vitals v5, replaced by INP
const WebVitalsMetricSchema = z.object({
  name: z.enum(['CLS', 'FCP', 'LCP', 'TTFB', 'INP']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  delta: z.number().optional(),
  entries: z.array(
    z.object({
      name: z.string(),
      startTime: z.number(),
      duration: z.number().optional(),
    })
  ).optional(),
  navigationType: z.enum(['navigate', 'reload', 'back-forward', 'prerender', 'restore']).optional(),
  timestamp: z.string().datetime().optional(),
  url: z.string().url().optional(),
  userAgent: z.string().optional(),
})

export type WebVitalsMetricPayload = z.infer<typeof WebVitalsMetricSchema>

/**
 * POST handler for Web Vitals metrics
 * 
 * Accepts Web Vitals metrics from the browser and:
 * 1. Logs to observability system
 * 2. Records metrics for aggregation
 * 3. Optionally stores in database for historical analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate payload
    const result = WebVitalsMetricSchema.safeParse(body)
    if (!result.success) {
      logger.warn('Invalid Web Vitals metric received', {
        issues: result.error.issues,
        body,
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid metric format',
          details: result.error.issues,
        },
        { status: 400 }
      )
    }

    const metric = result.data
    const url = (metric.url ?? request.headers.get('referer')) ?? 'unknown'
    const userAgent = (metric.userAgent ?? request.headers.get('user-agent')) ?? 'unknown'

    // Log metric for debugging
    logger.info('Web Vitals metric received', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      url: url.split('?')[0], // Remove query params for privacy
    })

    // Record metric for aggregation
    const metricName = `web_vitals_${metric.name.toLowerCase()}`
    metrics.histogram(metricName, metric.value, {
      rating: metric.rating ?? 'unknown',
      navigation_type: metric.navigationType ?? 'navigate',
    })

    // Track rating distribution
    if (metric.rating) {
      metrics.increment(`web_vitals_${metric.name.toLowerCase()}_rating`, 1, {
        rating: metric.rating,
      })
    }

    // Store in Supabase for historical analysis (async, don't wait)
    storeMetricInDatabase(metric, url, userAgent).catch(error => {
      logger.error('Failed to store Web Vitals metric', { 
        error: error instanceof Error ? error.message : String(error),
        metric: metric.name,
      })
    })

    // Return success
    return NextResponse.json({
      success: true,
      received: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
      },
    })

  } catch (error) {
    logger.error('Web Vitals endpoint error', {
      error: error instanceof Error ? error.message : String(error),
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Store metric in database for historical analysis
 */
async function storeMetricInDatabase(
  metric: WebVitalsMetricPayload,
  url: string,
  userAgent: string
): Promise<void> {
  // Only store in production to avoid polluting dev data
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  // Skip if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return
  }

  try {
    const supabase = await createClient()

    // Extract path from URL for grouping
    let path = url
    try {
      const urlObj = new URL(url)
      path = urlObj.pathname
    } catch {
      // Use raw URL if parsing fails
    }

    // Store metric
    const { error } = await supabase.from('web_vitals_metrics').insert({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      navigation_type: metric.navigationType,
      page_path: path,
      user_agent: userAgent.slice(0, 500), // Limit length
      timestamp: metric.timestamp || new Date().toISOString(),
    })

    if (error) {
      // Table might not exist yet, log but don't throw
      if (error.code === '42P01') { // PostgreSQL undefined_table error
        logger.warn('web_vitals_metrics table does not exist', {
          hint: 'Run the migration to create the web_vitals_metrics table',
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    // Log but don't throw - metrics should never break the app
    logger.error('Failed to store Web Vitals metric in database', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Web Vitals metrics endpoint is running',
    supportedMetrics: ['CLS', 'FCP', 'LCP', 'TTFB', 'INP'],
    note: 'FID is deprecated, use INP instead',
  })
}
