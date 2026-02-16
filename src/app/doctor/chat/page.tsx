import { requireRole } from '@/lib/auth'
import { getConversations } from '@/lib/chat'
import { ChatList } from '@/components/ChatList'
import DoctorLayout from '@/components/DoctorLayout'
import { redirect } from 'next/navigation'

export default async function DoctorChatPage() {
  const { user, profile, supabase } = await requireRole('doctor')

  if (!profile) {
    redirect('/auth/complete-profile')
  }

  const { data: doctor } = await supabase
    .from('doctores')
    .select('*')
    .eq('id', user.id)
    .single()

  const conversations = await getConversations(user.id, 'doctor')

  return (
    <DoctorLayout
      profile={profile}
      isPending={doctor?.status === 'pending' || doctor?.status === 'rejected'}
      currentPath="/doctor/chat"
      pendingAppointments={0}
    >
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mensajes</h1>
          <p className="text-gray-600">Chatea con tus pacientes</p>
        </div>

        <ChatList
          initialConversations={conversations}
          userRole="doctor"
        />
      </div>
    </DoctorLayout>
  )
}
