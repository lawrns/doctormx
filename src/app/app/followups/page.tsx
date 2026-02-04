import { requireRole } from '@/lib/auth'
import { getPatientFollowUps } from '@/lib/followup'
import Link from 'next/link'

export default async function PatientFollowUpsPage() {
  const { user } = await requireRole('patient')
  let followUps: Awaited<ReturnType<typeof getPatientFollowUps>> = []
  try {
    followUps = await getPatientFollowUps(user.id)
  } catch (error) {
    console.error('Error loading follow-ups:', error)
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
    return styles[status] || 'bg-secondary-100 text-ink-secondary'
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
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Seguimientos</h1>
          <p className="text-lg text-gray-600">Revisa el estado de tus seguimientos y respuestas</p>
        </div>

        {followUps.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card border border-border p-12 text-center">
            {/* Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>

            {/* Heading */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">No tienes seguimientos programados</h3>

            {/* 3-step visual flow */}
            <div className="flex items-center justify-center gap-4 mb-8 max-w-lg mx-auto">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 font-medium">1. Consulta</span>
              </div>

              {/* Arrow */}
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 font-medium">2. WhatsApp</span>
              </div>

              {/* Arrow */}
              <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="text-xs text-gray-600 font-medium">3. Doctor alertado</span>
              </div>
            </div>

            {/* Subtext */}
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Después de tu consulta, te enviaremos mensajes de seguimiento por WhatsApp.
            </p>

            {/* CTA Button */}
            <Link
              href="/doctors"
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
      </div>
    </div>
  )
}
