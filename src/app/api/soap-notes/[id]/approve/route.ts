// SOAP Notes Approval API
// POST: Approve SOAP note with optional edits

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { approveSoapNote, getSoapNote } from '@/lib/domains/soap-notes'
import { logger } from '@/lib/observability/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get note
    const note = await getSoapNote(id)
    if (!note) {
      return NextResponse.json({ error: 'SOAP note not found' }, { status: 404 })
    }
    
    // Check ownership
    if (note.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Check status
    if (note.status !== 'pending_review') {
      return NextResponse.json(
        { error: 'SOAP note is not pending review' },
        { status: 400 }
      )
    }
    
    // Parse body for edits
    const body = await request.json().catch(() => ({}))
    const { edits } = body
    
    // Approve with optional edits
    await approveSoapNote(id, user.id, edits)
    
    return NextResponse.json({
      id,
      status: 'approved',
      message: 'SOAP note approved successfully',
    })
    
  } catch (error) {
    logger.error('[SOAPNotes] Approve error:', { err: error })
    return NextResponse.json(
      { error: 'Failed to approve SOAP note' },
      { status: 500 }
    )
  }
}
