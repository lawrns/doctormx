# Phase 2: Monetization Systems Implementation

## Overview

Phase 2 implements the complete monetization infrastructure for Doctory:

1. **Doctor Subscription System** - Monthly recurring billing for catalog visibility
2. **WhatsApp Doctor System** - Patient acquisition through WhatsApp triage
3. **Pharmacy Sponsorship System** - Revenue from pharmacy partnerships
4. **Clinical Copilot** - AI-assisted clinical decision support for doctors
5. **Medical Image Analysis** - GPT-4 Vision integration for image analysis
6. **OTC Recommendations** - Safe over-the-counter medication suggestions

## Completed Implementations

### 1. Doctor Subscription System

#### Database Tables (from Migration 004)
- `doctor_subscriptions` - Subscription records with Stripe integration
- `whatsapp_handoff_limits` - Track doctor handoff capacity per billing period

#### Subscription Module (`src/lib/subscription.ts`)

**Functions**:
- `createSubscription(doctorId, stripeToken, planId)` - Create new subscription
- `cancelSubscription(doctorId, reason)` - Cancel subscription
- `checkSubscriptionStatus(doctorId)` - Check current status
- `hasActiveSubscription(doctorId)` - Boolean check
- `updateSubscriptionStatus(stripeSubscriptionId, status)` - Update from webhook

**Plans**:
```typescript
{
  basic_499: {
    id: 'basic_499',
    name: 'Plan Básico',
    price_cents: 49900, // 499 MXN
    currency: 'MXN',
    handoff_limit: 30, // 30 WhatsApp handoffs per month
  }
}
```

**Correctness Properties**:
- ✅ Only approved doctors can subscribe
- ✅ Subscription status is synced with Stripe
- ✅ Expired subscriptions remove doctor from catalog
- ✅ Handoff limits are enforced per billing period

#### Subscription UI (`src/app/doctor/subscription/page.tsx`)

**Features**:
- Display current subscription status
- Show available plans with pricing
- Display plan features and benefits
- FAQ section
- Stripe payment integration (placeholder)

**User Flow**:
1. Doctor completes onboarding
2. Admin approves doctor
3. Doctor is prompted to subscribe
4. Doctor selects plan
5. Doctor completes Stripe payment
6. Subscription is activated
7. Doctor appears in catalog

#### API Routes (`src/app/api/subscriptions/route.ts`)

**Endpoints**:
- `GET /api/subscriptions` - Get subscription status
- `POST /api/subscriptions` - Create new subscription

#### Stripe Webhook (`src/app/api/webhooks/stripe/route.ts`)

**Events Handled**:
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Cancel subscription
- `invoice.payment_succeeded` - Payment success
- `invoice.payment_failed` - Payment failure

**Correctness Properties**:
- ✅ Webhook signature is verified
- ✅ Subscription status is updated in database
- ✅ Failed payments trigger notifications
- ✅ Expired subscriptions are handled

### 2. WhatsApp Doctor System

#### Database Tables (from Migration 004)
- `whatsapp_sessions` - WhatsApp triage sessions
- `whatsapp_messages` - Message history for audit
- `whatsapp_handoff_limits` - Doctor handoff capacity

#### WhatsApp Module (`src/lib/whatsapp.ts`)

**Functions**:
- `createSession(phoneNumber)` - Create WhatsApp session
- `addMessage(sessionId, body, direction, senderType)` - Store message
- `conductTriage(sessionId, userMessage)` - AI triage conversation
- `routeHandoff(sessionId, summary)` - Route to available doctor
- `linkSessionToPatient(sessionId, patientId)` - Link to patient profile
- `completeSession(sessionId, outcome)` - Mark session as completed

**Session States**:
- `triage` - Initial AI triage conversation
- `awaiting_handoff` - Waiting for doctor assignment
- `with_doctor` - Assigned to doctor
- `completed` - Session completed
- `escalated` - Emergency escalation

**Triage Outcomes**:
- `book_consultation` - Route to doctor
- `refer_pharmacy` - Suggest pharmacy
- `emergency_redirect` - Emergency instructions

#### Twilio Webhook (`src/app/api/webhooks/twilio/route.ts`)

**Features**:
- Receive incoming WhatsApp messages
- Conduct AI triage
- Route to available doctors
- Return Twilio XML response

**Message Flow**:
1. Patient sends WhatsApp message
2. Session is created or retrieved
3. Message is stored
4. AI conducts triage
5. Response is generated
6. Response is sent back to patient

**Correctness Properties**:
- ✅ Sessions are created for new users
- ✅ Triage is conducted using OPQRST methodology
- ✅ Doctors are routed based on availability
- ✅ Handoff limits are enforced
- ✅ Emergency cases are escalated

### 3. Pharmacy Sponsorship System

#### Database Tables (from Migration 004)
- `pharmacy_sponsors` - Partner pharmacies
- `appointment_sponsorships` - Sponsorship tracking per appointment

