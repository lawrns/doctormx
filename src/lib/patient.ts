import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export interface PatientProfile {
  id: string
  role: 'patient' | 'doctor' | 'admin'
  full_name: string
  email?: string | null
  phone: string | null
  photo_url: string | null
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  insurance_provider: string | null
  insurance_policy_number: string | null
  insurance_group_number: string | null
  insurance_coverage_type: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  notifications_email: boolean | null
  notifications_sms: boolean | null
  notifications_whatsapp: boolean | null
  created_at: string
  updated_at: string
}

export interface PatientMedicalHistory {
  id: string
  patient_id: string
  allergies: string[]
  current_medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  chronic_conditions: string[]
  past_surgeries: Array<{
    procedure: string
    year: number | null
    notes: string
  }>
  family_history: Array<{
    condition: string
    relationship: string
    notes: string
  }>
  medical_notes: string | null
  blood_type: string | null
  height_cm: number | null
  weight_kg: number | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  full_name?: string
  phone?: string | null
  date_of_birth?: string | null
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  insurance_provider?: string | null
  insurance_policy_number?: string | null
  insurance_group_number?: string | null
  insurance_coverage_type?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_relationship?: string | null
  notifications_email?: boolean
  notifications_sms?: boolean
  notifications_whatsapp?: boolean
}

export interface UpdateMedicalHistoryData {
  allergies?: string[]
  current_medications?: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  chronic_conditions?: string[]
  past_surgeries?: Array<{
    procedure: string
    year: number | null
    notes: string
  }>
  family_history?: Array<{
    condition: string
    relationship: string
    notes: string
  }>
  medical_notes?: string | null
  blood_type?: string | null
  height_cm?: number | null
  weight_kg?: number | null
}

export const getPatientProfile = cache(async (userId: string): Promise<PatientProfile | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as PatientProfile
})

export const updatePatientProfile = async (
  userId: string,
  data: UpdateProfileData
): Promise<PatientProfile | null> => {
  const supabase = await createClient()

  const { data: updated, error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return updated as PatientProfile
}

export const getPatientMedicalHistory = cache(async (userId: string): Promise<PatientMedicalHistory | null> => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('patient_medical_history')
    .select('*')
    .eq('patient_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data as PatientMedicalHistory
})

export const updatePatientMedicalHistory = async (
  userId: string,
  data: UpdateMedicalHistoryData
): Promise<PatientMedicalHistory | null> => {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('patient_medical_history')
    .select('id')
    .eq('patient_id', userId)
    .single()

  if (existing) {
    const { data: updated, error } = await supabase
      .from('patient_medical_history')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return updated as PatientMedicalHistory
  } else {
    const { data: created, error } = await supabase
      .from('patient_medical_history')
      .insert({
        patient_id: userId,
        ...data,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return created as PatientMedicalHistory
  }
}

export const getPatientFullData = cache(async (userId: string) => {
  const [profile, medicalHistory] = await Promise.all([
    getPatientProfile(userId),
    getPatientMedicalHistory(userId),
  ])

  return {
    profile,
    medicalHistory,
  }
})

