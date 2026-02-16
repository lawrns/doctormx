# PLAN DE EJECUCIÓN COMPLETO - DOCTORMX v2.0
## Basado en Veredicto Unánime del Council
**Mandato:** CALIDAD > COMPLECIÓN > ESFUERZO > VELOCIDAD

---

## 📋 FASE 0: PREPARACIÓN (Día 0 - Setup Inicial)

### 0.1 Crear Estructura de Trabajo

```bash
# Crear directorio de trabajo limpio
mkdir -p C:\Users\danig\doctormx-stable
mkdir -p C:\Users\danig\doctormx-stable\src
mkdir -p C:\Users\danig\doctormx-stable\docs
mkdir -p C:\Users\danig\doctormx-stable\scripts
mkdir -p C:\Users\danig\doctormx-stable\tests

# Inicializar git
cd C:\Users\danig\doctormx-stable
git init
git remote add origin <tu-repo>
```

### 0.2 Documentos de Referencia Requeridos

Crear en `doctormx-stable/docs/`:

```
docs/
├── CODEBASE_BOUNDARIES.md          # Límites arquitectónicos
├── MIGRATION_PROGRESS.md           # Tracking semanal
├── SECURITY_CHECKLIST.md           # Checklist de seguridad
├── TESTING_STRATEGY.md             # Estrategia de testing
└── DECISION_LOG.md                 # Decisiones técnicas
```

### 0.3 Checklist de Preparación

- [ ] Node.js 20+ instalado
- [ ] Cuenta Supabase lista
- [ ] Cuenta Stripe lista (test)
- [ ] Variables de entorno preparadas
- [ ] Git configurado

---

## 🔒 FASE 1: FUNDACIÓN SEGURA (Semana 1)

### DÍA 1: Seguridad Primero (Lunes)

**Objetivo:** Cumplir condición del Security Engineer - fix 36 tests de seguridad

#### 1.1 Identificar Tests de Seguridad Fallando

```bash
# Listar todos los tests de seguridad
cd C:\Users\danig\doctormx
npm test -- src/app/api/__tests__/security/ 2>&1 | tee security-tests.log

# Identificar patrones de fallo
grep -n "FAIL\|Error\|failed" security-tests.log > security-failures.txt
```

#### 1.2 Categorizar Fallos de Seguridad

**Esperado encontrar:**
- CSRF token handling en tests de admin
- FormData construction issues en mocks
- Session handling en tests de autenticación

#### 1.3 Arreglar Tests de Seguridad Críticos

**Para cada test fallando:**

```typescript
// BEFORE (fallando)
const response = await fetch('/api/admin/users', {
  method: 'POST',
  body: JSON.stringify({ userId: '123' }) // ❌ No CSRF token
})

// AFTER (funcionando)
const csrfToken = await getCSRFToken() // Obtener token válido
const response = await apiRequest('/api/admin/users', {
  method: 'POST',
  body: { userId: '123' } // ✅ apiRequest añade CSRF automáticamente
})
```

#### 1.4 Verificación Fin de Día

```bash
# Todos los tests de seguridad deben pasar
npm test -- src/app/api/__tests__/security/
# Esperado: 36/36 passing
```

**Entregable Día 1:**
- [ ] 36 tests de seguridad pasando
- [ ] Commit: `security: fix 36 failing security tests`

---

### DÍA 2: Build Estabilización (Martes)

**Objetivo:** Build pasa con 0 errores

#### 2.1 Identificar Errores de Build

```bash
cd C:\Users\danig\doctormx
npm run build 2>&1 | tee build-errors.log

# Contar errores
grep -c "error TS\|SyntaxError\|Module not found" build-errors.log
```

#### 2.2 Fix PDFKit Error (Crítico)

**Problema:** `pdfkit` importado en contexto cliente

**Solución - Crear API Route Server-Only:**

