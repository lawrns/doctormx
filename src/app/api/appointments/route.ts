import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { reserveAppointmentSlot } from '@/lib/booking'
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
 * POST /api/appointments
 *
 * Create a new appointment
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Requirement 2.7, 15.5, 15.6: Authentication required, patient_id from session only
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized', redirect: '/auth/login' },
      { status: 401 }
    )
  }

  const body = await request.json()
  const { doctorId, date, time, patientId: bodyPatientId } = body

  // Property 5: Booking Security - Session-Only Patient ID
  // Explicitly ignore any patientId from request body for security
  // Always use authenticated session user ID
  if (bodyPatientId) {
    logger.warn('Security: Ignoring patientId from request body, using session user ID')
  }

  if (!doctorId || !date || !time) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  try {
    // Sistema de reserva maneja todo: validación + creación
    // Requirement 2.7: patient_id obtained exclusively from authenticated session
    const result = await reserveAppointmentSlot({
      patientId: user.id, // Always from session, never from body
      doctorId,
      date,
      time,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    if (!result.appointment) {
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      appointmentId: result.appointment.id,
    })
  } catch (error) {
    logger.error('Error creating appointment:', { err: error })
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/appointments
 *
 * Get paginated list of appointments for the authenticated user
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

    // Build base query for appointments
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', user.id)

    // Apply cursor filtering for forward pagination
    if (cursor && direction === 'forward') {
      try {
        const cursorData = decodeCursor(cursor)
        query = query.gt('start_ts', cursorData.start_ts || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    // Apply cursor filtering for backward pagination
    if (cursor && direction === 'backward') {
      try {
        const cursorData = decodeCursor(cursor)
        query = query.lt('start_ts', cursorData.start_ts || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    // Apply status filter
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

    // Order by start_ts descending (newest first)
    query = query.order('start_ts', { ascending: false })
    query = query.order('id', { ascending: true })

    // Apply limit + 1 to check if there are more results
    query = query.limit(limit + 1)

    const { data: appointmentsData, error: appointmentsError } = await query

    if (appointmentsError) {
      logger.error('Error fetching appointments:', { err: appointmentsError })
      return new Response(JSON.stringify({ error: 'Failed to fetch appointments', details: appointmentsError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if there are more results
    const appointments = (appointmentsData || []) as AppointmentRecord[]
    const hasMore = appointments.length > limit
    const paginatedAppointments = hasMore ? appointments.slice(0, limit) : appointments

    // Get unique doctor IDs from appointments
    const doctorIds = [...new Set(paginatedAppointments.map(apt => apt.doctor_id).filter(Boolean))]

    // Fetch doctor data separately
    let doctorsData: DoctorRecord[] = []
    let profilesData: Array<{ id: string; full_name: string; photo_url: string | null }> = []

    if (doctorIds.length > 0) {
      // Fetch doctors
      const { data: doctors } = await supabase
        .from('doctors')
        .select('id, specialty, price_cents, currency, rating')
        .in('id', doctorIds)
      doctorsData = (doctors || []) as DoctorRecord[]

      // Fetch profiles - doctors.id = profiles.id
      if (doctorsData.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, photo_url')
          .in('id', doctorsData.map(d => d.id))
        profilesData = (profiles || []) as Array<{ id: string; full_name: string; photo_url: string | null }>
      }
    }

    // Combine data
    const enrichedAppointments = paginatedAppointments.map((apt: AppointmentRecord) => {
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

    // Build pagination response
    const result: PaginatedResult<EnrichedAppointment> = buildPaginatedResponse({
      data: enrichedAppointments,
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
    logger.error('Error in GET /api/appointments:', { err: error })
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: 'Unauthorized', details: errorMessage }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
