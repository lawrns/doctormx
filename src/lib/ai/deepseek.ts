/**
 * DeepSeek R1 Client
 * Superior medical reasoning at 1/10th the cost of GPT-4
 * Cost: $0.14 per 1M input tokens, $0.28 per 1M output tokens
 * 
 * @module lib/ai/deepseek
 * @example
 * ```typescript
 * import { deepseek, getDeepSeekClient } from '@/lib/ai/deepseek';
 * 
 * const response = await deepseek.chatCompletion([
 *   { role: 'user', content: 'Explain diabetes' }
 * ]);
 * 
 * console.log(response.content, response.reasoning);
 * ```
 */

import { logger } from '@/lib/observability/logger'

/**
 * DeepSeek message format
 */
export interface DeepSeekMessage {
  /** Message role: 'system', 'user', or 'assistant' */
  role: 'system' | 'user' | 'assistant'
  /** Message content */
  content: string
}

/**
 * Options for DeepSeek API calls
 */
export interface DeepSeekOptions {
  /** Temperature for response randomness (default: 0.3) */
  temperature?: number
  /** Maximum tokens in response (default: 2000) */
  maxTokens?: number
  /** Top-p sampling parameter (default: 0.95) */
  topP?: number
  /** Frequency penalty (default: 0) */
  frequencyPenalty?: number
  /** Presence penalty (default: 0) */
  presencePenalty?: number
}

/**
 * Response from DeepSeek API
 */
export interface DeepSeekResponse {
  /** Generated content */
  content: string
  /** Token usage statistics */
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  /** Cost in USD */
  costUSD: number
  /** Reasoning content (if available) */
  reasoning?: string
}

// Pricing (as of Jan 2026)
const PRICING = {
  input: 0.14,  // per 1M tokens
  output: 0.28, // per 1M tokens
}

/**
 * DeepSeek client class
 * Handles communication with DeepSeek API for medical reasoning tasks
 */
class DeepSeekClient {
  private apiKey: string
  private baseURL = 'https://api.deepseek.com/v1'

  /**
   * Creates a new DeepSeek client instance
   * Reads API key from DEEPSEEK_API_KEY environment variable
   */
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY ?? ''

    if (!this.apiKey) {
      logger.warn('[DEEPSEEK] API key not configured')
    }
  }

  /**
   * Chat completion with DeepSeek R1
   * Optimized for complex medical reasoning
   * @param messages - Array of messages for the conversation
   * @param options - API call options (optional)
   * @param options.temperature - Temperature for randomness (default: 0.3)
   * @param options.maxTokens - Maximum tokens (default: 2000)
   * @param options.topP - Top-p sampling (default: 0.95)
   * @returns Promise with response content, usage, cost, and reasoning
   * @throws {Error} If API call fails
   * @example
   * const response = await deepseek.chatCompletion([
   *   { role: 'system', content: 'You are a medical AI' },
   *   { role: 'user', content: 'Explain type 2 diabetes' }
   * ], {
   *   temperature: 0.3,
   *   maxTokens: 2000
   * });
   * console.log(response.content, response.costUSD);
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

      const content = data.choices?.[0]?.message?.content ?? ''
      const reasoning = data.choices?.[0]?.message?.reasoning_content || undefined

      const usage = {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
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
   * @param symptoms - Array of patient symptoms
   * @param patientContext - Additional patient context information
   * @param systemPrompt - System prompt for the AI
   * @returns Promise with differential diagnosis response
   * @throws {Error} If API call fails
   * @example
   * const result = await deepseek.medicalReasoning(
   *   ['fever', 'cough', 'fatigue'],
   *   'Patient is 45 years old, non-smoker',
   *   'You are an experienced diagnostic physician'
   * );
   * console.log(result.content);
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
   * @param diagnosis - Confirmed or suspected diagnosis
   * @param patientInfo - Patient information (age, weight, etc.)
   * @param allergies - Array of known allergies
   * @returns Promise with treatment plan response
   * @throws {Error} If API call fails
   * @example
   * const result = await deepseek.generateTreatmentPlan(
   *   'Type 2 Diabetes Mellitus',
   *   '45 years old, 80kg, no other conditions',
   *   ['sulfa drugs']
   * );
   * console.log(result.content);
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
   * @param scenario - Clinical scenario description
   * @param clinicalQuestion - Specific clinical question
   * @returns Promise with clinical decision support response
   * @throws {Error} If API call fails
   * @example
   * const result = await deepseek.clinicalDecisionSupport(
   *   '65yo male with chest pain, normal ECG, troponin pending',
   *   'Should I admit this patient?'
   * );
   * console.log(result.content, result.reasoning);
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
   * @param estimatedPromptTokens - Estimated input tokens
   * @param estimatedCompletionTokens - Estimated output tokens
   * @returns Estimated cost in USD
   * @example
   * const cost = deepseek.estimateCost(1000, 500);
   * console.log(`Estimated cost: $${cost.toFixed(4)}`);
   */
  estimateCost(estimatedPromptTokens: number, estimatedCompletionTokens: number): number {
    return (
      (estimatedPromptTokens / 1_000_000) * PRICING.input +
      (estimatedCompletionTokens / 1_000_000) * PRICING.output
    )
  }

  /**
   * Check if API key is configured
   * @returns Boolean indicating if DeepSeek is configured
   * @example
   * if (deepseek.isConfigured()) {
   *   // Use DeepSeek
   * }
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

// Singleton instance
let deepseekClient: DeepSeekClient | null = null

/**
 * Get or create the DeepSeek client singleton
 * @returns DeepSeekClient singleton instance
 * @example
 * const client = getDeepSeekClient();
 * const response = await client.chatCompletion(messages);
 */
export function getDeepSeekClient(): DeepSeekClient {
  if (!deepseekClient) {
    deepseekClient = new DeepSeekClient()
  }
  return deepseekClient
}

/** DeepSeek client singleton instance */
export const deepseek = getDeepSeekClient()
