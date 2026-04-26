'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Calculator,
  CheckCircle,
  CreditCard,
  FileCheck2,
  HelpCircle,
  Search,
  ShieldCheck,
  Stethoscope,
  Star,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const trustSignals = [
  { label: 'Médicos verificados', value: '2,500+' },
  { label: 'Cumplimiento COFEPRIS', value: 'Certificado' },
  { label: 'Cédula verificada por SEP', value: 'Obligatorio' },
]

const steps = [
  {
    icon: UserCheck,
    title: 'Crea tu perfil',
    body: 'Completa tu información profesional, especialidad, ubicación y modalidades de consulta en minutos.',
  },
  {
    icon: ShieldCheck,
    title: 'Verificamos tu cédula',
    body: 'Validamos tu cédula profesional ante la SEP. Recibirás una insignia de confianza visible para pacientes.',
  },
  {
    icon: Stethoscope,
    title: 'Recibe pacientes',
    body: 'Tu perfil aparece en búsquedas y el Dr. Simeón refiere pacientes a médicos verificados.',
  },
]

const testimonials = [
  {
    quote:
      'Desde que estoy en Doctor.mx recibo al menos 3 pacientes nuevos por semana. La verificación de cédula da mucha confianza.',
    name: 'Dra. María G.',
    role: 'Dermatóloga CDMX',
  },
  {
    quote:
      'El AI Copilot me ahorra horas de documentación. Las notas clínicas se generan solas durante la consulta.',
    name: 'Dr. Carlos R.',
    role: 'Medicina Interna, Monterrey',
  },
  {
    quote:
      'Pagué Doctoralia por años a $2,400/mes sin ver resultados. Con Doctor.mx pago $999 y tengo más visibilidad.',
    name: 'Dr. Alejandro V.',
    role: 'Pediatra, Guadalajara',
  },
]

const comparisonRows = [
  { feature: 'Precio mensual', doctory: '$499 MXN', doctoralia: '$2,400 MXN' },
  { feature: 'Perfil profesional', doctory: true, doctoralia: true },
  { feature: 'Verificación de cédula (SEP)', doctory: true, doctoralia: false },
  { feature: 'Pacientes por WhatsApp', doctory: true, doctoralia: false },
  { feature: 'AI Copilot para notas clínicas', doctory: true, doctoralia: false },
  { feature: 'Posicionamiento prioritario', doctory: true, doctoralia: true },
  { feature: 'Análisis de imágenes con IA', doctory: true, doctoralia: false },
  { feature: 'Sin contratos forzosos', doctory: true, doctoralia: false },
  { feature: 'Dr. Simeón (referencia de pacientes)', doctory: true, doctoralia: false },
]

const planComparison = [
  {
    name: 'Starter',
    price: '$499',
    cadence: 'MXN/mes',
    cta: 'Comenzar gratis',
    href: '/auth/register?role=doctor',
    features: ['Perfil profesional', 'Reserva de citas', '30 pacientes WhatsApp', 'Soporte por correo'],
  },
  {
    name: 'Pro',
    price: '$999',
    cadence: 'MXN/mes',
    cta: 'Comenzar gratis',
    href: '/auth/register?role=doctor',
    featured: true,
    features: [
      'Todo en Starter',
      'AI Copilot (50 consultas)',
      '100 pacientes WhatsApp',
      'Posicionamiento prioritario',
      'Análisis de imágenes (20)',
    ],
  },
  {
    name: 'Elite',
    price: '$1,999',
    cadence: 'MXN/mes',
    cta: 'Comenzar gratis',
    href: '/auth/register?role=doctor',
    features: [
      'Todo en Pro',
      'AI Copilot ilimitado',
      'Imágenes ilimitadas',
      'Listado destacado',
      'White label + API',
    ],
  },
]

const faqs = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, puedes cancelar cuando quieras sin penalización. Tu suscripción se mantiene activa hasta el final del periodo pagado.',
  },
  {
    q: '¿Qué pasa si no tengo pacientes el primer mes?',
    a: 'Te ayudamos a optimizar tu perfil para aparecer en búsquedas. Además, el Dr. Simeón refiere pacientes a médicos verificados.',
  },
  {
    q: '¿Cómo funciona la verificación de cédula profesional?',
    a: 'Verificamos tu cédula ante la SEP. Es un proceso rápido que te da una insignia de confianza visible para todos los pacientes.',
  },
  {
    q: '¿Ofrecen facturación?',
    a: 'Sí, generamos facturas (CFDI) mensuales para tu suscripción. Solo necesitas tu RFC y uso de CFDI.',
  },
]

