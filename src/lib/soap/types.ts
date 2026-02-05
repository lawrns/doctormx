/**
 * SOAP Multi-Agent Consultation Types
 *
 * Based on research in docs/SOAP-MULTIAGENT-RESEARCH.md:
 * - 4 specialist agents + 1 supervisor
 * - Kendall's W coefficient for agreement scoring
 * - FHIR-compliant data structures
 */

// ============================================
// SPECIALIST DEFINITIONS
// ============================================

export type SpecialistRole =
  | 'general-practitioner'    // Medico general - primary triage
  | 'dermatologist'           // Dermatologo - skin conditions
  | 'internist'               // Internista - internal medicine
  | 'psychiatrist'            // Psiquiatra - mental health

export interface MedicalSpecialist {
  id: string
  role: SpecialistRole
  name: string
  avatar: string
  description: string
}

export const SPECIALISTS: Record<SpecialistRole, MedicalSpecialist> = {
  'general-practitioner': {
    id: 'gp',
    role: 'general-practitioner',
    name: 'Dr. Garcia',
    avatar: '/avatars/gp.png',
    description: 'Medico General - Evaluacion primaria y triaje',
  },
  'dermatologist': {
    id: 'derm',
    role: 'dermatologist',
    name: 'Dra. Rodriguez',
    avatar: '/avatars/dermatologist.png',
    description: 'Dermatologa - Condiciones de piel, pelo y unas',
  },
  'internist': {
    id: 'int',
    role: 'internist',
    name: 'Dr. Martinez',
    avatar: '/avatars/internist.png',
    description: 'Internista - Medicina interna, condiciones sistemicas',
  },
  'psychiatrist': {
    id: 'psych',
    role: 'psychiatrist',
    name: 'Dra. Lopez',
    avatar: '/avatars/psychiatrist.png',
    description: 'Psiquiatra - Salud mental y bienestar emocional',
  },
}

// ============================================
// SPECIALIST ASSESSMENT
// ============================================

export interface SpecialistAssessment {
  specialistId: SpecialistRole
  specialist: MedicalSpecialist

  // Core assessment
  confidence: number // 0-1
  relevance: number  // 0-1, how relevant is this specialty for the case

  // Clinical reasoning
  clinicalImpression: string
  differentialDiagnoses: DiagnosisCandidate[]
  redFlags: string[]
  contributingFactors: string[]

  // Recommendations
  recommendedTests: string[]
  urgencyLevel: UrgencyLevel
  shouldRefer: boolean
  referralReason?: string

  // Meta
  reasoningNotes: string
  tokensUsed: number
  costUSD: number
  latencyMs: number
}

export interface HealthConsideration {
  name: string
  icd10Code?: string
  probability: number    // 0-1
  supportingEvidence: string[]
  refutingEvidence: string[]
}

// Backwards compatibility alias - DiagnosisCandidate was renamed to HealthConsideration
// for regulatory compliance (avoiding SaMD classification)
export type DiagnosisCandidate = HealthConsideration

export type UrgencyLevel =
  | 'emergency'   // Requiere atencion inmediata (ER)
  | 'urgent'      // Cita en 24-48h
  | 'moderate'    // Cita en 1-2 semanas
  | 'routine'     // Cita programada normal
  | 'self-care'   // Autocuidado con monitoreo

// ============================================
// CONSENSUS BUILDING
// ============================================

export interface ConsensusResult {
  // Agreement metrics
  kendallW: number           // 0-1, Kendall's coefficient of concordance
  agreementLevel: AgreementLevel

  // Combined health information (not a diagnosis)
  primaryDiagnosis: HealthConsideration | null  // Renamed from DiagnosisCandidate for clarity
  differentialDiagnoses: HealthConsideration[]  // These are possibilities to discuss with a doctor
  consensusCategory: ConsensusCategory

  // Combined recommendations
  urgencyLevel: UrgencyLevel
  combinedRedFlags: string[]
  recommendedSpecialty: SpecialistRole | null
  recommendedTests: string[]

  // Clinical summary
  supervisorSummary: string
  confidenceScore: number    // 0-1
  requiresHumanReview: boolean
}

export type AgreementLevel =
  | 'strong'       // Kendall W >= 0.8
  | 'moderate'     // Kendall W 0.6-0.8
  | 'weak'         // Kendall W 0.4-0.6
  | 'disagreement' // Kendall W < 0.4

export type ConsensusCategory =
  | 'consistent'   // Agents agree on diagnosis
  | 'conflict'     // Agents disagree - needs discussion
  | 'independent'  // Different valid findings (multiple conditions)
  | 'integrated'   // Combined insights form complete picture

// ============================================
// SOAP NOTE STRUCTURE
// ============================================

