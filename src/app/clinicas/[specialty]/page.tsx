import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClinics } from '@/lib/clinics'
import { getAvailableSpecialties } from '@/lib/discovery'
import { getMajorCities } from '@/lib/locations'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { MapPin, Star, Building2, ArrowUpRight, ShieldCheck } from 'lucide-react'

interface PageProps {
  params: Promise<{ specialty: string }>
  searchParams: Promise<{ city?: string }>
}

function capitalizeWords(str: string): string {
  return str
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { specialty } = await params
  const specialtyName = capitalizeWords(specialty)

  return {
    title: `Clinicas de ${specialtyName} en Mexico | Doctor.mx`,
    description: `Directorio de clinicas y hospitales especializados en ${specialtyName} en Mexico. Encuentra centros medicos verificados y agenda tu cita.`,
    openGraph: {
      title: `Clinicas de ${specialtyName} en Mexico | Doctor.mx`,
      description: `Directorio de clinicas especializadas en ${specialtyName} en Mexico.`,
      type: 'website',
      locale: 'es_MX',
    },
    alternates: {
      canonical: `/clinicas/${specialty}`,
    },
  }
}

export default async function ClinicsBySpecialtyPage({ params, searchParams }: PageProps) {
  const [{ specialty }, query] = await Promise.all([params, searchParams])
  const specialtyName = capitalizeWords(specialty)

  const [clinics, specialties, cities] = await Promise.all([
    getClinics({ specialtySlug: specialty, citySlug: query.city }),
    getAvailableSpecialties(),
    getMajorCities(),
  ])

  // Verify the specialty exists
  const specialtyExists = specialties.some((s: { slug: string }) => s.slug === specialty)
  if (!specialtyExists) {
    // Don't 404, just show empty state
  }

  const buildQuery = (newParams: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    if (query.city) sp.set('city', query.city)
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) sp.set(key, value)
      else sp.delete(key)
    })
    const qs = sp.toString()
    return qs ? `?${qs}` : ''
  }

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
          {' / '}
          <span className="text-[hsl(var(--text-primary))] font-medium">{specialtyName}</span>
        </nav>

        {/* Hero */}
        <section className="surface-panel-strong overflow-hidden public-panel sm:px-8 lg:px-10 lg:py-10">
          <div className="space-y-6">
            <Badge variant="secondary">Clinicas especializadas</Badge>
            <PublicSectionHeading
              align="left"
              eyebrow="Directorio medico"
              title={`Clinicas de ${specialtyName}`}
              accent="en Mexico"
              description={`Encuentra clinicas y hospitales especializados en ${specialtyName.toLowerCase()}. Centros medicos verificados con doctores certificados.`}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="surface-panel px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Clinicas encontradas
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">
                  {clinics.length}
                </p>
              </div>
              <div className="surface-panel px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Especialidad
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))]">
                  {specialtyName}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_2.1fr]">
          {/* Sidebar */}
          <Card className="surface-panel border-border/80 p-0 xl:sticky xl:top-28 xl:self-start">
            <div className="border-b border-border/70 px-6 py-5">
              <PublicSectionHeading align="left" eyebrow="Filtros" title="Ciudad" />
            </div>
            <div className="space-y-4 px-6 py-6">
              <div className="flex flex-wrap gap-2">
                <Link href={`/clinicas/${specialty}${buildQuery({ city: undefined })}`}>
                  <Badge variant={!query.city ? 'default' : 'outline'} className="cursor-pointer px-4 py-2">
                    Todas
                  </Badge>
                </Link>
                {cities.map((c: { id: string; slug: string; name: string }) => (
                  <Link key={c.id} href={`/clinicas/${specialty}${buildQuery({ city: c.slug })}`}>
                    <Badge
                      variant={query.city === c.slug ? 'luxe' : 'outline'}
                      className="cursor-pointer px-4 py-2 normal-case tracking-[0.04em]"
                    >
                      {c.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </Card>

          {/* Results */}
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-[hsl(var(--text-secondary))]">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                Clinicas verificadas
              </div>
            </div>

            {clinics.length === 0 ? (
              <Card className="surface-panel text-center py-16">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(145deg,hsl(var(--surface-tint)),hsl(var(--surface-quiet)))]">
                  <Building2 className="h-8 w-8 text-[hsl(var(--brand-ocean))]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))]">
                  No encontramos clinicas de {specialtyName}
                </h3>
                <p className="mx-auto max-w-sm text-[hsl(var(--text-secondary))]">
                  Intenta con otra ciudad o explora todas las clinicas disponibles.
                </p>
                <div className="mt-6">
                  <Link href="/clinicas">
                    <Button variant="secondary">Ver todas las clinicas</Button>
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {clinics.map((clinic) => (
                  <Link
                    key={clinic.id}
                    href={`/clinica/${clinic.slug}`}
                    className="group rounded-2xl focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 outline-none"
                  >
                    <Card className="surface-panel h-full gap-0 overflow-hidden border-border/80 p-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                      <div className="surface-tint px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[linear-gradient(145deg,hsl(var(--surface-quiet)),hsl(var(--surface-tint)))] ring-1 ring-white/60">
                            <Building2 className="h-6 w-6 text-[hsl(var(--brand-ocean))]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-lg font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))] transition-colors group-hover:text-[hsl(var(--brand-ocean))]">
                              {clinic.name}
                            </h3>
                            {clinic.city && (
                              <p className="mt-1 flex items-center gap-1 text-sm text-[hsl(var(--text-secondary))]">
                                <MapPin className="h-3.5 w-3.5" />
                                {clinic.city.name}, {clinic.city.state}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 px-6 py-5">
                        {clinic.specialties && clinic.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {clinic.specialties.slice(0, 3).map((s) => (
                              <Badge key={s.id} variant="outline" className="text-xs px-2 py-0.5">
                                {s.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          {clinic.rating_avg > 0 ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <Star className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" />
                              <span className="font-semibold text-[hsl(var(--text-primary))]">
                                {clinic.rating_avg.toFixed(1)}
                              </span>
                              <span className="text-[hsl(var(--text-secondary))]">
                                ({clinic.rating_count})
                              </span>
                            </div>
                          ) : (
                            <div />
                          )}
                          <Button variant="primary" size="sm" className="px-3">
                            Ver clinica
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SEO Content */}
        <section className="mt-12 surface-panel p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))]">
            Clinicas de {specialtyName} en Mexico
          </h2>
          <div className="mt-4 space-y-3 text-[hsl(var(--text-secondary))] text-sm leading-relaxed">
            <p>
              Encuentra las mejores clinicas y hospitales especializados en {specialtyName.toLowerCase()}{' '}
              en Mexico. Nuestro directorio incluye centros medicos verificados con doctores certificados
              en {specialtyName.toLowerCase()}.
            </p>
            <p>
              Cada clinica ha sido verificada para garantizar la calidad de atencion medica. Puedes ver
              las especialidades disponibles, calificaciones de pacientes y agendar tu cita en linea de
              forma segura.
            </p>
          </div>
        </section>

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MedicalClinic',
              name: `Clinicas de ${specialtyName} en Mexico`,
              description: `Directorio de clinicas especializadas en ${specialtyName} en Mexico`,
            }),
          }}
        />
      </main>
    </div>
  )
}
