/**
 * ARCO Requests API Routes
 *
 * GET /api/arco/requests - Listar solicitudes ARCO (usuario o admin)
 * POST /api/arco/requests - Crear nueva solicitud ARCO
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createArcoRequest,
  getUserArcoRequests,
  getAllArcoRequests,
  getArcoRequestTemplate,
  isValidDataScope,
  ARCO_TYPE_DESCRIPTIONS,
  type CreateArcoRequestInput,
  type ArcoRequestType,
} from '@/lib/arco'
import type { ArcoRequestStatus, ArcoRequestFilter } from '@/types/arco'
import { ArcoError } from '@/types/arco'
import { logger } from '@/lib/observability/logger'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Validation schema for creating ARCO requests
const createRequestSchema = z.object({
  request_type: z.enum(['ACCESS', 'RECTIFY', 'CANCEL', 'OPPOSE']),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  data_scope: z.array(z.enum(['profiles', 'appointments', 'prescriptions', 'soap_consultations', 'chat_conversations', 'chat_messages', 'payments', 'follow_up_schedules', 'all'])),
  specific_records: z.array(z.string()).optional(),
  justification: z.string().max(1000).optional(),
})

/**
 * Helper function to check if user is admin
 */
async function isAdmin(supabase: Awaited<ReturnType<typeof createClient>>, userId: string): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role === 'admin'
}

/**
 * GET /api/arco/requests
 *
 * Listar solicitudes ARCO del usuario autenticado (o todas para admin)
 *
 * Query params:
 * - request_type: 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE' - filtrar por tipo
 * - status: 'pending' | 'acknowledged' | 'processing' | 'completed' | 'denied' | 'cancelled' - filtrar por estado
 * - page: number - página para paginación (solo admin)
 * - per_page: number - items por página (solo admin, default: 20)
 * - sort: 'created_at' | 'due_date' | 'status' | 'priority' | 'request_type' - ordenamiento
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' } },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const userIsAdmin = await isAdmin(supabase, user.id)

    // Build filter from query params
    const filter: ArcoRequestFilter = {}
    
    const requestType = searchParams.get('request_type')
    if (requestType && ['ACCESS', 'RECTIFY', 'CANCEL', 'OPPOSE'].includes(requestType)) {
      filter.request_type = requestType as ArcoRequestType
    }

    const status = searchParams.get('status')
    const validStatuses = ['pending', 'acknowledged', 'processing', 'info_required', 'escalated', 'completed', 'denied', 'cancelled']
    if (status && validStatuses.includes(status)) {
      filter.status = status as ArcoRequestStatus
    }

    // If admin and user_id provided, filter by that user
    const targetUserId = searchParams.get('user_id')
    if (userIsAdmin && targetUserId) {
      filter.user_id = targetUserId
    }

    // Pagination params (admin only)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('per_page') || '20', 10)
    const sort = (searchParams.get('sort') || 'created_at') as 'created_at' | 'due_date' | 'status' | 'priority' | 'request_type'

    let response

    if (userIsAdmin) {
      // Admin: get all requests with pagination
      const result = await getAllArcoRequests(filter, sort, page, perPage)
      response = {
        success: true,
        data: {
          requests: result.data,
          pagination: result.pagination,
        },
      }
    } else {
      // Regular user: get only their requests
      const requests = await getUserArcoRequests(user.id, filter)
      response = {
        success: true,
        data: {
          requests,
          count: requests.length,
        },
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    logger.error('Error fetching ARCO requests:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las solicitudes' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/arco/requests
 *
 * Crear una nueva solicitud ARCO
 *
 * Body:
 * - request_type: 'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE'
 * - title: string
 * - description: string
 * - data_scope: string[] - tablas afectadas
 * - specific_records?: string[] - registros específicos (opcional)
 * - justification?: string - justificación adicional (opcional)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' } },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()

    // Validate request body with Zod
    const validationResult = createRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Datos de entrada inválidos',
            details: errors,
          } 
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Validate data scope
    if (!isValidDataScope(data.data_scope)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_DATA_SCOPE', 
            message: 'El alcance de datos especificado no es válido' 
          } 
        },
        { status: 400 }
      )
    }

    // Get request headers for metadata
    const headers = request.headers
    const userAgent = headers.get('user-agent') || undefined
    const forwardedFor = headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : undefined

    // Prepare input
    const input: CreateArcoRequestInput = {
      request_type: data.request_type,
      title: data.title,
      description: data.description,
      data_scope: data.data_scope,
      specific_records: data.specific_records,
      justification: data.justification,
      submitted_via: 'web',
      ip_address: ipAddress,
      user_agent: userAgent,
    }

    // Create the request
    const arcoRequest = await createArcoRequest(user.id, input)

    // Get template info for response
    const template = getArcoRequestTemplate(data.request_type)

    return NextResponse.json({
      success: true,
      data: {
        request: arcoRequest,
        message: `Solicitud de ${template.title} creada exitosamente`,
        description: template.description,
        due_date: arcoRequest.due_date,
        sla_days: 20,
      },
    }, { status: 201 })

  } catch (error) {
    logger.error('Error creating ARCO request:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Datos de entrada inválidos',
            details: error.issues,
          } 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al crear la solicitud' } },
      { status: 500 }
    )
  }
}
