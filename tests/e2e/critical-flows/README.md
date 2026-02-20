# Critical Flows E2E Tests (TST-005)

This directory contains end-to-end tests for the most critical user journeys in Doctor.mx.

## Test Files

### 1. booking-flow.spec.ts
Tests the complete booking journey from doctor discovery to appointment confirmation.

**Scenarios Covered:**
- New patient registration to first booking
- Existing patient complete booking flow
- Doctor search and filtering
- Date/time slot selection
- Mobile booking experience

**Key Test Cases:**
- `should complete full journey from landing to booking confirmation`
- `should complete booking flow with date and time selection`
- `should handle slot unavailability gracefully`
- `should validate required fields before booking`

### 2. consultation-flow.spec.ts
Tests the video consultation experience for both patients and doctors.

**Scenarios Covered:**
- Patient joins video consultation room
- Doctor joins consultation room
- In-consultation features (mute, camera, screen share)
- Post-consultation actions (rating, prescription access)
- Error handling (invalid rooms, permissions)
- Mobile video consultation

**Key Test Cases:**
- `should access consultation room and view appointment details`
- `should display video room with proper permissions`
- `should handle video controls during consultation`
- `should allow patient to rate consultation`

### 3. payment-flow.spec.ts
Tests the payment integration with Stripe and OXXO.

**Scenarios Covered:**
- Credit card payment (Visa, Mastercard)
- OXXO payment flow
- Payment validation and errors
- Payment security
- Mobile payment experience

**Key Test Cases:**
- `should complete payment with valid Visa card`
- `should handle declined card`
- `should complete OXXO payment flow`
- `should use HTTPS for payment pages`

### 4. emergency-flow.spec.ts
Tests the emergency detection and escalation system.

**Scenarios Covered:**
- Emergency symptom detection in AI consulta
- 911 emergency redirection
- Priority queue escalation
- Emergency contact notification
- Post-emergency follow-up
- Mobile emergency experience

**Key Test Cases:**
- `should detect emergency symptoms and trigger alert`
- `should provide 911 calling option`
- `should escalate urgent cases to priority queue`
- `should detect stroke symptoms`

## Running the Tests

### Run all critical flow tests:
```bash
npm run test:e2e -- tests/e2e/critical-flows/
```

### Run specific test file:
```bash
npm run test:e2e -- tests/e2e/critical-flows/booking-flow.spec.ts
```

### Run with UI mode for debugging:
```bash
npm run test:e2e:ui -- tests/e2e/critical-flows/
```

### Run in headed mode:
```bash
npm run test:e2e:headed -- tests/e2e/critical-flows/
```

## Test Data Factories

The tests use data factories located in `tests/fixtures/test-data.ts`:

- `patientFactory` - Generate patient test data
- `doctorFactory` - Generate doctor test data
- `appointmentFactory` - Generate appointment test data
- `paymentFactory` - Generate payment test data (including Stripe test cards)
- `emergencyFactory` - Generate emergency scenario data

## Test Helpers

Utility functions in `tests/utils/test-helpers.ts`:

- `auth.loginAsPatient()` - Authenticate as test patient
- `auth.loginAsDoctor()` - Authenticate as test doctor
- `stripePayment.fillCardElement()` - Fill Stripe card details
- `videoConsultation.grantPermissions()` - Grant camera/mic permissions

## Stripe Test Cards

| Card Number | Type | Expected Result |
|------------|------|-----------------|
| 4242424242424242 | Visa | Success |
| 5555555555554444 | Mastercard | Success |
| 4000000000000002 | Visa | Declined |
| 4000000000009995 | Visa | Insufficient funds |
| 4000000000000069 | Visa | Expired card |

## CI Configuration

These tests are configured to run in CI with:
- 2 retries on failure
- Screenshots on failure
- Video recording on failure
- Traces for debugging

## Notes

- Tests use the test patient account: `patient@test.com` / `TestPassword123!`
- Tests use the test doctor account: `doctor@test.com` / `TestPassword123!`
- Mobile tests use iPhone SE viewport (375x667)
- All tests run against the base URL configured in `playwright.config.ts`
