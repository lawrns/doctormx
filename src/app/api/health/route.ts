/**
 * Health Check Endpoint
 * 
 * Verifica el estado de todos los servicios críticos:
 * - Database (Supabase)
 * - Cache (Redis/Upstash)
 * - Stripe
 * - AI Service (GLM/OpenAI)
 * 
 * Retorna 200 si todo OK, 503 si algo falla
 */

import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCacheClient, isUsingFallbackMemoryCache } from '@/lib/cache/client'
import { stripe } from '@/lib/stripe'
import { AI_CONFIG } from '@/lib/ai/config'

// ============================================================================
// Types
// ============================================================================

interface HealthCheckResult {
  status: 'ok' | 'error' | 'degraded' | 'skipped'
  latency: number // milliseconds
  message?: string
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  uptime: number // seconds
  environment: string
  checks: {
    database: HealthCheckResult
    cache: HealthCheckResult
    stripe: HealthCheckResult
    ai: HealthCheckResult
  }
}

// ============================================================================
// Service Check Functions
// ============================================================================

/**
 * Verifica la conexión a la base de datos Supabase
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const supabase = createServiceClient()
    
    // Hacer una consulta simple a una tabla que sabemos que existe
    const { data, error } = await supabase
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
 * Verifica la conexión al cache (Redis/Upstash o in-memory fallback)
 */
async function checkCache(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    const client = getCacheClient()
    
    // Intentar un ping al cache
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
 * Verifica la conexión a Stripe
 */
async function checkStripe(): Promise<HealthCheckResult> {
  const start = Date.now()
  
  try {
    // Verificar que tenemos la API key configurada
    if (!process.env.STRIPE_SECRET_KEY) {
      return {
        status: 'skipped',
        latency: Date.now() - start,
        message: 'STRIPE_SECRET_KEY not configured',
      }
    }
    
    // Hacer una llamada simple a Stripe (listar un producto)
    // Esto verifica que la API key es válida y Stripe está disponible
    await stripe.products.list({ limit: 1 })
    
    return {
      status: 'ok',
      latency: Date.now() - start,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    // Stripe puede estar en modo test sin productos, eso no es un error
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
 * Verifica la configuración del servicio de IA
 * Nota: No hace llamadas reales para evitar costos innecesarios
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
    
    // Verificar que la configuración es válida
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
  // Run all health checks in parallel
  const [
    database,
    cache,
    stripe,
    ai,
  ] = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkStripe(),
    checkAIService(),
  ])
  
  const checks = {
    database,
    cache,
    stripe,
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
  
  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    environment: process.env.NODE_ENV || 'development',
    checks,
  }
  
  return NextResponse.json(response, { status: httpStatus })
}

// ============================================================================
// CORS Headers
// ============================================================================

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}
