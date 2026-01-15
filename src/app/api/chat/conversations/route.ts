import { requireAuth } from '@/lib/auth'
import { getConversations, createConversation } from '@/lib/chat'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { user, supabase } = await requireAuth()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as 'patient' | 'doctor'
    if (!role || (role !== 'patient' && role !== 'doctor')) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const conversations = await getConversations(user.id, role)

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error('Error getting conversations:', error)
    return NextResponse.json(
      { error: 'Failed to get conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireAuth()

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const body = await request.json()
    const { patientId, doctorId, appointmentId } = body

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: 'Missing required fields: patientId, doctorId' },
        { status: 400 }
      )
    }

    const role = profile?.role as 'patient' | 'doctor'
    if (!role) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    let actualPatientId = patientId
    let actualDoctorId = doctorId

    if (role === 'patient') {
      actualPatientId = user.id
    } else if (role === 'doctor') {
      actualDoctorId = user.id

      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!doctor) {
        return NextResponse.json(
          { error: 'User is not a registered doctor' },
          { status: 403 }
        )
      }
    }

    const conversation = await createConversation({
      patientId: actualPatientId,
      doctorId: actualDoctorId,
      appointmentId,
    })

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
