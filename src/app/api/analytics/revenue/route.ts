import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getRevenueMetrics } from '@/lib/analytics'
import { logger } from '@/lib/observability/logger'

export async function GET() {
  try {
    await requireRole('admin')
    
    const metrics = await getRevenueMetrics()

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    logger.error('Revenue analytics error:', { err: error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    )
  }
}
