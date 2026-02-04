'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ReviewTrigger } from '@/components/ReviewTrigger'
import { 
  Droplets, 
  Moon, 
  Activity, 
  Apple,
  Lightbulb
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

// Health Tips Component for patient dashboard
export function HealthTips() {
  const tips = [
    {
      icon: Droplets,
      title: 'Mantente hidratado',
      description: 'Bebe al menos 8 vasos de agua al día para mantener tu cuerpo funcionando de manera óptima.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Moon,
      title: 'Duerme bien',
      description: '7-9 horas de sueño nocturno ayudan a tu sistema inmune y bienestar mental.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Activity,
      title: 'Movimiento diario',
      description: '30 minutos de actividad física moderada mejoran tu salud cardiovascular.',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Apple,
      title: 'Alimentación balanceada',
      description: 'Incluye frutas, verduras y proteínas en cada comida.',
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-card border border-border p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Tips de Salud
        </h2>
        <Link href="/app/profile" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
          Ver más →
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors border border-transparent hover:border-gray-100">
            <div className={`w-12 h-12 rounded-xl ${tip.bgColor} flex items-center justify-center flex-shrink-0`}>
              <tip.icon className={`w-6 h-6 ${tip.color}`} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{tip.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{tip.description}</p>
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
      <Link href="/doctors" className="block">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white hover:shadow-lg transition-shadow">
          <p className="text-blue-100 text-sm font-medium">
            {completed > 0 ? 'Consultas completadas' : 'Agenda tu primera consulta →'}
          </p>
          <p className="text-3xl font-bold">{completed || '→'}</p>
        </div>
      </Link>
      <Link href="/doctors" className="block">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 text-white hover:shadow-lg transition-shadow">
          <p className="text-blue-100 text-sm font-medium">
            {upcoming > 0 ? 'Próximas consultas' : 'No tienes citas próximas'}
          </p>
          <p className="text-3xl font-bold">{upcoming || 'Buscar'}</p>
        </div>
      </Link>
    </div>
  )
}
