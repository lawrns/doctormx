'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Star, CheckCircle2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ── Star rating sub-component ───────────────────────────────────────────────

function StarRating() {
  const [rating, setRating] = useState<number>(0)
  const [hovered, setHovered] = useState<number>(0)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-[hsl(var(--trust))]">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-medium">Gracias por tu calificación</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hovered || rating) >= star
        return (
          <button
            key={star}
            onClick={() => {
              setRating(star)
              // Brief delay so user sees the filled state before confirmation
              setTimeout(() => setSubmitted(true), 600)
            }}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Calificar ${star} de 5`}
            className="p-1 rounded-lg transition-transform duration-150 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            <Star
              className={`w-7 h-7 transition-colors duration-150 ${
                active
                  ? 'fill-[hsl(var(--warning))] text-[hsl(var(--warning))]'
                  : 'fill-transparent text-[hsl(var(--border-color))]'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}

// ── Benefits list data ──────────────────────────────────────────────────────

const benefits = [
  'Mensajería directa con tu médico',
  'Historial clínico organizado',
  'Recordatorios preventivos',
  'Recetas digitales en WhatsApp',
]

// ── Page component ──────────────────────────────────────────────────────────

export default function ContinuarPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-soft))] flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-lg space-y-6">

        {/* ── Section 1: Thank you + rating ── */}
        <div className="rounded-2xl border border-[hsl(var(--border-color))] bg-[hsl(var(--surface-card))] shadow-[var(--shadow-sm)] px-6 py-6">
          <h2 className="font-display text-xl font-bold text-[hsl(var(--ink))] mb-1">
            ¡Consulta completada!
          </h2>
          <p className="text-[hsl(var(--ink-soft))] text-sm mb-5">
            ¿Cómo te fue en tu consulta?
          </p>
          <StarRating />
        </div>

        {/* ── Section 2: Cuidado Continuo upsell ── */}
        <div className="rounded-2xl border-2 border-[hsl(var(--interactive)/0.35)] bg-[hsl(var(--surface-card))] shadow-[var(--shadow-lg)] overflow-hidden">
          {/* Top accent strip */}
          <div className="px-6 py-2 bg-[hsl(var(--interactive))] text-white text-xs font-semibold text-center tracking-wide uppercase">
            14 días gratis — sin tarjeta requerida
          </div>

          <div className="px-6 py-7 space-y-6">
            {/* Headline */}
            <div>
              <h2 className="font-display text-2xl font-bold text-[hsl(var(--ink))] leading-snug mb-1">
                Activa Cuidado Continuo — 14 días gratis
              </h2>
              <p className="text-[hsl(var(--ink-soft))] text-sm">
                Después, solo{' '}
                <span className="font-semibold text-[hsl(var(--ink))]">$299/mes</span>.
                Cancela cuando quieras.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-3">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-sm text-[hsl(var(--ink-soft))]">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--trust))] shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* Primary CTA */}
            <Link href="/app/suscripcion" className="block">
              <Button size="xl" variant="primary" className="w-full">
                Activar mis 14 días gratis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>

            {/* Secondary CTA */}
            <Link href="/doctors" className="block">
              <Button size="default" variant="outline" className="w-full">
                Solo quiero otra consulta
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Section 3: Trust note ── */}
        <p className="text-center text-xs text-[hsl(var(--ink-soft))] px-4 leading-relaxed">
          Sin compromisos. Cancela antes del día 14 y no te cobramos nada.
        </p>

      </div>
    </div>
  )
}
