'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarCheck,
  MapPin,
  ShieldCheck,
  Star,
  Stethoscope,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/Eyebrow'
import { formatCurrency, formatDoctorName } from '@/lib/utils'
import type { PublicLandingData } from '@/lib/public-trust'

type HeroSectionProps = {
  trustData?: PublicLandingData | null
}

function formatVerifiedDate(date: string | null | undefined) {
  if (!date) return null
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function HeroSection({ trustData }: HeroSectionProps) {
  const metrics = trustData?.metrics
  const doctor = trustData?.featuredDoctors[0]
  const doctorPhotoUrl = doctor?.profile?.photo_url || null
  const verifiedDate = doctor?.verification?.verified_at
    ? formatVerifiedDate(doctor.verification.verified_at)
    : null

  const proofPills = [
    {
      label: 'Médicos aprobados',
      value: metrics ? metrics.approvedDoctors.toLocaleString('es-MX') : '—',
    },
    {
      label: 'Reseñas reales',
      value: metrics ? metrics.reviews.toLocaleString('es-MX') : '—',
    },
    {
      label: 'Especialidades activas',
      value: metrics ? metrics.specialties.toLocaleString('es-MX') : '—',
    },
    {
      label: 'Verificados SEP',
      value: metrics ? metrics.verifiedDoctors.toLocaleString('es-MX') : '—',
    },
  ]

  return (
    <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,hsl(var(--public-bg))_0%,hsl(var(--card))_100%)] py-10 sm:py-14 lg:py-16">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,hsl(var(--brand-sky)/0.18),transparent_55%),radial-gradient(circle_at_top_right,hsl(var(--brand-leaf)/0.12),transparent_48%)]" />
      <div className="editorial-shell relative">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="max-w-3xl"
          >
            <Eyebrow className="mb-5 text-[hsl(var(--public-muted))]">
              Verificación SEP + reseñas reales
            </Eyebrow>

            <h1 className="font-display text-4xl font-semibold leading-[0.96] tracking-tight text-[hsl(var(--public-ink))] sm:text-5xl lg:text-6xl">
              Encuentra al médico correcto,
              <span className="block text-[hsl(var(--brand-ocean))]">con evidencia visible.</span>
            </h1>

            <p className="mt-5 max-w-[62ch] text-base leading-7 text-[hsl(var(--public-muted))] sm:text-lg">
              Doctor.mx muestra doctores aprobados, fotos reales, reseñas completadas y cédula profesional cuando está disponible. La IA orienta; la consulta la da un médico real.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
                <Link href="/doctors">
                  Buscar doctores
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/ai-consulta">
                  <Stethoscope className="h-4 w-4" aria-hidden="true" />
                  Orientación con Dr. Simeon
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {proofPills.map((pill) => (
                <div
                  key={pill.label}
                  className="surface-panel flex items-start justify-between gap-3 rounded-[var(--public-radius-control)] px-4 py-3"
                >
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                      {pill.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                      {pill.value}
                    </p>
                  </div>
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-[hsl(var(--brand-leaf))]" aria-hidden="true" />
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Card className="surface-panel-strong overflow-hidden p-0 shadow-[0_28px_60px_-32px_rgba(15,37,95,0.28)]">
              <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="relative min-h-[24rem] bg-[linear-gradient(180deg,hsl(var(--surface-tint))_0%,hsl(var(--card))_100%)]">
                  {doctorPhotoUrl ? (
                    <Image
                      src={doctorPhotoUrl}
                      alt={doctor.profile?.full_name || 'Doctor'}
                      fill
                      sizes="(max-width: 1024px) 100vw, 48vw"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full min-h-[24rem] items-center justify-center bg-[linear-gradient(145deg,hsl(var(--surface-quiet)),hsl(var(--surface-tint)))]">
                      <Stethoscope className="h-16 w-16 text-[hsl(var(--brand-ocean))]" />
                    </div>
                  )}

                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    <Badge variant="luxe" className="bg-card/90 backdrop-blur-sm">
                      {doctor?.verification?.sep_verified ? 'SEP verificado' : 'Perfil aprobado'}
                    </Badge>
                    {doctor?.offers_video ? (
                      <Badge variant="outline" className="bg-card/90 backdrop-blur-sm">
                        Videoconsulta
                      </Badge>
                    ) : null}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,rgba(10,21,51,0.82))] p-5 text-white">
                    <div className="max-w-[24rem]">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                        Médico destacado
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        {doctor ? formatDoctorName(doctor.profile?.full_name) : 'Doctor verificado'}
                      </h2>
                      <p className="mt-1 text-sm text-white/80">
                        {doctor?.specialties[0]?.name || 'Especialidad médica'} · {doctor?.city || 'México'}
                        {doctor?.state ? `, ${doctor.state}` : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5 bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-quiet))_100%)] p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                        Reputación real
                      </p>
                      <h3 className="mt-1 text-xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                        {doctor ? formatDoctorName(doctor.profile?.full_name) : 'Doctor.mx'}
                      </h3>
                    </div>
                    <div className="rounded-[var(--public-radius-control)] border border-border bg-card px-3 py-2 text-right">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                        Desde
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[hsl(var(--public-ink))]">
                        {doctor ? formatCurrency(doctor.price_cents, doctor.currency) : '$—'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[hsl(var(--public-muted))]">
                      <Star className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" />
                      <span className="font-semibold text-[hsl(var(--public-ink))]">
                        {doctor ? doctor.rating_avg.toFixed(1) : '—'}
                      </span>
                      <span>({doctor?.rating_count.toLocaleString('es-MX') || 0} reseñas)</span>
                    </div>

                    <div className="grid gap-2 rounded-[var(--public-radius-control)] border border-border bg-card p-4 text-sm">
                      <div className="flex items-center gap-2 text-[hsl(var(--public-muted))]">
                        <CalendarCheck className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                        <span>Modalidad disponible</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {doctor?.offers_video || doctor?.video_enabled ? (
                          <Badge variant="info" className="normal-case tracking-normal">
                            Videoconsulta
                          </Badge>
                        ) : null}
                        {doctor?.offers_in_person ? (
                          <Badge variant="success" className="normal-case tracking-normal">
                            Presencial
                          </Badge>
                        ) : null}
                        {!doctor?.offers_video && !doctor?.offers_in_person ? (
                          <Badge variant="outline" className="normal-case tracking-normal">
                            Modalidad por confirmar
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-2 rounded-[var(--public-radius-control)] border border-border bg-card p-4 text-sm text-[hsl(var(--public-muted))]">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                        <span>{doctor?.city || 'Ciudad por confirmar'}{doctor?.state ? `, ${doctor.state}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                        <span>
                          Cédula {doctor?.verification?.cedula || doctor?.license_number || 'no mostrada'}
                          {verifiedDate ? ` · verificada ${verifiedDate}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href={doctor ? `/doctors/${doctor.id}` : '/doctors'}>Ver perfil</Link>
                    </Button>
                    <Button asChild variant="hero" className="w-full sm:w-auto">
                      <Link href={doctor ? `/book/${doctor.id}` : '/doctors'}>
                        Agendar cita
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
