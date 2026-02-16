# API Routes ARCO (Acceso, Rectificación, Cancelación, Oposición)

Este módulo implementa los endpoints API para el sistema de derechos ARCO conforme a la LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares) de México.

## Endpoints

### 1. Solicitudes ARCO (CRUD)

#### `GET /api/arco/requests`
Lista todas las solicitudes ARCO del usuario autenticado.

**Query Parameters:**
- `request_type` (opcional): `'ACCESS' | 'RECTIFY' | 'CANCEL' | 'OPPOSE'`
- `status` (opcional): `'pending' | 'acknowledged' | 'processing' | 'completed' | 'denied' | 'cancelled'`

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [...],
    "count": 5
  }
}
```

#### `POST /api/arco/requests`
Crea una nueva solicitud ARCO genérica.

**Body:**
```json
{
  "request_type": "ACCESS",
  "title": "Solicitud de Acceso a Mis Datos",
  "description": "Deseo recibir una copia de todos mis datos personales",
  "data_scope": ["all"],
  "specific_records": ["optional"],
  "justification": "Ejercicio de derecho ARCO"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": { ... },
    "message": "Solicitud creada exitosamente",
    "due_date": "2026-03-09T12:00:00Z",
    "sla_days": 20
  }
}
```

#### `GET /api/arco/requests/[id]`
Obtiene los detalles de una solicitud ARCO específica.

**Response:**
```json
{
  "success": true,
  "data": {
    "request": { ... },
    "template": {
      "title": "...",
      "description": "...",
      "default_data_scope": ["all"]
    }
  }
}
```

---

### 2. Exportación de Datos (Derecho de Acceso)

#### `GET /api/arco/export`
Exporta los datos personales del usuario.

**Query Parameters:**
- `format` (opcional): `'json' | 'text' | 'pdf'` (default: `'json'`)
- `scope` (opcional): array de tablas a exportar (default: `['all']`)

**Ejemplo:**
```
GET /api/arco/export?format=json&scope=["profiles","appointments"]
```

**Response (JSON):**
```json
{
  "success": true,
  "data": {
    "export": {
      "user_profile": { ... },
      "appointments": [...],
      "consultations": [...],
      "export_metadata": {
        "exported_at": "2026-02-11T10:30:00Z",
        "total_records": 42
      }
    },
    "format": "json"
  },
  "meta": {
    "total_records": 42,
    "data_scope": ["profiles", "appointments"]
  }
}
```

**Response (TEXT):**
Retorna texto plano descargable con formato:
```
REPORTE DE DATOS PERSONALES - DERECHO DE ACCESO ARCO
====================================================
Fecha de exportación: 2026-02-11T10:30:00Z
...
```

#### `POST /api/arco/export`
Versión POST para scope complejo.

**Body:**
```json
{
  "format": "json",
  "scope": ["profiles", "appointments", "prescriptions"]
}
```

---

### 3. Rectificación de Datos (Derecho de Rectificación)

#### `POST /api/arco/rectify`
Solicita la corrección de datos personales inexactos.

**Body:**
```json
{
  "description": "Mi número de teléfono está incorrecto",
  "data_scope": ["profiles"],
  "field_changes": [
    {
      "table": "profiles",
      "field": "phone",
      "current_value": "555-0100",
      "proposed_value": "555-0199"
    }
  ],
  "justification": "El número registrado tiene un dígito incorrecto"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": { ... },
    "template": { ... },
    "message": "Solicitud de rectificación creada exitosamente",
    "sla_days": 20,
    "due_date": "2026-03-09T12:00:00Z"
  }
}
```

---

### 4. Cancelación de Datos (Derecho de Cancelación)

#### `GET /api/arco/cancel`
Obtiene información sobre políticas de retención antes de solicitar cancelación.

**Response:**
```json
{
  "success": true,
  "data": {
    "retention_policy": {
      "medical_records": {
        "retention_period": "5 años",
        "legal_basis": "NOM-004-SSA3-2012"
      },
      "payment_records": {
        "retention_period": "5 años",
        "legal_basis": "Código Fiscal de la Federación (SAT)"
      }
    }
  }
}
```

#### `POST /api/arco/cancel`
Solicita la eliminación de datos personales.

**Body:**
```json
{
  "description": "Solicito la eliminación de todos mis datos personales",
  "data_scope": ["all"],
  "acknowledge_retention": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": { ... },
    "deletion_plan": {
      "tables": [...],
      "immediate_deletions": [...],
      "delayed_deletions": [...],
      "requires_anonymization": ["profiles"]
    },
    "retention_notice": {
      "medical_records": "5 años (NOM-004-SSA3-2012)",
      "payment_records": "5 años (SAT)",
      "profile": "Anonimización"
    }
  }
}
```

---

### 5. Oposición al Tratamiento (Derecho de Oposición)

#### `GET /api/arco/oppose`
Obtiene las opciones de oposición disponibles y preferencias actuales.

**Response:**
```json
{
  "success": true,
  "data": {
    "opposition_options": [
      {
        "id": "marketing_emails",
        "label": "Correos electrónicos de marketing",
        "currently_active": true
      }
    ],
    "current_preferences": { ... }
  }
}
```

#### `POST /api/arco/oppose`
Solicita la oposición al tratamiento de datos para fines específicos.

**Body:**
```json
{
  "opposition_reasons": [
    "marketing_emails",
    "analytics",
    "ai_training"
  ],
  "apply_immediately": true,
  "description": "No deseo que mis datos se usen para estos fines"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": { ... },
    "privacy_preferences_updated": true,
    "applied_changes": {
      "marketing_emails": false,
      "analytics_consent": false,
      "ai_training_consent": false
    },
    "previous_preferences": { ... }
  }
}
```

---

## Autenticación

Todos los endpoints requieren autenticación. El usuario debe tener una sesión válida de Supabase Auth.

**Error de autenticación:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Se requiere autenticación"
  }
}
```

