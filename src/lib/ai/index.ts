/**
 * Exporta todos los módulos de IA
 */

export * from './config';
export * from './types';
export * from './prompts';
export * from './client';

// Re-exportar constantes útiles
export { AI_CONFIG, validateAIConfig, estimateCost } from './config';
export { chatCompletion, transcribeAudio, structuredAnalysis, safetyCheck, auditAIOperation } from './client';
export {
  PRECONSULTA_SYSTEM_PROMPT,
  PRECONSULTA_URGENCY_PROMPT,
  TRANSCRIPTION_SUMMARY_PROMPT,
  FOLLOWUP_TEMPLATES,
  fillTemplate,
  extractTemplateVariables
} from './prompts';
