# Web Vitals Tracking

Sistema de monitoreo de Core Web Vitals para Doctor.mx que rastrea métricas de rendimiento del frontend.

## Métricas Trackeadas

| Métrica | Descripción | Target | Límite
|---------|-------------|--------|--------|
| **CLS** | Cumulative Layout Shift (estabilidad visual) | ≤ 0.1 | ≤ 0.25 |
| **FCP** | First Contentful Paint (primer render) | ≤ 1.8s | ≤ 3.0s |
| **LCP** | Largest Contentful Paint (carga principal) | ≤ 2.5s | ≤ 4.0s |
| **TTFB** | Time to First Byte (respuesta servidor) | ≤ 800ms | ≤ 1.8s |
| **INP** | Interaction to Next Paint (interactividad) | ≤ 200ms | ≤ 500ms |

> **Nota:** FID (First Input Delay) fue reemplazado por INP en web-vitals v5. INP es la métrica recomendada para medir interactividad.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Navegador (Cliente)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Web Vitals Library                                  │   │
│  │  ├── getCLS() → Layout Shift                        │   │
│  │  ├── onCLS() → Layout Shift                         │   │
│  │  ├── onFCP() → First Paint                           │   │
│  │  ├── onLCP() → Largest Paint                         │   │
│  │  ├── onTTFB() → Server Response                      │   │
│  │  └── onINP() → Interaction Delay                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  WebVitalsProvider (Componente React)                │   │
│  │  • Inicializa tracking                               │   │
│  │  • Configura sample rate                             │   │
│  │  • Habilita debug mode                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                   │
│                          ▼                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Report Handler                                      │   │
│  │  ├── Console (dev)                                  │   │
│  │  ├── Sentry (errores)                               │   │
│  │  └── POST /api/metrics/web-vitals                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Servidor                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Endpoint: /api/metrics/web-vitals               │   │
│  │  • Valida payload                                    │   │
│  │  • Registra métricas                                 │   │
│  │  ├── Observability (logs)                           │   │
│  │  ├── Metrics (agregación)                           │   │
│  │  └── Supabase (histórico)                           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Uso

### Configuración Básica

El Web Vitals Tracking ya está integrado en el layout principal. Se inicializa automáticamente en el cliente:

```tsx
// app/layout.tsx
import { WebVitalsProvider } from "@/components/performance/WebVitalsProvider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsProvider />
        {children}
      </body>
    </html>
  );
}
```

### Configuración Avanzada

```tsx
<WebVitalsProvider
  debug={process.env.NODE_ENV === 'development'}
  sampleRate={0.1}  // Solo 10% de usuarios
  endpoint="/api/metrics/web-vitals"
  enableSentry={true}
  config={{
    thresholds: {
      LCP: { good: 2000, needsImprovement: 3500 },  // Targets más estrictos
    }
  }}
/>
```

### Uso Programático

```typescript
import { initWebVitals, configureWebVitals } from '@/lib/performance/web-vitals';

// Inicializar manualmente
const cleanup = initWebVitals({
  debug: true,
  enableSentry: true,
});

// Cambiar configuración en runtime
configureWebVitals({
  sampleRate: 0.5,  // Reducir muestreo
});

// Limpiar al desmontar
cleanup();
```

### Escuchar Eventos

```typescript
// Escuchar métricas en tiempo real
window.addEventListener('web-vital', (event) => {
  const metric = event.detail;
  console.log(`${metric.name}: ${metric.value}`);
  
  if (metric.rating === 'poor') {
    // Alertar sobre métricas pobres
    analytics.track('Poor Web Vital', metric);
  }
});
```

## API Endpoint

### POST /api/metrics/web-vitals

Recibe métricas de Web Vitals desde el navegador.

**Request Body:**

```json
{
  "name": "LCP",
  "value": 2450.5,
  "rating": "needs-improvement",
  "delta": 2450.5,
  "entries": [
    {
      "name": "largest-contentful-paint",
      "startTime": 2450.5,
      "duration": 0
    }
  ],
  "navigationType": "navigate",
  "timestamp": "2025-02-11T20:00:00.000Z",
  "url": "https://doctor.mx/consulta",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**

```json
{
  "success": true,
  "received": {
    "name": "LCP",
    "value": 2450.5,
    "rating": "needs-improvement"
  }
}
```

### GET /api/metrics/web-vitals

Health check del endpoint.

**Response:**

```json
{
  "success": true,
  "message": "Web Vitals metrics endpoint is running",
  "supportedMetrics": ["CLS", "FCP", "LCP", "TTFB", "INP"]
}
```

## Base de Datos

### Tabla: `web_vitals_metrics`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador único |
| `name` | VARCHAR(10) | Nombre de la métrica |
| `value` | DOUBLE | Valor medido |
| `rating` | VARCHAR(20) | good / needs-improvement / poor |
| `delta` | DOUBLE | Cambio desde última medición |
| `navigation_type` | VARCHAR(20) | Tipo de navegación |
| `page_path` | TEXT | Ruta de la página |
| `user_agent` | TEXT | User agent del navegador |
| `timestamp` | TIMESTAMPTZ | Cuándo ocurrió |

### Vista: `web_vitals_daily_summary`

Agregación diaria para dashboards:

```sql
SELECT * FROM web_vitals_daily_summary
WHERE name = 'LCP'
  AND date >= CURRENT_DATE - INTERVAL '7 days';
```

## Monitoreo y Alertas

### Sentry Integration

Las métricas con rating "poor" se envían automáticamente a Sentry:

- **Breadcrumbs:** Cada métrica registrada
- **Warnings:** Métricas con rating "poor"
- **Tags:** `web-vital`, `web-vital-rating`

### Métricas de Observabilidad

| Métrica | Tipo | Descripción |
|---------|------|-------------|
| `web_vitals_{name}` | histogram | Distribución de valores |
| `web_vitals_{name}_rating` | counter | Conteo por rating |

## Development

### Debug Mode

En desarrollo, las métricas se loguean en consola:

```
[Web Vitals] ✅ LCP: 1250 (good)
[Web Vitals] ⚠️ CLS: 0.15 (needs-improvement)
[Web Vitals] ❌ TTFB: 2500 (poor)
```

### Testing Manual

```typescript
import { reportWebVital } from '@/lib/performance/web-vitals';

// Simular una métrica
reportWebVital({
  name: 'LCP',
  value: 2000,
  rating: 'good',
});
```

## Troubleshooting

### Las métricas no aparecen

1. Verificar que `WebVitalsProvider` está en el layout
2. Check browser console por errores
3. Verificar que el endpoint responde: `GET /api/metrics/web-vitals`

### Métricas incompletas

- **INP:** Requiere interacción del usuario y Chrome 108+
- **CLS:** Acumulativo, se actualiza durante toda la vida de la página
- **LCP:** Puede cambiar si cargan nuevos elementos grandes

### Alto volumen de datos

Reducir `sampleRate`:

```tsx
<WebVitalsProvider sampleRate={0.01} />  // Solo 1% de usuarios
```

## Referencias

- [Web Vitals - web.dev](https://web.dev/vitals/)
- [web-vitals npm package](https://www.npmjs.com/package/web-vitals)
- [Next.js Analytics](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
