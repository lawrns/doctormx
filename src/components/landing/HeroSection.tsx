'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
  Stethoscope,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDoctorName } from '@/lib/utils'
import type { PublicLandingData } from '@/lib/public-trust'

type HeroSectionProps = {
  trustData?: PublicLandingData | null
}

const fallbackDoctor = {
  id: 'sample-landing-paula',
  status: 'approved',
  bio: 'Dermatología clínica con seguimiento claro y consulta en línea.',
  languages: ['es'],
  years_experience: 11,
  city: 'Ciudad de México',
  state: 'CDMX',
  country: 'MX',
  price_cents: 65000,
  currency: 'MXN',
  rating_avg: 4.9,
  rating_count: 214,
  license_number: '12345678',
  video_enabled: true,
  office_address: 'Polanco, Ciudad de México',
  offers_video: true,
  offers_in_person: true,
  verification: {
    cedula: '12345678',
    sep_verified: true,
    verified_at: '2026-02-18T12:00:00.000Z',
    institution: 'UNAM',
  },
  profile: {
    id: 'sample-profile-paula',
    full_name: 'Paula Ramirez',
    photo_url: 'https://i.pravatar.cc/320?img=47',
  },
  specialties: [{ id: 'sample-derma', name: 'Dermatología', slug: 'dermatologia' }],
} as PublicLandingData['featuredDoctors'][number]

