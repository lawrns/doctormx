'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, BadgeCheck } from 'lucide-react'
import { Eyebrow } from '@/components/Eyebrow'
import { Button } from '@/components/ui/button'
import type { PublicLandingData } from '@/lib/public-trust'

type CTASectionProps = {
  trustData?: PublicLandingData | null
}

export function CTASection({ trustData }: CTASectionProps) {
  const approvedDoctors = trustData?.metrics.approvedDoctors.toLocaleString('es-MX')

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,hsl(var(--public-ink))_0%,hsl(var(--brand-ocean))_100%)] py-16 sm:py-20">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-[hsl(var(--brand-sky)/0.24)] blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-12%] h-72 w-72 rounded-full bg-[hsl(var(--brand-leaf)/0.18)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <Eyebrow className="justify-center text-white/55">
            {approvedDoctors ? `${approvedDoctors} doctores aprobados` : 'Doctor.mx'}
          </Eyebrow>

          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-white">
            Empieza con Dr. Simeón. Agenda solo cuando tenga sentido.
          </h2>

          <p className="mx-auto max-w-2xl text-lg leading-8 text-white/76">
            Describe tus síntomas, recibe orientación inicial y pasa a médicos verificados con contexto, modalidad, precio y evidencia visible.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="default" size="lg" className="w-full bg-white text-[hsl(var(--public-ink))] hover:bg-white/95 sm:w-auto">
              <Link href="/ai-consulta">
                Hablar con Dr. Simeón
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full border-white/18 bg-white/6 text-white hover:bg-white/12 sm:w-auto">
              <Link href="/doctors">
                Ver médicos verificados
              </Link>
            </Button>
          </div>

          <div className="mx-auto grid max-w-2xl gap-3 border-t border-white/12 pt-5 text-left sm:grid-cols-[1.15fr_0.85fr]">
            <div className="flex gap-3 text-sm leading-6 text-white/82 sm:row-span-2">
              <Shield className="mt-1 h-4 w-4 shrink-0 text-white/85" />
              <span>Privacidad, seguridad y reserva guiada aparecen dentro del flujo, donde el paciente toma la decisión.</span>
            </div>
            <div className="flex gap-3 text-sm leading-6 text-white/82">
              <BadgeCheck className="mt-1 h-4 w-4 shrink-0 text-white/85" />
              <span>Cédula y verificación solo cuando existen.</span>
            </div>
            <div className="flex gap-3 text-sm leading-6 text-white/82">
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-white/85" />
              <span>De orientación a cita sin inflar señales.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
