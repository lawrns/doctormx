import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkQuota, useQuestion } from '@/lib/free-questions'
import { logger } from '@/lib/observability/logger'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const quotaCheck = await checkQuota(user.id)

    return NextResponse.json({
      success: true,
      quota: quotaCheck,
    })
  } catch (error) {
    logger.error('Get quota error:', { err: error })
    return NextResponse.json(
      { error: 'Error al obtener el límite de preguntas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'use') {
      // Use a question from quota
      const result = await useQuestion(user.id)
      
      if (!result.success) {
        return NextResponse.json({
          success: false,
          quota: result.quota,
          message: result.quota.message,
        }, { status: 403 })
      }

      return NextResponse.json({
        success: true,
        quota: result.quota,
        message: 'Pregunta registrada',
      })
    }

    if (action === 'check') {
      const quotaCheck = await checkQuota(user.id)
      return NextResponse.json({
        success: true,
        quota: quotaCheck,
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Quota action error:', { err: error })
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
