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
  Users,
  Calendar
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
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">Tienes consultas próximas</h2>
              <p className="text-primary-100 text-sm">
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
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
            >
              Ver detalles
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

// Health Tips Component - Horizontal Scrollable Carousel
export function HealthTips() {
  const tips = [
    {
      icon: Droplets,
      title: 'Mantente hidratado',
      description: 'Bebe al menos 8 vasos de agua al día.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Moon,
      title: 'Duerme bien',
      description: '7-9 horas de sueño nocturno.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Activity,
      title: 'Movimiento diario',
      description: '30 minutos de actividad física.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Apple,
      title: 'Alimentación balanceada',
      description: 'Frutas, verduras y proteínas.',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Tips de Salud
        </h2>
        <Link href="/app/profile" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver más →
        </Link>
      </div>
      {/* Horizontal Scrollable Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-64 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors border border-transparent hover:border-gray-100"
          >
            <div className={`w-10 h-10 rounded-lg ${tip.bgColor} flex items-center justify-center mb-3`}>
              <tip.icon className={`w-5 h-5 ${tip.color}`} />
            </div>
            <p className="font-semibold text-gray-900 text-sm">{tip.title}</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{tip.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quick Stats Component - Redesigned as "Agenda tu primera consulta" CTA
export function QuickStats({ appointments }: { appointments: Appointment[] }) {
  const completed = appointments.filter(a => a.status === 'completed').length
  const upcoming = appointments.filter(a => ['confirmed', 'pending_payment'].includes(a.status) && new Date(a.start_ts) > new Date()).length

  // If user has appointments, don't show the CTA
  if (completed > 0 || upcoming > 0) {
    return null
  }

  return (
    <Link href="/doctors" className="block mb-8 group">
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Doctor avatar cluster */}
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-white/20 border-2 border-primary-500 flex items-center justify-center text-white font-semibold"
                  style={{ zIndex: 3 - i }}
                >
                  Dr{i}
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">Agenda tu primera consulta</h3>
              <p className="text-primary-100 text-sm">Doctores verificados disponibles hoy</p>
            </div>
          </div>
          <div className="bg-white text-primary-600 px-5 py-3 rounded-xl font-semibold group-hover:bg-primary-50 transition-colors">
            Buscar doctor →
          </div>
        </div>
      </div>
    </Link>
  )
}

// Recent Consultations Empty State
export function RecentConsultationsEmpty() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-primary-400" />
      </div>
      <p className="text-gray-900 font-medium mb-2">Aún no tienes consultas</p>
      <p className="text-gray-500 text-sm max-w-sm mx-auto">
        Tu historial de consultas aparecerá aquí después de tu primera cita.
      </p>
    </div>
  )
}
