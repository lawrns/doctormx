x# Doctor.mx - Complete User Flows & Site Logic

## System Architecture
- **Platform:** WhatsApp-first telemedicine with web interface
- **Stack:** React + Express + Supabase PostgreSQL
- **AI:** OpenAI GPT-4, Vapi AI (voice), Vision API (images)
- **Payment:** Stripe
- **Auth:** Supabase with role-based access

## User Roles
1. **Patient** - Medical consultation seekers (5 free questions)
2. **Doctor** - Verified medical professionals (subscription-based)
3. **Admin** - Platform administrators (verification & moderation)
4. **Pharmacy** - Prescription fulfillment partners

---

# PATIENT FLOWS

## 1. Registration & Onboarding
```
Home → Register → Form (email, password, name, phone) → Submit → 
Email Verification → Auto-login → Dashboard → 
Welcome (5 free questions) → CTA: Start Consultation
```

**Features:**
- Email/password validation
- Terms acceptance
- Free questions allocation (5)
- Gamification setup
- Health goals initialization

## 2. AI Medical Consultation (Core Feature)
```
Dashboard/Home → "Consultar IA" → Check Free Questions →
Chat Interface → Input Symptoms → AI Triage (Red Flag Detection) →
AI Response (GPT-4) → Follow-up Options →
Decrement Free Questions → Award Points
```

**Key Logic:**
- **Free Questions Check:** If remaining > 0, proceed; else show payment
- **Red Flag Detection:** Emergency keywords trigger urgent alerts
- **AI Processing:** Symptom analysis → Possible conditions → Recommendations
- **Emergency Handling:** Critical symptoms → 911 alert + ER redirect

**Features:**
- Chat history
- Quick reply options
- Severity widget (1-10)
- AI personality selector
- Emergency alert banner
- Image upload option
- Follow-up questions

## 3. Doctor Referral & Booking
```
AI Suggests Referral → /ai-referrals → AI Matching Algorithm →
Display 5 Matched Doctors → Select Doctor → Doctor Profile →
Choose Date/Time → Payment (if paid) → Confirmation →
Reminders (24h, 1h) → Consultation → Post-Consultation Review
```

**Matching Algorithm:**
```sql
SELECT * FROM doctors 
WHERE license_status = 'verified'
  AND specialties CONTAINS required_specialty
  AND consultation_fees <= max_budget
ORDER BY rating_avg DESC, response_time_avg ASC
LIMIT 5
```

**Features:**
- Specialty filtering
- Location-based search
- Price range filtering
- Availability calendar
- Rating/review display
- Insurance verification
- Multiple consultation types (chat/video/in-person)

## 4. Vision/Image Analysis
```
Dashboard → "Análisis de Imágenes" → Upload Image →
Add Context (symptoms, duration) → AI Vision Analysis →
Generate Report (conditions, severity, recommendations) →
Follow-up Actions (doctor referral, save to records)
```

**Analysis Types:**
- Dermatology (skin conditions, moles, rashes)
- Radiology (X-rays, scans)
- Lab results interpretation
- Medication identification

## 5. Payment & Subscription
```
Free Questions = 0 → Payment Options → Select Plan →
/pay/checkout → Enter Payment (Stripe) → Apply Discount →
Process Payment → Success → Add Questions/Activate Subscription →
Receipt + Email Confirmation
```

**Pricing:**
- Single consultation: $79 MXN
- 10 questions pack: $500 MXN
- Monthly unlimited: $299 MXN
- Annual unlimited: $2,999 MXN (17% off)
- Family plan: $499 MXN (5 members)

**Payment Methods:**
- Credit/debit card (Stripe)
- SPEI transfer
- OXXO payment
- CODI (QR code)

## 6. Community Features
```
Dashboard → "Comunidad" → Community Feed →
Browse Posts (stories, questions, tips) → Create Post →
AI Moderation → Publish → Engagement (like, comment, share) →
Expert Q&A → Health Challenges → Earn Badges
```

**Post Types:**
- Health journey stories
- Community questions
- Tips & advice
- Success stories
- Support requests

## 7. Gamification & Rewards
```
Dashboard → Points Display → /gamification →
View Points, Level, Achievements → Complete Activities →
Earn Points → Unlock Achievements → Leaderboard →
Set Health Goals → Track Progress → Redeem Rewards
```

**Point Activities:**
- Complete consultation: +50
- Daily login: +5
- Health goal achieved: +100
- Community post: +10
- Referral signup: +200
- Streak bonus: +X/day

