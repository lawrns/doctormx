import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getAdminMetrics, getRevenueMetrics, getUserMetrics, getAppointmentMetrics } from '@/lib/analytics'
import { logger } from '@/lib/observability/logger'

export async function GET() {
  try {
    await requireRole('admin')
    
    const [adminMetrics, revenueMetrics, userMetrics, appointmentMetrics] = await Promise.all([
      getAdminMetrics(),
      getRevenueMetrics(),
      getUserMetrics(),
      getAppointmentMetrics(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        admin: adminMetrics,
        revenue: revenueMetrics,
        users: userMetrics,
        appointments: appointmentMetrics,
      },
    })
  } catch (error) {
    logger.error('Admin analytics error:', { err: error })
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
