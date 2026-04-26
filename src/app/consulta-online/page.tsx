import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  Stethoscope,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getAvailableSpecialties, discoverDoctors } from '@/lib/discovery'

export const metadata: Metadata = {
  title: 'Consulta en Linea con Especialistas | Doctor.mx',
  description:
    'Consulta en linea con especialistas certificados desde cualquier lugar de Mexico. Pago seguro, perfiles verificados y seguimiento claro.',
  openGraph: {
    title: 'Consulta en Linea con Especialistas | Doctor.mx',
    description:
      'Consulta en linea con especialistas certificados desde cualquier lugar de Mexico.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/consulta-online',
  },
}

const steps = [
  {
    title: 'Elige un perfil verificable',
    body: 'Revisa especialidad, cédula visible cuando existe, modalidad, ciudad y reseñas antes de reservar.',
    icon: Stethoscope,
  },
  {
    title: 'Reserva con precio claro',
    body: 'Selecciona horario real disponible, confirma modalidad y revisa pago o políticas antes de continuar.',
    icon: Calendar,
  },
  {
    title: 'Consulta y recibe seguimiento',
    body: 'El doctor atiende por video cuando está habilitado y deja indicaciones o próximos pasos en el flujo clínico.',
    icon: FileText,
  },
]

export default async function ConsultaOnlinePage() {
  let specialtiesResult: unknown = []
  let doctorsResult: unknown = []
  try {
    ;[specialtiesResult, doctorsResult] = await Promise.all([
      getAvailableSpecialties(),
      discoverDoctors({ onlineOnly: true, sortBy: 'rating' }),
    ])
  } catch (err) {
    console.error('Failed to load consulta-online data:', err)
  }
  const specialties = Array.isArray(specialtiesResult) ? specialtiesResult : []
  const onlineDoctors = Array.isArray(doctorsResult) ? doctorsResult : []
  const ratingTotal = onlineDoctors.reduce((sum, doctor) => sum + Math.max(doctor.rating_count, 0), 0)
  const averageRating =
    ratingTotal > 0
      ? Math.round(
          (onlineDoctors.reduce((sum, doctor) => sum + doctor.rating_avg * Math.max(doctor.rating_count, 0), 0) /
            ratingTotal) *
            10
        ) / 10
      : null
  const featuredDoctors = onlineDoctors.slice(0, 3)

  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-10 border-b border-border pb-10 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Consulta en linea
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-6xl">
              Videoconsulta médica con evidencia antes de reservar.
            </h1>
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Compara doctores que atienden en línea, revisa sus datos disponibles y agenda sin depender de promesas genéricas.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/doctores-online">
                  Ver doctores en línea
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/doctors">Abrir directorio</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit border border-border bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <Video className="h-5 w-5 text-primary" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Catálogo actual
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-1">
              <div className="border-t border-border pt-4">
                <p className="font-mono text-xl font-semibold text-foreground">
                  {onlineDoctors.length > 0 ? onlineDoctors.length : 'No publicado'}
                </p>
                <p className="text-xs text-muted-foreground">doctores con modalidad en línea</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-mono text-xl font-semibold text-foreground">
                  {specialties.length > 0 ? specialties.length : 'No publicado'}
                </p>
                <p className="text-xs text-muted-foreground">especialidades en catálogo</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="font-mono text-xl font-semibold text-foreground">
                  {averageRating ? averageRating.toFixed(1) : 'No publicado'}
                </p>
                <p className="text-xs text-muted-foreground">calificación si hay reseñas suficientes</p>
              </div>
            </div>
          </aside>

          <div className="space-y-10">
            <section>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Flujo de reserva
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                    Lo importante aparece antes del pago.
                  </h2>
                </div>
                <Badge variant="outline">Precio y modalidad visibles</Badge>
              </div>
              <div className="mt-5 divide-y divide-border border-y border-border bg-card">
                {steps.map((step) => (
                  <div key={step.title} className="grid gap-4 p-5 md:grid-cols-[44px_1fr]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Doctores disponibles
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  Personas reales, no avatares de demo.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Cuando el catálogo tiene foto y reseñas, las mostramos. Cuando no, evitamos inventar prueba social.
                </p>
              </div>
              <div className="space-y-3">
                {featuredDoctors.length > 0 ? (
                  featuredDoctors.map((doctor) => (
                    <Link
                      key={doctor.id}
                      href={`/doctors/${doctor.id}`}
                      className="grid gap-4 border border-border bg-card p-4 shadow-[var(--public-shadow-soft)] transition-colors hover:border-primary/30 md:grid-cols-[64px_1fr_auto]"
                    >
                      {doctor.profile?.photo_url ? (
                        <Image
                          src={doctor.profile.photo_url}
                          alt={doctor.profile.full_name}
                          width={64}
                          height={64}
                          className="h-16 w-16 object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center bg-primary/10 text-lg font-semibold text-primary">
                          {doctor.profile?.full_name?.charAt(0) ?? 'D'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold tracking-tight text-foreground">
                          {doctor.profile?.full_name ?? 'Doctor verificado'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {doctor.specialties[0]?.name ?? 'Especialidad médica'} · {doctor.city ?? 'México'}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                          {doctor.verification?.sep_verified ? 'SEP verificado' : 'Datos visibles según expediente'}
                        </p>
                      </div>
                      <div className="self-center text-sm font-semibold text-primary">Ver perfil</div>
                    </Link>
                  ))
                ) : (
                  <div className="border border-border bg-card p-5 text-sm text-muted-foreground">
                    Los doctores con videoconsulta aparecerán aquí cuando el catálogo público esté disponible.
                  </div>
                )}
              </div>
            </section>

            <section className="border border-border bg-card p-6 shadow-[var(--public-shadow-soft)] md:p-7">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex gap-2 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    La consulta en línea no debe sentirse como checkout genérico.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    Por eso el flujo prioriza identidad médica, modalidad, precio, pago y próximos pasos antes de confirmar.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/doctores-online">Buscar ahora</Link>
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
