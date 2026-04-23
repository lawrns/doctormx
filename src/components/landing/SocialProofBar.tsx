'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, BookOpen, HeartPulse, ShieldCheck } from 'lucide-react'
import { Card } from '@/components/ui/card'
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

  return (
    <section className="border-y border-border bg-[linear-gradient(180deg,hsl(var(--surface-quiet))_0%,hsl(var(--surface-tint))_100%)] py-6">
      <div className="editorial-shell">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                <Card className="surface-panel flex h-full items-center gap-4 rounded-[var(--public-radius-control)] px-4 py-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[hsl(var(--surface-tint))] text-[hsl(var(--brand-ocean))]">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[hsl(var(--public-muted))]">
                      {item.label}
                    </p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-[hsl(var(--public-ink))]">
                      {metrics ? metrics[item.key].toLocaleString('es-MX') : '—'}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
