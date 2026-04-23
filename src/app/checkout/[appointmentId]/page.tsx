'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import CheckoutForm from './CheckoutForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, CreditCard, Plus, ShieldCheck } from 'lucide-react'

type InsuranceProvider = {
  id: string
  name: string
  type: 'public' | 'private' | 'social_security'
  requires_folio: boolean
}

type PatientInsurance = {
  id: string
  insurance_id: string
  policy_number: string | null
  member_id: string | null
  insurance: InsuranceProvider
}

type InsuranceEstimate = {
  patientInsuranceId: string | null
  providerName: string | null
  acceptedByDoctor: boolean
  eligibilityStatus: 'cash' | 'verified' | 'estimated' | 'requires_review' | 'not_supported'
  grossAmountCents: number
  patientResponsibilityCents: number
  reimbursementAmountCents: number
  requiresFolio: boolean
  message: string
}

type InsuranceOptions = {
  appointment: {
    grossAmountCents: number
    currency: string
  }
  acceptedInsurances: InsuranceProvider[]
  patientInsurances: PatientInsurance[]
  estimates: InsuranceEstimate[]
  cashEstimate: InsuranceEstimate
}

function formatCurrency(cents: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
  }).format(cents / 100)
}

function getStatusLabel(status: InsuranceEstimate['eligibilityStatus']) {
  const labels: Record<InsuranceEstimate['eligibilityStatus'], string> = {
    cash: 'Particular',
    verified: 'Verificado',
    estimated: 'Estimado',
    requires_review: 'Requiere folio',
    not_supported: 'No compatible',
  }

  return labels[status]
}

