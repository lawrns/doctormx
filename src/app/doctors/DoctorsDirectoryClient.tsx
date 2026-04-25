'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Video,
  MapPin,
  Clock,
  Filter,
  CalendarDays,
} from 'lucide-react'
import { DoctorMxLogo } from '@/components/brand/DoctorMxLogo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDoctorName } from '@/lib/utils'
import type { PublicDoctorSummary } from '@/lib/discovery'
import { VerificationBadge } from '@/components/TrustSignals'

interface Specialty {
  id: string
  name: string
  slug: string
}

interface PageParams {
  specialty?: string
  search?: string
  city?: string
  sortBy?: 'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'experience'
  sortOrder?: 'asc' | 'desc'
  appointmentType?: 'all' | 'video' | 'in_person'
}

type DoctorsDirectoryClientProps = {
  doctors: PublicDoctorSummary[]
  specialties: Specialty[]
  params: PageParams
}

type DirectoryDoctor = PublicDoctorSummary & {
  demo?: boolean
  mapPoint?: {
    x: number
    y: number
  }
}

const demoDoctors: DirectoryDoctor[] = [
  {
    id: 'demo-paula-ramirez',
    demo: true,
    status: 'approved',
    bio: 'Dermatologia clinica y acne adulto. Consulta con enfoque claro, seguimiento y plan por escrito.',
    languages: ['es', 'en'],
    years_experience: 11,
    city: 'Ciudad de Mexico',
    state: 'CDMX',
    country: 'MX',
    price_cents: 75000,
    currency: 'MXN',
    rating_avg: 4.9,
    rating_count: 214,
    license_number: '6785432',
    video_enabled: true,
    office_address: 'Polanco, Ciudad de Mexico',
    offers_video: true,
    offers_in_person: true,
    verification: {
      cedula: '6785432',
      sep_verified: true,
      verified_at: '2026-02-18T12:00:00.000Z',
      institution: 'UNAM',
    },
    profile: {
      id: 'demo-profile-paula',
      full_name: 'Paula Ramirez',
      photo_url: 'https://i.pravatar.cc/240?img=47',
    },
    specialties: [{ id: 'demo-derma', name: 'Dermatologia', slug: 'dermatologia' }],
    mapPoint: { x: 47, y: 42 },
  },
  {
    id: 'demo-rodrigo-vazquez',
    demo: true,
    status: 'approved',
    bio: 'Cardiologia preventiva, hipertension y chequeos ejecutivos con lectura simple de resultados.',
    languages: ['es'],
    years_experience: 14,
    city: 'Guadalajara',
    state: 'Jalisco',
    country: 'MX',
    price_cents: 85000,
    currency: 'MXN',
    rating_avg: 4.8,
    rating_count: 187,
    license_number: '8765431',
    video_enabled: true,
    office_address: 'Providencia, Guadalajara',
    offers_video: true,
    offers_in_person: true,
    verification: {
      cedula: '8765431',
      sep_verified: true,
      verified_at: '2026-01-24T12:00:00.000Z',
      institution: 'UdeG',
    },
    profile: {
      id: 'demo-profile-rodrigo',
      full_name: 'Rodrigo Vazquez',
      photo_url: 'https://i.pravatar.cc/240?img=12',
    },
    specialties: [{ id: 'demo-cardio', name: 'Cardiologia', slug: 'cardiologia' }],
    mapPoint: { x: 28, y: 56 },
  },
  {
    id: 'demo-ana-lopez',
    demo: true,
    status: 'approved',
    bio: 'Ginecologia, anticoncepcion y control anual. Atencion cuidadosa para primera consulta.',
    languages: ['es'],
    years_experience: 9,
    city: 'Monterrey',
    state: 'Nuevo Leon',
    country: 'MX',
    price_cents: 72000,
    currency: 'MXN',
    rating_avg: 4.9,
    rating_count: 324,
    license_number: '11223344',
    video_enabled: true,
    office_address: 'San Pedro Garza Garcia, Nuevo Leon',
    offers_video: true,
    offers_in_person: true,
    verification: {
      cedula: '11223344',
      sep_verified: true,
      verified_at: '2026-03-03T12:00:00.000Z',
      institution: 'ITESM',
    },
    profile: {
      id: 'demo-profile-ana',
      full_name: 'Ana Lopez',
      photo_url: 'https://i.pravatar.cc/240?img=32',
    },
    specialties: [{ id: 'demo-gine', name: 'Ginecologia', slug: 'ginecologia' }],
    mapPoint: { x: 62, y: 32 },
  },
  {
    id: 'demo-sofia-herrera',
    demo: true,
    status: 'approved',
    bio: 'Psicologia clinica para ansiedad, estres laboral y terapia breve basada en objetivos.',
    languages: ['es', 'en'],
    years_experience: 8,
    city: 'Ciudad de Mexico',
    state: 'CDMX',
    country: 'MX',
    price_cents: 65000,
    currency: 'MXN',
    rating_avg: 4.9,
    rating_count: 96,
    license_number: '5544332',
    video_enabled: true,
    office_address: 'Roma Norte, Ciudad de Mexico',
    offers_video: true,
    offers_in_person: true,
    verification: {
      cedula: '5544332',
      sep_verified: true,
      verified_at: '2026-02-02T12:00:00.000Z',
      institution: 'Universidad Iberoamericana',
    },
    profile: {
      id: 'demo-profile-sofia',
      full_name: 'Sofia Herrera',
      photo_url: 'https://i.pravatar.cc/240?img=49',
    },
    specialties: [{ id: 'demo-psico', name: 'Psicologia', slug: 'psicologia' }],
    mapPoint: { x: 51, y: 52 },
  },
  {
    id: 'demo-jorge-ramirez',
    demo: true,
    status: 'approved',
    bio: 'Medicina interna para diagnostico integral, diabetes, tiroides y sintomas persistentes.',
    languages: ['es'],
    years_experience: 16,
    city: 'Puebla',
    state: 'Puebla',
    country: 'MX',
    price_cents: 70000,
    currency: 'MXN',
    rating_avg: 4.8,
    rating_count: 132,
    license_number: '9988776',
    video_enabled: true,
    office_address: 'Angelopolis, Puebla',
    offers_video: true,
    offers_in_person: true,
    verification: {
      cedula: '9988776',
      sep_verified: true,
      verified_at: '2026-01-09T12:00:00.000Z',
      institution: 'BUAP',
    },
    profile: {
      id: 'demo-profile-jorge',
      full_name: 'Jorge Ramirez',
      photo_url: 'https://i.pravatar.cc/240?img=15',
    },
    specialties: [{ id: 'demo-interna', name: 'Medicina interna', slug: 'medicina-interna' }],
    mapPoint: { x: 57, y: 61 },
  },
]

