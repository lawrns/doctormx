'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MessageSquare, CheckCircle, AlertCircle, Phone } from 'lucide-react'
import { logger } from '@/lib/observability/logger'
import { apiRequest, APIError } from '@/lib/api'
import AppNavigation from '@/components/app/AppNavigation'

interface FollowUp {
  id: string
  type: 'follow_up_24h' | 'follow_up_7d' | 'medication_reminder' | 'prescription_refill' | 'chronic_care_check'
  status: 'pending' | 'sent' | 'failed' | 'responded' | 'cancelled'
  scheduled_at: string
  response?: string
  response_action?: 'logged' | 'alert_doctor' | 'suggest_followup' | 'positive_outcome' | 'medication_taken' | 'medication_missed' | 'prescription_renewal'
  appointment?: {
    id: string
    doctor?: {
      profile?: {
        full_name: string | null
      }
    }
  }
}

export default function FollowupsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchFollowUps()
  }, [])

  const fetchFollowUps = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await apiRequest<{ followUps: FollowUp[] }>('/api/patient/follow-ups', {
        method: 'GET',
      })
      setFollowUps(response.data.followUps || [])
    } catch (error) {
      const apiError = error as APIError
      
      if (apiError.code === 'TIMEOUT') {
        setErrorMessage('La solicitud tardó demasiado. Por favor, intenta de nuevo.')
      } else if (apiError.code === 'NETWORK_ERROR') {
        setErrorMessage('Error de conexión. Verifica tu internet e intenta de nuevo.')
      } else {
        setErrorMessage(apiError.message ?? 'Error al cargar seguimientos')
      }
      
      logger.error('Error fetching follow-ups', { 
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
      sent: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
      responded: 'bg-green-100 text-green-700',
      cancelled: 'bg-gray-100 text-gray-700',
    }
    return styles[status] ?? 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      sent: 'Enviado',
      failed: 'Fallido',
      responded: 'Respondido',
      cancelled: 'Cancelado',
    }
    return labels[status] || status
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      follow_up_24h: 'Seguimiento 24h',
      follow_up_7d: 'Seguimiento 7 días',
      medication_reminder: 'Recordatorio de medicación',
      prescription_refill: 'Renovación de receta',
      chronic_care_check: 'Cuidado crónico',
    }
    return labels[type] || type
  }

  const getTypeIcon = (type: string) => {
    if (type === 'follow_up_24h' || type === 'follow_up_7d') {
      return <Calendar className="w-5 h-5" />
    }
    if (type === 'medication_reminder') {
      return <MessageSquare className="w-5 h-5" />
    }
    if (type === 'prescription_refill') {
      return <AlertCircle className="w-5 h-5" />
    }
    return <CheckCircle className="w-5 h-5" />
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
      <AppNavigation currentPage="/app/followups" />

      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Seguimientos</h1>
          <p className="text-lg text-gray-600">Revisa el estado de tus seguimientos médicos</p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
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
              onClick={fetchFollowUps}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !errorMessage && followUps.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 text-lg mb-2">No tienes seguimientos programados</p>
            <p className="text-gray-500 mb-6">
              Después de tu primera consulta, recibirás mensajes de seguimiento para monitorear tu recuperación.
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

        {/* Follow-ups List */}
        {!isLoading && !errorMessage && followUps.length > 0 && (
          <div className="space-y-4">
            {followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                      {getTypeIcon(followUp.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          followUp.status
                        )}`}>
                          {getStatusLabel(followUp.status)}
                        </span>
                        <span className="text-sm text-gray-500">{getTypeLabel(followUp.type)}</span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {followUp.appointment?.doctor?.profile?.full_name ?? 'Doctor'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {formatDate(followUp.scheduled_at)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTime(followUp.scheduled_at)}
                    </p>
                  </div>
                </div>

                {followUp.response && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Tu respuesta:</p>
                    <p className="text-gray-900">{followUp.response}</p>
                  </div>
                )}

                {followUp.status === 'responded' && followUp.response_action && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Acción tomada:</span>{' '}
                      {followUp.response_action === 'logged' && 'Respuesta registrada'}
                      {followUp.response_action === 'alert_doctor' && 'Doctor alertado - te contactarán pronto'}
                      {followUp.response_action === 'suggest_followup' && 'Se sugirió agendar seguimiento'}
                      {followUp.response_action === 'positive_outcome' && '¡Mejoría confirmada!'}
                      {followUp.response_action === 'medication_taken' && 'Adherencia confirmada'}
                      {followUp.response_action === 'medication_missed' && 'Se preguntó sobre la omisión'}
                      {followUp.response_action === 'prescription_renewal' && 'Navegando a renovación'}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">¿Cómo funcionan los seguimientos?</h3>
              <p className="text-blue-700 text-sm">
                Después de tu consulta, te enviaremos mensajes de seguimiento por WhatsApp para verificar tu recuperación.
                Tus respuestas nos ayudan a mejorar tu atención y detectar cualquier problema a tiempo.
                Si reportas algún síntoma preocupante, tu doctor será alertado automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
