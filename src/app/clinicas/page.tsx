import { Metadata } from 'next'
import Link from 'next/link'
import { getClinics } from '@/lib/clinics'
import { getAvailableSpecialties } from '@/lib/discovery'
import { getMajorCities } from '@/lib/locations'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { MapPin, Star, Phone, Globe, Building2, Search, ShieldCheck, ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Clinicas y Hospitales en Mexico | Doctor.mx',
  description:
    'Encuentra clinicas y hospitales verificados en Mexico. Filtra por especialidad, ciudad y calificacion. Agenda tu cita en linea.',
  openGraph: {
    title: 'Clinicas y Hospitales en Mexico | Doctor.mx',
    description:
      'Encuentra clinicas y hospitales verificados en Mexico. Filtra por especialidad, ciudad y calificacion.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/clinicas',
  },
}

export default async function ClinicasPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; city?: string; q?: string }>
}) {
  const params = await searchParams

  const [clinics, specialties, cities] = await Promise.all([
    getClinics({
      specialtySlug: params.specialty,
      citySlug: params.city,
    }),
    getAvailableSpecialties(),
    getMajorCities(),
  ])

  const buildQuery = (newParams: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    if (params.specialty) sp.set('specialty', params.specialty)
    if (params.city) sp.set('city', params.city)
    if (params.q) sp.set('q', params.q)
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
        {/* Hero Section */}
        <section className="surface-panel-strong overflow-hidden public-panel sm:px-8 lg:px-10 lg:py-10">
          <div className="max-w-4xl space-y-6">
            <Badge variant="secondary">Directorio de clinicas verificado</Badge>
            <PublicSectionHeading
              align="left"
              eyebrow="Directorio medico"
              title="Clinicas y hospitales"
              accent="en Mexico"
              description="Encuentra centros medicos verificados con doctores certificados. Filtra por especialidad y ciudad para encontrar la atencion que necesitas."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="surface-panel px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Clinicas activas
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">
                  {clinics.length}
                </p>
              </div>
              <div className="surface-panel px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Especialidades
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">
                  {specialties.length}
                </p>
              </div>
              <div className="surface-panel px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Ciudades
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">
                  {cities.length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_2.1fr]">
          {/* Sidebar Filters */}
          <Card className="surface-panel border-border/80 p-0 xl:sticky xl:top-28 xl:self-start">
            <div className="border-b border-border/70 px-6 py-5">
              <PublicSectionHeading
                align="left"
                eyebrow="Refinar busqueda"
                title="Filtra por especialidad"
                accent="y ciudad"
              />
            </div>

            <div className="space-y-6 px-6 py-6">
              <form action="/clinicas" method="GET" className="space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Buscar clinica
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-soft))]" />
                  <Input
                    type="search"
                    name="q"
                    placeholder="Ej. Hospital Angeles, Star Medica"
                    defaultValue={params.q}
                    className="h-12 rounded-2xl border-border/80 bg-[hsl(var(--surface-quiet))] pl-11"
                  />
                </div>
                {params.specialty && <input type="hidden" name="specialty" value={params.specialty} />}
                {params.city && <input type="hidden" name="city" value={params.city} />}
                <Button variant="primary" className="w-full justify-center">
                  Buscar clinicas
                </Button>
              </form>

              {/* Specialty Filter */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Especialidades
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/clinicas${buildQuery({ specialty: undefined })}`}>
                    <Badge
                      variant={!params.specialty ? 'default' : 'outline'}
                      className="cursor-pointer px-4 py-2"
                    >
                      Todas
                    </Badge>
                  </Link>
                  {specialties.map((s: { id: string; slug: string; name: string }) => (
                    <Link key={s.id} href={`/clinicas${buildQuery({ specialty: s.slug })}`}>
                      <Badge
                        variant={params.specialty === s.slug ? 'luxe' : 'outline'}
                        className="cursor-pointer px-4 py-2 normal-case tracking-[0.04em]"
                      >
                        {s.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {/* City Filter */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Ciudades principales
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/clinicas${buildQuery({ city: undefined })}`}>
                    <Badge
                      variant={!params.city ? 'default' : 'outline'}
                      className="cursor-pointer px-4 py-2"
                    >
                      Todas
                    </Badge>
                  </Link>
                  {cities.map((c: { id: string; slug: string; name: string }) => (
                    <Link key={c.id} href={`/clinicas${buildQuery({ city: c.slug })}`}>
                      <Badge
                        variant={params.city === c.slug ? 'luxe' : 'outline'}
                        className="cursor-pointer px-4 py-2 normal-case tracking-[0.04em]"
                      >
                        {c.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Results Grid */}
          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Resultados
                </p>
                <div className="mt-2">
                  <PublicSectionHeading
                    align="left"
                    title={`${clinics.length} clinica${clinics.length !== 1 ? 's' : ''}`}
                    accent={`encontrada${clinics.length !== 1 ? 's' : ''}`}
                  />
                </div>
              </div>
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
                  No encontramos clinicas
                </h3>
                <p className="mx-auto max-w-sm text-[hsl(var(--text-secondary))]">
                  Intenta con otra especialidad o ciudad. Tambien puedes buscar doctores directamente.
                </p>
                <div className="mt-6">
                  <Link href="/doctors">
                    <Button variant="secondary">Buscar doctores</Button>
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
                          <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(145deg,hsl(var(--surface-quiet)),hsl(var(--surface-tint)))] ring-1 ring-white/60">
                            <Building2 className="h-7 w-7 text-[hsl(var(--brand-ocean))]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))] transition-colors group-hover:text-[hsl(var(--brand-ocean))]">
                                {clinic.name}
                              </h3>
                              {clinic.verified && (
                                <Badge variant="success" className="normal-case tracking-[0.05em]">
                                  Verificado
                                </Badge>
                              )}
                            </div>
                            {clinic.city && (
                              <p className="mt-1 flex items-center gap-1 text-sm text-[hsl(var(--text-secondary))]">
                                <MapPin className="h-3.5 w-3.5" />
                                {clinic.city.name}, {clinic.city.state}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 px-6 py-5">
                        {clinic.address && (
                          <p className="text-sm text-[hsl(var(--text-secondary))]">{clinic.address}</p>
                        )}

                        {clinic.specialties && clinic.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {clinic.specialties.slice(0, 4).map((s) => (
                              <Badge key={s.id} variant="outline" className="text-xs px-2 py-0.5">
                                {s.name}
                              </Badge>
                            ))}
                            {clinic.specialties.length > 4 && (
                              <Badge variant="outline" className="text-xs px-2 py-0.5">
                                +{clinic.specialties.length - 4} mas
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          {clinic.rating_avg > 0 ? (
                            <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--surface-soft))] px-3 py-2 text-sm">
                              <Star className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" />
                              <span className="font-semibold text-[hsl(var(--text-primary))]">
                                {clinic.rating_avg.toFixed(1)}
                              </span>
                              <span className="text-[hsl(var(--text-secondary))]">
                                ({clinic.rating_count} resenas)
                              </span>
                            </div>
                          ) : (
                            <div />
                          )}
                          <Button variant="primary" size="sm" className="px-4">
                            Ver clinica
                            <ArrowUpRight className="h-4 w-4" />
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
            Clinicas y hospitales en Mexico
          </h2>
          <div className="mt-4 space-y-3 text-[hsl(var(--text-secondary))] text-sm leading-relaxed">
            <p>
              Doctor.mx es el directorio de clinicas y hospitales mas completo de Mexico. Encuentra
              centros medicos verificados con doctores certificados en todo el pais.
            </p>
            <p>
              Nuestro directorio incluye hospitales privados de alta especialidad, clinicas publicas y
              centros medicos especializados. Cada clinica listada ha sido verificada para garantizar la
              calidad de atencion medica.
            </p>
            <p>
              Filtra por especialidad medica, ciudad o nombre para encontrar la clinica que necesitas.
              Agenda tu cita en linea de forma segura y rapida.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
