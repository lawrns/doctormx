// Second Opinion API - Submit Request for Review
// POST: Submit request after payment

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getSecondOpinionRequest, 
  submitSecondOpinionRequest 
} from '@/lib/domains/second-opinion'
import { stripe } from '@/lib/stripe'
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
    
    // Get current request
    const current = await getSecondOpinionRequest(id)
    
    if (!current) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    
    // Only patient can submit
    if (current.patient_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Must be in draft status
    if (current.status !== 'draft') {
      return NextResponse.json(
        { error: 'Request has already been submitted' },
        { status: 400 }
      )
    }
    
    // Validate chief complaint
    if (!current.chief_complaint || current.chief_complaint.length < 10) {
      return NextResponse.json(
        { error: 'Chief complaint is required before submission' },
        { status: 400 }
      )
    }
    
    // Parse payment info
    const body = await request.json()
    const { payment_id } = body
    
    if (!payment_id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }
    
    // Verify payment with Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(payment_id)
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment not confirmed. Please complete payment first.' },
          { status: 402 }
        )
      }
    } catch (stripeError) {
      logger.error('Stripe payment verification failed:', { error: stripeError, payment_id })
      return NextResponse.json(
        { error: 'Invalid payment ID or payment verification failed' },
        { status: 402 }
      )
    }
    
    // Submit request
    await submitSecondOpinionRequest(id, payment_id)
    
    // Get updated request
    const updated = await getSecondOpinionRequest(id)
    
    return NextResponse.json({
      message: 'Request submitted successfully',
      request: updated,
    })
    
  } catch (error) {
    logger.error('[SecondOpinion] Submit error:', { error })
    return NextResponse.json(
      { error: 'Failed to submit second opinion request' },
      { status: 500 }
    )
  }
}
