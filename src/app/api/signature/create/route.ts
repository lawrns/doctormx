/**
 * POST /api/signature/create
 *
 * Crea una firma digital para un documento médico.
 * Usa el sistema de firma simple (sin certificado X.509 completo).
 *
 * @body {CreateSignatureRequest} Datos para crear la firma
 * @returns {SignatureResponse} Firma creada con hash de verificación
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  createSignatureRequest,
  signDocument,
  storeSignature,
} from '@/lib/digital-signature'
import { logger } from '@/lib/observability/logger'

// Esquema de validación Zod para crear firma
const CreateSignatureSchema = z.object({
  documentId: z.string().uuid('documentId debe ser un UUID válido'),
  documentType: z.string().min(1, 'documentType es requerido'),
  documentContent: z.string().min(1, 'documentContent es requerido'),
  userId: z.string().uuid('userId debe ser un UUID válido'),
  userName: z.string().min(1, 'userName es requerido'),
  userRfc: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

type CreateSignatureRequest = z.infer<typeof CreateSignatureSchema>

// Response types
interface SignatureResponse {
  success: boolean
  message: string
  data: {
    signature: {
      id: string
      documentId: string
      documentType: string
      userId: string
      userName: string
      signedAt: string
      documentHash: string
      signatureValue: string
      algorithm: string
    }
    verificationHash: string
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
          message: 'Se requiere autenticación para crear firmas digitales',
        },
        { status: 401 }
      )
    }

    // Parsear y validar el body
    const body = await request.json()
    const validationResult = CreateSignatureSchema.safeParse(body)

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

    // Verificar que el usuario autenticado coincide con el userId proporcionado
    // o que es un administrador
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Perfil de usuario no encontrado',
        },
        { status: 404 }
      )
    }

    // Solo el propio usuario o un admin puede crear firmas
    if (user.id !== data.userId && profile.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para crear firmas para otro usuario',
        },
        { status: 403 }
      )
    }

    // Obtener IP y User Agent para auditoría
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     null
    const userAgent = request.headers.get('user-agent') || null

    // Crear solicitud de firma
    const signatureRequest = createSignatureRequest(
      data.documentId,
      data.documentType,
      data.documentContent,
      data.userId,
      data.userName,
      72 // 72 horas de validez por defecto
    )

    // Firmar el documento
    const signature = await signDocument(
      signatureRequest,
      data.userRfc || null,
      ipAddress,
      userAgent
    )

    // Añadir metadata adicional si se proporcionó
    if (data.metadata) {
      signature.metadata = {
        ...signature.metadata,
        ...data.metadata,
      }
    }

    // Almacenar la firma en la base de datos
    const storedSignature = await storeSignature(signature)

    logger.info('Digital signature created', {
      signatureId: storedSignature.id,
      documentId: data.documentId,
      documentType: data.documentType,
      userId: data.userId,
    })

    // Respuesta exitosa
    const response: SignatureResponse = {
      success: true,
      message: 'Firma digital creada exitosamente',
      data: {
        signature: {
          id: storedSignature.id,
          documentId: storedSignature.document_id,
          documentType: storedSignature.document_type,
          userId: storedSignature.user_id,
          userName: storedSignature.user_name,
          signedAt: storedSignature.signed_at,
          documentHash: storedSignature.document_hash,
          signatureValue: storedSignature.signature_value,
          algorithm: storedSignature.algorithm,
        },
        verificationHash: storedSignature.document_hash,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error creating digital signature:', { err: error }, error as Error)

    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes('ha expirado')) {
        return NextResponse.json(
          {
            error: 'Signature Request Expired',
            message: error.message,
          },
          { status: 400 }
        )
      }

      if (error.message.includes('no encontrado')) {
        return NextResponse.json(
          {
            error: 'Resource Not Found',
            message: error.message,
          },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al crear la firma digital',
      },
      { status: 500 }
    )
  }
}
