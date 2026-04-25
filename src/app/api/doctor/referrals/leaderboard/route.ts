// Doctor Referral Leaderboard API – GET /api/doctor/referrals/leaderboard
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireDoctorRole } from '@/lib/auth-guard'

export async function GET() {
  try {
    let doctorId: string
    try {
      const result = await requireDoctorRole()
      doctorId = result.doctorId
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Fetch top 10 referrers by converted count this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: allReferrals, error } = await supabase
      .from('referrals')
      .select('referrer_doctor_id')
      .eq('status', 'converted')
      .gte('converted_at', startOfMonth.toISOString())

    if (error) throw error

    // Aggregate counts
    const countMap = new Map<string, number>()
    for (const ref of allReferrals || []) {
      countMap.set(ref.referrer_doctor_id, (countMap.get(ref.referrer_doctor_id) || 0) + 1)
    }

    // Sort and take top 10
    const topIds = [...countMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    // Fetch doctor details
    const doctorIds = topIds.map(([id]) => id)
    const { data: doctors } = await supabase
      .from('doctors')
      .select('id, specialty, profile:profiles!doctors_id_fkey(full_name, photo_url)')
      .in('id', doctorIds)

    const doctorMap = new Map<string, { specialty: string; full_name: string; photo_url: string | null }>()
    if (doctors) {
      for (const doc of doctors) {
        const profile = Array.isArray(doc.profile) ? doc.profile[0] : doc.profile
        doctorMap.set(doc.id, {
          specialty: doc.specialty || 'Medicina General',
          full_name: profile?.full_name || 'Dr. Anónimo',
          photo_url: profile?.photo_url || null,
        })
      }
    }

    const leaderboard = topIds.map(([id, count], index) => ({
      rank: index + 1,
      doctorId: id,
      name: doctorMap.get(id)?.full_name || 'Dr. Anónimo',
      specialty: doctorMap.get(id)?.specialty || 'Medicina General',
      photoUrl: doctorMap.get(id)?.photo_url || null,
      referralCount: count,
    }))

    // Find current doctor position
    let currentDoctorPosition: number | null = null
    const currentDoctorCount = countMap.get(doctorId)
    if (currentDoctorCount) {
      const allSorted = [...countMap.entries()].sort((a, b) => b[1] - a[1])
      const idx = allSorted.findIndex(([id]) => id === doctorId)
      if (idx >= 0) {
        currentDoctorPosition = idx + 1
      }
    }

    // If not in top 10, add current doctor entry
    let currentDoctorEntry = null
    if (currentDoctorPosition && currentDoctorPosition > 10) {
      const { data: currentDoctor } = await supabase
        .from('doctors')
        .select('id, specialty, profile:profiles!doctors_id_fkey(full_name, photo_url)')
        .eq('id', doctorId)
        .single()

      const profile = Array.isArray(currentDoctor?.profile) ? currentDoctor?.profile[0] : currentDoctor?.profile
      currentDoctorEntry = {
        rank: currentDoctorPosition,
        doctorId,
        name: profile?.full_name || 'Dr. Anónimo',
        specialty: currentDoctor?.specialty || 'Medicina General',
        photoUrl: profile?.photo_url || null,
        referralCount: currentDoctorCount,
      }
    }

    return NextResponse.json({
      success: true,
      leaderboard,
      currentDoctor: currentDoctorEntry,
      currentDoctorPosition,
    })
  } catch (error) {
    console.error('[Leaderboard] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
