# API Routes de Consentimientos

Documentación de los endpoints API para el sistema de gestión de consentimientos de DoctorMX.

## Endpoints Creados

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|--------|
| GET | `/api/consent/status` | Obtiene el estado de consentimientos del usuario | Usuario autenticado |
| POST | `/api/consent/grant` | Otorga un consentimiento específico | Usuario autenticado |
| POST | `/api/consent/withdraw` | Retira un consentimiento previamente otorgado | Usuario autenticado |
| GET | `/api/consent/history` | Obtiene el historial de cambios de consentimiento | Usuario autenticado |
| GET | `/api/consent/audit` | Obtiene logs de auditoría (admin) | Administrador |

---

## GET /api/consent/status

Obtiene el estado completo de consentimientos del usuario autenticado, incluyendo resumen, consentimientos detallados y pendientes.

### Request

```http
GET /api/consent/status
Authorization: Bearer <token>
```

### Response 200 OK

```json
{
  "success": true,
  "data": {
    "summary": {
      "user_id": "user-123",
      "total_consents": 5,
      "active_consents": 3,
      "withdrawn_consents": 1,
      "expired_consents": 1,
      "pending_consents": 2,
      "consents_by_type": {
        "medical_treatment": 1,
        "data_processing": 1,
        "telemedicine": 1,
        "recording": 0,
        "ai_analysis": 0,
        "data_sharing": 0,
        "research": 0,
        "marketing": 1,
        "emergency_contact": 1,
        "prescription_forwarding": 0
      },
      "consents_by_category": {
        "essential": 2,
        "functional": 1,
        "analytical": 0,
        "marketing": 1,
        "legal": 1
      },
      "requires_attention": true,
      "last_updated": "2026-02-11T10:30:00Z"
    },
    "consents": [
      {
        "id": "consent-456",
        "consent_type": "marketing",
        "consent_type_label": "Marketing",
        "status": "granted",
        "granted_at": "2026-02-10T15:30:00Z",
        "withdrawn_at": null,
        "withdrawal_reason": null,
        "expires_at": null,
        "version": {
          "id": "version-789",
          "version": "1.0.0",
          "title": "Consentimiento para Marketing",
          "description": "Permite el envío de comunicaciones promocionales",
          "category": "marketing",
          "effective_date": "2026-01-01T00:00:00Z"
        },
        "delivery_method": "click_wrap",
        "age_verification": "verified_adult",
        "updated_at": "2026-02-10T15:30:00Z"
      }
    ],
    "pending_consents": [
      {
        "consent_type": "recording",
        "label": "Grabación de Consultas",
        "required": true,
        "version": {
          "id": "version-abc",
          "version": "1.0.0",
          "title": "Consentimiento para Grabación",
          "required_for_new_users": true
        }
      }
    ],
    "total_pending": 1
  }
}
```

### Response 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Se requiere autenticación"
}
```

---

## POST /api/consent/grant

Otorga un consentimiento específico para el usuario autenticado.

### Request

```http
POST /api/consent/grant
Authorization: Bearer <token>
Content-Type: application/json

