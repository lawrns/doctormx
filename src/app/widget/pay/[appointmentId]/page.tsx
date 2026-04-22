import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { validateWidgetBookingToken } from '@/lib/widget'
import { WidgetPaymentForm } from './WidgetPaymentForm'

export const dynamic = 'force-dynamic'

function formatCurrency(cents: number, currency: string) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

function PaymentUnavailable({ message }: { message: string }) {
  return (
    <div className="min-h-[100dvh] bg-[#f4f5f8] px-4 py-10 text-slate-950">
      <main className="mx-auto max-w-lg rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_24px_60px_rgba(15,37,95,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Doctor.mx</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
          No pudimos abrir el pago
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">{message}</p>
      </main>
    </div>
  )
}

export default async function WidgetPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ appointmentId: string }>
  searchParams: Promise<{ token?: string }>
}) {
  const { appointmentId } = await params
  const search = await searchParams
  const token = search.token || ''

  if (!token) {
    return <PaymentUnavailable message="La liga de pago no incluye una referencia valida." />
  }

  const intent = await validateWidgetBookingToken({ appointmentId, token })
  if (!intent) {
    return <PaymentUnavailable message="Esta liga de pago vencio o no corresponde a la reserva." />
  }

  if (new Date(intent.expires_at) < new Date()) {
    return <PaymentUnavailable message="La reserva temporal vencio. Elige un nuevo horario desde el widget del doctor." />
  }

  const supabase = createServiceClient()
  const [{ data: appointment }, { data: payment }] = await Promise.all([
    supabase
      .from('appointments')
      .select(`
        id,
        status,
        doctor:doctors (
          id,
          currency,
          profile:profiles!doctors_id_fkey (
            full_name
          )
        )
      `)
      .eq('id', appointmentId)
      .maybeSingle(),
    supabase
      .from('payments')
      .select('provider_ref, amount_cents, currency, status')
      .eq('appointment_id', appointmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (!appointment || !payment) {
    return <PaymentUnavailable message="No encontramos los datos de la reserva." />
  }

  if (payment.status === 'paid' || appointment.status === 'confirmed') {
    redirect(`/widget/success?appointmentId=${appointmentId}&token=${encodeURIComponent(token)}`)
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(payment.provider_ref)
  if (!paymentIntent.client_secret) {
    return <PaymentUnavailable message="El pago ya no se puede reabrir. Contacta al consultorio para revisar tu cita." />
  }

  const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor
  const profile = Array.isArray(doctor?.profile) ? doctor.profile[0] : doctor?.profile
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    return <PaymentUnavailable message="La configuracion de pagos no esta disponible." />
  }

  return (
    <WidgetPaymentForm
      appointmentId={appointmentId}
      token={token}
      clientSecret={paymentIntent.client_secret}
      publishableKey={publishableKey}
      amountLabel={formatCurrency(payment.amount_cents, payment.currency || doctor?.currency || 'MXN')}
      doctorName={profile?.full_name || 'tu doctor'}
    />
  )
}
