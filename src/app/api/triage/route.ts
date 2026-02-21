import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { evaluateRedFlags, getCareLevelInfo, isMentalHealthCrisis, getMentalHealthResources, type TriageResult } from '@/lib/triage'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, intake, sessionId } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Evaluate red flags
    const triageResult = evaluateRedFlags({ message, intake })

    // Check for mental health crisis specifically
    const mentalHealthCrisis = isMentalHealthCrisis(message)
    if (mentalHealthCrisis) {
      triageResult.recommendations = [
        ...getMentalHealthResources(),
        ...triageResult.recommendations
      ]
    }

    // Get care level info if triggered
    const careLevelInfo = triageResult.action 
      ? getCareLevelInfo(triageResult.action)
      : null

    // Log triage result to database (async, don't block response)
    logTriageResult(message, intake, triageResult, sessionId).then(null, (err) => logger.error("Async error", { err }))

    return NextResponse.json({
      success: true,
      triage: {
        ...triageResult,
        careLevelInfo,
        mentalHealthCrisis
      }
    })
  } catch (error) {
    logger.error('Triage API error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to evaluate symptoms' },
      { status: 500 }
    )
  }
}

async function logTriageResult(
  message: string,
  intake: Record<string, unknown> | null,
  triageResult: TriageResult,
  sessionId?: string
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('triage_logs').insert({
      user_id: user?.id || null,
      session_id: sessionId || null,
      message,
      symptoms: intake?.symptoms || null,
      intake_data: intake || null,
      triage_result: triageResult,
      care_level: triageResult.action || 'NONE',
      triggered_rules: triageResult.ruleIds,
      reasons: triageResult.reasons
    })
  } catch (error) {
    logger.error('Failed to log triage result:', { err: error })
  }
}
