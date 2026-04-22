import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendDoctorStatusEmail } from '@/lib/notifications'
import { sendWhatsAppNotification } from '@/lib/whatsapp-notifications'

export const dynamic = 'force-dynamic'

type VerificationAction = 'approve' | 'reject' | 'request_docs'

type DoctorRecord = {
  id: string
  status: string
  doctor_subscriptions?: Array<{ status: string; current_period_end?: string | null }> | null
  profile?: { full_name?: string | null; email?: string | null; phone?: string | null } | Array<{ full_name?: string | null; email?: string | null; phone?: string | null }> | null
}

function isVerificationAction(action: string): action is VerificationAction {
  return action === 'approve' || action === 'reject' || action === 'request_docs'
}

function safeRedirectPath(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return '/admin/verify'
  }

  return value
}

function getProfile(doctor: DoctorRecord) {
  return Array.isArray(doctor.profile) ? doctor.profile[0] : doctor.profile
}

async function updateDoctorStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  doctorId: string,
  values: Record<string, unknown>
) {
  const { error } = await supabase
    .from('doctors')
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq('id', doctorId)

  if (error) {
    throw new Error(`Failed to update doctor status: ${error.message}`)
  }
}

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
  const note = (formData.get('note') as string | null)?.trim() || undefined

  if (!doctorId || !action) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  if (!isVerificationAction(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  try {
    const { data: doctorData, error: doctorError } = await supabase
      .from('doctors')
      .select(`
        id,
        status,
        doctor_subscriptions(status, current_period_end),
        profile:profiles(full_name, email, phone)
      `)
      .eq('id', doctorId)
      .single()

    if (doctorError || !doctorData) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 })
    }

    const doctor = doctorData as DoctorRecord
    const profileData = getProfile(doctor)
    const doctorName = profileData?.full_name || 'Doctor'
    const hasActiveSubscription = (doctor.doctor_subscriptions || []).some(
      (sub: { status: string; current_period_end?: string | null }) =>
        sub.status === 'active' && (!sub.current_period_end || new Date(sub.current_period_end) > new Date())
    )

    if (action === 'approve') {
      await updateDoctorStatus(supabase, doctorId, {
        status: 'approved',
        is_listed: hasActiveSubscription,
      })

      const { error: verificationError } = await supabase
        .from('doctor_verifications')
        .update({
          sep_verified: true,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('doctor_id', doctorId)

      if (verificationError) {
        console.warn('Doctor verification row was not updated:', verificationError.message)
      }

      if (profileData?.email) {
        await sendDoctorStatusEmail({
          to: profileData.email,
          doctorName,
          status: 'approved',
          note,
        })
      }

      if (profileData?.phone) {
        await sendWhatsAppNotification(profileData.phone, 'doctor_approved', {
          patientName: doctorName,
          bookingLink: `${process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.mx'}/doctor`,
        })
      }
    } else if (action === 'reject') {
      await updateDoctorStatus(supabase, doctorId, {
        status: 'rejected',
        is_listed: false,
      })

      if (profileData?.email) {
        await sendDoctorStatusEmail({
          to: profileData.email,
          doctorName,
          status: 'rejected',
          note,
        })
      }

      if (profileData?.phone) {
        await sendWhatsAppNotification(profileData.phone, 'doctor_rejected', {
          patientName: doctorName,
        })
      }
    } else if (action === 'request_docs') {
      await updateDoctorStatus(supabase, doctorId, {
        status: 'pending',
        is_listed: false,
      })

      if (profileData?.email) {
        await sendDoctorStatusEmail({
          to: profileData.email,
          doctorName,
          status: 'documents_requested',
          note: note || 'Por favor envia una identificacion oficial, cedula profesional y documentacion de especialidad si aplica.',
        })
      }

      if (profileData?.phone) {
        await sendWhatsAppNotification(profileData.phone, 'doctor_documents_requested', {
          patientName: doctorName,
        })
      }
    }

    return NextResponse.redirect(new URL(safeRedirectPath(formData.get('redirectTo')), request.url), 303)
  } catch (error) {
    console.error('Error verifying doctor:', error)
    return NextResponse.json(
      { error: 'Failed to verify doctor' },
      { status: 500 }
    )
  }
}
