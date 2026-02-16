/**
 * ARCO Data Export API Route
 *
 * GET /api/arco/export - Exportar datos del usuario (Derecho de Acceso)
 *
 * Este endpoint permite a los usuarios exportar sus datos personales
 * en formato JSON o texto plano, implementando el derecho de acceso ARCO.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  exportUserDataToJson,
  exportUserDataToText,
  getUserDataExport,
  type DataTableScope,
} from '@/lib/arco'
import { ArcoError } from '@/types/arco'
import { logger } from '@/lib/observability/logger'
import { z } from 'zod'

// Validation schema for export request
const exportSchema = z.object({
  format: z.enum(['json', 'text', 'pdf']).default('json'),
  scope: z.array(z.enum(['profiles', 'appointments', 'prescriptions', 'soap_consultations', 'chat_conversations', 'chat_messages', 'payments', 'follow_up_schedules', 'all'])).default(['all']),
})

/**
 * GET /api/arco/export
 *
 * Exportar datos personales del usuario
 *
 * Query params:
 * - format: 'json' | 'text' | 'pdf' - formato de exportación (default: 'json')
 * - scope: string[] - tablas a incluir (default: ['all'])
 *
 * Response:
 * - Para JSON: objeto con los datos exportados
 * - Para TEXT: texto plano con los datos formateados
 * - Para PDF: archivo PDF descargable (no implementado aún)
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
    
    // Parse and validate query params
    const format = (searchParams.get('format') as 'json' | 'text' | 'pdf') || 'json'
    const scopeParam = searchParams.get('scope')
    let scope: DataTableScope[] = ['all']
    
    if (scopeParam) {
      try {
        scope = JSON.parse(scopeParam) as DataTableScope[]
      } catch {
        scope = scopeParam.split(',') as DataTableScope[]
      }
    }

    // Validate parameters
    const validationResult = exportSchema.safeParse({ format, scope })
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Parámetros de exportación inválidos',
            details: validationResult.error.issues,
          } 
        },
        { status: 400 }
      )
    }

    // Handle different export formats
    switch (format) {
      case 'json': {
        const dataPackage = await getUserDataExport(user.id, scope)
        
        return NextResponse.json({
          success: true,
          data: {
            export: dataPackage,
            format: 'json',
            generated_at: new Date().toISOString(),
          },
          meta: {
            total_records: dataPackage.export_metadata.total_records,
            data_scope: scope,
            user_id: user.id,
          },
        })
      }

      case 'text': {
        const textContent = await exportUserDataToText(user.id, scope)
        
        return new NextResponse(textContent, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="datos_personales_${user.id.slice(0, 8)}.txt"`,
          },
        })
      }

      case 'pdf': {
        // PDF export is not yet implemented
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'NOT_IMPLEMENTED', 
              message: 'La exportación en formato PDF aún no está disponible. Por favor use JSON o texto plano.' 
            } 
          },
          { status: 501 }
        )
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_FORMAT', message: 'Formato de exportación no válido' } },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Error exporting user data:', { err: error, userId: user.id })
    
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

/**
 * POST /api/arco/export
 *
 * Exportar datos personales del usuario (método POST para enviar scope complejo)
 *
 * Body:
 * - format: 'json' | 'text' | 'pdf' - formato de exportación
 * - scope: string[] - tablas a incluir
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
    
    // Validate request body
    const validationResult = exportSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Datos de entrada inválidos',
            details: validationResult.error.issues,
          } 
        },
        { status: 400 }
      )
    }

    const { format, scope } = validationResult.data

    // Handle different export formats
    switch (format) {
      case 'json': {
        const dataPackage = await getUserDataExport(user.id, scope)
        
        return NextResponse.json({
          success: true,
          data: {
            export: dataPackage,
            format: 'json',
            generated_at: new Date().toISOString(),
          },
          meta: {
            total_records: dataPackage.export_metadata.total_records,
            data_scope: scope,
            user_id: user.id,
          },
        })
      }

      case 'text': {
        const textContent = await exportUserDataToText(user.id, scope)
        
        return new NextResponse(textContent, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Content-Disposition': `attachment; filename="datos_personales_${user.id.slice(0, 8)}.txt"`,
          },
        })
      }

      case 'pdf': {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'NOT_IMPLEMENTED', 
              message: 'La exportación en formato PDF aún no está disponible. Por favor use JSON o texto plano.' 
            } 
          },
          { status: 501 }
        )
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_FORMAT', message: 'Formato de exportación no válido' } },
          { status: 400 }
        )
    }

  } catch (error) {
    logger.error('Error exporting user data:', { err: error, userId: user.id })
    
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
