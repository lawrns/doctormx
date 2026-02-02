import { requireRole } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireRole('patient')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    // Build base query for appointments only (no joins to avoid syntax issues)
    let query = supabase
      .from('appointments')
      .select('*')
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
    
    const { data: appointmentsData, error: appointmentsError } = await query
    
    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError)
      return new Response(JSON.stringify({ error: 'Failed to fetch appointments', details: appointmentsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Get unique doctor IDs from appointments
    const doctorIds = [...new Set((appointmentsData || []).map(apt => apt.doctor_id).filter(Boolean))]
    
    // Fetch doctor data separately
    let doctorsData: any[] = []
    let profilesData: any[] = []
    
    if (doctorIds.length > 0) {
      // Fetch doctors
      const { data: doctors } = await supabase
        .from('doctors')
        .select('id, specialty, price_cents, currency, rating')
        .in('id', doctorIds)
      doctorsData = doctors || []
      
      // Fetch profiles - doctors.id = profiles.id
      if (doctorsData.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, photo_url')
          .in('id', doctorsData.map(d => d.id))
        profilesData = profiles || []
      }
    }
    
    // Combine data
    const appointments = (appointmentsData || []).map((apt: any) => {
      const doctor = doctorsData.find(d => d.id === apt.doctor_id)
      const profile = doctor ? profilesData.find(p => p.id === doctor.id) : null
      
      return {
        ...apt,
        doctor: doctor ? {
          ...doctor,
          profile: profile || null
        } : null
      }
    })
    
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