export default function CheckoutPage({
  params,
}: {
  params: { appointmentId: string }
}) {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState('')
  const [stripePromise, setStripePromise] = useState<Promise<import('@stripe/stripe-js').Stripe | null> | null>(null)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [error, setError] = useState('')
  const [options, setOptions] = useState<InsuranceOptions | null>(null)
  const [selectedPatientInsuranceId, setSelectedPatientInsuranceId] = useState('cash')
  const [showAddInsurance, setShowAddInsurance] = useState(false)
  const [newInsuranceId, setNewInsuranceId] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [memberId, setMemberId] = useState('')
  const [savingInsurance, setSavingInsurance] = useState(false)

  const selectedEstimate = useMemo(() => {
    if (!options) return null
    if (selectedPatientInsuranceId === 'cash') return options.cashEstimate
    return options.estimates.find(
      (estimate) => estimate.patientInsuranceId === selectedPatientInsuranceId
    ) || options.cashEstimate
  }, [options, selectedPatientInsuranceId])

  const loadInsuranceOptions = async () => {
    setLoadingOptions(true)
    setError('')

    try {
      const response = await fetch(
        `/api/insurance/eligibility?appointmentId=${encodeURIComponent(params.appointmentId)}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No fue posible consultar tus seguros.')
      }

      setOptions(data)
      const firstCompatible = data.estimates?.find(
        (estimate: InsuranceEstimate) => estimate.acceptedByDoctor
      )
      setSelectedPatientInsuranceId(firstCompatible?.patientInsuranceId || 'cash')
      setNewInsuranceId(data.acceptedInsurances?.[0]?.id || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible consultar tus seguros.')
    } finally {
      setLoadingOptions(false)
    }
  }

  const createPaymentIntent = async (patientInsuranceId = selectedPatientInsuranceId) => {
    setLoadingPayment(true)
    setError('')
    setClientSecret('')

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: params.appointmentId,
          patientInsuranceId: patientInsuranceId === 'cash' ? null : patientInsuranceId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data?.clientSecret) {
        throw new Error(data?.error || 'No fue posible iniciar el pago en este momento.')
      }

      setClientSecret(data.clientSecret)
      setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible iniciar el pago en este momento.')
    } finally {
      setLoadingPayment(false)
    }
  }

  const saveInsurance = async () => {
    if (!newInsuranceId) return

    setSavingInsurance(true)
    setError('')

    try {
      const response = await fetch('/api/insurance/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          insuranceId: newInsuranceId,
          policyNumber,
          memberId,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No fue posible guardar el seguro.')
      }

      setPolicyNumber('')
      setMemberId('')
      setShowAddInsurance(false)
      await loadInsuranceOptions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible guardar el seguro.')
    } finally {
      setSavingInsurance(false)
    }
  }

  useEffect(() => {
    loadInsuranceOptions()
  }, [params.appointmentId])

  if (loadingOptions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Revisando cobertura...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Doctor.mx</h1>
          <Badge variant="outline" className="hidden rounded-lg sm:inline-flex">
            Checkout seguro
          </Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.65fr)] lg:px-8">
        <section className="space-y-6">
          <div className="border-b border-border pb-5">
            <p className="text-sm font-medium text-vital">Seguro y pago</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
              Confirma como quieres cubrir tu consulta.
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Primero revisamos si tu aseguradora esta aceptada por el doctor. Despues generamos el pago con el monto correspondiente.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-dx-1">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                <ShieldCheck className="size-5 text-vital" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  Cobertura aceptada
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Estas aseguradoras estan registradas para este doctor.
                </p>
              </div>
            </div>

            <div className="mt-5 divide-y divide-border">
              {options?.acceptedInsurances.length ? (
                options.acceptedInsurances.map((insurance) => (
                  <div key={insurance.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-foreground">{insurance.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {insurance.requires_folio ? 'Requiere folio/autorizacion' : 'Elegibilidad estimada en checkout'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-lg">
                      {insurance.type === 'private' ? 'Privado' : 'Publico'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="py-3 text-sm text-muted-foreground">
                  Este doctor aun no tiene aseguradoras configuradas. Puedes pagar como particular.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-dx-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  Tu forma de pago
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Elige pago particular o una poliza guardada.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-lg"
                onClick={() => setShowAddInsurance((value) => !value)}
              >
                <Plus className="mr-2 size-4" />
                Seguro
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPatientInsuranceId('cash')
                  setClientSecret('')
                }}
                className={`w-full rounded-xl border p-4 text-left transition-colors ${
                  selectedPatientInsuranceId === 'cash'
                    ? 'border-vital bg-vital/5'
                    : 'border-border bg-background hover:bg-secondary/60'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">Pago particular</p>
                    <p className="text-sm text-muted-foreground">Sin reclamo de seguro.</p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {formatCurrency(options?.cashEstimate.grossAmountCents || 0, options?.appointment.currency)}
                  </p>
                </div>
              </button>

              {options?.patientInsurances.map((insurance) => {
                const estimate = options.estimates.find(
                  (item) => item.patientInsuranceId === insurance.id
                )

                return (
                  <button
                    key={insurance.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatientInsuranceId(insurance.id)
                      setClientSecret('')
                    }}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      selectedPatientInsuranceId === insurance.id
                        ? 'border-vital bg-vital/5'
                        : 'border-border bg-background hover:bg-secondary/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{insurance.insurance.name}</p>
                          {estimate && (
                            <Badge variant="outline" className="rounded-lg">
                              {getStatusLabel(estimate.eligibilityStatus)}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {insurance.policy_number || insurance.member_id || 'Poliza guardada'}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(
                          estimate?.patientResponsibilityCents || options.cashEstimate.grossAmountCents,
                          options.appointment.currency
                        )}
                      </p>
                    </div>
                    {estimate && (
                      <p className="mt-3 text-sm text-muted-foreground">{estimate.message}</p>
                    )}
                  </button>
                )
              })}
            </div>

            {showAddInsurance && (
              <div className="mt-5 rounded-xl border border-border bg-secondary/40 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="insurance">Aseguradora</Label>
                    <Select value={newInsuranceId} onValueChange={setNewInsuranceId}>
                      <SelectTrigger id="insurance" className="mt-2 rounded-lg">
                        <SelectValue placeholder="Selecciona aseguradora" />
                      </SelectTrigger>
                      <SelectContent>
                        {options?.acceptedInsurances.map((insurance) => (
                          <SelectItem key={insurance.id} value={insurance.id}>
                            {insurance.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="policy">Poliza</Label>
                    <Input
                      id="policy"
                      value={policyNumber}
                      onChange={(event) => setPolicyNumber(event.target.value)}
                      className="mt-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member">Miembro</Label>
                    <Input
                      id="member"
                      value={memberId}
                      onChange={(event) => setMemberId(event.target.value)}
                      className="mt-2 rounded-lg"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  className="mt-4 rounded-lg"
                  onClick={saveInsurance}
                  disabled={savingInsurance || !newInsuranceId}
                >
                  {savingInsurance ? 'Guardando...' : 'Guardar seguro'}
                </Button>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-dx-1">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary">
                <CreditCard className="size-5 text-foreground" />
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  Resumen
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Monto antes de confirmar el pago.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-y border-border py-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Consulta</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(selectedEstimate?.grossAmountCents || 0, options?.appointment.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Cobertura estimada</span>
                <span className="font-medium text-foreground">
                  -{formatCurrency(selectedEstimate?.reimbursementAmountCents || 0, options?.appointment.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <span className="font-medium text-foreground">Pagas hoy</span>
                <span className="font-display text-2xl font-semibold text-foreground">
                  {formatCurrency(selectedEstimate?.patientResponsibilityCents || 0, options?.appointment.currency)}
                </span>
              </div>
            </div>

            {selectedEstimate && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-secondary/40 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-vital" />
                <p className="text-sm text-muted-foreground">{selectedEstimate.message}</p>
              </div>
            )}

            {!clientSecret ? (
              <Button
                type="button"
                size="lg"
                onClick={() => createPaymentIntent()}
                disabled={loadingPayment}
                className="mt-5 w-full rounded-lg"
              >
                {loadingPayment ? 'Preparando pago...' : 'Continuar al pago'}
              </Button>
            ) : (
              <div className="mt-5">
                {stripePromise && (
                  <Elements
                    key={clientSecret}
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: { theme: 'stripe' },
                    }}
                  >
                    <CheckoutForm appointmentId={params.appointmentId} />
                  </Elements>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">No pudimos continuar</p>
              <p className="mt-1 text-sm text-destructive">{error}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg"
                  onClick={() => router.push('/app/appointments')}
                >
                  Mis citas
                </Button>
                <Button
                  type="button"
                  className="rounded-lg"
                  onClick={() => createPaymentIntent()}
                  disabled={loadingPayment}
                >
                  Reintentar
                </Button>
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
