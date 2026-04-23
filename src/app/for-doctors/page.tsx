import Link from 'next/link'
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  Stethoscope,
  Video,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const requirements = [
  'Cédula profesional y especialidad cuando aplique.',
  'Modalidades de consulta, ubicación y precio antes de publicar.',
  'Fotografía profesional y biografía clínica revisable.',
  'Políticas de pago, cancelación y seguimiento claras para el paciente.',
]

const platform = [
  {
    title: 'Perfil médico verificable',
    body: 'Muestra cédula, institución, especialidad, modalidad y reseñas sin depender de claims genéricos.',
    icon: FileCheck2,
  },
  {
    title: 'Agenda y seguimiento',
    body: 'Ordena solicitudes, citas, videoconsulta y contexto del paciente desde un flujo operativo único.',
    icon: CalendarCheck,
  },
  {
    title: 'Cobro con confianza',
    body: 'Explica precio, método de pago y confirmación antes de la reserva para reducir fricción.',
    icon: CreditCard,
  },
]

const workflow = [
  { step: '01', title: 'Envía expediente', body: 'Revisamos identidad, cédula, especialidad y datos de atención.' },
  { step: '02', title: 'Completa perfil', body: 'Agrega foto, enfoque clínico, ubicaciones, modalidad y precio.' },
  { step: '03', title: 'Publica con evidencia', body: 'El directorio muestra solo datos disponibles y no simula demanda.' },
]

export default function ForDoctorsPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-10 border-b border-border pb-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Para doctores y clínicas
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-6xl">
              Crece tu práctica con un perfil que se puede comprobar.
            </h1>
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Doctor.mx no vende magia de adquisición. Te da una presencia médica clara, verificable y preparada para convertir pacientes que necesitan decidir con confianza.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/auth/register?role=doctor">
                  Crear perfil médico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">Ver precios</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit border border-border bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Antes de publicar
            </p>
            <div className="mt-4 space-y-3">
              {requirements.map((item) => (
                <p key={item} className="border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                  {item}
                </p>
              ))}
            </div>
          </aside>

          <div className="space-y-10">
            <section>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Producto médico
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                    Herramientas para una práctica más legible.
                  </h2>
                </div>
                <Badge variant="outline">Sin disponibilidad simulada</Badge>
              </div>
              <div className="mt-5 divide-y divide-border border-y border-border bg-card">
                {platform.map((item) => (
                  <div key={item.title} className="grid gap-4 p-5 md:grid-cols-[44px_1fr]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{item.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Activación
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  Publicar menos, pero publicar mejor.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  El directorio debe sentirse como infraestructura médica, no como un catálogo inflado. Por eso el alta prioriza calidad de perfil sobre volumen.
                </p>
              </div>
              <div className="space-y-3">
                {workflow.map((item) => (
                  <div key={item.step} className="grid gap-4 border border-border bg-card p-5 shadow-[var(--public-shadow-soft)] md:grid-cols-[64px_1fr]">
                    <p className="font-mono text-sm font-semibold text-primary">{item.step}</p>
                    <div>
                      <h3 className="font-semibold tracking-tight text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-border bg-card p-6 shadow-[var(--public-shadow-soft)] md:p-7">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex gap-2 text-primary">
                    <Stethoscope className="h-5 w-5" />
                    <Video className="h-5 w-5" />
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    Si el paciente no puede verificarte rápido, el diseño falló.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    La experiencia de Doctor.mx está orientada a reducir incertidumbre: quién eres, qué atiendes, cómo consultas y qué pasa después de reservar.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/auth/register?role=doctor">Empezar revisión</Link>
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
