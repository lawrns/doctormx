/**
 * WhatsApp Business API Client
 * Production-ready integration with Meta's WhatsApp Business API
 */

const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

interface WhatsAppMessageOptions {
  previewUrl?: boolean;
}

interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a text message via WhatsApp Business API
 */
export async function sendWhatsAppMessage(
  to: string,
  message: string,
  options?: WhatsAppMessageOptions
): Promise<WhatsAppResponse> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !token) {
    return { success: false, error: 'Missing WhatsApp credentials' };
  }

  const url = `${WHATSAPP_API_URL}/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatPhoneNumber(to),
        type: 'text',
        text: {
          body: message,
          preview_url: options?.previewUrl ?? false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || 'API error' };
    }

    const data = await response.json();
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Send an approved template message
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'es_MX',
  components?: any[]
): Promise<WhatsAppResponse> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !token) {
    return { success: false, error: 'Missing WhatsApp credentials' };
  }

  const url = `${WHATSAPP_API_URL}/${phoneId}/messages`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formatPhoneNumber(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error?.message || 'API error' };
    }

    const data = await response.json();
    return { success: true, messageId: data.messages?.[0]?.id };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Download media from WhatsApp servers
 */
export async function downloadMedia(mediaId: string): Promise<Buffer | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!token) {
    return null;
  }

  try {
    // Get media URL
    const metaResponse = await fetch(`${WHATSAPP_API_URL}/${mediaId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!metaResponse.ok) return null;

    const meta = await metaResponse.json();

    // Download actual media
    const mediaResponse = await fetch(meta.url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!mediaResponse.ok) return null;

    return Buffer.from(await mediaResponse.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('52')) return cleaned;
  if (cleaned.length === 10) return `52${cleaned}`;
  return cleaned;
}
