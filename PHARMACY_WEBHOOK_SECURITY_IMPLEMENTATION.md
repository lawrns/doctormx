# SEC-016: Pharmacy Webhook Security Implementation

## Summary

Implementación de seguridad completa para el webhook de farmacia (`/api/pharmacy/webhook`) incluyendo:
- Verificación de firma HMAC-SHA256
- Validación de timestamp (prevención de ataques de replay)
- Lista de IPs permitidas (IP allowlist)
- Verificación de idempotencia

## Estado de Implementación

| Requisito | Estado |
|-----------|--------|
| Verificación HMAC-SHA256 | ✅ Implementado |
| Validación de timestamp | ✅ Implementado |
| IP Allowlist | ✅ Implementado |
| Idempotencia | ✅ Implementado |
| Tests de seguridad | ✅ 25+ tests |
| Documentación | ✅ Completa |

---

## Archivos Modificados/Creados

### Nuevos Archivos
1. `src/app/api/__tests__/pharmacy/webhook.test.ts` - Tests de seguridad (25+ tests)

### Archivos Modificados
1. `src/app/api/pharmacy/webhook/route.ts` - Webhook con seguridad completa
2. `src/lib/webhooks/signatures.ts` - Agregado `verifyPharmacyWebhook()` y `generateTestPharmacySignature()`
3. `src/lib/webhooks/config.ts` - Configuración para pharmacy webhooks
4. `src/lib/webhooks/ip-allowlist.ts` - Soporte para IP allowlist de pharmacy
5. `src/lib/webhooks/index.ts` - Exports actualizados
6. `src/lib/webhooks/__tests__/signatures.test.ts` - Tests para verificación de firmas

---

## Variables de Entorno

### Requeridas
```bash
# Pharmacy Webhook Secret (mínimo 32 caracteres recomendado)
PHARMACY_WEBHOOK_SECRET=your_pharmacy_webhook_secret_here

# Lista de IPs permitidas (opcional pero recomendado en producción)
# Formato: IPs separadas por comas
PHARMACY_IP_ALLOWLIST=192.168.1.100,10.0.0.50
```

### Opcionales
```bash
# Deshabilitar validación de IP (default: true)
WEBHOOK_IP_ALLOWLIST_ENABLED=true

# Saltar verificación en desarrollo (NO usar en producción)
WEBHOOK_SKIP_VERIFICATION_IN_DEV=false
```

---

## Implementación de Seguridad

### 1. Verificación de Firma HMAC-SHA256

```typescript
// El webhook espera los siguientes headers:
// - x-pharmacy-signature: Firma HMAC-SHA256 del payload
// - x-pharmacy-timestamp: Timestamp Unix en milisegundos
// - x-idempotency-key: Clave única para prevención de duplicados (opcional)

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

**Formato de la firma:**
- Algoritmo: HMAC-SHA256
- Input: Payload raw (string)
- Output: Hex string

### 2. Validación de Timestamp (Prevención de Replay Attacks)

```typescript
const MAX_TIMESTAMP_DIFFERENCE_MS = 5 * 60 * 1000; // 5 minutos

const now = Date.now();
const requestTime = parseInt(timestamp);
if (Math.abs(now - requestTime) > MAX_TIMESTAMP_DIFFERENCE_MS) {
  return new Response('Timestamp too old', { status: 401 });
}
```

**Reglas:**
- Timestamp debe estar dentro de ±5 minutos del tiempo actual
- Rechaza requests con timestamp viejo (replay attacks)
- Rechaza requests con timestamp futuro

### 3. IP Allowlist

```typescript
// Configuración via environment variable
PHARMACY_IP_ALLOWLIST=192.168.1.100,10.0.0.50

// Validación automática del header x-forwarded-for
const clientIp = getClientIp(request.headers);
if (!isWebhookIpAllowed(clientIp, 'pharmacy')) {
  return new Response('Forbidden', { status: 403 });
}
```

**Características:**
- Soporta IPs individuales
- Se puede deshabilitar con `WEBHOOK_IP_ALLOWLIST_ENABLED=false`
- En desarrollo, todas las IPs son permitidas

### 4. Idempotencia

```typescript
const idempotencyKey = request.headers.get('x-idempotency-key');

if (await isDuplicate(idempotencyKey)) {
  return new Response(
    JSON.stringify({ success: true, idempotent: true }),
    { status: 200 }
  );
}
```

**Comportamiento:**
- Si el evento ya fue procesado, retorna 200 con `idempotent: true`
- Evita procesamiento duplicado de transacciones
- Almacenado en tabla `webhook_events`

---

## Flujo de Seguridad

```
POST /api/pharmacy/webhook
│
├─► 1. IP Allowlist Check
│   └─► ¿IP permitida? ──No──► 403 Forbidden
│
├─► 2. Headers Validation
│   ├─► ¿x-pharmacy-signature? ──No──► 401 Missing signature
│   └─► ¿x-pharmacy-timestamp? ──No──► 401 Missing timestamp
│
├─► 3. Secret Configuration Check
│   └─► ¿PHARMACY_WEBHOOK_SECRET configurado? ──No──► 401 Not configured
│
├─► 4. Signature Verification
│   └─► ¿Firma válida? ──No──► 401 Invalid signature
│
├─► 5. Timestamp Validation
│   └─► ¿Dentro de ±5 min? ──No──► 401 Timestamp too old
│
├─► 6. Idempotency Check
│   └─► ¿Ya procesado? ──Sí──► 200 Idempotent response
│
├─► 7. Payload Validation
│   ├─► ¿JSON válido? ──No──► 400 Invalid JSON
│   ├─► ¿referralCode presente? ──No──► 400 Missing referral code
│   └─► ¿pharmacyId o pharmacyEmail? ──No──► 400 Missing pharmacy identification
│
├─► 8. Business Logic
│   ├─► Buscar farmacia
│   ├─► Buscar perfil
│   └─► Redimir referido
│
└─► 9. Response
    ├─► Éxito: 200 { success: true }
    ├─► Error negocio: 400/404
    └─► Error servidor: 500
