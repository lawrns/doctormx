import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackAiCopilotUsage } from '@/lib/subscription'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const body = await request.json()
        const { increment = 1 } = body

        const result = await trackAiCopilotUsage(user.id, increment)

        return NextResponse.json({
            used: result.used,
            limit: result.limit,
            remaining: result.remaining,
            isExceeded: result.isExceeded,
        })
    } catch (error) {
        logger.error('Error tracking AI usage:', { err: error })
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to track usage' },
            { status: 500 }
        )
    }
}
