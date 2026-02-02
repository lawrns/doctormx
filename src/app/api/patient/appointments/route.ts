import { requireRole } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireRole('patient')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Simpler query to avoid potential join issues
    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctor_id(
          id,
          specialty,
          price_cents,
          currency,
          rating,
          profiles:profile_id(full_name, photo_url)
        )
      `)
      .eq('patient_id', user.id)
    
    if (status && status !== 'all') {
      if (status === 'upcoming') {
        query = query
          .in('status', ['pending_payment', 'confirmed'])
          .gte('start_ts', new Date().toISOString())
      } else if (status === 'past') {
        query = query
          .in('status', ['completed', 'refunded'])
          .lt('start_ts', new Date().toISOString())
      } else {
        query = query.eq('status', status)
      }
    }
    
    query = query.order('start_ts', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching appointments:', error)
      return new Response(JSON.stringify({ error: 'Failed to fetch appointments', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Transform data to match expected format
    const appointments = (data || []).map((apt: any) => ({
      ...apt,
      doctor: apt.doctor ? {
        ...apt.doctor,
        profile: apt.doctor.profiles
      } : null
    }))
    
    return new Response(JSON.stringify({ appointments }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: any) {
    console.error('Error in GET /api/patient/appointments:', error)
    return new Response(JSON.stringify({ error: 'Unauthorized', details: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
