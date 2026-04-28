import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'doctor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const { full_name, phone, bio, price_cents, years_experience, license_number, office_address, languages, city, state } = body

    if (price_cents !== undefined && (typeof price_cents !== 'number' || price_cents < 0)) {
      return NextResponse.json({ error: 'price_cents must be a positive number' }, { status: 400 })
    }

    if (years_experience !== undefined) {
      const ye = Number(years_experience)
      if (isNaN(ye) || ye < 0 || ye > 100) {
        return NextResponse.json({ error: 'years_experience must be between 0 and 100' }, { status: 400 })
      }
    }

    if (languages !== undefined && !Array.isArray(languages)) {
      return NextResponse.json({ error: 'languages must be an array' }, { status: 400 })
    }

    if (full_name !== undefined && typeof full_name !== 'string') {
      return NextResponse.json({ error: 'full_name must be a string' }, { status: 400 })
    }

    const profileUpdate: Record<string, unknown> = {}
    if (full_name !== undefined) profileUpdate.full_name = full_name
    if (phone !== undefined) profileUpdate.phone = phone

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', user.id)
      if (profileError) throw profileError
    }

    const doctorUpdate: Record<string, unknown> = {}
    if (bio !== undefined) doctorUpdate.bio = bio
    if (price_cents !== undefined) doctorUpdate.price_cents = price_cents
    if (years_experience !== undefined) doctorUpdate.years_experience = Number(years_experience)
    if (license_number !== undefined) doctorUpdate.license_number = license_number
    if (office_address !== undefined) doctorUpdate.office_address = office_address
    if (languages !== undefined) doctorUpdate.languages = languages
    if (city !== undefined) doctorUpdate.city = city
    if (state !== undefined) doctorUpdate.state = state

    if (Object.keys(doctorUpdate).length > 0) {
      const { error: doctorError } = await supabase
        .from('doctors')
        .update(doctorUpdate)
        .eq('id', user.id)
      if (doctorError) throw doctorError
    }

    const [{ data: updatedDoctor }, { data: updatedProfile }] = await Promise.all([
      supabase.from('doctors').select('*').eq('id', user.id).single(),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])

    return NextResponse.json({ doctor: updatedDoctor, profile: updatedProfile })
  } catch (error) {
    console.error('Error updating doctor profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
