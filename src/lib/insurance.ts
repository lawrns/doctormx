import { createClient, createServiceClient } from '@/lib/supabase/server'
import { expireStalePendingPaymentAppointments } from '@/lib/appointment-expiry'

type SupabaseClientLike = Awaited<ReturnType<typeof createClient>>

export type InsuranceProvider = {
  id: string
  name: string
  slug: string
  type: 'public' | 'private' | 'social_security'
  logo_url: string | null
  default_copay_cents: number
  reimbursement_rate: number
  supports_real_time_eligibility: boolean
  requires_folio: boolean
}

export type PatientInsuranceRecord = {
  id: string
  patient_id: string
  insurance_id: string
  policy_number: string | null
  member_id: string | null
  holder_name: string | null
  coverage_type: string | null
  is_active: boolean
  verified_at: string | null
  insurance: InsuranceProvider
}

export type InsuranceEstimate = {
  patientInsuranceId: string | null
  insuranceId: string | null
  providerName: string | null
  providerType: InsuranceProvider['type'] | null
  acceptedByDoctor: boolean
  eligibilityStatus: 'cash' | 'verified' | 'estimated' | 'requires_review' | 'not_supported'
  claimStatus: 'none' | 'eligibility_checked' | 'pending_folio'
  grossAmountCents: number
  patientResponsibilityCents: number
  reimbursementAmountCents: number
  requiresFolio: boolean
  message: string
}

export type InsuranceCheckoutOptions = {
  appointment: {
    id: string
    doctorId: string
    patientId: string
    startTs: string
    endTs: string
    status: string
    appointmentType: 'video' | 'in_person' | null
    videoStatus: string | null
    doctorName: string
    doctorPhotoUrl: string | null
    doctorSpecialty: string | null
    licenseNumber: string | null
    city: string | null
    state: string | null
    officeAddress: string | null
    holdExpiresAt: string | null
    grossAmountCents: number
    currency: string
  }
  acceptedInsurances: InsuranceProvider[]
  patientInsurances: PatientInsuranceRecord[]
  estimates: InsuranceEstimate[]
  cashEstimate: InsuranceEstimate
}

function normalizeRate(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.min(parsed, 1))
}

function normalizeCopay(value: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.round(parsed))
}

export function calculateInsuranceEstimate({
  provider,
  grossAmountCents,
  acceptedByDoctor,
}: {
  provider: InsuranceProvider
  grossAmountCents: number
  acceptedByDoctor: boolean
}): Omit<InsuranceEstimate, 'patientInsuranceId' | 'insuranceId'> {
  if (!acceptedByDoctor) {
    return {
      providerName: provider.name,
      providerType: provider.type,
      acceptedByDoctor: false,
      eligibilityStatus: 'not_supported',
      claimStatus: 'none',
      grossAmountCents,
      patientResponsibilityCents: grossAmountCents,
      reimbursementAmountCents: 0,
      requiresFolio: provider.requires_folio,
      message: 'Este doctor no tiene convenio activo con esta aseguradora.',
    }
  }

  const reimbursementRate = normalizeRate(provider.reimbursement_rate)
  const defaultCopay = normalizeCopay(provider.default_copay_cents)
  const estimatedReimbursement = Math.round(grossAmountCents * reimbursementRate)
  const patientResponsibilityCents = Math.min(
    grossAmountCents,
    provider.requires_folio
      ? grossAmountCents
      : Math.max(defaultCopay, grossAmountCents - estimatedReimbursement)
  )
  const reimbursementAmountCents = Math.max(0, grossAmountCents - patientResponsibilityCents)

  if (provider.requires_folio) {
    return {
      providerName: provider.name,
      providerType: provider.type,
      acceptedByDoctor: true,
      eligibilityStatus: 'requires_review',
      claimStatus: 'pending_folio',
      grossAmountCents,
      patientResponsibilityCents,
      reimbursementAmountCents,
      requiresFolio: true,
      message: 'Requiere folio o autorizacion. Se registra para seguimiento, pero el pago se cubre completo por ahora.',
    }
  }

  return {
    providerName: provider.name,
    providerType: provider.type,
    acceptedByDoctor: true,
    eligibilityStatus: provider.supports_real_time_eligibility ? 'verified' : 'estimated',
    claimStatus: 'eligibility_checked',
    grossAmountCents,
    patientResponsibilityCents,
    reimbursementAmountCents,
    requiresFolio: false,
    message: provider.supports_real_time_eligibility
      ? 'Convenio compatible. El copago se calcula con reglas del proveedor.'
      : 'Convenio compatible. El copago es una estimacion sujeta a validacion.',
  }
}

