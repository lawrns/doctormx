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
    <div className="min-h-screen bg-secondary/50">
      <header className="bg-card shadow">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Comunicaciones</h1>
            <p className="mt-1 text-muted-foreground">Visibilidad operativa inicial para doctor connect y soporte.</p>
          </div>
          <Link href="/admin" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Volver al admin
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <MessageSquareMore className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-foreground">Conversaciones</h2>
            </div>
            <p className="text-3xl font-bold text-foreground">{conversationCount || 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Threads doctor-paciente registrados</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-foreground">Mensajes</h2>
            </div>
            <p className="text-3xl font-bold text-foreground">{messageCount || 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Volumen total de mensajes</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                <BellRing className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-foreground">Actividad 24h</h2>
            </div>
            <p className="text-3xl font-bold text-foreground">{activeConversations24h}</p>
            <p className="mt-1 text-sm text-muted-foreground">Conversaciones con mensajes recientes</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2 text-purple-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-foreground">Recibos de lectura</h2>
            </div>
            <p className="text-3xl font-bold text-foreground">{receiptCount || 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Lecturas registradas por usuarios</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-foreground">Integridad doctor</h2>
            <p className="mt-3 text-3xl font-bold text-foreground">{missingDoctorProfilesCount || 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Conversaciones con doctor sin perfil enlazado</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-foreground">Integridad paciente</h2>
            <p className="mt-3 text-3xl font-bold text-foreground">{missingPatientProfilesCount || 0}</p>
            <p className="mt-1 text-sm text-muted-foreground">Conversaciones con paciente sin perfil enlazado</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="font-semibold text-foreground">Sin primera respuesta</h2>
            <p className="mt-3 text-3xl font-bold text-foreground">{conversationsAwaitingFirstReply}</p>
            <p className="mt-1 text-sm text-muted-foreground">Threads que podrían requerir seguimiento operativo</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Conversaciones recientes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Vista operativa rápida para revisar actividad reciente.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-muted-foreground">Conversación</th>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-muted-foreground">Paciente</th>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-muted-foreground">Doctor</th>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-muted-foreground">Último mensaje</th>
                  <th className="px-6 py-3 text-left font-medium uppercase tracking-wide text-muted-foreground">Actividad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-card">
                {(conversations || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No hay conversaciones para mostrar todavía.
                    </td>
                  </tr>
                ) : (
                  (conversations || []).map((conversation) => (
                    <tr key={conversation.id}>
                      <td className="px-6 py-4 font-medium text-foreground">{conversation.id.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-muted-foreground">{conversation.patient_id}</td>
                      <td className="px-6 py-4 text-muted-foreground">{conversation.doctor_id}</td>
                      <td className="px-6 py-4 text-muted-foreground">{conversation.last_message_preview || 'Sin mensajes'}</td>
                      <td className="px-6 py-4 text-muted-foreground">{conversation.last_message_at ? new Date(conversation.last_message_at).toLocaleString('es-MX') : 'Sin actividad'}</td>
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
