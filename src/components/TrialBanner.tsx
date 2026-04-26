'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Clock, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TrialStatus } from '@/lib/trials'

interface TrialBannerProps {
  doctorId: string
  className?: string
}

export default function TrialBanner({ doctorId, className }: TrialBannerProps) {
  const [trial, setTrial] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  const loadTrial = useCallback(async () => {
    try {
      const res = await fetch(`/api/doctor/trial?doctorId=${encodeURIComponent(doctorId)}`)
      if (res.ok) {
        const data = await res.json()
        setTrial(data)
      }
    } catch {
      // Silently fail — trial banner is non-critical
    } finally {
      setLoading(false)
    }
  }, [doctorId])

  useEffect(() => {
    loadTrial()
  }, [loadTrial])

  if (loading || !trial || dismissed) return null

  const expired = trial.hasUsedTrial && !trial.isInTrial && trial.daysRemaining === 0
  const active = trial.isInTrial && trial.daysRemaining !== null && trial.daysRemaining > 0

  if (!active && !expired) return null

  const variant = expired ? 'expired' : trial.daysRemaining !== null && trial.daysRemaining <= 3 ? 'urgent' : 'active'

  const variantStyles = {
    active: 'bg-[hsl(var(--trust-soft))] border-[hsl(var(--trust)/0.20)] text-[hsl(var(--trust))]',
    urgent: 'bg-amber-50 border-amber-200 text-amber-800',
    expired: 'bg-destructive/10 border-destructive/20 text-destructive',
  }

  const Icon = expired ? AlertTriangle : Clock

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 border-b text-sm font-medium transition-colors',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">
          {expired
            ? 'Tu prueba gratuita ha terminado. Activa tu plan para seguir recibiendo pacientes.'
            : `Te quedan ${trial.daysRemaining} días de prueba gratuita. Activa tu plan →`}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {active && (
          <Link
            href="/doctor/subscription"
            className="px-3 py-1 rounded-lg bg-white/80 text-ink text-xs font-semibold hover:bg-white transition-colors whitespace-nowrap"
          >
            Activar plan
          </Link>
        )}
        {expired && (
          <Link
            href="/doctor/subscription"
            className="px-3 py-1 rounded-lg bg-destructive text-white text-xs font-semibold hover:bg-destructive/90 transition-colors whitespace-nowrap"
          >
            Activar plan
          </Link>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-md hover:bg-black/10 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
