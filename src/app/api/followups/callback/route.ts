import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { processFollowUpResponse } from '@/lib/followup'
import { verifyTwilioWebhook } from '@/lib/webhooks'
import { logger } from '@/lib/observability/logger'

export async function POST(request: NextRequest) {
  try {
    // Verify Twilio webhook signature
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN

    if (!twilioAuthToken) {
      logger.error('TWILIO_AUTH_TOKEN not configured', { provider: 'twilio' })
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const signature = request.headers.get('X-Twilio-Signature')

    if (!signature) {
      logger.warn('Followups callback received without signature', { provider: 'twilio' })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the raw body for signature verification
    const rawBody = await request.text()

    // Verify signature
    const isValidSignature = verifyTwilioWebhook(
      request.url,
      rawBody,
      signature,
      twilioAuthToken
    )

    if (!isValidSignature) {
      logger.warn('Followups callback signature verification failed', {
        provider: 'twilio',
        url: request.url,
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse the form data after successful verification
    const formData = new FormData()
    const params = new URLSearchParams(rawBody)
    for (const [key, value] of params.entries()) {
      formData.append(key, value)
    }
    const phoneNumber = formData.get('From') as string
    const messageBody = formData.get('Body') as string

    if (!phoneNumber || !messageBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    const cleanPhone = phoneNumber.replace('whatsapp:', '').replace('+', '')

    const { data: followUp } = await supabase
      .from('followups')
      .select('id, status')
      .eq('patient_id', cleanPhone)
      .eq('status', 'sent')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!followUp) {
      const response = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Gracias por tu mensaje. No tenemos un seguimiento activo en este momento. Si necesitas ayuda, visita https://doctory.mx o agenda una nueva consulta.</Message>
</Response>`

      return new NextResponse(response, {
        headers: { 'Content-Type': 'application/xml' },
      })
    }

    const { message } = await processFollowUpResponse(
      followUp.id,
      messageBody
    )

    const response = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`

    return new NextResponse(response, {
      headers: { 'Content-Type': 'application/xml' },
    })
  } catch (error) {
    logger.error('Error processing follow-up callback', {
      provider: 'twilio',
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Lo sentimos, hubo un error procesando tu respuesta. Por favor intenta de nuevo o contacta soporte.</Message>
</Response>`

    return new NextResponse(errorResponse, {
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
