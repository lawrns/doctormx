/**
 * WhatsApp Cloud API Message Sender
 * Handles outbound messages to users via Meta's Cloud API
 */

import { whatsappConfig, getWhatsAppApiUrl } from './config.js';

export interface SendMessageParams {
  to: string; // Phone number in E.164 format (e.g., +5215512345678)
  type: 'text' | 'template' | 'interactive';
  content: string | TemplateMessage | InteractiveMessage;
}

export interface TemplateMessage {
  name: string;
  language: string;
  components?: Array<{
    type: string;
    parameters: Array<{ type: string; text: string }>;
  }>;
}

export interface InteractiveMessage {
  type: 'button' | 'list';
  body: { text: string };
  action: {
    buttons?: Array<{ type: string; reply: { id: string; title: string } }>;
    button?: string;
    sections?: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>;
  };
  header?: { type: string; text: string };
  footer?: { text: string };
}

/**
 * Send a text message via WhatsApp
 */
export async function sendTextMessage(to: string, text: string): Promise<any> {
  const url = getWhatsAppApiUrl('messages');

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: normalizePhoneNumber(to),
    type: 'text',
    text: { body: text },
  };

  return makeWhatsAppRequest(url, payload);
}

/**
 * Send a template message (for notifications outside 24h window)
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  language: string = 'es_MX',
  parameters?: Array<string>
): Promise<any> {
  const url = getWhatsAppApiUrl('messages');

  const components = parameters
    ? [
        {
          type: 'body',
          parameters: parameters.map(p => ({ type: 'text', text: p })),
        },
      ]
    : [];

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizePhoneNumber(to),
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
      components,
    },
  };

  return makeWhatsAppRequest(url, payload);
}

/**
 * Send an interactive message with buttons or lists
 */
export async function sendInteractiveMessage(
  to: string,
  message: InteractiveMessage
): Promise<any> {
  const url = getWhatsAppApiUrl('messages');

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizePhoneNumber(to),
    type: 'interactive',
    interactive: message,
  };

  return makeWhatsAppRequest(url, payload);
}

/**
 * Send typing indicator (shows "..." for 5 seconds)
 */
export async function sendTypingIndicator(to: string): Promise<any> {
  const url = getWhatsAppApiUrl('messages');

  const payload = {
    messaging_product: 'whatsapp',
    to: normalizePhoneNumber(to),
    type: 'reaction',
    reaction: {
      message_id: '', // Will be filled when we have context
      emoji: '⏳',
    },
  };

  // Note: This is a placeholder. Real typing uses different API
  // For now, we'll just send messages normally
  console.log('Typing indicator requested for', to);
  return Promise.resolve({ success: true });
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string): Promise<any> {
  const url = getWhatsAppApiUrl('messages');

  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
  };

  return makeWhatsAppRequest(url, payload);
}

/**
 * Helper: Make authenticated request to WhatsApp API
 */
async function makeWhatsAppRequest(url: string, payload: any): Promise<any> {
  const { accessToken } = whatsappConfig;

  if (!accessToken) {
    console.error('❌ WhatsApp access token not configured');
    throw new Error('WhatsApp not configured');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API error:', error);
      throw new Error(`WhatsApp API error: ${error.error?.message || 'Unknown'}`);
    }

    const data = await response.json();
    console.log('✅ WhatsApp message sent:', data.messages?.[0]?.id);
    return data;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

/**
 * Helper: Normalize phone number to E.164 format
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If it starts with 521 (Mexico mobile), keep as is
  // If it starts with 52 (Mexico), keep as is
  // If it starts with +, remove it (already cleaned)
  // If it doesn't start with country code, assume Mexico (+52)
  if (!cleaned.startsWith('52')) {
    cleaned = '52' + cleaned;
  }

  return cleaned;
}

/**
 * Helper: Send adherence reminder (30 days after Rx)
 */
export async function sendAdherenceReminder(
  to: string,
  patientName: string,
  medicationName: string
): Promise<any> {
  return sendTemplateMessage(
    to,
    whatsappConfig.templates.ADHERENCE_REMINDER_30D,
    'es_MX',
    [patientName, medicationName]
  );
}

/**
 * Helper: Send Rx ready notification
 */
export async function sendRxReadyNotification(
  to: string,
  patientName: string,
  pharmacyName: string
): Promise<any> {
  return sendTemplateMessage(
    to,
    whatsappConfig.templates.RX_READY,
    'es_MX',
    [patientName, pharmacyName]
  );
}

/**
 * Helper: Send emergency alert (red flags detected)
 */
export async function sendEmergencyAlert(to: string, reason: string): Promise<any> {
  // For emergencies, we send immediate text (within 24h window)
  const message = `🚨 ALERTA MÉDICA

Detectamos señales de alarma: ${reason}

⚠️ ACCIÓN INMEDIATA REQUERIDA:
• Llama al 911 ahora
• Acude a urgencias más cercana
• NO esperes

Esto NO sustituye atención médica profesional.`;

  return sendTextMessage(to, message);
}
