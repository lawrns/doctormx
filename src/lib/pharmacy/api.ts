/**
 * Pharmacy API
 * 
 * External API calls for pharmacy functionality (Twilio, etc.).
 */

import { logger } from '@/lib/observability/logger'
import { TwilioConfig, WhatsAppResult } from './types'

// Lazy initialization - only check Twilio config when actually used
export function getTwilioConfig(): TwilioConfig {
  const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
  const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
  const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error('Missing required Twilio environment variables: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN')
  }

  return { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER }
}

/**
 * Format phone number for WhatsApp
 */
function getWhatsAppPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('52') && cleaned.length === 12) return `whatsapp:+${cleaned}`
  if (cleaned.length === 10) return `whatsapp:+52${cleaned}`
  return `whatsapp:+${cleaned}`
}

/**
 * Send WhatsApp message via Twilio API
 */
export async function sendTwilioWhatsApp(
  phone: string,
  body: string
): Promise<WhatsAppResult> {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER } = getTwilioConfig()

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Basic ${auth}`, 
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_NUMBER,
        To: getWhatsAppPhone(phone),
        Body: body,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      logger.error('Twilio API error:', { error })
      return { success: false, error }
    }

    const twilioMessage = await response.json()
    return { success: true, messageSid: twilioMessage.sid }
  } catch (error) {
    logger.error('Error sending WhatsApp message:', { error })
    return { success: false, error: 'Failed to send message' }
  }
}
