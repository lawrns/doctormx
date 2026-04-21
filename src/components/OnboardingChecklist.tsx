'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Video,
  FileText,
  X,
  Search,
  User,
  Calendar as CalendarIcon,
  Star,
} from 'lucide-react'

export function WelcomeBanner({ patientName }: { patientName: string }) {
  const [show, setShow] = useState(true)

  if (!show) return null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-foreground mb-8">
      {/* Subtle decorative circle */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary/10 translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display mb-2">
              Bienvenido a Doctor.mx, {patientName}
            </h1>
            <p className="text-muted-foreground mb-4 max-w-lg">
              Tu plataforma de telemedicina de confianza. Encuentra doctores verificados,
              consulta desde casa y cuida tu salud de manera fácil y segura.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/doctors"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
                Buscar un doctor
              </Link>
              <Link
                href="/app/profile"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                <User className="h-4 w-4" />
                Completar mi perfil
              </Link>
            </div>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Doctores verificados</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Video className="h-4 w-4 text-primary" />
            <span>Videoconsultas</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 text-primary" />
            <span>Recetas digitales</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Doctor onboarding checklist
interface OnboardingChecklistProps {
  profileCompleted: boolean
  availabilitySet: boolean
  subscriptionActive: boolean
}

export function OnboardingChecklist({
  profileCompleted,
  availabilitySet,
  subscriptionActive,
}: OnboardingChecklistProps) {
  const steps = [
    {
      id: 'profile',
      label: 'Completa tu perfil',
      description: 'Añade tu información profesional, especialidad y foto',
      href: '/doctor/profile',
      completed: profileCompleted,
      icon: 'user',
    },
    {
      id: 'availability',
      label: 'Configura tu disponibilidad',
      description: 'Define tus horarios de atención',
      href: '/doctor/availability',
      completed: availabilitySet,
      icon: 'calendar',
    },
    {
      id: 'subscription',
      label: 'Activa tu suscripción',
      description: 'Elige un plan para comenzar a recibir pacientes',
      href: '/doctor/subscription',
      completed: subscriptionActive,
      icon: 'star',
    },
  ]

  const completedSteps = steps.filter(s => s.completed).length
  const progress = (completedSteps / steps.length) * 100

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-dx-1 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold font-display text-foreground">Completa tu configuración</h2>
          <p className="text-sm text-muted-foreground">Sigue estos pasos para comenzar</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{completedSteps}/{steps.length}</p>
          <p className="text-xs text-muted-foreground">completado</p>
        </div>
      </div>

      <div className="mb-6 h-2 w-full rounded-full bg-secondary">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
              step.completed
                ? 'border-primary/20 bg-primary/5'
                : 'border-border bg-secondary/50 hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              step.completed ? 'bg-primary/10' : 'bg-secondary'
            }`}>
              {step.completed ? (
                <ShieldCheck className="h-5 w-5 text-primary" />
              ) : step.icon === 'user' ? (
                <User className="h-5 w-5 text-muted-foreground" />
              ) : step.icon === 'calendar' ? (
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Star className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{step.label}</p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            {step.completed ? (
              <span className="text-xs font-medium text-primary">Completado</span>
            ) : (
              <span className="text-xs text-muted-foreground">Pendiente</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
