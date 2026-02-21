# Plan de Respuesta a Incidentes - Doctor.mx

> **Última actualización:** 2026-02-10
> **Versión:** 1.0
> **Contexto:** Plataforma de teleconsultas médicas - México
> **Normativa:** NOM-024-SSA1-2012, Ley Federal de Protección de Datos

---

## 1. Propósito y Alcance

### 1.1 Objetivo

Establecer procedimientos estandarizados para la detección, respuesta y recuperación de incidentes que afecten los servicios de Doctor.mx, minimizando impacto en pacientes y doctores.

### 1.2 Alcance

**Incluye:**
- Incidentes técnicos (caídas de servicio, bugs críticos)
- Incidentes de seguridad (accesos no autorizados, exposición de datos)
- Incidentes operacionales (errores humanos, configuraciones incorrectas)
- Incidentes de terceros (fallas en Supabase, Stripe, Twilio)

**No incluye:**
- Mejoras continuas (manejadas en roadmap)
- Peticiones de features (manejadas en product)
- Incidencias menores de UX (manejadas en soporte)

---

## 2. Clasificación de Incidentes

### 2.1 Niveles de Severidad (S1-S4)

| Nivel | Nombre | Definición | Tiempo de Respuesta | Tiempo de Resolución |
|-------|--------|------------|---------------------|----------------------|
| **S1** | Crítico | Servicio completamente caído o pérdida de datos | 5 min | 1 hora |
| **S2** | Alto | Funcionalidad crítica afectada (pagos, videollamadas) | 15 min | 4 horas |
| **S3** | Medio | Funcionalidad importante afectada (notificaciones, analytics) | 30 min | 24 horas |
| **S4** | Bajo | Funcionalidad menor afectada o issue cosmético | 2 horas | 7 días |

### 2.2 Ejemplos por Nivel

**S1 - Crítico:**
- Base de datos inaccesible
- Pérdida de expedientes clínicos
- Sitio web completamente caído
- Exposición masiva de datos PHI (Protected Health Information)

**S2 - Alto:**
- Videollamadas no funcionan
- Sistema de pagos caído
- No se pueden agendar citas
- Login no funciona para usuarios
- Ransomware detectado

**S3 - Medio:**
- Notificaciones de WhatsApp no se envían
- Analytics no registran datos
- Exportación de expedientes falla
- Performance degradado (> 3s respuesta)

**S4 - Bajo:**
- Typo en UI
- Error menor en reportes
- Feature flag no funciona
- Inconsistencia visual en browser específico

---

## 3. Procedimientos de Respuesta

### 3.1 Flujo General de Incidentes

```
┌─────────────────────────────────────────────────────────────┐
│                    DETECCIÓN DEL INCIDENTE                  │
│  (Monitoreo, Reporte de Usuario, Alerta Automática)        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                     TRIAJE INICIAL                          │
│  (Evaluar severidad, Determinar tipo de incidente)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
       S1/P1        S2/P2        S3/S4
          │            │            │
          ▼            ▼            ▼
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │Equipos   │  │Equipo    │  │Soporte/  │
   │completos │  │Tech Lead │  │Dev según │
   │          │  │+ Ops     │  │turno     │
   └─────┬────┘  └─────┬────┘  └─────┬────┘
         │             │             │
         ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                  CONTENCIÓN INMEDIATA                       │
│  (Mitigar impacto, Prevenir expansión)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  INVESTIGACIÓN Y DIAGNÓSTICO                │
│  (Determinar causa raíz, Recopilar evidencias)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  RESOLUCIÓN Y RECUPERACIÓN                  │
│  (Implementar fix, Restaurar servicios)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  VERIFICACIÓN Y MONITOREO                   │
│  (Confirmar solución, Vigilar recurrencias)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  POST-MORTEM Y MEJORA                       │
│  (Documentar lecciones, Implementar preventivos)           │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Playbooks Específicos

#### PLAYBOOK: CAÍDA DE SERVICIO (S1)

**Detección:**
- Alerta de Uptime Robot
- Multiple tickets de soporte
- Error rate > 50% en Sentry

**Triage:**
```bash
# 1. Verificar estado general
curl -I https://doctormx.com
ping doctormx.com