**Rewards:**
- Free consultations
- Discount codes
- Premium features
- Merchandise

## 8. Health Marketplace
```
Dashboard → "Tienda" → Browse Products (medications, supplements, devices) →
Product Detail → Add to Cart → Checkout →
Shipping Address → Payment → Order Confirmation →
Track Shipment → Delivery
```

---

# DOCTOR FLOWS

## 1. Registration & Onboarding
```
/connect Landing → "Únete Ahora" → /connect/signup →
Registration Form (personal, professional, documents) →
Submit → Verification Queue → Admin Reviews →
Cédula SEP Verification → Approved/Rejected →
/connect/subscription-setup → Select Plan → Payment →
Profile Completion (bio, fees, availability) →
/connect/dashboard → Profile Live
```

**Required Documents:**
- Cédula profesional (medical license)
- ID/passport
- Specialty certification
- Professional photo

**Verification Process:**
- SEP database check (cédula authenticity)
- Specialty certification review
- Identity verification
- Background check
- 24-48 hour review time

**Subscription Plans:**
- Basic: $299/mo (50 consults, 15% fee)
- Professional: $499/mo (unlimited, 10% fee) ⭐
- Premium: $799/mo (unlimited, 8% fee, dedicated manager)

## 2. Doctor Dashboard & Consultations
```
/connect/dashboard → View Queue (pending, active, scheduled) →
Accept Consultation → Consultation Interface →
Review Patient Info → Conduct Consultation (chat/video) →
Create Treatment Plan (prescription, referral, follow-up) →
Complete Consultation → Patient Receives Summary →
Update Earnings → Request Review
```

**Dashboard Sections:**
- Quick stats (consultations, earnings, rating)
- Consultation queue
- Earnings summary
- Performance metrics
- Upcoming appointments
- Quick actions

**Consultation Tools:**
- Patient medical history
- Real-time chat/video
- SOAP notes template
- Prescription writer
- Lab order form
- Referral generator
- Follow-up scheduler

## 3. Prescription Management
```
During Consultation → Create Prescription →
Select Medication (database search) → Dosage & Duration →
Add Instructions → Review → Sign Digitally →
Send to Patient → Route to Pharmacy (optional) →
Track Fulfillment → Patient Receives Medication
```

**E-Prescription Features:**
- Medication database search
- Dosage calculator
- Drug interaction checker
- Allergy alerts
- Digital signature
- Pharmacy routing
- Refill management

## 4. Availability Management
```
Dashboard → "Gestionar Disponibilidad" → Calendar View →
Set Working Hours → Block Time Slots → Set Consultation Duration →
Configure Buffer Time → Save → Sync with Booking System →
Patients See Updated Availability
```

## 5. Earnings & Payouts
```
Dashboard → "Ingresos" → View Earnings (daily, weekly, monthly) →
Consultation Breakdown → Platform Fees → Net Earnings →
Payout Schedule → Request Payout → Bank Transfer →
Tax Documents (CFDI invoices)
```

**Payout Logic:**
```
Gross Earnings - Platform Fee = Net Earnings
Payout Schedule: Weekly (minimum $500 MXN)
Payment Method: Bank transfer (SPEI)
Tax: CFDI 4.0 compliant invoices
```

## 6. Performance Analytics
```
Dashboard → "Analíticas" → View Metrics:
- Patient satisfaction score
- Average response time
- Consultation completion rate
- Referral acceptance rate
- Revenue trends
- Patient retention
- Peak hours analysis
```

## 7. Profile & Reputation Management
```
Dashboard → "Mi Perfil" → Edit Profile →
Update Bio, Photo, Credentials → Set Consultation Fees →
Manage Certifications → View Reviews → Respond to Reviews →
Track Rating → Improve Profile Visibility
```

---

# ADMIN FLOWS

## 1. Doctor Verification Queue
```
Admin Login → /admin/verification → View Pending Doctors →
Select Doctor → Review Documents →
Verify Cédula (SEP API) → Check Certifications →
Background Check → Approve/Reject → Notify Doctor →
Update license_status
```

**Verification Checklist:**
- [ ] Cédula authentic (SEP database)
- [ ] Specialty certification valid
- [ ] Identity verified
- [ ] No sanctions/complaints
- [ ] Professional references checked

## 2. Content Moderation
```
Admin Dashboard → Flagged Content → Review Post/Comment →
Check Community Guidelines → Approve/Remove/Warn →
Notify User → Update Moderation Log
```

