# Doctory v2 - Testing Guide

## Quick Start

### Access the Application

- **Dev Server**: http://localhost:3001
- **Port**: 3001 (3000 was in use)

### Available Test Credentials

See `.env.local` for configured services:

- Supabase: Configured with test project
- Stripe: Test mode enabled (pk_test_...)
- Twilio: Test credentials configured
- OpenAI: API key configured

## Testing Flows

### 1. Patient Registration & Login

```
1. Go to http://localhost:3001/auth/register
2. Fill in:
   - Full Name: Test Patient
   - Email: patient@test.com
   - Phone: 5512345678
   - Password: TestPassword123
3. Click "Registrarse"
4. Should redirect to /app (patient dashboard)
```

### 2. Doctor Registration & Onboarding

```
1. Go to http://localhost:3001/auth/register?type=doctor
2. Fill in doctor registration form
3. Should redirect to /doctor/onboarding
4. Complete doctor profile setup
5. Set availability and pricing
```

### 3. Doctor Search & Booking

```
1. Go to http://localhost:3001/doctors
2. Browse available doctors
3. Click on a doctor to view profile
4. Click "Agendar Consulta"
5. Select date and time
6. Complete pre-consultation AI chat (if enabled)
7. Proceed to payment
```

### 4. Payment Flow

```
1. After booking, go to checkout page
2. Use Stripe test card: 4242 4242 4242 4242
3. Expiry: Any future date (e.g., 12/25)
4. CVC: Any 3 digits (e.g., 123)
5. Should redirect to /payment-success
```

### 5. Live Consultation

```
1. Go to /app (patient dashboard)
2. Find upcoming appointment
3. Click "Iniciar Consulta"
4. Should open consultation room
5. Test video/audio (if configured)
```

### 6. Doctor Dashboard

```
1. Login as doctor
2. Go to /doctor
3. View appointments
4. Manage availability
5. View finances
6. Create prescriptions
```

## Running Tests

### Property-Based Tests

```bash
# Run all tests once
npm run test -- --run

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# Run specific test file
npm run test -- --run src/lib/__tests__/auth.property.test.ts
```

### Code Quality

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Both
npm run preflight
```

## Testing Checklist

### Authentication (Property 4 & 5)

- [ ] Unauthenticated users redirected to login
- [ ] Redirect URL preserved with query parameters
- [ ] Patient ID from session only (not request body)
- [ ] Malicious patient ID in body ignored

### Booking Flow

- [ ] Date selection works
- [ ] Time slots load correctly
- [ ] Pre-consultation AI chat displays
- [ ] Booking creates appointment
- [ ] Appointment appears in dashboard

### Payment

- [ ] Payment intent created
- [ ] Stripe form displays
- [ ] Test card accepted
- [ ] Payment confirmed
- [ ] Appointment marked as paid

### Notifications

- [ ] Email sent on booking
- [ ] WhatsApp message sent (if configured)
- [ ] SMS sent (if configured)
- [ ] Notifications appear in dashboard

### AI Features

- [ ] Pre-consultation chat works
- [ ] Dr. Simeon responds appropriately
- [ ] OPQRST methodology applied
- [ ] Red flags detected
- [ ] Severity classification shown

### Doctor Features

- [ ] Doctor can set availability
- [ ] Doctor can view appointments
- [ ] Doctor can create prescriptions
- [ ] Doctor can view earnings
- [ ] Doctor can update profile

## Debugging

### Check Dev Server Logs

```bash
# View process output
npm run dev
```

### Check Database

- Supabase Dashboard: https://app.supabase.com
- Project: lbxfierdgiewuslpgrhs
- Tables: profiles, doctors, appointments, etc.

### Check API Responses

- Open browser DevTools (F12)
- Go to Network tab
- Make requests and inspect responses
- Check Console for errors

### Common Issues

**Issue**: Port 3000 in use

- **Solution**: Dev server uses 3001 instead

**Issue**: useSearchParams error

- **Solution**: Already fixed with Suspense boundaries

**Issue**: Stripe test card declined

- **Solution**: Use 4242 4242 4242 4242 in test mode

**Issue**: Supabase connection error

- **Solution**: Check .env.local has correct URL and keys

## Performance Testing

### Build Performance

```bash
npm run build
# Should complete in ~10 seconds
```

### Dev Server Performance

- Hot reload should be instant
- Page navigation should be smooth
- No console errors

### Test Performance

- Property tests run 100 iterations each
- Total test time: ~2-3 minutes
- Can reduce iterations in vitest.config.ts if needed

## Continuous Testing

### Watch Mode

```bash
# Tests re-run on file changes
npm run test

# Type checking on save
npm run typecheck

# Linting on save
npm run lint
```

## Spec Reference

For detailed requirements and design, see:

- `.kiro/specs/doctory-telemedicine-platform/requirements.md` - 25 requirements
- `.kiro/specs/doctory-telemedicine-platform/design.md` - Architecture & 32
  correctness properties
- `.kiro/specs/doctory-telemedicine-platform/tasks.md` - 27 implementation tasks

## Next Steps

1. **Manual Testing**: Follow the testing flows above
2. **Automated Testing**: Run property-based tests
3. **Load Testing**: Test with multiple concurrent users
4. **Security Testing**: Verify authentication and authorization
5. **Integration Testing**: Test all external services
6. **Performance Testing**: Measure response times and throughput

## Support

For issues or questions:

1. Check the TESTING_REPORT.md for known issues
2. Review the spec files for requirements
3. Check .env.local for configuration
4. Review console logs for errors
5. Check Supabase dashboard for database issues
