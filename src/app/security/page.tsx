'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Database, FileText, Key, Lock, Shield } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const controls = [
  {
    icon: Lock,
    title: 'Cifrado y transporte seguro',
    body: 'Mensajes, archivos y sesiones viajan por canales cifrados. El almacenamiento sensible se limita al flujo clínico.',
  },
  {
    icon: Key,
    title: 'Acceso por rol',
    body: 'Pacientes, doctores y equipo operativo tienen permisos separados para reducir exposición innecesaria.',
  },
  {
    icon: Database,
    title: 'Datos clínicos controlados',
    body: 'La información de salud se usa para consulta, reserva y seguimiento. No se muestra fuera del contexto necesario.',
  },
  {
    icon: FileText,
    title: 'Derechos del paciente',
    body: 'Puedes solicitar acceso, corrección o eliminación aplicable de tus datos desde soporte.',
  },
]

const commitments = [
  'La IA no sustituye urgencias ni diagnóstico médico.',
  'Cédula, verificación y reseñas solo se muestran como certeza cuando existen.',
  'Los pagos y datos sensibles usan proveedores especializados.',
  'Las páginas legales explican alcance, privacidad y condiciones de uso.',
]

export default function SecurityPage() {
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
                Seguridad y privacidad
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-foreground md:text-6xl">
                Seguridad visible, sin lenguaje inflado.
              </h1>
            </div>
            <div className="space-y-4">
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Doctor.mx protege datos de salud con controles de acceso, cifrado, proveedores de pago especializados y límites explícitos para la IA clínica.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">Privacidad por diseño</Badge>
                <Badge variant="success">Acceso por rol</Badge>
                <Badge variant="outline">Límites clínicos</Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="editorial-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[10px] border border-border bg-card p-4">
              <Shield className="mb-4 h-5 w-5 text-primary" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Criterio
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Si un control, dato o certificación no puede demostrarse en producto, evitamos tratarlo como prueba absoluta.
              </p>
            </div>
          </aside>

          <div className="space-y-8">
            <div className="grid gap-3 md:grid-cols-2">
              {controls.map((control) => (
                <article key={control.title} className="rounded-[12px] border border-border bg-card p-5">
                  <control.icon className="mb-4 h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">{control.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{control.body}</p>
                </article>
              ))}
            </div>

            <div className="divide-y divide-border rounded-[12px] border border-border bg-card">
              {commitments.map((item) => (
                <div key={item} className="flex gap-3 p-4 text-sm leading-6 text-muted-foreground">
                  <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-[hsl(var(--trust))]" />
                  {item}
                </div>
              ))}
            </div>

            <div className="rounded-[12px] border border-amber/30 bg-amber/5 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber" />
                <div>
                  <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
                    Urgencias y señales de alarma
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Dr. Simeon puede orientar y escalar, pero no reemplaza servicios de emergencia. Ante dolor de pecho, dificultad para respirar, pérdida de conciencia o síntomas graves, busca atención urgente.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
              <Button asChild variant="primary">
                <Link href="/contact">Contactar seguridad</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/privacy">Ver privacidad</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
