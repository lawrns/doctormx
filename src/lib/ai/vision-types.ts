export type ImageType = 
  | 'skin' 
  | 'xray' 
  | 'lab_result' 
  | 'wound' 
  | 'eye' 
  | 'other'

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency'

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reviewed'

export interface MedicalImageAnalysis {
  id: string
  patient_id: string
  appointment_id: string | null
  image_url: string
  image_type: ImageType
  patient_notes: string | null
  findings: string | null
  possible_conditions: Array<{
    condition: string
    probability: string
  }> | null
  urgency_level: UrgencyLevel | null
  recommendations: string[] | null
  follow_up_needed: boolean | null
  follow_up_notes: string | null
  doctor_notes: string | null
  doctor_id: string | null
  doctor_action: 'approved' | 'rejected' | 'modified' | null
  status: AnalysisStatus
  confidence_percent: number | null
  cost_cents: number | null
  model: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  reviewed_at: string | null
}

export interface AnalysisInput {
  imageUrl: string
  imageType: ImageType
  patientContext?: string
  medicalHistory?: string
  patientNotes?: string
  appointmentId?: string
}

export interface AnalysisResult {
  findings: string
  possibleConditions: Array<{
    condition: string
    probability: string
  }>
  urgencyLevel: UrgencyLevel
  recommendations: string[]
  followUpNeeded: boolean
  followUpNotes: string | null
  confidencePercent: number
}

export function getUrgencyLabel(urgency: UrgencyLevel | null): string {
  const labels: Record<UrgencyLevel, string> = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    emergency: 'Emergencia',
  }
  return urgency ? labels[urgency] : 'Desconocida'
}

export function getUrgencyColor(urgency: UrgencyLevel | null): string {
  const colors: Record<UrgencyLevel, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800',
  }
  return urgency ? colors[urgency] : 'bg-gray-100 text-gray-800'
}

