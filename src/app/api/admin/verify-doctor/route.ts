import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { HTTP_STATUS } from '@/lib/constants'
import { validateCSRFToken, getCSRFCookie, createCSRFErrorResponse } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: HTTP_STATUS.UNAUTHORIZED })
  }
  
  // Validate CSRF token (after authentication)
  const csrfToken = getCSRFCookie(request)
  const csrfResult = validateCSRFToken(request, csrfToken || '', true)
  if (typeof csrfResult === 'object' && !csrfResult.valid) {
    return createCSRFErrorResponse(csrfResult)
  }

  // Verificar que el usuario es admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: HTTP_STATUS.FORBIDDEN })
  }

  const formData = await request.formData()
  const doctorId = formData.get('doctorId') as string
  const action = formData.get('action') as string

  if (!doctorId || !action) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  try {
    if (action === 'approve') {
      await supabase
        .from('doctores')
        .update({
          status: 'approved',
          updated_at: new Date().toISOString(),
        })
        .eq('id', doctorId)
    } else if (action === 'reject') {
      await supabase
        .from('doctores')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', doctorId)
    }

    return NextResponse.redirect(new URL('/admin/verify', request.url))
  } catch (error) {
    logger.error('Error verifying doctor:', { err: error })
    return NextResponse.json(
      { error: 'Failed to verify doctor' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
