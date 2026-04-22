'use client'

import { motion } from 'framer-motion'
import { Eyebrow } from '@/components/Eyebrow'
import { BadgeCheck, Video, Calendar, FileText, Shield, MessageSquare, ArrowRight } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Doctores revisados antes de listar',
    description: 'Cada especialista pasa por revisión interna de perfil y credenciales antes de recibir pacientes desde la plataforma.',
  },
  {
    icon: Video,
    title: 'Videoconsulta HD desde casa',
    description: 'Consultas por video con calidad HD y conexión segura. Tu doctor te ve y escucha como si estuvieras en su consultorio.',
  },
  {
    icon: Calendar,
    title: 'Citas en menos de 24 horas',
    description: 'Encuentra disponibilidad en tiempo real. Agenda tu consulta en minutos, no en semanas.',
  },
  {
    icon: FileText,
    title: 'Dr. Simeon: tu copiloto de salud',
    description: 'Nuestro asistente con IA te ayuda a entender síntomas y preparar preguntas para tu doctor. No diagnostica, orienta.',
  },
  {
    icon: Shield,
    title: 'Privacidad de grado médico',
    description: 'Tratamos la información de salud como sensible y limitamos su exposición dentro de los flujos de consulta.',
  },
  {
    icon: MessageSquare,
    title: 'Seguimiento continuo',
    description: 'Mensajea a tu doctor antes y después de la consulta. Tu historial médico siempre accesible.',
  },
]

export function FeaturesSection() {
  return (
    <section
      className="relative overflow-hidden bg-ink py-16 text-primary-foreground sm:py-24"
      role="region"
      aria-labelledby="features-section-heading"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,hsl(var(--primary)/0.20),transparent_30%),radial-gradient(circle_at_88%_44%,hsl(var(--brand-leaf)/0.12),transparent_28%)]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
            className="max-w-3xl lg:sticky lg:top-24"
          >
            <Eyebrow className="mb-4 text-primary-foreground/60">Plataforma</Eyebrow>
            <h2 id="features-section-heading" className="max-w-[10ch] font-display text-[clamp(2.3rem,4.8vw,4.75rem)] font-semibold leading-[0.92] tracking-tight text-primary-foreground">
              Una clínica digital, no un directorio.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/60">
              La diferencia no está en tener más tarjetas de doctores. Está en conectar orientación, seguridad, agenda, pago y seguimiento en una sola decisión clara.
            </p>

            <div className="mt-8 hidden max-w-sm border-t border-primary-foreground/15 pt-5 lg:block">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-vital">
                Sistema operativo clínico
              </p>
              <p className="mt-2 text-sm leading-6 text-primary-foreground/50">
                Cada módulo existe para reducir fricción o riesgo: menos abandono, menos doble reserva, menos casos mal dirigidos.
              </p>
            </div>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, ease: [0, 0, 0.2, 1] }}
              className="md:col-span-6 lg:col-span-4"
            >
              <div className="relative h-full overflow-hidden rounded-[2rem] border border-primary-foreground/10 bg-primary-foreground/[0.06] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="absolute right-6 top-6 rounded-full border border-vital/25 bg-vital/10 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-vital">
                  En vivo
                </div>
                <Calendar className="h-6 w-6 text-vital" aria-hidden="true" />
                <h3 className="mt-10 max-w-md font-display text-2xl font-semibold tracking-tight text-primary-foreground">
                  Agenda, pago y disponibilidad dentro del mismo circuito.
                </h3>
                <div className="mt-8 grid gap-3 border-t border-primary-foreground/10 pt-5 sm:grid-cols-3">
                  {['Intake', 'Triage', 'Reserva'].map((item, index) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-primary-foreground/60">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary-foreground/10 font-mono text-[10px] text-vital">
                        {index + 1}
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0, 0, 0.2, 1] }}
              className="md:col-span-3 lg:col-span-2"
            >
              <div className="h-full rounded-[2rem] border border-vital/20 bg-vital/10 p-6">
                <Shield className="h-6 w-6 text-vital" aria-hidden="true" />
                <p className="mt-8 text-sm font-semibold text-primary-foreground">Privacidad de grado médico</p>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/60">
                  Datos sensibles visibles solo donde aportan a la consulta.
                </p>
              </div>
            </motion.div>

            <div className="md:col-span-3 lg:col-span-2">
              <div className="grid h-full divide-y divide-primary-foreground/10 border-y border-primary-foreground/10">
                {features.slice(0, 2).map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="group flex gap-4 py-5"
                  >
                    <feature.icon className="mt-1 h-5 w-5 shrink-0 text-vital" aria-hidden="true" />
                    <div>
                      <h3 className="text-sm font-semibold text-primary-foreground">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-primary-foreground/50">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:col-span-6 lg:col-span-4">
            {features.slice(2).map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: [0, 0, 0.2, 1],
                }}
                className="group grid gap-3 border-t border-primary-foreground/10 py-4 transition-transform duration-200 hover:translate-x-1 sm:grid-cols-[1fr_auto]"
                aria-label={feature.title}
              >
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-primary-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[13px] leading-[1.55] text-primary-foreground/50">
                    {feature.description}
                  </p>
                </div>
                <ArrowRight className="hidden h-4 w-4 text-primary-foreground/30 transition-colors group-hover:text-vital sm:block" aria-hidden="true" />
              </motion.article>
            ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
