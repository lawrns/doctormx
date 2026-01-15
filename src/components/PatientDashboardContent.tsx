'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewTrigger } from '@/components/ReviewTrigger'

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
              <h2 className="text-lg font-semibold mb-1">📅 Tienes consultas próximas</h2>
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

// Health Tips Component for patient dashboard
export function HealthTips() {
  const tips = [
    {
      icon: '💧',
      title: 'Mantente hidratado',
      description: 'Bebe al menos 8 vasos de agua al día para mantener tu cuerpo funcionando optimally.',
    },
    {
      icon: '😴',
      title: 'Duerme bien',
      description: '7-9 horas de sueño nocturno ayudan a tu sistema inmune y bienestar mental.',
    },
    {
      icon: '🚶',
      title: 'Movimiento diario',
      description: '30 minutos de actividad física moderaday mejoran tu salud cardiovascular.',
    },
    {
      icon: '🥗',
      title: 'Alimentación balanceada',
      description: 'Incluye frutas, verduras y proteínas en cada comida.',
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">💡 Tips de Salud</h2>
        <Link href="/app/profile" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver más →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors">
            <span className="text-2xl">{tip.icon}</span>
            <div>
              <p className="font-medium text-gray-900">{tip.title}</p>
              <p className="text-sm text-gray-600">{tip.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quick Stats Component
export function QuickStats({ appointments }: { appointments: Appointment[] }) {
  const completed = appointments.filter(a => a.status === 'completed').length
  const upcoming = appointments.filter(a => ['confirmed', 'pending_payment'].includes(a.status) && new Date(a.start_ts) > new Date()).length

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-4 text-white">
        <p className="text-green-100 text-sm font-medium">Consultas completadas</p>
        <p className="text-3xl font-bold">{completed}</p>
      </div>
      <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 text-white">
        <p className="text-blue-100 text-sm font-medium">Próximas consultas</p>
        <p className="text-3xl font-bold">{upcoming}</p>
      </div>
    </div>
  )
}