## 3. Platform Analytics
```
Admin Dashboard → Analytics → View Metrics:
- Total users (patients, doctors)
- Consultations (daily, weekly, monthly)
- Revenue (gross, net, by category)
- User acquisition (sources, conversion)
- Retention rates
- Churn analysis
- Geographic distribution
- Popular specialties
```

## 4. Support & Dispute Resolution
```
Support Dashboard → View Tickets → Assign to Agent →
Review Issue → Contact User/Doctor → Investigate →
Resolve Dispute → Refund (if applicable) → Close Ticket →
Follow-up Survey
```

---

# PHARMACY FLOWS

## 1. Prescription Management
```
Pharmacy Login → /pharmacy/portal → View Incoming Prescriptions →
Accept Prescription → Verify Medication Availability →
Prepare Order → Update Status → Notify Patient →
Arrange Delivery/Pickup → Mark Fulfilled →
Update Inventory
```

## 2. Inventory Management
```
Portal → "Inventario" → View Stock Levels →
Low Stock Alerts → Reorder Medications →
Update Prices → Manage Suppliers →
Track Expiration Dates
```

---

# KEY SYSTEM LOGIC

## Free Questions System
```javascript
// Before each consultation
if (user.free_questions_remaining > 0) {
  allowConsultation();
  user.free_questions_remaining--;
  saveUser();
} else {
  showPaymentModal();
}
```

## Red Flag Detection
```javascript
const redFlags = [
  'dolor de pecho', 'dificultad para respirar',
  'sangrado severo', 'pérdida de consciencia',
  'convulsiones', 'dolor intenso'
];

if (symptomContainsRedFlag(userInput)) {
  showEmergencyAlert();
  updateConsultStatus('er_redirect');
  notifyAdmin();
}
```

## Doctor Matching Algorithm
```javascript
function matchDoctors(criteria) {
  return doctors
    .filter(d => d.license_status === 'verified')
    .filter(d => d.specialties.includes(criteria.specialty))
    .filter(d => d.consultation_fees <= criteria.maxFee)
    .sort((a, b) => {
      if (a.rating_avg !== b.rating_avg) 
        return b.rating_avg - a.rating_avg;
      return a.response_time_avg - b.response_time_avg;
    })
    .slice(0, 5);
}
```

## Payment Processing
```javascript
async function processPayment(amount, userId) {
  const intent = await stripe.createPaymentIntent({
    amount: amount * 100, // cents
    currency: 'mxn',
    customer: userId
  });
  
  if (intent.status === 'succeeded') {
    await updateUserQuestions(userId, questionsToAdd);
    await generateReceipt(userId, amount);
    await sendConfirmationEmail(userId);
  }
}
```

## Gamification Points
```javascript
const pointsMap = {
  consultation_complete: 50,
  daily_login: 5,
  goal_achieved: 100,
  community_post: 10,
  helpful_answer: 25,
  referral_signup: 200,
  profile_complete: 30,
  health_data_upload: 15
};

function awardPoints(userId, action) {
  const points = pointsMap[action];
  user.health_points += points;
  checkAchievements(userId);
  updateLeaderboard(userId);
}
```

---

# CRITICAL USER JOURNEYS

## Journey 1: First-Time Patient Consultation
```
Register → Verify Email → Dashboard → See "5 Free Questions" →
Click "Consultar IA" → Type Symptoms → Receive AI Analysis →
Get Doctor Referral → Browse Matched Doctors → Book Appointment →
Pay for Consultation → Attend Consultation → Receive Prescription →
Rate Doctor → Earn Points
```

## Journey 2: Doctor Onboarding to First Payout
```
Visit /connect → Sign Up → Upload Documents → Wait for Verification →
Approved → Choose Subscription → Pay → Complete Profile →
Set Availability → Go Live → Receive First Consultation Request →
Accept → Conduct Consultation → Complete → Earn Fee →
Accumulate $500 → Request Payout → Receive Payment
```

## Journey 3: Emergency Consultation
```
Patient Has Chest Pain → Opens App → Types "dolor de pecho intenso" →
AI Detects Red Flag → Emergency Alert Displayed →
Options: Call 911 / Go to ER / Urgent Doctor →
Patient Clicks "Urgent Doctor" → Priority Matching →
Doctor Accepts Immediately → Video Consultation Starts →
Doctor Assesses → Advises ER Visit → Consultation Ends →
Follow-up Scheduled
```

---

**Total Routes:** 29 (12 public, 17 protected)  
**Total Features:** 50+  
**User Roles:** 4  
**Payment Methods:** 4  
**AI Integrations:** 3 (Chat, Vision, Voice)
