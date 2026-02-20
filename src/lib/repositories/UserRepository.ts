/**
 * User Repository
 *
 * Repository class for managing user (profile) database operations.
 * Follows the Repository Pattern to abstract database queries.
 *
 * @module UserRepository
 */

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type {
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  ProfileWithRelations,
  UserRole,
  DbResponse,
  DbListResponse,
  UserId,
} from '@/types'
import { TABLES } from '@/types/database'

/**
 * DTO for creating a new user profile
 */
export interface CreateUserDTO {
  id: string
  role: UserRole
  fullName: string
  phone?: string | null
  photoUrl?: string | null
}

/**
 * DTO for updating a user profile
 */
export interface UpdateUserDTO {
  fullName?: string
  phone?: string | null
  photoUrl?: string | null
  role?: UserRole
}

/**
 * Query filters for user search
 */
export interface UserFilters {
  role?: UserRole | UserRole[]
  searchQuery?: string
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'full_name' | 'role'
  orderDirection?: 'asc' | 'desc'
}

/**
 * User statistics
 */
export interface UserStatistics {
  total: number
  byRole: Record<UserRole, number>
  recentlyCreated: number
}

/**
 * Repository class for user database operations
 */
export class UserRepository {
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
   * Find a user by ID
   */
  async findById(id: string | UserId): Promise<ProfileRow | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find user: ${error.message}`)
    }

    return data
  }

  /**
   * Find a user by ID with all relations
   */
  async findByIdWithRelations(id: string | UserId): Promise<ProfileWithRelations | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<ProfileWithRelations> = await supabase
      .from(this.tableName)
      .select(`
        *,
        doctor:doctores (
          *,
          specialties:doctor_specialties (
            specialty:specialties (
              id,
              name,
              slug
            )
          ),
          subscription:doctor_subscriptions (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find user with relations: ${error.message}`)
    }

    return data
  }

  /**
   * Find a user by phone number
   */
  async findByPhone(phone: string): Promise<ProfileRow | null> {
    const supabase = await this.getClient()
    const { data, error }: DbResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .select('*')
      .eq('phone', phone)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to find user by phone: ${error.message}`)
    }

