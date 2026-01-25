/**
 * AI Client Wrapper
 * Provides singleton clients for GLM (primary) and OpenAI (fallback)
 *
 * GLM z.ai is the primary provider for Doctor.mx
 * OpenAI is maintained for Whisper transcription and as a fallback
 */

import OpenAI from 'openai'
import { AI_CONFIG, getActiveProvider } from './ai/config'

// GLM Client - Primary provider
// Uses OpenAI SDK with custom baseURL (z.ai is OpenAI-compatible)
export const glm = new OpenAI({
    apiKey: process.env.GLM_API_KEY || AI_CONFIG.glm.apiKey,
    baseURL: AI_CONFIG.glm.baseURL,
})

// OpenAI Client - Fallback provider and Whisper transcription
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || AI_CONFIG.openai.apiKey,
})

/**
 * Get the appropriate AI client based on configuration
 * Returns GLM if configured, otherwise OpenAI
 */
export function getAIClient(): OpenAI {
    const provider = getActiveProvider()
    if (provider === 'glm') {
        return glm
    }
    return openai
}

/**
 * Get the default model for the active provider
 */
export function getDefaultModel(): string {
    const provider = getActiveProvider()
    if (provider === 'glm') {
        return AI_CONFIG.glm.defaultModel
    }
    return AI_CONFIG.openai.model
}

// Export default as the primary client (GLM if configured)
export default getAIClient()
