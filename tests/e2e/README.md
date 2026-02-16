# E2E Tests - Doctor.mx Telemedicine Platform

Comprehensive end-to-end test suite using Playwright for the Doctor.mx telemedicine platform.

## Overview

This test suite covers all critical user flows for both patients and doctors:

- **Patient Flows**: Registration, doctor discovery, booking, consultation, reviews
- **Doctor Flows**: Dashboard, appointments, availability management, prescriptions
- **Mobile Testing**: Responsive design across devices
- **Cross-browser Testing**: Chrome, Firefox, Safari
- **Critical Flows**: Smoke tests for core functionality

## Test Structure

```
tests/e2e/
├── patient/
│   ├── booking.spec.ts          # Complete booking journey
│   └── consultation.spec.ts      # Consultation and follow-up
├── doctor/
│   └── dashboard.spec.ts         # Doctor dashboard and workflow
├── mobile/
│   └── responsive.spec.ts        # Mobile responsiveness tests
├── critical-flows.spec.ts        # Critical smoke tests
└── helpers/
    ├── auth.helper.ts            # Authentication helpers
    ├── booking.helper.ts         # Booking flow helpers
    └── test-data.factory.ts      # Test data generators
```

## Requirements Coverage

Tests cover the following requirements from the specification:

- **Requirement 1**: Patient Discovers Doctors
- **Requirement 2**: Patient Books Appointment
- **Requirement 3**: Patient Completes Payment
- **Requirement 4**: Patient Attends Consultation
- **Requirement 5**: Doctor Registers Account
- **Requirement 6**: Doctor Completes Onboarding
- **Requirement 8**: Doctor Manages Availability
- **Requirement 9**: Doctor Conducts Consultation
- **Requirement 10**: Doctor Creates Prescription
- **Requirement 11**: Patient Rates Consultation
- **Requirement 12**: AI Pre-Consulta Triage
- **Requirement 14**: Automated Follow-Up
- **Requirement 15**: Authentication and Authorization
- **Requirement 21**: UI/UX Design System

## Prerequisites

### Install Dependencies

```bash
npm install --save-dev @playwright/test
```

### Install Playwright Browsers

```bash
npx playwright install
```

For CI environments, install all browsers:

```bash
npx playwright install --with-deps
```

### Environment Setup

Create a `.env.test` file:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key
```

## Running Tests

### Run All Tests

```bash
npm run test:e2e
```

### Run Specific Test Suite

```bash
# Patient booking tests
npx playwright test patient/booking.spec.ts

# Doctor dashboard tests
npx playwright test doctor/dashboard.spec.ts

# Mobile responsive tests
npx playwright test mobile/responsive.spec.ts

# Critical flows
npx playwright test critical-flows.spec.ts
```

### Run Tests in Specific Browser

```bash
# Chrome
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari (WebKit)
npx playwright test --project=webkit

# Mobile
npx playwright test --project="Mobile Chrome"
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

This opens a browser window and pauses execution for debugging.

### Run Tests with UI

```bash
npx playwright test --ui
```

Opens the Playwright Test UI for interactive test execution.

### Run Tests Headed

```bash
npx playwright test --headed
```

Runs tests with visible browser windows.

## Viewing Test Results

### HTML Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### JSON Report

Test results are saved to `test-results.json`.

### JUnit Report

For CI integration, results are saved to `junit-results.xml`.

### Trace Files

Failed tests include trace files for debugging:

```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

## Test Configuration

The Playwright configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3002` (configurable via `BASE_URL`)
- **Timeout**: 30 seconds per test
- **Retries**: 2 on CI, 0 locally
- **Parallel**: Fully parallel execution
- **Locale**: `es-MX` (Spanish)
- **Timezone**: `America/Mexico_City`

## Test Data

### Test Users

Default test users (should exist in test database):

```typescript
// Patient
email: 'patient@test.com'
password: 'TestPassword123!'

// Doctor
email: 'doctor@test.com'
password: 'TestPassword123!'

// Admin
email: 'admin@test.com'
password: 'AdminPassword123!'
```

### Dynamic Test Data

Use `test-data.factory.ts` to generate realistic test data:

```typescript
import { generatePatientData, generateDoctorData } from './helpers/test-data.factory';

const patient = generatePatientData();
const doctor = generateDoctorData();
```

## Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/some-page');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    const element = page.locator('selector');
    await expect(element).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Cleanup after each test
  });
});
```

### Best Practices

1. **Use data-testid attributes** for selectors to avoid coupling to implementation details
2. **Wait for networkidle** after navigation
3. **Use meaningful assertions** with custom messages
4. **Test user flows**, not implementation details
5. **Keep tests independent** - they should run in any order
6. **Use helpers** for common operations (auth, booking, etc.)
7. **Mock external services** when possible for faster, more reliable tests

### Selecting Elements

```typescript
// By data-testid (preferred)
const button = page.locator('[data-testid="submit-button"]');

