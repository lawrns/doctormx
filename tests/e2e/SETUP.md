# 🧪 E2E Test Setup Guide

Guía completa para configurar y ejecutar los tests E2E del flujo crítico de DoctorMX.

## 📋 Requisitos Previos

- Node.js 16+ 
- npm o bun
- Playwright instalado
- Stripe account (test mode)
- Daily.co account (para videollamadas)

## 🚀 Instalación

### 1. Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Instalar navegadores de Playwright
npx playwright install

# Instalar navegadores adicionales (opcional)
npx playwright install chromium firefox webkit
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.test` en la raíz del proyecto:

```env
# Base URL para tests
BASE_URL=http://localhost:3002

# Stripe Test Keys
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Supabase (Test Database)
SUPABASE_URL=https://your-test-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Daily.co (Video)
DAILY_API_KEY=your-daily-api-key

# Test User Credentials (opcional)
TEST_PATIENT_EMAIL=patient@test.com
TEST_PATIENT_PASSWORD=TestPassword123!
TEST_DOCTOR_EMAIL=doctor@test.com
TEST_DOCTOR_PASSWORD=TestPassword123!
```

### 3. Preparar Base de Datos de Test

```bash
# Ejecutar seeds de test
npm run db:seed:test

# O crear usuarios de test manualmente
npm run test:setup
```

## 🏃 Ejecución de Tests

### Ejecutar Todos los Tests E2E

```bash
# Headless (CI)
npm run test:e2e

# Con UI interactiva
npm run test:e2e:ui

# Con navegador visible
npm run test:e2e:headed

# Modo debug
npm run test:e2e:debug
```

### Ejecutar Tests Específicos

```bash
# Solo el flujo crítico completo
npx playwright test tests/e2e/patient-journey.spec.ts

# Solo tests de autenticación
npx playwright test tests/e2e/auth/

# Solo tests de booking
npx playwright test tests/e2e/patient/booking.spec.ts

# Solo tests de pago
npx playwright test tests/e2e/patient-journey.spec.ts --grep "Payment"

# Solo tests de consulta
npx playwright test tests/e2e/patient/consultation.spec.ts
```

### Ejecutar por Navegador

```bash
# Chrome/Chromium
npx playwright test --project=chromium

# Firefox
npx playwright test --project=firefox

# Safari/WebKit
npx playwright test --project=webkit

# Móviles
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## 🧪 Tests Específicos del Flujo Crítico

### 1. Registro → Booking → Pago → Consulta (Completo)

```bash
npx playwright test tests/e2e/patient-journey.spec.ts --grep "Complete Journey"
```

Este test ejecuta todo el flujo en secuencia:
1. Registro de nuevo paciente
2. Búsqueda y selección de doctor
3. Booking de cita
4. Pago con Stripe (test)
5. Acceso a sala de consulta

### 2. Solo Registro

```bash
npx playwright test tests/e2e/patient-journey.spec.ts --grep "Step 1"
```

### 3. Solo Booking

```bash
npx playwright test tests/e2e/patient-journey.spec.ts --grep "Step 2"
```

### 4. Solo Pago

```bash
npx playwright test tests/e2e/patient-journey.spec.ts --grep "Step 3"
```

### 5. Solo Consulta

```bash
npx playwright test tests/e2e/patient-journey.spec.ts --grep "Step 4"
```

## 💳 Tarjetas de Test de Stripe

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| Visa (éxito) | `4242424242424242` | Pago exitoso |
| Mastercard (éxito) | `5555555555554444` | Pago exitoso |
| Declinada | `4000000000000002` | Pago rechazado |
| Fondos insuficientes | `4000000000009995` | Pago rechazado |
| Tarjeta expirada | `4000000000000069` | Error de expiración |
| CVC incorrecto | `4000000000000127` | Error de CVC |
| Requiere 3DS | `4000002500003155` | Autenticación requerida |

### Datos Adicionales para Tests

- **Expiración**: Cualquier fecha futura (ej: `12/25`)
- **CVC**: Cualquier 3 dígitos (4 para AMEX)
- **ZIP**: `06600` (México), `90210` (US)

