import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { generateAndStorePDF, markAsSent } from '@/lib/prescriptions'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await requireRole('doctor')

    const { appointmentId, diagnosis, medications, instructions } = await request.json()

    if (!appointmentId || !diagnosis || !medications || medications.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:profiles!appointments_patient_id_fkey (full_name, date_of_birth, email),
        doctor:doctors!appointments_doctor_id_fkey (
          *,
          profile:profiles!doctors_id_fkey (full_name)
        )
      `)
      .eq('id', appointmentId)
      .eq('doctor_id', user.id)
      .single()

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const patient = Array.isArray(appointment.patient) ? appointment.patient[0] : appointment.patient
    // const doctor = Array.isArray(appointment.doctor) ? appointment.doctor[0] : appointment.doctor

    const patientEmail = patient.email
    const patientName = patient.full_name

    if (!patientEmail) {
      return NextResponse.json(
        { error: 'Patient email not found' },
        { status: 400 }
      )
    }

    const { data: existingPrescription } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('appointment_id', appointmentId)
      .single()

    let prescriptionId = existingPrescription?.id

    if (!prescriptionId) {
      const { data: newPrescription, error: insertError } = await supabase
        .from('prescriptions')
        .insert({
          appointment_id: appointmentId,
          diagnosis,
          medications: JSON.stringify(medications),
          instructions: instructions || '',
        })
        .select()
        .single()

      if (insertError) throw insertError
      prescriptionId = newPrescription.id
    } else {
      await supabase
        .from('prescriptions')
        .update({
          diagnosis,
          medications: JSON.stringify(medications),
          instructions: instructions || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', prescriptionId)
    }

    const { pdfBuffer } = await generateAndStorePDF(prescriptionId)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://doctory.com.mx'
    const verificationUrl = `${appUrl}/verify-prescription/${prescriptionId}`

    const emailHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu Receta Médica - Doctory</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px 40px; background-color: #0066cc; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Doctory</h1>
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
                      © ${new Date().getFullYear()} Doctory. Todos los derechos reservados.
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

    const emailResult = await resend.emails.send({
      from: 'Doctory <noreply@doctory.com.mx>',
      to: [patientEmail],
      subject: 'Tu Receta Médica - Doctory',
      html: emailHtml,
      attachments: [
        {
          filename: `receta-${prescriptionId.slice(0, 8)}.pdf`,
          content: Buffer.from(pdfBuffer).toString('base64'),
        },
      ],
    })

    if (emailResult.error) {
      console.error('Failed to send email:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send prescription email' },
        { status: 500 }
      )
    }

    await markAsSent(prescriptionId)

    return NextResponse.json({
      success: true,
      message: 'Prescription sent successfully',
      emailId: emailResult.data?.id,
    })
  } catch (error) {
    console.error('Error sending prescription:', error)
    return NextResponse.json(
      { error: 'Failed to send prescription' },
      { status: 500 }
    )
  }
}
