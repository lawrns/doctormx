import { requireRole } from '@/lib/auth'
import { getUrgencyLabel, getImageTypeLabel, getStatusLabel } from '@/lib/ai/vision'
import { redirect, notFound } from 'next/navigation'
import DoctorLayout from '@/components/DoctorLayout'
import DoctorImageReviewClient from './DoctorImageReviewClient'

interface PageProps {
  params: Promise<{ analysisId: string }>
}

export default async function DoctorImageReviewPage({ params }: PageProps) {
  const { user, profile, supabase } = await requireRole('doctor')
  
  const { data: doctor } = await supabase
    .from('doctors')
    .select('status')
    .eq('id', user.id)
    .single()

  if (doctor?.status !== 'approved') {
    redirect('/doctor/appointments')
  }

  const { analysisId } = await params

  const { data: analysis } = await supabase
    .from('medical_image_analyses')
    .select('*')
    .eq('id', analysisId)
    .eq('doctor_id', user.id)
    .single()

  if (!analysis) {
    notFound()
  }

  const { data: patientData } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', analysis.patient_id)
    .single()

  const patient = patientData || { full_name: 'Paciente', email: '', phone: '' }

  return (
    <DoctorLayout profile={profile!} isPending={false} currentPath="/doctor/images">
      <DoctorImageReviewClient
      analysis={{
        id: analysis.id,
        imageUrl: analysis.image_url,
        imageType: analysis.image_type,
        imageTypeLabel: getImageTypeLabel(analysis.image_type),
        patientName: patient.full_name || 'Paciente',
        patientEmail: patient.email || '',
        patientPhone: patient.phone || '',
        patientNotes: analysis.patient_notes,
        findings: analysis.findings || '',
        possibleConditions: analysis.possible_conditions || [],
        urgencyLevel: analysis.urgency_level || 'medium',
        urgencyLabel: getUrgencyLabel(analysis.urgency_level),
        recommendations: analysis.recommendations || [],
        followUpNeeded: analysis.follow_up_needed || false,
        followUpNotes: analysis.follow_up_notes,
        confidencePercent: analysis.confidence_percent || 0,
        status: analysis.status,
        statusLabel: getStatusLabel(analysis.status),
        createdAt: analysis.created_at,
        reviewedAt: analysis.reviewed_at,
        costCents: analysis.cost_cents || 500
      }}
      doctorId={user.id}
      doctorName={profile?.full_name || 'Doctor'}
    />
    </DoctorLayout>
  )
}
