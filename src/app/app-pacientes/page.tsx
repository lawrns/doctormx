import { Metadata } from 'next'
import Link from 'next/link'
import {
  Bell,
  CalendarCheck,
  FileText,
  LockKeyhole,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Cuenta de Paciente Doctor.mx',
  description:
    'Organiza citas, videoconsultas, mensajes y documentos de salud desde tu cuenta de paciente en Doctor.mx.',
  openGraph: {
    title: 'Cuenta de Paciente Doctor.mx',
    description: 'Organiza citas, mensajes y documentos de salud en Doctor.mx.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/app-pacientes',
  },
}

const features = [
  {
    title: 'Citas y recordatorios',
    body: 'Consulta próximas reservas, modalidad y pasos previos sin depender de mensajes sueltos.',
    icon: CalendarCheck,
  },
  {
    title: 'Mensajes con contexto',
    body: 'Conserva comunicación relevante dentro del flujo médico cuando el doctor lo habilita.',
    icon: MessageSquare,
  },
  {
    title: 'Documentos clínicos',
    body: 'Recetas, notas y archivos se muestran dentro del contexto de la consulta correspondiente.',
    icon: FileText,
  },
]

const safety = [
  'La cuenta no reemplaza atención urgente.',
  'Los datos sensibles se usan dentro del flujo clínico.',
  'Cada consulta conserva doctor, modalidad, precio y seguimiento.',
]

export default function AppPacientesPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-10 border-b border-border pb-10 lg:grid-cols-[1fr_0.95fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Cuenta de paciente
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-6xl">
              Tu atención médica organizada alrededor de cada consulta.
            </h1>
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              En lugar de prometer una app con métricas infladas, Doctor.mx concentra reservas, mensajes y documentos en una cuenta clara y segura.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/app">Entrar a mi cuenta</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/doctors">Buscar doctores</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit border border-border bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <LockKeyhole className="h-5 w-5 text-primary" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Privacidad
            </p>
            <div className="mt-4 space-y-3">
              {safety.map((item) => (
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
                    Superficie privada
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                    Menos pantallas de marketing, más contexto clínico.
                  </h2>
                </div>
                <Badge variant="outline">Datos por consulta</Badge>
              </div>
              <div className="mt-5 divide-y divide-border border-y border-border bg-card">
                {features.map((feature) => (
                  <div key={feature.title} className="grid gap-4 p-5 md:grid-cols-[44px_1fr]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-foreground">{feature.title}</h3>
                      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {feature.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-border bg-card p-6 shadow-[var(--public-shadow-soft)] md:p-7">
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex gap-2 text-primary">
                    <Bell className="h-5 w-5" />
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    La confianza continúa después de reservar.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    El paciente debe saber qué pasó, qué sigue y dónde encontrar cada documento sin perseguir información.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/help">Ver ayuda</Link>
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