```typescript
// src/app/api/export/pdf/route.ts (NUEVO)
import { NextRequest, NextResponse } from 'next/server'
import PDFDocument from 'pdfkit' // ✅ Server-only, no problem

export async function POST(req: NextRequest) {
  const { type, data } = await req.json()
  
  // Generar PDF en servidor
  const doc = new PDFDocument()
  const chunks: Buffer[] = []
  
  doc.on('data', (chunk) => chunks.push(chunk))
  doc.on('end', () => {
    const pdf = Buffer.concat(chunks)
    // Return PDF
  })
  
  // ... construir PDF
  
  doc.end()
  
  return new NextResponse(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="export.pdf"'
    }
  })
}
```

#### 2.3 Remover Import Cliente de PDFKit

```typescript
// src/lib/arco/data-export.ts (MODIFICAR)

// BEFORE
import PDFDocument from 'pdfkit' // ❌ Error en build

// AFTER
// No importar pdfkit aquí
// Llamar a API route en su lugar

export async function generatePDF(data: ExportData) {
  const response = await fetch('/api/export/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'arco', data })
  })
  return response.blob()
}
```

#### 2.4 Fix Syntax Errors (`.doctores` → `'doctores'`)

**Script de corrección:**

```bash
# Buscar archivos con syntax errors
grep -r "\.doctores" src/ --include="*.tsx" --include="*.ts" | grep -v node_modules

# Reemplazar
find src/ -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/\.doctores/'doctores'/g" {} \;
```

**Verificar manualmente:**
- `src/app/doctores/page.tsx`
- `src/components/doctors/DoctorList.tsx`
- Otros archivos con enlaces

#### 2.5 Verificación Fin de Día

```bash
npm run build
# Esperado: Build successful with 0 errors
```

**Entregable Día 2:**
- [ ] Build pasa sin errores
- [ ] PDF aislado a API route server-only
- [ ] Commit: `build: fix pdfkit and syntax errors`

---

### DÍA 3: Documentación de Límites (Miércoles)

**Objetivo:** Crear CODEBASE_BOUNDARIES.md (condición DX Lead)

#### 3.1 Crear CODEBASE_BOUNDARIES.md

