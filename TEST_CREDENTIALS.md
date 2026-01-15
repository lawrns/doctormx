# Test Credentials & Data

## Quick Test Flow Setup

### 1. Test Doctor Account
**Registration:**
- Email: `doctor.test@doctory.com`
- Password: `Test123456!`
- Role: **Soy Doctor**
- Name: `Dr. Juan Pérez`
- Specialty: `Medicina General`
- Professional ID: `CED-12345678`

### 2. Test Patient Account
**Registration:**
- Email: `patient.test@doctory.com`
- Password: `Test123456!`
- Role: **Soy Paciente**
- Name: `María González`

### 3. Admin Account (Database Required)
To create an admin user, run this SQL in Supabase:

```sql
-- First register normally at /auth/register, then update role:
UPDATE users 
SET role = 'admin'
WHERE email = 'admin@doctory.com';
```

**Admin Credentials:**
- Email: `admin@doctory.com`
- Password: `Admin123456!`
- Access: `/admin/doctors` (verification panel)

---

## Stripe Test Cards

Since Stripe keys are not configured yet, here are test cards for when you add them:

### Test Credit Cards (Stripe)
```
Success Card:
4242 4242 4242 4242
CVC: Any 3 digits
Expiry: Any future date

3D Secure Required:
4000 0027 6000 3184

Declined Card:
4000 0000 0000 0002

Insufficient Funds:
4000 0000 0000 9995
```

### Stripe Test Keys
Add these to `.env.local`:

```bash
# Get from: https://dashboard.stripe.com/test/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## Database Test Data

### Mock Doctor Profile (After Registration)
```
Specialty: Medicina General
License Number: CED-12345678
Bio: Médico general con 10 años de experiencia
Consultation Price: 500 MXN
Duration: 30 minutos
```

### Mock Availability
```
Monday-Friday: 9:00 AM - 5:00 PM
Saturday: 9:00 AM - 1:00 PM
Sunday: Closed
```

---

## Testing Checklist

### ✓ Flow 1: Public Booking (No Auth)
1. Go to http://localhost:3000/doctors
2. Browse doctors (will be empty until doctor registers and gets verified)
3. Click on verified doctor
4. **Expected:** See available slots WITHOUT login
5. Click "Reservar consulta"
6. **Expected:** Redirect to `/auth/login?returnUrl=...`

### ✓ Flow 2: Doctor Registration
1. Go to `/auth/register`
2. Use doctor test credentials above
3. **Expected:** Account created with `status='unverified'`
4. **Expected:** Auto-redirect to `/doctor/onboarding`

### ✓ Flow 3: One-Step Onboarding
1. After registration, should be at `/doctor/onboarding`
2. **Expected:** Single scrollable form (not wizard)
3. Fill all 3 sections:
   - Professional Info
   - Availability
   - Pricing
4. **Expected:** Badge shows "En revisión"
5. **Expected:** Can submit and configure while waiting

### ✓ Flow 4: Patient Booking
1. Register with patient credentials
2. Go to `/doctors`
3. Select verified doctor
4. Choose time slot
5. Click continue
6. **Expected:** Payment screen (won't process without Stripe)
7. Check DB: appointment is `pending_payment`

---

## Quick Database Setup

Run migrations first:

```sql
-- In Supabase SQL Editor:
-- 1. Copy content from: supabase/migrations/001_initial_schema.sql
-- 2. Paste and run in SQL Editor

-- 2. Verify doctor manually (after registration):
UPDATE doctors 
SET status = 'verified'
WHERE email = 'doctor.test@doctory.com';
```

---

## Environment Setup

Complete `.env.local`:

```bash
# Already configured ✓
NEXT_PUBLIC_SUPABASE_URL=https://oxlbametpfubwnrmrbsv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Need to add:
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_KEY

# App config ✓
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CURRENCY=MXN
```

---

## Common Issues

### "No doctors found"
- **Cause:** No verified doctors in database
- **Fix:** Register a doctor, then run SQL to verify them

### "Cannot create appointment"
- **Cause:** Database migrations not run
- **Fix:** Run `001_initial_schema.sql` in Supabase

### "Stripe error"
- **Cause:** Missing Stripe keys
- **Fix:** Add test keys from Stripe dashboard

### "User already exists"
- **Cause:** Test emails already used
- **Fix:** Use different emails or delete from Supabase auth

---

## Quick Start Command

```bash
# 1. Ensure server is running
npm run dev

# 2. Open browser
http://localhost:3000

# 3. Register doctor → Configure profile → Admin verifies → Patient books
```