export interface SubjectiveData {
  chiefComplaint: string
  symptomsDescription: string
  symptomDuration: string
  symptomSeverity: number     // 1-10
  onsetType: 'sudden' | 'gradual'
  associatedSymptoms: string[]
  aggravatingFactors: string[]
  relievingFactors: string[]
  previousTreatments: string[]
  medicalHistory?: string
  medications?: string[]
  allergies?: string[]
  familyHistory?: string
  socialHistory?: string
}

export interface ObjectiveData {
  // Vital signs (optional for pre-consultation)
  vitalSigns?: {
    bloodPressure?: { systolic: number; diastolic: number }
    heartRate?: number
    temperature?: number
    respiratoryRate?: number
    oxygenSaturation?: number
    weight?: number
    height?: number
  }

  // Remote data that can be collected
  patientAge?: number
  patientGender?: 'male' | 'female' | 'other'
  bodyLocation?: string[]
  visualSymptoms?: string  // Photo description if available
  reportedMeasurements?: string[]

  // Historical data from EHR
  labResults?: LabResult[]
  previousDiagnoses?: string[]
  currentMedications?: string[]
}

export interface LabResult {
  name: string
  value: string
  unit: string
  referenceRange: string
  abnormal: boolean
  date: string
}

// ============================================
// FULL SOAP CONSULTATION
// ============================================

export interface SOAPConsultation {
  id: string
  patientId: string
  createdAt: Date
  completedAt?: Date
  status: ConsultationStatus

  // Input data
  subjective: SubjectiveData
  objective: ObjectiveData

  // Multi-agent assessment
  assessment: {
    specialists: SpecialistAssessment[]
    consensus: ConsensusResult
  } | null

  // Plan
  plan: TreatmentPlan | null

  // Metadata
  metadata: {
    totalTokens: number
    totalCostUSD: number
    totalLatencyMs: number
    aiModel: string
  }
}

export type ConsultationStatus =
  | 'intake'           // Collecting subjective data
  | 'objective'        // Collecting objective data
  | 'consulting'       // Agents are analyzing
  | 'consensus'        // Building consensus
  | 'plan'             // Generating plan
  | 'review'           // Pending human review
  | 'complete'         // Finished
  | 'escalated'        // Sent to emergency
  | 'error'            // Something went wrong

export interface TreatmentPlan {
  // Recommendations
  recommendations: string[]
  selfCareInstructions: string[]

  // Prescriptions (if any)
  suggestedMedications?: MedicationSuggestion[]

  // Follow-up
  followUpTiming: string
  followUpType: 'telemedicine' | 'in-person' | 'emergency' | 'self-monitor'

  // Specialist referral
  referralNeeded: boolean
  referralSpecialty?: SpecialistRole
  referralUrgency?: UrgencyLevel

  // Warning signs
  returnPrecautions: string[]

  // Educational resources
  patientEducation: string[]
}

export interface MedicationSuggestion {
  name: string
  genericName?: string
  dosage: string
  frequency: string
  duration: string
  route: 'oral' | 'topical' | 'injection' | 'other'
  warnings: string[]
  interactions: string[]
  alternatives: {
    name: string
    reason: string
  }[]
}

// ============================================
// DATABASE MODELS
// ============================================

export interface DBSOAPConsultation {
  id: string
  patient_id: string
  status: ConsultationStatus
  subjective_data: SubjectiveData
  objective_data: ObjectiveData
  consensus_data: ConsensusResult | null
  plan_data: TreatmentPlan | null
  total_tokens: number
  total_cost_usd: number
  total_latency_ms: number
  ai_model: string
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface DBSpecialistAssessment {
  id: string
  consultation_id: string
  specialist_role: SpecialistRole
  confidence: number
  relevance: number
  clinical_impression: string
  differential_diagnoses: DiagnosisCandidate[]
  red_flags: string[]
  recommended_tests: string[]
  urgency_level: UrgencyLevel
  should_refer: boolean
  referral_reason: string | null
  reasoning_notes: string
  tokens_used: number
  cost_usd: number
  latency_ms: number
  created_at: string
}

// ============================================
// API TYPES
// ============================================

export interface StartConsultationRequest {
  patientId: string
  subjective: SubjectiveData
  objective?: ObjectiveData
}

export interface StartConsultationResponse {
  consultationId: string
  status: ConsultationStatus
}

export interface ConsultationStatusResponse {
  id: string
  status: ConsultationStatus
  progress: {
    specialistsCompleted: number
    totalSpecialists: number
    consensusBuilt: boolean
    planGenerated: boolean
  }
  currentStep: string
}

export interface ConsultationResultResponse {
  consultation: SOAPConsultation
  summary: {
    urgency: UrgencyLevel
    primaryDiagnosis: string | null
    confidence: number
    recommendedAction: 'emergency' | 'urgent-appointment' | 'routine-appointment' | 'self-care'
    keyFindings: string[]
  }
}