```markdown
# CODEBASE BOUNDARIES - DoctorMX

## ZONAS ESTABLES (NO MODIFICAR sin aprobación)

### src/lib/* - Core Libraries
**Estado:** ✅ PRODUCTION READY  
**Razón:** Auditado, 100% funcional, 85%+ coverage  
**Contacto:** Security Engineer + Architect  

**Módulos protegidos:**
- `src/lib/security/*` - IDOR, CSRF, Encryption
- `src/lib/ai/*` - AI Router, providers
- `src/lib/errors/*` - Error hierarchy
- `src/lib/validation/*` - Zod schemas
- `src/lib/supabase/*` - Database clients

**Reglas:**
- No modificar sin PR + review de 2 seniors
- Tests deben pasar 100%
- Documentar cambios en DECISION_LOG.md

### 71 error.tsx - Error Handling
**Estado:** ✅ CENTRALIZED  
**Razón:** Todos usan ErrorPage.tsx, funcionan perfecto  
**Acción:** MANTENER - No tocar  

### 148 API Routes funcionales
**Estado:** ✅ WORKING  
**Lista:** Ver API_WORKING_LIST.md  
**Acción:** Mantener, solo fixes de bugs

---

## ZONAS EN MIGRACIÓN (Reconstruyendo)

### Skeleton Components (71 archivos)
**Estado:** 🔄 MIGRATING  
**Timeline:** Semana 2  
**Nuevo patrón:** `src/components/ui/loading/*`  

**Patrones estándar:**
```tsx
// LoadingPage.tsx para páginas completas
import { LoadingPage } from '@/components/ui/loading'

export default function Loading() {
  return <LoadingPage variant="default" />
}

// Skeleton específicos para componentes
import { SkeletonCard, SkeletonList } from '@/components/ui/skeleton'
```

### APIs Rotas (17 rutas)
**Estado:** 🔄 REBUILDING  
**Timeline:** Semana 3-4  
**Lista:** Ver API_BROKEN_LIST.md  

**Nuevo patrón:**
- Server-only para PDFs
- CSRF automático via @/lib/api
- Validación Zod en cada endpoint
- Audit logging obligatorio

### Feature Components
**Estado:** 🔄 REBUILDING  
**Timeline:** Semana 5-7  
**Features:** Doctores, Appointments, Payments  

---

## ZONAS LEGADO (Deprecando)

### Componentes duplicados
**Ubicación:** `src/components/ui/*` (antiguos)  
**Reemplazo:** Usar shadcn/ui + nuevos patrones  
**Timeline:** Remover después de migración  

---

## INTERFACES ENTRE ZONAS

### Contratos TypeScript
```typescript
// Toda comunicación old/new via interfaces definidas
// src/types/boundaries.ts

export interface IAppointmentService {
  // Contrato estable para nueva implementación
}
```

### Reglas de Import
```typescript
// ✅ CORRECTO
import { verifyOwnership } from '@/lib/security/idor-protection'
import { apiRequest } from '@/lib/api'

// ❌ PROHIBIDO
import { someOldUtil } from '@/components/old/utils'
import PDFDocument from 'pdfkit' // Solo en API routes
```
```

#### 3.2 Crear API_WORKING_LIST.md

Listar las 148 APIs que funcionan y NO deben tocarse.

#### 3.3 Crear API_BROKEN_LIST.md

Listar las 17 APIs rotas que deben reconstruirse:

```markdown
# APIs a Reconstruir (17 rutas)

## ARCO (5 rutas)
- [ ] src/app/api/arco/export/route.ts - pdfkit error
- [ ] src/app/api/arco/download/route.ts
- [ ] src/app/api/arco/delete/route.ts
- [ ] src/app/api/arco/rectify/route.ts
- [ ] src/app/api/arco/access/route.ts

## Payments (4 rutas)
- [ ] src/app/api/payments/create-intent/route.ts
- [ ] src/app/api/payments/confirm/route.ts
- [ ] src/app/api/payments/webhook/route.ts
- [ ] src/app/api/payments/refund/route.ts

## Admin (8 rutas)
- [ ] src/app/api/admin/users/route.ts
- [ ] src/app/api/admin/doctors/route.ts
- [ ] ... (listar todas)
```

#### 3.4 Crear SECURITY_CHECKLIST.md

```markdown
# Security Checklist - Rebuild Requirements

## Para CADA API Route Reconstruida:

- [ ] Usa `requireAuthEnhanced()` de @/lib/middleware/auth
- [ ] User ID SOLO de sesión: `const { user } = await requireAuthEnhanced()`
- [ ] NUNCA de body: ❌ `body.userId`
- [ ] IDOR check: `verifyOwnership()` antes de acceso a datos
- [ ] PHI encriptado: `encryptionService.encryptPHI()`
- [ ] Audit logging: `logDataAccess()` y `logSecurityEvent()`
- [ ] CSRF: Client usa `@/lib/api` (no fetch nativo)
- [ ] Rate limiting: `withRateLimit()` para endpoints públicos
- [ ] Zod validation: Validar TODO input
- [ ] Tests: Security tests pasando

## Verificación Automática:
```bash
npm run security:check
```
```

**Entregable Día 3:**
- [ ] CODEBASE_BOUNDARIES.md completo
- [ ] API_WORKING_LIST.md
- [ ] API_BROKEN_LIST.md
- [ ] SECURITY_CHECKLIST.md
- [ ] Commit: `docs: add codebase boundaries and security checklist`

---

### DÍA 4: Infraestructura de Testing (Jueves)

**Objetivo:** Setup testing infrastructure (+12 horas Architect)

#### 4.1 Configurar Coverage Gates

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 80,
        statements: 85
      },
      exclude: [
        'node_modules/',
        '.next/',
        'tests/',
        '**/*.d.ts',
        'src/components/ui/**' // shadcn/ui excluido
      ]
    }
  }
})
```

#### 4.2 Crear Contract Tests para APIs

```typescript
// tests/contract/appointments.contract.test.ts
import { describe, it, expect } from 'vitest'

