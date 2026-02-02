import { requireRole } from '@/lib/auth'
import { getConversations, ConversationWithDetails } from '@/lib/chat'
import { ChatList } from '@/components/ChatList'
import { logger } from '@/lib/observability/logger'

export default async function PatientChatPage() {
  let conversations: ConversationWithDetails[] = []
  
  try {
    const { user } = await requireRole('patient')
    conversations = await getConversations(user.id, 'patient')
  } catch (err) {
    logger.error('Error loading chat page:', { error: err })
    // Return empty state - component will handle gracefully
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mensajes</h1>
          <p className="text-gray-600">Chatea con tus doctores</p>
        </div>
        <ChatList initialConversations={conversations} userRole="patient" />
      </div>
    </div>
  )
}
