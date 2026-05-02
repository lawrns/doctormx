'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, HelpCircle, Star, X, ArrowRight } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const patientPlans = [
  {
    name: 'Consulta individual',
    price: '$500',
    cadence: 'por consulta',
    description: 'Para resolver una necesidad puntual con un médico verificado.',
    cta: 'Buscar doctores',
    href: '/doctors',
    features: [
      'Videoconsulta o presencial',
      'Resumen de consulta',
      'Receta digital',
      'Seguimiento básico',
    ],
  },
  {
    name: 'Cuidado Continuo',
    price: '$299',
    cadence: 'MXN / mes',
    description: 'Para pacientes que necesitan seguimiento y acceso más frecuente.',
    cta: 'Comenzar ahora',
    href: '/auth/register?role=patient',
    featured: true,
    features: [
      'Hasta 4 consultas al mes',
      'Mensajería de seguimiento',
      'Historial clínico organizado',
      'Recordatorios preventivos',
    ],
  },
  {
    name: 'Familia',
    price: '$599',
    cadence: 'MXN / mes',
    description: 'Para coordinar consultas, historial y seguimiento de varios perfiles.',
    cta: 'Comenzar ahora',
    href: '/auth/register?role=patient',
    features: [
      'Consultas ampliadas',
      'Perfiles familiares',
      'Segunda opinión',
      'Soporte prioritario',
    ],
  },
]

type DoctorPlan = {
  id: string
  name: string
  monthlyPrice: number
  annualPrice: number
  cadence: string
  description: string
  cta: string
  href: string
  featured?: boolean
  features: string[]
  excludedFeatures: string[]
}

const doctorPlans: DoctorPlan[] = [
  {
    id: 'doctor',
    name: 'Médico independiente',
    monthlyPrice: 499,
    annualPrice: 5000,
    cadence: 'MXN',
    description: 'Un plan simple para captar pacientes, digitalizar tu agenda y operar con confianza desde el primer día.',
    cta: 'Comenzar prueba gratis',
    href: '/auth/register?role=doctor',
    featured: true,
    features: [
      'Perfil profesional verificable con cédula SEP',
      'Agenda y solicitudes de cita según configuración',
      'Captura de pacientes con WhatsApp y formularios',
      'Expediente y seguimiento básico cuando esté habilitado',
      '14 días gratis sin tarjeta de crédito',
    ],
    excludedFeatures: [],
  },
]

const clinicPlan = {
  name: 'Clínicas y Enterprise',
  price: 'A la medida',
  description: 'Para grupos médicos, clínicas multi-sede y equipos que necesitan alto volumen, reportes, capacitación y acompañamiento comercial.',
  cta: 'Agendar demo',
  href: '/contact?intent=clinic-demo',
  features: [
    'Onboarding para varios médicos y sedes',
    'Flujos de captación y seguimiento por WhatsApp',
    'Reportes de captación y conversión por sede',
    'Soporte prioritario, seguridad y verificación operativa',
  ],
}

const faqs = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí, puedes cancelar cuando quieras sin penalización. Tu suscripción se mantiene activa hasta el final del periodo pagado.',
  },
  {
    q: '¿Qué pasa si no tengo pacientes el primer mes?',
    a: 'Te ayudamos a optimizar tu perfil para aparecer en búsquedas y capturar intención de pacientes. No prometemos volumen fijo sin revisar especialidad, ciudad y disponibilidad.',
  },
  {
    q: '¿Cómo funciona la verificación de cédula profesional?',
    a: 'Verificamos tu cédula ante la SEP. Es un proceso rápido que te da una insignia de confianza visible para todos los pacientes.',
  },
  {
    q: '¿Ofrecen facturación?',
    a: 'Sí, generamos facturas (CFDI) mensuales para tu suscripción. Solo necesitas tu RFC y uso de CFDI.',
  },
  {
    q: '¿Puedo cambiar de plan después de registrarme?',
    a: 'Sí, puedes subir o bajar de plan en cualquier momento desde la configuración de tu cuenta. El ajuste se aplica en el siguiente ciclo.',
  },
]

