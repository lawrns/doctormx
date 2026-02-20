/**
 * Patient Repository
 *
 * Repository class for managing patient database operations.
 * Follows the Repository Pattern to abstract database queries.
 *
 * @module PatientRepository
 */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type {
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  ProfileWithRelations,
  DbResponse,
  DbListResponse,
  UserId,
  PatientId,
} from '@/types'
import { TABLES } from '@/types/database'

/**
 * Patient medical history data
 */
export interface PatientMedicalHistoryData {
  allergies?: string[]
  currentMedications?: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  chronicConditions?: string[]
  pastSurgeries?: Array<{
    procedure: string
    year: number | null
    notes: string
  }>
  familyHistory?: Array<{
    condition: string
    relationship: string
    notes: string
  }>
  medicalNotes?: string | null
  bloodType?: string | null
  heightCm?: number | null
  weightKg?: number | null
}

/**
 * Patient medical history row
 */
export interface PatientMedicalHistoryRow {
  id: string
  patient_id: string
  allergies: string[]
  current_medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  chronic_conditions: string[]
  past_surgeries: Array<{
    procedure: string
    year: number | null
    notes: string
  }>
  family_history: Array<{
    condition: string
    relationship: string
    notes: string
  }>
  medical_notes: string | null
  blood_type: string | null
  height_cm: number | null
  weight_kg: number | null
  created_at: string
  updated_at: string
}

/**
 * DTO for creating a new patient profile
 */
export interface CreatePatientDTO {
  id: string
  fullName: string
  phone?: string | null
  photoUrl?: string | null
}

/**
 * DTO for updating a patient profile
 */
export interface UpdatePatientDTO {
  fullName?: string
  phone?: string | null
  photoUrl?: string | null
  dateOfBirth?: string | null
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  insuranceProvider?: string | null
  insurancePolicyNumber?: string | null
  insuranceGroupNumber?: string | null
  insuranceCoverageType?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelationship?: string | null
  notificationsEmail?: boolean
  notificationsSms?: boolean
  notificationsWhatsapp?: boolean
}

/**
 * Query filters for patient search
 */
export interface PatientFilters {
  searchQuery?: string
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'full_name'
  orderDirection?: 'asc' | 'desc'
}

/**
 * Repository class for patient database operations
 */
