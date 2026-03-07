import { discoverDoctors, getAvailableSpecialties } from '@/lib/discovery'
import { formatDoctorName } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { EmptyState } from '@/components/EmptyState'
import { Input } from '@/components/ui/input'
import { ArrowUpRight, MapPin, Search, ShieldCheck, Star, Stethoscope, Video } from 'lucide-react'
import { SortSelect } from '@/components/SortSelect'

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{
    specialty?: string
    search?: string
    sortBy?: 'rating' | 'price' | 'experience'
    sortOrder?: 'asc' | 'desc'
    appointmentType?: 'all' | 'video' | 'in_person'
  }>
}) {
  const params = await searchParams

  // Check if user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    profile = data
  }

  const [doctors, specialties] = await Promise.all([
    discoverDoctors({
      specialtySlug: params.specialty,
      searchQuery: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      appointmentType: params.appointmentType as any,
    }),
    getAvailableSpecialties(),
  ])

  const buildQueryString = (newParams: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams()
    if (params.specialty) searchParams.set('specialty', params.specialty)
    if (params.search) searchParams.set('search', params.search)
    if (params.sortBy) searchParams.set('sortBy', params.sortBy)
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder)
    if (params.appointmentType) searchParams.set('appointmentType', params.appointmentType)

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value)
      } else {
        searchParams.delete(key)
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  const doctorList = doctors as any[]

  return (
    <div className="min-h-screen bg-transparent">
      <main className="editorial-shell py-8 sm:py-10 lg:py-12">
        <section className="surface-panel-strong overflow-hidden public-panel sm:px-8 lg:px-10 lg:py-10">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div className="space-y-6">
              <Badge variant="luxe">Marketplace clínico verificado</Badge>
              <div className="max-w-4xl">
                <PublicSectionHeading
                  align="left"
                  eyebrow="Descubrimiento premium"
                  title="Encuentra al especialista correcto"
                  accent="con calma y confianza"
                  description="Explora perfiles verificados, compara experiencia y agenda con médicos reales en México. Cada perfil combina claridad clínica, disponibilidad y confianza institucional."
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="surface-panel px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">Doctores activos</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">{doctorList.length}</p>
                </div>
                <div className="surface-panel px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">Especialidades</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">{specialties.length}</p>
                </div>
                <div className="surface-panel px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">Modalidad</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))]">
                    {params.appointmentType === 'video' ? 'Videoconsulta' : params.appointmentType === 'in_person' ? 'Presencial' : 'Mixta'}
                  </p>
                </div>
              </div>
            </div>

            <div className="surface-panel space-y-4 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[hsl(var(--text-soft))]">Curaduría Doctor.mx</p>
                  <p className="text-lg font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))]">Verificación profesional y señales de confianza visibles</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
                Cada búsqueda está pensada para ayudar a pacientes a decidir rápido: credenciales claras, precio visible, modalidades de atención y presencia digital consistente.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_2.1fr]">
          <Card className="surface-panel border-border/80 p-0 xl:sticky xl:top-28 xl:self-start">
            <div className="border-b border-border/70 px-6 py-5">
              <PublicSectionHeading
                align="left"
                eyebrow="Refinar búsqueda"
                title="Encuentra por perfil,"
                accent="modalidad y especialidad"
              />
            </div>

            <div className="space-y-6 px-6 py-6">
              <form className="space-y-4" action="/doctors" method="GET">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Buscar por nombre
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--text-soft))]" />
                  <Input
                    type="search"
                    name="search"
                    placeholder="Ej. cardiólogo, pediatra, Dra. Herrera"
                    defaultValue={params.search}
                    className="h-12 rounded-2xl border-border/80 bg-[hsl(var(--surface-quiet))] pl-11 focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
                  />
                </div>
                {params.specialty && <input type="hidden" name="specialty" value={params.specialty} />}
                {params.sortBy && <input type="hidden" name="sortBy" value={params.sortBy} />}
                {params.sortOrder && <input type="hidden" name="sortOrder" value={params.sortOrder} />}
                {params.appointmentType && <input type="hidden" name="appointmentType" value={params.appointmentType} />}
                <Button variant="hero" className="w-full justify-center">Actualizar búsqueda</Button>
              </form>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                  Ordenar resultados
                </label>
                <div className="flex gap-3">
                  <SortSelect
                    defaultValue={params.sortBy || 'rating'}
                    currentParams={{
                      specialty: params.specialty,
                      search: params.search,
                      sortOrder: params.sortOrder,
                    }}
                  />

                  <Link
                    href={`/doctors${buildQueryString({ sortOrder: params.sortOrder === 'asc' ? undefined : 'asc' })}`}
                    className="inline-flex"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      className={params.sortOrder === 'asc' ? 'bg-secondary/80' : ''}
                      title={params.sortOrder === 'asc' ? 'Orden descendente' : 'Orden ascendente'}
                    >
                      {params.sortOrder === 'asc' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                        </svg>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">Modalidad de atención</p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/doctors${buildQueryString({ appointmentType: undefined })}`}>
                    <Badge variant={!params.appointmentType || params.appointmentType === 'all' ? 'default' : 'outline'} className="cursor-pointer px-4 py-2">
                      Todas
                    </Badge>
                  </Link>
                  <Link href={`/doctors${buildQueryString({ appointmentType: 'video' })}`}>
                    <Badge variant={params.appointmentType === 'video' ? 'info' : 'outline'} className="cursor-pointer px-4 py-2">
                      Videoconsulta
                    </Badge>
                  </Link>
                  <Link href={`/doctors${buildQueryString({ appointmentType: 'in_person' })}`}>
                    <Badge variant={params.appointmentType === 'in_person' ? 'secondary' : 'outline'} className="cursor-pointer px-4 py-2">
                      Presencial
                    </Badge>
                  </Link>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">Especialidades</p>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/doctors${buildQueryString({ specialty: undefined })}`}>
                    <Badge variant={!params.specialty ? 'default' : 'outline'} className="cursor-pointer px-4 py-2">Todas</Badge>
                  </Link>
                  {specialties.map((specialty: { id: string; slug: string; name: string }) => (
                    <Link key={specialty.id} href={`/doctors${buildQueryString({ specialty: specialty.slug })}`}>
                      <Badge variant={params.specialty === specialty.slug ? 'luxe' : 'outline'} className="cursor-pointer px-4 py-2 normal-case tracking-[0.04em]">
                        {specialty.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">Resultados curados</p>
                <div className="mt-2">
                  <PublicSectionHeading
                    align="left"
                    title={`${doctorList.length} doctor${doctorList.length !== 1 ? 'es' : ''}`}
                    accent={`listo${doctorList.length !== 1 ? 's' : ''} para atender`}
                  />
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm text-[hsl(var(--text-secondary))]">
                <ShieldCheck className="h-4 w-4 text-[hsl(var(--brand-leaf))]" />
                Cédula visible y perfil revisado
              </div>
            </div>

            {doctorList.length === 0 ? (
              <Card className="surface-panel text-center py-16">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(145deg,hsl(var(--surface-tint)),hsl(var(--surface-quiet)))]">
                  <Search className="h-8 w-8 text-[hsl(var(--brand-ocean))]" />
                </div>
                <h3 className="mb-2 text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))]">No encontramos doctores</h3>
                <p className="mx-auto mb-6 max-w-sm text-[hsl(var(--text-secondary))]">
                  Intenta con otra especialidad o término de búsqueda. También puedes consultar con Dr. Simeon mientras tanto.
                </p>
                <Link href="/app/second-opinion">
                  <Button variant="outline">Consultar con Dr. Simeon IA</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {doctorList.map((doctor) => (
                  <Link key={doctor.id} href={`/doctors/${doctor.id}`} className="group rounded-2xl focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 outline-none">
                    <Card className="surface-panel h-full gap-0 overflow-hidden border-border/80 p-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                      <div className="surface-tint px-6 py-5">
                        <div className="mb-4 flex items-start gap-4">
                          <div className="relative flex-shrink-0">
                            <div className="h-16 w-16 overflow-hidden rounded-[1.35rem] bg-[linear-gradient(145deg,hsl(var(--surface-quiet)),hsl(var(--surface-tint)))] ring-1 ring-white/60">
                              {doctor.profile?.photo_url ? (
                                <Image
                                  src={doctor.profile.photo_url}
                                  alt={doctor.profile.full_name}
                                  width={64}
                                  height={64}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,hsl(var(--surface-strong)),hsl(var(--surface-tint)))]">
                                  <Stethoscope className="h-7 w-7 text-[hsl(var(--brand-ocean))]" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[hsl(var(--success))] text-white">
                              <ShieldCheck className="h-2.5 w-2.5" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))] transition-colors group-hover:text-[hsl(var(--brand-ocean))]">
                                {formatDoctorName(doctor.profile?.full_name)}
                              </h3>
                              <Badge variant="success" className="normal-case tracking-[0.05em]" aria-label="Doctor verificado">
                                Verificado
                              </Badge>
                            </div>

                            {doctor.specialties && doctor.specialties.length > 0 && (
                              <p className="mt-2 text-sm font-medium text-[hsl(var(--brand-ocean))]">
                                {doctor.specialties.map((s: { id: string; name: string }) => s.name).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5 px-6 py-6">
                        <div className="grid gap-3 text-sm text-[hsl(var(--text-secondary))]">
                          {doctor.city && (
                            <p className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[hsl(var(--text-soft))]" />
                              {doctor.city}, {doctor.state}
                            </p>
                          )}

                          {doctor.years_experience && (
                            <p className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-[hsl(var(--text-soft))]" />
                              {doctor.years_experience} años de experiencia
                            </p>
                          )}

                          <p className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-[hsl(var(--text-soft))]" />
                            {doctor.video_enabled ? 'Videoconsulta disponible' : 'Consulta presencial / agenda disponible'}
                          </p>
                        </div>

                        {doctor.rating_avg > 0 && (
                          <div className="flex items-center gap-2 rounded-2xl bg-[hsl(var(--surface-soft))] px-4 py-3 text-sm text-[hsl(var(--text-secondary))]" aria-label={`Calificación ${doctor.rating_avg.toFixed(1)} de 5 estrellas basada en ${doctor.rating_count} reseñas`}>
                            <Star className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" aria-hidden="true" />
                            <span className="font-semibold text-[hsl(var(--text-primary))]">{doctor.rating_avg.toFixed(1)}</span>
                            <span>({doctor.rating_count} reseñas)</span>
                          </div>
                        )}

                        <div className="luxury-divider" />

                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">Tarifa base</p>
                            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">
                              ${(doctor.price_cents / 100).toLocaleString('es-MX')}
                            </p>
                            <p className="text-sm text-[hsl(var(--text-secondary))]">{doctor.currency} por consulta</p>
                          </div>
                          <Button variant="hero" size="sm" className="px-4">
                            Ver perfil
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
      </main>

      <footer className="mt-12 border-t border-border/70 bg-card/70 py-8 backdrop-blur">
        <div className="editorial-shell flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-[linear-gradient(135deg,hsl(var(--brand-ocean)),hsl(var(--brand-sky)))] text-white">
              <Stethoscope className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))]">Doctor.mx</span>
          </div>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            © {new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
