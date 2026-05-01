/**
 * OpenRouter Vision Client
 * Multi-provider vision API with automatic routing and fallback
 * Cost: ~$0.50 per 1K images (90% cheaper than direct OpenAI)
 */

import { logger } from '@/lib/observability/logger'

export type OpenRouterModel =
  | 'anthropic/claude-3.5-sonnet-vision'
  | 'google/gemini-pro-vision'
  | 'openai/gpt-4o'
  | 'openai/gpt-4o-mini'

export interface OpenRouterVisionOptions {
  model?: OpenRouterModel
  maxTokens?: number
  temperature?: number
  detail?: 'low' | 'high' | 'auto'
}

export interface OpenRouterVisionResponse {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  costUSD: number
}

// Pricing per 1M tokens (as of Jan 2026)
const MODEL_PRICING: Record<OpenRouterModel, { input: number; output: number }> = {
  'anthropic/claude-3.5-sonnet-vision': { input: 3.0, output: 15.0 },
  'google/gemini-pro-vision': { input: 0.125, output: 0.375 },
  'openai/gpt-4o': { input: 2.5, output: 10.0 },
  'openai/gpt-4o-mini': { input: 0.15, output: 0.6 },
}

// Default model cascade for reliability
const MODEL_CASCADE: OpenRouterModel[] = [
  'google/gemini-pro-vision',    // Cheapest, fastest
  'openai/gpt-4o-mini',          // Fallback 1
  'anthropic/claude-3.5-sonnet-vision', // Fallback 2 (most accurate)
]

class OpenRouterClient {
  private apiKey: string
  private baseURL = 'https://openrouter.ai/api/v1'

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''

    if (!this.apiKey) {
      logger.debug('[OPENROUTER] API key not configured; provider disabled')
    }
  }

  /**
   * Analyze image with vision model
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    systemPrompt?: string,
    options: OpenRouterVisionOptions = {}
  ): Promise<OpenRouterVisionResponse> {
    const {
      model = MODEL_CASCADE[0],
      maxTokens = 1500,
      temperature = 0.2,
      detail = 'high',
    } = options

    const startTime = Date.now()

    try {
      const response = await this.makeRequest(
        imageUrl,
        prompt,
        systemPrompt,
        model,
        maxTokens,
        temperature,
        detail
      )

      const latencyMs = Date.now() - startTime

      logger.info('[OPENROUTER] Vision analysis completed', {
        model,
        latencyMs,
        tokens: response.usage.totalTokens,
        costUSD: response.costUSD,
      })

      return response
    } catch (error) {
      logger.error('[OPENROUTER] Vision analysis failed', { error, model })

      // Try fallback models
      const currentIndex = MODEL_CASCADE.indexOf(model)
      if (currentIndex < MODEL_CASCADE.length - 1) {
        const fallbackModel = MODEL_CASCADE[currentIndex + 1]
        logger.warn(`[OPENROUTER] Retrying with fallback model: ${fallbackModel}`)

        return this.analyzeImage(imageUrl, prompt, systemPrompt, {
          ...options,
          model: fallbackModel,
        })
      }

      throw error
    }
  }

  /**
   * Make request to OpenRouter API
   */
  private async makeRequest(
    imageUrl: string,
    prompt: string,
    systemPrompt: string | undefined,
    model: OpenRouterModel,
    maxTokens: number,
    temperature: number,
    detail: 'low' | 'high' | 'auto'
  ): Promise<OpenRouterVisionResponse> {
    const messages = []

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      })
    }

    messages.push({
      role: 'user',
      content: [
        {
          type: 'image_url',
          image_url: {
            url: imageUrl,
            detail,
          },
        },
        {
          type: 'text',
          text: prompt,
        },
      ],
    })

    const requestBody = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    }

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://doctor.mx',
        'X-Title': 'Doctor.mx Telemedicine',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
      )
    }

    const data = await response.json()

    const content = data.choices?.[0]?.message?.content || ''
    const usage = {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    }

    // Calculate cost
    const pricing = MODEL_PRICING[model]
    const costUSD =
      (usage.promptTokens / 1_000_000) * pricing.input +
      (usage.completionTokens / 1_000_000) * pricing.output

    return {
      content,
      model: data.model || model,
      usage,
      costUSD,
    }
  }

  /**
   * Get recommended model based on use case
   */
  getRecommendedModel(useCase: 'speed' | 'cost' | 'accuracy'): OpenRouterModel {
    switch (useCase) {
      case 'speed':
        return 'google/gemini-pro-vision'
      case 'cost':
        return 'google/gemini-pro-vision'
      case 'accuracy':
        return 'anthropic/claude-3.5-sonnet-vision'
      default:
        return 'openai/gpt-4o-mini'
    }
  }

  /**
   * Estimate cost before making request
   */
  estimateCost(
    model: OpenRouterModel,
    estimatedPromptTokens: number,
    estimatedCompletionTokens: number
  ): number {
    const pricing = MODEL_PRICING[model]
    return (
      (estimatedPromptTokens / 1_000_000) * pricing.input +
      (estimatedCompletionTokens / 1_000_000) * pricing.output
    )
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

// Singleton instance
let openRouterClient: OpenRouterClient | null = null

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    openRouterClient = new OpenRouterClient()
  }
  return openRouterClient
}

export const openrouter = getOpenRouterClient()
