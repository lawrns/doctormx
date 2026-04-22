import { NextRequest, NextResponse } from 'next/server'
import { APPOINTMENT_CONFIG } from '@/config/constants'
import { createCorsHeaders, getWidgetAvailableDates, getWidgetContext } from '@/lib/widget'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: createCorsHeaders(request.headers.get('origin')),
  })
}

export async function GET(request: NextRequest) {
  const cors = createCorsHeaders(request.headers.get('origin'))
  const doctorId = request.nextUrl.searchParams.get('doctorId') || ''
  const start = request.nextUrl.searchParams.get('start') || ''
  const end = request.nextUrl.searchParams.get('end') || ''

  if (!doctorId || !DATE_PATTERN.test(start) || !DATE_PATTERN.test(end)) {
    return NextResponse.json({ error: 'Rango requerido.' }, { status: 400, headers: cors })
  }

  try {
    const context = await getWidgetContext(doctorId, { publicOnly: true })
    if (!context) {
      return NextResponse.json({ error: 'Widget no disponible.' }, { status: 404, headers: cors })
    }

    const startDate = new Date(`${start}T00:00:00`)
    const endDate = new Date(`${end}T00:00:00`)
    const maxEnd = new Date(startDate)
    maxEnd.setDate(maxEnd.getDate() + APPOINTMENT_CONFIG.MAX_ADVANCE_DAYS)
    const boundedEnd = endDate > maxEnd ? maxEnd.toISOString().split('T')[0] : end

    const dates = await getWidgetAvailableDates(doctorId, start, boundedEnd)
    return NextResponse.json({ dates }, { headers: cors })
  } catch {
    return NextResponse.json({ error: 'No pudimos cargar fechas.' }, { status: 500, headers: cors })
  }
}
