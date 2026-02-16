# Web Vitals Tracking - Resumen de Implementación

## Archivos Creados

### 1. Core Module
**`src/lib/performance/web-vitals.ts`**
- Implementación del tracking de Core Web Vitals
- Métricas soportadas: CLS, FCP, LCP, TTFB, INP
- Integración con Sentry para métricas pobres
- Configuración customizable (debug, sample rate, thresholds)
- API: `initWebVitals()`, `configureWebVitals()`, `useWebVitals()`

### 2. React Component
**`src/components/performance/WebVitalsProvider.tsx`**
- Componente Client para integración en layout
- Props configurables: debug, sampleRate, endpoint, enableSentry
- Inicialización automática con useEffect
- Previene doble inicialización en StrictMode

**`src/components/performance/index.ts`**
- Exports del módulo de performance

### 3. API Endpoint
**`src/app/api/metrics/web-vitals/route.ts`**
- POST: Recibe métricas del cliente
- GET: Health check
- Validación con Zod schema
- Almacenamiento en Supabase (opcional)
- Métricas de observabilidad

### 4. Database Migration
**`supabase/migrations/20250211150000_web_vitals_metrics.sql`**
- Tabla `web_vitals_metrics` para almacenamiento histórico
- Índices para consultas eficientes
- Vista `web_vitals_daily_summary` para dashboards
- Políticas RLS para seguridad

### 5. Documentation
**`docs/web-vitals-tracking.md`**
- Guía completa de uso
- Arquitectura del sistema
- API reference
- Troubleshooting

## Archivos Modificados

### 1. Layout
**`src/app/layout.tsx`**
- Importado `WebVitalsProvider`
- Añadido componente al inicio del body

### 2. Performance Index
**`src/lib/performance/index.ts`**
- Exportado módulo web-vitals

### 3. Package.json
- Agregada dependencia `web-vitals@5.1.0`

## Métricas Trackeadas

| Métrica | Nombre | Target | Descripción |
|---------|--------|--------|-------------|
| CLS | Cumulative Layout Shift | ≤ 0.1 | Estabilidad visual |
| FCP | First Contentful Paint | ≤ 1.8s | Primer render |
| LCP | Largest Contentful Paint | ≤ 2.5s | Carga principal |
| TTFB | Time to First Byte | ≤ 800ms | Respuesta servidor |
| INP | Interaction to Next Paint | ≤ 200ms | Interactividad |

> Nota: FID fue reemplazado por INP en web-vitals v5

## Integración Sentry

Las métricas con rating "poor" se envían automáticamente a Sentry:
- Breadcrumbs para todas las métricas
- Warnings para métricas pobres
- Tags: `web-vital`, `web-vital-rating`

## Configuración

```tsx
<WebVitalsProvider
  debug={process.env.NODE_ENV === 'development'}
  sampleRate={1.0}
  endpoint="/api/metrics/web-vitals"
  enableSentry={true}
/>
```

## Próximos Pasos

1. Ejecutar migración de base de datos:
   ```bash
   supabase db push
   ```

2. Verificar endpoint en desarrollo:
   ```bash
   curl http://localhost:3000/api/metrics/web-vitals
   ```

3. Revisar métricas en Sentry (métricas pobres)

4. Crear dashboard en Supabase usando la vista `web_vitals_daily_summary`

## Testing

Las métricas se loguean en consola en modo debug:
```
[Web Vitals] ✅ LCP: 1250 (good)
[Web Vitals] ⚠️ CLS: 0.15 (needs-improvement)
```

## Notas

- El tracking solo funciona en el cliente (browser)
- Se usa `navigator.sendBeacon` cuando está disponible
- Sampling rate configurable para reducir carga
- FID fue removido en web-vitals v5 (reemplazado por INP)
