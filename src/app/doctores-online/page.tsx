import { Metadata } from 'next'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PublicSectionHeading } from '@/components/PublicSectionHeading'
import { formatDoctorName } from '@/lib/utils'
import {
  Video,
  ShieldCheck,
  Star,
  Stethoscope,
  Search,
  ArrowUpRight,
  Clock,
  ChevronDown,
} from 'lucide-react'
import Image from 'next/image'
import { discoverDoctors, getAvailableSpecialties } from '@/lib/discovery'

export const metadata: Metadata = {
  title: 'Doctores en Linea - Consulta por Video | Doctor.mx',
  description:
    'Consulta en linea con doctores disponibles ahora. Filtra por especialidad y conectate por videoconsulta. Doctores verificados en Mexico.',
  openGraph: {
    title: 'Doctores en Linea - Consulta por Video | Doctor.mx',
    description: 'Consulta en linea con doctores disponibles ahora.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/doctores-online',
  },
}

const onlineFAQ = [
  {
    question: 'Como funciona la videoconsulta?',
    answer:
      'Selecciona un doctor disponible, elige un horario y completa el pago. En el momento de tu cita, accede a la sala de videoconsulta desde tu navegador. El doctor se conectara y realizara la consulta.',
  },
  {
    question: 'Necesito instalar algo?',
    answer:
      'No. La videoconsulta funciona directamente en tu navegador web, ya sea en computadora, tablet o celular. Solo necesitas camara, microfono y conexion a internet.',
  },
  {
    question: 'Que pasa si tengo problemas tecnicos?',
    answer:
      'Si la conexion se cae, puedes reconectarte. Si el problema persiste, contacta soporte y te reprogramaremos la cita sin costo.',
  },
  {
    question: 'Puedo obtener una receta medica?',
    answer:
      'Si. Al finalizar la consulta, el doctor generara una receta digital que estara disponible en tu perfil. Las recetas electronicas son validas en farmacias de todo Mexico.',
  },
]