# 2. Verificar Supabase
curl -I https://xxx.supabase.co
# Dashboard: https://app.supabase.com/project/xxx

# 3. Verificar Vercel
vercel ls
# Dashboard: https://vercel.com/xxx

# 4. Verificar otros servicios
status.twilio.com
status.stripe.com
```

**Contención:**
```bash
# Activar página de mantenimiento
vercel deploy --prebuilt \
  --build-env NEXT_PUBLIC_MAINTENANCE_MODE=true

# Anunciar en Slack
/post #emergency "⚠️ S1 Incidente declarado - Sitio caído"

# Actualizar status page
curl -X POST https://status.doctormx.com/api/incident \
  -d '{"status":"investigating","message":"Sitio no accesible"}'
```

**Resolución:**
1. Si es Vercel: `vercel rollback`
2. Si es Supabase: Contactar soporte P1
3. Si es código: Deploy de hotfix
4. Si es DDOS: Activar Cloudflare protection

#### PLAYBOOK: PÉRDIDA DE DATOS (S1)

**Detección:**
- Alerta de inconsistencia en base de datos
- Reporte de usuario: "Mi expediente desapareció"
- Query de monitoreo retorna count inesperado

**Triage:**
```sql
-- 1. Verificar conteos de tablas críticas
SELECT
  (SELECT COUNT(*) FROM consultations) as consultations,
  (SELECT COUNT(*) FROM appointments) as appointments,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM digital_signatures) as signatures;

-- 2. Verificar registros más recientes
SELECT MAX(created_at) FROM consultations;

-- 3. Buscar registros eliminados
SELECT * FROM consultations
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- 4. Verificar logs de auditoría
SELECT * FROM security_events
WHERE event_type = 'data_deletion'
ORDER BY created_at DESC LIMIT 50;
```

**Contención:**
```bash
# 1. DETENER TODAS LAS ESCRITURAS
# ALTER DATABASE postgres SET default_transaction_read_only = on;

# 2. No permitir nuevos logins
# ALTER ROLE postgres NOLOGIN;

# 3. Documentar estado actual
pg_dump -Fc --schema-only > current_schema.sql
```

**Resolución:**
```bash
# 1. Restaurar desde backup más reciente
supabase db restore \
  --project-ref xxx \
  --backup-id 20260210_030000

# 2. Si backup está incompleto, usar PITR
supabase db restore \
  --project-ref xxx \
  --to-time "2026-02-10 14:30:00-06"

# 3. Verificar integridad
# Verificar que no haya pérdidas
```

#### PLAYBOOK: EXPOSICIÓN DE DATOS (S1 - SEGURIDAD)

**Detección:**
- Alerta de Have I Been Pwned
- Reporte de investigador de seguridad
- Datos encontrados en dark web
- Acceso no autorizado detectado

**Triage:**
```bash
# 1. Identificar alcance
# - ¿Qué datos? (PHI, PII, financieros)
# - ¿Cuántos usuarios afectados?
# - ¿Por cuánto tiempo?

# 2. Verificar logs de acceso
SELECT * FROM security_events
WHERE event_type = 'unauthorized_access'
  AND created_at > NOW() - INTERVAL '7 days';

# 3. Buscar patrones sospechosos
SELECT user_id, COUNT(*), ip_address
FROM security_events
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id, ip_address
HAVING COUNT(*) > 100;
```

**Contención:**
```bash
# 1. Rotar todas las credenciales
supabase projects api-keys rotate \
  --project-ref xxx

# 2. Revocar sesiones activas
DELETE FROM auth.sessions WHERE created_at < NOW();

# 3. Incrementar monitoreo
# Habilitar logging extendido
```

**Comunicación Legal:**
```plaintext
Timeline México (48 horas):
- Hora 0: Detección y contención
- Hora 24: Análisis completo del impacto
- Hora 48: Notificación a afectados + autoridades

Si afecta > 500 personas: Notificar en 72 horas
```

#### PLAYBOOK: FALLA DE PAGOS (S2)

**Detección:**
- Alertas de Stripe: "PaymentIntent failed"
- Usuarios no pueden completar pago
- Dashboard muestra 0% success rate

**Triage:**
```bash
# 1. Verificar webhook de Stripe
stripe listen --forward-to localhost:3000/api/webhooks

