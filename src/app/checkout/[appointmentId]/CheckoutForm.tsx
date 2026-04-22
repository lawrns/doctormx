'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'

export default function CheckoutForm({
  appointmentId,
}: {
  appointmentId: string
}) {
  const stripe = useStripe()
  const elements = useElements()

  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?appointmentId=${appointmentId}`,
      },
    })

    if (error) {
      setMessage(error.message || 'Error al procesar el pago')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <div className="rounded-xl border border-border bg-secondary/50 p-4">
        <p className="text-sm font-semibold text-foreground">Reserva temporal activa</p>
        <p className="mt-1 text-sm text-muted-foreground">
          El pago está ligado a esta cita. Si tu banco rechaza el cargo o abandonas el checkout, la cita puede liberarse para evitar dobles reservas.
        </p>
      </div>

      <div className="sticky bottom-3 rounded-xl border border-border bg-card p-3 shadow-[0_12px_32px_rgba(15,37,95,0.12)] sm:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Siguiente paso</p>
        <p className="mt-1 text-sm font-medium text-foreground">Confirma el pago para bloquear tu horario con el doctor.</p>
      </div>

      {message && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
          <p className="text-sm font-medium text-destructive">No se pudo confirmar el pago.</p>
          <p className="mt-1 text-sm text-destructive">{message}</p>
          <div className="mt-3 text-sm">
            <Link href="/app/appointments" className="font-medium text-destructive underline underline-offset-2">
              Revisar el estado de mi cita
            </Link>
          </div>
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={isLoading || !stripe || !elements}
        className="w-full"
      >
        {isLoading ? 'Procesando...' : 'Pagar ahora'}
      </Button>
    </form>
  )
}
