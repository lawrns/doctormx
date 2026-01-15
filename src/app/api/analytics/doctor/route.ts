import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getDoctorMetrics } from '@/lib/analytics'

export async function GET() {
  try {
    const { user } = await requireRole('doctor')
    
    const metrics = await getDoctorMetrics(user.id)

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    console.error('Doctor analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
