import OpenAI from 'openai'
import { logger } from '@/lib/observability/logger'
import { AI_CONFIG } from './config'

export const kimi = new OpenAI({
  apiKey: process.env.KIMI_API_KEY || '',
  baseURL: AI_CONFIG.kimi.baseURL,
  timeout: AI_CONFIG.limits.timeoutMs,
  maxRetries: AI_CONFIG.limits.maxRetries,
})

export const KIMI_CONFIG = {
  models: {
    reasoning: AI_CONFIG.kimi.models.reasoning,
    costEffective: AI_CONFIG.kimi.models.chat,
    vision: AI_CONFIG.kimi.models.vision,
  },
  pricing: {
    input: AI_CONFIG.costs.kimiInputPer1M,
    output: AI_CONFIG.costs.kimiOutputPer1M,
  },
  defaults: {
    temperature: AI_CONFIG.kimi.temperature,
    maxTokens: AI_CONFIG.kimi.maxTokens,
  },
} as const

export type KimiModel = typeof KIMI_CONFIG.models[keyof typeof KIMI_CONFIG.models]

export function calculateKimiCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * KIMI_CONFIG.pricing.input
  const outputCost = (outputTokens / 1_000_000) * KIMI_CONFIG.pricing.output
  return inputCost + outputCost
}

export function isKimiConfigured(): boolean {
  return !!process.env.KIMI_API_KEY
}

export function getKimiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return ''
}

export function getKimiErrorStatus(error: unknown): number | null {
  if (error && typeof error === 'object' && 'status' in error && typeof error.status === 'number') {
    return error.status
  }
  return null
}

export function isKimiPolicyRestricted(error: unknown): boolean {
  const status = getKimiErrorStatus(error)
  const message = getKimiErrorMessage(error)

  return status === 403 && message.includes('currently only available for Coding Agents')
}

export async function kimiChatCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  model?: KimiModel
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}): Promise<{
  content: string
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
  costUSD: number
  model: string
}> {
  const {
    messages,
    model = KIMI_CONFIG.models.costEffective,
    temperature = KIMI_CONFIG.defaults.temperature,
    maxTokens = KIMI_CONFIG.defaults.maxTokens,
    jsonMode = false,
  } = params

  const startTime = Date.now()

  try {
    const response = await kimi.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    })

    const message = response.choices[0]?.message
    const content = message?.content || ''
    const usage = {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    }
    const costUSD = calculateKimiCost(usage.inputTokens, usage.outputTokens)

    logger.info('[KIMI] Chat completion successful', {
      model,
      latencyMs: Date.now() - startTime,
      tokens: usage.totalTokens,
      costUSD,
      baseURL: AI_CONFIG.kimi.baseURL,
    })

    return {
      content,
      usage,
      costUSD,
      model,
    }
  } catch (error) {
    logger.error('[KIMI] Chat completion failed', { error, model, baseURL: AI_CONFIG.kimi.baseURL, latencyMs: Date.now() - startTime })
    throw error
  }
}
