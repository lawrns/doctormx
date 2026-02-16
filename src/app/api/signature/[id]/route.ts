/**
 * GET /api/signature/[id]
 *
 * Obtiene una firma digital por su ID.
 * Incluye metadatos completos para auditoría y verificación.
 *
 * @param id - UUID de la firma
 * @returns {GetSignatureResponse} Firma completa con metadatos
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'

// Response types
interface GetSignatureResponse {
  success: boolean
  message: string
  data?: {
    signature: {
      id: string
      documentId: string
      documentType: string
      userId: string
      userName: string
      userRfc: string | null
      ipAddress: string | null
      userAgent: string | null
      signedAt: string
      documentHash: string
      signatureValue: string
      algorithm: string
      termsAccepted: boolean
      metadata: Record<string, unknown> | null
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Se requiere autenticación para obtener firmas',
        },
        { status: 401 }
      )
    }

    // Obtener el ID de la firma
    const { id } = await params

    // Validar que sea un UUID válido
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'ID de firma inválido. Debe ser un UUID válido',
        },
        { status: 400 }
      )
    }

    // Obtener la firma
    const { data: signature, error } = await supabase
      .from('digital_signatures')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !signature) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Firma no encontrada',
        },
        { status: 404 }
      )
    }

    // Verificar permisos: el usuario debe ser el firmante o un admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    const canView = user.id === signature.user_id || profile?.role === 'admin'

    if (!canView) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para ver esta firma',
        },
        { status: 403 }
      )
    }

    logger.info('Signature retrieved', {
      signatureId: signature.id,
      documentId: signature.document_id,
      userId: user.id,
    })

    // Respuesta exitosa
    const response: GetSignatureResponse = {
      success: true,
      message: 'Firma obtenida exitosamente',
      data: {
        signature: {
          id: signature.id,
          documentId: signature.document_id,
          documentType: signature.document_type,
          userId: signature.user_id,
          userName: signature.user_name,
          userRfc: signature.user_rfc,
          ipAddress: signature.ip_address,
          userAgent: signature.user_agent,
          signedAt: signature.signed_at,
          documentHash: signature.document_hash,
          signatureValue: signature.signature_value,
          algorithm: signature.algorithm,
          termsAccepted: signature.terms_accepted,
          metadata: signature.metadata,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error retrieving signature:', { err: error }, error as Error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al obtener la firma digital',
      },
      { status: 500 }
    )
  }
}
