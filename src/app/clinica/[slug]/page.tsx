import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClinicBySlug, getClinicDoctors } from '@/lib/clinics'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { formatDoctorName } from '@/lib/utils'
import {
  MapPin,
  Star,
  Phone,
  Globe,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  Video,
  Stethoscope,
  Navigation,
} from 'lucide-react'
import Image from 'next/image'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  // Fetch clinic for metadata without cache issues
  const clinic = await getClinicBySlug(slug)

  if (!clinic) {
    return { title: 'Clinica no encontrada | Doctor.mx' }
  }

  const title = `${clinic.name} | Doctor.mx`
  const description =
    clinic.description ||
    `Informacion de ${clinic.name}. Especialidades, doctores, ubicacion y citas en linea.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'es_MX',
      images: clinic.logo_url ? [{ url: clinic.logo_url }] : undefined,
    },
    alternates: {
      canonical: `/clinica/${slug}`,
    },
  }
}

export default async function ClinicProfilePage({ params }: PageProps) {
  const { slug } = await params

  const clinic = await getClinicBySlug(slug)

  if (!clinic) {
    notFound()
  }

  // Fetch doctors with actual clinic ID
  const clinicDoctors = await getClinicDoctors(clinic.id)

  const specialtyBreadcrumb =
    clinic.specialties && clinic.specialties.length > 0 ? clinic.specialties[0] : null

  return (
    <div className="min-h-screen bg-transparent">
      <main className="editorial-shell py-8 sm:py-10 lg:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-[hsl(var(--text-secondary))]">
          <Link href="/" className="hover:text-[hsl(var(--brand-ocean))]">
            Inicio
          </Link>
          {' / '}
          <Link href="/clinicas" className="hover:text-[hsl(var(--brand-ocean))]">
            Clinicas
          </Link>
          {specialtyBreadcrumb && (
            <>
              {' / '}
              <Link
                href={`/clinicas/${specialtyBreadcrumb.slug}`}
                className="hover:text-[hsl(var(--brand-ocean))]"
              >
                {specialtyBreadcrumb.name}
              </Link>
            </>
          )}
          {clinic.city && (
            <>
              {' / '}
              <Link
                href={`/clinicas/${specialtyBreadcrumb?.slug || ''}/${clinic.city.slug}`}
                className="hover:text-[hsl(var(--brand-ocean))]"
              >
                {clinic.city.name}
              </Link>
            </>
          )}
          {' / '}
          <span className="text-[hsl(var(--text-primary))] font-medium">{clinic.name}</span>
        </nav>

        {/* Clinic Header */}
        <section className="surface-panel-strong overflow-hidden public-panel sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(145deg,hsl(var(--surface-quiet)),hsl(var(--surface-tint)))] ring-1 ring-white/60">
                  {clinic.logo_url && clinic.logo_url.startsWith('http') ? (
                    <Image
                      src={clinic.logo_url}
                      alt={clinic.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover rounded-[1.5rem]"
                    />
                  ) : (
                    <Building2 className="h-10 w-10 text-[hsl(var(--brand-ocean))]" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold tracking-[-0.04em] text-[hsl(var(--text-primary))]">
                      {clinic.name}
                    </h1>
                    {clinic.verified && (
                      <Badge variant="success" className="normal-case tracking-[0.05em]">
                        Verificado
                      </Badge>
                    )}
                  </div>
                  {clinic.address && (
                    <p className="mt-2 flex items-center gap-2 text-[hsl(var(--text-secondary))]">
                      <MapPin className="h-4 w-4" />
                      {clinic.address}
                    </p>
                  )}
                </div>
              </div>

              {clinic.description && (
                <p className="text-[hsl(var(--text-secondary))] leading-relaxed">{clinic.description}</p>
              )}

              {/* Contact Info */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {clinic.phone && (
                  <div className="surface-panel flex items-center gap-3 px-4 py-3">
                    <Phone className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">{clinic.phone}</span>
                  </div>
                )}
                {clinic.website && (
                  <a
                    href={clinic.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="surface-panel flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[hsl(var(--surface-tint))]"
                  >
                    <Globe className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                    <span className="text-sm text-[hsl(var(--brand-ocean))]">Sitio web</span>
                    <ArrowUpRight className="h-3 w-3 text-[hsl(var(--text-soft))]" />
                  </a>
                )}
                {clinic.city && (
                  <div className="surface-panel flex items-center gap-3 px-4 py-3">
                    <Navigation className="h-4 w-4 text-[hsl(var(--brand-ocean))]" />
                    <span className="text-sm text-[hsl(var(--text-primary))]">
                      {clinic.city.name}, {clinic.city.state}
                    </span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {clinic.rating_avg > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(clinic.rating_avg)
                            ? 'fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]'
                            : 'text-[hsl(var(--text-soft))]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                    {clinic.rating_avg.toFixed(1)}
                  </span>
                  <span className="text-sm text-[hsl(var(--text-secondary))]">
                    ({clinic.rating_count} resenas)
                  </span>
                </div>
              )}
            </div>

            {/* Map Placeholder */}
            {clinic.latitude && clinic.longitude && (
              <div className="flex-shrink-0">
                <div className="h-48 w-full lg:h-64 lg:w-80 rounded-2xl bg-[hsl(var(--surface-quiet))] border border-border/50 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-[hsl(var(--brand-ocean))] mx-auto mb-2" />
                    <p className="text-sm text-[hsl(var(--text-secondary))]">
                      {clinic.latitude}, {clinic.longitude}
                    </p>
                    <p className="text-xs text-[hsl(var(--text-soft))] mt-1">Mapa interactivo</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Specialties Offered */}
        {clinic.specialties && clinic.specialties.length > 0 && (
          <section className="mt-8">
            <PublicSectionHeading
              align="left"
              eyebrow="Especialidades"
              title="Especialidades medicas"
              accent="disponibles"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {clinic.specialties.map((s) => (
                <Link key={s.id} href={`/clinicas/${s.slug}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer px-4 py-2 text-sm hover:bg-[hsl(var(--surface-tint))] transition-colors"
                  >
                    {s.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Doctors at this Clinic */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <PublicSectionHeading
              align="left"
              eyebrow="Doctores"
              title="Doctores en esta clinica"
              accent={`${clinicDoctors.length} profesional${clinicDoctors.length !== 1 ? 'es' : ''}`}
            />
          </div>

          {clinicDoctors.length === 0 ? (
            <Card className="surface-panel text-center py-12 mt-4">
              <Stethoscope className="h-8 w-8 text-[hsl(var(--brand-ocean))] mx-auto mb-3" />
              <p className="text-[hsl(var(--text-secondary))]">
                No hay doctores listados en esta clinica aun. Busca doctores en el directorio general.
              </p>
              <div className="mt-4">
                <Link href="/doctors">
                  <Button variant="outline">Buscar doctores</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {clinicDoctors.map((cd) => (
                <Card
                  key={cd.id}
                  className="surface-panel gap-0 border-border/80 p-0 overflow-hidden"
                >
                  <div className="surface-tint px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 overflow-hidden rounded-[1rem] bg-[linear-gradient(145deg,hsl(var(--surface-quiet)),hsl(var(--surface-tint)))] ring-1 ring-white/60">
                          {cd.doctor.profile?.photo_url ? (
                            <Image
                              src={cd.doctor.profile.photo_url}
                              alt={cd.doctor.profile.full_name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Stethoscope className="h-5 w-5 text-[hsl(var(--brand-ocean))]" />
                            </div>
                          )}
                        </div>
                        {cd.is_primary && (
                          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-[hsl(var(--brand-ocean))] text-white">
                            <ShieldCheck className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold tracking-[-0.02em] text-[hsl(var(--text-primary))]">
                          {formatDoctorName(cd.doctor.profile?.full_name)}
                        </h3>
                        {cd.doctor.specialties && cd.doctor.specialties.length > 0 && (
                          <p className="text-sm text-[hsl(var(--brand-ocean))]">
                            {cd.doctor.specialties.map((s) => s.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <div className="flex flex-wrap gap-3 text-sm text-[hsl(var(--text-secondary))]">
                      {cd.doctor.years_experience && (
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--text-soft))]" />
                          {cd.doctor.years_experience} anos de experiencia
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Video className="h-3.5 w-3.5 text-[hsl(var(--text-soft))]" />
                        {cd.doctor.video_enabled ? 'Videoconsulta' : 'Presencial'}
                      </span>
                      {cd.room_number && (
                        <span>Consultorio {cd.room_number}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="text-xs text-[hsl(var(--text-soft))]">Tarifa base</p>
                        <p className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                          ${(cd.doctor.price_cents / 100).toLocaleString('es-MX')}
                          <span className="text-sm font-normal text-[hsl(var(--text-secondary))]"> MXN</span>
                        </p>
                      </div>
                      <Link href={`/book/${cd.doctor.id}`}>
                        <Button variant="hero" size="sm">
                          Agendar cita
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>

                    {cd.doctor.rating_avg > 0 && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <Star className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" />
                        <span className="font-semibold text-[hsl(var(--text-primary))]">
                          {cd.doctor.rating_avg.toFixed(1)}
                        </span>
                        <span className="text-[hsl(var(--text-secondary))]">
                          ({cd.doctor.rating_count} resenas)
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Rating and Reviews Section */}
        <section className="mt-8 surface-panel p-6 sm:p-8">
          <PublicSectionHeading
            align="left"
            eyebrow="Resenas"
            title="Opiniones de pacientes"
          />
          {clinic.rating_avg > 0 ? (
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-[hsl(var(--text-primary))]">
                  {clinic.rating_avg.toFixed(1)}
                </p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(clinic.rating_avg)
                          ? 'fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]'
                          : 'text-[hsl(var(--text-soft))]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                  {clinic.rating_count} resenas
                </p>
              </div>
              <div className="flex-1 text-[hsl(var(--text-secondary))] text-sm">
                <p>
                  Las resenas de esta clinica reflejan la experiencia de pacientes reales que han
                  recibido atencion medica en las instalaciones.
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-[hsl(var(--text-secondary))] text-sm">
              Esta clinica aun no cuenta con resenas. Si has sido paciente, comparte tu experiencia.
            </p>
          )}
        </section>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalClinic',
              name: clinic.name,
              description: clinic.description || `${clinic.name} - Clinica en Mexico`,
              address: {
                '@type': 'PostalAddress',
                streetAddress: clinic.address,
                addressLocality: clinic.city?.name,
                addressRegion: clinic.city?.state,
                addressCountry: 'MX',
              },
              telephone: clinic.phone,
              url: clinic.website,
              aggregateRating: clinic.rating_avg > 0 ? {
                '@type': 'AggregateRating',
                ratingValue: clinic.rating_avg,
                reviewCount: clinic.rating_count,
                bestRating: 5,
              } : undefined,
              geo: clinic.latitude && clinic.longitude ? {
                '@type': 'GeoCoordinates',
                latitude: clinic.latitude,
                longitude: clinic.longitude,
              } : undefined,
              image: clinic.logo_url || undefined,
            }),
          }}
        />
      </main>
    </div>
  )
}
