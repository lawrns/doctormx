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
  current_medications: string[]
  chronic_conditions: string[]
  past_surgeries: string[]
  family_history: string[]
  lifestyle_notes: string | null
  blood_type: string | null
  height_cm: number | null
  weight_kg: number | null
  created_at: string
  updated_at: string
}

export interface PatientWithMedicalHistory extends PatientProfile {
  medical_history?: PatientMedicalHistory | null
}
