# Quick Test Guide - Phase 3 UX Upgrade

**Status**: ✅ All features integrated and deployed
**Database**: ✅ Migration successful
**Ready to test**: ✅ Yes

---

## 🎯 Priority 1: Test Warm Introduction (Revenue Impact)

This is the **$304K MXN/month feature** - test this first!

### Test Flow (5 minutes):

1. **Start AI Consultation**
   ```
   Navigate to: /app/ai-consulta
   ```

2. **Complete Consultation**
   - Enter symptoms (e.g., "skin rash on arms")
   - Complete all SOAP steps
   - Get AI diagnosis

3. **Look for Recommended Doctors**
   - After treatment plan, look for "Doctores Recomendados" section
   - Should show 2-3 doctors matching the diagnosis
   - Each doctor card should have specialty badge

4. **Click "Agendar cita"**
   - URL should include: `?consultationId=<some-id>`
   - Booking form should show blue badge: "✨ Referido desde tu consulta de IA"

5. **Complete Booking**
   - Fill out booking form
   - Submit appointment

6. **Verify in Database**
   ```sql
   -- Run this query in Supabase SQL editor
   SELECT
     id,
     consultation_id,
     ai_referral,
     created_at
   FROM appointments
   WHERE consultation_id IS NOT NULL
   ORDER BY created_at DESC
   LIMIT 5;
   ```

   **Expected Result**:
   - `consultation_id`: Should have a value (not null)
   - `ai_referral`: Should be `true`

---

## 🚨 Priority 2: Test Emergency Detection (Patient Safety)

### Test Cases:

**Critical Emergency** (should BLOCK consultation):
```
Symptom input: "severe chest pain radiating to my left arm and jaw"

Expected:
- Red modal appears immediately
- "🚨 EMERGENCIA MÉDICA CRÍTICA" header
- "Llama al 911 AHORA" button (on mobile: direct tel: link)
- Cannot proceed with consultation
```

**Non-Critical Emergency** (should WARN but allow):
```
Symptom input: "severe headache with blurred vision and nausea"

Expected:
- Yellow/orange banner at top
- "⚠️ Síntoma de Precaución Detectado"
- Warning message with recommendation
- Can dismiss and continue
- Can still proceed with consultation
```

**No Emergency** (should continue normally):
```
Symptom input: "mild cough and runny nose for 2 days"

Expected:
- No alerts
- Consultation proceeds normally
```

---

## 📊 Priority 3: Check Analytics Dashboard

### Run Daily Conversion Query:

```sql
-- Copy-paste this into Supabase SQL editor
SELECT
  consultation_date::date as date,
  total_consultations as consultations,
  referral_bookings as bookings,
  conversion_rate_pct as "conversion_%",
  revenue_cents / 100.0 as revenue_mxn
FROM ai_conversion_analytics
ORDER BY consultation_date DESC
LIMIT 7;
```

**What to look for**:
- Today's date should show 8+ consultations
- After your test booking, `bookings` should be ≥ 1
- Conversion % should calculate automatically
- Revenue should show if appointment is completed

---

## 🎨 Priority 4: Verify Trust Signals

1. **Go to landing page**: `/`
2. **Scroll to bottom** (just before footer)
3. **Look for trust badges**:
   - COFEPRIS logo
   - HIPAA compliance badge
   - ISO 27001 badge
   - Detailed credential text

---

## 🔘 Priority 5: Test Button Debouncing

1. **Go to AI consultation**: `/app/ai-consulta`
2. **Click "Continuar" button rapidly 5 times**
3. **Expected behavior**:
   - Button shows "Procesando..." immediately
   - Button is disabled
   - Only ONE page navigation occurs
   - No duplicate submissions
   - Smooth transition to next step

---

## 📈 Success Metrics to Track

### This Week:
- [ ] At least 3 test appointments with `consultation_id`
- [ ] Conversion rate shows in analytics (any % > 0)
- [ ] Emergency detection catches test cases correctly
- [ ] Zero database errors in logs

### Next 30 Days:
- [ ] Conversion rate: Target ≥ 25% (vs 12% baseline)
- [ ] Emergency false positive rate: < 5%
- [ ] User feedback: Positive on warm introduction

---

## 🐛 If Something Goes Wrong

### Database Issues:
```sql
-- Check if columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
  AND column_name IN ('consultation_id', 'ai_referral');

-- Check if trigger is working
SELECT * FROM appointments WHERE ai_referral = TRUE LIMIT 5;
```

### Frontend Issues:
- Check browser console for errors
- Verify `consultationId` is in URL after clicking "Agendar"
- Check Network tab for API failures

### Analytics Not Updating:
```sql
-- Manually refresh materialized view
SELECT refresh_ai_conversion_analytics();

-- Then re-query
SELECT * FROM ai_conversion_analytics ORDER BY consultation_date DESC LIMIT 1;
```

---

## 📞 Key Files Reference

If you need to review or modify code:

| Feature | File Path |
|---------|-----------|
| Warm Introduction | [src/app/app/ai-consulta/ai-consulta-client.tsx](src/app/app/ai-consulta/ai-consulta-client.tsx#L1) |
| Emergency Detection | [src/lib/ai/red-flags-enhanced.ts](src/lib/ai/red-flags-enhanced.ts#L1) |
| Booking Form | [src/app/book/[doctorId]/BookingForm.tsx](src/app/book/[doctorId]/BookingForm.tsx#L1) |
| Trust Footer | [src/components/TrustSignals.tsx](src/components/TrustSignals.tsx#L1) |
| Button Debouncing | [src/hooks/useButtonState.ts](src/hooks/useButtonState.ts#L1) |
| Payment Config | [src/lib/payment.ts](src/lib/payment.ts#L41) |

---

## ✅ Expected Results After Testing

After completing all 5 priority tests, you should see:

1. ✅ At least 1 appointment with `consultation_id` in database
2. ✅ `ai_referral` flag automatically set to `true`
3. ✅ Analytics showing conversion data
4. ✅ Emergency detection blocks/warns correctly
5. ✅ Trust signals visible on landing page
6. ✅ Buttons respond smoothly without duplicates

**Then you're ready for production! 🚀**

---

**Testing Time**: ~15 minutes for all priorities
**Created**: 2026-01-26
