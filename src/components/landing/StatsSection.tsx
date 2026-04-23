'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, ClipboardCheck, CreditCard, MessageCircle } from 'lucide-react'
import { Eyebrow } from '@/components/Eyebrow'
import type { PublicLandingData } from '@/lib/public-trust'

type StatsSectionProps = {
  trustData?: PublicLandingData | null
}

const defaultStats = [
  { key: 'approvedDoctors' as const, label: 'Doctores aprobados', icon: BadgeCheck },
  { key: 'verifiedDoctors' as const, label: 'Cédulas verificadas', icon: ClipboardCheck },
  { key: 'reviews' as const, label: 'Reseñas reales', icon: MessageCircle },
  { key: 'specialties' as const, label: 'Especialidades activas', icon: CreditCard },
]

export function StatsSection({ trustData }: StatsSectionProps) {
  const metrics = trustData?.metrics

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(var(--surface-quiet))_0%,hsl(var(--card))_100%)] py-16 sm:py-20">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: [0, 0, 0.2, 1] }}
          className="mb-10 max-w-3xl"
        >
          <Eyebrow className="mb-4">Señales de confianza</Eyebrow>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-[hsl(var(--public-ink))]">
            Lo que la interfaz puede demostrar hoy.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-6 text-[hsl(var(--public-muted))]">
            Las cifras públicas solo aparecen cuando provienen de consultas reales al sistema. Si no hay dato, no se inventa.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-7 border-t border-border/80 pt-6 sm:grid-cols-2 lg:grid-cols-4">
          {defaultStats.map((stat, index) => {
            const Icon = stat.icon
            const value = metrics ? metrics[stat.key].toLocaleString('es-MX') : '—'

            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0, 0, 0.2, 1],
                }}
                className="surface-panel rounded-[var(--public-radius-control)] p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="mb-2 font-display text-2xl font-semibold leading-tight tracking-tight text-[hsl(var(--public-ink))]">
                  {value}
                </div>
                <p className="text-sm font-medium leading-6 text-[hsl(var(--public-muted))]">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>

        <p className="mt-8 max-w-2xl text-xs leading-5 text-[hsl(var(--public-muted))/0.78]">
          Las métricas se actualizan desde el catálogo y las reseñas públicas. Se omiten si no hay datos suficientes para mostrarlas con honestidad.
        </p>
      </div>
    </section>
  )
}