# 2. Verificar API key
stripe keys verify

# 3. Verificar logs
stripe logs tail --api_key sk_test_...

# 4. Test payment
stripe payment_intents create \
  --amount=1000 \
  --currency=mxn
```

**Contención:**
```typescript
// Activar modo "pagar después"
const emergencyMode = {
  requirePayment: false,
  collectPaymentLater: true,
  paymentDeadline: '24_hours'
}
```

**Resolución:**
1. Si es API key: Rotar credenciales
2. Si es webhook: Reinstalar endpoint
3. Si es código: Deploy de fix
4. Procesar pagos pendientes manualmente

#### PLAYBOOK: VIDEOLLAMADAS FALLANDO (S2)

**Detección:**
- Tickets: "No puedo conectar a videollamada"
- Error rate en `/api/video/token` > 20%
- Twilio console muestra errores

**Triage:**
```bash
# 1. Verificar Twilio
curl -X GET "https://video.twilio.com/v1/Rooms" \
  -u "SID:TOKEN"

# 2. Test token generation
node scripts/test-twilio-token.js

# 3. Verificar quotas
twilio api:core:accounts:fetch
```

**Contención:**
```typescript
// Redirigir a alternativa
const fallback = {
  provider: 'zoom',
  message: 'Videollamadas temporariamente en Zoom'
}
```

**Resolución:**
1. Si es quota: Upgrade plan
2. Si es API: Rotar credenciales
3. Si es código: Deploy de fix
4. Reagendar videollamadas afectadas

---

## 4. Procedimientos de Escalación

### 4.1 Matriz de Escalación

**Nivel 1: Soporte / Ops Engineer**
- **Puede manejar:** S3-S4
- **Autonomía:** Completa
- **Escala a:** Technical Lead si > 1 hora sin resolver

**Nivel 2: Technical Lead + Ops**
- **Puede manejar:** S2-S3
- **Autonomía:** Alta
- **Escala a:** IRT completo si > 30 min sin resolver

**Nivel 3: Incident Response Team (IRT)**
- **Puede manejar:** S1-S2
- **Autonomía:** Completa
- **Escala a:** Ejecutivos si impacto financiero > $100k MXN

**Nivel 4: Ejecutivos + Legal**
- **Autoriza:** Failover total, gasto de emergencia, comunicación pública
- **Decisiones:** Continuar o detener servicios, indemnizaciones

### 4.2 Protocolos de Escalación

**Escalación Técnica:**
```plaintext
1. Ops Engineer detecta incidente
2. Intenta resolver por 15 min
3. Si no resuelve: Escala a Technical Lead
4. Technical Lead evalúa, puede resolver o escalar
5. Si es S1 o > 30 min: Convocar IRT completo
```

**Escalación Ejecutiva:**
```plaintext
1. IRT determina impacto ejecutivo
2. Notifica a CTO/CEO vía Slack + WhatsApp
3. Ejecutivo evalúa: ¿Requiere aprobación?
4. Si sí: Convoca conferencia ejecutiva
5. Documenta decisión en #incident-log
```

**Escalación Legal:**
```plaintext
1. Incidente con datos PHI/PII
2. IRT notifica a Legal inmediatamente
3. Legal evalúa implicaciones normativas
4. Determina timeline de notificaciones
5. Prepara comunicación a autoridades
```

---

## 5. Comunicación Durante Incidentes

### 5.1 Comunicación Interna

**Canales:**
- `#emergency` - Comandos y actualizaciones críticas
- `#incidents` - Post-mortems y discusiones
- `#status` - Status page updates

**Formato de Actualizaciones:**
```markdown
## Incidente [ID] - [Título]
**Severidad:** S1/S2/S3/S4
**Estado:** Detectado / Contenido / Investigando / Resolviendo / Verificando / Cerrado
**Inicio:** [Timestamp]
**Duración:** [X horas]

### Resumen
[Qué pasó]

### Impacto
[Quiénes afectados, cómo afecta]

### Acciones en Progreso
- [ ] Acción 1 - @persona
- [ ] Acción 2 - @persona

### Próxima Actualización
[En X minutos]

---
```

