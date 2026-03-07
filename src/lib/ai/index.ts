/**
 * Exporta todos los módulos de IA
 *
 * GLM z.ai is the primary provider for Doctor.mx
 */

export * from './config';
export * from './types';
export * from './prompts';
export * from './client';
export * from './vision';
export * from './glm';
export * from './kimi';

// Re-exportar constantes útiles
export { AI_CONFIG, validateAIConfig, estimateCost, getActiveProvider } from './config';
export { chatCompletion, transcribeAudio, structuredAnalysis, safetyCheck, auditAIOperation } from './client';
export {
  glm,
  GLM_CONFIG,
  isGLMConfigured,
  calculateGLMCost,
  getGLMModel,
  glmChatCompletion,
  glmStreamingCompletion,
  glmVisionAnalysis
} from './glm';
export {
  kimi,
  KIMI_CONFIG,
  isKimiConfigured,
  calculateKimiCost,
  kimiChatCompletion
} from './kimi';
export {
  PRECONSULTA_SYSTEM_PROMPT,
  PRECONSULTA_URGENCY_PROMPT,
  TRANSCRIPTION_SUMMARY_PROMPT,
  FOLLOWUP_TEMPLATES,
  fillTemplate,
  extractTemplateVariables
} from './prompts';
export {
  analyzeMedicalImage,
  getAnalysis,
  getPatientAnalyses,
  updateAnalysisWithDoctorReview,
  getPendingDoctorReviews,
  getUrgencyLabel,
  getImageTypeLabel,
  getUrgencyColor,
  getStatusLabel,
  type ImageType,
  type UrgencyLevel,
  type AnalysisStatus,
  type MedicalImageAnalysis,
  type AnalysisResult
} from './vision';
