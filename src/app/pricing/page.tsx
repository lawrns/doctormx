'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Stethoscope, TrendingUp } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const patientPlans = [
  {
    name: 'Consulta individual',
    price: '$500',
    cadence: 'por consulta',
    description: 'Para resolver una necesidad puntual con un médico verificado.',
    cta: 'Buscar doctores',
    href: '/doctors',
    features: ['Videoconsulta o presencial cuando esté disponible', 'Resumen de consulta', 'Receta si el médico la emite', 'Seguimiento básico'],
  },
  {
    name: 'Cuidado continuo',
    price: '$299',
    cadence: 'al mes',
    description: 'Para pacientes que necesitan seguimiento y acceso más frecuente.',
    cta: 'Crear cuenta',
    href: '/auth/register',
    featured: true,
    features: ['Hasta 4 consultas al mes', 'Mensajería de seguimiento', 'Historial clínico organizado', 'Recordatorios preventivos'],
  },
  {
    name: 'Familia',
    price: '$599',
    cadence: 'al mes',
    description: 'Para coordinar consultas, historial y seguimiento de varios perfiles.',
    cta: 'Crear cuenta',
    href: '/auth/register',
    features: ['Consultas ampliadas', 'Perfiles familiares', 'Segunda opinión', 'Soporte prioritario'],
  },
]

const doctorPlans = [
  {
    name: 'Perfil verificado',
    price: '$0',
    cadence: 'inicio',
    description: 'Publica tu perfil, cédula y modalidades disponibles.',
    cta: 'Unirme',
    href: '/for-doctors',
    features: ['Perfil público', 'Reseñas de pacientes', 'Agenda básica', 'Videoconsulta habilitada'],
  },
  {
    name: 'Profesional',
    price: '$999',
    cadence: 'al mes',
    description: 'Para operar agenda, pacientes y seguimiento con más control.',
    cta: 'Empezar',
    href: '/auth/register',
    featured: true,
    features: ['Analítica de pacientes', 'Recordatorios automáticos', 'Mejor presencia en búsqueda', 'Gestión de seguimiento'],
  },
  {
    name: 'Clínica',
    price: '$2,999',
    cadence: 'al mes',
    description: 'Para equipos con varios médicos, operación y soporte dedicado.',
    cta: 'Hablar con ventas',
    href: '/contact',
    features: ['Múltiples doctores', 'Flujos por clínica', 'Soporte de implementación', 'Reportes operativos'],
  },
]

const faqs = [
  ['¿Hay cargos ocultos?', 'No. La pantalla de reserva muestra precio, modalidad y condiciones antes de confirmar.'],
  ['¿Puedo cambiar de plan?', 'Sí. Los cambios se gestionan desde la cuenta y aplican según el ciclo vigente.'],
  ['¿Qué métodos de pago aceptan?', 'Tarjetas, SPEI y OXXO cuando el flujo de pago esté habilitado para la consulta.'],
]

function PlanCard({ plan }: { plan: (typeof patientPlans)[number] }) {
  return (
    <article className={`rounded-[12px] border bg-card p-5 ${plan.featured ? 'border-primary shadow-[0_14px_34px_-24px_rgba(15,37,95,0.32)]' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">{plan.name}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{plan.description}</p>
        </div>
        {plan.featured ? (
          <Badge variant="info">
            <TrendingUp className="h-3 w-3" />
            Mejor valor
          </Badge>
        ) : null}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-border pt-4">
        <div>
          <p className="font-display text-3xl font-semibold tracking-tight text-foreground">{plan.price}</p>
          <p className="text-xs text-muted-foreground">{plan.cadence}</p>
        </div>
        <Button asChild variant={plan.featured ? 'hero' : 'outline'} size="sm">
          <Link href={plan.href}>{plan.cta}</Link>
        </Button>
      </div>

      <ul className="mt-5 space-y-2 border-t border-border pt-4">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm leading-5 text-muted-foreground">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-vital" />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[hsl(var(--surface-soft))]">
      <Header />

      <section className="pt-24 md:pt-28">
        <div className="editorial-shell">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
          >
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Precios transparentes
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground md:text-6xl">
                Paga por atención real, no por promesas.
              </h1>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Los planes separan con claridad lo que paga el paciente y lo que opera el médico. Precio, modalidad y condiciones deben aparecer antes de reservar.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="editorial-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[10px] border border-border bg-card p-4">
              <Stethoscope className="mb-4 h-5 w-5 text-primary" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Criterio</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Mostramos costos como referencia de producto. El precio final se confirma en la reserva del doctor.
              </p>
            </div>
          </aside>

          <div className="space-y-10">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Pacientes</h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {patientPlans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
              </div>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Doctores y clínicas</h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {doctorPlans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
              </div>
            </div>

            <div className="divide-y divide-border rounded-[12px] border border-border bg-card">
              {faqs.map(([question, answer]) => (
                <div key={question} className="grid gap-2 p-4 md:grid-cols-[18rem_1fr]">
                  <h3 className="font-semibold text-foreground">{question}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