export class PatientRepository {
  private readonly tableName = TABLES.PROFILES
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
   * Find a patient by ID
   */
  async findById(id: string | PatientId | UserId): Promise<ProfileRow | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .eq('role', 'patient')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find patient: ${error.message}`)
    }

    return data
  }

  /**
   * Find a patient by ID with medical history
   */
  async findByIdWithMedicalHistory(
    id: string | PatientId | UserId
  ): Promise<(ProfileRow & { medicalHistory?: PatientMedicalHistoryRow | null }) | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<ProfileRow & { medicalHistory?: PatientMedicalHistoryRow }> = await supabase
      .from(this.tableName)
      .select(`
        *,
        medicalHistory:patient_medical_history (*)
      `)
      .eq('id', id)
      .eq('role', 'patient')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null as unknown as ProfileRow & { medicalHistory?: PatientMedicalHistoryRow | null }
      }
      throw new Error(`Failed to find patient with medical history: ${error.message}`)
    }

    return data
  }

  /**
   * Find patients by search query (name or phone)
   */
  async search(query: string, filters?: PatientFilters): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    let dbQuery = supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'patient')
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)

    dbQuery = this.applyFilters(dbQuery, filters)

    const { data, error }: DbListResponse<ProfileRow> = await dbQuery

    if (error) {
      throw new Error(`Failed to search patients: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find all patients
   */
  async findAll(filters?: PatientFilters): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'patient')

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<ProfileRow> = await query

    if (error) {
      throw new Error(`Failed to find patients: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create a new patient profile
   */
  async create(data: CreatePatientDTO): Promise<ProfileRow> {
    const supabase = await this.getClient()

    const insertData: ProfileInsert = {
      id: data.id,
      role: 'patient',
      full_name: data.fullName,
      phone: data.phone ?? null,
      photo_url: data.photoUrl ?? null,
    }

    const { data: patient, error }: DbResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create patient: ${error.message}`)
    }

    if (!patient) {
      throw new Error('Failed to create patient: No data returned')
    }

    return patient
  }

  /**
   * Update a patient profile
   */
  async update(id: string | PatientId | UserId, data: UpdatePatientDTO): Promise<ProfileRow> {
    const supabase = await this.getClient()

    const updateData: ProfileUpdate = {
      ...(data.fullName && { full_name: data.fullName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.photoUrl !== undefined && { photo_url: data.photoUrl }),
      ...(data.dateOfBirth !== undefined && { date_of_birth: data.dateOfBirth }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.insuranceProvider !== undefined && { insurance_provider: data.insuranceProvider }),
      ...(data.insurancePolicyNumber !== undefined && { insurance_policy_number: data.insurancePolicyNumber }),
      ...(data.insuranceGroupNumber !== undefined && { insurance_group_number: data.insuranceGroupNumber }),
      ...(data.insuranceCoverageType !== undefined && { insurance_coverage_type: data.insuranceCoverageType }),
      ...(data.emergencyContactName !== undefined && { emergency_contact_name: data.emergencyContactName }),
      ...(data.emergencyContactPhone !== undefined && { emergency_contact_phone: data.emergencyContactPhone }),
      ...(data.emergencyContactRelationship !== undefined && { emergency_contact_relationship: data.emergencyContactRelationship }),
      ...(data.notificationsEmail !== undefined && { notifications_email: data.notificationsEmail }),
      ...(data.notificationsSms !== undefined && { notifications_sms: data.notificationsSms }),
      ...(data.notificationsWhatsapp !== undefined && { notifications_whatsapp: data.notificationsWhatsapp }),
      updated_at: new Date().toISOString(),
    }

    const { data: patient, error }: DbResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update patient: ${error.message}`)
    }

    if (!patient) {
      throw new Error('Failed to update patient: No data returned')
    }

    return patient
  }

  /**
   * Delete a patient profile
   */
  async delete(id: string | PatientId | UserId): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('role', 'patient')

    if (error) {
      throw new Error(`Failed to delete patient: ${error.message}`)
    }
  }

  /**
   * Get patient medical history
   */
  async getMedicalHistory(
    patientId: string | PatientId | UserId
  ): Promise<PatientMedicalHistoryRow | null> {
    const supabase = await this.getClient()

    const { data, error }: DbResponse<PatientMedicalHistoryRow> = await supabase
      .from('patient_medical_history')
      .select('*')
      .eq('patient_id', patientId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get medical history: ${error.message}`)
    }

    return data
  }

  /**
   * Create or update patient medical history
   */
  async upsertMedicalHistory(
    patientId: string | PatientId | UserId,
    data: PatientMedicalHistoryData
  ): Promise<PatientMedicalHistoryRow> {
    const supabase = await this.getClient()

    // Check if medical history exists
    const existing = await this.getMedicalHistory(patientId)

    if (existing) {
      // Update existing
      const { data: updated, error }: DbResponse<PatientMedicalHistoryRow> = await supabase
        .from('patient_medical_history')
        .update({
          ...(data.allergies && { allergies: data.allergies }),
          ...(data.currentMedications && { current_medications: data.currentMedications }),
          ...(data.chronicConditions && { chronic_conditions: data.chronicConditions }),
          ...(data.pastSurgeries && { past_surgeries: data.pastSurgeries }),
          ...(data.familyHistory && { family_history: data.familyHistory }),
          ...(data.medicalNotes !== undefined && { medical_notes: data.medicalNotes }),
          ...(data.bloodType !== undefined && { blood_type: data.bloodType }),
          ...(data.heightCm !== undefined && { height_cm: data.heightCm }),
          ...(data.weightKg !== undefined && { weight_kg: data.weightKg }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update medical history: ${error.message}`)
      }

      return updated as PatientMedicalHistoryRow
    } else {
      // Create new
      const { data: created, error }: DbResponse<PatientMedicalHistoryRow> = await supabase
        .from('patient_medical_history')
        .insert({
          patient_id: patientId,
          allergies: data.allergies ?? [],
          current_medications: data.currentMedications ?? [],
          chronic_conditions: data.chronicConditions ?? [],
          past_surgeries: data.pastSurgeries ?? [],
          family_history: data.familyHistory ?? [],
          medical_notes: data.medicalNotes ?? null,
          blood_type: data.bloodType ?? null,
          height_cm: data.heightCm ?? null,
          weight_kg: data.weightKg ?? null,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create medical history: ${error.message}`)
      }

      return created as PatientMedicalHistoryRow
    }
  }

  /**
   * Check if patient exists
   */
  async exists(id: string | PatientId | UserId): Promise<boolean> {
    const supabase = await this.getClient()

    const { data, error } = await supabase
      .from(this.tableName)
      .select('id')
      .eq('id', id)
      .eq('role', 'patient')
      .single()

    if (error && error.code === 'PGRST116') {
      return false
    }

    if (error) {
      throw new Error(`Failed to check patient existence: ${error.message}`)
    }

    return !!data
  }

  /**
   * Count total patients
   */
  async count(): Promise<number> {
    const supabase = await this.getClient()

    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient')

    if (error) {
      throw new Error(`Failed to count patients: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Get recent patients
   */
  async getRecent(limit = 10): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    const { data, error }: DbListResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'patient')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get recent patients: ${error.message}`)
    }

    return data || []
  }

  /**
   * Apply filters to query
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filters?: PatientFilters): any {
    if (!filters) return query

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
export const patientRepository = new PatientRepository()
