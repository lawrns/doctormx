# Implementación de Cookie Consent Granular (GDPR/LFPDPPP)

## Resumen

Se implementó un sistema completo de consentimiento de cookies granular que cumple con las regulaciones GDPR (Europa) y LFPDPPP (México), reemplazando el sistema anterior binario (solo Essential/All).

## Archivos Modificados/Creados

### 1. Hook: `src/hooks/useCookieConsent.ts` (NUEVO)
Hook principal para gestionar el estado del consentimiento.

**Características:**
- 4 categorías de cookies: Essential, Functional, Analytics, Marketing
- Persistencia en localStorage con versión (para invalidar consentimientos antiguos)
- Funciones: `acceptAll()`, `rejectAll()`, `savePreferences()`, `updatePreference()`, `withdrawConsent()`
- Verificación de permisos por categoría: `isAllowed(category)`

**Tipos exportados:**
```typescript
CookieCategory = 'essential' | 'functional' | 'analytics' | 'marketing'
CookiePreferences: { essential, functional, analytics, marketing, timestamp, version }
```

### 2. Componente: `src/components/CookieConsent.tsx` (MODIFICADO)
Banner de consentimiento granular reemplazando el binario anterior.

**Características:**
- 4 checkboxes para cada categoría de cookies
- Essential siempre activo y deshabilitado
- Opciones: "Aceptar todas", "Solo esenciales", "Guardar preferencias"
- Vista expandible en móvil
- Accesibilidad completa (aria-labels, roles, keyboard navigation)
- Enlace a Política de Cookies

**Componente adicional: `WithdrawConsentButton`**
- Botón para retirar consentimiento (usa en página de cookies)

### 3. Página: `src/app/cookies/page.tsx` (NUEVO)
Página completa de Política de Cookies.

**Secciones:**
- Gestor de preferencias activas con indicadores visuales
- Explicación de qué son las cookies
- 4 categorías explicadas con badges de color
- Tabla detallada con todas las cookies (nombre, proveedor, propósito, duración)
- Instrucciones para gestionar cookies en navegadores
- Enlaces a políticas de privacidad de terceros (Google, Meta, Vercel)
- Botón para retirar consentimiento

### 4. Scripts: `src/components/ConsentAwareScripts.tsx` (NUEVO)
Componente para cargar scripts de terceros condicionalmente.

**Características:**
- Carga Google Analytics solo con consentimiento de Analytics
- Carga Facebook Pixel solo con consentimiento de Marketing
- Hook `useConsentScript(category)` para cargas dinámicas
- Componente `ConsentGate` para contenido embebido condicional

### 5. Layout: `src/app/layout.tsx` (MODIFICADO)
- Agregado `<CookieConsent />` al final del body
- Agregado `<ConsentAwareScripts />` para scripts condicionales

### 6. Índice: `src/hooks/index.ts` (MODIFICADO)
- Exporta `useCookieConsent` y tipos relacionados

### 7. Tests: (NUEVOS)
- `src/hooks/__tests__/useCookieConsent.test.ts` - 13 tests
- `src/components/__tests__/CookieConsent.test.tsx` - 11 tests

## Flujo de Funcionamiento

### Primera visita:
1. Banner aparece automáticamente
2. Usuario puede:
   - Aceptar todas (activa todo)
   - Solo esenciales (activa solo essential)
   - Personalizar (toggle por categoría)
3. Preferencias guardadas en localStorage con timestamp

### Visitas subsecuentes:
1. Se leen preferencias de localStorage
2. Si versión coincide → No se muestra banner
3. Si versión diferente → Se solicita nuevo consentimiento

### Carga de scripts:
1. Componente `ConsentAwareScripts` verifica preferencias
2. Solo carga scripts de categorías permitidas
3. Scripts se cargan con estrategia `lazyOnload` para no bloquear

### Retirar consentimiento:
1. Usuario puede ir a `/cookies`
2. Click en "Retirar consentimiento"
3. Se borra localStorage y se recarga la página

## Categorías de Cookies

| Categoría | Descripción | Ejemplos | Requiere Consent |
|-----------|-------------|----------|------------------|
| Essential | Funcionamiento básico del sitio | sb-access-token, cookie-consent-preferences | No (siempre on) |
| Functional | Preferencias de usuario | user-preferences, appointment-draft | Sí |
| Analytics | Métricas y análisis | Google Analytics, Vercel Vitals | Sí |
| Marketing | Publicidad y remarketing | Facebook Pixel, Google Ads | Sí |

## Tests Implementados

### useCookieConsent tests (13):
- ✅ Inicialización sin consentimiento
- ✅ Carga de consentimiento existente
- ✅ Rechazo de versiones antiguas
- ✅ Aceptar todas las cookies
- ✅ Rechazar todo (solo esenciales)
- ✅ Guardar preferencias personalizadas
- ✅ Essential siempre true
- ✅ Actualizar preferencia individual
- ✅ Retirar consentimiento
- ✅ Verificar categoría permitida
- ✅ Essential siempre permitido sin consent
- ✅ Obtener preferencias por defecto
- ✅ Timestamp incluido al guardar

### CookieConsent component tests (11):
- ✅ Banner aparece sin consentimiento
- ✅ Banner no aparece con consentimiento
- ✅ Guardar todas las preferencias (aceptar todo)
- ✅ Guardar solo esenciales (rechazar todo)
- ✅ Permitir toggle por categoría
- ✅ No permitir desactivar esenciales
- ✅ Atributos de accesibilidad correctos
- ✅ Enlace a política de cookies
- ✅ Botón retirar aparece con consentimiento
- ✅ Mensaje cuando no hay consentimiento
- ✅ Retirar consentimiento al hacer click

## Cumplimiento Legal

### GDPR (Europa):
- ✅ Consentimiento previo y informado
- ✅ Granularidad de categorías
- ✅ Retiro fácil del consentimiento
- ✅ Registro de fecha/hora del consentimiento
- ✅ Información clara de cookies utilizadas

### LFPDPPP (México):
- ✅ Consentimiento expreso
- ✅ Finalidad de datos informada
- ✅ Derecho a revocar consentimiento
- ✅ Transparencia en uso de datos

## Uso en el Código

### Verificar consentimiento:
```typescript
import { useCookieConsent } from '@/hooks/useCookieConsent';

function MyComponent() {
  const { isAllowed } = useCookieConsent();
  
  if (isAllowed('analytics')) {
    // Cargar tracking
  }
}
```

### Cargar scripts condicionalmente:
```typescript
import { ConsentGate } from '@/components/ConsentAwareScripts';

<ConsentGate category="marketing">
  <FacebookPixel />
</ConsentGate>
```

### Botón de retirar consentimiento:
```typescript
import { WithdrawConsentButton } from '@/components/CookieConsent';

<WithdrawConsentButton />
```

## Notas Técnicas

- La versión del consentimiento es `1.0` - actualizar para forzar nuevo consentimiento
- Los datos se almacenan en `localStorage` bajo la clave `cookie-consent-preferences`
- El hook usa `useMemo` para evitar re-renders innecesarios
- Compatible con SSR de Next.js (carga cliente con `useEffect`)

---

**Implementación completada:** 20 de febrero de 2026
**Tiempo estimado:** 8 horas
**Tests:** 24 tests, todos pasando ✅
