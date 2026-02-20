/**
 * Appointment Repository
 *
 * Repository class for managing appointment database operations.
 * Follows the Repository Pattern to abstract database queries.
 *
 * @module AppointmentRepository
 */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type {
  AppointmentRow,
  AppointmentInsert,
  AppointmentUpdate,
  AppointmentWithRelations,
  AppointmentStatus,
  DbResponse,
  DbListResponse,
  AppointmentId,
  DoctorId,
  PatientId,
} from '@/types'
import { toAppointmentId } from '@/types/branded-types'

/**
 * DTO for creating a new appointment
 */
export interface CreateAppointmentDTO {
  patientId: string
  doctorId: string
  startTs: string
  endTs: string
  reasonForVisit?: string | null
  notes?: string | null
  appointmentType?: 'in_person' | 'video'
}

/**
 * DTO for updating an existing appointment
 */
export interface UpdateAppointmentDTO {
  startTs?: string
  endTs?: string
  status?: AppointmentStatus
  reasonForVisit?: string | null
  notes?: string | null
  videoRoomUrl?: string | null
  videoStatus?: 'pending' | 'ready' | 'in_progress' | 'completed' | 'missed'
  videoRoomId?: string | null
  videoStartedAt?: string | null
  videoEndedAt?: string | null
  consultationNotes?: string | null
  cancellationReason?: string | null
  cancelledBy?: string | null
}

/**
 * Query filters for appointment search
 */
export interface AppointmentFilters {
  status?: AppointmentStatus | AppointmentStatus[]
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  orderBy?: 'start_ts' | 'created_at' | 'updated_at'
  orderDirection?: 'asc' | 'desc'
}

/**
 * Repository class for appointment database operations
 */
export class AppointmentRepository {
  private readonly tableName = 'appointments'
  private readonly supabase: Awaited<ReturnType<typeof createClient>> | null = null

  constructor(options?: { useServiceRole?: boolean }) {
    // Constructor only stores options - async initialization handled per-method
    this.useServiceRole = options?.useServiceRole ?? false
  }

  private useServiceRole = false

  /**
   * Get Supabase client instance
   */
  private async getClient() {
    return this.useServiceRole ? createServiceClient() : await createClient()
  }

