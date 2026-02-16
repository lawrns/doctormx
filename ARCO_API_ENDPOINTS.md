# Endpoints API del Sistema ARCO - DoctorMX

## Resumen

Sistema ARCO (Acceso, Rectificación, Cancelación, Oposición) para cumplimiento de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) de México.

**SLA Legal:** 20 días hábiles para responder a solicitudes ARCO.

---

## Endpoints Creados

### 1. Solicitudes ARCO

#### `GET /api/arco/requests`
Listar solicitudes ARCO del usuario autenticado (o todas para admin).

**Query Params:**
- `request_type`: `ACCESS` | `RECTIFY` | `CANCEL` | `OPPOSE` - Filtrar por tipo
- `status`: `pending` | `acknowledged` | `processing` | `completed` | `denied` | `cancelled` - Filtrar por estado
- `user_id`: string (solo admin) - Filtrar por usuario específico
- `page`: number (solo admin) - Página para paginación
- `per_page`: number (solo admin, default: 20) - Items por página
- `sort`: `created_at` | `due_date` | `status` | `priority` | `request_type` - Ordenamiento

**Respuesta (Usuario):**
```json
{
  "success": true,
  "data": {
    "requests": [...],
    "count": 5
  }
}
```

**Respuesta (Admin):**
```json
{
  "success": true,
  "data": {
    "requests": [...],
    "pagination": {
      "total": 50,
      "page": 1,
      "per_page": 20,
      "total_pages": 3,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

---

#### `POST /api/arco/requests`
Crear una nueva solicitud ARCO.

**Body:**
```json
{
  "request_type": "ACCESS" | "RECTIFY" | "CANCEL" | "OPPOSE",
  "title": "string (min: 5, max: 200)",
  "description": "string (min: 10, max: 2000)",
  "data_scope": ["profiles", "appointments", "prescriptions", "soap_consultations", "chat_conversations", "chat_messages", "payments", "follow_up_schedules", "all"],
  "specific_records": ["string"] (opcional),
  "justification": "string (max: 1000)" (opcional)
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "request": { ...requestObject },
    "message": "Solicitud de ... creada exitosamente",
    "description": "...",
    "due_date": "2025-03-15T...",
    "sla_days": 20
  }
}
```

---

### 2. Detalle de Solicitud

#### `GET /api/arco/requests/[id]`
Obtener detalles de una solicitud ARCO específica.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "uuid",
      "request_type": "ACCESS",
      "status": "pending",
      "title": "...",
      "description": "...",
      "data_scope": ["all"],
      "user_name": "...",
      "user_email": "...",
      "business_days_elapsed": 5,
      "business_days_remaining": 15,
      "is_overdue": false,
      "history": [...],
      "attachments": [...],
      "communications": [...]
    },
    "template": {
      "title": "...",
      "description": "...",
      "default_data_scope": ["all"]
    }
  }
}
```

---

#### `PUT /api/arco/requests/[id]` (Admin)
Actualizar una solicitud ARCO.

**Body:**
```json
{
  "status": "pending" | "acknowledged" | "processing" | "info_required" | "escalated" | "completed" | "denied" | "cancelled",
  "assigned_to": "uuid",
  "escalation_level": "tier_1" | "tier_2" | "tier_3" | "tier_4",
  "priority": "low" | "normal" | "high" | "urgent",
  "response": "string (max: 5000)",
  "denial_reason": "string (max: 1000)",
  "denial_legal_basis": "string (max: 500)"
}
```

**Restricciones:**
- Solo administradores pueden actualizar solicitudes
- Se validan las transiciones de estado válidas
- No se puede modificar una solicitud completada o denegada

---

#### `DELETE /api/arco/requests/[id]`
Cancelar una solicitud ARCO.

**Restricciones:**
- Solo el usuario que creó la solicitud puede cancelarla
- No se puede cancelar una solicitud ya completada, denegada o cancelada

---

### 3. Exportación de Datos

#### `GET /api/arco/requests/[id]/export`
Exportar datos para solicitudes de tipo ACCESO.

**Query Params:**
- `format`: `json` | `txt` | `portability` (default: `json`)
- `download`: boolean (default: `true`)

**Restricciones:**
- Solo solicitudes de tipo `ACCESS`
- Solo solicitudes en estado `COMPLETED`
- Solo el propietario o admin puede exportar

**Respuesta (download=false):**
```json
{
  "success": true,
  "data": {
    "format": "json",
    "filename": "arco_datos_xxx_2025-02-11.json",
    "request_id": "uuid",
    "user_id": "uuid",
    "exported_at": "2025-02-11T...",
    "content": { ...dataPackage }
  }
}
```

**Respuesta (download=true):** Archivo descargable

---

### 4. Estadísticas (Admin)

#### `GET /api/arco/stats`
Obtener estadísticas del sistema ARCO.

