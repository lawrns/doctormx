import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { triggerReengagement, recordRetentionEvent, getDoctorChurnRisk } from '@/lib/churn'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Prohibido' }, { status: 403 })
  }

  const formData = await request.formData()
  const doctorId = formData.get('doctorId') as string
  const type = (formData.get('type') as string) || 'email'

  if (!doctorId) {
    return NextResponse.redirect(new URL('/admin/churn', request.url), 303)
  }

  if (type !== 'email' && type !== 'whatsapp') {
    return NextResponse.json({ error: 'Tipo inválido. Usar email o whatsapp' }, { status: 400 })
  }

  try {
    // Validate doctor exists and is at risk
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, status')
      .eq('id', doctorId)
      .single()

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor no encontrado' }, { status: 404 })
    }

    if (doctor.status !== 'approved') {
      return NextResponse.json({ error: 'El doctor no está aprobado' }, { status: 400 })
    }

    await triggerReengagement(doctorId, type as 'email' | 'whatsapp')

    const redirectTo = formData.get('redirectTo')
    if (redirectTo && typeof redirectTo === 'string' && redirectTo.startsWith('/')) {
      return NextResponse.redirect(new URL(redirectTo, request.url), 303)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Re-engagement error:', error)
    return NextResponse.json(
      { error: 'Error al enviar re-enganche' },
      { status: 500 }
    )
  }
}
