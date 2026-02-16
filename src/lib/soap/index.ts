/**
 * SOAP Multi-Agent Consultation System
 *
 * Exports for the multi-agent SOAP consultation system.
 *
 * Architecture:
 * - 4 specialist agents: GP, dermatologist, internist, psychiatrist
 * - 1 supervisor agent for consensus building
 * - Kendall's W coefficient for agreement scoring
 * - XState state machine for workflow management
 */

// ============================================
// TYPES
// ============================================

export type {
  // Specialist types
  SpecialistRole,
  MedicalSpecialist,
  SpecialistAssessment,
  DiagnosisCandidate,
  UrgencyLevel,

  // Consensus types
  ConsensusResult,
  AgreementLevel,
  ConsensusCategory,

  // SOAP data types
  SubjectiveData,
  ObjectiveData,
  LabResult,

  // Consultation types
  SOAPConsultation,
  ConsultationStatus,
  TreatmentPlan,
  MedicationSuggestion,

  // Database types
  DBSOAPConsultation,
  DBSpecialistAssessment,

  // API types
  StartConsultationRequest,
  StartConsultationResponse,
  ConsultationStatusResponse,
  ConsultationResultResponse,
} from './types'

export { SPECIALISTS } from './types'

// ============================================
// AGENTS
// ============================================

export {
  // Main consultation function
  runSOAPConsultation,

  // Individual functions for more control
  consultSpecialists,
  buildConsensus,
  generatePlan,

  // Kendall's W calculation
  calculateKendallW,
  getAgreementLevel,
} from './agents'

// ============================================
// STATE MACHINE
// ============================================

export {
  consultationMachine,
  getConsultationStatus,
  getConsultationProgress,
  type ConsultationContext,
  type ConsultationEvent,
  type ConsultationMachine,
} from './consultation-machine'

// ============================================
// PROMPTS (for customization)
// ============================================

export {
  getSpecialistPrompt,
  buildPatientDataPrompt,
  buildConsensusPrompt,
  buildPlanPrompt,
  SUPERVISOR_SYSTEM_PROMPT,
  PLAN_GENERATOR_PROMPT,
  GP_SYSTEM_PROMPT,
  DERMATOLOGIST_SYSTEM_PROMPT,
  INTERNIST_SYSTEM_PROMPT,
  PSYCHIATRIST_SYSTEM_PROMPT,
} from './prompts'

