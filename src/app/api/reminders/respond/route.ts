import { NextRequest, NextResponse } from 'next/server'
import { handleReminderResponse, type PatientResponse } from '@/lib/reminders'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const appointmentId = searchParams.get('a')
  const response = searchParams.get('r') as PatientResponse

  if (!appointmentId || !response) {
    return NextResponse.json(
      { error: 'Missing appointment ID or response' },
      { status: 400 }
    )
  }

  if (!['confirm', 'cancel', 'reschedule'].includes(response)) {
    return NextResponse.json(
      { error: 'Invalid response type' },
      { status: 400 }
    )
  }

  try {
    const result = await handleReminderResponse(appointmentId, response)

    // Return HTML page for web links (email clicks)
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Doctor.mx - ${result.message}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f8; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { background: white; padding: 48px; border-radius: 12px; box-shadow: 0 4px 14px rgba(15,37,95,.1); text-align: center; max-width: 420px; width: 90%; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; color: #0a1533; margin: 0 0 12px; font-weight: 600; }
    p { color: #5c6783; font-size: 15px; line-height: 1.5; margin: 0 0 24px; }
    .btn { display: inline-block; padding: 12px 24px; background: #0d72d6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${result.success ? (response === 'confirm' ? '✅' : response === 'cancel' ? '✕' : '↻') : '⚠️'}</div>
    <h1>${result.success ? (response === 'confirm' ? 'Cita Confirmada' : response === 'cancel' ? 'Cita Cancelada' : 'Reagendar Cita') : 'No se pudo procesar'}</h1>
    <p>${result.message}</p>
    <a class="btn" href="${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/app/appointments">Ver mis citas</a>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('Error handling reminder response:', error)
    return NextResponse.json(
      { error: 'Failed to process response', details: String(error) },
      { status: 500 }
    )
  }
}
