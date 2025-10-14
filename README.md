# Doctor.mx 🏥

**WhatsApp-first telemedicine platform for Mexico**

A complete MVP for connecting patients with verified doctors through WhatsApp, featuring electronic prescriptions, pharmacy integration, and Mexican payment methods (Stripe, Conekta, OXXO, SPEI).

---

## 🚀 Features

### Patient Experience
- 🤖 AI-powered triage via WhatsApp or web
- 💬 Real-time chat with verified doctors
- 💊 Electronic prescriptions (NOM-004 compliant)
- 🏪 Pharmacy integration with QR codes
- 💳 Mexican payment methods (Card, SPEI, OXXO, CoDi)
- 📱 Shareable receipts with savings highlight
- 💰 Referral credits system

### Doctor Portal (`/connect`)
- 📝 Self-serve onboarding with cédula verification
- 📥 Real-time inbox for patient consultations
- 💊 e-Prescription system with QR generation
- 💰 Transparent payout tracking
- 📊 Performance metrics and KPIs
- 🏥 NOM-004/024 compliance built-in

### Pharmacy Portal
- 📷 QR code scanning for prescription validation
- 📦 Fill status tracking (received → ready → delivered)
- 📊 Analytics dashboard with leaderboards
- 🏆 Revenue sharing and performance metrics

### Admin Features
- 🚨 Emergency red flag detection
- 📈 System-wide analytics and leaderboards
- 💸 Automated SLA refunds
- 🔍 Comprehensive audit trail
- 📋 ARCO portal for data privacy (LFPDPPP)

---

## 🏗️ Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS for styling
- Framer Motion for animations
- React Router v7 for routing

**Backend:**
- Express.js API server
- Supabase (PostgreSQL + Auth + Storage)
- OpenAI for AI triage
- WhatsApp Cloud API integration

**Payments:**
- Stripe (cards, international)
- Conekta (MX cards, OXXO, SPEI)
- OpenPay (alternative MX provider)

