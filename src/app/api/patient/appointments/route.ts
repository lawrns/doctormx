import { requireRole } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireRole('patient')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctor:doctors (
          *,
          profile:profiles (full_name, photo_url, email)
        ),
        payment:payments (
          amount_cents,
          currency,
          status
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
      return new Response(JSON.stringify({ error: 'Failed to fetch appointments' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ appointments: data || [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error in GET /api/patient/appointments:', error)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