{
  "consent_type": "marketing",
  "consent_version_id": "version-789",
  "delivery_method": "click_wrap",
  "metadata": {
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "page_url": "/settings/consent"
  }
}
```

### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `consent_type` | string | Sí | Tipo de consentimiento (ver enum abajo) |
| `consent_version_id` | string (uuid) | No | ID de la versión del consentimiento. Si no se proporciona, se usa la última versión activa |
| `delivery_method` | string | No | Método de entrega: `electronic_signature`, `click_wrap` (default), `browse_wrap`, `paper_form`, `verbal`, `implied` |
| `date_of_birth` | string (datetime) | No | Fecha de nacimiento para verificación de edad |
| `guardian_consent_record_id` | string (uuid) | No | ID del consentimiento del tutor (para menores) |
| `metadata` | object | No | Metadata adicional |

### Tipos de Consentimiento

- `medical_treatment` - Tratamiento Médico (esencial)
- `data_processing` - Procesamiento de Datos (legal)
- `telemedicine` - Telemedicina (funcional)
- `recording` - Grabación de Consultas (funcional)
- `ai_analysis` - Análisis con IA (analítico)
- `data_sharing` - Compartir Datos (funcional)
- `research` - Investigación (analítico)
- `marketing` - Marketing (opcional)
- `emergency_contact` - Contacto de Emergencia (esencial)
- `prescription_forwarding` - Reenvío de Recetas (funcional)

### Response 200 OK

```json
{
  "success": true,
  "message": "Consentimiento otorgado exitosamente",
  "data": {
    "consent": {
      "id": "consent-456",
      "user_id": "user-123",
      "consent_type": "marketing",
      "consent_version_id": "version-789",
      "status": "granted",
      "granted_at": "2026-02-11T10:30:00Z",
      "delivery_method": "click_wrap",
      "age_verification": "verified_adult"
    },
    "consent_type_label": "Marketing",
    "age_verification": {
      "status": "verified_adult",
      "requires_guardian": false,
      "age": 30,
      "legal_age": 18
    }
  }
}
```

### Response 400 Validation Error

```json
{
  "error": "Validation Error",
  "message": "Datos de entrada inválidos",
  "details": [
    {
      "path": ["consent_type"],
      "message": "Required"
    }
  ]
}
```

### Response 403 Cannot Withdraw Essential (para re-consentimiento)

```json
{
  "error": "REQUIRES_GUARDIAN_CONSENT",
  "message": "Se requiere consentimiento del tutor legal"
}
```

---

## POST /api/consent/withdraw

Retira un consentimiento previamente otorgado. No permite retirar consentimientos esenciales.

### Request por ID de Consentimiento

```http
POST /api/consent/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "consent_record_id": "consent-456",
  "withdrawal_reason": "Ya no deseo recibir comunicaciones de marketing"
}
```

### Request por Tipo de Consentimiento

```http
POST /api/consent/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "consent_type": "marketing",
  "withdrawal_reason": "Ya no deseo recibir comunicaciones de marketing"
}
```

### Campos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `consent_record_id` | string (uuid) | Condicional | ID del registro de consentimiento a retirar |
| `consent_type` | string | Condicional | Tipo de consentimiento a retirar (alternativa a consent_record_id) |
| `withdrawal_reason` | string | Sí | Razón del retiro (1-500 caracteres) |

### Response 200 OK

```json
{
  "success": true,
  "message": "Consentimiento retirado exitosamente",
  "data": {
    "consent": {
      "id": "consent-456",
      "user_id": "user-123",
      "consent_type": "marketing",
      "status": "withdrawn",
      "withdrawn_at": "2026-02-11T10:35:00Z",
      "withdrawal_reason": "Ya no deseo recibir comunicaciones de marketing",
      "withdrawn_by": "user"
    },
    "consent_type_label": "Marketing",
    "withdrawn_at": "2026-02-11T10:35:00Z",
    "withdrawal_reason": "Ya no deseo recibir comunicaciones de marketing"
  }
}
```

### Response 403 Cannot Withdraw Essential

```json
{
  "error": "Cannot Withdraw Essential",
  "message": "No se puede retirar el consentimiento esencial: Tratamiento Médico"
}
```

### Response 404 Consent Not Found

```json
{
  "error": "Consent Not Found",
  "message": "No se encontró un consentimiento activo de tipo: marketing"
}
```

---

## GET /api/consent/history

Obtiene el historial completo de cambios de consentimiento del usuario autenticado. Soporta exportación en CSV.

### Request

```http
GET /api/consent/history?format=json&consent_type=marketing&limit=50
Authorization: Bearer <token>
```

### Query Params

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `format` | string | `json` | Formato de respuesta: `json` o `csv` |
| `consent_type` | string | - | Filtrar por tipo de consentimiento |
| `start_date` | string (ISO) | - | Fecha inicial |
| `end_date` | string (ISO) | - | Fecha final |
| `limit` | number | 100 | Límite de resultados (max: 1000) |

### Response 200 OK (JSON)

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "history-001",
        "consent_record_id": "consent-456",
        "consent_type": "marketing",
        "consent_type_label": "Marketing",
        "action": "withdrawn",
        "old_status": "granted",
        "new_status": "withdrawn",
        "old_consent_version_id": null,
        "new_consent_version_id": "version-789",
        "changed_by": "user-123",
        "changed_by_role": "user",
        "change_reason": "Usuario retiró consentimiento",
        "ip_address": null,
        "created_at": "2026-02-11T10:35:00Z"
      },
      {
        "id": "history-002",
        "consent_record_id": "consent-456",
        "consent_type": "marketing",
        "consent_type_label": "Marketing",
        "action": "granted",
        "old_status": null,
        "new_status": "granted",
        "old_consent_version_id": null,
        "new_consent_version_id": "version-789",
        "changed_by": "user-123",
        "changed_by_role": "user",
        "change_reason": "Usuario otorgó consentimiento",
        "ip_address": null,
        "created_at": "2026-02-10T15:30:00Z"
      }
    ],
    "statistics": {
      "total_entries": 2,
      "by_action": {
        "granted": 1,
        "withdrawn": 1
      },
      "by_consent_type": {
        "marketing": 2
      }
    },
    "user_id": "user-123",
    "exported_at": "2026-02-11T10:40:00Z"
  }
}
```