describe('Appointments API Contract', () => {
  it('should return appointment with required fields', async () => {
    const response = await fetch('/api/appointments/123')
    const data = await response.json()
    
    // Contract: Campos requeridos
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('patientId')
    expect(data).toHaveProperty('doctorId')
    expect(data).toHaveProperty('status')
    expect(data).toHaveProperty('scheduledFor')
  })
  
  it('should reject unauthorized access', async () => {
    // Test IDOR protection
  })
})
```

#### 4.3 Setup CI Gates

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Security tests
        run: npm run test:security
      
      - name: Coverage
        run: npm run test:coverage
        # Falla si coverage < 85%
      
      - name: Build
        run: npm run build
```

#### 4.4 Crear Script dx:doctor

```javascript
// scripts/dx-health-check.js
#!/usr/bin/env node

const { execSync } = require('child_process')

console.log('🔍 DoctorMX Health Check\n')

// Check 1: Build
console.log('1. Checking build...')
try {
  execSync('npm run build', { stdio: 'pipe' })
  console.log('   ✅ Build passes\n')
} catch {
  console.log('   ❌ Build failing\n')
  process.exit(1)
}

// Check 2: Security tests
console.log('2. Checking security tests...')
const securityOutput = execSync('npm run test:security -- --silent').toString()
const securityPassing = securityOutput.includes('36 passing')
console.log(securityPassing ? '   ✅ Security tests pass\n' : '   ❌ Security tests failing\n')

// Check 3: Coverage
console.log('3. Checking coverage...')
// ... verificar coverage >= 85%

console.log('\n✅ All health checks passed!')
```

**Entregable Día 4:**
- [ ] Coverage gates configurados (85%)
- [ ] Contract tests creados
- [ ] CI/CD con gates de calidad
- [ ] Script dx:doctor funcionando
- [ ] Commit: `chore: setup testing infrastructure`

---

### DÍA 5: Checkpoint Council (Viernes)

**Verificación de Fase 1:**

```bash
# Run all checks
npm run dx:doctor

# Expected output:
# ✅ Build passes
# ✅ 36/36 security tests passing
# ✅ Coverage thresholds met
# ✅ TypeScript strict mode
# ✅ Lint passes
```

**Entregable Fase 1:**
- [ ] Build pasa (0 errores)
- [ ] 36 tests seguridad pasando
- [ ] Documentación de límites completa
- [ ] Infraestructura de testing lista
- [ ] **APROBACIÓN DEL COUNCIL PARA CONTINUAR**

---

## 🎨 FASE 2: SKELETONS (Semana 2)

### DÍA 6-7: Crear Patrones Estándar (Lunes-Martes)

#### 6.1 Diseñar Sistema de Skeletons

```typescript
// src/components/ui/loading/index.ts
export { LoadingPage } from './LoadingPage'
export { CardGridSkeleton } from './CardGridSkeleton'
export { ListSkeleton } from './ListSkeleton'
export { DashboardSkeleton } from './DashboardSkeleton'
export { FormSkeleton } from './FormSkeleton'
```

#### 6.2 Implementar LoadingPage

```typescript
// src/components/ui/loading/LoadingPage.tsx
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingPageProps {
  variant?: 'default' | 'dashboard' | 'medical'
  showHeader?: boolean
}

export function LoadingPage({ variant = 'default', showHeader = true }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && (
        <header className="h-16 border-b bg-white">
          <div className="container mx-auto px-4 h-full flex items-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
      )}
      <main className="container mx-auto px-4 py-8">
        {variant === 'dashboard' && <DashboardSkeleton />}
        {variant === 'medical' && <MedicalRecordSkeleton />}
        {variant === 'default' && <CardGridSkeleton />}
      </main>
    </div>
  )
}
```