**Frecuencia de Actualizaciones:**
- S1: Cada 15 minutos
- S2: Cada 30 minutos
- S3: Cada 2 horas
- S4: Diario

### 5.2 Comunicación Externa

**Status Page:**
```plaintext
## Incidente en Progreso

### Qué está pasando
[Descripción simple y honesta del problema]

### Impacto
- [X] Agendamiento de citas
- [X] Videollamadas
- [ ] Pagos (no afectado)

### Próximos pasos
[Qué estamos haciendo para arreglarlo]

### Próxima actualización
[HH:MM CST]
```

**Email a Usuarios:**
```plaintext
Asunto: Actualización Importante - Doctor.mx

Hola [Nombre],

Queremos informarte que estamos experimentando [problema].

Impacto actual:
- [Funcionalidad afectada]
- [Funcionalidad no afectada]

Estamos trabajando para resolverlo. Tiempo estimado: [X horas].

Si tienes una consulta programada, [instrucciones].

Gracias por tu paciencia.

---
Actualizado: [Timestamp]
https://status.doctormx.com
```

**Redes Sociales:**
```plaintext
⚠️ Actualización de servicio: Experimentamos dificultades con [función].
Las videollamadas activas continúan funcionando normal.
Trabajando en resolverlo. Próxima actualización: 30 min.
https://status.doctormx.com
```

---

## 6. Post-Incident Review

### 6.1 Proceso de Post-Mortem

**Timeline:**
- **24-48 horas después:** Reunión inicial (30 min)
- **1 semana después:** Post-mortem completo (1-2 horas)
- **2 semanas después:** Seguimiento de acciones (30 min)

**Participantes:**
- Incident Response Team
- Stakeholders afectados
- Invitados especiales (si necesario)

**Agenda de Reunión:**
1. **Timeline del incidente** (15 min)
   - ¿Cuándo se detectó?
   - ¿Cuándo se contuvo?
   - ¿Cuándo se resolvió?

2. **Causa raíz** (20 min)
   - ¿Por qué pasó?
   - ¿5 Whys analysis*
   - Contribuyentes

3. **Respuesta** (15 min)
   - ¿Qué funcionó bien?
   - ¿Qué no funcionó?
   - ¿Qué mejoraría?

4. **Acciones preventivas** (20 min)
   - Acciones inmediatas (24-48 horas)
   - Acciones de mediano plazo (1-4 semanas)
   - Acciones de largo plazo (1-3 meses)

5. **Documentación** (10 min)
   - Asignar dueños
   - Definir deadlines
   - Agregar a roadmap

### 6.2 Plantilla de Post-Mortem

```markdown
# Post-Mortem: [Título del Incidente]
**ID:** INC-[YYYYMMDD]-[Número]
**Fecha:** [YYYY-MM-DD]
**Severidad:** S1/S2/S3/S4
**Duración:** [X horas]

## Resumen Ejecutivo
[2-3 párrafos describiendo el incidente de forma concisa]

## Timeline
| Hora | Evento | Responsable |
|------|--------|-------------|
| 14:00 | Incidente detectado vía alerta | @ops |
| 14:05 | Contención iniciada | @tech-lead |
| 14:30 | Servicios restaurados | @ops |
| 16:00 | Incidente cerrado | @incident-commander |

## Impacto
- Usuarios afectados: ~[X]
- Ingresos perdidos: $[X] MXN
- SLAs incumplidos: [Ninguno / Sí, cuáles]

## Causa Raíz
### 5 Whys Analysis
1. ¿Por qué pasó? [Respuesta]
2. ¿Por qué [causa anterior]? [Respuesta]
3. ¿Por qué [causa anterior]? [Respuesta]
4. ¿Por qué [causa anterior]? [Respuesta]
5. ¿Por qué [causa anterior]? [Respuesta]

### Causa Fundamental
[Descripción clara de la causa raíz]

## Lecciones Aprendidas
### Qué Funcionó Bien
- [Listar cosas positivas]

### Qué No Funcionó
- [Listar cosas a mejorar]

### Oportunidades de Mejora
- [Listar mejoras identificadas]

## Acciones Correctivas
| Acción | Dueño | Prioridad | Deadline | Estado |
|--------|-------|-----------|----------|--------|
| [Acción 1] | @persona | P1/P2/P3 | [Fecha] | Pendiente |
| [Acción 2] | @persona | P1/P2/P3 | [Fecha] | Pendiente |

## Métricas
- MTTR (Mean Time To Resolve): [X] horas
- MTTD (Mean Time To Detect): [X] minutos
- MTBF (Mean Time Between Failures): [X] días

## Aprobaciones
- Incident Commander: @nombre - [Fecha]
- Technical Lead: @nombre - [Fecha]
- CTO: @nombre - [Fecha]
```

