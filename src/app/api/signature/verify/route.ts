/**
 * POST /api/signature/verify
 *
 * Verifica una firma digital existente.
 * Comprueba la integridad del documento y la validez de la firma.
 *
 * @body {VerifySignatureRequest} Datos para verificar la firma
 * @returns {VerifySignatureResponse} Resultado de verificación con detalles
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { verifySignature, getSignatureByDocument } from '@/lib/digital-signature'
import { logger } from '@/lib/observability/logger'

// Esquema de validación Zod para verificar firma
const VerifySignatureSchema = z.object({
  signatureId: z.string().uuid('signatureId debe ser un UUID válido').optional(),
  documentId: z.string().uuid('documentId debe ser un UUID válido').optional(),
  originalContent: z.string().min(1, 'originalContent es requerido para verificar la integridad'),
})

type VerifySignatureRequest = z.infer<typeof VerifySignatureSchema>

// Response types
interface VerifySignatureResponse {
  success: boolean
  message: string
  data: {
    valid: boolean
    verifiedAt: string
    details: {
      hashValid: boolean
      signatureValid: boolean
      isExpired: boolean
      documentHash: string
      expectedHash: string
      signerUserId: string
      signingTimestamp: string
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Se requiere autenticación para verificar firmas',
        },
        { status: 401 }
      )
    }

    // Parsear y validar el body
    const body = await request.json()
    const validationResult = VerifySignatureSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Datos de entrada inválidos',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Se debe proporcionar signatureId o documentId
    if (!data.signatureId && !data.documentId) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Debe proporcionar signatureId o documentId',
        },
        { status: 400 }
      )
    }

    // Obtener la firma
    let signature
    if (data.signatureId) {
      // Buscar por ID de firma directamente
      const { data: sig, error } = await supabase
        .from('digital_signatures')
        .select('*')
        .eq('id', data.signatureId)
        .single()

      if (error || !sig) {
        return NextResponse.json(
          {
            error: 'Not Found',
            message: 'Firma no encontrada',
          },
          { status: 404 }
        )
      }
      signature = sig
    } else {
      // Buscar por ID de documento
      signature = await getSignatureByDocument(data.documentId!)

      if (!signature) {
        return NextResponse.json(
          {
            error: 'Not Found',
            message: 'No se encontró firma para el documento especificado',
          },
          { status: 404 }
        )
      }
    }

    // Verificar permisos: el usuario debe ser el firmante o un admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    const canVerify = user.id === signature.user_id || profile?.role === 'admin'

    if (!canVerify) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para verificar esta firma',
        },
        { status: 403 }
      )
    }

    // Realizar verificación de la firma
    const verificationResult = verifySignature(signature, data.originalContent)

    logger.info('Signature verification completed', {
      signatureId: signature.id,
      isValid: verificationResult.is_valid,
      hashValid: verificationResult.hash_valid,
      signatureValid: verificationResult.signature_valid,
      isExpired: verificationResult.is_expired,
      userId: user.id,
    })

    // Respuesta exitosa
    const response: VerifySignatureResponse = {
      success: true,
      message: verificationResult.is_valid
        ? 'Firma válida e íntegra'
        : 'La firma no pudo ser verificada',
      data: {
        valid: verificationResult.is_valid,
        verifiedAt: verificationResult.verified_at,
        details: {
          hashValid: verificationResult.hash_valid,
          signatureValid: verificationResult.signature_valid,
          isExpired: verificationResult.is_expired,
          documentHash: verificationResult.details.document_hash,
          expectedHash: verificationResult.details.expected_hash,
          signerUserId: verificationResult.details.signer_user_id,
          signingTimestamp: verificationResult.details.signing_timestamp,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error verifying signature:', { err: error }, error as Error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al verificar la firma digital',
      },
      { status: 500 }
    )
  }
}
