/**
 * WhatsApp Environment Variables
 * Add these to the ENV_VARS array in src/lib/env.ts
 */

// Add after the App section (before line 193):
{
  name: 'WHATSAPP_PHONE_NUMBER_ID',
  required: (env) => env === 'production' || env === 'staging',
  category: 'WhatsApp',
  description: 'WhatsApp Business API phone number ID from Meta',
},
{
  name: 'WHATSAPP_ACCESS_TOKEN',
  required: (env) => env === 'production' || env === 'staging',
  category: 'WhatsApp',
  description: 'WhatsApp Business API access token from Meta',
},
{
  name: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN',
  required: (env) => env === 'production' || env === 'staging',
  category: 'WhatsApp',
  description: 'Webhook verification token for Meta webhook setup',
},
{
  name: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
  required: false,
  category: 'WhatsApp',
  description: 'WhatsApp Business Account ID for analytics',
},

/**
 * Also add this interface and getter function:
 */

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  verifyToken: string;
  businessAccountId?: string;
}

export function getWhatsAppConfig(): WhatsAppConfig {
  const phoneNumberId = getEnvValue('WHATSAPP_PHONE_NUMBER_ID') || '';
  const accessToken = getEnvValue('WHATSAPP_ACCESS_TOKEN') || '';
  const verifyToken = getEnvValue('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || '';
  const businessAccountId = getEnvValue('WHATSAPP_BUSINESS_ACCOUNT_ID') || undefined;

  if (ENVIRONMENT === 'production' || ENVIRONMENT === 'staging') {
    if (!phoneNumberId) {
      throw new Error('WHATSAPP_PHONE_NUMBER_ID is required in production/staging');
    }
    if (!accessToken) {
      throw new Error('WHATSAPP_ACCESS_TOKEN is required in production/staging');
    }
    if (!verifyToken) {
      throw new Error('WHATSAPP_WEBHOOK_VERIFY_TOKEN is required in production/staging');
    }
  }

  return {
    phoneNumberId,
    accessToken,
    verifyToken,
    businessAccountId,
  };
}

// Add to default export:
getWhatsAppConfig,
