import { requireRole } from '@/lib/auth'
import { getPatientFollowUps } from '@/lib/followup'
import Link from 'next/link'
import { logger } from '@/lib/observability/logger'
import AppNavigation from '@/components/app/AppNavigation'

export default async function PatientFollowUpsPage() {
  const { user } = await requireRole('patient')
  let followUps: Awaited<ReturnType<typeof getPatientFollowUps>> = []
  try {
    followUps = await getPatientFollowUps(user.id)
  } catch (error) {
    logger.error('Error loading follow-ups', { userId: user.id }, error as Error)
    followUps = []
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning-100 text-warning-700',
      sent: 'bg-primary-100 text-primary-700',
      failed: 'bg-error-100 text-error-700',
      responded: 'bg-success-100 text-success-700',
      cancelled: 'bg-secondary-100 text-ink-secondary',
    }
    return styles[status] ?? 'bg-secondary-100 text-ink-secondary'
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavigation currentPage="/app/followups" />

      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Seguimientos</h1>
            <p className="text-lg text-gray-600">Revisa el estado de tus seguimientos y respuestas</p>
          </div>

          {followUps.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card border border-border p-12 text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 012-2" />
                </svg>
              </div>
              <p className="text-ink-secondary text-lg mb-4">No tienes seguimientos programados</p>
              <p className="text-ink-muted mb-6">
                Después de tu primera consulta, recibirás mensajes de seguimiento para asegurarnos de que te sientas bien.
              </p>
              <Link
                href="/doctores"
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Buscar un doctor
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {followUps.map((followUp) => (
                <div
                  key={followUp.id}
                  className="bg-white rounded-2xl shadow-card border border-border p-6 hover:shadow-card-hover transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(followUp.status)}`}>
                          {followUp.status === 'pending' && 'Pendiente'}
                          {followUp.status === 'sent' && 'Enviado'}
                          {followUp.status === 'failed' && 'Fallido'}
                          {followUp.status === 'responded' && 'Respondido'}
                          {followUp.status === 'cancelled' && 'Cancelado'}
                        </span>
                        <span className="text-sm text-ink-secondary">
                          {getTypeLabel(followUp.type)}
                        </span>
                      </div>
                      <p className="text-ink-primary">
                        {followUp.type === 'follow_up_24h' && '¿Cómo te sientes 24 horas después de tu consulta?'}
                        {followUp.type === 'follow_up_7d' && 'Seguimiento a 7 días de tu consulta'}
                        {followUp.type === 'medication_reminder' && 'Recordatorio para tomar tu medicamento'}
                        {followUp.type === 'prescription_refill' && 'Tu receta está por terminarse'}
                        {followUp.type === 'chronic_care_check' && 'Verificación de tu condición crónica'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-ink-secondary mb-1">
                        {new Date(followUp.scheduled_at).toLocaleDateString('es-MX', {
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {new Date(followUp.scheduled_at).toLocaleTimeString('es-MX', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {followUp.response && (
                    <div className="bg-secondary-50 rounded-xl p-4 mt-4">
                      <p className="text-sm font-medium text-ink-secondary mb-1">Tu respuesta:</p>
                      <p className="text-ink-primary">{followUp.response}</p>
                    </div>
                  )}

                  {followUp.status === 'responded' && followUp.response_action && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-ink-secondary">
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

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1 4h-1m-6 0a1 1 0 11-6 0v12h4a9 9 0 011-1-1h-4m-6 0a1 1 0 01-1 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">¿Cómo funciona?</h3>
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
    </div>
  )
}
