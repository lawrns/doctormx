import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * POST /api/anonymous/capture-email
 * Capture email from anonymous user after consultation
 */
export async function POST(request: NextRequest) {
  try {
    const { email, sessionId, consultationNumber } = await request.json()

    if (!email || typeof email !== 'string' || !isValidEmail(email.trim().toLowerCase())) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    const supabase = await createClient()

    // Check if email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', normalizedEmail)
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
        email: normalizedEmail,
        session_id: sessionId || null,
        consultation_number: consultationNumber || 1,
        captured_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      // Might be duplicate email
      console.error('Email capture error:', error)
      return NextResponse.json({
        success: true,
        message: 'Email registrado',
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Email registrado correctamente',
      data: emailCapture,
      nextStepUrl: `/auth/register?email=${encodeURIComponent(normalizedEmail)}`,
    })
  } catch (error) {
    console.error('Email capture API error:', error)
    return NextResponse.json(
      { error: 'Error al registrar email' },
      { status: 500 }
    )
  }
}
