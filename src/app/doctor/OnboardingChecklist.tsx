'use client'

import Link from 'next/link'
import { CheckCircle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function OnboardingChecklist({ completeness, doctorId, doctor }: {
  completeness: { completed: number; total: number; missing: string[] }
  doctorId: string
  doctor: any
}) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('doctor-onboarding-dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      localStorage.setItem('doctor-onboarding-dismissed', 'true')
      setIsDismissed(true)
    }, 200)
  }

  if (isDismissed) return null

  const progressPercent = Math.round((completeness.completed / completeness.total) * 100)

  return (
    <div
      className={`bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-6 mb-8 relative transition-all duration-200 ease-out ${
        isAnimatingOut ? 'opacity-0 translate-y-[-8px]' : 'opacity-100 translate-y-0'
      }`}
      role="region"
      aria-label="Configuración del perfil"
    >
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors duration-150 p-1 rounded-md hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Cerrar configuración del perfil"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Configura tu perfil para recibir pacientes</h3>
          <p className="text-sm text-text-muted mt-1">
            {completeness.completed} de {completeness.total} pasos completados
          </p>
        </div>
        <div className="text-right">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-1 border border-primary/20">
            <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de configuración: ${progressPercent}%`}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 text-success py-2 px-2 rounded-lg">
          <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-sm flex-1">Crear cuenta</span>
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium" aria-label="Completado">
            ✓
          </span>
        </div>
        <div className="flex items-center gap-3 text-success py-2 px-2 rounded-lg">
          <CheckCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span className="text-sm flex-1">Verificar cédula profesional</span>
          <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium" aria-label="Completado">
            ✓
          </span>
        </div>

        {completeness.missing.includes('biografía detallada') && (
          <Link
            href="/doctor/profile"
            className="flex items-center gap-3 text-text-primary hover:text-primary py-2 px-2 rounded-lg hover:bg-background transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg group"
          >
            <div className="w-5 h-5 border-2 border-muted rounded-full shrink-0" aria-hidden="true" />
            <span className="text-sm flex-1 group-hover:underline">Completar perfil</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium ml-auto">
              Pendiente
            </span>
          </Link>
        )}

        {completeness.missing.includes('disponibilidad') && (
          <Link
            href="/doctor/availability"
            className="flex items-center gap-3 text-text-primary hover:text-primary py-2 px-2 rounded-lg hover:bg-background transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg group"
          >
            <div className="w-5 h-5 border-2 border-muted rounded-full shrink-0" aria-hidden="true" />
            <span className="text-sm flex-1 group-hover:underline">Configurar disponibilidad</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium ml-auto">
              Pendiente
            </span>
          </Link>
        )}

        {(completeness.missing.includes('cédula') || completeness.missing.includes('nombre') || completeness.missing.includes('precio de consulta')) && (
          <Link
            href="/doctor/onboarding"
            className="flex items-center gap-3 text-text-primary hover:text-primary py-2 px-2 rounded-lg hover:bg-background transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg group"
          >
            <div className="w-5 h-5 border-2 border-muted rounded-full shrink-0" aria-hidden="true" />
            <span className="text-sm flex-1 group-hover:underline">Completar información requerida</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium ml-auto">
              Pendiente
            </span>
          </Link>
        )}
      </div>
    </div>
  )
}
