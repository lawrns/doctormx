import { NextResponse } from 'next/server'
import { AI_CONFIG } from '@/lib/ai/config'

async function testProvider(name: string, apiKey: string, baseURL: string | undefined, model: string) {
  const start = Date.now()
  try {
    const { default: OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}), timeout: 14000, maxRetries: 0 })
    const resp = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Say "ok" and nothing else.' }],
      max_tokens: 2000,
    })
    const msg = resp.choices[0]?.message
    const content = msg?.content || (msg as { reasoning_content?: string })?.reasoning_content || ''
    return { ok: true, latencyMs: Date.now() - start, tokens: resp.usage?.total_tokens, preview: content.slice(0, 80) }
  } catch (e: unknown) {
    const err = e as { status?: number; message?: string; code?: string }
    return { ok: false, latencyMs: Date.now() - start, status: err.status, error: err.message?.slice(0, 120), code: err.code }
  }
}

export async function GET() {
  const [glm, kimi, openai] = await Promise.allSettled([
    testProvider('glm', AI_CONFIG.glm.apiKey, AI_CONFIG.glm.baseURL, 'glm-5'),
    testProvider('kimi', AI_CONFIG.kimi.apiKey, AI_CONFIG.kimi.baseURL, 'kimi-for-coding'),
    testProvider('openai', AI_CONFIG.openai.apiKey, undefined, 'gpt-4o-mini'),
  ])

  return NextResponse.json({
    glm: glm.status === 'fulfilled' ? glm.value : { ok: false, error: String(glm.reason) },
    kimi: kimi.status === 'fulfilled' ? kimi.value : { ok: false, error: String(kimi.reason) },
    openai: openai.status === 'fulfilled' ? openai.value : { ok: false, error: String(openai.reason) },
    env: {
      hasGLMKey: !!AI_CONFIG.glm.apiKey,
      hasKimiKey: !!AI_CONFIG.kimi.apiKey,
      hasOpenAIKey: !!AI_CONFIG.openai.apiKey,
    },
  })
}