---

## 7. Herramientas y Automatización

### 7.1 Stack de Respuesta a Incidentes

**Monitoreo y Alertas:**
- **Uptime Robot:** Disponibilidad de sitios
- **Sentry:** Errores de aplicación
- **Supabase Dashboard:** Métricas de DB
- **Stripe Console:** Errores de pagos
- **Twilio Console:** Errores de comunicaciones

**Comunicación:**
- **Slack:** Coordinación de equipo
- **WhatsApp:** Emergencias críticas
- **Email:** Comunicación con usuarios
- **Status Page:** Actualizaciones públicas

**Documentación:**
- **Notion:** Runbooks y playbooks
- **GitHub:** Post-mortems
- **Google Docs:** Comunicados

**Automatización:**
```yaml
# .github/workflows/incident-response.yml
name: Incident Response

on:
  repository_dispatch:
    types: [incident_declared]

jobs:
  create_channels:
    runs-on: ubuntu-latest
    steps:
      - name: Create Slack channel
        run: |
          curl -X POST "https://slack.com/api/conversations.create" \
            -d "name=incident-${{ github.event.client_payload.id }}" \
            -d "token=${{ secrets.SLACK_TOKEN }}"

      - name: Create incident issue
        run: |
          gh issue create \
            --title "S${{ github.event.client_payload.severity }} Incidente" \
            --body "Incidente declarado: ${{ github.event.client_payload.description }}" \
            --label "incident,S${{ github.event.client_payload.severity }}"
```

### 7.2 Integraciones

**Slack Bot Commands:**
```plaintext
/incident declare S1 "Sitio caído"
/incident update "Investigando, será 30 min"
/incident resolve "Servicios restaurados"
/incident postmortem
```

**Alert Routing:**
```typescript
// configs/alerts.ts
const alertRouting = {
  S1: ['#emergency', '+525512345678', 'executives@doctormx.com'],
  S2: ['#incidents', 'tech-lead@doctormx.com'],
  S3: ['#incidents'],
  S4: ['#bugs']
}
```

---

## 8. Entrenamiento y Simulacros

### 8.1 Programa de Entrenamiento

**Nuevo Personal (Onboarding):**
- [ ] Leer este playbook completo
- [ ] Participar en 1 incidente real como shadow
- [ ] Completar simulacro de 1 hora
- [ ] Certificación de respuesta a incidentes

**Entrenamiento Continuo:**
- **Trimestral:** Revisión de playbooks
- **Semestral:** Simulacro de desastre (Game Day)
- **Anual:** Certificación de todo el equipo

### 8.2 Simulacros (Game Days)

**Frecuencia:** Semestral
**Duración:** 2-4 horas
**Formato:**
- Escenario preparado (o sorpresa)
- Equipo completo participa
- Sin impacto en producción (sandbox)

**Ejemplos de Escenarios:**
1. "Supabase está caído y no responde"
2. "Exposición masiva de expedientes clínicos"
3. "Sistema de pagos rechaza todas las transacciones"
4. "Ransomware detectado en servidor"

**Evaluación:**
- Tiempo de detección
- Tiempo de respuesta
- Calidad de comunicación
- Efectividad de resolución
- Documentación posterior

---

## 9. Métricas y KPIs

### 9.1 Métricas de Incidentes

**MTTD (Mean Time To Detect):**
- Objetivo: < 5 minutos
- Actual: [Métrica]

**MTTR (Mean Time To Resolve):**
- S1: Objetivo < 1 hora
- S2: Objetivo < 4 horas
- S3: Objetivo < 24 horas
- S4: Objetivo < 7 días

**MTBF (Mean Time Between Failures):**
- Objetivo: > 90 días
- Actual: [Métrica]