#### 6.3 Implementar Skeletons Específicos

```typescript
// src/components/ui/loading/CardGridSkeleton.tsx
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white p-6 space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}
```

### DÍA 8-9: Generar 71 loading.tsx (Miércoles-Jueves)

#### 8.1 Crear Script de Generación

```javascript
// scripts/generate-loading-files.js
const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Encontrar todas las páginas
const pages = glob.sync('src/app/**/page.tsx')

pages.forEach(pagePath => {
  const dir = path.dirname(pagePath)
  const loadingPath = path.join(dir, 'loading.tsx')
  
  // Detectar tipo de página
  const content = fs.readFileSync(pagePath, 'utf8')
  let variant = 'default'
  
  if (content.includes('dashboard')) variant = 'dashboard'
  if (content.includes('medical') || content.includes('doctor')) variant = 'medical'
  if (content.includes('form')) variant = 'form'
  
  // Generar loading.tsx
  const loadingContent = `import { LoadingPage } from '@/components/ui/loading'

export default function Loading() {
  return <LoadingPage variant="${variant}" />
}
`
  
  fs.writeFileSync(loadingPath, loadingContent)
  console.log(`✅ Created: ${loadingPath}`)
})

console.log(`\n🎉 Generated ${pages.length} loading.tsx files`)
```

#### 8.2 Ejecutar Script

```bash
node scripts/generate-loading-files.js
```

### DÍA 10: Verificación y Testing (Viernes)

#### 10.1 Verificar Visualmente

```bash
# Iniciar dev server
npm run dev

# Visitar rutas principales y verificar skeletons:
# - /doctores
# - /app/dashboard
# - /app/appointments
# - /book/[id]
```

#### 10.2 Tests de Accesibilidad

```bash
# Verificar que skeletons tienen aria-busy
npm run test:a11y
```

**Entregable Fase 2:**
- [ ] 71 archivos loading.tsx generados
- [ ] 4 patrones skeleton estándar
- [ ] Visualmente consistentes
- [ ] Tests a11y pasando
- [ ] Commit: `feat: standardize 71 skeleton components`

---

## 🔌 FASE 3: APIs ROTAS (Semana 3-4)

### Semana 3: ARCO y Payments

#### DÍA 11-12: ARCO APIs (5 rutas)

Reconstruir cada API con el nuevo patrón:

```typescript
// src/app/api/arco/export/route.ts (RECONSTRUIDO)
import { NextRequest, NextResponse } from 'next/server'
import { requireAuthEnhanced } from '@/lib/middleware/auth'
import { verifyOwnership } from '@/lib/security/idor-protection'
import { auditLogger } from '@/lib/security/audit-logger'
import { withRateLimit } from '@/lib/middleware/rate-limit'
import { z } from 'zod'

const exportSchema = z.object({
  type: z.enum(['access', 'rectify', 'cancel']),
  data: z.record(z.unknown())
})

export const POST = withRateLimit(async (req: NextRequest) => {
  // 1. Auth
  const { user } = await requireAuthEnhanced()
  
  // 2. Validación
  const body = await req.json()
  const { type, data } = exportSchema.parse(body)
  
  // 3. Verificar ownership
  await verifyOwnership({
    userId: user.id,
    resource: 'user_data',
    action: 'export'
  })
  
  // 4. Audit log
  auditLogger.logDataAccess({
    userId: user.id,
    action: 'data_export',
    resource: type,
    timestamp: new Date()
  })
  
  // 5. Generar export (llamar a API de PDF si es necesario)
  const exportData = await generateExport(user.id, type, data)
  
  return NextResponse.json({ success: true, data: exportData })
}, { limit: 10, window: 3600 }) // 10 exports por hora
```

