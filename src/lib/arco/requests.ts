/**
 * ARCO Request Management
 *
 * Handles creation, retrieval, and updating of ARCO requests
 */

import { createClient } from '@/lib/supabase/server'
import type {
  CreateArcoRequestInput,
  UpdateArcoRequestInput,
  ArcoRequestRow,
  ArcoRequestWithDetails,
  ArcoRequestFilter,
  ArcoRequestSort,
  PaginatedResponse,
  ArcoRequestStatus,
} from '@/types/arco'
import { ArcoError, ArcoErrorCode } from '@/types/arco'
import { addBusinessDays, calculateBusinessDays, canSubmitArcoRequest } from './index'

const DEFAULT_REQUESTS_PER_PAGE = 20

// ================================================
// CREATE REQUEST
// ================================================

/**
 * Create a new ARCO request
 *
 * @param userId - User ID making the request
 * @param input - Request data
 * @returns Created request
 */
export async function createArcoRequest(
  userId: string,
  input: CreateArcoRequestInput
): Promise<ArcoRequestRow> {
  const supabase = await createClient()

  // Validate input
  if (!input.title || input.title.trim().length === 0) {
    throw new ArcoError('Title is required', ArcoErrorCode.MISSING_REQUIRED_INFO)
  }

  if (!input.description || input.description.trim().length === 0) {
    throw new ArcoError('Description is required', ArcoErrorCode.MISSING_REQUIRED_INFO)
  }

  if (!input.data_scope || input.data_scope.length === 0) {
    throw new ArcoError('Data scope is required', ArcoErrorCode.MISSING_REQUIRED_INFO)
  }

  // Check for duplicate pending requests
  const canSubmit = await canSubmitArcoRequest(userId, input.request_type)
  if (!canSubmit) {
    throw new ArcoError(
      'Ya tienes una solicitud de este tipo en proceso. Por favor espera a que se resuelva antes de enviar otra.',
      ArcoErrorCode.DUPLICATE_REQUEST,
      400
    )
  }

  // Calculate due date (20 business days)
  const dueDate = addBusinessDays(new Date(), 20)

  // Create the request
  const { data, error } = await supabase
    .from('arco_requests')
    .insert({
      user_id: userId,
      request_type: input.request_type,
      title: input.title.trim(),
      description: input.description.trim(),
      data_scope: input.data_scope,
      specific_records: input.specific_records || null,
      justification: input.justification?.trim() || null,
      submitted_via: input.submitted_via || 'web',
      ip_address: input.ip_address || null,
      user_agent: input.user_agent || null,
      due_date: dueDate.toISOString(),
      status: 'pending',
      escalation_level: 'tier_1',
      priority: 'normal',
    })
    .select()
    .single()

  if (error) {
    throw new ArcoError(
      `Error creating ARCO request: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  // Create initial history entry
  await createHistoryEntry(data.id, null, 'pending', userId, 'Solicitud creada')

  return data
}

/**
 * Create a history entry for an ARCO request
 *
 * @param requestId - Request ID
 * @param oldStatus - Previous status
 * @param newStatus - New status
 * @param changedBy - User making the change
 * @param reason - Change reason
 */
async function createHistoryEntry(
  requestId: string,
  oldStatus: ArcoRequestStatus | null,
  newStatus: ArcoRequestStatus,
  changedBy: string,
  reason?: string
): Promise<void> {
  const supabase = await createClient()

  await supabase.from('arco_request_history').insert({
    request_id: requestId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: changedBy,
    change_reason: reason || null,
  })
}

// ================================================
// GET REQUEST
// ================================================

/**
 * Get a single ARCO request by ID
 *
 * @param requestId - Request ID
 * @param userId - User ID (for authorization check)
 * @param isAdmin - Whether user is admin
 * @returns Request with details
 */
export async function getArcoRequest(
  requestId: string,
  userId: string,
  isAdmin = false
): Promise<ArcoRequestWithDetails> {
  const supabase = await createClient()

  // Build query based on user role
  let query = supabase.from('arco_requests').select(`
    *,
    user:profiles!arco_requests_user_id_fkey (
      id,
      full_name,
      email,
      phone
    ),
    assignee:profiles!arco_requests_assigned_to_fkey (
      id,
      full_name,
      email
    )
  `)

  if (isAdmin) {
    query = query.eq('id', requestId)
  } else {
    query = query.eq('id', requestId).eq('user_id', userId)
  }

  const { data: request, error } = await query.single()

  if (error || !request) {
    throw new ArcoError(
      'Request not found',
      ArcoErrorCode.REQUEST_NOT_FOUND,
      404
    )
  }

  // Get history
  const { data: history } = await supabase
    .from('arco_request_history')
    .select(`
      *,
      changer:profiles!arco_request_history_changed_by_fkey (
        full_name
      )
    `)
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })

  // Get attachments
  const { data: attachments } = await supabase
    .from('arco_attachments')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

  // Get communications
  const { data: communications } = await supabase
    .from('arco_communications')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

  // Calculate business days
  const businessDaysElapsed = calculateBusinessDays(
    request.created_at,
    new Date()
  )
  const businessDaysRemaining = calculateBusinessDays(
    new Date(),
    request.due_date
  )

  return {
    ...request,
    user_name: request.user?.full_name,
    user_email: request.user?.email,
    user_phone: request.user?.phone,
    assigned_to_name: request.assignee?.full_name,
    business_days_elapsed: businessDaysElapsed,
    business_days_remaining: Math.max(0, businessDaysRemaining),
    is_overdue:
      !['completed', 'denied', 'cancelled'].includes(request.status) &&
      new Date(request.due_date) < new Date(),
    days_until_due: Math.floor(
      (new Date(request.due_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    history: history || [],
    attachments: attachments || [],
    communications: communications || [],
  } as unknown as ArcoRequestWithDetails
}

/**
 * Get all ARCO requests for a user
 *
 * @param userId - User ID
 * @param filter - Optional filter criteria
 * @returns User's ARCO requests
 */
export async function getUserArcoRequests(
  userId: string,
  filter?: Partial<ArcoRequestFilter>
): Promise<ArcoRequestRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('arco_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filter?.request_type) {
    query = query.eq('request_type', filter.request_type)
  }

  if (filter?.status) {
    query = query.eq('status', filter.status)
  }

  const { data, error } = await query

  if (error) {
    throw new ArcoError(
      `Error fetching ARCO requests: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return data || []
}

// ================================================
// UPDATE REQUEST
// ================================================

/**
 * Update an ARCO request (admin only)
 *
 * @param requestId - Request ID
 * @param input - Update data
 * @param adminId - Admin user ID making the update
 * @returns Updated request
 */
export async function updateArcoRequest(
  requestId: string,
  input: UpdateArcoRequestInput,
  adminId: string
): Promise<ArcoRequestRow> {
  const supabase = await createClient()

  // Get current request
  const { data: current, error: fetchError } = await supabase
    .from('arco_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError || !current) {
    throw new ArcoError(
      'Request not found',
      ArcoErrorCode.REQUEST_NOT_FOUND,
      404
    )
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {}
  let statusChanged = false
  let changeReason: string | undefined

  if (input.status && input.status !== current.status) {
    // Validate status transitions
    if (!isValidStatusTransition(current.status, input.status)) {
      throw new ArcoError(
        `Cannot transition from ${current.status} to ${input.status}`,
        ArcoErrorCode.INVALID_STATUS,
        400
      )
    }

    updateData.status = input.status
    statusChanged = true
    changeReason = `Estado cambiado de ${current.status} a ${input.status}`

    // Set timestamps based on status
    if (input.status === 'acknowledged' && !current.acknowledged_at) {
      updateData.acknowledged_at = new Date().toISOString()
    }

    if (
      ['completed', 'denied', 'cancelled'].includes(input.status) &&
      !current.completed_at
    ) {
      updateData.completed_at = new Date().toISOString()
    }
  }

  if (input.assigned_to !== undefined) {
    updateData.assigned_to = input.assigned_to
    if (!changeReason) changeReason = 'Asignado a nuevo miembro del equipo'
  }

  if (input.escalation_level !== undefined) {
    updateData.escalation_level = input.escalation_level
    if (!changeReason) changeReason = 'Nivel de escalación actualizado'
  }

  if (input.priority !== undefined) {
    updateData.priority = input.priority
    if (!changeReason) changeReason = 'Prioridad actualizada'
  }

  if (input.response !== undefined) {
    updateData.response = input.response
    if (!changeReason) changeReason = 'Respuesta agregada'
  }

  if (input.denial_reason !== undefined) {
    updateData.denial_reason = input.denial_reason
    if (!changeReason) changeReason = 'Motivo de denegación agregado'
  }

  if (input.denial_legal_basis !== undefined) {
    updateData.denial_legal_basis = input.denial_legal_basis
  }

  if (Object.keys(updateData).length === 0) {
    return current // No changes
  }

  // Perform update
  const { data: updated, error } = await supabase
    .from('arco_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single()

  if (error) {
    throw new ArcoError(
      `Error updating ARCO request: ${error.message}`,
      ArcoErrorCode.INVALID_STATUS,
      500
    )
  }

  // Create history entry if status changed
  if (statusChanged && input.status) {
    await createHistoryEntry(
      requestId,
      current.status,
      input.status,
      adminId,
      changeReason
    )
  }

  return updated
}

/**
 * Check if a status transition is valid
 *
 * @param currentStatus - Current status
 * @param newStatus - Desired new status
 * @returns True if transition is valid
 */
function isValidStatusTransition(
  currentStatus: ArcoRequestStatus,
  newStatus: ArcoRequestStatus
): boolean {
  const validTransitions: Record<ArcoRequestStatus, ArcoRequestStatus[]> = {
    pending: ['acknowledged', 'cancelled', 'info_required'],
    acknowledged: ['processing', 'escalated', 'cancelled', 'info_required'],
    processing: ['completed', 'denied', 'escalated', 'info_required'],
    info_required: ['processing', 'acknowledged', 'cancelled', 'escalated'],
    escalated: ['processing', 'completed', 'denied', 'info_required'],
    completed: [], // Terminal state
    denied: [], // Terminal state
    cancelled: [], // Terminal state
  }

  return validTransitions[currentStatus]?.includes(newStatus) || false
}

// ================================================
// ADMIN QUERIES
// ================================================

/**
 * Get all ARCO requests with filtering and pagination (admin only)
 *
 * @param filter - Filter criteria
 * @param sort - Sort field
 * @param page - Page number
 * @param perPage - Items per page
 * @returns Paginated ARCO requests
 */
export async function getAllArcoRequests(
  filter: ArcoRequestFilter = {},
  sort: ArcoRequestSort = 'created_at',
  page = 1,
  perPage = DEFAULT_REQUESTS_PER_PAGE
): Promise<PaginatedResponse<ArcoRequestWithDetails>> {
  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('arco_requests')
    .select(`
      *,
      user:profiles!arco_requests_user_id_fkey (
        id,
        full_name,
        email,
        phone
      ),
      assignee:profiles!arco_requests_assigned_to_fkey (
        id,
        full_name,
        email
      )
    `, { count: 'exact' })

  // Apply filters
  if (filter.user_id) {
    query = query.eq('user_id', filter.user_id)
  }

  if (filter.request_type) {
    query = query.eq('request_type', filter.request_type)
  }

  if (filter.status) {
    query = query.eq('status', filter.status)
  }

  if (filter.escalation_level) {
    query = query.eq('escalation_level', filter.escalation_level)
  }

  if (filter.priority) {
    query = query.eq('priority', filter.priority)
  }

  if (filter.assigned_to) {
    query = query.eq('assigned_to', filter.assigned_to)
  }

  if (filter.date_from) {
    query = query.gte('created_at', filter.date_from)
  }

  if (filter.date_to) {
    query = query.lte('created_at', filter.date_to)
  }

  // Calculate pagination
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  // Apply sorting
  const ascending = sort === 'due_date' ? true : false
  query = query.order(sort, { ascending })

  // Apply pagination
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    throw new ArcoError(
      `Error fetching ARCO requests: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  const total = count || 0
  const totalPages = Math.ceil(total / perPage)

  // Calculate business days for each request
  const requestsWithDetails = (data || []).map((request) => {
    const businessDaysElapsed = calculateBusinessDays(
      request.created_at,
      new Date()
    )
    const businessDaysRemaining = calculateBusinessDays(
      new Date(),
      request.due_date
    )

    return {
      ...request,
      user_name: (request.user as any)?.full_name,
      user_email: (request.user as any)?.email,
      user_phone: (request.user as any)?.phone,
      assigned_to_name: (request.assignee as any)?.full_name,
      business_days_elapsed: businessDaysElapsed,
      business_days_remaining: Math.max(0, businessDaysRemaining),
      is_overdue:
        !['completed', 'denied', 'cancelled'].includes(request.status) &&
        new Date(request.due_date) < new Date(),
      days_until_due: Math.floor(
        (new Date(request.due_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    } as unknown as ArcoRequestWithDetails
  })

  return {
    data: requestsWithDetails,
    pagination: {
      total,
      page,
      per_page: perPage,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
    },
  }
}

/**
 * Get overdue ARCO requests (admin only)
 *
 * @returns Overdue requests
 */
export async function getOverdueRequests(): Promise<ArcoRequestRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('arco_requests')
    .select('*')
    .not('status', 'in', '("completed","denied","cancelled")')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    throw new ArcoError(
      `Error fetching overdue requests: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return data || []
}

/**
 * Get pending ARCO requests (admin only)
 *
 * @returns Pending requests
 */
export async function getPendingRequests(): Promise<ArcoRequestRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('arco_requests')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    throw new ArcoError(
      `Error fetching pending requests: ${error.message}`,
      ArcoErrorCode.INVALID_REQUEST_TYPE,
      500
    )
  }

  return data || []
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

