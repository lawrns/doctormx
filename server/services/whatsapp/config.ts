/**
 * WhatsApp Cloud API Configuration
 * Meta Business Platform integration for doctor.mx
 */

export const whatsappConfig = {
  // Meta Cloud API credentials (from .env)
  apiVersion: 'v18.0',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',

  // Webhook configuration
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'doctor_mx_secure_token_2025',
  webhookSecret: process.env.WHATSAPP_WEBHOOK_SECRET || '',

  // API endpoint
  baseUrl: 'https://graph.facebook.com',

  // Rate limiting
  maxMessagesPerSecond: 50, // Meta allows up to 1000/s but we start conservative
  maxSessionDuration: 24 * 60 * 60 * 1000, // 24 hours

  // Message templates (must be approved by Meta)
  templates: {
    TRIAGE_START: 'triage_start',
    CONSENT_HEALTH_DATA: 'consent_health_data',
    RX_READY: 'rx_ready',
    ADHERENCE_REMINDER_30D: 'adherence_reminder_30d',
    APPOINTMENT_CONFIRMATION: 'appointment_confirmation',
    EMERGENCY_ALERT: 'emergency_alert',
  },

  // Session configuration
  sessionTimeout: 30 * 60 * 1000, // 30 minutes of inactivity
  maxMessageLength: 4096, // WhatsApp limit
};

export function validateWhatsAppConfig(): boolean {
  const required = [
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_ACCESS_TOKEN',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Missing WhatsApp config: ${missing.join(', ')}`);
    console.warn('   Set in .env or use test mode');
    return false;
  }

  return true;
}

// Helper to get API URL
export function getWhatsAppApiUrl(endpoint: string): string {
  const { apiVersion, phoneNumberId, baseUrl } = whatsappConfig;
  return `${baseUrl}/${apiVersion}/${phoneNumberId}/${endpoint}`;
}
