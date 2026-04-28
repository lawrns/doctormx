import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, Stethoscope, Video } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatDoctorName } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

type Specialty = {
  id: string
  name: string
  slug: string
  description: string | null
}

type DoctorRow = {
  id: string
  city: string | null
  video_enabled: boolean | null
  rating_avg: number | null
  rating_count: number | null
  profile: {
    full_name: string | null
    photo_url: string | null
  } | null
}

export async function generateStaticParams() {
  try {
    const supabase = await createClient()
    const { data } = await supabase.from('specialties').select('slug')
    return (data || []).map((s: { slug: string }) => ({ slug: s.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data: specialty } = await supabase
      .from('specialties')
      .select('name')
      .eq('slug', slug)
      .single()

    if (!specialty) return { title: 'Especialidad no encontrada - Doctor.mx' }

    return {
      title: `${specialty.name} - Doctores en Línea | Doctor.mx`,
      description: `Consulta en línea con doctores especialistas en ${specialty.name}. Videoconsulta con perfiles verificados en México.`,
      openGraph: {
        title: `${specialty.name} - Doctores en Línea | Doctor.mx`,
        description: `Consulta en línea con especialistas en ${specialty.name}.`,
        type: 'website',
        locale: 'es_MX',
      },
      alternates: { canonical: `/doctores-online/${slug}` },
    }
  } catch {
    return { title: 'Especialidad - Doctor.mx' }
  }
}

export default async function DoctoresOnlineSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: specialty } = await supabase
    .from('specialties')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!specialty) notFound()

  let doctors: DoctorRow[] = []
  try {
    const { data } = await supabase
      .from('doctors')
      .select('id, city, video_enabled, rating_avg, rating_count, profile:profiles(full_name, photo_url)')
      .eq('status', 'approved')
      .contains('specialty_slugs', [slug])
      .limit(20)
    doctors = (data || []) as unknown as DoctorRow[]
  } catch (err) {
    console.error('Failed to load doctors for specialty:', err)
  }

  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-10 border-b border-border pb-10 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {specialty.name}
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-6xl">
              Doctores en línea en {specialty.name}
            </h1>
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              {specialty.description || `Agenda una videoconsulta con doctores especialistas en ${specialty.name}. Perfiles verificados y sin urgencias.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Modalidad real</Badge>
              <Badge variant="outline">Sin urgencias</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit border border-border bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <Stethoscope className="h-5 w-5 text-primary" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Especialidad
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">{specialty.name}</p>
            <div className="mt-6 space-y-3">
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link href="/doctores-online">Ver todas</Link>
              </Button>
              <Button asChild variant="secondary" size="sm" className="w-full">
                <Link href="/doctors">Directorio completo</Link>
              </Button>
            </div>
          </aside>

          <div className="space-y-10">
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Catálogo de video
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                    {doctors.length > 0
                      ? `${doctors.length} doctores en ${specialty.name}`
                      : 'Sin doctores disponibles'}
                  </h2>
                </div>
              </div>

              {doctors.length === 0 ? (
                <div className="mt-5 border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-[var(--public-shadow-soft)]">
                  No hay doctores en {specialty.name} disponibles para videoconsulta en este momento.{' '}
                  <Link href="/doctores-online" className="text-primary hover:underline">
                    Explora otras especialidades
                  </Link>{' '}
                  o vuelve más tarde.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {doctors.map((doctor) => (
                    <Link
                      key={doctor.id}
                      href={`/doctors/${doctor.id}`}
                      className="grid gap-4 border border-border bg-card p-4 shadow-[var(--public-shadow-soft)] transition-colors hover:border-primary/30 md:grid-cols-[72px_1fr_220px]"
                    >
                      {doctor.profile?.photo_url ? (
                        <Image
                          src={doctor.profile.photo_url}
                          alt={doctor.profile.full_name || 'Doctor'}
                          width={72}
                          height={72}
                          className="h-[72px] w-[72px] object-cover"
                        />
                      ) : (
                        <div className="flex h-[72px] w-[72px] items-center justify-center bg-primary/10 text-primary">
                          <Stethoscope className="h-6 w-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">
                          {formatDoctorName(doctor.profile?.full_name)}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{specialty.name}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {doctor.city ?? 'México'}
                          {doctor.rating_count != null && doctor.rating_count > 0
                            ? ` · ${(doctor.rating_avg ?? 0).toFixed(1)} (${doctor.rating_count} reseñas)`
                            : ''}
                        </p>
                      </div>
                      <div className="grid gap-2 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Video className="h-4 w-4 text-primary" />
                          Videoconsulta
                        </p>
                        <span className="mt-2 inline-flex items-center text-sm font-semibold text-primary">
                          Ver perfil
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