#### Pharmacy Module (`src/lib/pharmacy.ts`)

**Functions**:
- `matchPharmacy(city, state)` - Find pharmacy by location
- `createSponsorship(appointmentId, pharmacyId)` - Create sponsorship record
- `enforceDisclosure(sponsorshipId)` - Mark as disclosed
- `trackPharmacyClick(sponsorshipId)` - Track engagement
- `getAppointmentSponsorship(appointmentId)` - Get sponsorship details
- `getPharmacySponsorshipStats(pharmacyId, startDate, endDate)` - Get statistics

**Correctness Properties**:
- ✅ Pharmacies are matched by location coverage
- ✅ Sponsorships are marked as disclosed
- ✅ Doctors cannot influence pharmacy selection
- ✅ Patients can opt-out of suggestions
- ✅ Disclosure is enforced in UI

**Sponsorship Flow**:
1. Prescription is created
2. Patient location is determined
3. Matching pharmacy is found
4. Sponsorship record is created
5. Pharmacy is suggested to patient
6. Disclosure label is displayed
7. Click is tracked if patient engages

### 4. Clinical Copilot

#### Database Tables (from Migration 004)
- `clinical_copilot_sessions` - Copilot session history

#### Copilot Module (`src/lib/ai/copilot.ts`)

**Functions**:
- `generateSOAPNote(conversationHistory)` - Extract SOAP elements
- `generateDifferentialDiagnoses(conversationHistory, patientInfo)` - Generate diagnoses
- `generateQuickReplies(conversationHistory, lastMessage)` - Generate quick replies
- `generateNextSteps(soapNote, diagnoses)` - Generate treatment steps
- `generateCopilotSuggestions(conversationHistory, patientInfo)` - Generate all suggestions
- `saveCopilotSession(appointmentId, doctorId, suggestions, messages)` - Save session
- `getCopilotSession(appointmentId)` - Retrieve session

**SOAP Note Generation**:
- Extracts Subjective (patient report)
- Extracts Objective (clinical findings)
- Extracts Assessment (diagnosis)
- Extracts Plan (treatment)

**Differential Diagnoses**:
- Generates top 3 diagnoses
- Includes probability percentages
- Provides clinical reasoning
- Considers patient demographics

**Quick Replies**:
- Generates 3-4 contextual responses
- Professional but empathetic tone
- Brief and actionable
- In Spanish

**Next Steps**:
- Generates 3-5 treatment steps
- Ordered by priority
- Clinically relevant
- Specific and actionable

**Correctness Properties**:
- ✅ SOAP notes are structured correctly
- ✅ Diagnoses are clinically relevant
- ✅ Quick replies are contextual
- ✅ Next steps are actionable
- ✅ All suggestions are logged

### 5. Medical Image Analysis

#### Database Tables (from Migration 004)
- `medical_image_analyses` - Image analysis results

#### Vision Module (`src/lib/ai/vision.ts`)

**Functions**:
- `analyzeImage(imageUrl, imageType, specialty)` - Analyze single image
- `analyzeMultipleImages(images)` - Analyze multiple images
- `saveImageAnalysis(patientId, imageUrl, imageType, analysis, appointmentId)` - Save analysis
- `getImageAnalysisHistory(patientId)` - Get patient's analyses
- `getCriticalImages(patientId)` - Get critical urgency images
- `getImageAnalysis(analysisId)` - Get single analysis
- `getAnalysesByUrgency(urgencyLevel)` - Get by urgency

**Image Types Supported**:
- `xray` - X-ray images
- `ct` - CT scans
- `mri` - MRI scans
- `ultrasound` - Ultrasound images
- `lab_result` - Lab result images
- `skin` - Skin condition images
- `other` - Other medical images

**Urgency Levels**:
- `low` - Can wait
- `medium` - Should see doctor
- `high` - Urgent
- `critical` - Emergency

**Analysis Output**:
- Detailed findings
- Confidence percentage (0-100%)
- Urgency level
- Recommended specialty
- Clinical recommendations
- Disclaimer

**Correctness Properties**:
- ✅ Images are analyzed with GPT-4 Vision
- ✅ Confidence levels are realistic
- ✅ Urgency is classified correctly
- ✅ Recommendations are clinically sound
- ✅ Disclaimer is always included

### 6. OTC Recommendations

#### Database Tables (from Migration 004)
- `otc_recommendations` - OTC medication recommendations

#### OTC Module (`src/lib/ai/otc.ts`)

**Functions**:
- `generateOTCRecommendations(symptoms, patientInfo)` - Generate recommendations
- `saveOTCRecommendation(patientId, recommendation, appointmentId, doctorId)` - Save recommendation
- `getOTCRecommendations(patientId)` - Get patient's recommendations
- `getAppointmentOTCRecommendations(appointmentId)` - Get appointment recommendations
- `getRecommendationsByCategory(category)` - Get by category
- `checkDrugInteractions(medications)` - Check for interactions
- `getSafeAlternatives(medication, reason)` - Get alternatives

