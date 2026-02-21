import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import {
  getAnonymousQuota,
  canAnonymousConsult,
  useAnonymousConsultation,
} from '@/lib/anonymous-quota'

/**
 * GET /api/ai/quota - Check anonymous quota
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.headers.get('x-session-id') || undefined
    const result = await canAnonymousConsult(sessionId)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    logger.error('Get quota error:', { err: error })
    return NextResponse.json(
      { error: 'Error al verificar el cupón' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai/quota - Use or check quota
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionId } = body

    if (action === 'check') {
      const result = await canAnonymousConsult(sessionId)
      return NextResponse.json({
        success: true,
        ...result,
      })
    }

    if (action === 'use') {
      const check = await canAnonymousConsult(sessionId)

      if (!check.canConsult) {
        return NextResponse.json({
          success: false,
          quota: check.quota,
          message: check.message,
        }, { status: 403 })
      }

      const quota = await useAnonymousConsultation(sessionId)

      return NextResponse.json({
        success: true,
        quota,
        message: `Consulta registrada. Te quedan ${quota.remaining} gratis.`,
      })
    }

    return NextResponse.json(
      { error: 'Acción inválida' },
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