  /**
   * Find an appointment by ID
   */
  async findById(id: string | AppointmentId): Promise<AppointmentRow | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<AppointmentRow> = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find appointment: ${error.message}`)
    }

    return data
  }

  /**
   * Find an appointment by ID with all relations
   */
  async findByIdWithRelations(id: string | AppointmentId): Promise<AppointmentWithRelations | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<AppointmentWithRelations> = await supabase
      .from(this.tableName)
      .select(`
        *,
        doctor:doctores (
          *,
          profile:profiles (full_name, photo_url, phone)
        ),
        patient:profiles!appointments_patient_id_fkey (
          full_name,
          photo_url,
          phone
        ),
        payment:payments (*),
        prescription:prescriptions (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find appointment with relations: ${error.message}`)
    }

    return data
  }

  /**
   * Find appointments by doctor ID
   */
  async findByDoctor(
    doctorId: string | DoctorId,
    filters?: AppointmentFilters
  ): Promise<AppointmentRow[]> {
    const supabase = await this.getClient()
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('doctor_id', doctorId)

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<AppointmentRow> = await query

    if (error) {
      throw new Error(`Failed to find appointments by doctor: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find appointments by doctor ID with patient relations
   */
  async findByDoctorWithPatients(
    doctorId: string | DoctorId,
    filters?: AppointmentFilters
  ): Promise<AppointmentWithRelations[]> {
    const supabase = await this.getClient()
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey (
          full_name,
          photo_url,
          phone
        ),
        payment:payments (*)
      `)
      .eq('doctor_id', doctorId)

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<AppointmentWithRelations> = await query

    if (error) {
      throw new Error(`Failed to find appointments with patients: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find appointments by patient ID
   */
  async findByPatient(
    patientId: string | PatientId,
    filters?: AppointmentFilters
  ): Promise<AppointmentRow[]> {
    const supabase = await this.getClient()
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('patient_id', patientId)

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<AppointmentRow> = await query

    if (error) {
      throw new Error(`Failed to find appointments by patient: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find appointments by patient ID with doctor relations
   */
  async findByPatientWithDoctors(
    patientId: string | PatientId,
    filters?: AppointmentFilters
  ): Promise<AppointmentWithRelations[]> {
    const supabase = await this.getClient()
    let query = supabase
      .from(this.tableName)
      .select(`
        *,
        doctor:doctores (
          *,
          profile:profiles (full_name, photo_url)
        ),
        payment:payments (*)
      `)
      .eq('patient_id', patientId)

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<AppointmentWithRelations> = await query

    if (error) {
      throw new Error(`Failed to find appointments with doctors: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find upcoming appointments for a patient
   */
  async findUpcomingByPatient(
    patientId: string | PatientId,
    limit = 10
  ): Promise<AppointmentWithRelations[]> {
    const supabase = await this.getClient()
    const now = new Date().toISOString()

    const { data, error }: DbListResponse<AppointmentWithRelations> = await supabase
      .from(this.tableName)
      .select(`
        *,
        doctor:doctores (
          *,
          profile:profiles (full_name, photo_url)
        )
      `)
      .eq('patient_id', patientId)
      .gte('start_ts', now)
      .in('status', ['confirmed', 'pending_payment'])
      .order('start_ts', { ascending: true })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to find upcoming appointments: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find upcoming appointments for a doctor
   */
  async findUpcomingByDoctor(
    doctorId: string | DoctorId,
    limit = 10
  ): Promise<AppointmentWithRelations[]> {
    const supabase = await this.getClient()
    const now = new Date().toISOString()

    const { data, error }: DbListResponse<AppointmentWithRelations> = await supabase
      .from(this.tableName)
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey (
          full_name,
          photo_url,
          phone
        )
      `)
      .eq('doctor_id', doctorId)
      .gte('start_ts', now)
      .in('status', ['confirmed', 'pending_payment'])
      .order('start_ts', { ascending: true })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to find upcoming appointments: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create a new appointment
   */
  async create(data: CreateAppointmentDTO): Promise<AppointmentRow> {
    const supabase = await this.getClient()

    const insertData: AppointmentInsert = {
      patient_id: data.patientId,
      doctor_id: data.doctorId,
      start_ts: data.startTs,
      end_ts: data.endTs,
      status: 'pending_payment',
      reason_for_visit: data.reasonForVisit ?? null,
      notes: data.notes ?? null,
      appointment_type: data.appointmentType ?? 'video',
    }

    const { data: appointment, error }: DbResponse<AppointmentRow> = await supabase
      .from(this.tableName)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create appointment: ${error.message}`)
    }

    if (!appointment) {
      throw new Error('Failed to create appointment: No data returned')
    }

    return appointment
  }

  /**
   * Update an existing appointment
   */
  async update(
    id: string | AppointmentId,
    data: UpdateAppointmentDTO
  ): Promise<AppointmentRow> {
    const supabase = await this.getClient()

    const updateData: AppointmentUpdate = {
      ...(data.startTs && { start_ts: data.startTs }),
      ...(data.endTs && { end_ts: data.endTs }),
      ...(data.status && { status: data.status }),
      ...(data.reasonForVisit !== undefined && { reason_for_visit: data.reasonForVisit }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.videoRoomUrl !== undefined && { video_room_url: data.videoRoomUrl }),
      ...(data.videoStatus && { video_status: data.videoStatus }),
      ...(data.videoRoomId !== undefined && { video_room_id: data.videoRoomId }),
      ...(data.videoStartedAt !== undefined && { video_started_at: data.videoStartedAt }),
      ...(data.videoEndedAt !== undefined && { video_ended_at: data.videoEndedAt }),
      ...(data.consultationNotes !== undefined && { consultation_notes: data.consultationNotes }),
      ...(data.cancellationReason !== undefined && { cancellation_reason: data.cancellationReason }),
      ...(data.cancelledBy !== undefined && { cancelled_by: data.cancelledBy }),
      updated_at: new Date().toISOString(),
    }

    const { data: appointment, error }: DbResponse<AppointmentRow> = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`)
    }

    if (!appointment) {
      throw new Error('Failed to update appointment: No data returned')
    }

    return appointment
  }

  /**
   * Update appointment status
   */
  async updateStatus(
    id: string | AppointmentId,
    status: AppointmentStatus
  ): Promise<AppointmentRow> {
    return this.update(id, { status })
  }

  /**
   * Confirm appointment payment
   */
  async confirmPayment(id: string | AppointmentId): Promise<AppointmentRow> {
    return this.updateStatus(id, 'confirmed')
  }

  /**
   * Mark appointment as completed
   */
  async complete(id: string | AppointmentId): Promise<AppointmentRow> {
    return this.updateStatus(id, 'completed')
  }

  /**
   * Cancel an appointment
   */
  async cancel(
    id: string | AppointmentId,
    reason?: string,
    cancelledBy?: string
  ): Promise<AppointmentRow> {
    return this.update(id, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledBy: cancelledBy ?? null,
    })
  }

  /**
   * Delete an appointment
   */
  async delete(id: string | AppointmentId): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete appointment: ${error.message}`)
    }
  }

  /**
   * Check if a time slot is available for a doctor
   */
  async isTimeSlotAvailable(
    doctorId: string | DoctorId,
    startTs: string,
    endTs: string,
    excludeAppointmentId?: string | AppointmentId
  ): Promise<boolean> {
    const supabase = await this.getClient()

    let query = supabase
      .from(this.tableName)
      .select('id')
      .eq('doctor_id', doctorId)
      .in('status', ['confirmed', 'pending_payment'])
      .or(`and(start_ts.lte.${endTs},end_ts.gte.${startTs})`)

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to check time slot availability: ${error.message}`)
    }

    return !data || data.length === 0
  }

  /**
   * Count appointments by status
   */
  async countByStatus(
    doctorId: string | DoctorId,
    status: AppointmentStatus | AppointmentStatus[]
  ): Promise<number> {
    const supabase = await this.getClient()
    const statuses = Array.isArray(status) ? status : [status]

    const { count, error } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('doctor_id', doctorId)
      .in('status', statuses)

    if (error) {
      throw new Error(`Failed to count appointments: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Apply filters to query
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filters?: AppointmentFilters): any {
    if (!filters) return query

    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      query = query.in('status', statuses)
    }

    if (filters.startDate) {
      query = query.gte('start_ts', filters.startDate)
    }

    if (filters.endDate) {
      query = query.lte('start_ts', filters.endDate)
    }

    const orderBy = filters.orderBy ?? 'start_ts'
    const orderDirection = filters.orderDirection ?? 'asc'
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
export const appointmentRepository = new AppointmentRepository()
