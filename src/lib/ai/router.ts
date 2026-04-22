/**
 * AI Provider Router
 * OpenRouter is the sole active provider for Doctor.mx
 * DeepSeek → OpenAI as last-resort fallbacks
 */

import { openai } from '@/lib/openai'
import { openrouter } from './openrouter'
import { deepseek, type DeepSeekMessage } from './deepseek'
import { AI_CONFIG } from './config'
import { logger } from '@/lib/observability/logger'

export type AIProvider = 'openai' | 'openrouter' | 'deepseek'

export type UseCase =
  | 'vision-analysis'      // Medical image analysis
  | 'differential-diagnosis' // Complex medical reasoning
  | 'triage'              // Patient symptom triage
  | 'prescription'        // Medication recommendations
  | 'transcription'       // Audio to text
  | 'general-chat'        // General conversation
  | 'soap-notes'          // Clinical documentation

export interface RouterConfig {
  preferredProvider?: AIProvider
  fallbackProviders?: AIProvider[]
  maxRetries?: number
  costOptimization?: boolean
}

export interface RouterResponse {
  content: string
  provider: AIProvider
  model: string
  costUSD: number
  latencyMs: number
  reasoning?: string
}

/**
 * Default routing strategy — OpenRouter for everything LLM-related
 */
const USE_CASE_ROUTING: Record<UseCase, { primary: AIProvider; fallbacks: AIProvider[] }> = {
  'vision-analysis':   { primary: 'openrouter', fallbacks: ['openai'] },
  'differential-diagnosis': { primary: 'openrouter', fallbacks: ['deepseek', 'openai'] },
  'triage':            { primary: 'openrouter', fallbacks: ['deepseek', 'openai'] },
  'prescription':      { primary: 'openrouter', fallbacks: ['deepseek', 'openai'] },
  'transcription':     { primary: 'openai',     fallbacks: [] },
  'general-chat':      { primary: 'openrouter', fallbacks: ['deepseek', 'openai'] },
  'soap-notes':        { primary: 'openrouter', fallbacks: ['deepseek', 'openai'] },
}

/**
 * Make a chat-completion request through OpenRouter directly
 */
