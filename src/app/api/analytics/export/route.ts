import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { exportAnalyticsData } from '@/lib/analytics'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get('type') as 'admin' | 'doctor') || 'admin'
    const format = searchParams.get('format') || 'json'

    const { user } = await requireRole(type === 'admin' ? 'admin' : 'doctor')
    
    const data = await exportAnalyticsData(type, user.id)

    if (format === 'csv') {
      const jsonString = JSON.stringify(data, null, 2)
      const csv = convertToCSV(jsonString)
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-${type}-${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data,
      exportedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Export analytics error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export analytics' },
      { status: 500 }
    )
  }
}

function convertToCSV(jsonData: string): string {
  const data = JSON.parse(jsonData)
  const headers = Object.keys(data)
  const values = Object.values(data).map(v => JSON.stringify(v))
  
  return [headers.join(','), values.join(',')].join('\n')
}
