# Doctor.mx Setup Checklist

## ✅ Configuration Complete

### 1. Environment Variables
- ✅ Supabase URL configured
- ✅ Supabase Anon Key configured
- ✅ Supabase Service Role Key configured
- ✅ OpenAI API Key configured
- ✅ Stripe Test Keys configured
- ✅ Database URL configured

### 2. Dev Server
- ✅ Frontend running on http://localhost:5176/
- ⚠️  Backend API: Run `npm run dev:api` in separate terminal

---

## 🚀 Next Steps (Required)

### Step 1: Set up Database Tables
You need to run the migration SQL in Supabase:

1. **Open Supabase Dashboard:**
   https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv

2. **Go to SQL Editor** (left sidebar)

3. **Create New Query**

4. **Copy and paste** the contents of:
   `database/migrations/001_initial_schema.sql`

5. **Run the query** (click "Run" or press Cmd+Enter)

6. **Verify** - You should see tables created successfully

### Step 2: Configure Supabase Storage
For document uploads (doctor verification), you need to create a storage bucket:

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket named: `documents`
3. Set it to **Private** (not public)
4. Add policy for authenticated users to upload

### Step 3: Test the Application

**Frontend is already running!**
Visit: http://localhost:5176/

**Try these flows:**

1. **Patient Flow:**
   - Go to `/register` to create account
   - Go to `/doctor` for AI consultation
   - Test the triage system

2. **Doctor Flow:**
   - Go to `/connect` to see landing page
   - Go to `/connect/signup` to register as doctor
   - Complete verification flow
   - Access dashboard at `/connect/dashboard`

3. **Pharmacy Flow:**
   - Go to `/pharmacy/portal`
   - Test QR code scanning (once prescriptions exist)

### Step 4: Start Backend API (Optional for now)
The WhatsApp and advanced features need the backend:

```bash
npm run dev:api
```

This will start the Express server on http://localhost:8787

---

## 🧪 Testing Supabase Connection

### Quick Test in Browser Console:
Open http://localhost:5176/ and open browser console (F12), then paste:

```javascript
// Test Supabase connection
import { supabase } from './src/lib/supabase.js';
const { data, error } = await supabase.auth.getSession();
console.log('Supabase connected:', !error);
```

Or just try to register a user - if it works, Supabase is connected!

---

## 📊 Database Tables That Will Be Created

When you run the migration, these tables will be created:

- ✅ `users` - All users (patients, doctors, pharmacy staff, admin)
- ✅ `doctors` - Doctor profiles with cédula verification
- ✅ `pharmacies` - Pharmacy partner network
- ✅ `referrals` - Viral growth attribution
- ✅ `consults` - Medical consultations
- ✅ `payments` - Payment records with CFDI
- ✅ `erx` - Electronic prescriptions
- ✅ `pharmacy_fills` - Prescription fulfillment
- ✅ `credits_ledger` - Referral rewards
- ✅ `audit_trail` - Compliance logging

Plus views for analytics:
- `active_consults_view`
- `user_credits_balance`
- `pharmacy_metrics`
- `doctor_metrics`

---

## 🔧 Troubleshooting

### Frontend won't load
- Check that dev server is running: `npm run dev`
- Check browser console for errors
- Verify .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Can't register/login
- Run the database migration first!
- Check Supabase dashboard for errors
- Verify auth is enabled in Supabase

### Tables don't exist error
- You need to run the migration SQL
- Go to Supabase Dashboard → SQL Editor
- Run `database/migrations/001_initial_schema.sql`

### Doctor signup fails
- Migration must be run first
- Check that `doctors` table exists
- Check browser console for specific error

---

## 📱 Available Routes

### Public Routes
- `/` - Home page
- `/login` - Patient login
- `/register` - Patient registration

### Patient Routes (requires auth)
- `/doctor` - AI consultation chat
- `/pay/checkout` - Payment flow
- `/receipt/:id` - Receipt view

### Doctor Routes
- `/connect` - Doctor recruitment landing (public)
- `/connect/signup` - Doctor registration (public)
- `/connect/verify` - Document verification (protected)
- `/connect/dashboard` - Doctor work interface (protected)

### Pharmacy Routes (requires auth)
- `/pharmacy/portal` - QR scanning & analytics

---

## 🎯 Quick Start Summary

**5-Minute Setup:**

1. ✅ .env file is configured (already done!)
2. ⏳ Run database migration in Supabase
3. ✅ Frontend is running (http://localhost:5176)
4. ✅ Try registering a patient account
5. ✅ Try signing up as a doctor at /connect/signup

**That's it! You're ready to start testing Doctor.mx!**

---

## 💡 Tips

- Use **test mode** Stripe keys (already configured)
- Test cards: `4242 4242 4242 4242` (any future date, any CVC)
- OpenAI API will be used for AI triage (already configured)
- WhatsApp integration is optional for development

---

## 📞 Need Help?

- **Documentation:** See [README.md](./README.md)
- **API Reference:** See [API.md](./API.md)
- **Implementation Details:** See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**🎉 Ready to build the future of healthcare in Mexico! 🇲🇽**