#### DÍA 13-14: Payments APIs (4 rutas)

Reconstruir con Stripe best practices:

```typescript
// src/app/api/payments/create-intent/route.ts
import Stripe from 'stripe'
import { requireAuthEnhanced } from '@/lib/middleware/auth'
import { z } from 'zod'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
})

const schema = z.object({
  appointmentId: z.string().uuid(),
  paymentMethod: z.enum(['card', 'oxxo'])
})

export async function POST(req: NextRequest) {
  const { user } = await requireAuthEnhanced()
  const { appointmentId, paymentMethod } = schema.parse(await req.json())
  
  // Verificar appointment pertenece al usuario
  const appointment = await getAppointment(appointmentId)
  if (appointment.patientId !== user.id) {
    return new NextResponse('Unauthorized', { status: 403 })
  }
  
  // Crear PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: appointment.amount * 100, // cents
    currency: 'mxn',
    payment_method_types: paymentMethod === 'oxxo' ? ['oxxo'] : ['card'],
    metadata: {
      appointment_id: appointmentId,
      patient_id: user.id
    }
  })
  
  // Guardar en DB
  await createPayment({
    appointmentId,
    stripePaymentIntentId: paymentIntent.id,
    amount: appointment.amount,
    status: 'pending'
  })
  
  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  })
}
```

#### DÍA 15: Testing APIs

```bash
# Tests de integración
npm run test:integration -- src/app/api/arco/
npm run test:integration -- src/app/api/payments/

# Verificar security
npm run test:security
```

### Semana 4: Admin APIs y Beta Launch

#### DÍA 16-17: Admin APIs (8 rutas)

Reconstruir con RBAC estricto:

```typescript
// src/app/api/admin/users/route.ts
import { requireRole } from '@/lib/middleware/auth'

export const GET = requireRole(['admin'])(async (req) => {
  // Solo admins pueden listar usuarios
  const users = await getUsersList()
  return NextResponse.json(users)
})
```

#### DÍA 18-19: Webhooks y Edge Cases

- Stripe webhooks
- OXXO payment confirmations
- Error handling edge cases

#### DÍA 20: Beta Launch Checklist

```markdown
## Beta Launch (Semana 4)

- [ ] 17 APIs reconstruidas y tested
- [ ] Build pasa (0 errores)
- [ ] Security tests pasando
- [ ] ARCO features funcionando
- [ ] Payment flow tested
- [ ] Deploy a staging
- [ ] 100 usuarios beta invitados
```

**Entregable Fase 3:**
- [ ] 17 APIs reconstruidas
- [ ] 100% tests pasando
- [ ] Staging deploy
- [ ] Beta launch

---

## 🎨 FASE 4: FEATURE COMPONENTS (Semana 5-7)

### Semana 5: Doctores

#### DÍA 21-23: Lista y Detalle de Doctores

```typescript
// src/components/features/doctors/DoctorCard.tsx
interface DoctorCardProps {
  doctor: Doctor
  onBook?: (doctorId: string) => void
}

export function DoctorCard({ doctor, onBook }: DoctorCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <Avatar src={doctor.avatar} name={doctor.name} />
        <CardTitle>{doctor.name}</CardTitle>
        <CardDescription>{doctor.specialty}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-bold">${doctor.price}/consulta</p>
        <Rating value={doctor.rating} />
      </CardContent>
      <CardFooter>
        <Button onClick={() => onBook?.(doctor.id)}>
          Agendar Cita
        </Button>
      </CardFooter>
    </Card>
  )
}
```

#### DÍA 24-25: Búsqueda y Filtros

- Búsqueda por nombre
- Filtro por especialidad
- Filtro por precio
- Sort por rating/disponibilidad

### Semana 6: Citas

#### DÍA 26-28: Flujo de Booking

