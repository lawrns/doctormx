/**
 * DeepSeek R1 Client
 * Superior medical reasoning at 1/10th the cost of GPT-4
 * Cost: $0.14 per 1M input tokens, $0.28 per 1M output tokens
 */

import { logger } from '@/lib/observability/logger'

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DeepSeekOptions {
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface DeepSeekResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  costUSD: number
  reasoning?: string
}

// Pricing (as of Jan 2026)
const PRICING = {
  input: 0.14,  // per 1M tokens
  output: 0.28, // per 1M tokens
}

class DeepSeekClient {
  private apiKey: string
  private baseURL = 'https://api.deepseek.com/v1'

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || ''

    if (!this.apiKey) {
      logger.warn('[DEEPSEEK] API key not configured')
    }
  }

  /**
   * Chat completion with DeepSeek R1
   * Optimized for complex medical reasoning
   */
  async chatCompletion(
    messages: DeepSeekMessage[],
    options: DeepSeekOptions = {}
  ): Promise<DeepSeekResponse> {
    const {
      temperature = 0.3,
      maxTokens = 2000,
      topP = 0.95,
      frequencyPenalty = 0,
      presencePenalty = 0,
    } = options

    const startTime = Date.now()

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          frequency_penalty: frequencyPenalty,
          presence_penalty: presencePenalty,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `DeepSeek API error: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`
        )
      }

      const data = await response.json()

      const content = data.choices?.[0]?.message?.content || ''
      const reasoning = data.choices?.[0]?.message?.reasoning_content || undefined

      const usage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      }

      // Calculate cost
      const costUSD =
        (usage.promptTokens / 1_000_000) * PRICING.input +
        (usage.completionTokens / 1_000_000) * PRICING.output

      const latencyMs = Date.now() - startTime

      logger.info('[DEEPSEEK] Chat completion successful', {
        latencyMs,
        tokens: usage.totalTokens,
        costUSD,
        hasReasoning: !!reasoning,
      })

      return {
        content,
        usage,
        costUSD,
        reasoning,
      }
    } catch (error) {
      logger.error('[DEEPSEEK] Chat completion failed', { error })
      throw error
    }
  }

  /**
   * Medical differential diagnosis with chain-of-thought reasoning
   */
  async medicalReasoning(
    symptoms: string[],
    patientContext: string,
    systemPrompt: string
  ): Promise<DeepSeekResponse> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `Paciente con los siguientes síntomas:\n${symptoms.map(s => `- ${s}`).join('\n')}\n\nContexto adicional:\n${patientContext}\n\nProporciona un análisis de diagnóstico diferencial con razonamiento paso a paso.`,
      },
    ]

    return this.chatCompletion(messages, {
      temperature: 0.4, // Slightly higher for medical creativity
      maxTokens: 2500,
    })
  }

  /**
   * Treatment plan generation with evidence-based reasoning
   */
  async generateTreatmentPlan(
    diagnosis: string,
    patientInfo: string,
    allergies: string[]
  ): Promise<DeepSeekResponse> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Eres un médico especialista generando un plan de tratamiento basado en evidencia.

Considera:
- Guías clínicas internacionales
- Contraindicaciones y alergias
- Interacciones medicamentosas
- Dosificación apropiada para México
- Alternativas si el medicamento de primera línea no está disponible

Proporciona razonamiento clínico detallado.`,
      },
      {
        role: 'user',
        content: `Diagnóstico: ${diagnosis}

Información del paciente:
${patientInfo}

Alergias conocidas: ${allergies.length > 0 ? allergies.join(', ') : 'Ninguna'}

Genera un plan de tratamiento completo.`,
      },
    ]

    return this.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 2000,
    })
  }

  /**
   * Clinical decision support with reasoning
   */
  async clinicalDecisionSupport(
    scenario: string,
    clinicalQuestion: string
  ): Promise<DeepSeekResponse> {
    const messages: DeepSeekMessage[] = [
      {
        role: 'system',
        content: `Eres un sistema de apoyo clínico basado en evidencia.

Proporciona:
1. Análisis del escenario clínico
2. Razonamiento paso a paso
3. Recomendaciones basadas en guías clínicas
4. Nivel de evidencia (A, B, C)
5. Consideraciones de seguridad

Tu objetivo es ayudar al médico a tomar decisiones informadas.`,
      },
      {
        role: 'user',
        content: `Escenario clínico:
${scenario}

Pregunta clínica:
${clinicalQuestion}`,
      },
    ]

    return this.chatCompletion(messages, {
      temperature: 0.2, // More deterministic for clinical decisions
      maxTokens: 2000,
    })
  }

  /**
   * Estimate cost before making request
   */
  estimateCost(estimatedPromptTokens: number, estimatedCompletionTokens: number): number {
    return (
      (estimatedPromptTokens / 1_000_000) * PRICING.input +
      (estimatedCompletionTokens / 1_000_000) * PRICING.output
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
let deepseekClient: DeepSeekClient | null = null

export function getDeepSeekClient(): DeepSeekClient {
  if (!deepseekClient) {
    deepseekClient = new DeepSeekClient()
  }
  return deepseekClient
}

export const deepseek = getDeepSeekClient()

