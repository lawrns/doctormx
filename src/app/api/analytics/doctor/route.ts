import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getDoctorMetrics } from '@/lib/analytics'
import { logger } from '@/lib/observability/logger'

export async function GET() {
  try {
    const { user } = await requireRole('doctor')
    
    const metrics = await getDoctorMetrics(user.id)

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    logger.error('Doctor analytics error:', { err: error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
