import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; latency?: number }> = {}

  // Database check
  try {
    const start = Date.now()
    const supabase = await createServiceClient()
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    checks.database = {
      status: error ? 'error' : 'ok',
      latency: Date.now() - start,
    }
  } catch {
    checks.database = { status: 'error' }
  }

  // Stripe check (lightweight)
  try {
    checks.stripe = { status: process.env.STRIPE_SECRET_KEY ? 'ok' : 'error' }
  } catch {
    checks.stripe = { status: 'error' }
  }

  const allHealthy = Object.values(checks).every(c => c.status === 'ok')

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allHealthy ? 200 : 503 }
  )
}