function formatVerifiedDate(date: string | null | undefined) {
  if (!date) return null

  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatMetric(value: number | undefined, fallback: string) {
  if (!value || value <= 0) return fallback
  return value.toLocaleString('es-MX')
}

export function HeroSection({ trustData }: HeroSectionProps) {
  const metrics = trustData?.metrics
  const doctor = trustData?.featuredDoctors[0] || fallbackDoctor
  const isFallbackDoctor = doctor.id === fallbackDoctor.id
  const featuredDoctors = trustData?.featuredDoctors.length
    ? trustData.featuredDoctors.slice(0, 3)
    : [fallbackDoctor]
  const doctorName = formatDoctorName(doctor.profile?.full_name)
  const specialty = doctor.specialties[0]?.name || 'Especialidad médica'
  const location = [doctor.city, doctor.state].filter(Boolean).join(', ') || 'México'
  const cedula = doctor.verification?.cedula || doctor.license_number
  const verifiedDate = formatVerifiedDate(doctor.verification?.verified_at)
  const profileHref = isFallbackDoctor ? '/doctors' : `/doctors/${doctor.id}`
  const bookingHref = isFallbackDoctor ? '/ai-consulta' : `/book/${doctor.id}?ref=dr-simeon`

  return (
    <section className="relative overflow-hidden bg-[hsl(var(--brand-ink))] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[36%] top-[-20%] h-[42rem] w-[42rem] rounded-full border border-white/8" />
        <div className="absolute left-[44%] top-[4%] h-[28rem] w-[28rem] rounded-full bg-primary/24 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(to_bottom,transparent_0%,hsl(var(--brand-ink)_/_0.4)_60%,hsl(var(--brand-ink))_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_60%,hsl(var(--brand-ocean)_/_0.15),transparent)]" />
      </div>

      <div className="editorial-shell relative z-10 pt-12 sm:pt-14 lg:pt-16">
        <div className="grid gap-8 lg:min-h-[34rem] lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative z-20 max-w-3xl pb-2"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/80 ring-1 ring-white/12">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Médicos verificados
            </div>

            <h1 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
              No sabes si es estrés, migraña o algo peor.{' '}
              <span className="font-serif italic tracking-[-0.04em] text-primary">Dr. Simeón te orienta en 2 minutos.</span>
            </h1>

            <p className="mt-6 max-w-[42rem] text-base leading-7 text-white/74 sm:text-lg">
              Describe tus síntomas. Dr. Simeón identifica la especialidad correcta. Te mostramos 3 médicos verificados con precio, cédula y horarios reales. Primera consulta desde $500 MXN.
            </p>

            <div className="mt-6 flex flex-col gap-3 pb-6 sm:flex-row lg:pb-8">
              <Button asChild size="lg" variant="primary" className="w-full sm:w-auto">
                <Link href="/ai-consulta">
                  Hablar con Dr. Simeón
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/doctors">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Ver médicos
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline-inverse" className="w-full sm:w-auto">
                <Link href="/sintomas">
                  <Stethoscope className="h-4 w-4" aria-hidden="true" />
                  ¿Cuál especialista necesito?
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            className="relative z-20 pb-8 lg:pb-0"
          >
            <div className="max-w-[440px] rounded-2xl border border-white/18 bg-card p-4 text-foreground shadow-[var(--shadow-sm)]">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface-tint px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  <Stethoscope className="h-4 w-4" aria-hidden="true" />
                  Asistente IA
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-sm font-semibold">¿Qué síntomas tienes hoy?</p>
                    <div className="ml-auto max-w-[16rem] rounded-xl rounded-br-[4px] bg-primary/10 px-4 py-3 text-sm leading-5 text-foreground">
                      Tengo brotes en la cara desde hace semanas y mi piel se ve más grasa de lo normal.
                    </div>
                  </div>

                  <div className="max-w-[18rem] rounded-xl rounded-bl-[4px] bg-muted px-4 py-3 text-sm leading-5 text-muted-foreground">
                    Entiendo. Con base en lo que cuentas, te recomiendo consultar con:
                  </div>

                  <div className="rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-sm)]">
                    <div className="flex gap-4">
                      <Link href={profileHref} className="relative aspect-square h-16 shrink-0 overflow-hidden rounded-xl bg-surface-tint">
                        {doctor.profile?.photo_url ? (
                          <Image
                            src={doctor.profile.photo_url}
                            alt={doctor.profile?.full_name || 'Doctor verificado'}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Stethoscope className="h-7 w-7 text-[hsl(var(--interactive))]" aria-hidden="true" />
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="truncate text-lg font-semibold tracking-[-0.02em]">{specialty}</h2>
                          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--trust))]" aria-label="Recomendación validada" />
                        </div>
                        <p className="text-sm text-muted-foreground">{doctorName}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {location}
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--trust))]">
                          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          Céd. Prof. {cedula || 'no mostrada'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {['09:00', '11:00', '15:30', '17:00'].map((slot) => (
                        <span key={slot} className="rounded-full border border-[hsl(var(--interactive)/0.2)] bg-[hsl(var(--interactive)/0.05)] px-3 py-1 text-xs font-semibold text-[hsl(var(--interactive))]">
                          {slot}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs text-muted-foreground sm:grid-cols-2">
                      <span className="flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-[hsl(var(--trust))]" aria-hidden="true" />
                        {doctor.offers_video ? 'En línea disponible' : 'Presencial'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-[hsl(var(--interactive))]" aria-hidden="true" />
                        Desde {formatCurrency(doctor.price_cents, doctor.currency)}
                      </span>
                      <span className="flex items-center gap-1.5 sm:col-span-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--trust))]" aria-hidden="true" />
                        {verifiedDate ? `Verificada ${verifiedDate}` : 'Verificación visible cuando existe'}
                      </span>
                    </div>
                  </div>

                  <Button asChild variant="primary" className="h-12 w-full rounded-xl">
                    <Link href={bookingHref}>
                      {isFallbackDoctor ? 'Iniciar orientación' : 'Ver disponibilidad'}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>

                  <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                    Tu información está protegida y no reemplaza urgencias.
                  </p>
                </div>
              </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative z-30 pb-8"
        >
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/70 lg:justify-end">
            {featuredDoctors.map((item) => (
              <Link key={item.id} href={item.id === fallbackDoctor.id ? '/doctors' : `/doctors/${item.id}`} className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-2 ring-1 ring-white/20 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.12)] hover:bg-white/[0.14] hover:ring-white/30 transition-all duration-200">
                <span className="relative h-6 w-6 overflow-hidden rounded-full bg-white/15 ring-2 ring-white/20">
                  {item.profile?.photo_url ? (
                    <Image
                      src={item.profile.photo_url}
                      alt={item.profile?.full_name || 'Doctor verificado'}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  ) : null}
                </span>
                {formatDoctorName(item.profile?.full_name)}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
