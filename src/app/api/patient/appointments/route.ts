import { requireRole } from '@/lib/auth'
import type { DoctorRecord, AppointmentRecord, EnrichedAppointment } from '@/lib/types/api'
import {
  parsePaginationParams,
  buildPaginatedResponse,
  decodeCursor,
  encodeCursor,
} from '@/lib/pagination'
import type { PaginatedResult } from '@/lib/pagination'
import { logger } from '@/lib/observability/logger'

/**
 * GET /api/patient/appointments
 *
 * Get paginated list of appointments for the authenticated patient
 *
 * Query params:
 * - cursor: string | null - pagination cursor
 * - limit: number (default: 20, max: 100)
 * - status: string - filter by status ('all', 'upcoming', 'past', or specific status)
 */
export async function GET(request: Request) {
  try {
    const { user, supabase } = await requireRole('patient')

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Parse pagination parameters
    const { cursor, limit, direction } = parsePaginationParams(searchParams)

    // Build base query with JOIN to get doctor and profile data in ONE query
    // This eliminates N+1 query problem
    let query = supabase
      .from('appointments')
      .select(`
        *,
        doctors!inner(
          id,
          specialty,
          price_cents,
          currency,
          rating,
          profiles!inner(
            id,
            full_name,
            photo_url
          )
        )
      `)
      .eq('patient_id', user.id)

    // Apply cursor filtering for forward pagination
    if (cursor && direction === 'forward') {
      try {
        const cursorData = decodeCursor(cursor)
        query = query.lt('start_ts', cursorData.start_ts || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    // Apply cursor filtering for backward pagination
    if (cursor && direction === 'backward') {
      try {
        const cursorData = decodeCursor(cursor)
        query = query.gt('start_ts', cursorData.start_ts || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

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
    query = query.order('id', { ascending: true })

    // Apply limit + 1 to check if there are more results
    query = query.limit(limit + 1)

    const { data: appointmentsData, error: appointmentsError } = await query

    if (appointmentsError) {
      logger.error('Error fetching appointments', { error: appointmentsError })
      return new Response(JSON.stringify({ error: 'Failed to fetch appointments', details: appointmentsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if there are more results
    const rawAppointments = (appointmentsData || []) as Array<{
      id: string
      start_ts: string
      end_ts: string | null
      status: string
      patient_id: string
      doctor_id: string
      reason_for_visit: string | null
      notes: string | null
      created_at: string
      updated_at: string
      doctores: {
        id: string
        specialty: string | null
        price_cents: number
        currency: string | null
        rating: number | null
        profiles: {
          id: string
          full_name: string | null
          photo_url: string | null
        }
      }
    }>
    const hasMore = rawAppointments.length > limit
    const paginatedAppointments = hasMore ? rawAppointments.slice(0, limit) : rawAppointments

    // Map results to enriched appointments format
    // The join query returns data with nested structure: {doctors: { profiles: {...} } }
    const appointments = paginatedAppointments.map((apt) => ({
      id: apt.id,
      doctor_id: apt.doctor_id,
      patient_id: apt.patient_id,
      start_ts: apt.start_ts,
      status: apt.status,
      price_cents: apt.doctors.price_cents,
      currency: apt.doctors.currency,
      doctor: {
        id: apt.doctors.id,
        specialty: apt.doctors.specialty,
        price_cents: apt.doctors.price_cents,
        currency: apt.doctors.currency,
        rating: apt.doctors.rating,
        profile: apt.doctors.profiles ? {
          id: apt.doctors.profiles.id,
          full_name: apt.doctors.profiles.full_name || 'Desconocido',
          photo_url: apt.doctors.profiles.photo_url,
        } : null,
      }
    }))

    // Build pagination response
    const result: PaginatedResult<EnrichedAppointment> = buildPaginatedResponse({
      data: appointments,
      limit,
      getNextCursor: (apt: EnrichedAppointment) =>
        apt ? encodeCursor({ id: apt.id, start_ts: apt.start_ts }) : null,
      getPrevCursor: (apt: EnrichedAppointment) =>
        apt ? encodeCursor({ id: apt.id, start_ts: apt.start_ts }) : null,
    })

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error: unknown) {
    logger.error('Error in GET /api/patient/appointments', { error })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: 'Unauthorized', details: errorMessage }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
