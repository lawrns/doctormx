import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  Filter,
  ShieldCheck,
  Stethoscope,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { formatDoctorName } from '@/lib/utils'
import { discoverDoctors, getAvailableSpecialties } from '@/lib/discovery'

export const metadata: Metadata = {
  title: 'Doctores en Linea - Consulta por Video | Doctor.mx',
  description:
    'Consulta en linea con doctores disponibles para videoconsulta. Filtra por especialidad y revisa perfiles verificados en Mexico.',
  openGraph: {
    title: 'Doctores en Linea - Consulta por Video | Doctor.mx',
    description: 'Consulta en linea con doctores disponibles para videoconsulta.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/doctores-online',
  },
}

const faq = [
  {
    question: '¿Necesito instalar algo?',
    answer: 'No. La videoconsulta funciona desde el navegador cuando el doctor tiene esa modalidad habilitada.',
  },
  {
    question: '¿La receta es automática?',
    answer: 'No. El médico decide indicaciones, receta o seguimiento según la consulta y regulación aplicable.',
  },
  {
    question: '¿Qué pasa si es urgente?',
    answer: 'Doctor.mx no reemplaza urgencias. Ante señales de alarma, busca atención médica inmediata.',
  },
]

export default async function DoctoresOnlinePage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string }>
}) {
  const params = await searchParams
  const [doctorsResult, specialtiesResult] = await Promise.all([
    discoverDoctors({
      onlineOnly: true,
      specialtySlug: params.specialty,
      sortBy: 'rating',
    }),
    getAvailableSpecialties(),
  ])

  const specialties = Array.isArray(specialtiesResult) ? specialtiesResult : []
  const onlineDoctors = Array.isArray(doctorsResult)
    ? doctorsResult.filter((doctor) => doctor.video_enabled === true || doctor.offers_video === true)
    : []

  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-10 border-b border-border pb-10 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Doctores en línea
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-6xl">
              Videoconsulta con perfiles médicos verificables.
            </h1>
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Mostramos doctores con modalidad de video cuando el catálogo lo confirma. Si no hay disponibilidad publicada, no inventamos “en línea ahora”.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Modalidad real</Badge>
              <Badge variant="outline">Sin urgencias</Badge>
              <Badge variant="outline">Cédula si existe</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit border border-border bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <Filter className="h-5 w-5 text-primary" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Especialidad
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/doctores-online"
                className={`rounded-[8px] border px-3 py-2 text-sm font-medium transition-colors ${
                  !params.specialty
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary'
                }`}
              >
                Todas
              </Link>
              {specialties.slice(0, 8).map((specialty: { id: string; slug: string; name: string }) => (
                <Link
                  key={specialty.id}
                  href={`/doctores-online?specialty=${specialty.slug}`}
                  className={`rounded-[8px] border px-3 py-2 text-sm font-medium transition-colors ${
                    params.specialty === specialty.slug
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {specialty.name}
                </Link>
              ))}
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
                    {onlineDoctors.length > 0
                      ? `${onlineDoctors.length} doctores con videoconsulta`
                      : 'Sin doctores publicados para esta búsqueda'}
                  </h2>
                </div>
                <Button asChild variant="secondary">
                  <Link href="/doctors">Ver directorio completo</Link>
                </Button>
              </div>

              {onlineDoctors.length === 0 ? (
                <div className="mt-5 border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-[var(--public-shadow-soft)]">
                  No hay perfiles con videoconsulta publicados para este filtro. Puedes revisar el directorio completo o volver cuando el catálogo esté actualizado.
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {onlineDoctors.map((doctor) => (
                    <Link
                      key={doctor.id}
                      href={`/doctors/${doctor.id}`}
                      className="grid gap-4 border border-border bg-card p-4 shadow-[var(--public-shadow-soft)] transition-colors hover:border-primary/30 md:grid-cols-[72px_1fr_220px]"
                    >
                      {doctor.profile?.photo_url ? (
                        <Image
                          src={doctor.profile.photo_url}
                          alt={doctor.profile.full_name}
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
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold tracking-tight text-foreground">
                            {formatDoctorName(doctor.profile?.full_name)}
                          </h3>
                          {doctor.verification?.sep_verified && (
                            <Badge variant="success">SEP</Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {doctor.specialties.map((specialty) => specialty.name).filter(Boolean).join(', ') || 'Especialidad médica'}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {doctor.city ?? 'México'} · {doctor.rating_count > 0 ? `${doctor.rating_avg.toFixed(1)} (${doctor.rating_count} reseñas)` : 'Reseñas no publicadas'}
                        </p>
                      </div>
                      <div className="grid gap-2 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Video className="h-4 w-4 text-primary" />
                          Videoconsulta
                        </p>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-primary" />
                          Datos verificables
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

            <section className="grid gap-5 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Antes de reservar
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  La videoconsulta tiene límites claros.
                </h2>
              </div>
              <div className="divide-y divide-border border-y border-border bg-card">
                {faq.map((item) => (
                  <div key={item.question} className="p-5">
                    <h3 className="font-semibold tracking-tight text-foreground">{item.question}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-border bg-card p-6 shadow-[var(--public-shadow-soft)]">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    Busca por necesidad clínica, no por promesas de disponibilidad.
                  </h2>
                </div>
                <Button asChild>
                  <Link href="/consulta-online">Cómo funciona</Link>
                </Button>
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
