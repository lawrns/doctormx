import { requireRole } from '@/lib/auth'
import { notFound } from 'next/navigation'
import VideoCallClient from './VideoCallClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VideoCallPage({ params }: PageProps) {
  const { user, profile, supabase } = await requireRole('patient')
  const { id: appointmentId } = await params

  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, patient_id')
    .eq('id', appointmentId)
    .eq('patient_id', user.id)
    .single()

  if (!appointment) {
    notFound()
  }

  return <VideoCallClient appointmentId={appointmentId} />
}
