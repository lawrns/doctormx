import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  createCorsHeaders,
  createWidgetAppointment,
  createWidgetBookingIntent,
  createWidgetBookingToken,
  createWidgetPaymentIntent,
  ensureWidgetPatient,
  getWidgetContext,
  normalizeEmail,
  normalizePhone,
} from '@/lib/widget'
import { scheduleAppointmentReminders } from '@/lib/reminders'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^\d{2}:\d{2}$/

function cleanText(value: unknown, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function getBaseUrl(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'doctor.mx'
  const protocol = request.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  return `${protocol}://${host}`
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: createCorsHeaders(request.headers.get('origin')),
  })
}

export async function POST(request: NextRequest) {
  const cors = createCorsHeaders(request.headers.get('origin'))
  let createdAppointmentId: string | null = null

  try {
    const body = await request.json()
    const doctorId = cleanText(body.doctorId)
    const serviceId = cleanText(body.serviceId)
    const date = cleanText(body.date)
    const time = cleanText(body.time)
    const patient = body.patient || {}
    const fullName = cleanText(patient.fullName, 100)
    const email = normalizeEmail(patient.email)
    const phone = normalizePhone(patient.phone)

    if (!doctorId || !serviceId || !DATE_PATTERN.test(date) || !TIME_PATTERN.test(time)) {
      return NextResponse.json({ error: 'Datos de reserva incompletos.' }, { status: 400, headers: cors })
    }

    if (fullName.length < 3 || !email) {
      return NextResponse.json({ error: 'Datos del paciente incompletos.' }, { status: 400, headers: cors })
    }

    const context = await getWidgetContext(doctorId, { publicOnly: true })
    if (!context) {
      return NextResponse.json({ error: 'Widget no disponible.' }, { status: 404, headers: cors })
    }

    const service = context.config.enabled_services.find((item) => item.id === serviceId)
    if (!service) {
      return NextResponse.json({ error: 'Servicio no disponible.' }, { status: 400, headers: cors })
    }

    const patientId = await ensureWidgetPatient({
      email,
      fullName,
      phone,
    })

    const appointmentId = await createWidgetAppointment({
      doctorId,
      patientId,
      date,
      time,
      appointmentType: service.appointment_type,
      serviceName: service.name,
    })
    createdAppointmentId = appointmentId

    await createWidgetPaymentIntent({
      appointmentId,
      doctorId,
      patientId,
      amountCents: service.price_cents,
      currency: context.doctor.currency,
    })

    const token = createWidgetBookingToken()
    await createWidgetBookingIntent({
      doctorId,
      patientId,
      appointmentId,
      patientEmail: email,
      token,
      origin: request.headers.get('origin'),
    })

    scheduleAppointmentReminders(appointmentId).catch((error) => {
      console.error('Failed to schedule widget booking reminders:', error)
    })

    const paymentUrl = `${getBaseUrl(request)}/widget/pay/${appointmentId}?token=${encodeURIComponent(token)}`

    return NextResponse.json(
      {
        success: true,
        appointmentId,
        paymentUrl,
      },
      { headers: cors }
    )
  } catch (error) {
    if (createdAppointmentId) {
      const supabase = createServiceClient()
      await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          cancellation_reason: 'Widget payment initialization failed',
          cancelled_at: new Date().toISOString(),
        })
        .eq('id', createdAppointmentId)

      await supabase
        .from('appointment_holds')
        .update({ status: 'released', updated_at: new Date().toISOString() })
        .eq('appointment_id', createdAppointmentId)
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No pudimos crear la reserva.' },
      { status: 500, headers: cors }
    )
  }
}
