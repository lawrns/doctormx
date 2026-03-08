'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Badge,
  EmptyState,
  LoadingButton,
  Avatar,
  Modal,
  ModalFooter,
} from '@/components'
import { useToast } from '@/components/Toast'
import { Calendar } from 'lucide-react'
import { formatDoctorName } from '@/lib/utils'

interface DoctorInfo {
  id: string
  specialty: string | null
  price_cents: number
  currency: string
  rating: number | null
  profile?: {
    full_name: string | null
    photo_url: string | null
  }
}

interface PaymentInfo {
  amount_cents: number
  currency: string
  status: string
}

interface Appointment {
  id: string
  start_ts: string
  end_ts: string
  status: string
  appointment_type?: 'in_person' | 'video'
  video_status?: 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed'
  video_room_url?: string | null
  video_started_at?: string | null
  doctor?: DoctorInfo
  payment?: PaymentInfo | null
}

type TabType = 'all' | 'upcoming' | 'completed' | 'cancelled'

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'upcoming', label: 'Próximas' },
  { key: 'completed', label: 'Completadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

function formatDateTime(dateStr: string): { date: string; time: string; weekday: string } {
  const date = new Date(dateStr)
  return {
    date: date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
    time: date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    weekday: date.toLocaleDateString('es-MX', { weekday: 'short' }),
  }
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency || 'MXN',
  }).format(cents / 100)
}

function getStatusInfo(status: string): { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; colorClass: string } {
  const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral'; colorClass: string }> = {
    pending_payment: { label: 'Pago pendiente', variant: 'warning', colorClass: 'bg-yellow-100 text-yellow-800' },
    confirmed: { label: 'Confirmada', variant: 'success', colorClass: 'bg-teal-50 text-teal-800' },
    completed: { label: 'Completada', variant: 'info', colorClass: 'bg-blue-100 text-blue-800' },
    cancelled: { label: 'Cancelada', variant: 'error', colorClass: 'bg-red-100 text-red-800' },
    refunded: { label: 'Reembolsada', variant: 'neutral', colorClass: 'bg-gray-100 text-gray-800' },
    no_show: { label: 'No asistió', variant: 'error', colorClass: 'bg-red-100 text-red-800' },
  }
  return statusMap[status] || { label: status, variant: 'neutral', colorClass: 'bg-gray-100 text-gray-800' }
}

function AppointmentCard({ appointment, onCancel }: { appointment: Appointment; onCancel: (id: string) => void }) {
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [callDuration, setCallDuration] = useState<number | null>(null)

  // Update call duration for in-progress video calls
  useEffect(() => {
    if (appointment.video_status === 'in_progress' && appointment.video_started_at) {
      const startTime = new Date(appointment.video_started_at)
      setCallDuration(Math.floor((Date.now() - startTime.getTime()) / (1000 * 60)))

      const interval = setInterval(() => {
        const now = Date.now()
        const duration = Math.floor((now - startTime.getTime()) / (1000 * 60))
        setCallDuration(duration)
      }, 60000) // Update every minute

      return () => clearInterval(interval)
    }
  }, [appointment.video_status, appointment.video_started_at])

  const { date, time, weekday } = formatDateTime(appointment.start_ts)
  const statusInfo = getStatusInfo(appointment.status)
  const doctorName = appointment.doctor?.profile?.full_name || 'Doctor'
  const specialty = appointment.doctor?.specialty || 'Especialidad'
  const price = appointment.doctor?.price_cents || 0
  const currency = appointment.doctor?.currency || 'MXN'
  const doctorId = appointment.doctor?.id || ''

  const isVideo = appointment.appointment_type === 'video'
  const now = new Date()
  const startTime = new Date(appointment.start_ts)
  const endTime = new Date(appointment.end_ts)
  const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60 * 1000)

  // Video call states
  const isUpcoming = startTime > now && now < fifteenMinutesBefore
  const isInLobby = isVideo && startTime > now && now >= fifteenMinutesBefore
  const isInProgress = appointment.video_status === 'in_progress' || (isVideo && now >= startTime && now < endTime && appointment.video_status === 'ready')
  const isCompleted = appointment.status === 'completed'

  const canCancel = isUpcoming && ['pending_payment', 'confirmed'].includes(appointment.status)
  const canRebook = isCompleted || appointment.status === 'cancelled'

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await onCancel(appointment.id)
      setShowCancelModal(false)
    } finally {
      setIsCancelling(false)
    }
  }

  // Get video status badge
  const getVideoStatusBadge = () => {
    if (!isVideo) return null

    if (isInProgress) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          En curso {callDuration !== null && `(${callDuration} min)`}
        </Badge>
      )
    }

    if (isInLobby || appointment.video_status === 'ready') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Lista para unirse
        </Badge>
      )
    }

    return null
  }

  return (
    <>
      <div className={`bg-white rounded-lg border hover:shadow-md transition-shadow p-4 ${isInProgress ? 'border-l-4 border-l-red-500' : isInLobby ? 'border-l-4 border-l-green-500' : ''}`}>
        <div className="flex items-start gap-4">
          <Avatar
            name={doctorName}
            src={appointment.doctor?.profile?.photo_url}
            size="lg"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={`/doctors/${doctorId}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {formatDoctorName(doctorName)}
                </Link>
                <p className="text-sm text-gray-500">{specialty}</p>
              </div>
              <div className="flex items-center gap-2">
                {getVideoStatusBadge()}
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {weekday}, {date}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {time}
              </span>
              {isVideo ? (
                <span className="flex items-center gap-1 text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Videoconsulta
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Presencial
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(price, currency)}
              </span>

              <div className="flex gap-2 flex-wrap">
                {/* Video call states */}
                {isVideo && isInProgress && (
                  <Link
                    href={`/app/appointments/${appointment.id}/video`}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Volver a llamada
                  </Link>
                )}

                {isVideo && isInLobby && (
                  <Link
                    href={`/app/appointments/${appointment.id}/video`}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Unirse
                  </Link>
                )}

                {/* Completed state actions */}
                {isCompleted && (
                  <>
                    <Link
                      href={`/app/appointments/${appointment.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Ver resumen
                    </Link>
                    <Link
                      href={`/doctors/${doctorId}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Agendar seguimiento
                    </Link>
                  </>
                )}

                {/* Rebook button */}
                {canRebook && !isCompleted && (
                  <Link
                    href={`/doctors/${doctorId}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Nueva cita
                  </Link>
                )}

                {/* Cancel button */}
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancelar
                  </button>
                )}

                {/* Details button */}
                <Link
                  href={`/app/appointments/${appointment.id}`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Cita"
        size="sm"
      >
        <p className="text-gray-600">
          ¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer.
        </p>
        <ModalFooter>
          <button
            onClick={() => setShowCancelModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Mantener cita
          </button>
          <LoadingButton
            isLoading={isCancelling}
            onClick={handleCancel}
            variant="danger"
          >
            Sí, cancelar
          </LoadingButton>
        </ModalFooter>
      </Modal>
    </>
  )
}

function AppointmentsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchAppointments = useCallback(async (status: TabType) => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const params = new URLSearchParams()
      if (status !== 'all') {
        params.set('status', status)
      }

      const response = await fetch(`/api/patient/appointments?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setAppointments(data.appointments || [])
      } else {
        setErrorMessage(data.error || 'Error al cargar citas')
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setErrorMessage('Error al cargar citas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType
    if (tabParam && tabs.some(t => t.key === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    fetchAppointments(activeTab)
  }, [activeTab, fetchAppointments])

  const handleCancel = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by patient' }),
      })

      const data = await response.json()

      if (response.ok) {
        setAppointments((current) => current.map((appointment) => (
          appointment.id === appointmentId
            ? {
                ...appointment,
                status: data.appointment?.status || 'cancelled',
              }
            : appointment
        )))
        addToast('La cita fue cancelada correctamente.', 'success')
      } else {
        setErrorMessage(data.error || 'Error al cancelar cita')
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      setErrorMessage('Error al cancelar cita')
    }
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    router.push(`/app/appointments?${params.toString()}`)
  }

  const getFilteredCount = (status: TabType): number => {
    if (status === 'all') return appointments.length
    if (status === 'upcoming') {
      return appointments.filter(a => ['pending_payment', 'confirmed'].includes(a.status)).length
    }
    if (status === 'completed') {
      return appointments.filter(a => a.status === 'completed').length
    }
    if (status === 'cancelled') {
      return appointments.filter(a => ['cancelled', 'refunded', 'no_show'].includes(a.status)).length
    }
    return 0
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Citas</h1>
          <p className="text-gray-600">Gestiona tus consultas médicas</p>
        </div>
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getFilteredCount(tab.key)}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState
            iconName="calendar"
            title={
              activeTab === 'all'
                ? 'No tienes citas programadas'
                : activeTab === 'upcoming'
                ? 'No tienes citas próximas'
                : activeTab === 'completed'
                ? 'No tienes citas completadas'
                : 'No tienes citas canceladas'
            }
            description={
              activeTab === 'all'
                ? 'Cuando reserves una cita con un doctor, aparecerá aquí.'
                : 'No se encontraron citas en esta categoría.'
            }
            action={
              activeTab === 'all' || activeTab === 'upcoming'
                ? { label: 'Buscar un doctor', href: '/doctors' }
                : undefined
            }
          />
        ) : (
          <div className="space-y-4">
            {appointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Cargando...</div></div>}>
      <AppointmentsPageContent />
    </Suspense>
  )
}
