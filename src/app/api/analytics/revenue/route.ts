import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getRevenueMetrics } from '@/lib/analytics'

export async function GET() {
  try {
    await requireRole('admin')
    
    const metrics = await getRevenueMetrics()

    return NextResponse.json({
      success: true,
      data: metrics,
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    )
  }
}
