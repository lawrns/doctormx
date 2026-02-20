/**
 * AI Disclaimer System
 *
 * Mandatory disclosure requirements for AI-generated clinical content per NOM-004-SSA3-2012
 * and transparency requirements for AI-assisted medical recommendations.
 *
 * @module clinical-validation/ai-disclaimer
 * @version 1.0.0
 */

import { logger } from '@/lib/observability/logger'
import { createAuditLog } from '@/lib/audit/immutable-log'
import type { AuditCategory, AuditEventType } from '@/types/audit'

// ================================================
// CONSTANTS
// ================================================

/**
 * AI disclosure requirement levels per NOM-004
 */
export const AI_DISCLOSURE_LEVELS = {
  /** Full disclosure required - AI generated the content */
  FULL: 'full',

  /** Partial disclosure - AI assisted with human review */
  PARTIAL: 'partial',

  /** Minimal disclosure - AI provided suggestions only */
  MINIMAL: 'minimal',

  /** No AI involvement - human created */
  NONE: 'none',
} as const

/**
 * Required disclaimer text templates (Spanish)
 */
export const AI_DISCLAIMER_TEMPLATES = {
  /** Full AI generation - no human review */
  full: `IMPORTANTE: Este contenido fue generado por inteligencia artificial.
El personal médico debe revisar y validar toda la información antes de su uso clínico.
Este sistema es una herramienta de apoyo y NO substituye el juicio clínico profesional.`,

  /** Partial AI - AI assisted with human review */
  partial: `CONTENIDO CON APOYO DE IA: Este contenido fue asistido por inteligencia artificial
y revisado por personal médico. La información ha sido validada antes de su uso.`,

  /** Minimal AI - AI provided suggestions */
  minimal: `SUGERENCIAS DE IA: Las recomendaciones mostradas fueron generadas por inteligencia artificial
como referencia. El personal médico debe ejercer su juicio clínico independiente.`,

  /** No AI - human created */
  none: '',
} as const

/**
 * AI model version information for audit trail
 */
export interface AiModelInfo {
  /** Model name (e.g., "GPT-4", "Claude Opus") */
  model_name: string

  /** Model version */
  model_version: string

  /** Provider (OpenAI, Anthropic, etc.) */
  provider: string

  /** Timestamp of model training cutoff (if known) */
  training_cutoff?: string
}

/**
 * AI disclosure metadata attached to clinical content
 */
export interface AiDisclosure {
  /** Disclosure level */
  level: typeof AI_DISCLOSURE_LEVELS[keyof typeof AI_DISCLOSURE_LEVELS]

  /** AI model information */
  model_info: AiModelInfo | null

  /** Human reviewer ID (if applicable) */
  reviewed_by: string | null

  /** Review timestamp */
  reviewed_at: string | null

  /** Disclaimer text shown to user */
  disclaimer_text: string

  /** User acknowledgment timestamp */
  acknowledged_at: string | null
}

// ================================================
// DISCLOSURE MANAGEMENT
// ================================================

/**
 * Create AI disclosure for clinical content
 *
 * @param contentId - Clinical content ID (SOAP note, prescription, etc.)
 * @param contentType - Type of clinical content
 * @param level - AI disclosure level
 * @param modelInfo - AI model information (optional)
 * @param userId - User creating the content
 * @returns AI disclosure record
 */
export async function createAiDisclosure(
  contentId: string,
  contentType: 'soap_note' | 'prescription' | 'recommendation' | 'diagnosis',
  level: typeof AI_DISCLOSURE_LEVELS[keyof typeof AI_DISCLOSURE_LEVELS],
  modelInfo: AiModelInfo | null,
  userId: string
): Promise<AiDisclosure> {
  const disclaimerText = AI_DISCLAIMER_TEMPLATES[level]

  const disclosure: AiDisclosure = {
    level,
    model_info: modelInfo,
    reviewed_by: level === 'full' ? null : userId,
    reviewed_at: level === 'full' ? null : new Date().toISOString(),
    disclaimer_text: disclaimerText,
    acknowledged_at: null,
  }

  // Log to audit trail
  await createAuditLog({
    id: `ai_disclosure_${contentId}_${Date.now()}`,
    category: 'compliance' as AuditCategory,
    event_type: 'compliance.check' as AuditEventType,
    occurred_at: new Date(),
    actor: {
      user_id: userId,
      role: 'user',
      user_name: null,
      type: 'user',
    },
    resource: {
      type: contentType,
      id: contentId,
      name: `AI Disclosure - ${level}`,
    },
    outcome: {
      status: 'success',
    },
    metadata: {
      ai_disclosure_level: level,
      ai_model: modelInfo?.model_name || null,
      ai_provider: modelInfo?.provider || null,
      disclaimer_text: disclaimerText,
    },
  })

  logger.info('AI disclosure created', {
    contentId,
    contentType,
    level,
    userId,
  })

  return disclosure
}

/**
 * Get required disclosure for content type
 *
 * @param contentType - Type of clinical content
 * @returns Whether AI disclosure is required
 */