async function getAppointmentContext(
  supabase: SupabaseClientLike,
  appointmentId: string,
  patientId: string
) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      id,
      doctor_id,
      patient_id,
      start_ts,
      end_ts,
      status,
      appointment_type,
      video_status,
      doctor:doctors (
        price_cents,
        currency,
        specialty,
        license_number,
        city,
        state,
        office_address,
        profile:profiles (
          full_name,
          photo_url
        )
      )
    `)
    .eq('id', appointmentId)
    .eq('patient_id', patientId)
    .single()

  if (error || !appointment) {
    throw new Error('Cita no encontrada o no autorizada')
  }

  const doctor = Array.isArray(appointment.doctor)
    ? appointment.doctor[0]
    : appointment.doctor
  const profile = Array.isArray(doctor?.profile)
    ? doctor.profile[0]
    : doctor?.profile

  const { data: hold } = await supabase
    .from('appointment_holds')
    .select('expires_at')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return {
    id: appointment.id,
    doctorId: appointment.doctor_id,
    patientId: appointment.patient_id,
    startTs: appointment.start_ts,
    endTs: appointment.end_ts,
    status: appointment.status,
    appointmentType: appointment.appointment_type,
    videoStatus: appointment.video_status,
    doctorName: profile?.full_name || 'Médico verificado',
    doctorPhotoUrl: profile?.photo_url || null,
    doctorSpecialty: doctor?.specialty || null,
    licenseNumber: doctor?.license_number || null,
    city: doctor?.city || null,
    state: doctor?.state || null,
    officeAddress: doctor?.office_address || null,
    holdExpiresAt: hold?.expires_at || null,
    grossAmountCents: Number(doctor?.price_cents || 0),
    currency: doctor?.currency || 'MXN',
  }
}

async function getAcceptedInsurances(supabase: SupabaseClientLike, doctorId: string) {
  const { data, error } = await supabase
    .from('doctor_insurances')
    .select(`
      insurance:insurances (
        id,
        name,
        slug,
        type,
        logo_url,
        default_copay_cents,
        reimbursement_rate,
        supports_real_time_eligibility,
        requires_folio
      )
    `)
    .eq('doctor_id', doctorId)

  if (error) {
    throw new Error(`No fue posible consultar aseguradoras del doctor: ${error.message}`)
  }

  return (data || [])
    .map((row: any) => (Array.isArray(row.insurance) ? row.insurance[0] : row.insurance))
    .filter(Boolean) as InsuranceProvider[]
}

async function getPatientInsurances(supabase: SupabaseClientLike, patientId: string) {
  const { data, error } = await supabase
    .from('patient_insurances')
    .select(`
      id,
      patient_id,
      insurance_id,
      policy_number,
      member_id,
      holder_name,
      coverage_type,
      is_active,
      verified_at,
      insurance:insurances (
        id,
        name,
        slug,
        type,
        logo_url,
        default_copay_cents,
        reimbursement_rate,
        supports_real_time_eligibility,
        requires_folio
      )
    `)
    .eq('patient_id', patientId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`No fue posible consultar tus seguros: ${error.message}`)
  }

  return (data || []).map((record: any) => ({
    ...record,
    insurance: Array.isArray(record.insurance) ? record.insurance[0] : record.insurance,
  })) as PatientInsuranceRecord[]
}

export async function getInsuranceCheckoutOptions(
  appointmentId: string,
  patientId: string,
  supabase?: SupabaseClientLike
): Promise<InsuranceCheckoutOptions> {
  const db = supabase || (await createClient())
  await expireStalePendingPaymentAppointments({ appointmentId })
  const appointment = await getAppointmentContext(db, appointmentId, patientId)
  const [acceptedInsurances, patientInsurances] = await Promise.all([
    getAcceptedInsurances(db, appointment.doctorId),
    getPatientInsurances(db, patientId),
  ])
  const acceptedIds = new Set(acceptedInsurances.map((insurance) => insurance.id))

  const estimates = patientInsurances.map((patientInsurance) => ({
    ...calculateInsuranceEstimate({
      provider: patientInsurance.insurance,
      grossAmountCents: appointment.grossAmountCents,
      acceptedByDoctor: acceptedIds.has(patientInsurance.insurance_id),
    }),
    patientInsuranceId: patientInsurance.id,
    insuranceId: patientInsurance.insurance_id,
  }))

  const cashEstimate: InsuranceEstimate = {
    patientInsuranceId: null,
    insuranceId: null,
    providerName: null,
    providerType: null,
    acceptedByDoctor: true,
    eligibilityStatus: 'cash',
    claimStatus: 'none',
    grossAmountCents: appointment.grossAmountCents,
    patientResponsibilityCents: appointment.grossAmountCents,
    reimbursementAmountCents: 0,
    requiresFolio: false,
    message: 'Pago particular sin aseguradora.',
  }

  return {
    appointment,
    acceptedInsurances,
    patientInsurances,
    estimates,
    cashEstimate,
  }
}

export async function createPatientInsurance({
  patientId,
  insuranceId,
  policyNumber,
  memberId,
  holderName,
  coverageType,
}: {
  patientId: string
  insuranceId: string
  policyNumber?: string
  memberId?: string
  holderName?: string
  coverageType?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patient_insurances')
    .insert({
      patient_id: patientId,
      insurance_id: insuranceId,
      policy_number: policyNumber || null,
      member_id: memberId || null,
      holder_name: holderName || null,
      coverage_type: coverageType || null,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`No fue posible guardar el seguro: ${error.message}`)
  }

  return data
}

export async function getSelectedInsuranceEstimate({
  appointmentId,
  patientId,
  patientInsuranceId,
  supabase,
}: {
  appointmentId: string
  patientId: string
  patientInsuranceId?: string | null
  supabase?: SupabaseClientLike
}) {
  const options = await getInsuranceCheckoutOptions(appointmentId, patientId, supabase)

  if (!patientInsuranceId) {
    return { options, estimate: options.cashEstimate }
  }

  const estimate = options.estimates.find(
    (item) => item.patientInsuranceId === patientInsuranceId
  )

  if (!estimate) {
    throw new Error('Seguro no encontrado para este paciente')
  }

  return { options, estimate }
}

export async function upsertAppointmentInsuranceClaim({
  appointmentId,
  patientId,
  patientInsuranceId,
}: {
  appointmentId: string
  patientId: string
  patientInsuranceId: string
}) {
  const supabase = await createClient()
  const { options, estimate } = await getSelectedInsuranceEstimate({
    appointmentId,
    patientId,
    patientInsuranceId,
    supabase,
  })

  if (!estimate.insuranceId) {
    return null
  }

  const { data, error } = await supabase
    .from('appointment_insurance_claims')
    .upsert({
      appointment_id: appointmentId,
      patient_insurance_id: patientInsuranceId,
      doctor_id: options.appointment.doctorId,
      patient_id: patientId,
      status: estimate.claimStatus === 'pending_folio' ? 'pending_folio' : 'eligibility_checked',
      eligibility_status: estimate.eligibilityStatus === 'verified' ? 'verified' : estimate.eligibilityStatus === 'not_supported' ? 'not_supported' : estimate.eligibilityStatus === 'requires_review' ? 'requires_review' : 'estimated',
      estimated_copay_cents: estimate.patientResponsibilityCents,
      reimbursement_amount_cents: estimate.reimbursementAmountCents,
      notes: estimate.message,
    }, {
      onConflict: 'appointment_id',
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`No fue posible registrar el reclamo: ${error.message}`)
  }

  return data
}

export async function getDoctorInsuranceClaims(doctorId: string) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('appointment_insurance_claims')
    .select(`
      id,
      appointment_id,
      status,
      eligibility_status,
      claim_number,
      estimated_copay_cents,
      reimbursement_amount_cents,
      reimbursement_amount_cents_final,
      created_at,
      submitted_at,
      appointment:appointments (
        start_ts,
        reason_for_visit
      ),
      patient:profiles (
        full_name
      ),
      patient_insurance:patient_insurances (
        policy_number,
        member_id,
        insurance:insurances (
          name,
          type
        )
      )
    `)
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false })
    .limit(25)

  if (error) {
    throw new Error(`No fue posible consultar reclamos: ${error.message}`)
  }

  return data || []
}
