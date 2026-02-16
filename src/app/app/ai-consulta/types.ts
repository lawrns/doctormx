'use client';

import type { SpecialistAgent, ConsensusResult, SOAPPhaseStatus, ConsultationProgress } from '@/types/soap';
import type { SubjectiveData, SOAPConsultation } from '@/lib/soap/types';
import type { RedFlagResult } from '@/lib/ai/red-flags-enhanced';

// ============================================================================
// STEP TYPES
// ============================================================================

export type IntakeStep =
  | 'welcome'
  | 'chief-complaint'
  | 'symptoms'
  | 'duration'
  | 'severity'
  | 'onset'
  | 'associated'
  | 'factors'
  | 'history'
  | 'consulting'
  | 'results';

export const INTAKE_STEPS: IntakeStep[] = [
  'welcome',
  'chief-complaint',
  'symptoms',
  'duration',
  'severity',
  'onset',
  'associated',
  'factors',
  'history',
  'consulting',
  'results',
];

// ============================================================================
// FORM DATA
// ============================================================================

export interface FormData {
  chiefComplaint: string;
  symptomsDescription: string;
  symptomDuration: string;
  symptomSeverity: number;
  onsetType: 'sudden' | 'gradual' | null;
  associatedSymptoms: string;
  aggravatingFactors: string;
  relievingFactors: string;
  medicalHistory: string;
}

export const INITIAL_FORM_DATA: FormData = {
  chiefComplaint: '',
  symptomsDescription: '',
  symptomDuration: '',
  symptomSeverity: 5,
  onsetType: null,
  associatedSymptoms: '',
  aggravatingFactors: '',
  relievingFactors: '',
  medicalHistory: '',
};

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface AIConsultaClientProps {
  userId: string;
}

export interface StepProps {
  onNext: () => void;
  onPrev: () => void;
}

export interface ChiefComplaintStepProps extends StepProps {
  value: string;
  onChange: (v: string) => void;
}

export interface SymptomsStepProps extends StepProps {
  value: string;
  onChange: (v: string) => void;
}

export interface DurationStepProps extends StepProps {
  value: string;
  onChange: (v: string) => void;
}

export interface SeverityStepProps extends StepProps {
  value: number;
  onChange: (v: number) => void;
}

export interface OnsetStepProps extends StepProps {
  value: 'sudden' | 'gradual' | null;
  onChange: (v: 'sudden' | 'gradual') => void;
}

export interface AssociatedSymptomsStepProps extends StepProps {
  value: string;
  onChange: (v: string) => void;
}

export interface FactorsStepProps extends StepProps {
  aggravating: string;
  relieving: string;
  onAggravatingChange: (v: string) => void;
  onRelievingChange: (v: string) => void;
}

export interface HistoryStepProps extends StepProps {
  value: string;
  onChange: (v: string) => void;
  isSubmitting: boolean;
}

export interface ConsultingStepProps {
  specialists: SpecialistAgent[];
  progress: ConsultationProgress | null;
  phases: SOAPPhaseStatus[];
}

export interface ResultsStepProps {
  consultation: SOAPConsultation;
  consensus: ConsensusResult;
  specialists: SpecialistAgent[];
  phases: SOAPPhaseStatus[];
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseAiConsultaReturn {
  // Form state
  currentStep: IntakeStep;
  formData: FormData;
  updateFormData: (field: keyof FormData, value: string | number) => void;
  
  // Loading state
  isSubmitting: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  
  // Results state
  consultation: SOAPConsultation | null;
  specialists: SpecialistAgent[];
  consensus: ConsensusResult | null;
  phases: SOAPPhaseStatus[];
  progress: ConsultationProgress | null;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: IntakeStep) => void;
  
  // Submission
  submitConsultation: () => Promise<void>;
  resetConsultation: () => void;
}

export interface UseRedFlagsReturn {
  emergencyDetected: RedFlagResult | null;
  showEmergencyModal: boolean;
  setShowEmergencyModal: (show: boolean) => void;
  checkForEmergencies: (data: FormData) => void;
  clearEmergency: () => void;
  shouldBlockSubmission: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const SPECIALIST_AVATARS: Record<string, string> = {
  gp: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
  derm: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
  int: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
  psych: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
};

export const CHIEF_COMPLAINT_SUGGESTIONS = [
  'Dolor de cabeza',
  'Dolor abdominal',
  'Dolor en el pecho',
  'Fiebre',
  'Náuseas',
  'Dolor de espalda',
  'Tos',
  'Fatiga',
];

export const DURATION_OPTIONS = [
  'Menos de 1 hora',
  'Hoy',
  '1-2 días',
  '3-7 días',
  '1-2 semanas',
  'Más de 2 semanas',
  'Meses',
];

export const ASSOCIATED_SYMPTOM_SUGGESTIONS = [
  'Fiebre',
  'Escalofríos',
  'Náuseas',
  'Vómitos',
  'Mareos',
  'Cansancio',
  'Pérdida de apetito',
  'Dolor muscular',
  'Dolor articular',
  'Erupción cutánea',
  'Tos seca',
  'Congestión nasal',
];

export const URGENCY_COLORS: Record<string, string> = {
  emergency: 'bg-red-500',
  urgent: 'bg-orange-500',
  moderate: 'bg-yellow-500',
  routine: 'bg-blue-500',
  'self-care': 'bg-green-500',
};
