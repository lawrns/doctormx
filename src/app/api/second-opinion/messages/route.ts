// Second Opinion API - Messages (Patient <-> Doctor)
// GET: Get messages for a request
// POST: Send a message

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getSecondOpinionRequest,
  getSecondOpinionMessages,
  sendSecondOpinionMessage,
} from '@/lib/domains/second-opinion'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('request_id')

    if (!requestId) {
      return NextResponse.json({ error: 'request_id is required' }, { status: 400 })
    }

    const requestData = await getSecondOpinionRequest(requestId)
    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (requestData.patient_id !== user.id && requestData.assigned_doctor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const messages = await getSecondOpinionMessages(requestId)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[SecondOpinion] Messages GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { request_id, content, attachment_url } = body

    if (!request_id || !content) {
      return NextResponse.json(
        { error: 'request_id and content are required' },
        { status: 400 }
      )
    }

    const requestData = await getSecondOpinionRequest(request_id)
    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    let senderRole: 'patient' | 'doctor' = 'patient'
    if (requestData.patient_id === user.id) {
      senderRole = 'patient'
    } else if (requestData.assigned_doctor_id === user.id) {
      senderRole = 'doctor'
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const message = await sendSecondOpinionMessage(
      request_id,
      user.id,
      senderRole,
      content,
      attachment_url
    )

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('[SecondOpinion] Messages POST error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
