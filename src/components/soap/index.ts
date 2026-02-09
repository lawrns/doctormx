/**
 * SOAP Multi-Agent Consultation UI Components
 *
 * Beautiful, accessible components for medical consultation workflows
 * with Framer Motion animations and shadcn/ui styling.
 */

export { SpecialistConsultation } from './SpecialistConsultation';
export { ConsensusMatrix } from './ConsensusMatrix';
export { SOAPTimeline } from './SOAPTimeline';
export { ConsultationProgress } from './ConsultationProgress';

// Phase 1 UX Redesign Components
export {
  QuestionCard,
  QuestionTitle,
  QuestionDescription,
  QuestionCardActions,
  QuestionCardNavigation,
  QuestionCardInput,
} from './intake/QuestionCard';
export { ConversationalWelcome } from './intake/ConversationalWelcome';
export { EnhancedSeveritySlider } from './intake/EnhancedSeveritySlider';
export { SymptomAutocomplete } from './intake/SymptomAutocomplete';
export {
  ProgressiveDisclosure,
  Question,
  useProgressiveGrouping,
} from './intake/ProgressiveDisclosure';
export { ProgressStepper, useProgressSteps } from './intake/ProgressStepper';
export type { ProgressStep } from './intake/ProgressStepper';

// SOAP Notes Review Component
export { SOAPNotesReview } from './SOAPNotesReview';
