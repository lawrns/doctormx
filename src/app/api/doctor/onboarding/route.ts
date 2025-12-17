import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    yearsExperience,
    bio,
    licenseNumber,
    availability,
    priceCents,
  } = body

  try {
    const { error } = await supabase.rpc("save_doctor_onboarding", {
      p_doctor_id: user.id,
      p_years_experience: yearsExperience,
      p_bio: bio,
      p_license_number: licenseNumber,
      p_price_cents: priceCents,
      p_availability: availability
    });

    if (error) {
      console.error(error);
      throw error;
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}
