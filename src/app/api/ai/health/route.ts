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
  const [glmCodingAir, glmCodingReasoning, glmStandard, kimi, openai] = await Promise.allSettled([
    testProvider('glm-coding-air', AI_CONFIG.glm.apiKey, AI_CONFIG.glm.baseURL, AI_CONFIG.glm.models.chat),
    testProvider('glm-coding-5', AI_CONFIG.glm.apiKey, AI_CONFIG.glm.baseURL, AI_CONFIG.glm.models.reasoning),
    // Test standard BigModel endpoint connectivity (different routing than coding paas)
    testProvider('glm-bigmodel-std', AI_CONFIG.glm.apiKey, 'https://open.bigmodel.cn/api/paas/v4/', 'glm-4-plus'),
    testProvider('kimi', AI_CONFIG.kimi.apiKey, AI_CONFIG.kimi.baseURL, 'kimi-for-coding'),
    testProvider('openai', AI_CONFIG.openai.apiKey, undefined, 'gpt-4o-mini'),
  ])

  return NextResponse.json({
    'glm-coding-air': glmCodingAir.status === 'fulfilled' ? glmCodingAir.value : { ok: false, error: String(glmCodingAir.reason) },
    'glm-coding-5': glmCodingReasoning.status === 'fulfilled' ? glmCodingReasoning.value : { ok: false, error: String(glmCodingReasoning.reason) },
    'glm-bigmodel-std': glmStandard.status === 'fulfilled' ? glmStandard.value : { ok: false, error: String(glmStandard.reason) },
    kimi: kimi.status === 'fulfilled' ? kimi.value : { ok: false, error: String(kimi.reason) },
    openai: openai.status === 'fulfilled' ? openai.value : { ok: false, error: String(openai.reason) },
    env: {
      hasGLMKey: !!AI_CONFIG.glm.apiKey,
      hasKimiKey: !!AI_CONFIG.kimi.apiKey,
      hasOpenAIKey: !!AI_CONFIG.openai.apiKey,
    },
  })
}
