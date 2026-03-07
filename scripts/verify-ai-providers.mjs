import OpenAI from 'openai'
import process from 'process'
import fs from 'fs'
import path from 'path'

const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const index = line.indexOf('=')
    if (index === -1) continue
    const key = line.slice(0, index).trim()
    const value = line.slice(index + 1)
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
}

async function testProvider({ name, apiKey, baseURL, model, messages }) {
  if (!apiKey) {
    return { name, ok: false, error: 'Missing API key' }
  }

  const client = new OpenAI({ apiKey, ...(baseURL ? { baseURL } : {}) })

  const start = Date.now()
  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 64,
      temperature: 0,
    })

    const content = response.choices?.[0]?.message?.content
      || response.choices?.[0]?.message?.reasoning_content
      || ''

    return {
      name,
      ok: true,
      model: response.model || model,
      latencyMs: Date.now() - start,
      usage: response.usage || null,
      preview: String(content).slice(0, 120),
    }
  } catch (error) {
    return {
      name,
      ok: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

const glmMessages = [
  { role: 'system', content: 'You are a concise health intake assistant.' },
  { role: 'user', content: 'Reply with exactly: GLM_OK' },
]

const kimiMessages = [
  { role: 'system', content: 'You are a concise assistant.' },
  { role: 'user', content: 'Reply with exactly: KIMI_OK' },
]

const results = await Promise.all([
  testProvider({
    name: 'glm',
    apiKey: process.env.GLM_API_KEY,
    baseURL: 'https://api.z.ai/api/coding/paas/v4/',
    model: process.env.GLM_TEST_MODEL || 'glm-5',
    messages: glmMessages,
  }),
  testProvider({
    name: 'kimi',
    apiKey: process.env.KIMI_API_KEY,
    baseURL: process.env.KIMI_BASE_URL || 'https://api.kimi.com/coding/v1',
    model: process.env.KIMI_TEST_MODEL || process.env.KIMI_CHAT_MODEL || 'kimi-for-coding',
    messages: kimiMessages,
  }),
])

console.log(JSON.stringify(results, null, 2))

const hasFailure = results.some(result => !result.ok)
process.exit(hasFailure ? 1 : 0)
