// Unified domain types
export * from './care-case';

// Legacy AI types (still used by existing components)
export type {
  PreConsultaMessage,
  PreConsultaSession,
  TriageResult,
  TranscriptionSegment,
  ConsultationTranscript,
  FollowUpSchedule,
  FollowUpTemplate,
  PrescriptionSuggestion,
  MatchingScore,
  AIAuditLog,
  AIDisclaimer,
  SafetyCheck,
} from '../ai/types';
