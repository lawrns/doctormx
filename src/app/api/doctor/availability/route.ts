import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setDoctorAvailability } from '@/lib/availability'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const availability = []

  for (let day = 0; day <= 6; day++) {
    const enabled = formData.get(`enabled_${day}`)
    if (enabled === 'on') {
      const startTime = formData.get(`start_${day}`) as string
      const endTime = formData.get(`end_${day}`) as string

      availability.push({
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
      })
    }
  }

  try {
    await setDoctorAvailability(user.id, availability)
    return NextResponse.redirect(new URL('/doctor', request.url))
  } catch {
    return NextResponse.json(
      { error: 'Failed to save availability' },
      { status: 500 }
    )
  }
}
