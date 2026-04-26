import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    const supabase = await createServiceClient()
    await supabase.from('contact_messages').insert({
      name,
      email,
      subject,
      message,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Error al enviar el mensaje' }, { status: 500 })
  }
}