## 🔧 Configuración Avanzada

### Ejecutar Tests en Paralelo

```bash
# Workers paralelos (por defecto usa CPUs disponibles)
npx playwright test --workers=4

# Desactivar paralelismo
npx playwright test --workers=1
```

### Ejecutar con Retries

```bash
# Retry en fallos
npx playwright test --retries=2
```

### Filtrar Tests

```bash
# Por título
npx playwright test --grep "registration"

# Excluir tests
npx playwright test --grep-invert "mobile"
```

## 📊 Reportes

### Ver Reporte HTML

```bash
# Mostrar reporte después de ejecución
npm run test:e2e:report

# O abrir directamente
npx playwright show-report
```

### Generar Reportes Adicionales

```bash
# JSON
npx playwright test --reporter=json

# JUnit (para CI)
npx playwright test --reporter=junit

# Múltiples formatos
npx playwright test --reporter=list,html,json
```

## 🐛 Debug

### Modo Debug UI

```bash
npx playwright test --ui
```

### Debug con Breakpoints

```bash
npx playwright test --debug
```

### Capturas de Pantalla y Videos

Los tests automáticamente generan:
- 📸 Screenshots en fallos
- 🎥 Videos en fallos
- 📋 Traces para debugging

Ubicación: `test-results/`

### Inspeccionar Estado del Test

```typescript
// En tu test, agregar:
await page.pause(); // Pausa para inspección manual
```

## 🔒 Consideraciones de Seguridad

### Datos de Test

- ✅ Usar **solo** datos de test (emails con dominio `@test.com`)
- ✅ Usar tarjetas de **Stripe test mode**
- ✅ No usar credenciales reales en tests
- ✅ Limpiar datos de test después de cada ejecución

### Limpieza de Datos

```bash
# Script de limpieza
npm run test:cleanup
```

O automáticamente en tests:

```typescript
test.afterEach(async ({ page }) => {
  // Limpiar usuario de test creado
  await cleanupTestUser(testUser);
});
```

## 🌐 Entornos de Test

### Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# En otra terminal, ejecutar tests
npm run test:e2e
```

### Staging

```bash
BASE_URL=https://staging.doctormx.com npm run test:e2e
```

### CI/CD (GitHub Actions)

Los tests se ejecutan automáticamente en:
- Pull requests
- Push a main
- Deployment previews

Ver: `.github/workflows/e2e-tests.yml`

## 📝 Troubleshooting

### Tests fallan por timeout

```bash
# Aumentar timeout global
npx playwright test --timeout=60000
```

### Navegadores no instalados

```bash
# Reinstalar navegadores
npx playwright install --with-deps
```

### Tests flaky (intermitentes)

1. Agregar retries: `--retries=2`
2. Aumentar timeouts específicos
3. Verificar selectores más estables
4. Agregar `await page.waitForLoadState('networkidle')`

### Stripe no carga

1. Verificar `STRIPE_PUBLIC_KEY` en `.env.test`
2. Confirmar que es una **test key** (comienza con `pk_test_`)
3. Verificar que el iframe de Stripe está disponible

### Video no funciona

1. Verificar permisos de cámara/micrófono
2. Verificar cuenta de Daily.co
3. En CI, usar mocks para video

## 📚 Recursos Adicionales

- [Playwright Docs](https://playwright.dev/)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Daily.co Docs](https://docs.daily.co/)

## 💡 Tips para Desarrollo

### 1. Usar `test.step` para Organizar

```typescript
test('complete flow', async ({ page }) => {
  await test.step('Login', async () => {
    // login code
  });
  
  await test.step('Book appointment', async () => {
    // booking code
  });
});
```

### 2. Reusar Helpers

```typescript
import { login } from './helpers/auth.helper';
import { completeStripeCardPayment } from './helpers/payment.helper';
```

### 3. Datos Únicos para Cada Test

```typescript
const uniqueEmail = `test-${Date.now()}@test.com`;
```

### 4. Mocks para Servicios Externos

```typescript
await page.route('**/api/stripe/**', async (route) => {
  await route.fulfill({ json: { success: true } });
});
```
