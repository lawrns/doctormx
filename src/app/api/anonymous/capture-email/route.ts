import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

/**
 * POST /api/anonymous/capture-email
 * Capture email from anonymous user after consultation
 */
export async function POST(request: NextRequest) {
  try {
    const { email, sessionId, consultationNumber } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single()

    if (existingProfile) {
      // User already has an account
      return NextResponse.json({
        success: true,
        exists: true,
        message: 'Ya tienes una cuenta con este email',
        userId: existingProfile.id,
      })
    }

    // Store anonymous email capture
    const { data: emailCapture, error } = await supabase
      .from('anonymous_email_captures')
      .insert({
        email: email.toLowerCase(),
        session_id: sessionId || null,
        consultation_number: consultationNumber || 1,
        captured_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Might be duplicate email
      logger.error('Email capture error:', { err: error })
      return NextResponse.json({
        success: true,
        message: 'Email registrado',
      })
    }

    // FUTURE_ENHANCEMENT: Send welcome email with magic link to create account
    // await sendWelcomeEmail(email)

    return NextResponse.json({
      success: true,
      message: 'Email registrado correctamente',
      data: emailCapture,
    })
  } catch (error) {
    logger.error('Email capture API error:', { err: error })
    return NextResponse.json(
      { error: 'Error al registrar email' },
      { status: 500 }
    )
  }
}
