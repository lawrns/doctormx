import { requireRole } from '@/lib/auth'
import { getConversations } from '@/lib/chat'
import { ChatList } from '@/components/ChatList'
import Link from 'next/link'

export default async function PatientChatPage() {
  const { user } = await requireRole('patient')

  const conversations = await getConversations(user.id, 'patient')

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="glass-nav sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-ink-primary">Doctor.mx</span>
          </Link>
          <Link
            href="/app"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-primary mb-1">Mensajes</h1>
          <p className="text-ink-secondary">Chatea con tus doctores</p>
        </div>

        <ChatList
          initialConversations={conversations}
          userRole="patient"
        />
      </main>
    </div>
  )
}