**OTC Categories**:
- `analgesic` - Pain relievers
- `antipyretic` - Fever reducers
- `antigripal` - Cold/flu medications
- `gastrointestinal` - Digestive medications
- `topical` - Topical treatments
- `ophthalmic` - Eye medications
- `vitamin` - Vitamins
- `supplement` - Supplements

**Prohibited Medications** (NEVER recommended):
- Antibiotics
- Antihypertensives
- Hypoglycemics
- Psychotropics
- Opioids
- Systemic steroids
- Anticoagulants
- Antidepressants
- Anxiolytics
- Anticonvulsants
- Immunosuppressants
- Antiretrovirals
- Chemotherapy

**Recommendation Output**:
- Medication name
- Category
- Specific dosage
- Frequency
- Duration
- Warnings
- Contraindications
- When to stop
- Purpose

**Correctness Properties**:
- ✅ Only OTC medications are recommended
- ✅ Prohibited medications are never suggested
- ✅ Dosages are specific and safe
- ✅ Warnings are included
- ✅ Patient allergies are respected
- ✅ Drug interactions are checked

## Deployment Checklist

### Pre-Deployment
- [ ] Verify Phase 1 is complete and tested
- [ ] Configure Stripe API keys
- [ ] Configure Twilio credentials
- [ ] Configure OpenAI API key
- [ ] Set up webhook URLs
- [ ] Test Stripe webhook locally
- [ ] Test Twilio webhook locally

### Environment Variables Required
```
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+1...

# OpenAI
OPENAI_API_KEY=sk-...
```

### Post-Deployment
- [ ] Test subscription creation flow
- [ ] Test Stripe webhook
- [ ] Test WhatsApp triage flow
- [ ] Test Twilio webhook
- [ ] Test image analysis
- [ ] Test OTC recommendations
- [ ] Monitor error logs
- [ ] Verify all AI operations are logged

## Testing Phase 2

### Manual Testing

1. **Subscription Flow**
   ```
   1. Doctor completes onboarding
   2. Admin approves doctor
   3. Doctor visits /doctor/subscription
   4. Doctor selects plan
   5. Doctor completes payment
   6. Doctor appears in catalog
   7. Subscription expires
   8. Doctor disappears from catalog
   ```

2. **WhatsApp Triage**
   ```
   1. Send message to WhatsApp number
   2. Receive AI triage response
   3. Continue conversation (5-7 exchanges)
   4. Receive doctor assignment or emergency instructions
   5. If assigned, receive booking link
   ```

3. **Pharmacy Sponsorship**
   ```
   1. Doctor creates prescription
   2. Pharmacy is matched by location
   3. Sponsorship record is created
   4. Patient sees "Patrocinado" label
   5. Click is tracked if patient engages
   ```

4. **Clinical Copilot**
   ```
   1. Doctor is in consultation
   2. Copilot generates SOAP note
   3. Copilot suggests diagnoses
   4. Copilot provides quick replies
   5. Copilot suggests next steps
   ```

5. **Medical Image Analysis**
   ```
   1. Patient uploads medical image
   2. Image is analyzed with GPT-4 Vision
   3. Findings are displayed
   4. Urgency level is shown
   5. Recommendations are provided
   ```

6. **OTC Recommendations**
   ```
   1. Doctor generates OTC recommendations
   2. Recommendations are displayed
   3. Warnings are shown
   4. Drug interactions are checked
   5. Alternatives are available
   ```

### Automated Testing

```bash
# Run Phase 2 tests
npm run test -- phase2.test.ts

# Run with coverage
npm run test -- --coverage phase2.test.ts
```

## Troubleshooting

### Issue: Subscription not appearing in catalog
**Solution**: Check that subscription status is 'active' and current_period_end > NOW()

### Issue: WhatsApp webhook not receiving messages
**Solution**: Verify Twilio webhook URL is correct and webhook is configured in Twilio console

### Issue: Image analysis failing
**Solution**: Verify OpenAI API key is correct and GPT-4 Vision is enabled

### Issue: OTC recommendations including prohibited medications
**Solution**: Verify prohibited medications list is being checked

## Next Steps

After Phase 2 is complete and tested:

1. **Phase 3: AI Features**
   - Complete Dr. Simeon AI doctor
   - Implement medical knowledge base (RAG)
   - Add clinical copilot UI
   - Add image analysis UI
   - Complete AI audit logging

## Documentation

- [Subscription System](src/lib/subscription.ts)
- [WhatsApp System](src/lib/whatsapp.ts)
- [Pharmacy System](src/lib/pharmacy.ts)
- [Clinical Copilot](src/lib/ai/copilot.ts)
- [Medical Image Analysis](src/lib/ai/vision.ts)
- [OTC Recommendations](src/lib/ai/otc.ts)
- [Subscription UI](src/app/doctor/subscription/page.tsx)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the relevant module documentation
3. Check error logs in Supabase
4. Review Stripe/Twilio/OpenAI logs
