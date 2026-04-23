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
  href,
}: {
  label: string
  active?: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? 'border-[hsl(var(--brand-ocean))] bg-[hsl(var(--brand-ocean)/0.12)] text-[hsl(var(--public-ink))]'
          : 'border-border bg-card text-[hsl(var(--public-ink))] hover:border-[hsl(var(--brand-ocean)/0.2)] hover:bg-[hsl(var(--surface-tint))]'
      }`}
    >
      {label}
    </Link>
  )
}

function DoctorCard({ doctor }: { doctor: PublicDoctorSummary }) {
  const name = doctor.profile?.full_name || 'Doctor'
  const initials = buildInitials(name) || 'DM'
  const verification = doctor.verification
  const isVerified = Boolean(verification?.sep_verified)
  const verifiedDate = verification?.verified_at ? new Date(verification.verified_at) : null
  const hasVerificationDetails = Boolean(verification?.cedula && verifiedDate)

  return (
    <Card className="surface-panel overflow-hidden rounded-[28px] p-0 transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(15,37,95,0.24)]">
      <div className="grid gap-0 lg:grid-cols-[1fr_230px]">
        <div className="border-b border-border/70 p-5 lg:border-b-0 lg:border-r">
          <div className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[22px] bg-[linear-gradient(145deg,hsl(var(--surface-soft)),hsl(var(--surface-tint)))] ring-1 ring-white/70">
              {doctor.profile?.photo_url ? (
                <Image
                  src={doctor.profile.photo_url}
                  alt={name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-[hsl(var(--brand-ocean))]">
                  {initials}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  {formatDoctorName(name)}
                </h3>
                {isVerified ? (
                  <Badge variant="success" className="normal-case tracking-normal">
                    Verificado SEP
                  </Badge>
                ) : (
                  <Badge variant="outline" className="normal-case tracking-normal">
                    Perfil aprobado
                  </Badge>
                )}
              </div>

              <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                {doctor.specialties[0]?.name || 'Especialidad médica'}
                {doctor.city ? ` · ${doctor.city}` : ''}
                {doctor.state ? `, ${doctor.state}` : ''}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[hsl(var(--public-muted))]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                  {doctor.rating_count.toLocaleString('es-MX')} reseñas
                </span>
                {doctor.years_experience ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                    {doctor.years_experience} años
                  </span>
                ) : null}
                {doctor.offers_video || doctor.video_enabled ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                    Videoconsulta
                  </span>
                ) : null}
                {doctor.offers_in_person ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                    Presencial
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {hasVerificationDetails ? (
              <VerificationBadge
                doctorId={doctor.id}
                cedula={doctor.verification.cedula}
                verifiedDate={verifiedDate as Date}
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

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <p className="text-sm leading-6 text-[hsl(var(--public-muted))]">
              {doctor.bio || 'Perfil médico verificado y listo para consulta.'}
            </p>
            {doctor.license_number ? (
              <div className="rounded-[var(--public-radius-control)] border border-border bg-[hsl(var(--surface-quiet))] px-3 py-2 text-sm text-[hsl(var(--public-muted))]">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                  Cédula
                </span>
                <p className="mt-1 font-semibold text-[hsl(var(--public-ink))]">{doctor.license_number}</p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,hsl(var(--surface-tint))_0%,hsl(var(--surface-quiet))_100%)] p-5">
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="rounded-[var(--public-radius-control)] border border-border bg-card p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                Reputación
              </p>
              <div className="mt-2 flex items-center gap-2">
                <StarMeter rating={doctor.rating_avg} />
                <span className="text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                  {doctor.rating_avg.toFixed(1)}
                </span>
              </div>
              <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                {doctor.rating_count.toLocaleString('es-MX')} reseñas completadas
              </p>
            </div>

            <div className="rounded-[var(--public-radius-control)] border border-border bg-card p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                Consulta desde
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                {formatCurrency(doctor.price_cents, doctor.currency)}
              </p>
            </div>

            <div className="grid gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={`/doctors/${doctor.id}`}>Ver perfil</Link>
              </Button>
              <Button asChild variant="hero" className="w-full">
                <Link href={`/book/${doctor.id}`}>
                  Agendar cita
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function StarMeter({ rating }: { rating: number }) {
  const fullStars = Math.round(rating)

  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {[...Array(5)].map((_, index) => (
        <StarFill key={index} active={index < fullStars} />
      ))}
    </div>
  )
}

function StarFill({ active }: { active: boolean }) {
  return (
    <StarIcon
      className={active ? 'text-[hsl(var(--brand-gold))]' : 'text-[hsl(var(--border))]'}
    />
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 fill-current ${className || ''}`} viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export function DoctorsDirectoryClient({
  doctors,
  specialties,
  params,
}: DoctorsDirectoryClientProps) {
  const router = useRouter()
  const [sortValue, setSortValue] = useState<PageParams['sortBy']>(params.sortBy || 'relevance')

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
    const specialty = specialties.find((specialtyItem) => specialtyItem.slug === params.specialty)
    return specialty ? `${specialty.name} en México` : 'Doctores y especialistas verificados'
  }, [params.search, params.city, params.specialty, specialties])

  const activeFilters = [
    params.specialty ? specialties.find((item) => item.slug === params.specialty)?.name : null,
    params.city || null,
    params.appointmentType && params.appointmentType !== 'all'
      ? params.appointmentType === 'video'
        ? 'Videoconsulta'
        : 'Presencial'
      : null,
  ].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--surface-quiet))_0%,hsl(var(--card))_100%)]">
      <header className="sticky top-0 z-[200] border-b border-border bg-card/92 backdrop-blur-xl">
        <div className="editorial-shell">
          <div className="flex min-h-16 items-center justify-between gap-4 py-3">
            <Link
              href="/"
              className="shrink-0 rounded-lg transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Doctor.mx - Inicio"
            >
              <DoctorMxLogo markClassName="h-8 w-8" textClassName="text-[1.05rem]" />
            </Link>

            <form
              action="/doctors"
              className="hidden flex-1 items-center gap-3 rounded-[var(--public-radius-control)] border border-border bg-[hsl(var(--surface-quiet))] px-3 py-2.5 lg:flex"
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
              <Search className="h-4 w-4 shrink-0 text-[hsl(var(--public-muted))]" />
              <input
                name="search"
                type="text"
                placeholder="Especialidad o doctor"
                defaultValue={params.search || ''}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--public-muted))/0.72]"
              />
              <div className="h-5 w-px bg-border" />
              <input
                name="city"
                type="text"
                placeholder="Ciudad"
                defaultValue={params.city || ''}
                className="w-44 bg-transparent text-sm outline-none placeholder:text-[hsl(var(--public-muted))/0.72]"
              />
              <Button type="submit" variant="hero" size="sm">
                Buscar
              </Button>
            </form>

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                onClick={() => {
                  const search = window.prompt('Buscar doctor o especialidad', params.search || '')
                  if (search !== null) {
                    const nextSearch = search.trim()
                    router.push(`/doctors${buildQuery({ search: nextSearch || undefined })}`)
                  }
                }}
                aria-label="Buscar"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-quiet))_100%)]">
        <div className="editorial-shell py-6">
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div className="space-y-3">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--brand-ocean))]">
                Directorio verificado
              </p>
              <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[hsl(var(--public-ink))]">
                {heading}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-[hsl(var(--public-muted))]">
                Filtros honestos, perfiles con evidencia y CTA claros. Sin mapa decorativo ni fechas inventadas.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/doctors">Limpiar filtros</Link>
                </Button>
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="luxe" className="normal-case tracking-normal">
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>

            <Card className="surface-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                    Ordenar
                  </p>
                  <p className="mt-1 text-sm text-[hsl(var(--public-muted))]">
                    {doctors.length.toLocaleString('es-MX')} resultados visibles
                  </p>
                </div>
                <Filter className="h-4 w-4 text-[hsl(var(--brand-ocean))]" aria-hidden="true" />
              </div>

              <select
                value={sortValue || 'relevance'}
                onChange={(event) => {
                  const nextValue = event.target.value as PageParams['sortBy']
                  setSortValue(nextValue)
                  router.push(`/doctors${buildQuery({ sortBy: nextValue })}`)
                }}
                className="mt-4 w-full rounded-[var(--public-radius-control)] border border-border bg-card px-3 py-2 text-sm outline-none"
              >
                <option value="relevance">Relevancia</option>
                <option value="rating">Calificación</option>
                <option value="price_asc">Precio ↑</option>
                <option value="price_desc">Precio ↓</option>
                <option value="experience">Experiencia</option>
              </select>
            </Card>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Todos"
                href={`/doctors${buildQuery({ specialty: undefined, appointmentType: undefined })}`}
                active={!params.specialty && (!params.appointmentType || params.appointmentType === 'all')}
              />
              <FilterChip
                label="Videoconsulta"
                href={`/doctors${buildQuery({ appointmentType: params.appointmentType === 'video' ? undefined : 'video' })}`}
                active={params.appointmentType === 'video'}
              />
              <FilterChip
                label="Presencial"
                href={`/doctors${buildQuery({ appointmentType: params.appointmentType === 'in_person' ? undefined : 'in_person' })}`}
                active={params.appointmentType === 'in_person'}
              />
              {specialties.slice(0, 6).map((specialty) => (
                <FilterChip
                  key={specialty.id}
                  label={specialty.name}
                  href={`/doctors${buildQuery({ specialty: params.specialty === specialty.slug ? undefined : specialty.slug })}`}
                  active={params.specialty === specialty.slug}
                />
              ))}
            </div>

            <div className="text-sm text-[hsl(var(--public-muted))]">
              Los filtros actualizan los resultados de forma directa.
            </div>
          </div>
        </div>
      </section>

      <main className="editorial-shell py-6 sm:py-8">
        <div className="space-y-4">
          {doctors.length === 0 ? (
            <Card className="surface-panel rounded-[28px] p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                <Search className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold text-[hsl(var(--public-ink))]">No encontramos doctores</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[hsl(var(--public-muted))]">
                Prueba con otra especialidad, ciudad o modalidad. Si no hay dato, es mejor mostrar vacío que inventar disponibilidad.
              </p>
            </Card>
          ) : (
            doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)
          )}
        </div>
      </main>
    </div>
  )
}
