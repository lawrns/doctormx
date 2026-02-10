import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import {
  parsePaginationParams,
  buildPaginatedResponse,
  decodeCursor,
  encodeCursor,
} from '@/lib/pagination'
import type { PaginatedResult } from '@/lib/pagination'

/**
 * GET /api/patients
 *
 * Get paginated list of patients for a doctor
 * Only accessible by doctors - returns patients who have appointments with this doctor
 *
 * Query params:
 * - cursor: string | null - pagination cursor
 * - limit: number (default: 20, max: 100)
 * - search: string - search by patient name
 */
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await requireRole('doctor')

    // Verify the user is a registered doctor
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!doctor) {
      return NextResponse.json(
        { error: 'User is not a registered doctor' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('search')

    // Parse pagination parameters
    const { cursor, limit, direction } = parsePaginationParams(searchParams)

    // Get unique patient IDs from appointments with this doctor
    let patientsQuery = supabase
      .from('appointments')
      .select('patient_id, created_at')

    // Apply cursor filtering for forward pagination
    if (cursor && direction === 'forward') {
      try {
        const cursorData = decodeCursor(cursor)
        patientsQuery = patientsQuery.gt('created_at', cursorData.created_at || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    // Apply cursor filtering for backward pagination
    if (cursor && direction === 'backward') {
      try {
        const cursorData = decodeCursor(cursor)
        patientsQuery = patientsQuery.lt('created_at', cursorData.created_at || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    patientsQuery = patientsQuery
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false })
      .order('patient_id', { ascending: true })
      .limit(limit + 1)

    const { data: appointments, error: appointmentsError } = await patientsQuery

    if (appointmentsError) {
      console.error('Error fetching patient appointments:', appointmentsError)
      return NextResponse.json(
        { error: 'Failed to fetch patients' },
        { status: 500 }
      )
    }

    // Extract unique patient IDs
    const patientEntries = (appointments || [])
      .map((apt: any) => ({
        patient_id: apt.patient_id,
        created_at: apt.created_at,
      }))

    // Remove duplicates (keep first occurrence)
    const uniquePatients = Array.from(
      new Map(patientEntries.map((item) => [item.patient_id, item])).values()
    )

    // Check if there are more results
    const hasMore = uniquePatients.length > limit
    const paginatedPatients = hasMore ? uniquePatients.slice(0, limit) : uniquePatients

    // Fetch patient profiles
    const patientIds = paginatedPatients.map((p) => p.patient_id)

    let profilesQuery = supabase
      .from('profiles')
      .select('id, full_name, photo_url, email, phone')
      .in('id', patientIds)

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      profilesQuery = profilesQuery.ilike('full_name', `%${query}%`)
    }

    const { data: profiles, error: profilesError } = await profilesQuery

    if (profilesError) {
      console.error('Error fetching patient profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch patient profiles' },
        { status: 500 }
      )
    }

    // Enrich profiles with pagination data
    const enrichedPatients = (profiles || []).map((profile) => {
      const patientEntry = paginatedPatients.find((p) => p.patient_id === profile.id)
      return {
        ...profile,
        first_appointment_at: patientEntry?.created_at,
      }
    })

    // Build pagination response
    const result: PaginatedResult<any> = buildPaginatedResponse({
      data: enrichedPatients,
      limit,
      getNextCursor: (patient: any) =>
        patient ? encodeCursor({ id: patient.id, created_at: patient.first_appointment_at }) : null,
      getPrevCursor: (patient: any) =>
        patient ? encodeCursor({ id: patient.id, created_at: patient.first_appointment_at }) : null,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in GET /api/patients:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
