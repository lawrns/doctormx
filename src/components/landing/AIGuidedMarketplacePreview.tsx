'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, HeartPulse, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    profile: { id: 'sample-paula-profile', full_name: 'Paula Ramirez', photo_url: 'https://i.pravatar.cc/320?img=47' },
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
    profile: { id: 'sample-rodrigo-profile', full_name: 'Rodrigo Vazquez', photo_url: 'https://i.pravatar.cc/320?img=12' },
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
    profile: { id: 'sample-ana-profile', full_name: 'Ana Lopez', photo_url: 'https://i.pravatar.cc/320?img=32' },
    specialties: [{ id: 'gine', name: 'Ginecología', slug: 'ginecologia' }],
  },
]

export function AIGuidedMarketplacePreview({ trustData }: AIGuidedMarketplacePreviewProps) {
  const doctors = trustData?.featuredDoctors.length ? trustData.featuredDoctors.slice(0, 3) : fallbackDoctors
  const review = trustData?.reviewHighlights[0]

  return (
    <section className="border-b border-[#d9e3f5] bg-[#edf4ff] py-10 sm:py-12">
      <div className="editorial-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1fr_0.82fr] lg:items-start">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f48de]">
                  Explora si ya sabes qué necesitas
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#071a4e]">
                  Especialidades
                </h2>
              </div>
              <Link href="/specialties" className="text-sm font-semibold text-[#1f48de]">
                Ver todas
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.name}
                  href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                  className="rounded-[14px] border border-[#d7e3f6] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,37,95,0.04)] transition hover:-translate-y-0.5 hover:border-[#b9cff6]"
                >
                  <HeartPulse className="mb-3 h-5 w-5 text-[#1f48de]" aria-hidden="true" />
                  <span className="block text-sm font-semibold text-[#071a4e]">{specialty.name}</span>
                  <span className="mt-1 block text-xs text-[#5c6783]">{specialty.count}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f48de]">
                  Médicos recomendados por el flujo
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-[#071a4e]">
                  Verificados para reservar
                </h2>
              </div>
              <Link href="/doctors" className="inline-flex items-center gap-1 text-sm font-semibold text-[#1f48de]">
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
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1f48de]">
              Lo que dicen pacientes
            </p>
            <div className="mt-4 rounded-[22px] border border-[#d7e3f6] bg-white p-6 shadow-[0_20px_50px_-36px_rgba(15,37,95,0.45)]">
              <div className="text-5xl leading-none text-[#9fc0ff]">“</div>
              <p className="mt-2 text-base italic leading-7 text-[#071a4e]">
                {review?.comment ||
                  'Me ayudó a explicar mis síntomas y entender qué especialista necesitaba antes de reservar.'}
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full bg-[#eaf2ff]">
                  {review?.patientPhotoUrl ? (
                    <Image src={review.patientPhotoUrl} alt={review.patientName} fill sizes="44px" className="object-cover" />
                  ) : (
                    <Image src="https://i.pravatar.cc/120?img=5" alt="Paciente verificada" fill sizes="44px" className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#071a4e]">{review?.patientName || 'María Fernanda G.'}</p>
                  <p className="flex items-center gap-1.5 text-xs text-[#5c6783]">
                    Paciente verificada
                    <BadgeCheck className="h-3.5 w-3.5 text-[#1f48de]" aria-hidden="true" />
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-1 text-[#ffb020]" aria-label="Calificación 5 de 5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                ))}
              </div>
            </div>
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
      className="group overflow-hidden rounded-[16px] border border-[#d7e3f6] bg-white shadow-[0_1px_2px_rgba(15,37,95,0.05)] transition hover:-translate-y-0.5 hover:border-[#b9cff6]"
    >
      <div className="relative h-32 bg-[#eaf2ff]">
        {doctor.profile?.photo_url ? (
          <Image src={doctor.profile.photo_url} alt={doctor.profile.full_name} fill sizes="220px" className="object-cover" />
        ) : null}
        <span className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#1f48de] text-white ring-2 ring-white">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-[#071a4e]">{formatDoctorName(doctor.profile?.full_name)}</h3>
        <p className="mt-1 text-xs text-[#5c6783]">{doctor.specialties[0]?.name || 'Especialidad médica'}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-[#5c6783]">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {[doctor.city, doctor.state].filter(Boolean).join(', ') || 'México'}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-[#071a4e]">{formatCurrency(doctor.price_cents, doctor.currency)}</span>
          <span className="flex items-center gap-1 text-[#5c6783]">
            <Star className="h-3.5 w-3.5 fill-[#ffb020] text-[#ffb020]" aria-hidden="true" />
            {doctor.rating_avg.toFixed(1)}
          </span>
        </div>
        <Button asChild variant="outline" size="sm" className="mt-3 h-8 w-full rounded-[10px] text-xs">
          <span>Ver disponibilidad</span>
        </Button>
      </div>
    </Link>
  )
}
