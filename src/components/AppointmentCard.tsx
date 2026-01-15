'use client'

import Link from 'next/link'
import { Badge, getAppointmentBadgeVariant, getAppointmentStatusLabel } from './Badge'

export type AppointmentData = {
  id: string
  patient_name: string
  start_ts: string
  end_ts: string
  status: string
  service_name?: string | null
}

type AppointmentCardProps = {
  appointment: AppointmentData
  showActions?: boolean
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  return {
    date: date.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
    time: date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

function formatTimeRange(startTs: string, endTs: string) {
  const start = new Date(startTs)
  const end = new Date(endTs)
  const startTime = start.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  return `${startTime} - ${endTime}`
}

export function AppointmentCard({ appointment, showActions = true }: AppointmentCardProps) {
  const { date } = formatDateTime(appointment.start_ts)
  const timeRange = formatTimeRange(appointment.start_ts, appointment.end_ts)
  const isUpcoming = new Date(appointment.start_ts) > new Date()
  const isConfirmed = appointment.status === 'confirmed'

  return (
    <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-900 truncate">
              {appointment.patient_name}
            </h4>
            <Badge variant={getAppointmentBadgeVariant(appointment.status)}>
              {getAppointmentStatusLabel(appointment.status)}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeRange}
            </span>
          </div>

          {appointment.service_name && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              {appointment.service_name}
            </p>
          )}
        </div>

        {showActions && isUpcoming && isConfirmed && (
          <div className="flex gap-2 flex-shrink-0">
            <Link
              href={`/doctor/prescription/${appointment.id}`}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
            >
              Receta
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Compact version for dashboard
export function AppointmentCardCompact({ appointment }: { appointment: AppointmentData }) {
  const { time } = formatDateTime(appointment.start_ts)

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium">
          {appointment.patient_name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-gray-900 text-sm">{appointment.patient_name}</p>
          <p className="text-xs text-gray-500">{time}</p>
        </div>
      </div>
      <Badge variant={getAppointmentBadgeVariant(appointment.status)} size="sm">
        {getAppointmentStatusLabel(appointment.status)}
      </Badge>
    </div>
  )
}