**SLA Compliance:**
- Objetivo: 99.9% uptime
- Actual: [Métrica]

### 9.2 Métricas de Proceso

**Incidentes por Mes:**
- Total: [N]
- Por severidad: S1: [N], S2: [N], S3: [N], S4: [N]

**Post-Mortems Completados:**
- Objetivo: 100% de incidentes S1-S2
- Actual: [X]%

**Acciones Preventivas Implementadas:**
- Objetivo: 100% de acciones críticas
- Actual: [X]%

---

## 10. Recursos y Contactos

### 10.1 Equipo de Respuesta

| Rol | Nombre | Teléfono | Slack | Email |
|-----|--------|----------|-------|-------|
| Incident Commander (CTO) | Miguel García | +52 55 1111 2222 | @miguel | miguel@doctormx.com |
| Technical Lead | Ana Martínez | +52 55 8765 4321 | @ana | ana@doctormx.com |
| Ops Engineer | Carlos Rodríguez | +52 55 1234 5678 | @carlos | carlos@doctormx.com |
| Security Lead | Laura López | +52 55 5555 6666 | @laura | laura@doctormx.com |
| Customer Support | Pedro Pérez | +52 55 7777 8888 | @pedro | pedro@doctormx.com |
| Legal | María González | +52 55 9999 0000 | @maria | maria@doctormx.com |

### 10.2 Soporte de Proveedores

**Supabase:**
- Email: support@supabase.io
- Slack: #supabase-support
- Status: https://status.supabase.com
- Priority Support: Pro Plan

**Vercel:**
- Email: support@vercel.com
- Slack: #vercel-support
- Status: https://status.vercel.com

**Stripe:**
- Email: support@stripe.com
- Phone: +1 877 866 8963
- Status: https://status.stripe.com

**Twilio:**
- Email: help@twilio.com
- Phone: +1 888 296 3733
- Status: https://status.twilio.com

### 10.3 Autoridades (México)

**Para Incidentes de Datos:**
- **INAI (Protección de Datos):** 01 800 825 2684
- **Cofepris (Salud):** 01 800 033 5050
- **UNAM-CERT (Ciberseguridad):** cert@unam.mx

---

## 11. Documentación Relacionada

- [BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md) - Estrategia de respaldos
- [BUSINESS_CONTINUITY.md](./BUSINESS_CONTINUITY.md) - Plan de continuidad
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía de despliegue
- [SECURITY_ASSESSMENT.md](../SECURITY_ASSESSMENT_2026-02-09.md) - Evaluación de seguridad

---

## 12. Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-02-10 | Versión inicial - FLOW-1.2 | Claude Opus |
| - | - | - |

---

## 13. Anexos

### Anexo A: Lista de Verificación de Incidentes

**Al Declarar Incidente:**
- [ ] Severidad asignada
- [ ] Canal de Slack creado
- [ ] Status page actualizada
- [ ] Equipo notificado
- [ ] Comandante asignado

**Durante Incidente:**
- [ ] Actualizaciones enviadas (cada X min)
- [ ] Acciones documentadas en timeline
- [ ] Impacto evaluado y comunicado
- [ ] Proveedores contactados (si necesario)

**Al Cerrar Incidente:**
- [ ] Servicios verificados
- [ ] Status page actualizada
- [ ] Post-mortem agendado
- [ ] Usuarios notificados
- [ ] Incidente archivado

### Anexo B: Plantillas de Comunicación Rápida

**Slack - Declarar Incidente:**
```
@emergency 🔴 S1 Incidente declarado: [Título]
Comandante: @nombre
Status page: https://status.doctormx.com/incident/[ID]
Próxima actualización: 15 min
```

**Email - Usuarios Críticos:**
```
Asunto: ⚠️ Incidente en Doctor.mx - [Título]

Hola [Nombre],

Estamos experimentando [problema].

Impacto: [quién afectado]

Tiempo estimado de resolución: [X] horas

Emergencias: llamar al 55-1234-5678

Gracias por tu paciencia.
```

---

**Este plan debe ser revisado trimestralmente o después de cualquier incidente mayor.**

**Todos los miembros del equipo deben familiarizarse con los playbooks relevantes a su rol.**
