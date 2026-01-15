/**
 * OpenAI Client Wrapper
 * Provides a singleton OpenAI client for use across the application
 */

import OpenAI from 'openai'

// Create singleton OpenAI client
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
})

export default openai
