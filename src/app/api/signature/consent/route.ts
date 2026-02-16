/**
 * POST /api/signature/consent
 *
 * Firma un documento de consentimiento usando el sistema de firma digital.
 * Integra con la tabla user_consent_records para actualizar el registro.
 *
 * @body {ConsentSignatureRequest} Datos del consentimiento a firmar
 * @returns {ConsentSignatureResponse} Consentimiento firmado con datos de firma
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { signConsentDocument } from '@/lib/digital-signature'
import { logger } from '@/lib/observability/logger'

// Esquema de validación Zod para firmar consentimiento
const ConsentSignatureSchema = z.object({
  consentId: z.string().uuid('consentId debe ser un UUID válido'),
  userId: z.string().uuid('userId debe ser un UUID válido'),
  consentType: z.string().min(1, 'consentType es requerido'),
  consentVersion: z.string().min(1, 'consentVersion es requerido'),
  termsAccepted: z.boolean().default(true),
})

type ConsentSignatureRequest = z.infer<typeof ConsentSignatureSchema>

// Response types
interface ConsentSignatureResponse {
  success: boolean
  message: string
  data: {
    consentId: string
    signatureId: string
    signedAt: string
    documentHash: string
    signerName: string
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
          message: 'Se requiere autenticación para firmar consentimientos',
        },
        { status: 401 }
      )
    }

    // Parsear y validar el body
    const body = await request.json()
    const validationResult = ConsentSignatureSchema.safeParse(body)

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

    // Solo el propio usuario o un admin puede firmar consentimientos
    if (user.id !== data.userId && profile.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'No tienes permiso para firmar consentimientos para otro usuario',
        },
        { status: 403 }
      )
    }

    // Verificar que el consentimiento existe y pertenece al usuario
    const { data: consentRecord, error: consentError } = await supabase
      .from('user_consent_records')
      .select('*')
      .eq('id', data.consentId)
      .single()

    if (consentError || !consentRecord) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Registro de consentimiento no encontrado',
        },
        { status: 404 }
      )
    }

    // Verificar que el consentimiento pertenezca al usuario
    if (consentRecord.user_id !== data.userId && profile.role !== 'admin') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'El consentimiento no pertenece al usuario especificado',
        },
        { status: 403 }
      )
    }

    // Verificar que el usuario aceptó los términos
    if (!data.termsAccepted) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'El usuario debe aceptar los términos para firmar',
        },
        { status: 400 }
      )
    }

    // Obtener IP y User Agent para auditoría
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     null
    const userAgent = request.headers.get('user-agent') || null

    // Firmar el documento de consentimiento
    const signature = await signConsentDocument(
      data.userId,
      data.consentId,
      data.consentType,
      data.consentVersion,
      ipAddress,
      userAgent
    )

    logger.info('Consent document signed', {
      consentId: data.consentId,
      userId: data.userId,
      signatureId: signature.id,
      consentType: data.consentType,
    })

    // Respuesta exitosa
    const response: ConsentSignatureResponse = {
      success: true,
      message: 'Consentimiento firmado exitosamente',
      data: {
        consentId: data.consentId,
        signatureId: signature.id,
        signedAt: signature.signed_at,
        documentHash: signature.document_hash,
        signerName: signature.user_name,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error signing consent document:', { err: error }, error as Error)

    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes('no encontrado')) {
        return NextResponse.json(
          {
            error: 'Resource Not Found',
            message: error.message,
          },
          { status: 404 }
        )
      }

      if (error.message.includes('expirado')) {
        return NextResponse.json(
          {
            error: 'Signature Request Expired',
            message: error.message,
          },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Error al firmar el documento de consentimiento',
      },
      { status: 500 }
    )
  }
}
