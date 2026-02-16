# Health Check Endpoint

## `/api/health`

Endpoint para verificar el estado de salud de todos los servicios críticos de la aplicación.

---

## Métodos

### `GET /api/health`

Verifica el estado de todos los servicios y retorna un resumen del estado de salud del sistema.

#### Response

**Status 200 - Healthy**

```json
{
  "status": "healthy",
  "timestamp": "2026-02-11T14:30:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": {
      "status": "ok",
      "latency": 45
    },
    "cache": {
      "status": "ok",
      "latency": 12
    },
    "stripe": {
      "status": "ok",
      "latency": 230
    },
    "ai": {
      "status": "ok",
      "latency": 1,
      "message": "Configured providers: GLM, OpenAI"
    }
  }
}
```

**Status 200 - Degraded**

```json
{
  "status": "degraded",
  "timestamp": "2026-02-11T14:30:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": {
      "status": "ok",
      "latency": 45
    },
    "cache": {
      "status": "degraded",
      "latency": 1,
      "message": "Using in-memory cache (Redis not configured)"
    },
    "stripe": {
      "status": "skipped",
      "latency": 0,
      "message": "STRIPE_SECRET_KEY not configured"
    },
    "ai": {
      "status": "ok",
      "latency": 1,
      "message": "Configured providers: GLM"
    }
  }
}
```

**Status 503 - Unhealthy**

```json
{
  "status": "unhealthy",
  "timestamp": "2026-02-11T14:30:00.000Z",
  "version": "0.1.0",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": {
      "status": "error",
      "latency": 5000,
      "message": "Database connection failed: Connection refused"
    },
    "cache": {
      "status": "ok",
      "latency": 12
    },
    "stripe": {
      "status": "ok",
      "latency": 230
    },
    "ai": {
      "status": "ok",
      "latency": 1
    }
  }
}
```

---

### `OPTIONS /api/health`

Retorna los headers CORS permitidos para el endpoint.

#### Response

**Status 204 No Content**

Headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400
```

---

## Estados de Check

| Estado | Descripción | HTTP Status |
|--------|-------------|-------------|
| `ok` | Servicio funcionando correctamente | 200 |
| `degraded` | Servicio funcionando con limitaciones (ej: usando cache en memoria) | 200 |
| `error` | Servicio no disponible o con errores | 503 |
| `skipped` | Check omitido (ej: servicio no configurado) | 200/503* |

\* Si todos los checks están skipped, el estado es `degraded` (200). Si hay algún error, es `unhealthy` (503).

---

## Servicios Verificados

### Database (Supabase)

- **Método**: Consulta simple a la tabla `doctors`
- **Timeout implícito**: 5 segundos (por defecto de Next.js)
- **Fallo si**: Error de conexión o query fallida

### Cache (Redis/Upstash)

- **Método**: Ping al cliente de cache
- **Estado degradado**: Si usa in-memory cache (fallback)
- **Fallo si**: No responde al ping

### Stripe

- **Método**: Listar productos (limit 1)
- **Skipped si**: `STRIPE_SECRET_KEY` no está configurada
- **Fallo si**: Error de autenticación o API no disponible

### AI Service

- **Método**: Verificación de configuración (sin llamadas a API para evitar costos)
- **Fallo si**: Ni `GLM_API_KEY` ni `OPENAI_API_KEY` están configuradas
- **Mensaje**: Lista los proveedores configurados

---

## Uso en Monitoreo

### Kubernetes/Docker Health Checks

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2
```

### Load Balancer Health Checks

```
Protocol: HTTP
Path: /api/health
Port: 3000
Healthy Threshold: 2 consecutive successes
Unhealthy Threshold: 3 consecutive failures
Timeout: 5 seconds
Interval: 10 seconds
Success Code: 200
```

### Uptime Monitoring (Pingdom/UptimeRobot)

- **URL**: `https://doctormx.com/api/health`
- **Expected Status**: 200
- **Check Interval**: 1-5 minutos
- **Alert on**: Status != 200 o response time > 5s

---

## Métricas Incluidas

| Métrica | Descripción | Unidad |
|---------|-------------|--------|
| `latency` | Tiempo de respuesta del servicio | ms |
| `uptime` | Tiempo desde el inicio del servidor | segundos |
| `timestamp` | Timestamp ISO 8601 de la respuesta | ISO string |

---

## Notas de Implementación

1. **No requiere autenticación**: El endpoint es público para facilitar el monitoreo
2. **CORS habilitado**: Permite llamadas desde cualquier origen
3. **Checks en paralelo**: Todos los checks se ejecutan simultáneamente
4. **Sin side effects**: Las verificaciones no modifican datos
5. **Timeout protegido**: Cada check tiene manejo de errores independiente

---

## Troubleshooting

### Database Error

```json
{
  "status": "error",
  "message": "Database connection failed: ..."
}
```

**Causas comunes**:
- `SUPABASE_SERVICE_ROLE_KEY` incorrecta
- Problemas de red con Supabase
- Tabla `doctors` no existe

### Cache Error

```json
{
  "status": "error",
  "message": "Cache connection failed: ..."
}
```

**Causas comunes**:
- `UPSTASH_REDIS_REST_URL` o `UPSTASH_REDIS_REST_TOKEN` incorrectos
- Problemas de conectividad con Upstash

### Stripe Error

```json
{
  "status": "error",
  "message": "Stripe API error: Invalid API key"
}
```

**Causas comunes**:
- `STRIPE_SECRET_KEY` incorrecta
- API key revocada
- Problemas de red con Stripe

### AI Error

```json
{
  "status": "error",
  "message": "No AI provider configured..."
}
```

**Causas comunes**:
- Ni `GLM_API_KEY` ni `OPENAI_API_KEY` están configuradas
- Variables de entorno no cargadas
