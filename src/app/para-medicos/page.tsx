import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, CalendarCheck, CheckCircle, MessageSquare, ShieldCheck, TrendingUp, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Para Médicos | Más pacientes para tu consultorio con Doctor.mx',
  description: 'Capta pacientes, agenda consultas y digitaliza tu consultorio con Doctor.mx. Plan médico de $499 MXN/mes o $5,000 MXN/año, clínicas con demo comercial.',
  openGraph: {
    title: 'Doctor.mx para Médicos y Clínicas',
    description: 'Perfil verificado, WhatsApp, agenda, ROI claro y alternativa a Doctoralia para médicos mexicanos.',
    type: 'website',
    locale: 'es_MX',
  },
  alternates: {
    canonical: '/para-medicos',
  },
}

const proofPoints = [
  { value: '$499', label: 'MXN/mes', detail: '$5,000 MXN/año con ahorro anual claro' },
  { value: '14 días', label: 'gratis', detail: 'Sin tarjeta de crédito para empezar' },
  { value: '1 consulta', label: 'para recuperar', detail: 'Una consulta adicional al mes puede pagar el plan' },
]

const steps = [
  {
    title: 'Crea o reclama tu perfil',
    body: 'Publica especialidad, ubicación, horarios, modalidades de consulta y datos profesionales.',
    icon: Users,
  },
  {
    title: 'Validamos seguridad y cédula',
    body: 'Aplicamos verificación de cédula SEP y señales de confianza para que el paciente sepa con quién agenda.',
    icon: ShieldCheck,
  },
  {
    title: 'Convierte demanda en consultas',
    body: 'Agenda, WhatsApp, recordatorios y seguimiento reducen fricción desde el primer contacto.',
    icon: CalendarCheck,
  },
]

const comparisonRows = [
  { feature: 'Precio de entrada', doctormx: '$499 MXN/mes', doctoralia: 'Planes más altos' },
  { feature: 'Plan anual', doctormx: '$5,000 MXN/año', doctoralia: 'Cotización variable' },
  { feature: 'Prueba', doctormx: '14 días', doctoralia: 'Depende del paquete' },
  { feature: 'Verificación profesional', doctormx: 'Cédula SEP y seguridad', doctoralia: 'Perfil básico' },
  { feature: 'Ruta clínicas / Enterprise', doctormx: 'Agendar demo', doctoralia: 'Comercial tradicional' },
]

export default function ParaMedicosPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <Header />

      <section className="border-b border-border bg-card">
        <div className="editorial-shell grid gap-8 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Para médicos y clínicas</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Convierte pacientes interesados en consultas agendadas.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Doctor.mx te da perfil verificado, agenda, WhatsApp y seguimiento por $499 MXN/mes o $5,000 MXN/año. Si eres clínica o Enterprise, agenda demo para diseñar captación multi-sede.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="primary">
                <Link href="/auth/register?role=doctor">
                  Comenzar 14 días gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/contact?intent=clinic-demo">Agendar demo</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/contact?intent=sales">Contactar ventas</Link>
              </Button>
            </div>
          </div>

          <Card density="comfortable" className="border-primary/20 bg-primary/5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">ROI simple</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Una consulta adicional puede cubrir tu mes.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Con una consulta adicional de $500 MXN, el plan mensual de $499 MXN queda cubierto. El resto de consultas nuevas son crecimiento neto para tu práctica.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {proofPoints.map((point) => (
                <div key={point.value} className="rounded-xl border border-border bg-card p-3">
                  <p className="font-display text-2xl font-semibold text-foreground">{point.value}</p>
                  <p className="text-xs font-semibold text-primary">{point.label}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{point.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} density="comfortable">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Paso {index + 1}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card py-12 md:py-16">
        <div className="editorial-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Alternativa a Doctoralia</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
              Precio claro, verificación y ruta comercial para clínicas.
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Mantén tu alta médica simple con $499 MXN/mes, muestra seguridad y cédula verificada, y escala a un flujo Enterprise cuando necesites varias sedes o equipos.
            </p>
          </div>
          <div className="overflow-hidden rounded-[12px] border border-border">
            {comparisonRows.map((row) => (
              <div key={row.feature} className="grid grid-cols-[1fr_1fr_1fr] border-b border-border bg-card text-sm last:border-b-0">
                <div className="p-3 font-medium text-foreground">{row.feature}</div>
                <div className="border-x border-border p-3 font-semibold text-[hsl(var(--trust))]">{row.doctormx}</div>
                <div className="p-3 text-muted-foreground">{row.doctoralia}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-shell py-12 md:py-16">
        <div className="grid gap-4 md:grid-cols-3">
          <Card density="comfortable">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-xl font-semibold text-foreground">ROI que entiende el consultorio</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Medimos captación, agenda y seguimiento para que veas qué canal produce consultas reales.</p>
          </Card>
          <Card density="comfortable">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-xl font-semibold text-foreground">Confianza, seguridad y verificación</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Cédula SEP, médicos verificados y copy claro para que el paciente agende con mayor confianza.</p>
          </Card>
          <Card density="comfortable">
            <MessageSquare className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-display text-xl font-semibold text-foreground">Demo o WhatsApp con ventas</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Para Clínicas y Enterprise, revisamos volumen, sedes, especialidades y objetivos antes de cotizar.</p>
          </Card>
        </div>
      </section>

      <section className="bg-ink py-12 md:py-16">
        <div className="editorial-shell text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-primary-foreground">
            ¿Listo para captar más pacientes?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/75">
            Empieza con 14 días gratis. Después: $499 MXN/mes o $5,000 MXN/año. Para clínicas, agenda demo y recibe una propuesta de implementación.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register?role=doctor"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary-foreground px-6 text-sm font-semibold text-ink transition-transform active:scale-[0.98] hover:bg-primary-foreground/90"
            >
              Comenzar 14 días gratis
              <CheckCircle className="h-4 w-4" />
            </Link>
            <Link
              href="/contact?intent=clinic-demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-primary-foreground/20 px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 active:scale-[0.98]"
            >
              Agendar demo
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
