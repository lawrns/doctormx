import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUsageStats } from '@/lib/subscription'
import { logger } from '@/lib/observability/logger'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        )
    }

    try {
        const usageStats = await getUsageStats(user.id)

        if (!usageStats) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            ...usageStats,
        })
    } catch (error) {
        logger.error('Error fetching usage stats:', { err: error })
        return NextResponse.json(
            { error: 'Failed to fetch usage stats' },
            { status: 500 }
        )
    }
}
