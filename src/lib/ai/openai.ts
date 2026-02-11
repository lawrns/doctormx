/**
 * OpenAI GPT-4o Client for Doctor.mx
 * Primary AI model for medical consultations
 *
 * Model: GPT-4o (gpt-4o-2024-11-20)
 * - Excellent Spanish medical reasoning
 * - Native tool/function calling
 * - Strong clinical reasoning capabilities
 *
 * Pricing (per 1M tokens):
 * - Input: $2.50
 * - Output: $10.00
 */

import OpenAI from 'openai'
import { logger } from '@/lib/observability/logger'

// OpenAI Client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

// OpenAI Configuration
export const OPENAI_CONFIG = {
  models: {
    gpt4o: 'gpt-4o-2024-11-20',        // Best for medical reasoning
    gpt4oMini: 'gpt-4o-mini-2024-07-18', // Fast, cost-effective for triage
  },
  pricing: {
    input: 2.50,       // USD per 1M tokens (gpt-4o)
    output: 10.00,     // USD per 1M tokens (gpt-4o)
    inputMini: 0.15,   // USD per 1M tokens (gpt-4o-mini)
    outputMini: 0.60,  // USD per 1M tokens (gpt-4o-mini)
  },
  defaults: {
    temperature: 0.2,  // Lower for medical accuracy
    maxTokens: 4096,   // Higher for complex medical responses
  },
} as const

export type OpenAIModel = typeof OPENAI_CONFIG.models[keyof typeof OPENAI_CONFIG.models]

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Calculate cost for OpenAI API usage
 */
export function calculateOpenAICost(
  inputTokens: number,
  outputTokens: number,
  model: OpenAIModel = OPENAI_CONFIG.models.gpt4o
): number {
  const isMini = model === OPENAI_CONFIG.models.gpt4oMini
  const inputCost = (inputTokens / 1_000_000) * (isMini ? OPENAI_CONFIG.pricing.inputMini : OPENAI_CONFIG.pricing.input)
  const outputCost = (outputTokens / 1_000_000) * (isMini ? OPENAI_CONFIG.pricing.outputMini : OPENAI_CONFIG.pricing.output)
  return inputCost + outputCost
}

/**
 * OpenAI Chat Completion wrapper with cost tracking
 */
export async function openaiChatCompletion(params: {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  system?: string
  model?: OpenAIModel
  temperature?: number
  maxTokens?: number
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
  toolChoice?: OpenAI.Chat.Completions.ChatCompletionToolChoiceOption
  jsonMode?: boolean
}): Promise<{
  content: string
  toolCalls?: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
  costUSD: number
  model: string
}> {
  const {
    messages,
    system,
    model = OPENAI_CONFIG.models.gpt4o,
    temperature = OPENAI_CONFIG.defaults.temperature,
    maxTokens = OPENAI_CONFIG.defaults.maxTokens,
    tools,
    toolChoice,
    jsonMode = false,
  } = params

  const startTime = Date.now()

  try {
    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...(system ? [{ role: 'system' as const, content: system }] : []),
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    const response = await openai.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      ...(tools && { tools }),
      ...(toolChoice && { tool_choice: toolChoice }),
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    })

    const choice = response.choices[0]
    const message = choice.message

    const usage = {
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    }
    const costUSD = calculateOpenAICost(usage.inputTokens, usage.outputTokens, model)

    const latencyMs = Date.now() - startTime

    logger.info('[OpenAI] Chat completion successful', {
      model,
      latencyMs,
      tokens: usage.totalTokens,
      costUSD,
      toolCalls: message.tool_calls?.length || 0,
    })

    return {
      content: message.content || '',
      toolCalls: message.tool_calls,
      usage,
      costUSD,
      model: response.model,
    }
  } catch (error) {
    const latencyMs = Date.now() - startTime
    logger.error('[OpenAI] Chat completion failed', { error, model, latencyMs })
    throw error
  }
}

/**
 * OpenAI Streaming Chat Completion
 */
export async function* openaiStreamingCompletion(params: {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  system?: string
  model?: OpenAIModel
  temperature?: number
  maxTokens?: number
}): AsyncGenerator<string, void, unknown> {
  const {
    messages,
    system,
    model = OPENAI_CONFIG.models.gpt4o,
    temperature = OPENAI_CONFIG.defaults.temperature,
    maxTokens = OPENAI_CONFIG.defaults.maxTokens,
  } = params

  try {
    const formattedMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...(system ? [{ role: 'system' as const, content: system }] : []),
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ]

    const stream = await openai.chat.completions.create({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error) {
    logger.error('[OpenAI] Streaming completion failed', { error, model })
    throw error
  }
}

/**
 * Unified AI client that uses OpenAI GPT-4o with GLM fallback
 */
export async function aiChatCompletion(params: {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  system?: string
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
  preferOpenAI?: boolean
}): Promise<{
  content: string
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
  costUSD: number
  model: string
  provider: 'openai' | 'glm'
}> {
  const { preferOpenAI = true, ...openaiParams } = params

  // Try OpenAI first if preferred and configured
  if (preferOpenAI && isOpenAIConfigured()) {
    try {
      const result = await openaiChatCompletion({
        ...openaiParams,
        messages: openaiParams.messages.filter(m => m.role !== 'system') as Array<{ role: 'user' | 'assistant'; content: string }>,
      })
      return {
        content: result.content,
        usage: result.usage,
        costUSD: result.costUSD,
        model: result.model,
        provider: 'openai',
      }
    } catch (error) {
      logger.warn('[AI] OpenAI failed, falling back to GLM', { error })
    }
  }

  // Fall back to GLM
  const { glmChatCompletion } = await import('./glm')
  const glmResult = await glmChatCompletion({
    messages: params.messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    temperature: params.temperature,
    maxTokens: params.maxTokens,
    jsonMode: params.jsonMode,
  })

  return {
    content: glmResult.content,
    usage: glmResult.usage,
    costUSD: glmResult.costUSD,
    model: glmResult.model,
    provider: 'glm',
  }
}

// Export default client
export default openai

