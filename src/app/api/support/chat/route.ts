import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { aiChatCompletion } from '@/lib/ai/openai'
import { getSupportPageContext } from '@/lib/support/page-context'
import { buildSupportSystemPrompt, buildSupportUserPrompt } from '@/lib/support/prompts'
import type { SupportAudience, SupportChatResponse, SupportMessage } from '@/lib/support/types'

const supportChatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  pathname: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(4000),
  })).max(10).optional(),
})

async function getAudience(): Promise<SupportAudience> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return 'visitor'
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role === 'patient' || profile?.role === 'doctor' || profile?.role === 'admin') {
    return profile.role
  }

  return 'visitor'
}

function normalizeHistory(history: SupportMessage[] | undefined): SupportMessage[] {
  return (history || []).filter((entry) => entry.content.trim().length > 0).slice(-8)
}

function safeJsonParse(content: string): Partial<SupportChatResponse> | null {
  try {
    return JSON.parse(content) as Partial<SupportChatResponse>
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const body = await request.json()
    const parsed = supportChatRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const audience = await getAudience()
    const history = normalizeHistory(parsed.data.history)
    const context = getSupportPageContext(parsed.data.pathname, audience)
    const systemPrompt = buildSupportSystemPrompt(context)
    const userPrompt = buildSupportUserPrompt({
      message: parsed.data.message,
      context,
      history,
    })

    const response = await aiChatCompletion({
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
      temperature: 0.3,
      maxTokens: 900,
      jsonMode: true,
      preferOpenAI: false,
    })

    const parsedResponse = safeJsonParse(response.content)
    const responseLinks = parsedResponse?.links
    const normalizedLinks = Array.isArray(responseLinks)
      ? responseLinks
          .filter((item): item is { label: string; href: string } => Boolean(item && typeof item.label === 'string' && typeof item.href === 'string'))
          .slice(0, 4)
      : context.suggestedLinks.slice(0, 3)

    const payload: SupportChatResponse = {
      message: parsedResponse?.message?.trim() || 'Puedo ayudarte a entender esta parte de Doctor.mx y sugerirte el siguiente paso útil.',
      suggestions: Array.isArray(parsedResponse?.suggestions)
        ? parsedResponse?.suggestions.filter((item): item is string => typeof item === 'string').slice(0, 4)
        : context.knownActions.slice(0, 3),
      links: normalizedLinks,
      escalate: Boolean(parsedResponse?.escalate),
      meta: {
        provider: response.provider,
        model: response.model,
        latencyMs: Date.now() - startedAt,
        costUSD: response.costUSD,
      },
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('[Support Chat] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'No pude responder en este momento. Intenta de nuevo en unos segundos.',
      },
      { status: 500 }
    )
  }
}