## Validación de Datos

Todos los endpoints utilizan Zod para validar los datos de entrada.

**Error de validación:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      { "field": "title", "message": "El título debe tener al menos 5 caracteres" }
    ]
  }
}
```

## SLA (Service Level Agreement)

De acuerdo con la LFPDPPP:
- **Tiempo máximo de respuesta:** 20 días hábiles
- **Acuse de recibo:** Dentro de 24 horas
- **Fecha límite calculada:** automáticamente al crear la solicitud

## Códigos de Error ARCO

- `DUPLICATE_REQUEST` - Ya existe una solicitud pendiente del mismo tipo
- `INVALID_REQUEST_TYPE` - Tipo de solicitud no válido
- `INVALID_DATA_SCOPE` - Alcance de datos no válido
- `REQUEST_NOT_FOUND` - Solicitud no encontrada
- `SLA_EXCEEDED` - Se excedió el tiempo de respuesta
- `CANNOT_DELETE_REQUIRED_DATA` - No se pueden eliminar datos requeridos legalmente
- `LEGAL_HOLD` - Retención legal activa

## Uso del Core ARCO

Todos los endpoints utilizan las funciones del core en `src/lib/arco/`:

```typescript
import {
  createArcoRequest,
  getUserArcoRequests,
  getArcoRequest,
  getArcoRequestTemplate,
  getUserDataExport,
  updateUserPrivacyPreferences,
  planDataDeletion,
} from '@/lib/arco'
```

## Notas Legales

### Retención de Datos Obligatoria

Algunos datos no pueden eliminarse completamente debido a:

| Tipo de Dato | Período | Base Legal |
|--------------|---------|------------|
| Expedientes médicos | 5 años | NOM-004-SSA3-2012 |
| Recetas médicas | 5 años | NOM-004-SSA3-2012 |
| Registros de pago | 5 años | SAT - Código Fiscal |
| Perfil de usuario | Indefinido | Integridad de BD (anonimizado) |

### Referencias Legales

- **LFPDPPP Art. 15-23:** Derechos ARCO
- **LFPDPPP Art. 18:** SLA de 20 días hábiles
- **NOM-004-SSA3-2012:** Expedientes clínicos
- **CCFF Art. 30:** Retención fiscal

## Testing

Ejemplos de requests usando cURL:

```bash
# Listar solicitudes
curl -X GET "http://localhost:3000/api/arco/requests" \
  -H "Cookie: supabase-auth-token=..."

# Crear solicitud de acceso
curl -X POST "http://localhost:3000/api/arco/requests" \
  -H "Content-Type: application/json" \
  -H "Cookie: supabase-auth-token=..." \
  -d '{
    "request_type": "ACCESS",
    "title": "Solicitud de Acceso",
    "description": "Deseo mis datos",
    "data_scope": ["all"]
  }'

# Exportar datos
curl -X GET "http://localhost:3000/api/arco/export?format=json" \
  -H "Cookie: supabase-auth-token=..." \
  --output mis_datos.json

# Oponerse a marketing
curl -X POST "http://localhost:3000/api/arco/oppose" \
  -H "Content-Type: application/json" \
  -H "Cookie: supabase-auth-token=..." \
  -d '{
    "opposition_reasons": ["marketing_emails", "marketing_sms"],
    "apply_immediately": true
  }'
```

## Archivos Creados

```
src/app/api/arco/
├── README.md                    # Esta documentación
├── requests/
│   ├── route.ts                 # GET/POST listar y crear solicitudes
│   └── [id]/
│       └── route.ts             # GET detalle de solicitud
├── export/
│   └── route.ts                 # GET/POST exportar datos
├── rectify/
│   └── route.ts                 # POST solicitar rectificación
├── cancel/
│   └── route.ts                 # GET/POST solicitar cancelación
└── oppose/
    └── route.ts                 # GET/POST solicitar oposición
```

---

**Fecha de creación:** 2026-02-11  
**Versión:** 1.0  
**Cumplimiento:** LFPDPPP (México)
