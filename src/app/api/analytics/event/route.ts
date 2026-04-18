import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics/posthog'

const analyticsEventSchema = z.object({
  event: z.string().min(1),
  distinctId: z.string().optional(),
  userId: z.string().optional(),
  anonymousId: z.string().optional(),
  pathname: z.string().optional(),
  url: z.string().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = analyticsEventSchema.safeParse(await request.json())

    if (!body.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid analytics event payload',
          details: body.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    let authenticatedUserId: string | undefined

    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      authenticatedUserId = data.user?.id
    } catch {
      // Analytics should stay best-effort if auth cookies are missing.
    }

    const payload = body.data
    const distinctId =
      payload.distinctId ||
      authenticatedUserId ||
      payload.userId ||
      payload.anonymousId ||
      crypto.randomUUID()

    const capture = await trackServerEvent({
      event: payload.event,
      distinctId,
      userId: authenticatedUserId || payload.userId,
      anonymousId: payload.anonymousId,
      pathname: payload.pathname,
      url: payload.url,
      properties: {
        ...(payload.properties || {}),
        source: 'client-analytics-route',
      },
    })

    return NextResponse.json({
      success: true,
      sent: capture.sent,
      reason: capture.reason,
    })
  } catch (error) {
    console.error('[Analytics] Failed to capture event:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to capture analytics event',
      },
      { status: 202 }
    )
  }
}
