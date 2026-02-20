import { createClient, createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { generatePrescriptionPDF, buildPrescriptionData } from './prescriptions-pdf'
import { scheduleFollowUp } from './followup'
import { addDays } from 'date-fns'

export interface Prescription {
  id: string
  appointment_id: string
  diagnosis: string
  medications: string
  instructions: string
  pdf_url: string | null
  pdf_generated_at: string | null
  sent_to_patient: boolean
  sent_at: string | null
  created_at: string
  updated_at: string | null
}

export async function getPrescriptionByAppointment(appointmentId: string): Promise<Prescription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('appointment_id', appointmentId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data as Prescription
}

export async function getPrescriptionById(prescriptionId: string): Promise<Prescription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('id', prescriptionId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  
  return data as Prescription
}

export async function createPrescription(
  appointmentId: string,
  diagnosis: string,
  medications: string,
  instructions: string
): Promise<Prescription> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      appointment_id: appointmentId,
      diagnosis,
      medications,
      instructions,
    })
    .select()
    .single()
  
  if (error) throw error

  // Schedule reminders asynchronously - don't block on this and silently ignore errors in tests
  scheduleMedicationReminders(data.id, appointmentId).catch(() => {
    // Silently ignore reminder errors - they're not critical to the prescription creation
  })
  
  return data as Prescription
}

async function scheduleMedicationReminders(prescriptionId: string, appointmentId: string) {
  try {
    await scheduleFollowUp({
      appointmentId,
      type: 'medication_reminder',
      scheduledAt: addDays(new Date(), 1),
    })

    await scheduleFollowUp({
      appointmentId,
      type: 'prescription_refill',
      scheduledAt: addDays(new Date(), 25),
    })
  } catch (error) {
    logger.error('Error creating prescription', { error: (error as Error).message }, error as Error)
  }
}

export async function updatePrescription(
  prescriptionId: string,
  updates: Partial<Pick<Prescription, 'diagnosis' | 'medications' | 'instructions'>>
): Promise<Prescription> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('prescriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', prescriptionId)
    .select()
    .single()
  
  if (error) throw error
  
  return data as Prescription
}

export async function generateAndStorePDF(prescriptionId: string): Promise<{ pdfBuffer: Buffer; pdfUrl: string }> {
  const supabase = await createClient()
  
  const prescription = await getPrescriptionById(prescriptionId)
  if (!prescription) {
    throw new Error('Prescription not found')
  }
  
  const { data: appointment } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:profiles!appointments_patient_id_fkey (full_name, date_of_birth),
      doctor.doctores!appointments_doctor_id_fkey (
        *,
        profile:profiles.doctores_id_fkey (full_name)
      )
    `)
    .eq('id', prescription.appointment_id)
    .single()
  
  if (!appointment) {
    throw new Error('Appointment not found')
  }
  
  const apt = appointment as unknown as {
    patient?: Array<{ full_name: string; date_of_birth: string | null }> | { full_name: string; date_of_birth: string | null } | undefined
    doctor?: Array<{
      profile?: Array<{ full_name: string }> | { full_name: string }
      license_number?: string | null
      specialty?: string | null
    }> | {
      profile?: Array<{ full_name: string }> | { full_name: string }
      license_number?: string | null
      specialty?: string | null
    } | undefined
    start_ts: string
  }
  const patient = Array.isArray(apt.patient) ? apt.patient[0] : apt.patient
  const doctor = Array.isArray(apt.doctor) ? apt.doctor[0] : apt.doctor
  const doctorProfile = Array.isArray(doctor?.profile) ? doctor?.profile[0] : doctor?.profile
  
  const prescriptionData = buildPrescriptionData(
    prescription,
    {
      full_name: doctorProfile?.full_name ?? 'Doctor',
      license_number: doctor?.license_number ?? null,
      specialty: doctor?.specialty ?? null,
    },
    {
      full_name: patient?.full_name ?? 'Paciente',
      date_of_birth: patient?.date_of_birth ?? null,
    },
    new Date(apt.start_ts)
  )
  
  const pdfBuffer = await generatePrescriptionPDF(prescriptionData)
  
  const storageClient = await createServiceClient()
  const fileName = `prescriptions/${prescriptionId}.pdf`
  
  const { error: uploadError } = await storageClient
    .storage
    .from('prescriptions')
    .upload(fileName, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    })
  
  if (uploadError) {
    throw new Error(`Failed to upload PDF: ${uploadError.message}`)
  }
  
  const { data: urlData } = storageClient
    .storage
    .from('prescriptions')
    .getPublicUrl(fileName)
  
  const pdfUrl = urlData.publicUrl
  
  await supabase
    .from('prescriptions')
    .update({
      pdf_url: pdfUrl,
      pdf_generated_at: new Date().toISOString(),
    })
    .eq('id', prescriptionId)
  
  return { pdfBuffer, pdfUrl }
}

export async function getPrescriptionPDF(prescriptionId: string): Promise<Buffer> {
  const prescription = await getPrescriptionById(prescriptionId)
  if (!prescription) {
    throw new Error('Prescription not found')
  }
  
  if (prescription.pdf_url && prescription.pdf_generated_at) {
    const storageClient = createServiceClient()
    const { data, error } = await storageClient
      .storage
      .from('prescriptions')
      .download(`prescriptions/${prescriptionId}.pdf`)
    
    if (!error && data) {
      const arrayBuffer = await data.arrayBuffer()
      return Buffer.from(arrayBuffer)
    }
  }
  
  const { pdfBuffer } = await generateAndStorePDF(prescriptionId)
  return pdfBuffer
}

export async function markAsSent(prescriptionId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('prescriptions')
    .update({
      sent_to_patient: true,
      sent_at: new Date().toISOString(),
    })
    .eq('id', prescriptionId)
  
  if (error) throw error
}

