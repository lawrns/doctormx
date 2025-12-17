import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verificar que el usuario es admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const doctorId = formData.get('doctorId') as string
  const action = formData.get('action') as string
  const reason = formData.get('reason') as string | null

  if (!doctorId || !action) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    if (action === 'approve') {
      await supabase
        .from('doctors')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', doctorId)
    } else if (action === 'reject') {
      await supabase
        .from('doctors')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', doctorId)
    }

    return NextResponse.redirect(new URL('/admin/verify', request.url))
  } catch (error) {
    console.error('Error verifying doctor:', error)
    return NextResponse.json(
      { error: 'Failed to verify doctor' },
      { status: 500 }
    )
  }
}