export function isAiDisclosureRequired(
  contentType: 'soap_note' | 'prescription' | 'recommendation' | 'diagnosis'
): boolean {
  // All clinical content types require disclosure if AI was used
  // The disclosure level (full/partial/minimal) depends on actual AI involvement
  return true
}

/**
 * Validate that AI disclosure is present for AI-generated content
 *
 * @param content - Clinical content data
 * @param disclosure - AI disclosure (if any)
 * @returns Validation result
 */
export function validateAiDisclosure(
  content: {
    id: string
    type: string
    created_by: string
    ai_generated: boolean | null
  },
  disclosure: AiDisclosure | null
): {
  is_valid: boolean
  error_message: string | null
} {
  // If content is AI-generated, disclosure must be present
  if (content.ai_generated === true && !disclosure) {
    return {
      is_valid: false,
      error_message: 'Contenido generado por IA requiere disclaimer obligatorio',
    }
  }

  // If disclosure exists, verify it has required fields
  if (disclosure) {
    if (!disclosure.disclaimer_text || disclosure.disclaimer_text.length === 0) {
      return {
        is_valid: false,
        error_message: 'El disclaimer de IA no tiene texto',
      }
    }

    // Full AI requires no human reviewer
    if (disclosure.level === 'full' && disclosure.reviewed_by) {
      return {
        is_valid: false,
        error_message: 'Contenido totalmente generado por IA no debe tener revisor humano',
      }
    }

    // Partial/Minimal requires human reviewer
    if (
      (disclosure.level === 'partial' || disclosure.level === 'minimal') &&
      !disclosure.reviewed_by
    ) {
      return {
        is_valid: false,
        error_message: 'Contenido asistido por IA requiere revisión humana',
      }
    }
  }

  return {
    is_valid: true,
    error_message: null,
  }
}

/**
 * Get formatted AI disclaimer for display in UI
 *
 * @param disclosure - AI disclosure record
 * @param locale - Display locale (default: Spanish)
 * @returns Formatted disclaimer with styling hints
 */
export function formatAiDisclaimerForDisplay(
  disclosure: AiDisclosure | null,
  locale: 'es' | 'en' = 'es'
): {
  text: string
  icon_type: 'warning' | 'info' | 'none'
  css_class: string
} {
  if (!disclosure || disclosure.level === 'none') {
    return {
      text: '',
      icon_type: 'none',
      css_class: '',
    }
  }

  const iconTypes: Record<typeof AI_DISCLOSURE_LEVELS[keyof typeof AI_DISCLOSURE_LEVELS], 'warning' | 'info' | 'none'> = {
    full: 'warning',
    partial: 'warning',
    minimal: 'info',
    none: 'none',
  }

  const cssClasses: Record<typeof AI_DISCLOSURE_LEVELS[keyof typeof AI_DISCLOSURE_LEVELS], string> = {
    full: 'bg-amber-50 border-amber-200 text-amber-800',
    partial: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    minimal: 'bg-blue-50 border-blue-200 text-blue-800',
    none: '',
  }

  return {
    text: disclosure.disclaimer_text,
    icon_type: iconTypes[disclosure.level],
    css_class: cssClasses[disclosure.level],
  }
}

// ================================================
// MODEL INFO
// ================================================

/**
 * Get current AI model information from environment
 *
 * @returns AI model info or null if not configured
 */
export function getCurrentAiModelInfo(): AiModelInfo | null {
  const modelName = process.env.AI_MODEL_NAME || process.env.OPENAI_MODEL
  const provider = process.env.AI_PROVIDER ?? 'openai'

  if (!modelName) {
    logger.warn('AI model not configured in environment')
    return null
  }

  return {
    model_name: modelName,
    model_version: process.env.AI_MODEL_VERSION ?? 'unknown',
    provider: provider,
    training_cutoff: process.env.AI_TRAINING_CUTOFF,
  }
}

/**
 * Check if AI model is approved for clinical use
 *
 * @param modelName - Model name to check
 * @returns True if model is approved for clinical recommendations
 */
export function isApprovedAiModel(modelName: string): boolean {
  // Approved models for clinical use (configure per organization policy)
  const APPROVED_MODELS = [
    'gpt-4',
    'gpt-4-turbo',
    'claude-opus-4-6',
    'claude-sonnet-4-5',
  ]

  return APPROVED_MODELS.includes(modelName.toLowerCase())
}

/**
 * Record AI usage for compliance reporting
 *
 * @param userId - User ID
 * @param contentType - Type of content
 * @param modelInfo - AI model used
 * @param tokensUsed - Number of tokens consumed
 */
