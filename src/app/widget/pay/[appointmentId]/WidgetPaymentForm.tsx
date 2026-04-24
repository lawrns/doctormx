'use client'

import { FormEvent, useMemo, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { ArrowRight, CreditCard, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

type WidgetPaymentFormProps = {
  appointmentId: string
  token: string
  clientSecret: string
  publishableKey: string
  amountLabel: string
  doctorName: string
}

function PaymentFields({
  appointmentId,
  token,
  amountLabel,
}: Pick<WidgetPaymentFormProps, 'appointmentId' | 'token' | 'amountLabel'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) return

    setMessage('')
    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/widget/success?appointmentId=${appointmentId}&token=${encodeURIComponent(token)}`,
      },
    })

    if (error) {
      setMessage(error.message || 'No pudimos procesar el pago.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />

      <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div>
            <p className="font-semibold text-slate-950">Pago protegido por Stripe</p>
            <p className="mt-1 text-slate-600">
              Tu cargo por {amountLabel} confirma el horario seleccionado.
            </p>
          </div>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {message}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={isLoading || !stripe || !elements}
        className="h-12 w-full rounded-2xl bg-slate-950 text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] transition-transform active:scale-[0.98] hover:bg-slate-900"
      >
        {isLoading ? 'Procesando pago...' : 'Pagar y confirmar cita'}
        {!isLoading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
      </Button>
    </form>
  )
}

export function WidgetPaymentForm(props: WidgetPaymentFormProps) {
  const stripePromise = useMemo(() => loadStripe(props.publishableKey), [props.publishableKey])

  return (
    <div className="min-h-[100dvh] bg-[#f4f5f8] px-4 py-6 text-slate-950 sm:px-6">
      <main className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:gap-8">
        <section className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_rgba(15,37,95,0.08)] lg:mt-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <CreditCard className="h-5 w-5" />
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Doctor.mx
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-slate-950">
            Confirma tu cita con {props.doctorName}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            El horario se mantiene reservado mientras completas este pago.
          </p>
          <div className="mt-8 border-t border-slate-200 pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Total</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-slate-950">{props.amountLabel}</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white p-4 shadow-[0_24px_60px_rgba(15,37,95,0.08)] sm:p-6 lg:p-8">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: props.clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  borderRadius: '8px',
                  colorPrimary: '#0d72d6',
                  colorText: '#0f172a',
                  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                },
              },
            }}
          >
            <PaymentFields
              appointmentId={props.appointmentId}
              token={props.token}
              amountLabel={props.amountLabel}
            />
          </Elements>
        </section>
      </main>
    </div>
  )
}
