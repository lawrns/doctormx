/**
 * This is an empty placeholder file that redirects to the lazy-loaded version.
 * It prevents errors from static imports while ensuring nothing actually loads.
 */

// We're using direct imports from the lazy version without any xstate dependencies
// This prevents the static evaluation of xstate imports during module parsing
import * as MachineLazy from './questionnaireMachineLazy';

// Re-export everything from the lazy version
export const AnswerSchema = MachineLazy.AnswerSchema;
export const QuestionSchema = MachineLazy.QuestionSchema;
export const SymptomSchema = MachineLazy.SymptomSchema;
export const VALID_BODY_REGIONS = MachineLazy.VALID_BODY_REGIONS;
export const initialContext = MachineLazy.initialContext;
export const isValidBodyRegion = MachineLazy.isValidBodyRegion;

// Export placeholder constant
export const questionnaireMachine = {
  id: 'placeholder',
  initial: 'idle',
  context: MachineLazy.initialContext,
  states: {
    idle: {}
  }
};

// These types are safe to export since they don't involve xstate
export type Answer = MachineLazy.Answer;
export type Question = MachineLazy.Question;
export type Symptom = MachineLazy.Symptom;
export type BodyRegion = MachineLazy.BodyRegion;
export type QuestionnaireContext = MachineLazy.QuestionnaireContext;
export type QuestionnaireEvent = MachineLazy.QuestionnaireEvent;

// Log a warning if this file is actually loaded
console.warn(
  '[DEPRECATED] Attempting to use static questionnaireMachine import. ' +
  'Please use getQuestionnaireMachine() from questionnaireMachineLazy.ts instead.'
);
