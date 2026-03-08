/**
 * Ollama Proxy Client for Doctor.mx
 *
 * Self-hosted fallback AI provider via ngrok tunnel.
 * Uses Ollama-native API (NOT OpenAI-compatible).
 *
 * Required env vars:
 *   OLLAMA_PROXY_URL  — ngrok tunnel base URL
 *   OLLAMA_PROXY_KEY  — Bearer token for the auth proxy
 *
 * API format:
 *   POST /api/chat   — chat completions
 *   POST /api/generate — text generation
 *
 * Models:
 *   qwen3.5:latest   — 9.7B general-purpose (default)
 *   kimi-k2.5:cloud  — cloud-hosted, high quality for complex reasoning
 */

import { AI_CONFIG } from './config'

interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaChatRequest {
  model: string
  messages: OllamaMessage[]
  stream: false
}

interface OllamaChatResponse {
  model: string
  message: {
    role: 'assistant'
    content: string
  }
  done: boolean
  prompt_eval_count?: number
  eval_count?: number
}

export interface OllamaCompletionResult {
  content: string
  model: string
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
  provider: 'ollama'
}

function isOllamaConfigured(): boolean {
  return !!(AI_CONFIG.ollama.proxyUrl && AI_CONFIG.ollama.proxyKey)
}

/**
 * Low-level fetch call to the Ollama proxy /api/chat endpoint.
 * Uses `stream: false` to get a single JSON response.
 */
async function ollamaFetch(
  messages: OllamaMessage[],
  model: string,
  timeoutMs: number
): Promise<OllamaChatResponse> {
  const url = `${AI_CONFIG.ollama.proxyUrl}/api/chat`

  const body: OllamaChatRequest = { model, messages, stream: false }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.ollama.proxyKey}`,
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Ollama proxy error ${response.status}: ${text.slice(0, 200)}`)
    }

    return (await response.json()) as OllamaChatResponse
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Chat completion via Ollama proxy.
 * Defaults to qwen3.5:latest; pass `useReasoning: true` for kimi-k2.5:cloud.
 */
export async function ollamaChatCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  useReasoning?: boolean
  longForm?: boolean
}): Promise<OllamaCompletionResult> {
  if (!isOllamaConfigured()) {
    throw new Error('Ollama proxy not configured — set OLLAMA_PROXY_URL and OLLAMA_PROXY_KEY')
  }

  const model = params.useReasoning
    ? AI_CONFIG.ollama.models.reasoning
    : AI_CONFIG.ollama.models.default

  const timeoutMs = params.longForm
    ? AI_CONFIG.ollama.longTimeoutMs
    : AI_CONFIG.ollama.timeoutMs

  console.log(`[Ollama] Intentando con model=${model} timeout=${timeoutMs}ms...`)

  const data = await ollamaFetch(params.messages, model, timeoutMs)

  const content = data.message?.content || ''
  const inputTokens = data.prompt_eval_count || 0
  const outputTokens = data.eval_count || 0

  console.log(`[Ollama] Éxito con model=${model} (in=${inputTokens} out=${outputTokens} tokens)`)

  return {
    content,
    model,
    usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
    provider: 'ollama',
  }
}

/**
 * Health check — verifies the Ollama proxy is reachable.
 */
export async function testOllamaProxy(): Promise<{
  ok: boolean
  latencyMs: number
  model?: string
  error?: string
}> {
  if (!isOllamaConfigured()) {
    return { ok: false, latencyMs: 0, error: 'Not configured' }
  }

  const start = Date.now()
  try {
    const result = await ollamaChatCompletion({
      messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
    })
    return { ok: true, latencyMs: Date.now() - start, model: result.model }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, latencyMs: Date.now() - start, error: msg.slice(0, 120) }
  }
}

export { isOllamaConfigured }
