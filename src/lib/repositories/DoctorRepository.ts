/**
 * Doctor Repository
 *
 * Repository class for managing doctor database operations.
 * Follows the Repository Pattern to abstract database queries.
 *
 * @module DoctorRepository
 */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type {
  DoctorRow,
  DoctorInsert,
  DoctorUpdate,
  DoctorWithRelations,
  DoctorStatus,
  SpecialtyRow,
  DoctorSpecialtyRow,
  DbResponse,
  DbListResponse,
  DoctorId,
} from '@/types'
import { TABLES } from '@/types/database'

/**
 * DTO for creating a new doctor
 */
export interface CreateDoctorDTO {
  id: string
  bio?: string | null
  languages?: string[]
  licenseNumber?: string | null
  yearsExperience?: number | null
  city?: string | null
  state?: string | null
  country?: string
  priceCents?: number
  currency?: string
  videoEnabled?: boolean
  acceptsInsurance?: boolean
}

/**
 * DTO for updating an existing doctor
 */
export interface UpdateDoctorDTO {
  bio?: string | null
  languages?: string[]
  licenseNumber?: string | null
  yearsExperience?: number | null
  city?: string | null
  state?: string | null
  country?: string
  priceCents?: number
  currency?: string
  videoEnabled?: boolean
  acceptsInsurance?: boolean
  status?: DoctorStatus
}

/**
 * Query filters for doctor search
 */
export interface DoctorFilters {
  status?: DoctorStatus | DoctorStatus[]
  specialtyId?: string
  city?: string
  state?: string
  minPrice?: number
  maxPrice?: number
  videoEnabled?: boolean
  acceptsInsurance?: boolean
  searchQuery?: string
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'rating_avg' | 'price_cents'
  orderDirection?: 'asc' | 'desc'
}

/**
 * Repository class for doctor database operations
 */
export class DoctorRepository {
  private readonly tableName = 'doctores'
  private useServiceRole = false

  constructor(options?: { useServiceRole?: boolean }) {
    this.useServiceRole = options?.useServiceRole ?? false
  }

  /**
   * Get Supabase client instance
   */
  private async getClient() {
    return this.useServiceRole ? createServiceClient() : await createClient()
  }

