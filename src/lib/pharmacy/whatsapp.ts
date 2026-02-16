/**
 * Pharmacy WhatsApp Integration
 * 
 * WhatsApp notification logic for pharmacy referrals.
 */

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createServiceClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { PharmacySponsor } from './types'
import { sendTwilioWhatsApp } from './api'

/**
 * Send pharmacy referral WhatsApp notification
 */
export async function sendPharmacyReferralWhatsApp(
  phone: string,
  referralCode: string,
  medications: string[],
  expiresAt: string,
  pharmacy?: PharmacySponsor
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  const message = buildReferralMessage(referralCode, medications, expiresAt, pharmacy)
  
  const result = await sendTwilioWhatsApp(phone, message)
  
  if (result.success) {
    await logNotification(phone, referralCode, result.messageSid, message)
  }
  
  return result
}

/**
 * Build referral message content
 */
function buildReferralMessage(
  referralCode: string,
  medications: string[],
  expiresAt: string,
  pharmacy?: PharmacySponsor
): string {
  return `🏥 *Referencia de Farmacia - Doctor.mx*

Hola,

Tu médico te ha referido a ${pharmacy?.name || 'una farmacia asociada'}.

📋 *Código de Referencia:* ${referralCode}
💊 *Medicamentos:* ${(medications || []).join(', ')}

📍 *Dirección:* ${pharmacy?.address || 'Consultar dirección en la aplicación'}

📅 *Válido hasta:* ${format(new Date(expiresAt), 'dd MMMM yyyy', { locale: es })}

Presenta este código en la farmacia para obtener tus medicamentos.

— *Doctor.mx: Tu salud, simplificada*`
}

/**
 * Log notification to database
 */
async function logNotification(
  phone: string,
  referralCode: string,
  messageSid: string | undefined,
  messageBody: string
): Promise<void> {
  try {
    const supabase = createServiceClient()
    await supabase.from('notification_logs').insert({
      phone_number: phone,
      template: 'pharmacy_referral',
      status: 'sent',
      twilio_sid: messageSid,
      message_body: messageBody,
      metadata: { referral_code: referralCode },
    })
  } catch (error) {
    logger.error('Error logging notification:', { error })
  }
}
