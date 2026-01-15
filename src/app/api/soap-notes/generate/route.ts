// SOAP Notes Generation API
// POST: Generate SOAP note from transcript

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { generateSoapNote, SOAP_NOTES_CONFIG } from '@/lib/domains/soap-notes'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check feature flag
    const enabled = await isFeatureEnabled('ai_soap_notes_enabled', { userId: user.id })
    if (!enabled) {
      return NextResponse.json(
        { error: 'AI SOAP notes is not available for your subscription' },
        { status: 403 }
      )
    }
    
    // Verify user is a doctor
    const { data: doctor } = await supabase
      .from('doctors')
      .select('user_id, subscription_tier')
      .eq('user_id', user.id)
      .single()
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'Only doctors can generate SOAP notes' },
        { status: 403 }
      )
    }
    
    // Parse body
    const body = await request.json()
    const { transcript, patient_context, consultation_id, appointment_id } = body
    
    // Validate
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'transcript is required' },
        { status: 400 }
      )
    }
    
    if (transcript.length > SOAP_NOTES_CONFIG.MAX_TRANSCRIPT_LENGTH) {
      return NextResponse.json(
        { error: `Transcript exceeds maximum length of ${SOAP_NOTES_CONFIG.MAX_TRANSCRIPT_LENGTH} characters` },
        { status: 400 }
      )
    }
    
    // Generate SOAP note
    const result = await generateSoapNote({
      doctor_id: user.id,
      transcript,
      patient_context,
      consultation_id,
      appointment_id,
    })
    
    return NextResponse.json({
      id: result.id,
      status: result.status,
      message: 'SOAP note generated. Please review and approve.',
    }, { status: 201 })
    
  } catch (error) {
    console.error('[SOAPNotes] Generate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate SOAP note' },
      { status: 500 }
    )
  }
}
