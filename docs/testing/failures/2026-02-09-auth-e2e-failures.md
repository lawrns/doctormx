# E2E Auth Test Failures - 2026-02-09

## Test Run Status
- **Status:** Failed
- **Date:** 2026-02-09
- **Failed Tests:** 2

## Failed Test IDs
1. `d748ac400d08b85935ef-4c6b26825a184ced7333`
2. `b233241c4a0b814ace63-ba745273d87a35b47bd4`

## Test Context Snapshot

The test `auth-Authentication-Flows-should-show-auth-form-elements` captured the following page state:

```
Page: /auth/register
Progress: "Paso 1 de 3" (33%)
Elements present:
  - Doctor.mx logo/link
  - Heading: "Selecciona tu cuenta"
  - Prompt: "¿Eres paciente o médico?"
  - Radio options:
    * "Soy paciente - Busco atención médica" (checked)
    * "Soy médico - Ofreceré servicios médicos"
  - Button: "Siguiente"
  - Link: "¿Ya tienes cuenta? Inicia sesión" → /auth/login
  - Link: "Volver al inicio" → /
```

## Screenshot Location
Original screenshot was at:
`test-results/auth-Authentication-Flows-should-show-auth-form-elements-chromium/test-failed-1.png`

## How to Reproduce
```bash
npm run test:e2e
# Or specifically:
npx playwright test auth
```

## Next Steps
1. Run test locally to see current state
2. Check if selectors have changed
3. Verify the auth flow matches the captured state
4. Update test expectations if UI has changed
