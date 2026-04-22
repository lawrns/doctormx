import { NextRequest, NextResponse } from 'next/server'
import { createCorsHeaders, getWidgetAvailableSlots, getWidgetContext } from '@/lib/widget'

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
  const date = request.nextUrl.searchParams.get('date') || ''

  if (!doctorId || !DATE_PATTERN.test(date)) {
    return NextResponse.json({ error: 'Fecha requerida.' }, { status: 400, headers: cors })
  }

  try {
    const context = await getWidgetContext(doctorId, { publicOnly: true })
    if (!context) {
      return NextResponse.json({ error: 'Widget no disponible.' }, { status: 404, headers: cors })
    }

    const slots = await getWidgetAvailableSlots(doctorId, date)
    return NextResponse.json({ slots }, { headers: cors })
  } catch {
    return NextResponse.json({ error: 'No pudimos cargar horarios.' }, { status: 500, headers: cors })
  }
}