**Query Params:**
- `period`: `7d` | `30d` | `90d` | `6m` | `1y` (default: `30d`)
- `detailed`: boolean (default: `false`)
- `include_overdue`: boolean (default: `true`)
- `include_escalations`: boolean (default: `true`)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "period": "2025-01-12 to 2025-02-11",
      "total_requests": 150,
      "active_requests": 45,
      "completed_requests": 95,
      "cancelled_requests": 5,
      "denied_requests": 5,
      "overdue_count": 3,
      "sla_compliance_rate": 96
    },
    "by_status": {
      "pending": 20,
      "processing": 15,
      "completed": 95,
      ...
    },
    "by_type": {
      "ACCESS": { "total": 50, "completed": 40, "pending": 8, "overdue": 2 },
      "RECTIFY": { "total": 40, "completed": 30, "pending": 8, "overdue": 1 },
      "CANCEL": { "total": 30, "completed": 15, "pending": 12, "overdue": 0 },
      "OPPOSE": { "total": 30, "completed": 10, "pending": 17, "overdue": 0 }
    },
    "sla_metrics": { ... },
    "escalations": { ... },
    "overdue_requests": [ ... ],
    "recent_activity": [ ... ]
  }
}
```

---

#### `POST /api/arco/stats` (Admin)
Acciones administrativas sobre estadísticas ARCO.

**Body:**
```json
{
  "action": "generate_report" | "auto_escalate" | "export_csv",
  "period": 6
}
```

**Acciones:**
- `generate_report`: Generar reporte detallado de SLA
- `auto_escalate`: Ejecutar escalación automática de solicitudes vencidas
- `export_csv`: Exportar estadísticas a CSV

---

## Endpoints ARCO Existentes (Legado)

Los siguientes endpoints existen para operaciones específicas:

- `POST /api/arco/cancel` - Crear solicitud de cancelación con plan de eliminación
- `POST /api/arco/rectify` - Crear solicitud de rectificación
- `POST /api/arco/oppose` - Crear solicitud de oposición
- `GET /api/arco/export` - Exportar datos del usuario autenticado

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `UNAUTHORIZED` | Se requiere autenticación |
| `FORBIDDEN` | No tiene permisos para realizar la acción |
| `REQUEST_NOT_FOUND` | Solicitud no encontrada |
| `INVALID_REQUEST_TYPE` | Tipo de solicitud inválido |
| `INVALID_STATUS` | Estado inválido o transición no permitida |
| `VALIDATION_ERROR` | Datos de entrada inválidos |
| `INVALID_DATA_SCOPE` | Alcance de datos especificado no válido |
| `DUPLICATE_REQUEST` | Ya existe una solicitud de este tipo en proceso |
| `CANNOT_CANCEL` | No se puede cancelar la solicitud en su estado actual |
| `REQUEST_NOT_COMPLETED` | La solicitud debe estar completada para esta acción |
| `INVALID_FORMAT` | Formato de exportación no válido |
| `INTERNAL_ERROR` | Error interno del servidor |

---

## Tipos de Solicitudes ARCO

| Tipo | Descripción |
|------|-------------|
| `ACCESS` | Derecho de Acceso - Solicitar una copia de todos los datos personales |
| `RECTIFY` | Derecho de Rectificación - Corregir información inexacta o incompleta |
| `CANCEL` | Derecho de Cancelación - Solicitar la eliminación de datos personales |
| `OPPOSE` | Derecho de Oposición - Oponerse al procesamiento de datos |

---

## Estados de Solicitudes

| Estado | Descripción |
|--------|-------------|
| `pending` | Pendiente - Solicitud recibida, pendiente de reconocimiento |
| `acknowledged` | Reconocido - Solicitud reconocida por el sistema |
| `processing` | Procesando - En proceso de atención |
| `info_required` | Información Requerida - Se requiere información adicional del usuario |
| `escalated` | Escalado - Escalado a nivel superior |
| `completed` | Completado - Solicitud atendida exitosamente |
| `denied` | Denegado - Solicitud denegada con motivo |
| `cancelled` | Cancelado - Cancelado por el usuario |

---

## Archivos Creados

1. `src/app/api/arco/requests/route.ts` - GET, POST
2. `src/app/api/arco/requests/[id]/route.ts` - GET, PUT, DELETE
3. `src/app/api/arco/requests/[id]/export/route.ts` - GET
4. `src/app/api/arco/stats/route.ts` - GET, POST
5. `src/lib/arco/index.ts` - Actualizado con exportaciones faltantes

---

## Notas Legales

- **Plazo de respuesta:** Máximo 20 días hábiles (LFPDPPP)
- **Retención médica:** 5 años (NOM-004-SSA3-2012)
- **Retención fiscal:** 5 años (SAT)
- **Anonimización:** Perfiles se anonimizan en lugar de eliminarse por integridad de BD