function FeatureCheck({ included, text }: { included: boolean; text?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      {included ? (
        <CheckCircle className="h-4 w-4 shrink-0 text-[hsl(var(--trust))]" />
      ) : (
        <X className="h-4 w-4 shrink-0 text-muted-foreground/30" />
      )}
      {text && <span className="text-muted-foreground">{text}</span>}
    </span>
  )
}

export default function ForDoctorsPage() {
  const [patientCount, setPatientCount] = useState(12)
  const [consultPrice, setConsultPrice] = useState(600)

  const monthlyRevenue = patientCount * consultPrice
  const netRevenue = monthlyRevenue - 499
  const doctoraliaCost = 2400
  const annualSavings = (doctoraliaCost * 12) - (499 * 12)
  const formatMxn = (amount: number) => `$${amount.toLocaleString('es-MX')}`

  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-[hsl(var(--surface-soft))] pb-10 pt-24 md:pb-12 md:pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-18rem] top-[-20rem] h-[34rem] w-[34rem] rounded-full bg-primary/6 blur-3xl" />
          <div className="absolute right-[-12rem] top-[-18rem] h-[30rem] w-[30rem] rounded-full bg-secondary/30 blur-3xl" />
        </div>

        <div className="editorial-shell relative">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Para médicos mexicanos
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground md:text-5xl lg:text-[3.4rem]">
                Médicos verificados en Doctor.mx reciben 3x más pacientes.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Únete a la plataforma de telemedicina #1 para médicos mexicanos. Perfil
                profesional, pacientes por WhatsApp, y IA para tus notas clínicas.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" variant="primary">
                  <Link href="/connect">
                    Reclamar perfil con IA
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/auth/register?role=doctor">
                    O crear perfil nuevo
                    <Search className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                {trustSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className="flex items-center gap-2 rounded-lg bg-[hsl(var(--trust-soft))] px-3 py-2"
                  >
                    <ShieldCheck className="h-4 w-4 text-[hsl(var(--trust))]" />
                    <span className="text-sm font-semibold text-[hsl(var(--ink))]">{signal.value}</span>
                    <span className="text-xs text-[hsl(var(--ink-soft))]">{signal.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Calculator — right column */}
            <div className="rounded-[12px] border border-border bg-card p-5 shadow-[var(--shadow-md)]">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary flex items-center gap-2">
                <Calculator className="h-3.5 w-3.5" />
                Calcula tus ingresos
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-foreground">
                ¿Cuánto puedes ganar con Doctor.mx?
              </h2>

              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="patientCount" className="text-sm font-medium">
                    Pacientes por mes
                  </Label>
                  <div className="mt-1 flex items-center gap-3">
                    <Input
                      id="patientCount"
                      type="range"
                      min={1}
                      max={80}
                      value={patientCount}
                      onChange={(e) => setPatientCount(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-10 text-right font-semibold text-foreground">{patientCount}</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="consultPrice" className="text-sm font-medium">
                    Precio por consulta
                  </Label>
                  <div className="mt-1 flex items-center gap-3">
                    <Input
                      id="consultPrice"
                      type="range"
                      min={200}
                      max={3000}
                      step={50}
                      value={consultPrice}
                      onChange={(e) => setConsultPrice(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-semibold text-foreground">{formatMxn(consultPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Ingreso bruto mensual</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-foreground">{formatMxn(monthlyRevenue)}</p>
                </div>
                <div className="rounded-xl border border-[hsl(var(--interactive)/0.3)] bg-[hsl(var(--interactive)/0.05)] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[hsl(var(--interactive))]">Tu ganancia neta</p>
                      <p className="mt-1 font-display text-2xl font-semibold text-[hsl(var(--interactive))]">{formatMxn(netRevenue)}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Después del plan Starter ($499/mes)</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-primary/60" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground text-center">
                    Con Doctoralia pagarías <span className="font-semibold text-foreground line-through">$2,400/mes</span> por las mismas funcionalidades
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="editorial-shell py-12 md:py-16">
        <div className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Cómo funciona
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
            En 3 pasos estás recibiendo pacientes
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="rounded-[12px] border border-border bg-card p-[var(--space-4)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-mono text-xs font-semibold text-primary">Paso {i + 1}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Doctor.mx */}
      <section className="border-y border-border bg-card py-12 md:py-16">
        <div className="editorial-shell">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                ¿Por qué Doctor.mx?
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                Más funcionalidades por una fracción del precio
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Comparado con Doctoralia, ofrecemos más herramientas, verificación real de cédula y
                precios hasta 80% menores.
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold text-primary">$499</span>
                <span className="text-sm text-muted-foreground line-through">$2,400</span>
                <span className="text-xs text-muted-foreground">/mes</span>
              </div>
            </div>

            {/* Desktop: table */}
            <div className="hidden lg:block overflow-x-auto rounded-[12px] border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[260px]">Funcionalidad</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        Doctor.mx
                      </div>
                    </TableHead>
                    <TableHead className="text-center text-muted-foreground">Doctoralia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-medium text-sm">{row.feature}</TableCell>
                      <TableCell className="text-center">
                        {typeof row.doctory === 'boolean' ? (
                          <span className="inline-flex justify-center">
                            <FeatureCheck included={row.doctory} />
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-[hsl(var(--trust))]">{row.doctory}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof row.doctoralia === 'boolean' ? (
                          <span className="inline-flex justify-center">
                            <FeatureCheck included={row.doctoralia} />
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{row.doctoralia}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile: stacked list */}
            <div className="lg:hidden space-y-1">
              {comparisonRows.map((row) => (
                <div key={row.feature} className="flex items-center justify-between p-3 border-b border-border">
                  <span className="text-sm">{row.feature}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[hsl(var(--trust))]">
                      {row.doctory === true ? '✓' : row.doctory === false ? '✗' : row.doctory}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {row.doctoralia === true ? '✓' : row.doctoralia === false ? '✗' : row.doctoralia}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="editorial-shell py-12 md:py-16">
        <div className="text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            Lo que dicen los médicos
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
            Colegas que ya confían en Doctor.mx
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-[12px] border border-border bg-card p-[var(--space-4)]"
            >
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <blockquote className="mt-3 text-sm leading-6 text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-4 border-t border-border pt-3">
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Plan comparison */}
      <section className="border-y border-border bg-card py-12 md:py-16">
        <div className="editorial-shell">
          <div className="text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Comparación de planes
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
              Elige el plan ideal para tu práctica
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Todos los planes incluyen prueba gratis de 14 días. Sin tarjeta de crédito. Sin contratos forzosos.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {planComparison.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-xl border p-[var(--space-4)] ${
                  plan.featured
                    ? 'border-[hsl(var(--interactive)/0.4)] bg-card shadow-md'
                    : 'border-border bg-card'
                }`}
              >
                {plan.featured && (
                  <div className="flex items-start justify-between">
                    <div />
                    <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                  </div>
                )}
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-semibold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-xs text-muted-foreground">{plan.cadence}</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--trust))]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={plan.featured ? 'primary' : 'secondary'}
                  className="mt-4 w-full"
                  size="sm"
                >
                  <Link href={plan.href}>
                    {plan.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="inline h-3 w-3 mr-0.5" />
                  Cancela cuando quieras
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="editorial-shell py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              Preguntas frecuentes
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
              Todo lo que necesitas saber
            </h2>
          </div>

          <div className="mt-8 divide-y divide-border rounded-[12px] border border-border bg-card">
            {faqs.map((faq) => (
              <details key={faq.q} className="group">
                <summary className="flex cursor-pointer items-center gap-3 p-4 font-semibold text-foreground list-none [&::-webkit-details-marker]:hidden">
                  <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                  {faq.q}
                  <span className="ml-auto text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="px-4 pb-4 pl-11 text-sm leading-6 text-muted-foreground">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border bg-card py-12 md:py-16">
        <div className="editorial-shell text-center">
          <div className="mx-auto flex max-w-md flex-col items-center gap-1">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">
            Empieza tu prueba gratis hoy
          </h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            Sin tarjeta de crédito. Sin contratos forzosos. Completa tu perfil en minutos y empieza
            a recibir pacientes verificados. Cancela cuando quieras.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/auth/register?role=doctor">
                Comenzar prueba gratis de 14 días
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/connect">
                Reclamar perfil con IA
                <Search className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">
              Más de 2,500 médicos verificados ya confían en Doctor.mx
            </p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            14 días de prueba · Cancela cuando quieras · Sin compromiso
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
