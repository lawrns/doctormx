/**
 * ARCO Request Detail API Routes
 *
 * GET    /api/arco/requests/[id] - Obtener detalle de una solicitud ARCO
 * PUT    /api/arco/requests/[id] - Actualizar solicitud (admin only)
 * DELETE /api/arco/requests/[id] - Cancelar solicitud (solo usuario, si no está completada)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getArcoRequest, 
  updateArcoRequest, 
  getArcoRequestTemplate 
} from '@/lib/arco'
import { ArcoError, type ArcoRequestStatus, type UpdateArcoRequestInput } from '@/types/arco'
import { logger } from '@/lib/observability/logger'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Validation schema for updating ARCO requests
const updateRequestSchema = z.object({
  status: z.enum(['pending', 'acknowledged', 'processing', 'info_required', 'escalated', 'completed', 'denied', 'cancelled']).optional(),
  assigned_to: z.string().uuid().optional(),
  escalation_level: z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  response: z.string().max(5000).optional(),
  denial_reason: z.string().max(1000).optional(),
  denial_legal_basis: z.string().max(500).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
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
 * GET /api/arco/requests/[id]
 *
 * Obtener detalles de una solicitud ARCO específica
 *
 * Path params:
 * - id: UUID de la solicitud
 *
 * Response:
 * - request: ArcoRequestWithDetails - datos completos de la solicitud
 * - template: información del template usado
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' } },
      { status: 401 }
    )
  }

  try {
    const { id: requestId } = await params

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_ID', message: 'ID de solicitud requerido' } },
        { status: 400 }
      )
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(supabase, user.id)

    // Get request details
    const arcoRequest = await getArcoRequest(requestId, user.id, userIsAdmin)

    // Get template info
    const template = getArcoRequestTemplate(arcoRequest.request_type)

    return NextResponse.json({
      success: true,
      data: {
        request: arcoRequest,
        template: {
          title: template.title,
          description: template.description,
          default_data_scope: template.defaultDataScope,
        },
      },
    })

  } catch (error) {
    logger.error('Error fetching ARCO request details:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener los detalles de la solicitud' } },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/arco/requests/[id]
 *
 * Actualizar una solicitud ARCO (solo administradores)
 *
 * Body:
 * - status: ArcoRequestStatus - nuevo estado
 * - assigned_to: string - ID del usuario asignado
 * - escalation_level: EscalationLevel - nivel de escalación
 * - priority: ArcoPriority - prioridad
 * - response: string - respuesta al usuario
 * - denial_reason: string - motivo de denegación
 * - denial_legal_basis: string - base legal de denegación
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' } },
      { status: 401 }
    )
  }

  // Verify admin role
  const userIsAdmin = await isAdmin(supabase, user.id)
  if (!userIsAdmin) {
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Solo administradores pueden actualizar solicitudes' } },
      { status: 403 }
    )
  }

  try {
    const { id: requestId } = await params

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_ID', message: 'ID de solicitud requerido' } },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate request body
    const validationResult = updateRequestSchema.safeParse(body)
    
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

    const updateData: UpdateArcoRequestInput = validationResult.data

    // Update the request
    const updatedRequest = await updateArcoRequest(requestId, updateData, user.id)

    return NextResponse.json({
      success: true,
      data: {
        request: updatedRequest,
        message: 'Solicitud actualizada exitosamente',
      },
    })

  } catch (error) {
    logger.error('Error updating ARCO request:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al actualizar la solicitud' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/arco/requests/[id]
 *
 * Cancelar una solicitud ARCO (solo el usuario que la creó)
 * Solo se puede cancelar si la solicitud no está completada ni denegada
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Se requiere autenticación' } },
      { status: 401 }
    )
  }

  try {
    const { id: requestId } = await params

    if (!requestId) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_ID', message: 'ID de solicitud requerido' } },
        { status: 400 }
      )
    }

    // Get the request to verify ownership and status
    const { data: existingRequest, error: fetchError } = await supabase
      .from('arco_requests')
      .select('user_id, status')
      .eq('id', requestId)
      .single()

    if (fetchError || !existingRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Solicitud no encontrada' } },
        { status: 404 }
      )
    }

    // Verify ownership (only the user who created it can cancel it)
    if (existingRequest.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'No tienes permiso para cancelar esta solicitud' } },
        { status: 403 }
      )
    }

    // Check if request can be cancelled (not completed or denied)
    const terminalStatuses = ['completed', 'denied', 'cancelled']
    if (terminalStatuses.includes(existingRequest.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'CANNOT_CANCEL', 
            message: `No se puede cancelar una solicitud que ya está ${existingRequest.status}` 
          } 
        },
        { status: 400 }
      )
    }

    // Cancel the request by updating status
    const { data: cancelledRequest, error: updateError } = await supabase
      .from('arco_requests')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      throw new ArcoError(
        `Error cancelling request: ${updateError.message}`,
        'INTERNAL_ERROR',
        500
      )
    }

    // Create history entry
    await supabase.from('arco_request_history').insert({
      request_id: requestId,
      old_status: existingRequest.status,
      new_status: 'cancelled',
      changed_by: user.id,
      change_reason: 'Solicitud cancelada por el usuario',
    })

    return NextResponse.json({
      success: true,
      data: {
        request: cancelledRequest,
        message: 'Solicitud cancelada exitosamente',
      },
    })

  } catch (error) {
    logger.error('Error cancelling ARCO request:', { err: error, userId: user.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al cancelar la solicitud' } },
      { status: 500 }
    )
  }
}
