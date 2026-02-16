import { requireRole } from '@/lib/auth'
import DoctorLayout from '@/components/DoctorLayout'
import { getDoctorFollowUpResponses } from '@/lib/followup'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DoctorFollowUpsPage() {
  const { user, profile, supabase } = await requireRole('doctor')

  if (!profile) {
    redirect('/auth/complete-profile')
  }

  const { responses } = await getDoctorFollowUpResponses(user.id)

  const { data: doctor } = await supabase
    .from('doctores')
    .select('*')
    .eq('id', user.id)
    .single()

  const isPending = doctor?.status === 'pending' || doctor?.status === 'rejected'

  const getActionBadge = (action: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      logged: { bg: 'bg-secondary-100', text: 'text-ink-secondary', label: 'Registrado' },
      alert_doctor: { bg: 'bg-error-100', text: 'text-error-700', label: 'Requiere atención' },
      suggest_followup: { bg: 'bg-warning-100', text: 'text-warning-700', label: 'Sugerir seguimiento' },
      positive_outcome: { bg: 'bg-success-100', text: 'text-success-700', label: 'Mejoría positiva' },
      medication_taken: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Medicamento tomado' },
      medication_missed: { bg: 'bg-warning-100', text: 'text-warning-700', label: 'Omisión reportada' },
      prescription_renewal: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Renovación solicitada' },
    }
    return styles[action] || { bg: 'bg-secondary-100', text: 'text-ink-secondary', label: action }
  }

  if (isPending) {
    return (
      <DoctorLayout profile={profile} isPending={true} currentPath="/doctor/followups" pendingAppointments={0}>
        <div className="max-w-4xl">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-lg mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 0 10-2 0v4a1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-900">Tu perfil está en revisión</h3>
                <p className="text-yellow-700 mt-1">
                  Una vez aprobado, podrás ver las respuestas de seguimiento de tus pacientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DoctorLayout>
    )
  }

  return (
    <DoctorLayout profile={profile} isPending={false} currentPath="/doctor/followups" pendingAppointments={0}>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Respuestas de Seguimiento</h2>
            <p className="text-gray-600">Revisa las respuestas de tus pacientes a los seguimientos automáticos</p>
          </div>
          <Link
            href="/doctor"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Volver al dashboard →
          </Link>
        </div>

        {responses.length === 0 ? (
          <div className="bg-white rounded-lg shadow border p-12 text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-ink-secondary text-lg mb-2">Sin respuestas aún</p>
            <p className="text-ink-muted">
              Las respuestas de tus pacientes aparecerán aquí después de que completen sus consultas.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-secondary-50">
              <h3 className="font-semibold text-gray-900">
                Respuestas Recientes ({responses.length})
              </h3>
            </div>
            <div className="divide-y">
              {responses.map((response) => {
                const badge = getActionBadge(response.action_taken)
                return (
                  <div key={response.id} className="p-6 hover:bg-secondary-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">
                            {response.patient_name}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">"{response.response}"</p>
                        <p className="text-sm text-ink-muted">
                          {new Date(response.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        {response.action_taken === 'alert_doctor' && (
                          <Link
                            href={`/doctor/appointments?patient=${response.followup_id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-error-500 text-white text-sm font-medium rounded-lg hover:bg-error-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Agendar Seguimiento
                          </Link>
                        )}
                        {response.action_taken === 'prescription_renewal' && (
                          <Link
                            href={`/book/${response.followup_id}`}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Renovar Receta
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Mejoras Positivas</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {responses.filter(r => r.action_taken === 'positive_outcome').length}
            </p>
            <p className="text-sm text-gray-600">pacientes mejorando</p>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Requiere Atención</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {responses.filter(r => r.action_taken === 'alert_doctor').length}
            </p>
            <p className="text-sm text-gray-600">pacientes con alertas</p>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900">Renovaciones</h4>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {responses.filter(r => r.action_taken === 'prescription_renewal').length}
            </p>
            <p className="text-sm text-gray-600">renovaciones solicitadas</p>
          </div>
        </div>
      </div>
    </DoctorLayout>
  )
}
