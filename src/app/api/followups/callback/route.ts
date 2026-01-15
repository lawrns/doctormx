import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { processFollowUpResponse } from '@/lib/followup'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
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
    console.error('Error processing follow-up callback:', error)

    const errorResponse = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Lo sentimos, hubo un error procesando tu respuesta. Por favor intenta de nuevo o contacta soporte.</Message>
</Response>`

    return new NextResponse(errorResponse, {
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
