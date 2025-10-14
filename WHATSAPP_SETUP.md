# 📱 WhatsApp Cloud API Setup Guide

Complete guide to set up WhatsApp Business integration for doctor.mx

---

## 🎯 Overview

Doctor.mx uses **WhatsApp Cloud API** (Meta's official API) to provide medical consultations via WhatsApp. This enables:

- ✅ Users consult via WhatsApp (no app download needed)
- ✅ AI triage available 24/7
- ✅ Direct doctor handoff when needed
- ✅ Prescription delivery notifications
- ✅ Medication adherence reminders

---

## 📋 Prerequisites

1. **Meta Business Account** - [Create one](https://business.facebook.com/)
2. **WhatsApp Business Account** - Linked to your Meta Business Account
3. **Phone Number** - Not registered on WhatsApp (will become your business number)
4. **Business Verification** - Meta requires business documentation

---

## 🚀 Step-by-Step Setup

### **Step 1: Create WhatsApp Business App**

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Business** type
4. Fill in app details:
   - **App Name**: Doctor.mx
   - **Contact Email**: your-email@doctor.mx
   - **Business Account**: Select your business
5. Click **Create App**

### **Step 2: Add WhatsApp Product**

1. In your app dashboard, find **WhatsApp** in products
2. Click **Set Up** on WhatsApp
3. Choose **Use a phone number**
4. Enter your business phone number (must not be on WhatsApp)
5. Verify via SMS code

### **Step 3: Get Your Credentials**

#### **Phone Number ID**
1. Go to **WhatsApp** → **API Setup**
2. Copy your **Phone Number ID** (looks like: `123456789012345`)
3. Add to `.env`: `WHATSAPP_PHONE_NUMBER_ID=123456789012345`

#### **Business Account ID**
1. In WhatsApp Settings, copy **WhatsApp Business Account ID**
2. Add to `.env`: `WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345`

#### **Access Token (Temporary)**
1. In **API Setup**, you'll see a **Temporary access token**
2. **⚠️ This expires in 24 hours** - use for testing only
3. Add to `.env`: `WHATSAPP_ACCESS_TOKEN=your-temp-token`

### **Step 4: Generate Permanent Access Token**

1. Go to **Meta Business Manager** → **System Users**
2. Click **Add** → Create system user:
   - Name: `Doctor.mx Bot`
   - Role: `Admin`
3. Click **Generate New Token**
4. Select your app
5. Choose permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
6. Generate token → **Save this securely!**
7. Update `.env`: `WHATSAPP_ACCESS_TOKEN=your-permanent-token`

### **Step 5: Configure Webhook**

#### **A. Deploy your server (required for webhook)**

Option 1: **ngrok (for testing)**
```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/

# Run your API server
npm run dev:api

# In another terminal, expose it
ngrok http 8787

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

Option 2: **Production deployment**
- Deploy to Railway, Render, Heroku, or your VPS
- Must have HTTPS (SSL certificate)
- Example: `https://api.doctor.mx`

#### **B. Register webhook with Meta**

1. In WhatsApp API Setup, find **Webhook** section
2. Click **Configure**
3. Enter webhook URL:
   - **Callback URL**: `https://your-domain.com/api/whatsapp/webhook`
   - **Verify Token**: Same as `WHATSAPP_VERIFY_TOKEN` in your `.env`
4. Click **Verify and Save**

#### **C. Subscribe to webhook events**

1. After verification, click **Manage**
2. Subscribe to these fields:
   - ✅ `messages` - Incoming user messages
   - ✅ `message_status` - Delivery/read receipts
3. Click **Done**

### **Step 6: Test Your Integration**

```bash
# Start your API server
npm run dev:api

# Should see:
# ✅ WhatsApp Cloud API configured
# 🚀 Doctor.mx API running on http://localhost:8787
# 📞 WhatsApp webhook: http://localhost:8787/api/whatsapp/webhook
```

#### **Send test message from WhatsApp:**

1. Open WhatsApp on your phone
2. Send message to your business number
3. You should receive automated reply!

#### **Test endpoints:**

```bash
# Check webhook status
curl http://localhost:8787/api/whatsapp/status

# Should return:
# {
#   "status": "online",
#   "activeSessions": 0,
#   "timestamp": "2025-10-14T12:00:00.000Z"
# }

# Health check
curl http://localhost:8787/api/health
```

---

## 📝 Message Templates Setup

WhatsApp requires **pre-approved templates** for notifications outside 24-hour window.

### **Create Templates in Meta Business Manager**

1. Go to **WhatsApp Manager** → **Message Templates**
2. Click **Create Template**

#### **Template 1: Adherence Reminder (30 days)**
```
Name: adherence_reminder_30d
Category: UTILITY
Language: Spanish (Mexico)

Body:
Hola {{1}}, es momento de renovar tu receta de {{2}}.

¿Necesitas agendar consulta de seguimiento?

Responde SÍ para agendar.
```

#### **Template 2: Prescription Ready**
```
Name: rx_ready
Category: UTILITY
Language: Spanish (Mexico)

Body:
¡{{1}}, tu receta está lista! 🎉

Puedes recogerla en {{2}}.

Horario: 9am-9pm todos los días
```

#### **Template 3: Consent Request**
```
Name: consent_health_data
Category: UTILITY
Language: Spanish (Mexico)

Body:
Para continuar, necesito tu consentimiento:

✅ Procesar datos de salud
✅ Compartir con médicos verificados
✅ Enviar a farmacia si procede

¿Aceptas? Responde SÍ o NO
```

3. Submit each template → Wait for Meta approval (usually 24-48 hours)

---

## 🔒 Security & Compliance

### **Webhook Signature Verification**

1. Get webhook secret from Meta Business Manager
2. Add to `.env`: `WHATSAPP_WEBHOOK_SECRET=your-secret`
3. Production verification is automatic in `webhook.ts`

### **Data Privacy (NOM-004 & LFPDPPP)**

- ✅ All messages stored temporarily (30 min session timeout)
- ✅ User consent requested before processing health data
- ✅ End-to-end encryption (WhatsApp native)
- ✅ ARCO rights supported (access, rectify, cancel, oppose)

### **Rate Limits**

WhatsApp Cloud API limits:
- **Free tier**: 1,000 conversations/month
- **Paid tier**: Unlimited (pay per conversation)
- **Rate limit**: 80 messages/second (we set conservative 50/s)

---

## 💰 Pricing & Billing

### **WhatsApp Business API Pricing (Meta)**

1. **Free Tier**: First 1,000 conversations/month
2. **Service Conversations** (user-initiated):
   - Mexico: ~$0.03 USD per conversation
3. **Utility Conversations** (business-initiated):
   - Mexico: ~$0.02 USD per conversation

### **Conversation Definition**
- 24-hour window from last user message
- Multiple messages within window = 1 conversation

### **Billing Setup**

1. Add payment method in Meta Business Manager
2. Go to **Settings** → **Payments**
3. Add credit card or bank account
4. Set billing alerts at $50, $100, $200 thresholds

---

## 🐛 Troubleshooting

### **Webhook not receiving messages**

1. Check webhook is verified: `GET /api/whatsapp/webhook?hub.verify_token=your-token`
2. Ensure HTTPS (not HTTP)
3. Check server logs for errors
4. Verify subscribed to `messages` field in Meta

### **Messages not sending**

1. Check access token is valid
2. Verify phone number format (E.164): `+5215512345678`
3. Check rate limits in Meta Business Manager
4. Review error logs in server

### **"Message template not found"**

- Template must be approved by Meta first
- Check template name matches exactly
- Use correct language code (`es_MX`)

### **Business verification required**

- Meta requires business verification for production
- Submit business documents in Meta Business Settings
- Approval takes 1-5 business days

---

## 📊 Monitoring & Analytics

### **Built-in Endpoints**

```bash
# Active sessions
GET /api/whatsapp/status

# Health check
GET /api/health

# Example response:
{
  "status": "online",
  "activeSessions": 12,
  "timestamp": "2025-10-14T12:00:00.000Z"
}
```

### **Meta Analytics Dashboard**

1. Go to **WhatsApp Manager** → **Insights**
2. Track:
   - Conversation volume
   - Response times
   - Message delivery rates
   - User engagement

### **Production Monitoring (Recommended)**

- **Sentry**: Error tracking and alerts
- **Mixpanel**: User analytics and funnels
- **Grafana**: Server metrics and uptime

---

## 🚢 Production Checklist

Before going live:

- [ ] Permanent access token configured
- [ ] Webhook deployed with HTTPS
- [ ] Webhook signature verification enabled
- [ ] Business verification completed with Meta
- [ ] Message templates approved
- [ ] Payment method added to Meta account
- [ ] Rate limiting configured
- [ ] Error monitoring set up (Sentry)
- [ ] Backup/fallback system ready
- [ ] Privacy policy published (LFPDPPP compliant)
- [ ] Terms of service published
- [ ] User consent flow tested
- [ ] Emergency alert flow tested (911 routing)

---

## 📚 Resources

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Manager](https://business.facebook.com/)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks)
- [Message Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Rate Limits & Throttling](https://developers.facebook.com/docs/whatsapp/cloud-api/support/rate-limiting)

---

## 🆘 Support

Need help?
- Email: tech@doctor.mx
- WhatsApp Support: [Meta Business Help](https://business.facebook.com/business/help)
- GitHub Issues: [doctor.mx/issues](https://github.com/doctormx/issues)
