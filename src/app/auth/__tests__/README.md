# Tests de Componentes de Autenticación

Este directorio contiene tests unitarios para los componentes de autenticación del proyecto Doctor.mx.

## Archivos de Test

### 1. `login.test.tsx`
Tests para el componente de Login (`src/app/auth/login/page.tsx`).

**Cobertura:**
- Renderizado: título, campos de email/contraseña, selector de tipo de usuario, checkbox de recordarme, botones de login social
- Interacciones de usuario: escritura en campos, cambio de tipo de usuario, toggle de contraseña visible
- Estados de loading: deshabilitación de botones, spinner durante carga
- Manejo de errores: credenciales inválidas, email inválido, contraseña corta
- Flujo completo: login exitoso, redirección según tipo de usuario y parámetro redirect
- Login social: Google, Apple, manejo de errores

### 2. `register.test.tsx`
Tests para el componente de Registro (`src/app/auth/register/page.tsx`).

**Cobertura:**
- Renderizado: título, indicador de progreso, opciones de tipo de cuenta
- Navegación entre pasos: avance, retroceso, validaciones por paso
- Paso 1: Selección de tipo de cuenta (paciente/doctor)
- Paso 2: Información personal (nombre, email, teléfono, contraseña, confirmación)
- Paso 3 Paciente: Historial médico, términos y condiciones
- Paso 3 Doctor: Cédula profesional, selección de especialidades
- Estados de loading: durante creación de cuenta
- Manejo de errores: validaciones, errores de Supabase
- Flujo completo: registro exitoso de paciente y doctor

### 3. `forgot-password.test.tsx`
Tests para el componente de Recuperación de Contraseña (`src/app/auth/forgot-password/page.tsx`).

**Cobertura:**
- Renderizado: título, descripción, campo de email, botón de envío
- Interacciones: escritura en campo email, limpieza de campo
- Estados de loading: deshabilitación durante envío, spinner
- Validaciones: email inválido
- Manejo de errores: rate limit, errores de servidor
- Flujo completo: envío exitoso, pantalla de confirmación
- Reenvío: funcionalidad de reenviar email

### 4. `reset-password.test.tsx`
Tests para el componente de Reset de Contraseña (`src/app/auth/reset-password/page.tsx`).

**Cobertura:**
- Renderizado: campos de nueva contraseña y confirmación
- Verificación de sesión: estado de carga, sesión inválida/expirada
- Interacciones: escritura en campos, toggle de visibilidad
- Indicador de fortaleza: visualización según seguridad
- Validaciones: contraseña corta, contraseñas no coinciden
- Estados de loading: durante actualización
- Manejo de errores: errores de Supabase
- Flujo completo: actualización exitosa, redirección automática

### 5. `ProtectedRoute.test.tsx`
Tests para el componente de ProtectedRoute (wrappers de rutas protegidas).

**Cobertura:**
- Renderizado: pantalla de carga, children cuando está autenticado
- Redirección: a login cuando no hay sesión, a ruta personalizada
- Auth state changes: redirección en SIGNED_OUT, acceso en SIGNED_IN
- Cleanup: cancelación de suscripción al desmontar
- Múltiples children: manejo de varios elementos anidados

## Mocks Configurados

### Dependencias mockeadas en `src/lib/__tests__/setup.ts`:
- `next/headers`: headers y cookies
- `@/lib/supabase/server`: createClient, createServiceClient
- `stripe`: paymentIntents, refunds
- `resend`: envío de emails
- `openai`: chat completions

### Mocks en cada archivo de test:
- `next/navigation`: useRouter, useSearchParams, usePathname
- `next/link`: componente Link
- `@/lib/supabase/client`: createClient con auth methods
- `framer-motion`: componentes motion (para evitar animaciones en tests)

## Configuración de Vitest

El archivo `vitest.config.ts` ha sido actualizado para:
- Incluir archivos `.test.tsx` en la configuración de tests
- Incluir `.test.tsx` en exclusiones de coverage
- Agregar alias `@` para resolución de módulos

## Instalación de Dependencias

Se instaló `@heroicons/react` como dependencia necesaria para los componentes UI.

## Cómo ejecutar los tests

```bash
# Ejecutar todos los tests de auth
npm test -- src/app/auth/__tests__

# Ejecutar test específico
npm test -- src/app/auth/__tests__/login.test.tsx

# Ejecutar con reporter detallado
npm test -- src/app/auth/__tests__/login.test.tsx --reporter=verbose

# Ejecutar con UI
npm test -- src/app/auth/__tests__ --ui
```

## Notas importantes

1. **Tests independientes**: Cada test limpia los mocks en `beforeEach` y `afterEach`
2. **Cobertura mínima**: Cada componente tiene tests para:
   - Renderizado básico
   - Interacciones de usuario
   - Estados de loading
   - Manejo de errores
   - Flujo completo (happy path)
3. **Uso de act()**: Todos los eventos y renderizados están envueltos en `act()` para manejar correctamente las actualizaciones de React

## Próximos pasos recomendados

1. Verificar que los componentes UI (`src/components/ui/*`) estén correctamente exportados
2. Resolver las importaciones legacy en `src/contexts/AuthContext.jsx`
3. Considerar crear tests de integración con Playwright para flujos completos de auth
4. Agregar tests de accesibilidad (a11y) para los formularios
