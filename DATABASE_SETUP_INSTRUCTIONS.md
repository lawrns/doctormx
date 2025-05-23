# DoctorMX Database Setup Instructions

## 🚨 URGENT: Database Setup Required

The console errors you're seeing are because the Supabase database doesn't have the required tables. Follow these steps to fix this:

## Method 1: Automatic Setup (Recommended)

Run the database setup script:

```bash
node setup-database.js
```

If this works, you're done! The script will:
- Create all required database tables
- Insert sample medical knowledge data
- Test the database connection
- Confirm everything is working

## Method 2: Manual Setup (If automatic fails)

1. **Go to your Supabase Dashboard**
   - Open: https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv
   - Navigate to: SQL Editor

2. **Run the Database Setup SQL**
   - Copy the entire contents of `database-setup.sql`
   - Paste it in the SQL Editor
   - Click "Run" to execute

3. **Verify Setup**
   - Go to Table Editor
   - You should see these tables:
     - `medical_knowledge` ✅
     - `doctors` ✅
     - `medications` ✅
     - `appointments` ✅
     - `prescriptions` ✅

## Method 3: Environment Variables (Alternative)

If you can set environment variables, create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://oxlbametpfubwnrmrbsv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bGJhbWV0cGZ1Ynducm1yYnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2MjAxNjQsImV4cCI6MjA1NjE5NjE2NH0.H2_4ueekh5HVvdXBw7OX_EKWEO26kehXBRfd5HJvjgA
```

## 🧪 Test After Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the AI Doctor:**
   - Navigate to `/doctor`
   - Send a message like "tengo dolor de cabeza"
   - You should see a proper medical response (not the generic fallback)

3. **Check Console:**
   - No more 404 errors from Supabase
   - Should see: "Development mode - medical_knowledge database query successful"

## 🔧 What Each Table Does

- **`medical_knowledge`**: Contains medical terms, symptoms, and treatments for AI reference
- **`doctors`**: Directory of available doctors with specialties and contact info
- **`medications`**: Database of common medications with contraindications
- **`appointments`**: Patient appointment booking system
- **`prescriptions`**: Digital prescription management

## 🚀 Expected Results After Setup

### Before Setup (Current Issues):
❌ Console errors: `Failed to load resource: 404`  
❌ AI responses are generic fallbacks only  
❌ Mixed personality responses  
❌ Supabase connection warnings  

### After Setup:
✅ Clean console logs  
✅ AI uses real medical knowledge  
✅ Clean, professional responses  
✅ Database queries work properly  

## 🆘 Troubleshooting

### If you get permission errors:
- Make sure you're using the correct Supabase project URL
- Verify the ANON key is correctly copied
- Check that RLS policies are set up (the SQL script handles this)

### If tables already exist:
- The SQL script uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
- Data insertion uses `ON CONFLICT DO NOTHING` to avoid duplicates

### If you still see 404 errors:
1. Verify the database URL in browser: https://oxlbametpfubwnrmrbsv.supabase.co
2. Check if the project is active in Supabase dashboard
3. Confirm the medical_knowledge table exists and has data

## 📞 Support

If you're still having issues after following these steps:
1. Check the Supabase dashboard for any error messages
2. Verify the project is not paused or restricted
3. Make sure your internet connection can reach Supabase servers

---

**Status**: ⚠️ Setup Required  
**Next**: Run one of the setup methods above, then test the AI doctor functionality 