### Response 200 OK (CSV)

```csv
Fecha,Acción,Estado Anterior,Estado Nuevo,Versión Anterior,Versión Nueva,Razón,Cambiado Por
"2026-02-11T10:35:00Z","withdrawn","granted","withdrawn","N/A","version-789","Usuario retiró consentimiento","user-123"
"2026-02-10T15:30:00Z","granted","N/A","granted","N/A","version-789","Usuario otorgó consentimiento","user-123"
```

---

## GET /api/consent/audit

Obtiene logs de auditoría de consentimientos. **Requiere rol de administrador**.

### Request

```http
GET /api/consent/audit?user_id=user-123&event_type=consent_granted&start_date=2026-02-01T00:00:00Z&end_date=2026-02-28T23:59:59Z&limit=100&include_stats=true
Authorization: Bearer <token>
```

### Query Params

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `user_id` | string (uuid) | - | ID de usuario específico |
| `event_type` | string | - | Tipo de evento a filtrar |
| `start_date` | string (ISO) | - | Fecha inicial |
| `end_date` | string (ISO) | - | Fecha final |
| `limit` | number | 100 | Límite de resultados (max: 1000) |
| `offset` | number | 0 | Offset para paginación |
| `include_stats` | string | `false` | Incluir estadísticas (`true` o `false`) |

### Tipos de Evento

- `consent_granted` - Consentimiento otorgado
- `consent_withdrawn` - Consentimiento retirado
- `consent_expired` - Consentimiento expirado
- `consent_revoked` - Consentimiento revocado
- `consent_modified` - Consentimiento modificado
- `consent_requested` - Consentimiento solicitado
- `consent_viewed` - Consentimiento visto
- `consent_declined` - Consentimiento rechazado
- `version_updated` - Versión actualizada
- `guardian_consent_added` - Consentimiento de tutor agregado
- `guardian_consent_removed` - Consentimiento de tutor removido
- `bulk_consent_operation` - Operación masiva
- `consent_export` - Exportación de consentimientos
- `consent_import` - Importación de consentimientos