export default async function DoctoresOnlinePage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string }>
}) {
  const params = await searchParams

  const [doctors, specialties] = await Promise.all([
    discoverDoctors({
      onlineOnly: true,
      specialtySlug: params.specialty,
      sortBy: 'rating',
    }) as Promise<any[]>,
    getAvailableSpecialties(),
  ])

  const onlineDoctors = doctors.filter((d: any) => d.video_enabled === true)

  return (
    <div className="min-h-screen bg-transparent">
      <main className="editorial-shell py-8 sm:py-10 lg:py-12">
        {/* Hero */}
        <section className="surface-panel-strong overflow-hidden public-panel sm:px-8 lg:px-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-6">
              <Badge variant="luxe">Doctores en linea</Badge>
              <PublicSectionHeading
                align="left"
                eyebrow="Consulta en linea"
                title="Consulta en linea con"
                accent="doctores disponibles ahora"
                description="Conectate por videoconsulta con especialistas certificados. Sin desplazarte, sin filas de espera."
              />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-700">
                    {onlineDoctors.length} doctores en linea
                  </span>
                </div>
              </div>
            </div>

            {/* Specialty Filter */}
            <Card className="surface-panel p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                Filtrar por especialidad
              </p>
              <form action="/doctores-online" method="GET" className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Link href="/doctores-online">
                    <Badge variant={!params.specialty ? 'default' : 'outline'} className="cursor-pointer px-3 py-1.5">
                      Todas
                    </Badge>
                  </Link>
                  {specialties.slice(0, 8).map((s: { id: string; slug: string; name: string }) => (
                    <Link key={s.id} href={`/doctores-online?specialty=${s.slug}`}>
                      <Badge
                        variant={params.specialty === s.slug ? 'luxe' : 'outline'}
                        className="cursor-pointer px-3 py-1.5 normal-case tracking-[0.04em]"
                      >
                        {s.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </form>
            </Card>
          </div>
        </section>

        {/* Doctor Grid */}
        <section className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[hsl(var(--text-soft))]">
                Disponibles ahora
              </p>
              <div className="mt-2">
                <PublicSectionHeading
                  align="left"
                  title={`${onlineDoctors.length} doctor${onlineDoctors.length !== 1 ? 'es' : ''}`}
                  accent="con videoconsulta"
                />
              </div>
            </div>
          </div>

          {onlineDoctors.length === 0 ? (
            <Card className="surface-panel text-center py-16">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(145deg,hsl(var(--surface-tint)),hsl(var(--surface-quiet)))]">
                <Video className="h-8 w-8 text-[hsl(var(--brand-ocean))]" />
              </div>
              <h3 className="mb-2 text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--text-primary))]">
                No hay doctores en linea ahora
              </h3>
              <p className="mx-auto max-w-sm text-[hsl(var(--text-secondary))]">
                Vuelve mas tarde o agenda una cita para otro momento. Tambien puedes consultar con
                nuestro asistente IA.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link href="/doctors">
                  <Button variant="outline">Ver todos los doctores</Button>
                </Link>
                <Link href="/app/ai-consulta">
                  <Button variant="hero">Dr. Simeon IA</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {onlineDoctors.map((doctor: any) => (
                <Card
                  key={doctor.id}
                  className="surface-panel h-full gap-0 overflow-hidden border-border/80 p-0"
                >
                  <div className="surface-tint px-6 py-5">
                    <div className="flex items-start gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="h-14 w-14 overflow-hidden rounded-[1.35rem] bg-[linear-gradient(145deg,hsl(var(--surface-quiet)),hsl(var(--surface-tint)))] ring-1 ring-white/60">
                          {doctor.profile?.photo_url ? (
                            <Image
                              src={doctor.profile.photo_url}
                              alt={doctor.profile.full_name}
                              width={56}
                              height={56}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Stethoscope className="h-6 w-6 text-[hsl(var(--brand-ocean))]" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500 text-white">
                          <Video className="h-2.5 w-2.5" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold tracking-[-0.02em] text-[hsl(var(--text-primary))]">
                            {formatDoctorName(doctor.profile?.full_name)}
                          </h3>
                          <Badge variant="success" className="normal-case text-xs">
                            En linea
                          </Badge>
                        </div>
                        {doctor.specialties && doctor.specialties.length > 0 && (
                          <p className="mt-1 text-sm text-[hsl(var(--brand-ocean))]">
                            {doctor.specialties.map((s: any) => s.name).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-6 py-5">
                    <div className="grid gap-2 text-sm text-[hsl(var(--text-secondary))]">
                      {doctor.years_experience && (
                        <p className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-[hsl(var(--text-soft))]" />
                          {doctor.years_experience} anos de experiencia
                        </p>
                      )}
                      <p className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-[hsl(var(--text-soft))]" />
                        Videoconsulta disponible
                      </p>
                    </div>

                    {doctor.rating_avg > 0 && (
                      <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--surface-soft))] px-3 py-2 text-sm">
                        <Star className="h-4 w-4 fill-[hsl(var(--brand-gold))] text-[hsl(var(--brand-gold))]" />
                        <span className="font-semibold text-[hsl(var(--text-primary))]">
                          {doctor.rating_avg.toFixed(1)}
                        </span>
                        <span className="text-[hsl(var(--text-secondary))]">
                          ({doctor.rating_count} resenas)
                        </span>
                      </div>
                    )}

                    <div className="luxury-divider" />

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-[hsl(var(--text-soft))]">Tarifa base</p>
                        <p className="text-2xl font-semibold tracking-[-0.04em] text-[hsl(var(--text-primary))]">
                          ${(doctor.price_cents / 100).toLocaleString('es-MX')}
                          <span className="text-sm font-normal text-[hsl(var(--text-secondary))]">
                            {' '}
                            MXN
                          </span>
                        </p>
                      </div>
                      <Link href={`/book/${doctor.id}`}>
                        <Button variant="hero" size="sm" className="gap-1">
                          <Video className="h-3.5 w-3.5" />
                          Agendar consulta en linea
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* FAQ */}
        <section className="mt-12 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <PublicSectionHeading
              eyebrow="Preguntas frecuentes"
              title="Sobre la consulta en linea"
            />
          </div>
          <Card className="surface-panel border-border/80 overflow-hidden">
            <div className="divide-y divide-border/50">
              {onlineFAQ.map((item, index) => (
                <details key={index} className="group">
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--surface-quiet))] transition-colors">
                    <span className="font-medium pr-4">{item.question}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-[hsl(var(--text-soft))] transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-4 text-sm leading-relaxed text-[hsl(var(--text-secondary))]">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}
