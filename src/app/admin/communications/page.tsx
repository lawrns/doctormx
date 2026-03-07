import Link from 'next/link'
import { MessageSquareMore, Activity, BellRing, ShieldCheck } from 'lucide-react'
import { requireRole } from '@/lib/auth'

export default async function AdminCommunicationsPage() {
  const { supabase } = await requireRole('admin')

  const { data: conversations, count: conversationCount } = await supabase
    .from('chat_conversations')
    .select('id, patient_id, doctor_id, last_message_preview, last_message_at, created_at', { count: 'exact' })
    .order('last_message_at', { ascending: false })
    .limit(20)

  const { count: messageCount } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })

  const { count: receiptCount } = await supabase
    .from('chat_message_receipts')
    .select('id', { count: 'exact', head: true })

  const { count: missingDoctorProfilesCount } = await supabase
    .from('chat_conversations')
    .select('id, doctor:profiles!chat_conversations_doctor_id_fkey(id)', { count: 'exact', head: true })
    .is('doctor.id', null)

  const { count: missingPatientProfilesCount } = await supabase
    .from('chat_conversations')
    .select('id, patient:profiles!chat_conversations_patient_id_fkey(id)', { count: 'exact', head: true })
    .is('patient.id', null)

  const activeConversations24h = (conversations || []).filter((conversation) => {
    if (!conversation.last_message_at) return false
    return new Date(conversation.last_message_at).getTime() > Date.now() - 24 * 60 * 60 * 1000
  }).length

  const conversationsAwaitingFirstReply = (conversations || []).filter((conversation) => {
    return Boolean(conversation.last_message_preview) && !conversation.last_message_preview?.trim().startsWith('Dr.')
  }).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comunicaciones</h1>
            <p className="mt-1 text-gray-600">Visibilidad operativa inicial para doctor connect y soporte.</p>
          </div>
          <Link href="/admin" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Volver al admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-gray-900">Conversaciones</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{conversationCount || 0}</p>
            <p className="mt-1 text-sm text-gray-500">Threads doctor-paciente registrados</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-gray-900">Mensajes</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{messageCount || 0}</p>
            <p className="mt-1 text-sm text-gray-500">Volumen total de mensajes</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                <BellRing className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-gray-900">Actividad 24h</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeConversations24h}</p>
            <p className="mt-1 text-sm text-gray-500">Conversaciones con mensajes recientes</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-gray-900">Recibos de lectura</h2>
            </div>
            <p className="text-3xl font-bold text-gray-900">{receiptCount || 0}</p>
            <p className="mt-1 text-sm text-gray-500">Lecturas registradas por usuarios</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Integridad doctor</h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">{missingDoctorProfilesCount || 0}</p>
            <p className="mt-1 text-sm text-gray-500">Conversaciones con doctor sin perfil enlazado</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Integridad paciente</h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">{missingPatientProfilesCount || 0}</p>
            <p className="mt-1 text-sm text-gray-500">Conversaciones con paciente sin perfil enlazado</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900">Sin primera respuesta</h2>
            <p className="mt-3 text-3xl font-bold text-gray-900">{conversationsAwaitingFirstReply}</p>
            <p className="mt-1 text-sm text-gray-500">Threads que podrían requerir seguimiento operativo</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversaciones recientes</h2>
            <p className="mt-1 text-sm text-gray-500">Vista operativa rápida para revisar actividad reciente.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-gray-500">Conversación</th>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-gray-500">Paciente</th>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-gray-500">Doctor</th>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-gray-500">Último mensaje</th>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-gray-500">Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {(conversations || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No hay conversaciones para mostrar todavía.
                    </td>
                  </tr>
                ) : (
                  (conversations || []).map((conversation) => (
                    <tr key={conversation.id}>
                      <td className="px-6 py-4 font-medium text-gray-900">{conversation.id.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-gray-600">{conversation.patient_id}</td>
                      <td className="px-6 py-4 text-gray-600">{conversation.doctor_id}</td>
                      <td className="px-6 py-4 text-gray-600">{conversation.last_message_preview || 'Sin mensajes'}</td>
                      <td className="px-6 py-4 text-gray-600">{conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString('es-MX') : 'Sin actividad'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
