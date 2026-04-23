'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, BookOpen, HeartPulse, ShieldCheck } from 'lucide-react'
import type { PublicLandingData } from '@/lib/public-trust'

type SocialProofBarProps = {
  trustData?: PublicLandingData | null
}

const proofItems = [
  {
    label: 'Médicos aprobados',
    icon: ShieldCheck,
    key: 'approvedDoctors' as const,
  },
  {
    label: 'Reseñas reales',
    icon: BookOpen,
    key: 'reviews' as const,
  },
  {
    label: 'Especialidades activas',
    icon: HeartPulse,
    key: 'specialties' as const,
  },
  {
    label: 'Verificados SEP',
    icon: BadgeCheck,
    key: 'verifiedDoctors' as const,
  },
]

export function SocialProofBar({ trustData }: SocialProofBarProps) {
  const metrics = trustData?.metrics
  const hasLiveMetrics = Boolean(
    metrics &&
      (metrics.approvedDoctors > 0 ||
        metrics.reviews > 0 ||
        metrics.specialties > 0 ||
        metrics.verifiedDoctors > 0)
  )
  const fallbackValues = ['Perfiles', 'Completadas', 'Activas', 'Cédula']

  return (
    <section className="border-y border-border bg-card py-4">
      <div className="editorial-shell">
        <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          {proofItems.map((item, index) => {
            const Icon = item.icon

            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <div className="flex h-full items-center gap-3 px-0 py-3 sm:px-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                      {hasLiveMetrics && metrics
                        ? metrics[item.key].toLocaleString('es-MX')
                        : fallbackValues[index]}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
