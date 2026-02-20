/**
 * AI Metrics API Endpoint
 * Provides aggregated AI usage statistics for admin dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface AIMetrics {
  overview: {
    totalRequests: number
    totalCostUSD: number
    avgLatencyMs: number
    activeDoctors: number
  }
  byProvider: {
    provider: string
    requests: number
    costUSD: number
    avgLatencyMs: number
  }[]
  byEndpoint: {
    endpoint: string
    requests: number
    costUSD: number
    avgLatencyMs: number
  }[]
  byDay: {
    date: string
    requests: number
    costUSD: number
  }[]
  copilotStats: {
    totalSessions: number
    avgSessionLength: number
    totalSOAPNotes: number
    totalDifferentialDiagnoses: number
  }
  ragStats: {
    totalDocuments: number
    avgRetrievalScore: number
    topSpecialties: {
      specialty: string
      count: number
    }[]
  }
  recentActivity: {
    timestamp: string
    endpoint: string
    provider: string
    model: string
    costUSD: number
    latencyMs: number
  }[]
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get date range from query params (default: last 30 days)
    const url = new URL(request.url)
    const days = parseInt(url.searchParams.get('days') ?? '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get AI logs from the last N days
    const { data: aiLogs, error: logsError } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10000)

    if (logsError && logsError.code !== 'PGRST116') {
      // Table might not exist, return empty metrics
      logger.warn('AI usage logs table not found:', { context: logsError })
    }

    // Get copilot sessions stats
    const { data: copilotSessions } = await supabase
      .from('clinical_copilot_sessions')
      .select('created_at, messages, soap_note')
      .gte('created_at', startDate.toISOString())

    // Get medical knowledge stats
    const { data: knowledgeStats } = await supabase
      .from('medical_knowledge')
      .select('specialty')

    // Build metrics
    const metrics: AIMetrics = {
      overview: {
        totalRequests: aiLogs?.length ?? 0,
        totalCostUSD: aiLogs?.reduce((sum, log) => sum + (log.cost_usd ?? 0), 0) || 0,
        avgLatencyMs: aiLogs?.length
          ? aiLogs.reduce((sum, log) => sum + (log.latency_ms ?? 0), 0) / aiLogs.length
          : 0,
        activeDoctors: 0, // Would need to aggregate unique doctor_ids
      },
      byProvider: [],
      byEndpoint: [],
      byDay: [],
      copilotStats: {
        totalSessions: copilotSessions?.length ?? 0,
        avgSessionLength: copilotSessions?.length
          ? copilotSessions.reduce((sum, s) => sum + (s.messages?.length ?? 0), 0) / copilotSessions.length
          : 0,
        totalSOAPNotes: copilotSessions?.filter(s => s.soap_note)?.length ?? 0,
        totalDifferentialDiagnoses: 0, // Would need to parse suggestions
      },
      ragStats: {
        totalDocuments: knowledgeStats?.length ?? 0,
        avgRetrievalScore: 0.75, // Placeholder
        topSpecialties: aggregateSpecialties(knowledgeStats || []),
      },
      recentActivity: (aiLogs || []).slice(0, 20).map(log => ({
        timestamp: log.created_at,
        endpoint: log.endpoint ?? 'unknown',
        provider: log.provider ?? 'unknown',
        model: log.model ?? 'unknown',
        costUSD: log.cost_usd ?? 0,
        latencyMs: log.latency_ms ?? 0,
      })),
    }

    // Aggregate by provider
    if (aiLogs) {
      const providerMap = new Map<string, { requests: number; cost: number; latency: number; count: number }>()
      for (const log of aiLogs) {
        const provider = log.provider ?? 'unknown'
        if (!providerMap.has(provider)) {
          providerMap.set(provider, { requests: 0, cost: 0, latency: 0, count: 0 })
        }
        const stats = providerMap.get(provider)
        if (!stats) {
          throw new Error(`Provider stats not found for: ${provider}`)
        }
        stats.requests++
        stats.cost += log.cost_usd ?? 0
        stats.latency += log.latency_ms ?? 0
        stats.count++
      }
      metrics.byProvider = Array.from(providerMap.entries()).map(([provider, stats]) => ({
        provider,
        requests: stats.requests,
        costUSD: stats.cost,
        avgLatencyMs: stats.count ? stats.latency / stats.count : 0,
      }))
    }

    // Aggregate by endpoint
    if (aiLogs) {
      const endpointMap = new Map<string, { requests: number; cost: number; latency: number; count: number }>()
      for (const log of aiLogs) {
        const endpoint = log.endpoint ?? 'unknown'
        if (!endpointMap.has(endpoint)) {
          endpointMap.set(endpoint, { requests: 0, cost: 0, latency: 0, count: 0 })
        }
        const stats = endpointMap.get(endpoint)
        if (!stats) {
          throw new Error(`Endpoint stats not found for: ${endpoint}`)
        }
        stats.requests++
        stats.cost += log.cost_usd ?? 0
        stats.latency += log.latency_ms ?? 0
        stats.count++
      }
      metrics.byEndpoint = Array.from(endpointMap.entries()).map(([endpoint, stats]) => ({
        endpoint,
        requests: stats.requests,
        costUSD: stats.cost,
        avgLatencyMs: stats.count ? stats.latency / stats.count : 0,
      }))
    }

    // Aggregate by day
    if (aiLogs) {
      const dayMap = new Map<string, { requests: number; cost: number }>()
      for (const log of aiLogs) {
        const day = log.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        if (!dayMap.has(day)) {
          dayMap.set(day, { requests: 0, cost: 0 })
        }
        const stats = dayMap.get(day)
        if (!stats) {
          throw new Error(`Day stats not found for: ${day}`)
        }
        stats.requests++
        stats.cost += log.cost_usd ?? 0
      }
      metrics.byDay = Array.from(dayMap.entries())
        .map(([date, stats]) => ({ date, requests: stats.requests, costUSD: stats.cost }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-30) // Last 30 days
    }

    return NextResponse.json(metrics)
  } catch (error) {
    logger.error('[Admin AI Metrics] Error:', { err: error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function aggregateSpecialties(documents: Array<{ specialty: string }>) {
  const specialtyMap = new Map<string, number>()
  for (const doc of documents) {
    const specialty = doc.specialty ?? 'General'
    specialtyMap.set(specialty, (specialtyMap.get(specialty) ?? 0) + 1)
  }
  return Array.from(specialtyMap.entries())
    .map(([specialty, count]) => ({ specialty, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

// POST endpoint to export metrics as CSV
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { format = 'csv', days = 30 } = body

    // Get AI logs
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: aiLogs } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (!aiLogs || aiLogs.length === 0) {
      return NextResponse.json({ error: 'No data available' }, { status: 404 })
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = ['Date', 'Endpoint', 'Provider', 'Model', 'Cost (USD)', 'Latency (ms)', 'User ID']
      const rows = aiLogs.map(log => [
        log.created_at ?? '',
        log.endpoint ?? '',
        log.provider ?? '',
        log.model ?? '',
        (log.cost_usd ?? 0).toFixed(4),
        log.latency_ms ?? 0,
        log.user_id ?? '',
      ])
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ai-metrics-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (error) {
    logger.error('[Admin AI Metrics Export] Error:', { err: error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