    return data
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole, filters?: Omit<UserFilters, 'role'>): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('role', role)

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<ProfileRow> = await query

    if (error) {
      throw new Error(`Failed to find users by role: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find all users with optional filters
   */
  async findAll(filters?: UserFilters): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    let query = supabase.from(this.tableName).select('*')

    query = this.applyFilters(query, filters)

    const { data, error }: DbListResponse<ProfileRow> = await query

    if (error) {
      throw new Error(`Failed to find users: ${error.message}`)
    }

    return data || []
  }

  /**
   * Search users by name or phone
   */
  async search(query: string, filters?: Omit<UserFilters, 'searchQuery'>): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    let dbQuery = supabase
      .from(this.tableName)
      .select('*')
      .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)

    dbQuery = this.applyFilters(dbQuery, filters)

    const { data, error }: DbListResponse<ProfileRow> = await dbQuery

    if (error) {
      throw new Error(`Failed to search users: ${error.message}`)
    }

    return data || []
  }

  /**
   * Create a new user profile
   */
  async create(data: CreateUserDTO): Promise<ProfileRow> {
    const supabase = await this.getClient()

    const insertData: ProfileInsert = {
      id: data.id,
      role: data.role,
      full_name: data.fullName,
      phone: data.phone ?? null,
      photo_url: data.photoUrl ?? null,
    }

    const { data: user, error }: DbResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`)
    }

    if (!user) {
      throw new Error('Failed to create user: No data returned')
    }

    return user
  }

  /**
   * Update a user profile
   */
  async update(id: string | UserId, data: UpdateUserDTO): Promise<ProfileRow> {
    const supabase = await this.getClient()

    const updateData: ProfileUpdate = {
      ...(data.fullName && { full_name: data.fullName }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.photoUrl !== undefined && { photo_url: data.photoUrl }),
      ...(data.role && { role: data.role }),
      updated_at: new Date().toISOString(),
    }

    const { data: user, error }: DbResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`)
    }

    if (!user) {
      throw new Error('Failed to update user: No data returned')
    }

    return user
  }

  /**
   * Update user role
   */
  async updateRole(id: string | UserId, role: UserRole): Promise<ProfileRow> {
    return this.update(id, { role })
  }

  /**
   * Delete a user profile
   */
  async delete(id: string | UserId): Promise<void> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`)
    }
  }

  /**
   * Check if user exists
   */
  async exists(id: string | UserId): Promise<boolean> {
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
      throw new Error(`Failed to check user existence: ${error.message}`)
    }

    return !!data
  }

  /**
   * Check if phone number is already registered
   */
  async isPhoneRegistered(phone: string, excludeUserId?: string | UserId): Promise<boolean> {
    const supabase = await this.getClient()

    let query = supabase
      .from(this.tableName)
      .select('id')
      .eq('phone', phone)

    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data, error } = await query.single()

    if (error && error.code === 'PGRST116') {
      return false
    }

    if (error) {
      throw new Error(`Failed to check phone registration: ${error.message}`)
    }

    return !!data
  }

  /**
   * Count users
   */
  async count(role?: UserRole): Promise<number> {
    const supabase = await this.getClient()

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })

    if (role) {
      query = query.eq('role', role)
    }

    const { count, error } = await query

    if (error) {
      throw new Error(`Failed to count users: ${error.message}`)
    }

    return count || 0
  }

  /**
   * Count users by role
   */
  async countByRole(): Promise<Record<UserRole, number>> {
    const supabase = await this.getClient()

    const { data, error }: DbListResponse<{ role: UserRole; count: number }> = await supabase
      .from(this.tableName)
      .select('role', { count: 'exact' })

    if (error) {
      throw new Error(`Failed to count users by role: ${error.message}`)
    }

    const counts: Record<UserRole, number> = {
      patient: 0,
      doctor: 0,
      admin: 0,
    }

    // Count from the actual data returned
    if (data) {
      for (const item of data) {
        counts[item.role] = (counts[item.role] || 0) + 1
      }
    }

    return counts
  }

  /**
   * Get recently created users
   */
  async getRecent(limit = 10, role?: UserRole): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    let query = supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (role) {
      query = query.eq('role', role)
    }

    const { data, error }: DbListResponse<ProfileRow> = await query

    if (error) {
      throw new Error(`Failed to get recent users: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get user statistics
   */
  async getStatistics(): Promise<UserStatistics> {
    const [total, byRole, recentlyCreated] = await Promise.all([
      this.count(),
      this.countByRole(),
      this.getRecent(30),
    ])

    return {
      total,
      byRole,
      recentlyCreated: recentlyCreated.length,
    }
  }

  /**
   * Find doctors by name (search)
   */
  async findDoctorsByName(name: string, limit = 10): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    const { data, error }: DbListResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'doctor')
      .ilike('full_name', `%${name}%`)
      .limit(limit)

    if (error) {
      throw new Error(`Failed to find doctors by name: ${error.message}`)
    }

    return data || []
  }

  /**
   * Find patients by name (search)
   */
  async findPatientsByName(name: string, limit = 10): Promise<ProfileRow[]> {
    const supabase = await this.getClient()

    const { data, error }: DbListResponse<ProfileRow> = await supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'patient')
      .ilike('full_name', `%${name}%`)
      .limit(limit)

    if (error) {
      throw new Error(`Failed to find patients by name: ${error.message}`)
    }

    return data || []
  }

  /**
   * Bulk update user roles (admin only)
   */
  async bulkUpdateRole(userIds: (string | UserId)[], role: UserRole): Promise<number> {
    const supabase = await this.getClient()

    const { error } = await supabase
      .from(this.tableName)
      .update({
        role,
        updated_at: new Date().toISOString(),
      })
      .in('id', userIds)

    if (error) {
      throw new Error(`Failed to bulk update roles: ${error.message}`)
    }

    return userIds.length
  }

  /**
   * Apply filters to query
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters(query: any, filters?: UserFilters): any {
    if (!filters) return query

    if (filters.role) {
      const roles = Array.isArray(filters.role) ? filters.role : [filters.role]
      query = query.in('role', roles)
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
export const userRepository = new UserRepository()
