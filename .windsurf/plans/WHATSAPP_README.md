# WhatsApp Business API Integration

Production-ready WhatsApp Business API integration for Doctor.mx using Meta's official API.

## Files Created/Modified

| File | Purpose |
|------|---------|
| `supabase/migrations/004_whatsapp_tables.sql` | Database schema for sessions, messages, logs |
| `src/lib/whatsapp-business-api.ts` | Meta API client library |
| `src/app/api/webhooks/whatsapp/route.ts` | Webhook handler for incoming messages |
| `src/lib/whatsapp-notifications.ts` | Updated to use Business API |
| `src/lib/env.ts` | Added WhatsApp environment variables |
| `whatsapp-templates.json` | Message templates for Meta approval |

## Environment Variables

Add to `.env.local`:

```bash
# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_verify_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
```

## Meta Business Setup

1. **Verify Business**: Go to business.facebook.com and verify your business
2. **Create WABA**: Create WhatsApp Business Account
3. **Register Phone**: Add and verify Mexico phone number (+52)
4. **Configure Webhook**: Set webhook URL to `https://doctory.mx/api/webhooks/whatsapp`
5. **Submit Templates**: Upload `whatsapp-templates.json` for approval

## API Usage

```typescript
import { sendWhatsAppMessage, sendTemplateMessage } from '@/lib/whatsapp-business-api';

// Send text message
await sendWhatsAppMessage('+521234567890', 'Hello from Doctor.mx');

// Send template message
await sendTemplateMessage('+521234567890', 'appointment_confirmation', 'es_MX', [
  { type: 'body', parameters: [{ type: 'text', text: 'Patient Name' }] }
]);
```

## Webhook Flow

1. Patient sends WhatsApp message
2. Meta forwards to `/api/webhooks/whatsapp`
3. Handler creates/gets session
4. AI triage conducted via Dr. Simeon
5. Response sent back via Business API
6. If triage complete → Route to doctor

## Testing

```bash
# Test webhook verification
curl "https://doctory.mx/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE"

# Expected: Returns CHALLENGE with 200 status
```

## Migration from Twilio

The existing Twilio integration remains as fallback. To fully migrate:
1. Complete Meta Business verification
2. Get phone number approved
3. Test Business API endpoints
4. Remove Twilio env vars
5. Update `sendWhatsAppNotification` to remove Twilio fallback

## Compliance

- All messages stored in `whatsapp_messages` table
- Session tracking in `whatsapp_sessions` table
- Delivery logs in `notification_logs` table
- Rate limiting: 20 msg/min per user
- Template approval required for proactive messages
