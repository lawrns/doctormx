import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { storeVerificationResult, verifyCedulaSEP } from '@/lib/sep-verification'
import { startDoctorTrial } from '@/lib/trials'

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
    languages,
    photoUrl,
  } = body

  try {
    const updateData: Record<string, unknown> = {
      years_experience: yearsExperience,
      bio,
      license_number: licenseNumber,
      price_cents: priceCents,
    }
    if (languages) updateData.languages = languages
    if (photoUrl) updateData.photo_url = photoUrl

    const { error: updateError } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('id', user.id)

    if (updateError) throw updateError

    if (availability) {
      const { error: rpcError } = await supabase.rpc("save_doctor_onboarding", {
        p_doctor_id: user.id,
        p_years_experience: yearsExperience,
        p_bio: bio,
        p_license_number: licenseNumber,
        p_price_cents: priceCents,
        p_availability: availability
      })

      if (rpcError) throw rpcError
    }

    if (licenseNumber) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      const verification = await verifyCedulaSEP(
        licenseNumber,
        profile?.full_name || ''
      )

      await storeVerificationResult(user.id, licenseNumber, verification)
    }

    // Start free trial for the doctor
    await startDoctorTrial(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}
