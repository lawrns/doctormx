/**
 * AI Client Wrapper
 * Primary: OpenRouter (Kimi K2.5)
 * Fallback: OpenAI (Whisper transcription)
 */

import OpenAI from 'openai'
import { AI_CONFIG } from './ai/config'

// OpenRouter Client — primary LLM provider
export const glm = new OpenAI({
    apiKey: AI_CONFIG.openrouter.apiKey,
    baseURL: AI_CONFIG.openrouter.baseURL,
    defaultHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://doctormx.com',
        'X-Title': 'Doctor.mx Telemedicine',
    },
})

// OpenAI Client — Whisper transcription only
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || AI_CONFIG.openai.apiKey,
})

/**
 * Get the appropriate AI client — always OpenRouter
 */
export function getAIClient(): OpenAI {
    return glm
}

/**
 * Get the default model for the active provider
 */
export function getDefaultModel(): string {
    return AI_CONFIG.openrouter.model
}

// Export default as the primary client (OpenRouter)
export default getAIClient()
