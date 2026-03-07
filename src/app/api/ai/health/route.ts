import { NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai/config'

async function testProvider(name: string, apiKey: string, baseURL: string | undefined, model: string, extraHeaders?: Record<string, string>) {
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

export async function GET() {
  const [openrouter, openai] = await Promise.allSettled([
    testProvider(
      'openrouter-kimi-k2',
      AI_CONFIG.openrouter.apiKey,
      AI_CONFIG.openrouter.baseURL,
      AI_CONFIG.openrouter.model,
      {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://doctormx.com',
        'X-Title': 'Doctor.mx Telemedicine',
      }
    ),
    testProvider('openai-whisper-key', AI_CONFIG.openai.apiKey, undefined, 'gpt-4o-mini'),
  ])

  return NextResponse.json({
    'openrouter-kimi-k2': openrouter.status === 'fulfilled' ? openrouter.value : { ok: false, error: String(openrouter.reason) },
    'openai-whisper-key': openai.status === 'fulfilled' ? openai.value : { ok: false, error: String(openai.reason) },
    env: {
      hasOpenRouterKey: !!AI_CONFIG.openrouter.apiKey,
      hasOpenAIKey: !!AI_CONFIG.openai.apiKey,
      activeModel: AI_CONFIG.openrouter.model,
    },
  })
}
