import { createClient } from '@/lib/supabase/server'

export interface DoctorRecordSummary {
  id: string
  status?: string | null
  currency?: string | null
  created_at?: string | null
  rating_avg?: number | null
  license_number?: string | null
  years_experience?: number | null
  bio?: string | null
  price_cents?: number | null
  city?: string | null
  state?: string | null
  country?: string | null
}

export async function getDoctorRecordByUserId(userId: string): Promise<DoctorRecordSummary | null> {
  const supabase = await createClient()

  const { data: doctorById } = await supabase
    .from('doctors')
    .select('id, status, currency, created_at, rating_avg, license_number, years_experience, bio, price_cents, city, state, country')
    .eq('id', userId)
    .maybeSingle()

  return doctorById || null
}

export function getDoctorOperationalUserId(doctor: DoctorRecordSummary | null, fallbackUserId: string): string {
  return doctor?.id || fallbackUserId
}

export function getDoctorOperationalRecordId(doctor: DoctorRecordSummary | null, fallbackUserId: string): string {
  return doctor?.id || fallbackUserId
}
