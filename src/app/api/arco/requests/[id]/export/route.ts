/**
 * ARCO Data Export API Route
 *
 * GET /api/arco/requests/[id]/export - Exportar datos para solicitudes de acceso ARCO
 *
 * Soporta formatos: JSON, TXT (machine-readable), CSV
 * Solo funciona para solicitudes de tipo ACCESO y estado COMPLETED
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  exportUserDataToJson, 
  exportUserDataToText,
} from '@/lib/arco/export'
import { 
  exportPortabilityJson 
} from '@/lib/arco/export/portability'
import { ArcoError } from '@/types/arco'
import { logger } from '@/lib/observability/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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
 * GET /api/arco/requests/[id]/export
 *
 * Exportar datos para solicitudes de tipo ACCESO
 *
 * Query params:
 * - format: 'json' | 'txt' | 'portability' - formato de exportación (default: 'json')
 * - download: boolean - si se debe descargar como archivo (default: true)
 *
 * Restricciones:
 * - Solo solicitudes de tipo ACCESO
 * - Solo solicitudes en estado COMPLETED
 * - Solo el propietario de la solicitud o admin pueden exportar
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

    // Get the request details
    const { data: arcoRequest, error: requestError } = await supabase
      .from('arco_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (requestError || !arcoRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Solicitud no encontrada' } },
        { status: 404 }
      )
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin(supabase, user.id)

    // Verify ownership (only owner or admin can export)
    if (arcoRequest.user_id !== user.id && !userIsAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'No tienes permiso para exportar estos datos' } },
        { status: 403 }
      )
    }

    // Verify request type is ACCESS
    if (arcoRequest.request_type !== 'ACCESS') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_REQUEST_TYPE', 
            message: 'La exportación solo está disponible para solicitudes de tipo ACCESO' 
          } 
        },
        { status: 400 }
      )
    }

    // Verify request status is COMPLETED
    if (arcoRequest.status !== 'completed') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'REQUEST_NOT_COMPLETED', 
            message: `La exportación solo está disponible para solicitudes completadas. Estado actual: ${arcoRequest.status}` 
          } 
        },
        { status: 400 }
      )
    }

    // Get format from query params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') ?? 'json'
    const download = searchParams.get('download') !== 'false' // default: true

    // Validate format
    const validFormats = ['json', 'txt', 'portability']
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_FORMAT', 
            message: `Formato no válido. Opciones: ${validFormats.join(', ')}` 
          } 
        },
        { status: 400 }
      )
    }

    const userId = arcoRequest.user_id
    const scope = arcoRequest.data_scope

    let content: string
    let filename: string
    let contentType: string
    const timestamp = new Date().toISOString().split('T')[0]

    switch (format) {
      case 'json':
        content = await exportUserDataToJson(userId, scope)
        filename = `arco_datos_${userId.slice(0, 8)}_${timestamp}.json`
        contentType = 'application/json'
        break

      case 'txt':
        content = await exportUserDataToText(userId, scope)
        filename = `arco_datos_${userId.slice(0, 8)}_${timestamp}.txt`
        contentType = 'text/plain'
        break

      case 'portability':
        content = await exportPortabilityJson(userId)
        filename = `arco_portabilidad_${userId.slice(0, 8)}_${timestamp}.json`
        contentType = 'application/json'
        break

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_FORMAT', message: 'Formato no soportado' } },
          { status: 400 }
        )
    }

    // Return as file download or JSON response
    if (download) {
      return new NextResponse(content, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } else {
      // Return as JSON response with metadata
      return NextResponse.json({
        success: true,
        data: {
          format,
          filename,
          request_id: requestId,
          user_id: userId,
          exported_at: new Date().toISOString(),
          content: format === 'json' || format === 'portability' ? JSON.parse(content) : content,
        },
      })
    }

  } catch (error) {
    logger.error('Error exporting ARCO data:', { err: error, userId: user?.id })
    
    if (error instanceof ArcoError) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al exportar los datos' } },
      { status: 500 }
    )
  }
}
