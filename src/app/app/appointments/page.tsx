'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, FileText, Video, MapPin, User } from 'lucide-react'
import { logger } from '@/lib/observability/logger'
import { apiRequest, APIError } from '@/lib/api'
import AppNavigation from '@/components/app/AppNavigation'

interface DoctorInfo {
  id: string
  specialty: string | null
  profile?: {
    full_name: string | null
    photo_url: string | null
  }
}

interface Appointment {
  id: string
  start_ts: string
  end_ts: string
  status: string
  appointment_type?: 'in_person' | 'video'
  video_status?: 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed'
  video_room_url?: string | null
  doctor?: DoctorInfo
}

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled'

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [activeTab])

  const fetchAppointments = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const statusFilter = activeTab === 'all' ? '' : `&status=${activeTab}`
      const response = await apiRequest<{ appointments: Appointment[] }>(`/api/appointments?${statusFilter}`, {
        method: 'GET',
      })

      setAppointments(response.data.appointments || [])
    } catch (error) {
      const apiError = error as APIError
      
      // Handle timeout error specifically
      if (apiError.code === 'TIMEOUT') {
        setErrorMessage('La solicitud tardó demasiado. Por favor, intenta de nuevo.')
      } else if (apiError.code === 'NETWORK_ERROR') {
        setErrorMessage('Error de conexión. Verifica tu internet e intenta de nuevo.')
      } else {
        setErrorMessage(apiError.message ?? 'Error al cargar citas')
      }
      
      logger.error('Error fetching appointments', { 
        error: apiError.message, 
        code: apiError.code,
        status: apiError.status 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-green-100 text-green-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-gray-100 text-gray-700',
      missed: 'bg-red-100 text-red-700',
    }
    return styles[status] ?? 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
      missed: 'Perdida',
    }
    return labels[status] || status
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation currentPage="/app/appointments" />

      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Citas</h1>
          <p className="text-lg text-gray-600">Gestiona tus consultas médicas</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 inline-flex gap-2">
          {[
            { key: 'all' as TabType, label: 'Todas' },
            { key: 'upcoming' as TabType, label: 'Próximas' },
            { key: 'completed' as TabType, label: 'Completadas' },
            { key: 'cancelled' as TabType, label: 'Canceladas' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 mb-4">{errorMessage}</p>
            <button
              onClick={fetchAppointments}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Appointments List */}
        {!isLoading && !errorMessage && appointments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg mb-2">No tienes citas en esta categoría</p>
            <p className="text-gray-500 mb-6">
              Agenda tu primera consulta con uno de nuestros doctores certificados.
            </p>
            <Link
              href="/doctores"
              className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Buscar Doctores
            </Link>
          </div>
        )}

        {/* Appointments Grid */}
        {!isLoading && !errorMessage && appointments.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Status Badge */}
                <div className="mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      appointment.status
                    )}`}
                  >
                    {getStatusLabel(appointment.status)}
                  </span>
                </div>

                {/* Doctor Info */}
                <div className="flex items-center gap-3 mb-4">
                  {appointment.doctor?.profile?.photo_url ? (
                    <img
                      src={appointment.doctor.profile.photo_url}
                      alt={appointment.doctor.profile.full_name ?? 'Doctor'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {appointment.doctor?.profile?.full_name ?? 'Doctor'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {appointment.doctor?.specialty ?? 'Médico General'}
                    </p>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(appointment.start_ts)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(appointment.start_ts)} - {formatTime(appointment.end_ts)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {appointment.appointment_type === 'video' ? (
                      <>
                        <Video className="w-4 h-4" />
                        <span>Videoconsulta</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>Consulta presencial</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {appointment.status === 'confirmed' && appointment.appointment_type === 'video' && (
                    <Link
                      href={`/consultation/${appointment.id}`}
                      className="flex-1 text-center px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                    >
                      Entrar a la consulta
                    </Link>
                  )}
                  <Link
                    href={`/consultation/${appointment.id}`}
                    className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
