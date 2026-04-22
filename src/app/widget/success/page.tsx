import Link from 'next/link'
import { CalendarCheck, Mail, ShieldCheck } from 'lucide-react'
import { createServiceClient } from '@/lib/supabase/server'
import { validateWidgetBookingToken } from '@/lib/widget'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

function formatDate(value?: string) {
  if (!value) return 'Fecha por confirmar'
  return new Date(value).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatTime(value?: string) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function WidgetSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ appointmentId?: string; token?: string }>
}) {
  const search = await searchParams
  const appointmentId = search.appointmentId || ''
  const token = search.token || ''
  const intent = appointmentId && token ? await validateWidgetBookingToken({ appointmentId, token }) : null

  let appointment: any = null
  if (intent) {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('appointments')
      .select(`
        id,
        start_ts,
        status,
        reason_for_visit,
        doctor:doctors (
          profile:profiles!doctors_id_fkey (
            full_name
          )
        )
      `)
      .eq('id', appointmentId)
      .maybeSingle()

    appointment = data
  }

  const doctor = Array.isArray(appointment?.doctor) ? appointment.doctor[0] : appointment?.doctor
  const profile = Array.isArray(doctor?.profile) ? doctor.profile[0] : doctor?.profile

  return (
    <div className="min-h-[100dvh] bg-[#f4f5f8] px-4 py-8 text-slate-950 sm:px-6">
      <main className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200/80 bg-white p-6 text-left shadow-[0_24px_60px_rgba(15,37,95,0.08)] sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <CalendarCheck className="h-6 w-6" />
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Doctor.mx
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
          Tu pago esta en confirmacion
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          En cuanto Stripe confirme el cargo, bloquearemos la cita y enviaremos los detalles al correo del paciente.
        </p>

        {appointment ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Reserva</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-950">Doctor:</span>{' '}
                {profile?.full_name || 'Doctor.mx'}
              </p>
              <p>
                <span className="font-semibold text-slate-950">Servicio:</span>{' '}
                {appointment.reason_for_visit || 'Consulta medica'}
              </p>
              <p>
                <span className="font-semibold text-slate-950">Fecha:</span>{' '}
                {formatDate(appointment.start_ts)} {formatTime(appointment.start_ts)}
              </p>
              <p className="font-mono text-xs text-slate-500">ID {appointment.id}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 text-sm text-slate-700">
          <p className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            Si el banco tarda unos minutos, la confirmacion puede llegar por correo despues de cerrar esta pantalla.
          </p>
          <p className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-700" />
            Conserva el ID de cita para soporte o cambios con el consultorio.
          </p>
        </div>

        <Button asChild className="mt-8 h-12 rounded-2xl bg-slate-950 px-6 text-white hover:bg-slate-900">
          <Link href="/">
            Ir a Doctor.mx
          </Link>
        </Button>
      </main>
    </div>
  )
}
