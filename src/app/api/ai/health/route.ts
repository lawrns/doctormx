import { NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai/config'

async function testOpenAICompatible(name: string, apiKey: string, baseURL: string | undefined, model: string, extraHeaders?: Record<string, string>) {
  const start = Date.now()
  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({
      apiKey,
      ...(baseURL ? { baseURL } : {}),
      timeout: 14000,
      maxRetries: 0,
      defaultHeaders: extraHeaders,
    })
    const resp = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
      max_tokens: 50,
    })
    const content = resp.choices[0]?.message?.content || ''
    return { ok: true, latencyMs: Date.now() - start, tokens: resp.usage?.total_tokens, preview: content.slice(0, 80) }
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string; code?: string }
    return { ok: false, latencyMs: Date.now() - start, status: err.status, error: err.message?.slice(0, 120), code: err.code }
  }
}

async function testOllamaProxy() {
  const start = Date.now()
  if (!AI_CONFIG.ollama.proxyUrl || !AI_CONFIG.ollama.proxyKey) {
    return { ok: false, latencyMs: 0, error: 'Not configured' }
  }
  try {
    const { testOllamaProxy: doTest } = await import('@/lib/ai/ollama')
    return await doTest()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, latencyMs: Date.now() - start, error: msg.slice(0, 120) }
  }
}

export async function GET() {
  const [openrouter, openai, ollama] = await Promise.allSettled([
    testOpenAICompatible(
      'openrouter-kimi-k2',
      AI_CONFIG.openrouter.apiKey,
      AI_CONFIG.openrouter.baseURL,
      AI_CONFIG.openrouter.model,
      {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://doctormx.com',
        'X-Title': 'Doctor.mx Telemedicine',
      }
    ),
    testOpenAICompatible('openai-whisper-key', AI_CONFIG.openai.apiKey, undefined, 'gpt-4o-mini'),
    testOllamaProxy(),
  ])

  return NextResponse.json({
    'openrouter-kimi-k2': openrouter.status === 'fulfilled' ? openrouter.value : { ok: false, error: String(openrouter.reason) },
    'openai-whisper-key': openai.status === 'fulfilled' ? openai.value : { ok: false, error: String(openai.reason) },
    'ollama-proxy': ollama.status === 'fulfilled' ? ollama.value : { ok: false, error: String(ollama.reason) },
    env: {
      hasOpenRouterKey: !!AI_CONFIG.openrouter.apiKey,
      hasOpenAIKey: !!AI_CONFIG.openai.apiKey,
      hasOllamaProxy: !!(AI_CONFIG.ollama.proxyUrl && AI_CONFIG.ollama.proxyKey),
      activeModel: AI_CONFIG.openrouter.model,
      ollamaDefaultModel: AI_CONFIG.ollama.models.default,
    },
  })
}