```typescript
// src/app/book/[doctorId]/page.tsx
export default async function BookPage({ 
  params 
}: { 
  params: { doctorId: string } 
}) {
  const doctor = await getDoctor(params.doctorId)
  const availability = await getAvailability(params.doctorId)
  
  return (
    <BookingForm 
      doctor={doctor} 
      availability={availability}
    />
  )
}
```

#### DÍA 29-30: Calendario y Confirmación

- Date picker
- Time slot selector
- Formulario de datos del paciente
- Confirmación con summary

### Semana 7: Pagos

#### DÍA 31-33: Checkout Flow

```typescript
// src/app/checkout/[appointmentId]/page.tsx
import { Elements } from '@stripe/react-stripe-js'
import { CheckoutForm } from '@/components/features/payments/CheckoutForm'

export default async function CheckoutPage({ 
  params 
}: { 
  params: { appointmentId: string } 
}) {
  const clientSecret = await createPaymentIntent(params.appointmentId)
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm />
    </Elements>
  )
}
```

#### DÍA 34-35: OXXO y Confirmaciones

- OXXO voucher display
- Email confirmations
- SMS notifications (Twilio)

**Entregable Fase 4:**
- [ ] Doctores feature completo
- [ ] Appointments feature completo
- [ ] Payments feature completo
- [ ] E2E tests pasando

---

## 🚀 FASE 5: PRODUCCIÓN (Semana 8-10)

### Semana 8: Pre-Launch

#### DÍA 36-37: Load Testing

```bash
# K6 o Artillery para load testing
npm run test:load -- --vus 1000 --duration 5m
```

#### DÍA 38-39: Security Audit

```bash
# npm audit
npm audit --audit-level=high

# Snyk si está disponible
snyk test
```

#### DÍA 40: Deploy a Producción

```bash
# Deploy a Vercel
vercel --prod

# Verificar health checks
npm run dx:doctor
```

### Semana 9: Monitoreo

#### DÍA 41-43: Setup Monitoring

- Sentry para errores
- LogRocket para session replay
- Datadog/Vercel Analytics para métricas

#### DÍA 44-45: Bug Fixes

- Triage de errores reportados
- Hotfixes críticos

### Semana 10: Documentación y Handoff

#### DÍA 46-48: Documentación Técnica

```markdown
# docs/
├── ARCHITECTURE.md         # Decisiones arquitectónicas
├── API.md                  # Documentación de APIs
├── DEPLOYMENT.md           # Guía de deployment
├── SECURITY.md             # Consideraciones de seguridad
└── ONBOARDING.md           # Guía para nuevos devs
```

#### DÍA 49-50: Cleanup Final

- Remover código legacy
- Limpiar TODOs
- Optimizar bundle

**Entregable Fase 5:**
- [ ] Producción estable
- [ ] Monitoreo activo
- [ ] Documentación completa
- [ ] 0 deuda técnica crítica

---

## 📊 MÉTRICAS DE ÉXITO POR FASE

### Fase 1 (Semana 1)
- [ ] 36/36 security tests pasando
- [ ] Build 0 errores
- [ ] Documentación completa

### Fase 2 (Semana 2)
- [ ] 71 skeletons generados
- [ ] Visualmente consistentes

### Fase 3 (Semana 3-4)
- [ ] 17 APIs reconstruidas
- [ ] Beta launch con 100 usuarios

### Fase 4 (Semana 5-7)
- [ ] 3 features completos
- [ ] 85%+ coverage

### Fase 5 (Semana 8-10)
- [ ] Producción estable
- [ ] <0.5% error rate
- [ ] Lighthouse >90

---

## 🎯 CHECKLIST DIARIO

Cada día, verificar:

```bash
□ npm run build (0 errores)
□ npm run test:security (36/36 passing)
□ npm run lint (0 warnings)
□ npm run type-check (0 errores)
□ Coverage >= 85%
```

---

**Plan completo documentado. ¿Procedemos con la ejecución?**