const demoSpecialties: Specialty[] = [
  { id: 'demo-derma', name: 'Dermatologia', slug: 'dermatologia' },
  { id: 'demo-gine', name: 'Ginecologia', slug: 'ginecologia' },
  { id: 'demo-cardio', name: 'Cardiologia', slug: 'cardiologia' },
  { id: 'demo-psico', name: 'Psicologia', slug: 'psicologia' },
  { id: 'demo-interna', name: 'Medicina interna', slug: 'medicina-interna' },
]

function buildInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function FilterChip({
  label,
  active,
  onClick,
  fullWidth,
}: {
  label: string
  active?: boolean
  onClick: () => void
  fullWidth?: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center justify-between rounded-[8px] border px-3 py-1.5 text-xs font-semibold transition-[background-color,border-color,color,transform] active:scale-[0.98] ${
        fullWidth ? 'w-full' : ''
      } ${
        active
          ? 'border-[hsl(var(--brand-ocean))] bg-[hsl(var(--brand-ocean)/0.1)] text-[hsl(var(--public-ink))]'
          : 'border-border bg-card text-[hsl(var(--public-ink))] hover:border-[hsl(var(--brand-ocean)/0.18)] hover:bg-[hsl(var(--surface-tint))]'
      }`}
    >
      {label}
    </button>
  )
}

function DirectoryFilterRail({
  specialties,
  params,
  count,
  sortValue,
  buildQuery,
  onNavigate,
  onSortChange,
}: {
  specialties: Specialty[]
  params: PageParams
  count: number
  sortValue: PageParams['sortBy']
  buildQuery: (updates: Record<string, string | undefined>) => string
  onNavigate: (href: string) => void
  onSortChange: (value: PageParams['sortBy']) => void
}) {
  const modality = params.appointmentType || 'all'

  return (
    <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
      <div className="rounded-[10px] border border-border bg-card p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
              Filtros
            </p>
            <p className="mt-1 text-sm font-semibold text-[hsl(var(--public-ink))]">
              {count.toLocaleString('es-MX')} resultados
            </p>
          </div>
          <Filter className="mt-0.5 h-4 w-4 text-[hsl(var(--brand-ocean))]" aria-hidden="true" />
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="doctor-sort"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]"
            >
              Orden
            </label>
            <select
              id="doctor-sort"
              value={sortValue || 'relevance'}
              onChange={(event) => onSortChange(event.target.value as PageParams['sortBy'])}
              className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm outline-none"
            >
              <option value="relevance">Relevancia</option>
              <option value="rating">Calificación</option>
              <option value="price_asc">Precio menor</option>
              <option value="price_desc">Precio mayor</option>
              <option value="experience">Experiencia</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
              Modalidad
            </p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <FilterChip
                label="Todas"
                fullWidth
                active={modality === 'all'}
                onClick={() => onNavigate(`/doctors${buildQuery({ appointmentType: undefined })}`)}
              />
              <FilterChip
                label="Video"
                fullWidth
                active={modality === 'video'}
                onClick={() =>
                  onNavigate(
                    `/doctors${buildQuery({
                      appointmentType: params.appointmentType === 'video' ? undefined : 'video',
                    })}`
                  )
                }
              />
              <FilterChip
                label="Presencial"
                fullWidth
                active={modality === 'in_person'}
                onClick={() =>
                  onNavigate(
                    `/doctors${buildQuery({
                      appointmentType:
                        params.appointmentType === 'in_person' ? undefined : 'in_person',
                    })}`
                  )
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
              Especialidad
            </p>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {specialties.slice(0, 7).map((specialty) => (
                <FilterChip
                  key={specialty.id}
                  label={specialty.name}
                  fullWidth
                  onClick={() =>
                    onNavigate(
                      `/doctors${buildQuery({
                        specialty: params.specialty === specialty.slug ? undefined : specialty.slug,
                      })}`
                    )
                  }
                  active={params.specialty === specialty.slug}
                />
              ))}
            </div>
          </div>

          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href="/doctors">Limpiar filtros</Link>
          </Button>
        </div>
      </div>
    </aside>
  )
}

function MobileFilterStrip({
  specialties,
  params,
  count,
  sortValue,
  buildQuery,
  onNavigate,
  onSortChange,
}: {
  specialties: Specialty[]
  params: PageParams
  count: number
  sortValue: PageParams['sortBy']
  buildQuery: (updates: Record<string, string | undefined>) => string
  onNavigate: (href: string) => void
  onSortChange: (value: PageParams['sortBy']) => void
}) {
  return (
    <div className="mb-4 rounded-[10px] border border-border bg-card p-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
            Filtros
          </p>
          <p className="mt-1 text-sm font-semibold text-[hsl(var(--public-ink))]">
            {count.toLocaleString('es-MX')} resultados
          </p>
        </div>
        <select
          aria-label="Ordenar doctores"
          value={sortValue || 'relevance'}
          onChange={(event) => onSortChange(event.target.value as PageParams['sortBy'])}
          className="max-w-[9.5rem] rounded-[8px] border border-border bg-card px-3 py-2 text-sm outline-none"
        >
          <option value="relevance">Relevancia</option>
          <option value="rating">Calificación</option>
          <option value="price_asc">Precio menor</option>
          <option value="price_desc">Precio mayor</option>
          <option value="experience">Experiencia</option>
        </select>
      </div>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterChip
          label="Todas"
          active={!params.appointmentType || params.appointmentType === 'all'}
          onClick={() => onNavigate(`/doctors${buildQuery({ appointmentType: undefined })}`)}
        />
        <FilterChip
          label="Video"
          active={params.appointmentType === 'video'}
          onClick={() =>
            onNavigate(
              `/doctors${buildQuery({
                appointmentType: params.appointmentType === 'video' ? undefined : 'video',
              })}`
            )
          }
        />
        <FilterChip
          label="Presencial"
          active={params.appointmentType === 'in_person'}
          onClick={() =>
            onNavigate(
              `/doctors${buildQuery({
                appointmentType: params.appointmentType === 'in_person' ? undefined : 'in_person',
              })}`
            )
          }
        />
        {specialties.slice(0, 5).map((specialty) => (
          <FilterChip
            key={specialty.id}
            label={specialty.name}
            active={params.specialty === specialty.slug}
            onClick={() =>
              onNavigate(
                `/doctors${buildQuery({
                  specialty: params.specialty === specialty.slug ? undefined : specialty.slug,
                })}`
              )
            }
          />
        ))}
      </div>
    </div>
  )
}

function matchesDirectoryParams(doctor: DirectoryDoctor, params: PageParams) {
  const normalizedSearch = params.search?.trim().toLowerCase()
  const normalizedCity = params.city?.trim().toLowerCase()

  if (params.specialty) {
    const hasSpecialty = doctor.specialties.some((specialty) => specialty.slug === params.specialty)
    if (!hasSpecialty) return false
  }

  if (normalizedSearch) {
    const haystack = [
      doctor.profile?.full_name,
      doctor.bio,
      doctor.city,
      doctor.state,
      ...doctor.specialties.map((specialty) => specialty.name),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    if (!haystack.includes(normalizedSearch)) return false
  }

  if (normalizedCity) {
    const cityText = [doctor.city, doctor.state].filter(Boolean).join(' ').toLowerCase()
    if (!cityText.includes(normalizedCity)) return false
  }

  if (params.appointmentType === 'video' && !doctor.offers_video && !doctor.video_enabled) return false
  if (params.appointmentType === 'in_person' && !doctor.offers_in_person) return false

  return true
}

function getDisplayDoctors(doctors: PublicDoctorSummary[], params: PageParams): DirectoryDoctor[] {
  const liveDoctors = doctors.map((doctor, index) => ({
    ...doctor,
    mapPoint: doctor.city
      ? {
          x: 34 + ((index * 19) % 42),
          y: 30 + ((index * 13) % 46),
        }
      : undefined,
  }))
  const liveIds = new Set(liveDoctors.map((doctor) => doctor.id))
  const matchingDemoDoctors = demoDoctors
    .filter((doctor) => !liveIds.has(doctor.id))
    .filter((doctor) => matchesDirectoryParams(doctor, params))

  if (liveDoctors.length >= 5) return liveDoctors
  return [...liveDoctors, ...matchingDemoDoctors].slice(0, 7)
}

function DoctorCard({ doctor }: { doctor: DirectoryDoctor }) {
  const name = doctor.profile?.full_name || 'Doctor'
  const initials = buildInitials(name) || 'DM'
  const verification = doctor.verification
  const isVerified = Boolean(verification?.sep_verified)
  const verifiedDate = verification?.verified_at ? new Date(verification.verified_at) : null
  const hasVerificationDetails = Boolean(verification?.cedula && verifiedDate)
  const profileHref = doctor.demo ? `/doctors?search=${encodeURIComponent(name)}` : `/doctors/${doctor.id}`
  const bookingHref = doctor.demo ? '/ai-consulta' : `/book/${doctor.id}`
  const specialty = doctor.specialties[0]?.name || 'Especialidad medica'
  const location = [doctor.office_address || doctor.city, doctor.state].filter(Boolean).join(', ')

  return (
    <article className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_1px_2px_rgba(15,37,95,0.04)] transition-colors hover:border-[hsl(var(--brand-ocean)/0.28)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_18.5rem]">
        <div className="p-4 lg:border-r lg:border-border/80">
          <div className="flex gap-3.5">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[hsl(var(--surface-tint))] ring-1 ring-border">
              {doctor.profile?.photo_url ? (
                <Image
                  src={doctor.profile.photo_url}
                  alt={name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[hsl(var(--brand-ocean))]">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="truncate text-[1.05rem] font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  {formatDoctorName(name)}
                </h3>
                {isVerified ? (
                  <Badge variant="success" className="rounded-[6px] px-2 py-0.5 text-[11px] normal-case tracking-normal">
                    SEP
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-[6px] px-2 py-0.5 text-[11px] normal-case tracking-normal">
                    Aprobado
                  </Badge>
                )}
                {doctor.demo ? (
                  <Badge variant="outline" className="rounded-[6px] px-2 py-0.5 text-[11px] normal-case tracking-normal">
                    Demo
                  </Badge>
                ) : null}
              </div>

              <p className="mt-0.5 text-sm text-[hsl(var(--public-muted))]">
                {specialty}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-[hsl(var(--public-muted))]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[hsl(var(--brand-leaf))]">
                  <StarMeter rating={doctor.rating_avg} compact />
                  <span className="text-[hsl(var(--public-ink))]">{doctor.rating_avg.toFixed(1)}</span>
                  <span className="font-normal text-[hsl(var(--public-muted))]">
                    {doctor.rating_count.toLocaleString('es-MX')} opiniones
                  </span>
                </span>
                {doctor.years_experience ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[hsl(var(--brand-ocean))]" />
                    {doctor.years_experience} años
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 pl-[4.375rem]">
            {hasVerificationDetails && verification ? (
              <VerificationBadge
                doctorId={doctor.id}
                cedula={verification.cedula!}
                verifiedDate={verifiedDate as Date}
                showDetails={true}
              />
            ) : doctor.verification?.cedula ? (
              <Badge variant="outline" className="rounded-[6px] px-2 py-0.5 text-[11px] normal-case tracking-normal">
                Cédula {doctor.verification.cedula}
              </Badge>
            ) : null}
            {doctor.verification?.institution ? (
              <Badge variant="outline" className="rounded-[6px] px-2 py-0.5 text-[11px] normal-case tracking-normal">
                {doctor.verification.institution}
              </Badge>
            ) : null}
          </div>

          <div className="mt-3 space-y-2 pl-[4.375rem] text-sm leading-5 text-[hsl(var(--public-muted))]">
            <p className="line-clamp-2">{doctor.bio || 'Perfil medico verificado y listo para consulta.'}</p>
            <p className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[hsl(var(--public-muted))]" />
              <span className="line-clamp-1">{location || 'Mexico'} · Mapa</span>
            </p>
          </div>
        </div>

        <div className="border-t border-border/80 bg-[hsl(var(--surface-quiet))] p-4 lg:border-t-0">
          <div className="flex h-full flex-col justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--public-ink))]">
                Ver disponibilidad
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(doctor.offers_video || doctor.video_enabled) ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-card px-2.5 py-2 text-xs text-[hsl(var(--public-muted))]">
                    <Video className="h-3.5 w-3.5 text-[hsl(var(--brand-ocean))]" />
                    Video
                  </span>
                ) : null}
                {doctor.offers_in_person ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-card px-2.5 py-2 text-xs text-[hsl(var(--public-muted))]">
                    <MapPin className="h-3.5 w-3.5 text-[hsl(var(--brand-ocean))]" />
                    Presencial
                  </span>
                ) : null}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs text-[hsl(var(--public-muted))]">
                <CalendarDays className="h-3.5 w-3.5" />
                Horarios exactos al abrir agenda
              </p>
            </div>

            <div>
              <div className="mb-3 flex items-end justify-between gap-2 border-t border-border pt-3">
                <span className="text-xs text-[hsl(var(--public-muted))]">Consulta desde</span>
                <span className="text-lg font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  {formatCurrency(doctor.price_cents, doctor.currency)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" size="sm" className="w-full rounded-[8px]">
                <Link href={profileHref}>Ver perfil</Link>
              </Button>
                <Button asChild variant="hero" size="sm" className="w-full rounded-[8px]">
                <Link href={bookingHref}>
                  {doctor.demo ? 'Orientarme' : 'Agendar cita'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function StarMeter({ rating, compact }: { rating: number; compact?: boolean }) {
  const fullStars = Math.round(rating)

  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {[...Array(5)].map((_, index) => (
        <StarFill key={index} active={index < fullStars} compact={compact} />
      ))}
    </div>
  )
}

function StarFill({ active, compact }: { active: boolean; compact?: boolean }) {
  return (
    <StarIcon
      compact={compact}
      className={active ? 'text-[hsl(var(--brand-gold))]' : 'text-[hsl(var(--border))]'}
    />
  )
}

function StarIcon({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <svg className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} fill-current ${className || ''}`} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function DoctorsMap({ doctors }: { doctors: DirectoryDoctor[] }) {
  const pinnedDoctors = doctors.filter((doctor) => doctor.mapPoint).slice(0, 7)
  const mapQuery = encodeURIComponent('doctores verificados Ciudad de Mexico')

  return (
    <aside className="lg:sticky lg:top-[4.75rem] lg:self-start">
      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        <div className="border-b border-border px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                Mapa
              </p>
              <h2 className="mt-1 text-sm font-semibold text-[hsl(var(--public-ink))]">
                Doctores cerca de ti
              </h2>
            </div>
            <Badge variant="outline" className="rounded-[6px] px-2 py-0.5 text-[11px] normal-case tracking-normal">
              Google Maps
            </Badge>
          </div>
        </div>

        <div className="relative h-[24rem] overflow-hidden bg-[hsl(var(--surface-soft))] lg:h-[34rem] xl:h-[38rem]">
          <iframe
            title="Google Maps con doctores"
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            className="absolute inset-0 h-full w-full border-0 grayscale-[0.1] saturate-[0.92]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(244,245,248,0.12))]" />
          <button
            type="button"
            className="absolute left-3 top-3 z-[1] rounded-[8px] border border-white/80 bg-white/95 px-3 py-2 text-xs font-semibold text-[hsl(var(--brand-ocean))] shadow-[0_8px_18px_-14px_rgba(15,37,95,0.45)]"
          >
            Ampliar mapa
          </button>

          {pinnedDoctors.map((doctor, index) => {
            const point = doctor.mapPoint
            if (!point) return null

            return (
              <div
                key={doctor.id}
                className="group absolute z-[1] -translate-x-1/2 -translate-y-full"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <div className="relative h-7 w-7 rotate-[-45deg] rounded-[50%_50%_50%_0] border-2 border-white bg-[hsl(var(--brand-ocean))] shadow-[0_5px_14px_-8px_rgba(15,37,95,0.65)] transition-transform group-hover:scale-110">
                  <div className="flex h-full w-full rotate-45 items-center justify-center text-[10px] font-semibold text-white">
                    {index + 1}
                  </div>
                  <div className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 min-w-max -translate-x-1/2 rotate-45 rounded-[6px] bg-[hsl(var(--public-ink))] px-2 py-1 text-[10px] font-semibold text-white opacity-0 shadow-[0_8px_18px_-12px_rgba(15,37,95,0.5)] transition-opacity group-hover:opacity-100">
                    {formatDoctorName(doctor.profile?.full_name || 'Doctor')}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="divide-y divide-border">
          {pinnedDoctors.slice(0, 4).map((doctor, index) => (
            <Link
              key={doctor.id}
              href={doctor.demo ? `/doctors?search=${encodeURIComponent(doctor.profile?.full_name || '')}` : `/doctors/${doctor.id}`}
              className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-[hsl(var(--surface-tint))]"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-[hsl(var(--surface-tint))] text-xs font-semibold text-[hsl(var(--brand-ocean))]">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-[hsl(var(--public-ink))]">
                  {formatDoctorName(doctor.profile?.full_name || 'Doctor')}
                </span>
                <span className="block truncate text-xs text-[hsl(var(--public-muted))]">
                  {doctor.city || 'Mexico'} · {doctor.rating_avg.toFixed(1)}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 text-[hsl(var(--public-muted))]" />
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

export function DoctorsDirectoryClient({
  doctors,
  specialties,
  params,
}: DoctorsDirectoryClientProps) {
  const router = useRouter()
  const [sortValue, setSortValue] = useState<PageParams['sortBy']>(params.sortBy || 'relevance')
  const displayDoctors = useMemo(() => getDisplayDoctors(doctors, params), [doctors, params])
  const displaySpecialties = specialties.length > 0 ? specialties : demoSpecialties
  const hasDemoDoctors = displayDoctors.some((doctor) => doctor.demo)

  const buildQuery = (updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    if (params.specialty) sp.set('specialty', params.specialty)
    if (params.search) sp.set('search', params.search)
    if (params.city) sp.set('city', params.city)
    if (params.sortBy) sp.set('sortBy', params.sortBy)
    if (params.sortOrder) sp.set('sortOrder', params.sortOrder)
    if (params.appointmentType) sp.set('appointmentType', params.appointmentType)

    Object.entries(updates).forEach(([key, value]) => {
      if (value) sp.set(key, value)
      else sp.delete(key)
    })

    return sp.toString() ? `?${sp.toString()}` : ''
  }

  const heading = useMemo(() => {
    if (params.search) return `Resultados para "${params.search}"`
    if (params.city) return `Doctores en ${params.city}`
    const specialty = displaySpecialties.find((specialtyItem) => specialtyItem.slug === params.specialty)
    return specialty ? `${specialty.name} en México` : 'Doctores y especialistas verificados'
  }, [params.search, params.city, params.specialty, displaySpecialties])

  const activeFilters = [
    params.specialty ? displaySpecialties.find((item) => item.slug === params.specialty)?.name : null,
    params.city || null,
    params.appointmentType && params.appointmentType !== 'all'
      ? params.appointmentType === 'video'
        ? 'Videoconsulta'
        : 'Presencial'
      : null,
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <header className="sticky top-0 z-[200] border-b border-border bg-card/92 backdrop-blur-xl">
        <div className="editorial-shell">
          <div className="flex flex-col gap-3 py-2.5 lg:flex-row lg:items-center">
            <Link
              href="/"
              className="shrink-0 rounded-lg transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Doctor.mx - Inicio"
            >
              <DoctorMxLogo markClassName="h-8 w-8" textClassName="text-[1.05rem]" />
            </Link>

            <form
              action="/doctors"
              className="flex w-full flex-col gap-2 rounded-[10px] border border-border bg-[hsl(var(--surface-quiet))] px-3 py-3 lg:flex-1 lg:flex-row lg:items-center lg:gap-3 lg:py-2"
              onSubmit={(event) => {
                event.preventDefault()
                const formData = new FormData(event.currentTarget)
                const search = String(formData.get('search') || '').trim()
                const city = String(formData.get('city') || '').trim()
                router.push(
                  `/doctors${buildQuery({ search: search || undefined, city: city || undefined })}`
                )
              }}
            >
              <div className="flex flex-1 items-center gap-2">
                <Search className="h-4 w-4 shrink-0 text-[hsl(var(--public-muted))]" />
                <input
                  name="search"
                  type="text"
                  placeholder="Especialidad o doctor"
                  defaultValue={params.search || ''}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--public-muted))/0.72]"
                />
              </div>
              <div className="h-px w-full bg-border lg:h-5 lg:w-px" />
              <input
                name="city"
                type="text"
                placeholder="Ciudad"
                defaultValue={params.city || ''}
                className="w-full bg-transparent text-sm outline-none placeholder:text-[hsl(var(--public-muted))/0.72] lg:w-44"
              />
              <Button type="submit" variant="hero" size="sm" className="w-full lg:w-auto">
                Buscar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-card">
        <div className="editorial-shell py-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h1 className="font-display text-lg font-semibold tracking-[-0.02em] text-[hsl(var(--public-ink))]">
                {heading}
              </h1>
              <p className="mt-1 text-xs text-[hsl(var(--public-muted))]">
                {displayDoctors.length.toLocaleString('es-MX')} resultados · cédula y mapa cuando el dato existe
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {activeFilters.length > 0 ? (
                activeFilters.map((filter) => (
                  <Badge key={filter} variant="luxe" className="normal-case tracking-normal">
                    {filter}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="normal-case tracking-normal">
                  Sin filtros activos
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="editorial-shell py-3 sm:py-4">
        {hasDemoDoctors ? (
          <div className="mb-3 rounded-[8px] border border-[hsl(var(--brand-ocean)/0.16)] bg-[hsl(var(--surface-tint))] px-3 py-2 text-xs text-[hsl(var(--public-muted))]">
            Doctores demo visibles hasta completar el catalogo real.
          </div>
        ) : null}

        <MobileFilterStrip
          specialties={displaySpecialties}
          params={params}
          count={displayDoctors.length}
          sortValue={sortValue}
          buildQuery={buildQuery}
          onNavigate={(href) => router.push(href)}
          onSortChange={(nextValue) => {
            setSortValue(nextValue)
            router.push(`/doctors${buildQuery({ sortBy: nextValue })}`)
          }}
        />

        <div className="grid gap-3 lg:grid-cols-[13.75rem_minmax(0,1fr)_23.75rem] xl:grid-cols-[14rem_minmax(0,1fr)_24rem]">
          <DirectoryFilterRail
            specialties={displaySpecialties}
            params={params}
            count={displayDoctors.length}
            sortValue={sortValue}
            buildQuery={buildQuery}
            onNavigate={(href) => router.push(href)}
            onSortChange={(nextValue) => {
              setSortValue(nextValue)
              router.push(`/doctors${buildQuery({ sortBy: nextValue })}`)
            }}
          />

          <div className="space-y-4">
            {displayDoctors.length === 0 ? (
              <Card className="surface-panel p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <Search className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-[hsl(var(--public-ink))]">No encontramos doctores</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[hsl(var(--public-muted))]">
                  Prueba con otra especialidad, ciudad o modalidad.
                </p>
              </Card>
            ) : (
              displayDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)
            )}
          </div>

          <DoctorsMap doctors={displayDoctors} />
        </div>
      </main>
    </div>
  )
}