  /**
   * Find a doctor by ID
   */
  async findById(id: string | DoctorId): Promise<DoctorRow | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<DoctorRow> = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find doctor: ${error.message}`)
    }

    return data
  }

  /**
   * Find a doctor by ID with all relations (profile, specialties, subscription)
   */
  async findByIdWithRelations(id: string | DoctorId): Promise<DoctorWithRelations | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<DoctorWithRelations> = await supabase
      .from(this.tableName)
      .select(`
        *,
        profile:profiles!doctores_id_fkey (
          id,
          full_name,
          photo_url,
          phone,
          role
        ),
        specialties:doctor_specialties (
          specialty:specialties (
            id,
            name,
            slug,
            description,
            icon
          )
        ),
        subscription:doctor_subscriptions (
          id,
          status,
          plan_name,
          plan_price_cents,
          current_period_start,
          current_period_end
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find doctor with relations: ${error.message}`)
    }

    return data
  }

  /**
   * Find approved doctors
   */
  async findApproved(filters?: DoctorFilters): Promise<DoctorRow[]> {
    const supabase = await this.getClient()
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('status', 'approved')

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<DoctorRow> = await query

    if (error) {
      throw new Error(`Failed to find approved doctors: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find approved doctors with their profiles
   */
  async findApprovedWithProfiles(filters?: DoctorFilters): Promise<DoctorWithRelations[]> {
    const supabase = await this.getClient()
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        profile:profiles!doctores_id_fkey (
          id,
          full_name,
          photo_url,
          phone
        ),
        specialties:doctor_specialties (
          specialty:specialties (
            id,
            name,
            slug
          )
        )
      `)
      .eq('status', 'approved')

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<DoctorWithRelations> = await query

    if (error) {
      throw new Error(`Failed to find approved doctors with profiles: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find doctors by specialty
   */
  async findBySpecialty(
    specialtySlug: string,
    filters?: Omit<DoctorFilters, 'specialtyId'>
  ): Promise<DoctorWithRelations[]> {
    const supabase = await this.getClient()
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        profile:profiles!doctores_id_fkey (
          id,
          full_name,
          photo_url,
          phone
        ),
        specialties:doctor_specialties!inner (
          specialty:specialties!inner (
            id,
            name,
            slug
          )
        )
      `)
      .eq('status', 'approved')
      .eq('specialties.specialty.slug', specialtySlug)

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<DoctorWithRelations> = await query

    if (error) {
      throw new Error(`Failed to find doctors by specialty: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find doctors by city
   */
  async findByCity(city: string, filters?: DoctorFilters): Promise<DoctorRow[]> {
    const supabase = await this.getClient()
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('status', 'approved')
      .ilike('city', `%${city}%`)

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<DoctorRow> = await query

    if (error) {
      throw new Error(`Failed to find doctors by city: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find pending doctors (for admin approval)
   */
  async findPending(): Promise<DoctorWithRelations[]> {
    const supabase = await this.getClient()
    const { data, error }: DbListResponse<DoctorWithRelations> = await supabase
      .from(this.tableName)
      .select(`
        *,
        profile:profiles!doctores_id_fkey (
          id,
          full_name,
          photo_url,
          phone
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to find pending doctors: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create a new doctor
   */
  async create(data: CreateDoctorDTO): Promise<DoctorRow> {
    const supabase = await this.getClient()

    const insertData: DoctorInsert = {
      id: data.id,
      bio: data.bio ?? null,
      languages: data.languages ?? ['es'],
      license_number: data.licenseNumber ?? null,
      years_experience: data.yearsExperience ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      country: data.country ?? 'MX',
      price_cents: data.priceCents ?? 0,
      currency: data.currency ?? 'MXN',
      video_enabled: data.videoEnabled ?? true,
      accepts_insurance: data.acceptsInsurance ?? false,
      status: 'draft',
    }

    const { data: doctor, error }: DbResponse<DoctorRow> = await supabase
      .from(this.tableName)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create doctor: ${error.message}`)
    }

    if (!doctor) {
      throw new Error('Failed to create doctor: No data returned')
    }

    return doctor
  }

  /**
   * Update an existing doctor
   */
  async update(id: string | DoctorId, data: UpdateDoctorDTO): Promise<DoctorRow> {
    const supabase = await this.getClient()

    const updateData: DoctorUpdate = {
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.languages && { languages: data.languages }),
      ...(data.licenseNumber !== undefined && { license_number: data.licenseNumber }),
      ...(data.yearsExperience !== undefined && { years_experience: data.yearsExperience }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.state !== undefined && { state: data.state }),
      ...(data.country && { country: data.country }),
      ...(data.priceCents !== undefined && { price_cents: data.priceCents }),
      ...(data.currency && { currency: data.currency }),
      ...(data.videoEnabled !== undefined && { video_enabled: data.videoEnabled }),
      ...(data.acceptsInsurance !== undefined && { accepts_insurance: data.acceptsInsurance }),
      ...(data.status && { status: data.status }),
      updated_at: new Date().toISOString(),
    }

    const { data: doctor, error }: DbResponse<DoctorRow> = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update doctor: ${error.message}`)
    }

    if (!doctor) {
      throw new Error('Failed to update doctor: No data returned')
    }

    return doctor
  }

  /**
   * Update doctor status
   */
  async updateStatus(id: string | DoctorId, status: DoctorStatus): Promise<DoctorRow> {
    return this.update(id, { status })
  }

  /**
   * Approve a doctor
   */
  async approve(id: string | DoctorId): Promise<DoctorRow> {
    return this.updateStatus(id, 'approved')
  }

  /**
   * Reject a doctor
   */
  async reject(id: string | DoctorId): Promise<DoctorRow> {
    return this.updateStatus(id, 'rejected')
  }

  /**
   * Suspend a doctor
   */
  async suspend(id: string | DoctorId): Promise<DoctorRow> {
    return this.updateStatus(id, 'suspended')
  }

  /**
   * Delete a doctor
   */
  async delete(id: string | DoctorId): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete doctor: ${error.message}`)
    }
  }

  /**
   * Add specialty to doctor
   */
  async addSpecialty(doctorId: string | DoctorId, specialtyId: string): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from(TABLES.DOCTOR_SPECIALTIES)
      .insert({
        doctor_id: doctorId,
        specialty_id: specialtyId,
      })

    if (error) {
      throw new Error(`Failed to add specialty: ${error.message}`)
    }
  }

  /**
   * Remove specialty from doctor
   */
  async removeSpecialty(doctorId: string | DoctorId, specialtyId: string): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from(TABLES.DOCTOR_SPECIALTIES)
      .delete()
      .eq('doctor_id', doctorId)
      .eq('specialty_id', specialtyId)

    if (error) {
      throw new Error(`Failed to remove specialty: ${error.message}`)
    }
  }

  /**
   * Get doctor specialties
   */
  async getSpecialties(doctorId: string | DoctorId): Promise<SpecialtyRow[]> {
    const supabase = await this.getClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error }: { data: { specialty: SpecialtyRow }[] | null; error: Error | null } = await supabase
      .from(TABLES.DOCTOR_SPECIALTIES)
      .select(`
        specialty:specialties (*)
      `)
      .eq('doctor_id', doctorId) as any

    if (error) {
      throw new Error(`Failed to get doctor specialties: ${error.message}`)
    }

    return (data || []).map((item) => item.specialty)
  }

  /**
   * Update doctor rating
   */
  async updateRating(id: string | DoctorId, ratingAvg: number, ratingCount: number): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from(this.tableName)
      .update({
        rating_avg: ratingAvg,
        rating_count: ratingCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update doctor rating: ${error.message}`)
    }
  }

  /**
   * Check if doctor exists
   */
  async exists(id: string | DoctorId): Promise<boolean> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') {
      return false
    }

    if (error) {
      throw new Error(`Failed to check doctor existence: ${error.message}`)
    }

    return !!data
  }

  /**
   * Count doctors by status
   */
  async countByStatus(status?: DoctorStatus): Promise<number> {
    const supabase = await this.getClient()

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })

    if (status) {
      query = query.eq('status', status)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(`Failed to count doctors: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Apply filters to query
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filters?: DoctorFilters): any {
    if (!filters) return query

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }

    if (filters.state) {
      query = query.ilike('state', `%${filters.state}%`)
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price_cents', filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price_cents', filters.maxPrice)
    }

    if (filters.videoEnabled !== undefined) {
      query = query.eq('video_enabled', filters.videoEnabled)
    }

    if (filters.acceptsInsurance !== undefined) {
      query = query.eq('accepts_insurance', filters.acceptsInsurance)
    }

    const orderBy = filters.orderBy ?? 'created_at'
    const orderDirection = filters.orderDirection ?? 'desc'
    query = query.order(orderBy, { ascending: orderDirection === 'asc' })

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit ?? 10) - 1)
    }

    return query
  }
}

/**
 * Singleton instance for default usage
 */
export const doctorRepository = new DoctorRepository()
