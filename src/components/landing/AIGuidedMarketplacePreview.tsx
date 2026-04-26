'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, HeartPulse, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency, formatDoctorName } from '@/lib/utils'
import type { PublicLandingData } from '@/lib/public-trust'

type AIGuidedMarketplacePreviewProps = {
  trustData?: PublicLandingData | null
}

const specialties = [
  { name: 'Dermatología', count: 'Piel, cabello y uñas' },
  { name: 'Ginecología', count: 'Salud femenina' },
  { name: 'Psicología', count: 'Salud mental' },
  { name: 'Medicina general', count: 'Primer contacto' },
  { name: 'Pediatría', count: 'Niños y adolescentes' },
  { name: 'Cardiología', count: 'Corazón y presión' },
]

const fallbackDoctors: PublicLandingData['featuredDoctors'] = [
  {
    id: 'sample-paula',
    status: 'approved',
    bio: null,
    languages: ['es'],
    years_experience: 11,
    city: 'CDMX',
    state: 'CDMX',
    country: 'MX',
    price_cents: 65000,
    currency: 'MXN',
    rating_avg: 4.9,
    rating_count: 214,
    license_number: '12345678',
    video_enabled: true,
    office_address: null,
    offers_video: true,
    offers_in_person: true,
    verification: { cedula: '12345678', sep_verified: true, verified_at: null, institution: 'UNAM' },
    profile: { id: 'sample-paula-profile', full_name: 'Paula Ramirez', photo_url: null },
    specialties: [{ id: 'derma', name: 'Dermatología', slug: 'dermatologia' }],
  },
  {
    id: 'sample-rodrigo',
    status: 'approved',
    bio: null,
    languages: ['es'],
    years_experience: 14,
    city: 'Monterrey',
    state: 'NL',
    country: 'MX',
    price_cents: 85000,
    currency: 'MXN',
    rating_avg: 4.8,
    rating_count: 187,
    license_number: '87654321',
    video_enabled: true,
    office_address: null,
    offers_video: true,
    offers_in_person: false,
    verification: { cedula: '87654321', sep_verified: true, verified_at: null, institution: 'UANL' },
    profile: { id: 'sample-rodrigo-profile', full_name: 'Rodrigo Vazquez', photo_url: null },
    specialties: [{ id: 'cardio', name: 'Cardiología', slug: 'cardiologia' }],
  },
  {
    id: 'sample-ana',
    status: 'approved',
    bio: null,
    languages: ['es'],
    years_experience: 9,
    city: 'Guadalajara',
    state: 'JAL',
    country: 'MX',
    price_cents: 72000,
    currency: 'MXN',
    rating_avg: 4.9,
    rating_count: 342,
    license_number: '11223344',
    video_enabled: true,
    office_address: null,
    offers_video: true,
    offers_in_person: true,
    verification: { cedula: '11223344', sep_verified: true, verified_at: null, institution: 'UdeG' },
    profile: { id: 'sample-ana-profile', full_name: 'Ana Lopez', photo_url: null },
    specialties: [{ id: 'gine', name: 'Ginecología', slug: 'ginecologia' }],
  },
]

export function AIGuidedMarketplacePreview({ trustData }: AIGuidedMarketplacePreviewProps) {
  const doctors = trustData?.featuredDoctors.length ? trustData.featuredDoctors.slice(0, 3) : fallbackDoctors
  const review = trustData?.reviewHighlights[0]

  return (
    <section className="border-b border-[#d9e3f5] bg-[#edf4ff] public-section-compact">
      <div className="editorial-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1fr_0.82fr] lg:items-start">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
                  Explora si ya sabes qué necesitas
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#071a4e]">
                  Especialidades
                </h2>
              </div>
              <Link href="/specialties" className="text-sm font-semibold text-[#0d72d6]">
                Ver todas
              </Link>
            </div>

            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
              {specialties.map((specialty) => (
                <Card
                  key={specialty.name}
                  asChild
                  variant="interactive"
                  density="compact"
                >
                  <Link href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`} className="flex items-center gap-3" aria-label={`Ver médicos de ${specialty.name}`}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#e8f3ff] text-[#0d72d6]">
                      <HeartPulse className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold leading-5 text-[#071a4e]">{specialty.name}</span>
                      <span className="mt-0.5 block text-[13px] leading-5 text-[#5c6783]">{specialty.count}</span>
                    </span>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
                  Médicos recomendados por el flujo
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#071a4e]">
                  Verificados para reservar
                </h2>
              </div>
              <Link href="/doctors" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0d72d6]">
                Ver todos
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {doctors.map((doctor) => (
                <DoctorPreviewCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0d72d6]">
              Lo que dicen pacientes
            </p>
            <Card variant="testimonial" density="compact" className="mt-4">
              <div className="text-5xl leading-none text-[#9fc0ff]">“</div>
              <p className="mt-2 text-base italic leading-7 text-[#071a4e]">
                {review?.comment ||
                  'Me ayudó a explicar mis síntomas y entender qué especialista necesitaba antes de reservar.'}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#eaf2ff]">
                  {review?.patientPhotoUrl ? (
                    <Image src={review.patientPhotoUrl} alt={review.patientName} fill sizes="44px" className="object-cover" />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#071a4e]">{review?.patientName || 'María Fernanda G.'}</p>
                  <p className="flex items-center gap-1.5 text-xs text-[#5c6783]">
                    Paciente verificada
                    <BadgeCheck className="h-3.5 w-3.5 text-[#0d72d6]" aria-hidden="true" />
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-1 text-[#ffb020]" aria-label="Calificación 5 de 5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

function DoctorPreviewCard({ doctor }: { doctor: PublicLandingData['featuredDoctors'][number] }) {
  const href = doctor.id.startsWith('sample-') ? '/doctors' : `/doctors/${doctor.id}`

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[var(--card-radius-standard)] border border-[var(--card-border)] bg-white shadow-[var(--card-shadow)] transition hover:-translate-y-px hover:border-primary/18 hover:shadow-[var(--card-shadow-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:hover:translate-y-0"
    >
      <div className="relative aspect-[4/3] bg-[#eaf2ff]">
        {doctor.profile?.photo_url ? (
          <Image src={doctor.profile.photo_url} alt={doctor.profile.full_name} fill sizes="220px" className="object-cover" />
        ) : null}
        <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0d72d6] text-white ring-2 ring-white">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-[#071a4e]">{formatDoctorName(doctor.profile?.full_name)}</h3>
        <p className="mt-1 text-xs text-[#5c6783]">{doctor.specialties[0]?.name || 'Especialidad médica'}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#5c6783]">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {[doctor.city, doctor.state].filter(Boolean).join(', ') || 'México'}
        </p>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[#071a4e]">{formatCurrency(doctor.price_cents, doctor.currency)}</span>
          <span className="flex items-center gap-1 text-[#5c6783]">
            <Star className="h-3.5 w-3.5 fill-[#ffb020] text-[#ffb020]" aria-hidden="true" />
            {doctor.rating_avg.toFixed(1)}
          </span>
        </div>
        <Button asChild variant="secondary" size="sm" className="mt-3 h-8 w-full rounded-[8px] text-xs">
          <span>Ver disponibilidad</span>
        </Button>
      </div>
    </Link>
  )
}
