// Export all consultation components
export { default as QuickConsultationStart } from './QuickConsultationStart';
export type { ConsultationData, QuickConsultationStartProps } from './QuickConsultationStart';

export { default as ConsultationProgressSteps } from './ConsultationProgressSteps';
export type { ConsultationStep, ConsultationProgressStepsProps } from './ConsultationProgressSteps';

export { default as ConsultationFlowManager } from './ConsultationFlowManager';
export type { ConsultationFlowManagerProps } from './ConsultationFlowManager';

export { default as GuestConsultationService } from './GuestConsultationService';
export type { 
  GuestConsultationData, 
  ConsultationMessage, 
  AbandonmentRecoveryData 
} from './GuestConsultationService';

export { default as AccountCreationOffer } from './AccountCreationOffer';
export type { AccountCreationOfferProps } from './AccountCreationOffer';