**Compliance:**
- NOM-004-SSA3-2012 (electronic prescriptions)
- NOM-024-SSA3-2012 (telemedicine)
- LFPDPPP (data privacy)
- CFDI 4.0 (tax receipts)

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key
- WhatsApp Business Account (optional for production)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/doctor-mx.git
cd doctory
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# WhatsApp (optional for development)
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Payments (optional for development)
STRIPE_SECRET_KEY=sk_test_your-key
CONEKTA_PRIVATE_KEY=key_your-key
```

### 4. Set up database
```bash
# Run the migration in Supabase SQL editor
# Copy contents of database/migrations/001_initial_schema.sql
```

Or use Supabase CLI:
```bash
npx supabase db push
```

### 5. Start development servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend API:**
```bash
npm run dev:api
```

The app will be available at:
- Frontend: http://localhost:5173
- API: http://localhost:8787

---

## 🗂️ Project Structure

```
doctory/
├── src/
│   ├── components/           # React components
│   │   ├── PrescriptionModal.jsx
│   │   ├── PrescriptionView.jsx
│   │   ├── ShareableReceipt.jsx
│   │   └── ...
│   ├── pages/               # Route pages
│   │   ├── ConnectLanding.jsx    # Doctor recruitment
│   │   ├── DoctorSignup.jsx      # Doctor onboarding
│   │   ├── DoctorDashboard.jsx   # Doctor portal
│   │   ├── PharmacyPortal.jsx    # Pharmacy interface
│   │   ├── PaymentCheckout.jsx   # Payment flow
│   │   └── ...
│   ├── lib/                 # Utilities
│   │   ├── supabase.js     # Supabase client
│   │   ├── api.js          # API helpers
│   │   └── toast.js        # Notifications
│   └── main.jsx            # App entry point
├── server/
│   ├── index.ts            # Express API server
│   ├── triage.ts           # Red flag detection
│   ├── providers/          # External services
│   │   ├── openai.ts      # AI chat
│   │   ├── places.ts      # Google Places
│   │   └── orchestrator.ts
│   └── services/
│       └── whatsapp/      # WhatsApp integration
├── database/
│   └── migrations/        # SQL migrations
├── API.md                 # Complete API docs
└── README.md             # This file
```

---

## 🎯 Key Routes

### Public
- `/` - Home page
- `/register` - Patient registration
- `/login` - Login

### Doctor Portal
- `/connect` - Doctor recruitment landing
- `/connect/signup` - Doctor registration
- `/connect/verify` - Document verification
- `/connect/dashboard` - Doctor inbox & tools

### Patient
- `/doctor` - AI consultation chat
- `/pay/checkout` - Payment flow
- `/receipt/:id` - Shareable receipt

### Pharmacy
- `/pharmacy/portal` - QR scanning & analytics

---

## 🔧 Configuration

### WhatsApp Setup
See [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md) for detailed instructions on:
1. Creating a Meta Business account
2. Setting up WhatsApp Business API
3. Configuring webhooks
4. Testing message flows

### Payment Providers

**Stripe:**
```bash
# Test mode
STRIPE_SECRET_KEY=sk_test_...
```

**Conekta:**
```bash
# Test mode
CONEKTA_PRIVATE_KEY=key_test_...
```

### Database Schema
Complete schema with all tables, indexes, and RLS policies is in:
`database/migrations/001_initial_schema.sql`

Key tables:
- `users` - All users (patients, doctors, pharmacy, admin)
- `doctors` - Doctor profiles with verification
- `consults` - Medical consultations
- `erx` - Electronic prescriptions
- `pharmacy_fills` - Prescription fulfillment
- `payments` - Payment records with CFDI
- `credits_ledger` - Referral rewards
- `audit_trail` - Compliance logging

---

## 📊 Database Views

Pre-built views for common queries:
- `active_consults_view` - Live consultations with patient/doctor info
- `user_credits_balance` - Credit balances per user
- `pharmacy_metrics` - Performance stats per pharmacy
- `doctor_metrics` - Doctor KPIs

---

## 🧪 Testing

### Run linter
```bash
npm run lint
```

### Manual testing checklist
- [ ] Patient can register and login
- [ ] AI triage detects red flags correctly
- [ ] Doctor can sign up and verify
- [ ] Doctor sees consults in inbox
- [ ] Doctor can issue e-prescription
- [ ] Pharmacy can scan and claim prescription
- [ ] Payment flow works (test cards)
- [ ] Receipt shows correct savings
- [ ] WhatsApp messages send/receive

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend API (Railway/Render/Fly.io)
```bash
# Set environment variables
# Deploy server/ folder with npm run dev:api as start command
```

### Database (Supabase)
Already hosted. Just run migrations.

### Environment Variables
Set all production keys in your hosting platform:
- Supabase credentials
- OpenAI API key
- WhatsApp tokens
- Payment provider keys
- SMTP for emails (optional)

---

## 📱 WhatsApp Templates

Pre-approved message templates in `server/services/whatsapp/`:
- `TRIAGE_START` - Initial greeting
- `CONSENT_HEALTH_DATA` - Privacy consent
- `PAYMENT_LINK` - Payment CTA
- `RX_READY` - Prescription ready
- `ER_ALERT` - Emergency redirect
- `REFERRAL_AFTER_RX` - Viral share prompt

---

## 🔐 Security & Compliance

### Row Level Security (RLS)
All sensitive tables have RLS enabled:
- Users can only see their own data
- Doctors see assigned consults
- Pharmacy sees claimed prescriptions
- Admin has full access

### Audit Trail
All important actions logged:
- PHI access
- Prescription issuance
- Payment transactions
- Emergency redirects

### Data Encryption
- At-rest: Supabase pgcrypto for sensitive fields
- In-transit: SSL/TLS everywhere
- Passwords: bcrypt hashing

---

## 📈 Roadmap

**Sprint 1 (Weeks 1-2)** ✅
- [x] WhatsApp webhook integration
- [x] Emergency red flag detection
- [x] Shareable receipt with savings
- [x] Credits ledger

**Sprint 2 (Weeks 3-4)** ✅
- [x] Doctor onboarding flow
- [x] Payment checkout (Stripe/Conekta)
- [x] Payout configuration

**Sprint 3 (Weeks 5-6)** ✅
- [x] e-Prescription system
- [x] Pharmacy portal with QR
- [x] Analytics dashboards

**Sprint 4 (Weeks 7-8)** 🚧
- [ ] Fast-Pass SLA engine
- [ ] ARCO privacy portal
- [ ] Automated CFDI generation
- [ ] Nurse callback for emergencies

**Future**
- [ ] Video consultations
- [ ] Family plan (multi-user accounts)
- [ ] Employer/university partnerships
- [ ] Mobile apps (iOS/Android)
- [ ] Medication adherence tracking
- [ ] AI-powered diagnosis suggestions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🆘 Support

- **Documentation:** [API.md](./API.md)
- **WhatsApp Setup:** [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md)
- **Issues:** https://github.com/yourusername/doctor-mx/issues
- **Email:** support@doctor.mx

---

## 👥 Team

Built with ❤️ for healthcare accessibility in Mexico.

- **Medical Advisor:** TBD
- **Legal Compliance:** TBD
- **Pharmacy Partners:** Farmacia Piloto (pilot program)

---

## 🙏 Acknowledgments

- Meta for WhatsApp Cloud API
- OpenAI for GPT-4 triage
- Supabase for amazing backend infrastructure
- Mexican healthcare community for guidance on NOM compliance

---

**Made in Mexico 🇲🇽 • Para México 💚**
