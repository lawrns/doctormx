'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
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
import { AlertTriangle, CalendarClock, CheckCircle2, CreditCard, LockKeyhole, MapPin, Plus, ShieldCheck, Video } from 'lucide-react'

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
    id: string
    doctorId: string
    patientId: string
    startTs: string
    endTs: string
    status: string
    appointmentType: 'video' | 'in_person' | null
    videoStatus: string | null
    doctorName: string
    doctorPhotoUrl: string | null
    doctorSpecialty: string | null
    licenseNumber: string | null
    city: string | null
    state: string | null
    officeAddress: string | null
    holdExpiresAt: string | null
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

function formatAppointmentDate(dateIso?: string) {
  if (!dateIso) return 'Fecha por confirmar'
  return new Date(dateIso).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatAppointmentTime(dateIso?: string) {
  if (!dateIso) return '--:--'
  return new Date(dateIso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRemainingTime(milliseconds: number) {
  const safeMs = Math.max(0, milliseconds)
  const minutes = Math.floor(safeMs / 60000)
  const seconds = Math.floor((safeMs % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>
}) {
  const { appointmentId } = use(params)
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
  const [now, setNow] = useState(() => Date.now())

  const selectedEstimate = useMemo(() => {
    if (!options) return null
    if (selectedPatientInsuranceId === 'cash') return options.cashEstimate
    return options.estimates.find(
      (estimate) => estimate.patientInsuranceId === selectedPatientInsuranceId
    ) || options.cashEstimate
  }, [options, selectedPatientInsuranceId])

  const holdRemainingMs = useMemo(() => {
    if (!options?.appointment.holdExpiresAt) return null
    return new Date(options.appointment.holdExpiresAt).getTime() - now
  }, [now, options?.appointment.holdExpiresAt])

  const holdExpired = holdRemainingMs !== null && holdRemainingMs <= 0
  const appointmentPayable = options?.appointment.status === 'pending_payment' && !holdExpired
  const appointmentLocation = [
    options?.appointment.officeAddress,
    options?.appointment.city,
    options?.appointment.state,
  ].filter(Boolean).join(', ')

  const loadInsuranceOptions = async () => {
    setLoadingOptions(true)
    setError('')

    try {
      const response = await fetch(
        `/api/insurance/eligibility?appointmentId=${encodeURIComponent(appointmentId)}`
      )
      const data = await response.json()

      if (response.status === 401) {
        const redirectPath = `/checkout/${appointmentId}`
        router.replace(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`)
        return
      }

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
    if (!appointmentPayable) {
      setError('La reserva temporal ya no está disponible para pago. Vuelve a elegir un horario.')
      return
    }

    setLoadingPayment(true)
    setError('')
    setClientSecret('')

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
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
  }, [appointmentId])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (loadingOptions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,hsl(var(--public-bg))_0%,hsl(var(--card))_100%)]">
        <p className="text-sm font-medium text-[hsl(var(--public-muted))]">Revisando cita, cobertura y reserva temporal...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--public-bg))_0%,hsl(var(--card))_100%)]">
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--public-border)/0.72)] bg-[hsl(var(--card)/0.9)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">Doctor.mx</h1>
          <Badge variant="outline" className="hidden sm:inline-flex">
            Checkout seguro
          </Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.65fr)] lg:px-8">
        {appointmentPayable && holdRemainingMs !== null && holdRemainingMs > 0 && (
          <div className="col-span-full mb-2 flex items-center justify-between gap-3 rounded-[var(--public-radius-control)] border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/20">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Tu cita está reservada por{' '}
                <span className="tabular-nums">{formatRemainingTime(holdRemainingMs)}</span>
                {' '}minutos — completa el pago para confirmarla.
              </p>
            </div>
          </div>
        )}
        <section className="space-y-6">
          <div className="border-b border-[hsl(var(--public-border)/0.78)] pb-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-ocean))]">
              Checkout clínico
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
              Confirma tu consulta antes de pagar.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--public-muted))]">
              El pago queda ligado a esta cita, médico, horario y monto. La cobertura aparece como apoyo, no como promesa clínica.
            </p>
          </div>

          {options?.appointment && (
            <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
              <div className="grid gap-5 md:grid-cols-[72px_1fr]">
                <div className="relative h-[72px] w-[72px] overflow-hidden bg-[hsl(var(--surface-tint))]">
                  {options.appointment.doctorPhotoUrl ? (
                    <Image
                      src={options.appointment.doctorPhotoUrl}
                      alt={options.appointment.doctorName}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[hsl(var(--brand-ocean))]">
                      <ShieldCheck className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                        {options.appointment.doctorName}
                      </p>
                      <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                        {options.appointment.doctorSpecialty || 'Especialidad médica'}
                        {options.appointment.licenseNumber ? ` · Cédula ${options.appointment.licenseNumber}` : ' · Cédula no visible'}
                      </p>
                    </div>
                    <Badge variant={appointmentPayable ? 'luxe' : 'destructive'} className="self-start">
                      {appointmentPayable ? 'Reserva activa' : 'Revisar reserva'}
                    </Badge>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-3">
                      <CalendarClock className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                      <p className="mt-2 text-sm font-semibold text-[hsl(var(--public-ink))]">
                        {formatAppointmentDate(options.appointment.startTs)}
                      </p>
                      <p className="text-sm text-[hsl(var(--public-muted))]">
                        {formatAppointmentTime(options.appointment.startTs)}
                      </p>
                    </div>
                    <div className="border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-3">
                      {options.appointment.appointmentType === 'in_person' ? (
                        <MapPin className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                      ) : (
                        <Video className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                      )}
                      <p className="mt-2 text-sm font-semibold text-[hsl(var(--public-ink))]">
                        {options.appointment.appointmentType === 'in_person' ? 'Consulta presencial' : 'Videoconsulta'}
                      </p>
                      <p className="text-sm text-[hsl(var(--public-muted))]">
                        {options.appointment.appointmentType === 'in_person'
                          ? appointmentLocation || 'Dirección por confirmar'
                          : 'Enlace seguro al confirmar'}
                      </p>
                    </div>
                    <div className="border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-3">
                      <LockKeyhole className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                      <p className="mt-2 text-sm font-semibold text-[hsl(var(--public-ink))]">
                        {holdRemainingMs !== null ? formatRemainingTime(holdRemainingMs) : 'Reserva temporal'}
                      </p>
                      <p className="text-sm text-[hsl(var(--public-muted))]">
                        Tiempo para completar el pago.
                      </p>
                    </div>
                  </div>

                  {!appointmentPayable && (
                    <div className="mt-4 flex items-start gap-2 border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <div>
                        <p>Esta reserva ya no está disponible para pago. Vuelve a la agenda para elegir otro horario real.</p>
                        <Button asChild size="sm" variant="secondary" className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10">
                          <Link href={`/book/${options.appointment.doctorId}`}>Elegir nuevo horario</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center border border-border bg-secondary">
                <ShieldCheck className="size-5 text-[hsl(var(--trust))]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  Cobertura opcional
                </h2>
                <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                  Estas aseguradoras están registradas para este doctor. Si no tienes póliza, paga como particular.
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
                    <Badge variant="secondary">
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

          <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  Responsabilidad de pago
                </h2>
                <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                  Elige pago particular o una póliza guardada. El monto final se calcula antes de abrir Stripe.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
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
                className={`w-full rounded-[var(--public-radius-control)] border p-4 text-left transition-colors ${
                  selectedPatientInsuranceId === 'cash'
                    ? 'border-[hsl(var(--trust))] bg-[hsl(var(--trust)/0.5)]'
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
                    className={`w-full rounded-[var(--public-radius-control)] border p-4 text-left transition-colors ${
                      selectedPatientInsuranceId === insurance.id
                        ? 'border-[hsl(var(--trust))] bg-[hsl(var(--trust)/0.5)]'
                        : 'border-border bg-background hover:bg-secondary/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{insurance.insurance.name}</p>
                          {estimate && (
                            <Badge variant="outline">
                              {getStatusLabel(estimate.eligibilityStatus)}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {insurance.policy_number || insurance.member_id || 'Póliza guardada'}
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
              <div className="mt-5 border border-border bg-secondary/40 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="insurance">Aseguradora</Label>
                    <Select value={newInsuranceId} onValueChange={setNewInsuranceId}>
                      <SelectTrigger id="insurance" className="mt-2">
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
                    <Label htmlFor="policy">Póliza</Label>
                    <Input
                      id="policy"
                      value={policyNumber}
                      onChange={(event) => setPolicyNumber(event.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="member">Miembro</Label>
                    <Input
                      id="member"
                      value={memberId}
                      onChange={(event) => setMemberId(event.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  className="mt-4"
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
          <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center border border-border bg-secondary">
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
                <span className="text-muted-foreground">Consulta con {options?.appointment?.doctorName || 'Dr.'}</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(selectedEstimate?.grossAmountCents || 0, options?.appointment.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Cita</span>
                <span className="text-right font-medium text-foreground">
                  {options?.appointment ? `${formatAppointmentTime(options.appointment.startTs)} · ${options.appointment.appointmentType === 'in_person' ? 'Presencial' : 'Video'}` : 'Pendiente'}
                </span>
              </div>
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
              <div className="mt-4 flex items-start gap-2 rounded-[var(--public-radius-control)] border border-border bg-secondary/40 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[hsl(var(--trust))]" />
                <p className="text-sm text-muted-foreground">{selectedEstimate.message}</p>
              </div>
            )}

            <div className="mt-4 border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-3">
              <p className="text-sm font-semibold text-[hsl(var(--public-ink))]">Qué estás pagando</p>
              <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                Reserva confirmada con el médico, instrucciones de acceso y registro de pago. No es una garantía de diagnóstico ni sustituye urgencias.
              </p>
            </div>

            {!clientSecret ? (
              <Button
                type="button"
                size="lg"
                onClick={() => createPaymentIntent()}
                disabled={loadingPayment || !appointmentPayable}
                className="mt-5 w-full"
              >
                {loadingPayment ? 'Preparando pago...' : appointmentPayable ? 'Continuar al pago' : 'Reserva no disponible'}
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
                    <CheckoutForm appointmentId={appointmentId} />
                  </Elements>
                )}
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-[hsl(var(--public-border)/0.5)] pt-4 text-xs text-[hsl(var(--public-muted))]">
              <span className="flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5 text-[hsl(var(--trust))]" />
                Pago seguro SSL
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--trust))]" />
                Cédula verificada
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[hsl(var(--trust))]" />
                Cancelación gratuita hasta 24h antes
              </span>
            </div>
          </div>

          {error && (
            <div className="rounded-[var(--public-radius-control)] border border-destructive/20 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">No pudimos continuar</p>
              <p className="mt-1 text-sm text-destructive">{error}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(options?.appointment ? `/app/appointments/${options.appointment.id}` : '/app/appointments')}
                >
                  Ver cita
                </Button>
                {options?.appointment && !appointmentPayable ? (
                  <Button asChild>
                    <Link href={`/book/${options.appointment.doctorId}`}>Elegir nuevo horario</Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => createPaymentIntent()}
                    disabled={loadingPayment || !appointmentPayable}
                  >
                    Reintentar
                  </Button>
                )}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