async function callOpenRouter(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  model: string,
  maxTokens: number,
  temperature: number,
  jsonMode?: boolean
): Promise<{ content: string; usage: { promptTokens: number; completionTokens: number }; costUSD: number }> {
  const apiKey = AI_CONFIG.openrouter.apiKey
  if (!apiKey) {
    throw new Error('OpenRouter API key not configured')
  }

  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  }

  if (jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const response = await fetch(`${AI_CONFIG.openrouter.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://doctor.mx',
      'X-Title': 'Doctor.mx Telemedicine',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
    )
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''
  const promptTokens = data.usage?.prompt_tokens || 0
  const completionTokens = data.usage?.completion_tokens || 0

  // Determine pricing based on model (all OpenRouter routes currently use MiniMax M2.7)
  const inputPrice: number = AI_CONFIG.costs.openrouterInputPer1M
  const outputPrice: number = AI_CONFIG.costs.openrouterOutputPer1M

  const costUSD =
    (promptTokens / 1_000_000) * inputPrice +
    (completionTokens / 1_000_000) * outputPrice

  return { content, usage: { promptTokens, completionTokens }, costUSD }
}

class AIRouter {
  /**
   * Route vision analysis request
   */
  async routeVision(
    imageUrl: string,
    prompt: string,
    systemPrompt: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _useCase: UseCase = 'vision-analysis',
    config: RouterConfig = {}
  ): Promise<RouterResponse> {
    const startTime = Date.now()

    // Primary: OpenRouter vision client
    if (openrouter.isConfigured()) {
      logger.info('[ROUTER] Routing vision to OpenRouter')

      const response = await openrouter.analyzeImage(
        imageUrl,
        prompt,
        systemPrompt,
        {
          model: config.costOptimization
            ? openrouter.getRecommendedModel('cost')
            : openrouter.getRecommendedModel('accuracy'),
          detail: 'high',
        }
      )

      return {
        content: response.content,
        provider: 'openrouter',
        model: response.model,
        costUSD: response.costUSD,
        latencyMs: Date.now() - startTime,
      }
    }

    // Fallback: OpenAI
    logger.info('[ROUTER] Routing vision to OpenAI (fallback)')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
            { type: 'text', text: prompt },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.2,
    })

    const content = response.choices[0]?.message?.content || ''
    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 }
    const costUSD =
      (usage.prompt_tokens / 1_000_000) * 2.5 +
      (usage.completion_tokens / 1_000_000) * 10.0

    return {
      content,
      provider: 'openai',
      model: 'gpt-4o',
      costUSD,
      latencyMs: Date.now() - startTime,
    }
  }

  /**
   * Route medical reasoning / structured output request
   */
  async routeReasoning(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    useCase: UseCase = 'differential-diagnosis',
    config: RouterConfig = {}
  ): Promise<RouterResponse> {
    const startTime = Date.now()
    const routing = USE_CASE_ROUTING[useCase]
    const provider = config.preferredProvider || routing.primary

    const providersToTry: AIProvider[] = [provider, ...routing.fallbacks.filter((f) => f !== provider)]
    let lastError: unknown = null

    for (const candidate of providersToTry) {
      try {
        // Primary: OpenRouter (MiniMax M2.7 for everything)
        if (candidate === 'openrouter' && AI_CONFIG.openrouter.apiKey) {
          const model = config.costOptimization
            ? AI_CONFIG.openrouter.model
            : AI_CONFIG.openrouter.analysisModel

          logger.info('[ROUTER] Routing reasoning to OpenRouter', { model })

          const { content, costUSD } = await callOpenRouter(
            messages,
            model,
            2000,
            0.3
          )

          return {
            content,
            provider: 'openrouter',
            model,
            costUSD,
            latencyMs: Date.now() - startTime,
          }
        }

        // Fallback 1: DeepSeek
        if (candidate === 'deepseek' && deepseek.isConfigured()) {
          logger.info('[ROUTER] Routing reasoning to DeepSeek')

          const response = await deepseek.chatCompletion(
            messages as DeepSeekMessage[],
            { temperature: 0.3, maxTokens: 2000 }
          )

          return {
            content: response.content,
            provider: 'deepseek',
            model: 'deepseek-reasoner',
            costUSD: response.costUSD,
            latencyMs: Date.now() - startTime,
            reasoning: response.reasoning,
          }
        }

        // Fallback 2: OpenAI
        if (candidate === 'openai') {
          logger.info('[ROUTER] Routing reasoning to OpenAI (fallback)')

          const response = await openai.chat.completions.create({
            model: 'gpt-4-turbo',
            messages,
            temperature: 0.3,
            max_tokens: 2000,
          })

          const content = response.choices[0]?.message?.content || ''
          const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 }
          const costUSD =
            (usage.prompt_tokens / 1_000_000) * 10.0 +
            (usage.completion_tokens / 1_000_000) * 30.0

          return {
            content,
            provider: 'openai',
            model: 'gpt-4-turbo',
            costUSD,
            latencyMs: Date.now() - startTime,
          }
        }
      } catch (error) {
        lastError = error
        logger.warn('[ROUTER] Reasoning provider failed, trying next fallback', { candidate, error })
      }
    }

    logger.warn('[ROUTER] Reasoning routing exhausted fallbacks', { error: lastError, provider })
    throw lastError instanceof Error ? lastError : new Error('Reasoning routing failed')
  }

  /**
   * Route general chat request
   */
  async routeChat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    useCase: UseCase = 'general-chat',
    config: RouterConfig = {}
  ): Promise<RouterResponse> {
    const startTime = Date.now()
    const routing = USE_CASE_ROUTING[useCase]
    const provider = config.preferredProvider || routing.primary

    const providersToTry: AIProvider[] = [provider, ...routing.fallbacks.filter((f) => f !== provider)]
    let lastError: unknown = null

    for (const candidate of providersToTry) {
      try {
        // Primary: OpenRouter with MiniMax M2.7 (fast, cheap chat)
        if (candidate === 'openrouter' && AI_CONFIG.openrouter.apiKey) {
          const model = AI_CONFIG.openrouter.model
          logger.info('[ROUTER] Routing chat to OpenRouter', { model })

          const { content, costUSD } = await callOpenRouter(
            messages,
            model,
            500,
            0.7
          )

          return {
            content,
            provider: 'openrouter',
            model,
            costUSD,
            latencyMs: Date.now() - startTime,
          }
        }

        // Fallback 1: DeepSeek
        if (candidate === 'deepseek' && deepseek.isConfigured()) {
          logger.info('[ROUTER] Routing chat to DeepSeek')

          const response = await deepseek.chatCompletion(
            messages as DeepSeekMessage[],
            { temperature: 0.7, maxTokens: 500 }
          )

          return {
            content: response.content,
            provider: 'deepseek',
            model: 'deepseek-reasoner',
            costUSD: response.costUSD,
            latencyMs: Date.now() - startTime,
            reasoning: response.reasoning,
          }
        }

        // Fallback 2: OpenAI
        if (candidate === 'openai') {
          logger.info('[ROUTER] Routing chat to OpenAI')

          const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 500,
          })

          const content = response.choices[0]?.message?.content || ''
          const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 }
          const costUSD =
            (usage.prompt_tokens / 1_000_000) * 0.15 +
            (usage.completion_tokens / 1_000_000) * 0.6

          return {
            content,
            provider: 'openai',
            model: 'gpt-4o-mini',
            costUSD,
            latencyMs: Date.now() - startTime,
          }
        }
      } catch (error) {
        lastError = error
        logger.warn('[ROUTER] Chat provider failed, trying next fallback', { candidate, error })
      }
    }

    logger.error('[ROUTER] Chat routing failed', { error: lastError, provider })
    throw lastError instanceof Error ? lastError : new Error('Chat routing failed')
  }

  /**
   * Get cost comparison across active providers
   */
  async getCostComparison(
    estimatedTokens: { input: number; output: number }
  ): Promise<Record<AIProvider, number>> {
    return {
      openrouter:
        (estimatedTokens.input / 1_000_000) * AI_CONFIG.costs.openrouterInputPer1M +
        (estimatedTokens.output / 1_000_000) * AI_CONFIG.costs.openrouterOutputPer1M,
      deepseek:
        (estimatedTokens.input / 1_000_000) * 0.14 +
        (estimatedTokens.output / 1_000_000) * 0.28,
      openai:
        (estimatedTokens.input / 1_000_000) * 10.0 +
        (estimatedTokens.output / 1_000_000) * 30.0,
    }
  }

  /**
   * Get provider status
   */
  getProviderStatus(): Record<AIProvider, boolean> {
    return {
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: openrouter.isConfigured(),
      deepseek: deepseek.isConfigured(),
    }
  }

  /**
   * Get the primary provider based on configuration
   */
  getPrimaryProvider(): AIProvider {
    if (AI_CONFIG.openrouter.apiKey) {
      return 'openrouter'
    }
    if (deepseek.isConfigured()) {
      return 'deepseek'
    }
    return 'openai'
  }
}

// Singleton instance
let aiRouter: AIRouter | null = null

export function getAIRouter(): AIRouter {
  if (!aiRouter) {
    aiRouter = new AIRouter()
  }
  return aiRouter
}

export const router = getAIRouter()
