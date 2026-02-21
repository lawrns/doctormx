import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { getPrescriptionPDF, markAsSent } from '@/lib/prescriptions'
import { Resend } from 'resend'
import { logger } from '@/lib/observability/logger'

// Lazy initialization of Resend client
let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (resend) return resend
  
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    logger.warn('Resend API key is missing; prescription emails will be skipped.')
    return null
  }
  
  resend = new Resend(apiKey)
  return resend
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, supabase } = await requireRole('doctor')
    const { id } = await params

    const { data: prescription } = await supabase
      .from('prescriptions')
      .select(`
        *,
        appointment:appointments (
          doctor_id,
          patient:profiles!appointments_patient_id_fkey (full_name, email)
        )
      `)
      .eq('id', id)
      .single()

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 })
    }

    const appointment = Array.isArray(prescription.appointment) ? prescription.appointment[0] : prescription.appointment
    if (appointment.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const patient = Array.isArray(appointment.patient) ? appointment.patient[0] : appointment.patient
    const patientEmail = patient.email
    const patientName = patient.full_name

    if (!patientEmail) {
      return NextResponse.json(
        { error: 'Patient email not found' },
        { status: 400 }
      )
    }

    const pdfBuffer = await getPrescriptionPDF(id)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.com.mx'
    const verificationUrl = `${appUrl}/verify-prescription/${id}`

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu Receta Médica - Doctor.mx</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px 40px; background-color: #0066cc; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Doctor.mx</h1>
                    <p style="margin: 10px 0 0 0; color: #ffffff; opacity: 0.9; font-size: 14px;">Tu plataforma de telemedicina</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">Hola ${patientName},</p>
                    <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
                      Tu médico te ha enviado una receta médica. Adjunto encontrarás el PDF con todos los detalles de tu tratamiento.
                    </p>
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f0f9ff; border-radius: 6px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px; text-align: center;">
                          <p style="margin: 0 0 12px 0; color: #0369a1; font-size: 14px; font-weight: 600;">📄 Tu receta médica está adjunta</p>
                          <p style="margin: 0; color: #6b7280; font-size: 12px;">Puedes verificar la autenticidad de tu receta en: <a href="${verificationUrl}" style="color: #0066cc;">${verificationUrl}</a></p>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.5;">
                      Guarda este documento en un lugar seguro. Si tienes alguna pregunta sobre tu tratamiento, no dudes en contactar a tu médico.
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      ¿Tienes preguntas? Contáctanos en <a href="mailto:soporte@doctory.com.mx" style="color: #0066cc; text-decoration: none;">soporte@doctory.com.mx</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 40px 40px 40px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                      © ${new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    const client = getResendClient()
    let emailId: string | undefined
    
    if (!client) {
      logger.warn('Prescription email skipped (no Resend API key): ${id}')
      // Continue without sending email
    } else {
      const emailResult = await client.emails.send({
        from: 'Doctor.mx <noreply@doctory.com.mx>',
        to: [patientEmail],
        subject: 'Tu Receta Médica - Doctor.mx',
        html: emailHtml,
        attachments: [
          {
            filename: `receta-${id.slice(0, 8)}.pdf`,
            content: Buffer.from(pdfBuffer).toString('base64'),
          },
        ],
      })

      if (emailResult.error) {
        logger.error('Failed to send email:', { err: emailResult.error })
        return NextResponse.json(
          { error: 'Failed to send prescription email' },
          { status: 500 }
        )
      }
      
      emailId = emailResult.data?.id
    }

    await markAsSent(id)

    return NextResponse.json({
      success: true,
      message: 'Prescription sent successfully',
      emailId,
    })
  } catch (error) {
    logger.error('Error sending prescription:', { err: error })
    return NextResponse.json(
      { error: 'Failed to send prescription' },
      { status: 500 }
    )
  }
}