// By text
const heading = page.locator('h1:has-text("Welcome")');

// By attribute
const input = page.locator('input[name="email"]');

// Complex selectors
const card = page.locator('.appointment-card').filter({ hasText: 'Dr. Pérez' });
```

### Assertions

```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).not.toBeVisible();

// Text content
await expect(element).toHaveText('Expected text');

// URL
await expect(page).toHaveURL('/expected-path');

// Count
await expect(page.locator('.card')).toHaveCount(3);

// Attribute
await expect(element).toHaveAttribute('href', '/path');
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN npx playwright install --with-deps
CMD ["npm", "run", "test:e2e"]
```

## Troubleshooting

### Tests Failing with Timeout

- Increase timeout in `playwright.config.ts`
- Check for slow network requests
- Verify application is running on correct port

### Tests Failing in CI Only

- Check for environment-specific issues
- Verify database is seeded with test data
- Check for timing issues (increase waits)

### Browser Not Found

```bash
npx playwright install
```

### Port Already in Use

Change port in `playwright.config.ts`:

```typescript
webServer: {
  command: 'npm run dev -- -p 3003',
  url: 'http://localhost:3003',
}
```

### Flaky Tests

- Add explicit waits for dynamic content
- Use `waitForLoadState('networkidle')`
- Add retry logic for non-critical assertions
- Check for race conditions in async operations

## Maintenance

### Update Tests When UI Changes

1. Update selectors if element structure changes
2. Add new test cases for new features
3. Update test data generators for new fields
4. Review and update timeout values as needed

### Regular Review

- Review test failures weekly
- Update test data regularly
- Refactor duplicate code into helpers
- Remove obsolete tests
- Add tests for new features

## Performance Tips

1. **Run tests in parallel** - Default is fully parallel
2. **Use test fixtures** - Reuse browser contexts
3. **Mock external APIs** - Reduce network dependency
4. **Seed database efficiently** - Use transactions and rollbacks
5. **Run smoke tests first** - Fail fast on critical issues

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Doctor.mx Requirements](../../.kiro/specs/doctory-telemedicine-platform/requirements.md)
- [Doctor.mx Design](../../.kiro/specs/doctory-telemedicine-platform/design.md)

## 🚀 Critical Patient Journey Tests

### Flujo E2E Completo

Los tests del flujo crítico cubren todo el viaje del paciente:

**`patient-journey.spec.ts`** - Tests del flujo crítico:

1. **Registro de Paciente** 
   - Selección de tipo de cuenta
   - Formulario de información personal
   - Verificación de email (mock)
   - Login automático

2. **Booking de Cita**
   - Búsqueda de doctores por especialidad
   - Filtrado y selección
   - Calendario de disponibilidad
   - Selección de slot

3. **Procesamiento de Pago**
   - Stripe test cards
   - Pago con tarjeta
   - Pago OXXO
   - Manejo de errores

4. **Consulta de Videollamada**
   - Acceso a sala
   - Permisos de cámara/micrófono
   - Controles de llamada
   - Calificación post-consulta

### Ejecución del Flujo Crítico

```bash
# Ejecutar todos los tests del flujo crítico
npx playwright test tests/e2e/patient-journey.spec.ts

# Ejecutar flujo completo en secuencia
npx playwright test --grep "Complete Journey"

# Ejecutar por pasos individuales
npx playwright test --grep "Step 1"  # Registro
npx playwright test --grep "Step 2"  # Booking
npx playwright test --grep "Step 3"  # Pago
npx playwright test --grep "Step 4"  # Consulta
```

### Nuevos Helpers

**`payment.helper.ts`** - Funciones para pruebas de pago:
- `stripeTestCards` - Tarjetas de test de Stripe
- `fillStripeCardForm()` - Llenar formulario de Stripe
- `completeOXXOPayment()` - Flujo de pago OXXO
- `waitForPaymentConfirmation()` - Esperar confirmación

**`consultation.helper.ts`** - Funciones para videollamadas:
- `joinConsultationRoom()` - Unirse a sala
- `grantMediaPermissions()` - Permisos de cámara/micrófono
- `toggleCamera()` / `toggleMicrophone()` - Controles
- `endConsultation()` - Finalizar consulta
- `submitConsultationRating()` - Calificación

### Tarjetas de Test de Stripe

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| Visa (éxito) | `4242424242424242` | Pago exitoso |
| Declinada | `4000000000000002` | Pago rechazado |
| Expirada | `4000000000000069` | Error de expiración |

Ver documentación completa: [SETUP.md](./SETUP.md)

## Support

For issues with E2E tests:

1. Check test logs in `test-results/` directory
2. Review screenshots and videos of failed tests
3. Use trace files for detailed debugging
4. Check application logs for errors
5. Verify test data and environment setup
6. For critical flow tests, see [CRITICAL_FLOW_TEST_RESULTS.md](./CRITICAL_FLOW_TEST_RESULTS.md)
