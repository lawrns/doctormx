/**
 * Health Check Endpoint - OBS-001 Implementation
 * 
 * Verifies the status of all critical services and dependencies:
 * - Database (Supabase)
 * - Cache (Redis/Upstash)
 * - External APIs (Stripe, Meta WhatsApp, Twilio)
 * - AI Services (GLM/OpenAI)
 * 
 * Returns 200 if healthy, 503 if unhealthy, with detailed status and latency for each check.
 * Used by load balancers and monitoring systems.
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCacheClient, isUsingFallbackMemoryCache } from '@/lib/cache/client'
import { stripe } from '@/lib/stripe'
import { AI_CONFIG } from '@/lib/ai/config'
import { logger } from '@/lib/observability/logger'

// ============================================================================
// Types
// ============================================================================

export type HealthStatus = 'ok' | 'error' | 'degraded' | 'skipped'

export interface HealthCheckResult {
  status: HealthStatus
  latency: number // milliseconds
  message?: string
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number // seconds
  environment: string
  checks: {
    database: HealthCheckResult
    cache: HealthCheckResult
    stripe: HealthCheckResult
    whatsapp: HealthCheckResult
    twilio: HealthCheckResult
    ai: HealthCheckResult
  }
}

// ============================================================================
// Service Check Functions
// ============================================================================

/**
 * Check database connectivity via Supabase
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const supabase = createServiceClient()
    
    // Simple query to verify connection
    const { error } = await supabase
      .from('doctores')
      .select('id')
      .limit(1)
    
    if (error) {
      return {
        status: 'error',
        latency: Date.now() - start,
        message: `Database query failed: ${error.message}`,
      }
    }
    
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      status: 'error',
      latency: Date.now() - start,
      message: `Database connection failed: ${message}`,
    }
  }
}

/**
 * Check cache connectivity (Redis/Upstash or in-memory fallback)
 */
async function checkCache(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const client = getCacheClient()
    
    // Test ping
    const pong = await client.ping()
    const latency = Date.now() - start
    
    if (pong !== 'PONG') {
      return {
        status: 'error',
        latency,
        message: 'Cache ping returned unexpected response',
      }
    }
    
    const isFallback = isUsingFallbackMemoryCache()
    
    return {
      status: isFallback ? 'degraded' : 'ok',
      latency,
      message: isFallback ? 'Using in-memory cache (Redis not configured)' : undefined,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      status: 'error',
      latency: Date.now() - start,
      message: `Cache connection failed: ${message}`,
    }
  }
}

/**
 * Check Stripe API connectivity
 */
async function checkStripe(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    // Check if API key is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        status: 'skipped',
        latency: Date.now() - start,
        message: 'STRIPE_SECRET_KEY not configured',
      }
    }
    
    // Test API by listing products
    await stripe.products.list({ limit: 1 })
    
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    // Connection success even if no products exist
    if (message.includes('No such product') || message.includes('resource_missing')) {
      return {
        status: 'ok',
        latency: Date.now() - start,
        message: 'Connected (no products found)',
      }
    }
    
    return {
      status: 'error',
      latency: Date.now() - start,
      message: `Stripe API error: ${message}`,
    }
  }
}

/**
 * Check Meta WhatsApp Business API connectivity
 */
async function checkWhatsApp(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const token = process.env.WHATSAPP_ACCESS_TOKEN
    
    if (!phoneId || !token) {
      return {
        status: 'skipped',
        latency: Date.now() - start,
        message: 'WhatsApp credentials not configured',
      }
    }
    
    // Test by calling the phone numbers endpoint
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneId}`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return {
        status: 'error',
        latency: Date.now() - start,
        message: `WhatsApp API error: ${error.error?.message ?? response.statusText}`,
      }
    }
    
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      status: 'error',
      latency: Date.now() - start,
      message: `WhatsApp connection failed: ${message}`,
    }
  }
}

/**
 * Check Twilio API connectivity
 */
async function checkTwilio(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    
    if (!accountSid || !authToken) {
      return {
        status: 'skipped',
        latency: Date.now() - start,
        message: 'Twilio credentials not configured',
      }
    }
    
    // Test by fetching account info
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
      {
        headers: { 'Authorization': `Basic ${auth}` },
        signal: controller.signal,
      }
    )
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      return {
        status: 'error',
        latency: Date.now() - start,
        message: `Twilio API error: ${error.message ?? response.statusText}`,
      }
    }
    
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      status: 'error',
      latency: Date.now() - start,
      message: `Twilio connection failed: ${message}`,
    }
  }
}

/**
 * Check AI service configuration
 * Note: Performs config check only to avoid unnecessary API costs
 */
async function checkAIService(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const hasGLM = Boolean(AI_CONFIG.glm.apiKey)
    const hasOpenAI = Boolean(AI_CONFIG.openai.apiKey)
    
    if (!hasGLM && !hasOpenAI) {
      return {
        status: 'error',
        latency: Date.now() - start,
        message: 'No AI provider configured (GLM_API_KEY or OPENAI_API_KEY required)',
      }
    }
    
    const providers: string[] = []
    if (hasGLM) providers.push('GLM')
    if (hasOpenAI) providers.push('OpenAI')
    
    return {
      status: 'ok',
      latency: Date.now() - start,
      message: `Configured providers: ${providers.join(', ')}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      status: 'error',
      latency: Date.now() - start,
      message: `AI configuration error: ${message}`,
    }
  }
}

// ============================================================================
// Main Handler
// ============================================================================

// Track server start time for uptime calculation
const startTime = Date.now()

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const requestStart = Date.now()
  
  // Run all health checks in parallel
  const [
    database,
    cache,
    stripe,
    whatsapp,
    twilio,
    ai,
  ] = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkStripe(),
    checkWhatsApp(),
    checkTwilio(),
    checkAIService(),
  ])
  
  const checks = {
    database,
    cache,
    stripe,
    whatsapp,
    twilio,
    ai,
  }
  
  // Determine overall health status
  const hasErrors = Object.values(checks).some(c => c.status === 'error')
  const hasDegraded = Object.values(checks).some(c => c.status === 'degraded')
  const allSkipped = Object.values(checks).every(c => c.status === 'skipped')
  
  let status: 'healthy' | 'unhealthy' | 'degraded'
  let httpStatus: number
  
  if (hasErrors) {
    status = 'unhealthy'
    httpStatus = 503
  } else if (hasDegraded || allSkipped) {
    status = 'degraded'
    httpStatus = 200
  } else {
    status = 'healthy'
    httpStatus = 200
  }
  
  const totalLatency = Date.now() - requestStart
  
  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV ?? 'development',
    checks,
  }
  
  // Log health check result if degraded or unhealthy
  if (status !== 'healthy') {
    logger.warn('Health check detected issues', {
      status,
      totalLatency,
      checks: Object.entries(checks).map(([name, result]) => ({
        name,
        status: result.status,
        message: result.message,
      })),
    })
  }
  
  // Add cache headers to prevent caching of health checks
  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}

/**
 * OPTIONS handler for CORS preflight requests
 * (needed for monitoring tools that may call from different origins)
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}
