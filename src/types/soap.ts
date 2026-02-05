/**
 * SOAP Multi-Agent Consultation Types
 * Based on SOAP-MULTIAGENT-RESEARCH.md
 */

export type SpecialistType =
  | 'general'
  | 'cardiology'
  | 'dermatology'
  | 'neurology'
  | 'orthopedics'
  | 'oncology'
  | 'radiology'
  | 'psychology';

export interface SpecialistAgent {
  id: string;
  name: string;
  specialty: SpecialistType;
  avatar?: string;
  confidence: number; // 0-100
  assessment: string;
  status: 'pending' | 'thinking' | 'completed';
  responseTime?: number; // milliseconds
}

export interface ConsensusResult {
  score: number; // Kendall's W * 100 (0-100)
  level: 'high' | 'moderate' | 'low';
  primaryDiagnosis: string; // Internal field - displayed as "Información Principal" in UI
  differentialDiagnoses: string[]; // Internal field - displayed as "Posibilidades" in UI
  clinicalReasoning: string; // Internal field - displayed as "Resumen" in UI
  agreementPercentage: number;
}

export type SOAPPhase = 'subjective' | 'objective' | 'assessment' | 'plan';

export interface SOAPPhaseStatus {
  phase: SOAPPhase;
  status: 'completed' | 'in-progress' | 'pending';
  timestamp?: Date;
}

export interface ConsultationProgress {
  currentPhase: SOAPPhase;
  activeAgents: string[]; // Agent IDs currently processing
  completedAgents: string[]; // Agent IDs that finished
  estimatedTimeRemaining?: number; // seconds
  totalAgents: number;
}
