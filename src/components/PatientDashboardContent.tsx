'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewTrigger } from '@/components/ReviewTrigger'
import {
  Droplets,
  Moon,
  Activity,
  Apple,
  Lightbulb,
  ArrowRight,
} from 'lucide-react'

interface Appointment {
  id: string
  doctor_id: string
  start_ts: string
  status: string
  doctor?: {
    profile?: {
      full_name: string
    }
  }
}

interface PatientDashboardContentProps {
  appointments: Appointment[]
}

export function PatientDashboardContent({ appointments }: PatientDashboardContentProps) {
  const [shown, setShown] = useState(false)

  const completedAppointments = appointments.filter(apt => apt.status === 'completed')

  const reviewableAppointments = completedAppointments
    .filter(apt => {
      const date = new Date(apt.start_ts)
      const daysSinceCompleted = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceCompleted <= 30
    })
    .slice(0, 3)

  const upcomingAppointments = appointments.filter(apt =>
    ['confirmed', 'pending_payment'].includes(apt.status) && new Date(apt.start_ts) > new Date()
  )

  if (reviewableAppointments.length === 0 || shown) {
    return null
  }

  return (
    <>
      {upcomingAppointments.length > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-foreground">Tienes consultas próximas</h2>
              <p className="text-sm text-muted-foreground">
                Tu próxima consulta es el {new Date(upcomingAppointments[0].start_ts).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Link
              href="/app/appointments"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Ver detalles
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      <ReviewTrigger
        appointments={reviewableAppointments.map(apt => ({
          id: apt.id,
          doctor_id: apt.doctor_id,
          doctor_name: apt.doctor?.profile?.full_name || 'Doctor',
          appointment_date: apt.start_ts,
        }))}
        onReviewSubmitted={() => setShown(true)}
      />
    </>
  )
}

export function HealthTips() {
  const tips = [
    {
      icon: Droplets,
      title: 'Mantente hidratado',
      description: 'Bebe al menos 8 vasos de agua al día para mantener tu cuerpo funcionando de manera óptima.',
    },
    {
      icon: Moon,
      title: 'Duerme bien',
      description: '7-9 horas de sueño nocturno ayudan a tu sistema inmune y bienestar mental.',
    },
    {
      icon: Activity,
      title: 'Movimiento diario',
      description: '30 minutos de actividad física moderada mejoran tu salud cardiovascular.',
    },
    {
      icon: Apple,
      title: 'Alimentación balanceada',
      description: 'Incluye frutas, verduras y proteínas en cada comida.',
    },
  ]

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Tips de Salud
        </h2>
        <Link href="/app/profile" className="text-sm font-medium text-primary hover:text-primary/80">
          Ver más →
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-4 rounded-xl border border-transparent bg-secondary/50 p-4 transition-colors hover:border-border hover:bg-secondary">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <tip.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{tip.title}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function QuickStats({ appointments }: { appointments: Appointment[] }) {
  const completed = appointments.filter(a => a.status === 'completed').length
  const upcoming = appointments.filter(a => ['confirmed', 'pending_payment'].includes(a.status) && new Date(a.start_ts) > new Date()).length

  return (
    <div className="mb-8 grid grid-cols-2 gap-4">
      <Link href="/doctors" className="block">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-shadow hover:shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {completed > 0 ? 'Consultas completadas' : 'Agenda tu primera consulta →'}
          </p>
          <p className="text-3xl font-bold text-foreground">{completed || '→'}</p>
        </div>
      </Link>
      <Link href="/doctors" className="block">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 transition-shadow hover:shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {upcoming > 0 ? 'Próximas consultas' : 'No tienes citas próximas'}
          </p>
          <p className="text-3xl font-bold text-foreground">{upcoming || 'Buscar'}</p>
        </div>
      </Link>
    </div>
  )
}
