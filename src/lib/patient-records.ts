// Sistema de Historial Medico del Paciente
// Input: Patient ID
// Process: Query appointments → Join doctors, specialties, prescriptions, SOAP notes
// Output: Comprehensive consultation history with prescriptions and notes

import { createClient } from '@/lib/supabase/server'

export interface ConsultationRecord {
  id: string
  doctorName: string
  doctorSpecialty: string | null
  doctorPhotoUrl: string | null
  date: string
  status: string
  reasonForVisit: string | null
  appointmentType: string | null
  diagnosisSummary: string | null
  soapSubjective: string | null
  soapAssessment: string | null
  soapPlan: string | null
  patientSummary: string | null
  soapNotesApproved: boolean
}

export interface PrescriptionRecord {
  id: string
  appointmentId: string
  doctorName: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
  }>
  instructions: string | null
  diagnosis: string | null
  pdfUrl: string | null
  createdAt: string
  sentToPatient: boolean
}

export async function getPatientConsultationHistory(patientId: string): Promise<ConsultationRecord[]> {
  const supabase = await createClient()

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      status,
      start_ts,
      reason_for_visit,
      appointment_type,
      notes,
      doctor:doctors (
        id,
        specialty,
        profile:profiles (
          full_name,
          photo_url
        )
      ),
      soap_notes (
        soap_subjective,
        soap_assessment,
        soap_plan,
        patient_summary,
        status
      )
    `)
    .eq('patient_id', patientId)
    .in('status', ['completed', 'confirmed'])
    .order('start_ts', { ascending: false })

  if (error) {
    console.error('Error fetching patient consultation history:', error)
    return []
  }

  return (appointments || []).map((apt: Record<string, unknown>) => {
    const doctor = apt.doctor as Record<string, unknown> | null
    const doctorProfile = doctor?.profile as Record<string, unknown> | null
    const soapNotesArr = apt.soap_notes as Array<Record<string, unknown>> | null
    const soapNote = soapNotesArr?.[0]

    return {
      id: apt.id as string,
      doctorName: (doctorProfile?.full_name as string) || 'Doctor',
      doctorSpecialty: (doctor?.specialty as string) || null,
      doctorPhotoUrl: (doctorProfile?.photo_url as string) || null,
      date: apt.start_ts as string,
      status: apt.status as string,
      reasonForVisit: (apt.reason_for_visit as string) || null,
      appointmentType: (apt.appointment_type as string) || null,
      diagnosisSummary: (apt.notes as string) || null,
      soapSubjective: (soapNote?.soap_subjective as string) || null,
      soapAssessment: (soapNote?.soap_assessment as string) || null,
      soapPlan: (soapNote?.soap_plan as string) || null,
      patientSummary: (soapNote?.patient_summary as string) || null,
      soapNotesApproved: soapNote?.status === 'approved',
    }
  })
}

export async function getPatientPrescriptions(patientId: string): Promise<PrescriptionRecord[]> {
  const supabase = await createClient()

  const { data: prescriptions, error } = await supabase
    .from('prescriptions')
    .select(`
      id,
      appointment_id,
      medications,
      notes,
      pdf_url,
      created_at,
      appointment:appointments (
        id,
        doctor:doctors (
          profile:profiles (
            full_name
          )
        )
      )
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching patient prescriptions:', error)
    return []
  }

  return (prescriptions || []).map((rx: Record<string, unknown>) => {
    const appointment = rx.appointment as Record<string, unknown> | null
    const doctor = appointment?.doctor as Record<string, unknown> | null
    const doctorProfile = doctor?.profile as Record<string, unknown> | null
    const medications = (rx.medications as Array<Record<string, string>>) || []

    return {
      id: rx.id as string,
      appointmentId: rx.appointment_id as string,
      doctorName: (doctorProfile?.full_name as string) || 'Doctor',
      medications: medications.map((med) => ({
        name: med.name || '',
        dosage: med.dosage || '',
        frequency: med.frequency || '',
        duration: med.duration || '',
      })),
      instructions: (rx.notes as string) || null,
      diagnosis: null,
      pdfUrl: (rx.pdf_url as string) || null,
      createdAt: rx.created_at as string,
      sentToPatient: false,
    }
  })
}
