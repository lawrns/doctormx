import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Video,
} from 'lucide-react'
import { requireRole } from '@/lib/auth'
import { getPatientAppointmentContext } from '@/lib/appointment-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatDate(dateIso: string) {
  return new Date(dateIso).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(dateIso: string) {
  return new Date(dateIso).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(cents: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    pending_payment: 'Pago pendiente',
    confirmed: 'Confirmada',
    completed: 'Completada',
    cancelled: 'Cancelada',
    refunded: 'Reembolsada',
    no_show: 'No asistió',
  }

  return labels[status] || status
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'info' {
  if (status === 'confirmed') return 'default'
  if (status === 'pending_payment') return 'warning'
  if (['cancelled', 'no_show'].includes(status)) return 'destructive'
  if (status === 'completed') return 'info'
  return 'secondary'
}

function minutesUntil(dateIso: string | null | undefined) {
  if (!dateIso) return null
  return Math.max(0, Math.ceil((new Date(dateIso).getTime() - Date.now()) / 60000))
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user } = await requireRole('patient')
  const appointment = await getPatientAppointmentContext(id, user.id)

  if (!appointment) notFound()

  const isVideo = appointment.appointmentType !== 'in_person'
  const appointmentLocation = [
    appointment.doctor.officeAddress,
    appointment.doctor.city,
    appointment.doctor.state,
  ].filter(Boolean).join(', ')
  const holdMinutes = minutesUntil(appointment.hold?.expiresAt)
  const isExpiredPending = appointment.status === 'cancelled' && appointment.cancellationReason === 'Payment window expired'
  const canPay = appointment.status === 'pending_payment' && !appointment.hold?.expired
  const amountCents = appointment.payment?.amountCents || appointment.doctor.priceCents
  const currency = appointment.payment?.currency || appointment.doctor.currency

  return (
    <main className="p-4 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-ocean))]">
              Detalle de cita
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))] sm:text-3xl">
              Tu consulta médica
            </h1>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/appointments">Volver a mis citas</Link>
          </Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="space-y-5">
            <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
              <div className="grid gap-5 md:grid-cols-[88px_1fr]">
                <div className="relative h-[88px] w-[88px] overflow-hidden rounded-[10px] bg-[hsl(var(--surface-tint))]">
                  {appointment.doctor.photoUrl ? (
                    <Image
                      src={appointment.doctor.photoUrl}
                      alt={appointment.doctor.name}
                      fill
                      sizes="88px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[hsl(var(--brand-ocean))]">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                        {appointment.doctor.name}
                      </h2>
                      <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                        {appointment.doctor.specialty || 'Especialidad médica'}
                        {appointment.doctor.licenseNumber ? ` · Cédula ${appointment.doctor.licenseNumber}` : ' · Cédula no visible'}
                      </p>
                    </div>
                    <Badge variant={statusVariant(appointment.status)}>{statusLabel(appointment.status)}</Badge>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <InfoTile icon={<CalendarCheck className="h-4 w-4" />} label="Fecha" value={formatDate(appointment.startTs)} />
                    <InfoTile icon={<Clock className="h-4 w-4" />} label="Hora" value={formatTime(appointment.startTs)} />
                    <InfoTile
                      icon={isVideo ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                      label="Modalidad"
                      value={isVideo ? 'Videoconsulta' : 'Presencial'}
                    />
                  </div>
                </div>
              </div>
            </div>

            {isExpiredPending && (
              <div className="flex items-start gap-3 border border-[hsl(var(--brand-gold)/0.3)] bg-[hsl(var(--brand-gold)/0.1)] p-4 text-sm text-[hsl(var(--public-ink))]">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--brand-gold))]" />
                <div>
                  <p className="font-semibold">La ventana de pago venció.</p>
                  <p className="mt-1 text-[hsl(var(--public-muted))]">
                    El horario se liberó para evitar dobles reservas. Elige un nuevo horario real con este médico.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              <TimelineStep title="Ahora" body={appointment.status === 'pending_payment' ? 'Completa el pago para confirmar el horario.' : 'La cita está registrada en tu panel.'} />
              <TimelineStep title="Antes de la consulta" body={isVideo ? 'El acceso a video se habilita cerca de la hora.' : 'Revisa la dirección y llega con anticipación.'} />
              <TimelineStep title="Durante la consulta" body="El médico revisa tu caso; Dr. Simeon no sustituye criterio clínico." />
            </div>

            <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
              <h2 className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                Instrucciones
              </h2>
              {isVideo ? (
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                  Usa una conexión privada y estable. La sala se abre desde esta página cuando el horario esté disponible.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                  {appointmentLocation || 'La dirección del consultorio está pendiente de confirmación.'}
                </p>
              )}
              {appointment.reasonForVisit && (
                <div className="mt-4 border-t border-[hsl(var(--public-border)/0.78)] pt-4">
                  <p className="text-sm font-semibold text-[hsl(var(--public-ink))]">Motivo registrado</p>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">{appointment.reasonForVisit}</p>
                </div>
              )}
            </div>

            {appointment.clinicalSummary?.patientSummary ? (
              <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--brand-ocean))]" />
                  <div>
                    <h2 className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                      Resumen de la consulta
                    </h2>
                    <p className="mt-1 text-xs font-medium text-[hsl(var(--public-muted))]">
                      Revisado por el médico
                      {appointment.clinicalSummary.sentToPatientAt
                        ? ` · enviado ${formatDate(appointment.clinicalSummary.sentToPatientAt)}`
                        : ''}
                    </p>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[hsl(var(--public-muted))]">
                  {appointment.clinicalSummary.patientSummary}
                </p>
              </div>
            ) : null}
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
              <p className="font-display text-lg font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                Siguiente acción
              </p>
              <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                El panel de paciente es la fuente principal para estado, acceso e instrucciones.
              </p>

              <div className="mt-5 grid gap-2">
                {canPay && (
                  <Button asChild>
                    <Link href={`/checkout/${appointment.id}`}>Completar pago</Link>
                  </Button>
                )}
                {appointment.canJoinVideo && (
                  <Button asChild>
                    <Link href={`/app/appointments/${appointment.id}/video`}>Entrar a videoconsulta</Link>
                  </Button>
                )}
                {isExpiredPending && (
                  <Button asChild>
                    <Link href={`/book/${appointment.doctorId}`}>Elegir nuevo horario</Link>
                  </Button>
                )}
                {['completed', 'cancelled', 'refunded', 'no_show'].includes(appointment.status) && !isExpiredPending && (
                  <Button asChild>
                    <Link href={`/book/${appointment.doctorId}`}>Agendar seguimiento</Link>
                  </Button>
                )}
                <Button asChild variant="outline">
                  <Link href="/contact">Contactar soporte</Link>
                </Button>
              </div>
            </div>

            <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
              <div className="flex items-start gap-3">
                <ReceiptText className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--brand-ocean))]" />
                <div>
                  <p className="font-semibold text-[hsl(var(--public-ink))]">Pago y recibo</p>
                  <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                    {appointment.payment?.status
                      ? `Estado: ${appointment.payment.status}`
                      : appointment.status === 'pending_payment'
                        ? 'Pago pendiente'
                        : 'Recibo no disponible todavía'}
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-[hsl(var(--public-ink))]">
                    {formatCurrency(amountCents, currency)}
                  </p>
                  {holdMinutes !== null && appointment.status === 'pending_payment' && (
                    <p className="mt-1 text-xs text-[hsl(var(--public-muted))]">
                      Reserva temporal: {holdMinutes} min restantes.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-5 shadow-[var(--public-shadow-soft)]">
              <p className="flex items-start gap-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                <FileText className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--brand-ocean))]" />
                Puedes cancelar citas futuras elegibles desde Mis citas. Las políticas finales dependen del médico y del estado del pago.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-3">
      <div className="text-[hsl(var(--brand-ocean))]">{icon}</div>
      <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[hsl(var(--public-muted))]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-5 text-[hsl(var(--public-ink))]">{value}</p>
    </div>
  )
}

function TimelineStep({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-[hsl(var(--public-border)/0.78)] bg-card p-4 shadow-[var(--public-shadow-soft)]">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
        <p className="font-semibold text-[hsl(var(--public-ink))]">{title}</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-[hsl(var(--public-muted))]">{body}</p>
    </div>
  )
}
