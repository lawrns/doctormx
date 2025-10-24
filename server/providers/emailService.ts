import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

// Email templates
export const emailTemplates = {
  signupConfirmation: (doctorName: string, cedula: string) => ({
    subject: '¡Bienvenido a Doctor.mx! Verificación en proceso',
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <img src="https://doctor.mx/logo.png" alt="Doctor.mx" style="width: 120px; margin-bottom: 24px;">
          
          <h1 style="color: #1f2937; font-size: 24px; margin-bottom: 16px;">¡Bienvenido, Dr. ${doctorName}!</h1>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Tu cuenta ha sido creada exitosamente. Estamos verificando tu cédula profesional <strong>${cedula}</strong> con la base de datos de la SEP.
          </p>
          
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="color: #1e40af; font-size: 14px; margin: 0;">
              <strong>⏱️ Tiempo estimado:</strong> 24 horas<br>
              <strong>📧 Te notificaremos por email cuando esté listo</strong>
            </p>
          </div>
          
          <h3 style="color: #1f2937; font-size: 18px; margin: 24px 0 12px 0;">¿Qué sigue?</h3>
          
          <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px;">
            <li>✅ <strong>Cuenta creada</strong> - Completado</li>
            <li>⏳ <strong>Verificación de cédula</strong> - En proceso (hasta 24 horas)</li>
            <li>📧 <strong>Notificación de aprobación</strong> - Te enviaremos un email con el enlace para activar tu suscripción</li>
            <li>💳 <strong>Configuración de suscripción</strong> - Completa el pago y comienza a recibir pacientes</li>
          </ol>
          
          <div style="margin: 32px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <h4 style="color: #1f2937; font-size: 16px; margin: 0 0 12px 0;">Tu plan seleccionado</h4>
            <p style="color: #4b5563; font-size: 14px; margin: 0;">
              <strong>$499 MXN/mes</strong><br>
              ✓ 7 días de prueba gratuita<br>
              ✓ Cancela cuando quieras<br>
              ✓ $200+ por consulta (70% para ti)
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            ¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@doctor.mx" style="color: #3b82f6;">soporte@doctor.mx</a> o WhatsApp al +52 55 1234 5678
          </p>
        </div>
      </div>
    `
  }),

  verificationApproved: (doctorName: string, subscriptionSetupUrl: string, planType: string) => ({
    subject: '✅ ¡Tu cédula ha sido verificada! Activa tu suscripción',
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <img src="https://doctor.mx/logo.png" alt="Doctor.mx" style="width: 120px; margin-bottom: 24px;">
          
          <div style="background-color: #d1fae5; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <span style="font-size: 48px;">✅</span>
            <h1 style="color: #065f46; font-size: 24px; margin: 12px 0 0 0;">¡Cédula Verificada!</h1>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Hola Dr. ${doctorName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            ¡Excelentes noticias! Tu cédula profesional ha sido verificada exitosamente con la base de datos de la SEP. Ya estás a un paso de comenzar a recibir pacientes referidos por nuestra IA médica.
          </p>
          
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 12px 0;">Tu plan: ${planType === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}</h3>
            <p style="color: #1e40af; font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">
              ${planType === 'yearly' ? '$4,999 MXN/año' : '$499 MXN/mes'}
            </p>
            <p style="color: #3b82f6; font-size: 14px; margin: 0;">
              ✓ 7 días de prueba gratuita<br>
              ✓ Cancela cuando quieras<br>
              ✓ Referencias ilimitadas de pacientes
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${subscriptionSetupUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Activar mi suscripción →
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
            Este enlace expira en 7 días. Activa tu suscripción ahora para no perder tu lugar.
          </p>
          
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            ¿Necesitas ayuda? Escríbenos a <a href="mailto:soporte@doctor.mx" style="color: #3b82f6;">soporte@doctor.mx</a>
          </p>
        </div>
      </div>
    `
  }),

  verificationRejected: (doctorName: string, reason: string) => ({
    subject: '❌ Verificación de cédula - Acción requerida',
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <img src="https://doctor.mx/logo.png" alt="Doctor.mx" style="width: 120px; margin-bottom: 24px;">
          
          <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 16px;">Verificación Rechazada</h1>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Hola Dr. ${doctorName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Lamentablemente no pudimos verificar tu cédula profesional. Motivo: ${reason}
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <h3 style="color: #991b1b; font-size: 16px; margin: 0 0 8px 0;">¿Qué puedes hacer?</h3>
            <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.6;">
              1. Verifica que tu cédula esté registrada en la base de datos de la SEP<br>
              2. Asegúrate de que el nombre coincida exactamente con tu registro<br>
              3. Contacta a nuestro soporte para revisar manualmente tu caso
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="mailto:verificacion@doctor.mx" style="display: inline-block; background-color: #dc2626; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Contactar Soporte
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            Soporte disponible en <a href="mailto:verificacion@doctor.mx" style="color: #3b82f6;">verificacion@doctor.mx</a> o WhatsApp +52 55 1234 5678
          </p>
        </div>
      </div>
    `
  }),

  paymentSuccess: (doctorName: string, planType: string, trialEndDate: string, dashboardUrl: string) => ({
    subject: '🎉 ¡Suscripción activada! Bienvenido a Doctor.mx',
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <img src="https://doctor.mx/logo.png" alt="Doctor.mx" style="width: 120px; margin-bottom: 24px;">
          
          <div style="background-color: #d1fae5; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
            <span style="font-size: 48px;">🎉</span>
            <h1 style="color: #065f46; font-size: 24px; margin: 12px 0 0 0;">¡Suscripción Activada!</h1>
          </div>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            ¡Felicidades Dr. ${doctorName}!
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Tu suscripción ha sido activada exitosamente. Ya puedes comenzar a recibir pacientes referidos por nuestra IA médica.
          </p>
          
          <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 12px 0;">Detalles de tu suscripción</h3>
            <p style="color: #3b82f6; font-size: 14px; margin: 0; line-height: 1.8;">
              <strong>Plan:</strong> ${planType === 'yearly' ? 'Anual' : 'Mensual'}<br>
              <strong>Precio:</strong> ${planType === 'yearly' ? '$4,999 MXN/año' : '$499 MXN/mes'}<br>
              <strong>Prueba gratuita hasta:</strong> ${trialEndDate}<br>
              <strong>Estado:</strong> ✅ Activa
            </p>
          </div>
          
          <h3 style="color: #1f2937; font-size: 18px; margin: 24px 0 12px 0;">Próximos pasos</h3>
          
          <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px;">
            <li>✅ Accede a tu dashboard</li>
            <li>✅ Completa tu perfil profesional</li>
            <li>✅ Configura tu disponibilidad</li>
            <li>✅ ¡Comienza a recibir pacientes!</li>
          </ol>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Ir a mi Dashboard →
            </a>
          </div>
          
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>💡 Recuerda:</strong> Tu prueba gratuita termina el ${trialEndDate}. No se te cobrará hasta esa fecha. Puedes cancelar en cualquier momento.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            ¿Preguntas? Escríbenos a <a href="mailto:soporte@doctor.mx" style="color: #3b82f6;">soporte@doctor.mx</a>
          </p>
        </div>
      </div>
    `
  }),

  paymentFailed: (doctorName: string, reason: string, retryUrl: string) => ({
    subject: '⚠️ Error en el pago - Acción requerida',
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <img src="https://doctor.mx/logo.png" alt="Doctor.mx" style="width: 120px; margin-bottom: 24px;">
          
          <h1 style="color: #dc2626; font-size: 24px; margin-bottom: 16px;">Error en el Pago</h1>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Hola Dr. ${doctorName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            No pudimos procesar tu pago. Motivo: ${reason}
          </p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <h3 style="color: #991b1b; font-size: 16px; margin: 0 0 8px 0;">¿Qué hacer ahora?</h3>
            <p style="color: #7f1d1d; font-size: 14px; margin: 0; line-height: 1.6;">
              Verifica que tu tarjeta tenga fondos suficientes e intenta nuevamente. Si el problema persiste, intenta con otra tarjeta o método de pago.
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${retryUrl}" style="display: inline-block; background-color: #dc2626; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600;">
              Reintentar Pago →
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            ¿Necesitas ayuda? Escríbenos a <a href="mailto:pagos@doctor.mx" style="color: #3b82f6;">pagos@doctor.mx</a>
          </p>
        </div>
      </div>
    `
  }),

  trialEndingReminder: (doctorName: string, daysLeft: number, manageUrl: string) => ({
    subject: `⏰ Tu prueba gratuita termina en ${daysLeft} días`,
    html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <img src="https://doctor.mx/logo.png" alt="Doctor.mx" style="width: 120px; margin-bottom: 24px;">
          
          <h1 style="color: #f59e0b; font-size: 24px; margin-bottom: 16px;">⏰ Tu prueba termina pronto</h1>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 16px;">
            Hola Dr. ${doctorName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
            Tu periodo de prueba gratuita de 7 días termina en <strong>${daysLeft} días</strong>. Después de eso, comenzaremos a cobrar tu suscripción automáticamente.
          </p>
          
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
              <strong>💳 Próximo cargo:</strong> En ${daysLeft} días<br>
              <strong>💰 Monto:</strong> El precio de tu plan seleccionado<br>
              <strong>✅ ¿Quieres continuar?</strong> No hagas nada, continuaremos automáticamente<br>
              <strong>❌ ¿Quieres cancelar?</strong> Puedes hacerlo en cualquier momento sin cargo
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${manageUrl}" style="display: inline-block; background-color: #f59e0b; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 600; margin-right: 12px;">
              Administrar Suscripción
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            ¿Preguntas? Escríbenos a <a href="mailto:soporte@doctor.mx" style="color: #3b82f6;">soporte@doctor.mx</a>
          </p>
        </div>
      </div>
    `
  })
};

// Helper function to send emails
export async function sendEmail(to: string, templateName: keyof typeof emailTemplates, ...args: any[]) {
  try {
    const template = emailTemplates[templateName](...args);
    
    const { data, error } = await resend.emails.send({
      from: 'Doctor.mx <onboarding@doctor.mx>',
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }

    console.log('✅ Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    throw error;
  }
}

export default { emailTemplates, sendEmail };