```

---

## Respuestas HTTP

| Status | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Request válido procesado exitosamente |
| 200 | OK (Idempotent) | Evento ya procesado previamente |
| 400 | Bad Request | JSON inválido o campos requeridos faltantes |
| 401 | Unauthorized | Firma inválida, timestamp expirado o secret no configurado |
| 403 | Forbidden | IP no permitida |
| 404 | Not Found | Farmacia o perfil no encontrado |
| 500 | Internal Server Error | Error inesperado del servidor |

---

## Tests de Seguridad

### Cobertura de Tests

| Escenario | Tests |
|-----------|-------|
| Verificación de firma | 5 tests |
| Validación de timestamp | 4 tests |
| IP allowlist | 3 tests |
| Idempotencia | 4 tests |
| Validación de payload | 3 tests |
| Lógica de negocio | 3 tests |
| Manejo de errores | 2 tests |
| Modo desarrollo | 1 test |

**Total: 25+ tests**

### Ejecución de Tests

```bash
# Ejecutar tests del webhook de farmacia
npm test src/app/api/__tests__/pharmacy/webhook.test.ts

# Ejecutar tests de firmas (incluye pharmacy)
npm test src/lib/webhooks/__tests__/signatures.test.ts

# Ejecutar todos los tests de webhooks
npm test src/lib/webhooks/__tests__/
```

---

## Uso del Webhook

### Ejemplo de Request

```bash
curl -X POST https://api.doctormx.com/api/pharmacy/webhook \
  -H "Content-Type: application/json" \
  -H "x-pharmacy-signature: <hmac_sha256_signature>" \
  -H "x-pharmacy-timestamp: <unix_timestamp_ms>" \
  -H "x-idempotency-key: <unique_key>" \
  -d '{
    "referralCode": "REF123456",
    "pharmacyEmail": "pharmacy@example.com",
    "medicationTotalCents": 150000
  }'
```

### Generación de Firma (Node.js)

```javascript
const crypto = require('crypto');

function generatePharmacySignature(payload, secret, timestamp) {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return {
    signature,
    timestamp: timestamp || Date.now()
  };
}

// Uso
const payload = JSON.stringify({
  referralCode: 'REF123456',
  pharmacyEmail: 'pharmacy@example.com',
  medicationTotalCents: 150000
});

const { signature, timestamp } = generatePharmacySignature(
  payload,
  process.env.PHARMACY_WEBHOOK_SECRET
);

// Enviar headers:
// x-pharmacy-signature: signature
// x-pharmacy-timestamp: timestamp
```

### Generación de Firma (Python)

```python
import hmac
import hashlib
import json
import time

def generate_pharmacy_signature(payload: str, secret: str, timestamp: int = None):
    timestamp = timestamp or int(time.time() * 1000)
    signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    return signature, timestamp

# Uso
payload = json.dumps({
    "referralCode": "REF123456",
    "pharmacyEmail": "pharmacy@example.com",
    "medicationTotalCents": 150000
})

signature, timestamp = generate_pharmacy_signature(
    payload,
    os.environ['PHARMACY_WEBHOOK_SECRET']
)

# Enviar headers:
# x-pharmacy-signature: signature
# x-pharmacy-timestamp: timestamp
```

---

## Lista de Verificación de Seguridad

- [x] Sin signature → 401
- [x] Signature inválida → 401
- [x] Timestamp viejo → 401
- [x] Timestamp futuro → 401
- [x] Request duplicado → 200 (idempotent)
- [x] Request válido → 200 + procesado
- [x] IP no permitida → 403
- [x] Payload inválido → 400
- [x] Campos requeridos faltantes → 400
- [x] Farmacia no encontrada → 404

---

## Mejores Prácticas Seguidas

1. **Defense in Depth**: Múltiples capas de seguridad (IP + firma + timestamp)
2. **Fail Secure**: Rechazar por defecto, permitir explícitamente
3. **No Secrets in Logs**: Todos los logs excluyen datos sensibles
4. **Timing Attack Prevention**: Uso de `timingSafeEqual` para comparaciones
5. **Replay Attack Prevention**: Validación de timestamp (5 minutos)
6. **Logging Completo**: Eventos de seguridad logueados para monitoreo
7. **Test Coverage**: 25+ tests cubriendo todos los escenarios de seguridad

---

## Referencias

1. [OWASP Webhook Security](https://cheatsheetseries.owasp.org/cheatsheets/Webhook_Security_Cheat_Sheet.html)
2. [HMAC Wikipedia](https://en.wikipedia.org/wiki/HMAC)
3. [Timing Attack Prevention](https://codahale.com/a-lesson-in-timing-attacks/)
4. [Webhook Security Best Practices](https://webhooks.fyi/)

---

## Tiempo de Implementación

**Total**: ~3.5 horas

- Análisis de código existente: 20 min
- Implementación de verificación de firma: 30 min
- Implementación de timestamp e IP allowlist: 30 min
- Implementación de idempotencia: 20 min
- Creación de tests: 60 min
- Documentación: 30 min
- Revisión y ajustes: 20 min