const comparisonFeatures = [
  { key: 'Precio', starter: '$499 MXN/mes', pro: '$5,000 MXN/año', elite: 'A la medida' },
  { key: 'Perfil profesional', starter: true, pro: true, elite: true },
  { key: 'Solicitudes de cita', starter: true, pro: true, elite: true },
  { key: 'Captura por WhatsApp', starter: true, pro: true, elite: true },
  { key: 'Expediente y seguimiento básico', starter: 'Según configuración', pro: 'Según configuración', elite: true },
  { key: 'Verificación de cédula SEP', starter: true, pro: true, elite: true },
  { key: 'Reportes multi-sede', starter: false, pro: false, elite: true },
  { key: 'Acompañamiento comercial', starter: false, pro: false, elite: true },
  { key: 'Soporte', starter: 'Correo', pro: 'Correo', elite: 'Prioritario' },
]

function FeatureIcon({ included }: { included: boolean }) {
  return included ? (
    <CheckCircle className="h-4 w-4 text-[hsl(var(--trust))]" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/40" />
  )
}

function PatientPlanCard({ plan }: { plan: (typeof patientPlans)[number] }) {
  return (
    <article
      className={`rounded-[12px] border bg-card p-5 ${
        plan.featured
          ? 'border-[hsl(var(--interactive)/0.4)] ring-1 ring-[hsl(var(--interactive)/0.15)] shadow-lg'
          : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {plan.name}
          </h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.description}</p>
        </div>
        {plan.featured && (
          <Badge variant="info">
            <Star className="h-3 w-3" />
            Más popular
          </Badge>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {plan.price}
          </p>
          <p className="text-xs text-muted-foreground">{plan.cadence}</p>
        </div>
        <Button asChild variant={plan.featured ? 'primary' : 'secondary'} size="sm">
          <Link href={plan.href}>{plan.cta}</Link>
        </Button>
      </div>

      <ul className="mt-5 space-y-2 border-t border-border pt-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm leading-5 text-muted-foreground">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--trust))]" />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  )
}

function DoctorPlanCard({
  plan,
  isAnnual,
}: {
  plan: DoctorPlan
  isAnnual: boolean
}) {
  const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice
  const displayCadence = isAnnual ? 'MXN / año' : 'MXN / mes'

  return (
    <article
      className={`relative flex flex-col rounded-[12px] border bg-card p-[var(--space-4)] ${
        plan.featured
          ? 'border-[hsl(var(--interactive)/0.4)] ring-1 ring-[hsl(var(--interactive)/0.15)] shadow-lg'
          : 'border-border'
      }`}
    >
      {plan.featured && (
        <div className="flex items-start justify-between">
          <div />
          <Badge variant="secondary" className="text-xs">Recomendado</Badge>
        </div>
      )}

      <div className="flex-1">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {plan.name}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.description}</p>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl font-semibold tracking-tight text-foreground">
              ${displayPrice.toLocaleString('es-MX')}
            </span>
            <span className="text-xs text-muted-foreground">{displayCadence}</span>
          </div>
          {isAnnual && (
            <p className="mt-1 text-xs text-[hsl(var(--trust))]">
              Ahorras ${(plan.monthlyPrice * 12 - plan.annualPrice).toLocaleString('es-MX')} MXN al año
            </p>
          )}
        </div>

        <ul className="mt-4 space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm leading-5 text-muted-foreground">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--trust))]" />
              {feature}
            </li>
          ))}
          {plan.excludedFeatures.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm leading-5 text-muted-foreground/40">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/25" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <Button asChild variant={plan.featured ? 'primary' : 'secondary'} className="w-full" size="sm">
          <Link href={plan.href}>
            {plan.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      {/* Hero */}
      <section className="pt-16 md:pt-20">
        <div className="editorial-shell">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[1fr_1fr] lg:items-end"
          >
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Precios transparentes
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground md:text-6xl">
                Planes que crecen con tu práctica.
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              $499 MXN/mes o $5,000 MXN/año. La mayoría de los médicos cubre su suscripción con la primera cita del mes. Clínicas y equipos pueden agendar demo para un plan a la medida.
            </p>
          </motion.div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/auth/register?role=doctor">Comenzar 14 días gratis</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/contact?intent=clinic-demo">Agendar demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="editorial-shell py-10">
        <div className="space-y-12">
          {/* Doctor Plans */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                  Planes para médicos
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Todos los planes incluyen prueba gratis de 14 días
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-sm font-medium ${
                    !isAnnual ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Mensual
                </span>
                <Switch
                  checked={isAnnual}
                  onCheckedChange={setIsAnnual}
                  aria-label="Cambiar facturación anual"
                />
                <span
                  className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                    isAnnual ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  Anual
                  {isAnnual && (
                    <span className="rounded-full bg-[hsl(var(--trust)/0.12)] px-2 py-0.5 text-xs font-semibold text-[hsl(var(--trust))]">
                      Ahorras $988
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {doctorPlans.map((plan) => (
                <DoctorPlanCard key={plan.id} plan={plan} isAnnual={isAnnual} />
              ))}
              <article className="relative flex flex-col rounded-[12px] border border-border bg-card p-[var(--space-4)]">
                <div className="flex-1">
                  <Badge variant="secondary" className="text-xs">Alto volumen</Badge>
                  <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
                    {clinicPlan.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{clinicPlan.description}</p>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="font-display text-3xl font-semibold tracking-tight text-foreground">{clinicPlan.price}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--trust))]">Incluye demo comercial, ROI y configuración por sede</p>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {clinicPlan.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm leading-5 text-muted-foreground">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--trust))]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild variant="secondary" className="mt-6 w-full" size="sm">
                  <Link href={clinicPlan.href}>
                    {clinicPlan.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </article>
            </div>
          </div>

          {/* ROI and trust */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[12px] border border-border bg-card p-5">
              <p className="font-semibold text-foreground">ROI claro</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">La mayoría de los médicos cubre su suscripción con la primera cita del mes. El resto es crecimiento.</p>
            </div>
            <div className="rounded-[12px] border border-border bg-card p-5">
              <p className="font-semibold text-foreground">Alternativa a Doctoralia</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Perfil verificado, agenda, WhatsApp y seguimiento en una experiencia enfocada en conversión.</p>
            </div>
            <div className="rounded-[12px] border border-border bg-card p-5">
              <p className="font-semibold text-foreground">Seguridad y verificación</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Validación de cédula SEP, médicos verificados y procesos diseñados para proteger datos clínicos.</p>
            </div>
          </div>

          {/* Feature comparison table */}
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Comparación de funcionalidades
            </h2>
            <div className="mt-4 overflow-x-auto rounded-[12px] border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Funcionalidad</TableHead>
                    <TableHead className="text-center">Mensual</TableHead>
                    <TableHead className="text-center bg-primary/5">Anual</TableHead>
                    <TableHead className="text-center">Clínicas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonFeatures.map((feature) => (
                    <TableRow key={feature.key}>
                      <TableCell className="font-medium text-sm">{feature.key}</TableCell>
                      <TableCell className="text-center">
                        {typeof feature.starter === 'boolean' ? (
                          <span className="inline-flex justify-center">
                            <FeatureIcon included={feature.starter} />
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{feature.starter}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center bg-primary/5">
                        {typeof feature.pro === 'boolean' ? (
                          <span className="inline-flex justify-center">
                            <FeatureIcon included={feature.pro} />
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{feature.pro}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {typeof feature.elite === 'boolean' ? (
                          <span className="inline-flex justify-center">
                            <FeatureIcon included={feature.elite} />
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">{feature.elite}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Patient Plans */}
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Planes para pacientes
            </h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {patientPlans.map((plan) => (
                <PatientPlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Preguntas frecuentes
            </h2>
            <div className="mt-4 divide-y divide-border rounded-[12px] border border-border bg-card">
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
        </div>
      </section>

      <Footer />
    </main>
  )
}