export async function recordAiUsage(
  userId: string,
  contentType: string,
  modelInfo: AiModelInfo | null,
  tokensUsed: number
): Promise<void> {
  await createAuditLog({
    id: `ai_usage_${Date.now()}`,
    category: 'compliance' as AuditCategory,
    event_type: 'compliance.check' as AuditEventType,
    occurred_at: new Date(),
    actor: {
      user_id: userId,
      role: 'user',
      user_name: null,
      type: 'user',
    },
    resource: {
      type: 'ai_usage',
      id: null,
      name: `AI Usage - ${modelInfo?.model_name ?? 'unknown'}`,
    },
    outcome: {
      status: 'success',
    },
    metadata: {
      content_type: contentType,
      model_name: modelInfo?.model_name,
      provider: modelInfo?.provider,
      tokens_used: tokensUsed,
      estimated_cost: calculateCost(tokensUsed, modelInfo?.model_name ?? 'unknown'),
    },
  })

  logger.info('AI usage recorded', {
    userId,
    contentType,
    modelInfo,
    tokensUsed,
  })
}

/**
 * Calculate estimated cost for AI usage
 *
 * @param tokens - Number of tokens
 * @param modelName - Model name
 * @returns Estimated cost in USD
 */
function calculateCost(tokens: number, modelName: string): number {
  // Approximate costs per 1K tokens (as of 2024)
  const COSTS_PER_1K_TOKENS: Record<string, number> = {
    'gpt-4': 0.03,
    'gpt-4-turbo': 0.01,
    'claude-opus': 0.015,
    'claude-sonnet': 0.003,
  }

  const costPer1k = COSTS_PER_1K_TOKENS[modelName.toLowerCase()] ?? 0.01
  return (tokens / 1000) * costPer1k
}

/**
 * Get AI usage statistics for a user
 *
 * @param userId - User ID
 * @param dateFrom - Start date for statistics
 * @param dateTo - End date for statistics
 * @returns Usage statistics
 */
export async function getAiUsageStatistics(
  userId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<{
  total_requests: number
  total_tokens: number
  estimated_cost: number
  by_content_type: Record<string, number>
  by_model: Record<string, number>
}> {
  const { getAuditLogs } = await import('@/lib/audit/immutable-log')

  const { logs } = await getAuditLogs(
    {
      category: 'compliance' as AuditCategory,
      user_id: userId,
      date_from: dateFrom,
      date_to: dateTo,
    },
    { limit: 10000 }
  )

  const aiLogs = logs.filter((log) =>
    log.resource.type === 'ai_usage' || log.event_type === 'compliance.check'
  )

  const stats = {
    total_requests: aiLogs.length,
    total_tokens: 0,
    estimated_cost: 0,
    by_content_type: {} as Record<string, number>,
    by_model: {} as Record<string, number>,
  }

  for (const log of aiLogs) {
    const contentType = log.metadata?.content_type as string | undefined
    const modelName = log.metadata?.model_name as string | undefined
    const tokens = (log.metadata?.tokens_used as number) ?? 0
    const cost = (log.metadata?.estimated_cost as number) ?? 0

    stats.total_tokens += tokens
    stats.estimated_cost += cost

    if (contentType) {
      stats.by_content_type[contentType] = (stats.by_content_type[contentType] ?? 0) + 1
    }

    if (modelName) {
      stats.by_model[modelName] = (stats.by_model[modelName] ?? 0) + 1
    }
  }

  return stats
}

/**
 * Generate AI compliance report for audit purposes
 *
 * @param dateFrom - Report start date
 * @param dateTo - Report end date
 * @returns Compliance report data
 */
export async function generateAiComplianceReport(
  dateFrom: Date,
  dateTo: Date
): Promise<{
  report_date: string
  period: { start: string; end: string }
  total_ai_interactions: number
  total_tokens_consumed: number
  total_estimated_cost: number
  models_used: string[]
  disclosure_compliance_rate: number
}> {
  const { getAuditLogs } = await import('@/lib/audit/immutable-log')

  const { logs } = await getAuditLogs(
    {
      category: 'compliance' as AuditCategory,
      date_from: dateFrom,
      date_to: dateTo,
    },
    { limit: 10000 }
  )

  const aiLogs = logs.filter((log) =>
    log.resource?.name?.includes('AI') || log.event_type === 'compliance.check'
  )

  const modelsUsed = new Set<string>()
  let totalTokens = 0
  let totalCost = 0
  let disclosureCount = 0

  for (const log of aiLogs) {
    const modelName = log.metadata?.model_name as string | undefined
    if (modelName) {
      modelsUsed.add(modelName)
    }

    totalTokens += (log.metadata?.tokens_used as number) ?? 0
    totalCost += (log.metadata?.estimated_cost as number) ?? 0

    if (log.metadata?.ai_disclosure_level) {
      disclosureCount++
    }
  }

  return {
    report_date: new Date().toISOString(),
    period: {
      start: dateFrom.toISOString(),
      end: dateTo.toISOString(),
    },
    total_ai_interactions: aiLogs.length,
    total_tokens_consumed: totalTokens,
    total_estimated_cost: totalCost,
    models_used: Array.from(modelsUsed),
    disclosure_compliance_rate: aiLogs.length > 0 ? disclosureCount / aiLogs.length : 1,
  }
}
