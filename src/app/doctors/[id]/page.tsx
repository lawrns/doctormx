import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowLeft, BadgeCheck, CalendarDays, CheckCircle2, Clock, FileText, MapPin, ShieldCheck, Stethoscope, Video } from 'lucide-react'
import { DoctorReviews } from '@/components/DoctorReviews'
import { VerificationBadge } from '@/components/TrustSignals'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getAvailableSlots } from '@/lib/availability'
import { getDoctorProfile } from '@/lib/discovery'
import { getDoctorAnsweredQuestions } from '@/lib/expert-questions'
import { getDoctorReviews, getDoctorRatingSummary } from '@/lib/reviews'
import { formatCurrency, formatDoctorName, formatLanguageName } from '@/lib/utils'

function formatVerifiedDate(date: Date | null) {
  if (!date) return 'Sin fecha pública'
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--public-radius-control)] border border-[hsl(var(--public-border)/0.82)] bg-[hsl(var(--public-surface-soft))] px-4 py-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-[hsl(var(--public-ink))]">{value}</p>
    </div>
  )
}

type NextAvailability = {
  date: string
  time: string
}

async function findNextAvailability(doctorId: string): Promise<NextAvailability | null> {
  const today = new Date()

  for (let offset = 0; offset < 21; offset += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)
    const dateStr = date.toISOString().split('T')[0]

    try {
      const slots = await getAvailableSlots(doctorId, dateStr)
      if (slots.length > 0) {
        return { date: dateStr, time: slots[0] }
      }
    } catch {
      return null
    }
  }

  return null
}

function formatAvailabilityDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const doctor = await getDoctorProfile(id)

  if (!doctor) {
    notFound()
  }

  const [reviews, ratingSummary, nextAvailability, answeredQuestions] = await Promise.all([
    getDoctorReviews(id, { limit: 10 }),
    getDoctorRatingSummary(id).then((result) => result || null),
    findNextAvailability(id),
    getDoctorAnsweredQuestions(id, 4),
  ])

  const totalConsultations = ratingSummary?.rating_count || 0
  const averageRating = doctor.rating_avg || ratingSummary?.rating_avg || 0
  const doctorPhotoUrl = doctor.profile?.photo_url || null
  const verificationDate = doctor.verification?.verified_at ? new Date(doctor.verification.verified_at) : null
  const consultationModes = [
    doctor.offers_video || doctor.video_enabled ? 'Videoconsulta' : null,
    doctor.offers_in_person ? 'Presencial' : null,
  ].filter(Boolean) as string[]
  const headlineLocation = [doctor.city, doctor.state].filter(Boolean).join(', ') || 'México'
  const preferredAppointmentType = doctor.offers_video || doctor.video_enabled ? 'video' : 'in_person'
  const bookingHref = nextAvailability
    ? `/book/${doctor.id}?date=${nextAvailability.date}&time=${nextAvailability.time}&appointmentType=${preferredAppointmentType}`
    : `/book/${doctor.id}?appointmentType=${preferredAppointmentType}`

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--public-bg))_0%,hsl(var(--card))_100%)]">
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--public-border)/0.72)] bg-[hsl(var(--card)/0.84)] backdrop-blur-xl">
        <div className="editorial-shell flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/doctors" className="inline-flex items-center gap-1.5 text-[hsl(var(--public-muted))] transition-colors hover:text-[hsl(var(--public-ink))]">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden font-medium sm:inline">Volver</span>
            </Link>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--brand-ocean)),hsl(var(--brand-sky)))] shadow-[var(--public-shadow-soft)]">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-[hsl(var(--public-ink))]">Doctor.mx</span>
            </Link>
          </div>
          <Badge variant="luxe" className="hidden sm:inline-flex">
            Perfil verificado
          </Badge>
        </div>
      </header>

      <main className="editorial-shell py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-6">
            <Card className="surface-panel-strong overflow-hidden p-0">
              <div className="grid gap-0 lg:grid-cols-[auto_1fr]">
                <div className="relative min-h-[18rem] bg-[linear-gradient(145deg,hsl(var(--surface-soft)),hsl(var(--surface-tint)))] lg:min-h-full lg:w-[18rem]">
                  <div className="absolute inset-0">
                    {doctorPhotoUrl ? (
                      <Image
                        src={doctorPhotoUrl}
                        alt={doctor.profile?.full_name || 'Doctor'}
                        fill
                        sizes="(max-width: 1024px) 100vw, 320px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full min-h-[18rem] items-center justify-center">
                        <Stethoscope className="h-16 w-16 text-[hsl(var(--brand-ocean))]" />
                      </div>
                    )}
                  </div>
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge variant="luxe" className="bg-card/90 backdrop-blur-sm">
                      {doctor.verification?.sep_verified ? 'SEP verificado' : 'Perfil aprobado'}
                    </Badge>
                    {doctor.offers_video || doctor.video_enabled ? (
                      <Badge variant="outline" className="bg-card/90 backdrop-blur-sm normal-case tracking-normal">
                        Videoconsulta
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col gap-5">
                    <div>
                      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--public-muted))]">
                        Perfil médico
                      </p>
                      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[hsl(var(--public-ink))] sm:text-4xl">
                        {formatDoctorName(doctor.profile?.full_name)}
                      </h1>
                      <p className="mt-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                        {doctor.specialties[0]?.name || 'Especialidad médica'}
                        {' · '}
                        {headlineLocation}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {doctor.verification?.cedula && verificationDate ? (
                        <VerificationBadge
                          doctorId={doctor.id}
                          cedula={doctor.verification.cedula}
                          verifiedDate={verificationDate}
                          showDetails={true}
                        />
                      ) : doctor.verification?.cedula ? (
                        <Badge variant="outline" className="normal-case tracking-normal">
                          Cédula {doctor.verification.cedula}
                        </Badge>
                      ) : null}
                      {doctor.verification?.institution ? (
                        <Badge variant="outline" className="normal-case tracking-normal">
                          {doctor.verification.institution}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <InfoTile label="Cédula" value={doctor.verification?.cedula || doctor.license_number || 'No visible'} />
                      <InfoTile label="Verificada" value={formatVerifiedDate(verificationDate)} />
                      <InfoTile label="Modalidad" value={consultationModes.join(' · ') || 'Por confirmar'} />
                      <InfoTile label="Experiencia" value={doctor.years_experience ? `${doctor.years_experience} años` : 'No publicada'} />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--public-muted))]">
                      {doctor.years_experience ? (
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                          {doctor.years_experience} años de experiencia
                        </span>
                      ) : null}
                      {doctor.rating_avg > 0 ? (
                        <span className="inline-flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                          {doctor.rating_avg.toFixed(1)} ({doctor.rating_count} reseñas)
                        </span>
                      ) : null}
                      {doctor.city ? (
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                          {doctor.city}
                          {doctor.state ? `, ${doctor.state}` : ''}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {doctor.bio ? (
              <Card className="surface-panel p-6 sm:p-8">
                <h2 className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  Sobre el doctor
                </h2>
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[hsl(var(--public-muted))]">
                  {doctor.bio}
                </p>
              </Card>
            ) : null}

            {doctor.languages.length > 0 ? (
              <Card className="surface-panel p-6 sm:p-8">
                <h2 className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  Idiomas
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {doctor.languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="normal-case tracking-normal">
                      {formatLanguageName(lang)}
                    </Badge>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card className="surface-panel p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                    Qué incluye la consulta
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                    La ficha debe ayudar a decidir, no solo a inspirar confianza.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[var(--public-radius-control)] border border-[hsl(var(--public-border)/0.82)] bg-[hsl(var(--public-surface-soft))] p-4 sm:row-span-2">
                  <p className="font-semibold text-[hsl(var(--public-ink))]">Evaluación médica</p>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">Contexto, síntomas y orientación clara.</p>
                </div>
                <div className="rounded-[var(--public-radius-control)] border border-[hsl(var(--public-border)/0.82)] bg-[hsl(var(--public-surface-soft))] p-4">
                  <p className="font-semibold text-[hsl(var(--public-ink))]">Continuidad</p>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">Notas y seguimiento donde aplique.</p>
                </div>
                <div className="rounded-[var(--public-radius-control)] border border-[hsl(var(--public-border)/0.82)] bg-[hsl(var(--public-surface-soft))] p-4">
                  <p className="font-semibold text-[hsl(var(--public-ink))]">Modalidad</p>
                  <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                    {consultationModes.join(' · ') || 'Por confirmar'}
                  </p>
                </div>
              </div>
            </Card>

            <div className="animate-fade-in-up">
              <DoctorReviews reviews={reviews} totalReviews={totalConsultations} averageRating={averageRating} />
            </div>

            {answeredQuestions.length > 0 ? (
              <Card className="surface-panel p-6 sm:p-8">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ocean))]">
                      Preguntas respondidas
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                      Respuestas del doctor
                    </h2>
                  </div>
                  <Link href="/preguntas-respuestas" className="text-sm font-semibold text-[hsl(var(--brand-ocean))] hover:underline">
                    Ver mas preguntas
                  </Link>
                </div>
                <div className="mt-5 divide-y divide-[hsl(var(--public-border)/0.8)]">
                  {answeredQuestions.map((question) => {
                    const answer = question.answers?.find((item) => item.doctor_id === doctor.id) || question.answers?.[0]
                    return (
                      <Link
                        key={question.id}
                        href={`/preguntas-respuestas/${question.id}`}
                        className="block py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {question.specialty ? (
                            <Badge variant="outline" className="normal-case tracking-normal">
                              {question.specialty.name}
                            </Badge>
                          ) : null}
                          <span className="text-xs font-medium text-[hsl(var(--public-muted))]">
                            Orientacion publica
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-semibold leading-6 text-[hsl(var(--public-ink))]">
                          {question.question}
                        </p>
                        {answer ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                            {answer.answer}
                          </p>
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              </Card>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="surface-panel-strong p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                    Consulta desde
                  </p>
                  <p className="mt-1 text-4xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                    {formatCurrency(doctor.price_cents, doctor.currency)}
                  </p>
                </div>
                <Badge variant="luxe" className="self-start">
                  Reserva guiada
                </Badge>
              </div>

              <div className="mt-5 border border-[hsl(var(--public-border)/0.78)] bg-[hsl(var(--public-surface-soft))] p-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--brand-ocean))]">
                  Próxima disponibilidad real
                </p>
                {nextAvailability ? (
                  <>
                    <p className="mt-2 text-lg font-semibold text-[hsl(var(--public-ink))]">
                      {formatAvailabilityDate(nextAvailability.date)} · {nextAvailability.time}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[hsl(var(--public-muted))]">
                      {preferredAppointmentType === 'video' ? 'Videoconsulta' : 'Presencial'} disponible según la agenda actual.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-[hsl(var(--public-muted))]">
                    No hay horarios publicados en los próximos días. Puedes abrir la agenda completa.
                  </p>
                )}
              </div>

              <Button asChild variant="hero" size="lg" className="mt-5 w-full">
                <Link href={bookingHref}>Agendar consulta</Link>
              </Button>

              <div className="mt-5 space-y-3 border-t border-[hsl(var(--public-border)/0.8)] pt-5">
                <div className="flex items-center gap-3 text-sm text-[hsl(var(--public-muted))]">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                  <span>La verificación se muestra solo cuando existe.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[hsl(var(--public-muted))]">
                  <Video className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                  <span>Videoconsulta y presencial cuando el doctor lo ofrece.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[hsl(var(--public-muted))]">
                  <BadgeCheck className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                  <span>El pago confirma la reserva y desbloquea la siguiente etapa.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[hsl(var(--public-muted))]">
                  <FileText className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                  <span>Cancelación y reembolso se revisan antes del cargo final.</span>
                </div>
              </div>
            </Card>

            <Card className="surface-panel p-6">
              <h3 className="font-display text-lg font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                Qué pasa después
              </h3>
              <ol className="mt-4 space-y-3 text-sm leading-6 text-[hsl(var(--public-muted))]">
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--surface-tint))] font-semibold text-[hsl(var(--brand-ocean))]">
                    1
                  </span>
                  <span>Seleccionas horario y modalidad reales.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--surface-tint))] font-semibold text-[hsl(var(--brand-ocean))]">
                    2
                  </span>
                  <span>Confirmas la reserva y completas el pago.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--surface-tint))] font-semibold text-[hsl(var(--brand-ocean))]">
                    3
                  </span>
                  <span>Recibes la confirmación y la preparación previa, si aplica.</span>
                </li>
              </ol>
            </Card>

            <Card className="surface-panel p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                    Soporte clínico
                  </h3>
                  <p className="text-sm leading-6 text-[hsl(var(--public-muted))]">
                    La IA orienta antes de la cita, pero no reemplaza al médico.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="border-t border-[hsl(var(--public-border)/0.72)] bg-[hsl(var(--card))] py-8">
        <div className="editorial-shell flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,hsl(var(--brand-ocean)),hsl(var(--brand-sky)))]">
              <Stethoscope className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-semibold text-[hsl(var(--public-ink))]">Doctor.mx</span>
          </div>
          <p className="text-sm text-[hsl(var(--public-muted))]">
            © {new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
