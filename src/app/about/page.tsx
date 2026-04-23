import Link from 'next/link'
import {
  Award,
  ClipboardCheck,
  Database,
  GraduationCap,
  HeartHandshake,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const principles = [
  {
    title: 'Evidencia antes que promesa',
    body: 'Mostramos cédula, reseñas, modalidad y ubicación solo cuando existen datos en el expediente público o catálogo del doctor.',
    icon: ClipboardCheck,
  },
  {
    title: 'IA con límites clínicos',
    body: 'Dr. Simeon orienta y ayuda a escalar con médicos reales. No reemplaza urgencias, diagnóstico médico ni tratamiento presencial.',
    icon: Stethoscope,
  },
  {
    title: 'Privacidad como producto',
    body: 'La información sensible se restringe al flujo clínico, con controles por rol y explicaciones visibles para pacientes y doctores.',
    icon: ShieldCheck,
  },
]

const operatingModel = [
  { label: 'Verificación', value: 'Cédula y estado SEP cuando el dato existe' },
  { label: 'Red médica', value: 'Perfiles aprobados antes de aparecer en el directorio' },
  { label: 'Reseñas', value: 'Opiniones ligadas a experiencia real de paciente' },
  { label: 'Datos', value: 'Sin conteos inflados ni disponibilidad simulada' },
]

const safeguards = [
  'La plataforma no presenta métricas clínicas como certeza si no están auditadas.',
  'La disponibilidad se muestra desde catálogo real o se marca como pendiente.',
  'Los perfiles médicos distinguen entre cédula visible, verificación y datos faltantes.',
  'La orientación con IA deriva a atención humana cuando hay señales de alarma.',
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-10 border-b border-border pb-10 md:grid-cols-[1fr_0.9fr] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Plataforma medica verificada
            </p>
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[0.98] tracking-tight text-foreground md:text-6xl">
              Doctor.mx existe para que elegir médico sea más claro.
            </h1>
          </div>
          <div className="space-y-5">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Construimos un marketplace de salud donde la confianza se prueba en la interfaz: perfiles reales, datos visibles, privacidad explicada y límites clínicos claros.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Sin métricas infladas</Badge>
              <Badge variant="outline">Cédula visible cuando existe</Badge>
              <Badge variant="outline">IA con escalamiento humano</Badge>
            </div>
          </div>
        </div>

        <div className="grid gap-8 py-10 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit border border-border bg-card p-5 shadow-[var(--public-shadow-soft)]">
            <HeartHandshake className="h-5 w-5 text-primary" />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Criterio operativo
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Si un dato no está verificado, no lo convertimos en argumento de venta.
            </p>
          </aside>

          <div className="space-y-10">
            <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
              {operatingModel.map((item) => (
                <div key={item.label} className="border-t border-border py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Principios
              </p>
              <div className="mt-4 divide-y divide-border border-y border-border bg-card">
                {principles.map((principle) => (
                  <div key={principle.title} className="grid gap-4 p-5 md:grid-cols-[44px_1fr]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                      <principle.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        {principle.title}
                      </h2>
                      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {principle.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Gobierno clínico
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  La confianza se mantiene con reglas, no con slogans.
                </h2>
              </div>
              <div className="divide-y divide-border border-y border-border">
                {safeguards.map((item) => (
                  <div key={item} className="flex gap-3 py-4">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-border bg-card p-6 shadow-[var(--public-shadow-soft)] md:p-7">
              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex gap-2 text-primary">
                    <Database className="h-5 w-5" />
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                    Queremos que el expediente público haga el trabajo pesado.
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    El siguiente paso no es prometer más. Es completar más perfiles médicos con evidencia, fotografías reales y reglas de verificación visibles.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/doctors">Ver directorio</Link>
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