### Response 200 OK

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "audit-001",
        "event_type": "consent_granted",
        "user_id": "user-123",
        "consent_type": "marketing",
        "consent_type_label": "Marketing",
        "consent_record_id": "consent-456",
        "action": "consent_granted",
        "action_result": "success",
        "error_message": null,
        "actor_user_id": "user-123",
        "actor_role": "user",
        "actor_ip_address": "192.168.1.1",
        "actor_user_agent": "Mozilla/5.0...",
        "session_id": "session-abc",
        "request_id": "req-123",
        "correlation_id": "corr-456",
        "occurred_at": "2026-02-10T15:30:00Z",
        "created_at": "2026-02-10T15:30:00Z",
        "data_changes": null
      }
    ],
    "total": 1,
    "limit": 100,
    "offset": 0
  },
  "statistics": {
    "total_events": 150,
    "events_by_type": {
      "consent_granted": 100,
      "consent_withdrawn": 20,
      "consent_expired": 10,
      "consent_modified": 20
    },
    "events_by_date": {
      "2026-02-10": 50,
      "2026-02-11": 100
    },
    "most_active_users": [
      {
        "user_id": "user-123",
        "event_count": 25
      }
    ]
  }
}
```

### Response 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Se requieren privilegios de administrador"
}
```

---

## Casos de Uso

### 1. Usuario quiere ver qué consentimientos ha dado

```typescript
const response = await fetch('/api/consent/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const { data } = await response.json()

console.log(`Tienes ${data.summary.active_consents} consentimientos activos`)
data.consents.forEach(consent => {
  console.log(`${consent.consent_type_label}: ${consent.status}`)
})
```

### 2. Usuario quiere retirar consentimiento de marketing

```typescript
const response = await fetch('/api/consent/withdraw', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    consent_type: 'marketing',
    withdrawal_reason: 'Ya no deseo recibir promociones'
  })
})
const result = await response.json()
console.log(result.message) // "Consentimiento retirado exitosamente"
```

### 3. Usuario quiere descargar historial de consentimientos

```typescript
// Descargar como CSV
const response = await fetch('/api/consent/history?format=csv', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
const blob = await response.blob()
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = 'consent-history.csv'
a.click()
```

### 4. Admin necesita ver auditoría de cambios

```typescript
const response = await fetch('/api/consent/audit?user_id=user-123&include_stats=true', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
})
const { data, statistics } = await response.json()

console.log(`Total de eventos: ${statistics.total_events}`)
data.logs.forEach(log => {
  console.log(`${log.event_type} - ${log.consent_type_label} - ${log.action_result}`)
})
```

---

## Integración con el Core de Consent

Los API routes utilizan las siguientes funciones del core (`src/lib/consent/`):

| Endpoint | Funciones del Core Utilizadas |
|----------|------------------------------|
| `/api/consent/status` | `getUserConsentSummary()`, `getUserConsents()`, `hasUserConsent()` |
| `/api/consent/grant` | `grantConsent()`, `getLatestConsentVersion()`, `verifyAgeAndConsentRequirements()` |
| `/api/consent/withdraw` | `withdrawConsent()`, `getUserConsents()` |
| `/api/consent/history` | `getConsentHistoryForUser()`, `exportConsentHistory()` |
| `/api/consent/audit` | `getAllAuditLogs()`, `getAuditLogsForUser()`, `getAuditLogStatistics()` |

---

## Archivos Creados

```
src/app/api/consent/
├── status/
│   └── route.ts       # GET /api/consent/status
├── grant/
│   └── route.ts       # POST /api/consent/grant
├── withdraw/
│   └── route.ts       # POST /api/consent/withdraw
├── history/
│   └── route.ts       # GET /api/consent/history
└── audit/
    └── route.ts       # GET /api/consent/audit
```

---

## Notas de Implementación

1. **Autenticación**: Todos los endpoints requieren autenticación mediante Bearer token
2. **Validación**: Se usa Zod para validación estricta de inputs
3. **Logging**: Todos los errores se registran usando el logger del sistema
4. **Auditoría**: Las operaciones de grant/withdraw se registran automáticamente en el sistema de auditoría
5. **Essential Consents**: Los consentimientos `medical_treatment` y `emergency_contact` no pueden ser retirados
6. **Guardian Consent**: Para menores de edad se requiere consentimiento del tutor
