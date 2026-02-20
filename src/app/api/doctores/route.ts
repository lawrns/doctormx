import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  parsePaginationParams,
  buildPaginatedResponse,
  decodeCursor,
  encodeCursor,
} from '@/lib/pagination'
import type { PaginatedResult } from '@/lib/pagination'
import { logger } from '@/lib/observability/logger'

/**
 * GET /api/doctores
 *
 * List approved doctores with cursor-based pagination
 *
 * Query params:
 * - cursor: string | null - pagination cursor
 * - limit: number (default: 20, max: 100)
 * - direction: 'forward' | 'backward' (default: 'forward')
 * - specialty: string - filter by specialty slug
 * - city: string - filter by city
 * - search: string - search by doctor name
 * - sort: 'rating' | 'price' | 'experience' | 'created' (default: 'rating')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination parameters
    const { cursor, limit, direction } = parsePaginationParams(searchParams)

    // Parse filters
    const specialtySlug = searchParams.get('specialty')
    const city = searchParams.get('city')
    const searchQuery = searchParams.get('search')
    const sortBy = searchParams.get('sort') ?? 'rating'

    const supabase = await createClient()

    // Build query
    let query = supabase
      .from('doctores')
      .select(`
        id,
        bio,
        price_cents,
        rating_avg,
        rating_count,
        city,
        state,
        years_experience,
        languages,
        status,
        video_enabled,
        created_at,
        doctor_specialties (
          specialty_id,
          specialty:specialties (
            id,
            name,
            slug
          )
        ),
        profiles.doctores_id_fkey (
          id,
          full_name,
          photo_url
        ),
        doctor_subscriptions (
          id,
          status,
          current_period_end
        )
      `)
      .eq('status', 'approved')

    // Apply cursor filtering for forward pagination
    if (cursor && direction === 'forward') {
      try {
        const cursorData = decodeCursor(cursor)
        query = query.gt('created_at', cursorData.created_at || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    // Apply cursor filtering for backward pagination
    if (cursor && direction === 'backward') {
      try {
        const cursorData = decodeCursor(cursor)
        query = query.lt('created_at', cursorData.created_at || cursor)
      } catch {
        // Invalid cursor, ignore
      }
    }

    // Apply sorting
    const ascending = sortBy === 'price' ? true : false
    switch (sortBy) {
      case 'rating':
        query = query.order('rating_avg', { ascending: false, nullsFirst: false })
        break
      case 'price':
        query = query.order('price_cents', { ascending })
        break
      case 'experience':
        query = query.order('years_experience', { ascending: false, nullsFirst: false })
        break
      case 'created':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Always order by id as tiebreaker for consistent pagination
    query = query.order('id', { ascending: true })

    // Apply limit + 1 to check if there are more results
    query = query.limit(limit + 1)

    const { data: rawDoctors, error } = await query

    if (error) {
      logger.error('Error fetching doctores:', { err: error })
      return NextResponse.json(
        { error: 'Failed to fetch doctores' },
        { status: 500 }
      )
    }

    // Transform and filter doctores
    type DoctorWithSpecialties = {
      id: string
      bio: string | null
      price_cents: number
      rating_avg: number
      rating_count: number
      city: string | null
      state: string | null
      years_experience: number | null
      languages: string[]
      video_enabled: boolean
      created_at: string
      profile: { id: string; full_name: string | null; photo_url: string | null } | null
      specialties: Array<{ id: string; name: string | null; slug: string | null }>
    }

    let doctors = (rawDoctors || []).map((doctor): DoctorWithSpecialties | null => {
      // Type assertion for the complex Supabase join result
      const doc = doctor as unknown as {
        id: string
        bio: string | null
        price_cents: number
        rating_avg: number | null
        rating_count: number | null
        city: string | null
        state: string | null
        years_experience: number | null
        languages: string[] | null
        video_enabled: boolean
        created_at: string
        profiles: { id: string; full_name: string | null; photo_url: string | null } | null
        doctor_specialties: Array<{ specialty_id: string; specialty: { id: string; name: string; slug: string } | null }> | null
        doctor_subscriptions: Array<{ status: string; current_period_end: string }> | null
      }

      const hasActiveSubscription = doc.doctor_subscriptions?.some(
        (sub) => sub.status === 'active' && new Date(sub.current_period_end) > new Date()
      )

      if (!hasActiveSubscription) {
        return null
      }

      return {
        id: doc.id,
        bio: doc.bio,
        price_cents: doc.price_cents,
        rating_avg: doc.rating_avg ?? 0,
        rating_count: doc.rating_count ?? 0,
        city: doc.city,
        state: doc.state,
        years_experience: doc.years_experience,
        languages: doc.languages || ['es'],
        video_enabled: doc.video_enabled,
        created_at: doc.created_at,
        profile: doc.profiles,
        specialties: doc.doctor_specialties?.map((ds) => ({
          id: ds.specialty_id,
          name: ds.specialty?.name ?? null,
          slug: ds.specialty?.slug ?? null,
        })) || [],
      }
    }).filter((doc): doc is DoctorWithSpecialties => doc !== null)

    // Apply additional client-side filters
    if (specialtySlug) {
     doctors = doctors.filter((doctor: DoctorWithSpecialties) =>
        doctor.specialties?.some((s) => s.slug === specialtySlug)
      )
    }

    if (city) {
     doctors = doctors.filter((doctor: DoctorWithSpecialties) => doctor.city === city)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
     doctors = doctors.filter((doctor: DoctorWithSpecialties) =>
        doctor.profile?.full_name?.toLowerCase().includes(query)
      )
    }

    // Check if there are more results
    const hasMore =doctors.length > limit
    if (hasMore) {
     doctors = doctors.slice(0, limit)
    }

    // Build pagination response
    const result: PaginatedResult<DoctorWithSpecialties> = buildPaginatedResponse({
      data:doctors,
      limit,
      getNextCursor: (doctor: DoctorWithSpecialties) =>
        doctor ? encodeCursor({ id: doctor.id, created_at: doctor.created_at }) : null,
      getPrevCursor: (doctor: DoctorWithSpecialties) =>
        doctor ? encodeCursor({ id: doctor.id, created_at: doctor.created_at }) : null,
    })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error in GET /api/doctores:', { err: error })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
