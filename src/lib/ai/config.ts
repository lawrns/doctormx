/**
 * Configuración central para servicios de IA
 * OpenAI, Whisper, y otros modelos
 */

export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: 'gpt-4o-mini', // Más económico para triaje
    temperature: 0.3, // Menos creativo, más consistente
    maxTokens: 500, // Respuestas concisas
  },

  whisper: {
    apiKey: process.env.OPENAI_API_KEY || '', // Mismo key que OpenAI
    model: 'whisper-1',
    language: 'es', // Español por defecto
    responseFormat: 'json' as const,
  },

  // Límites y quotas
  limits: {
    maxMessagesPerSession: 20, // Pre-consulta no debe ser interminable
    maxAudioMinutes: 60, // Consulta típica 20-40min
    maxRetries: 3,
    timeoutMs: 30000, // 30 segundos
  },

  // Costos estimados (para tracking)
  costs: {
    gpt4oMiniInputPer1M: 0.15, // USD por 1M tokens
    gpt4oMiniOutputPer1M: 0.60,
    whisperPerMinute: 0.006, // USD por minuto
  },

  // Features flags (enable/disable por feature)
  features: {
    preConsulta: process.env.NEXT_PUBLIC_AI_PRECONSULTA === 'true' || true,
    transcription: process.env.NEXT_PUBLIC_AI_TRANSCRIPTION === 'true' || true,
    followUp: process.env.NEXT_PUBLIC_AI_FOLLOWUP === 'true' || true,
    prescriptionAssist: false, // Fase 2
    smartMatching: false, // Fase 2
  },
} as const;

/**
 * Valida que las API keys estén configuradas
 */
export function validateAIConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!AI_CONFIG.openai.apiKey && AI_CONFIG.features.preConsulta) {
    errors.push('OPENAI_API_KEY no configurada pero preConsulta está habilitada');
  }

  if (!AI_CONFIG.whisper.apiKey && AI_CONFIG.features.transcription) {
    errors.push('OPENAI_API_KEY no configurada pero transcription está habilitada');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calcula costo estimado de una operación
 */
export function estimateCost(operation: {
  type: 'chat' | 'transcription';
  inputTokens?: number;
  outputTokens?: number;
  audioMinutes?: number;
}): number {
  if (operation.type === 'chat') {
    const inputCost = ((operation.inputTokens || 0) / 1_000_000) * AI_CONFIG.costs.gpt4oMiniInputPer1M;
    const outputCost = ((operation.outputTokens || 0) / 1_000_000) * AI_CONFIG.costs.gpt4oMiniOutputPer1M;
    return inputCost + outputCost;
  }

  if (operation.type === 'transcription') {
    return (operation.audioMinutes || 0) * AI_CONFIG.costs.whisperPerMinute;
  }

  return 0;
}
