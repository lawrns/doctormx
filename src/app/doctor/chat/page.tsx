import { requireRole } from '@/lib/auth'
import { getConversations } from '@/lib/chat'
import { getDoctorRecordByUserId } from '@/lib/doctor-record'
import { ChatList } from '@/components/ChatList'
import DoctorLayout from '@/components/DoctorLayout'

export default async function DoctorChatPage() {
  const { user, profile } = await requireRole('doctor')
  const doctor = await getDoctorRecordByUserId(user.id)

  const conversations = await getConversations(user.id, 'doctor')

  return (
    <DoctorLayout
      profile={profile!}
      isPending={doctor?.status === 'pending' || doctor?.status === 'rejected'}
      currentPath="/doctor/chat"
      pendingAppointments={0}
    >
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground mb-1">Mensajes</h1>
          <p className="text-muted-foreground">Chatea con tus pacientes</p>
        </div>

        <ChatList
          initialConversations={conversations}
          userRole="doctor"
        />
      </div>
    </DoctorLayout>
  )
}
