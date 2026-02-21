# Plan de Continuidad de Negocio - Doctor.mx

> **Última actualización:** 2026-02-10
> **Versión:** 1.0
> **Contexto:** Plataforma de teleconsultas médicas - México

---

## 1. Objetivos del Plan

### 1.1 Objetivos Principales

**Continuidad Operativa:**
- Mantener servicios médicos operativos durante incidentes
- Minimizar impacto en pacientes y doctores
- Preservar integridad de datos clínicos

**Metas de Recuperación:**
- **RTO (Tiempo objetivo de recuperación):** < 4 horas
- **RPO (Punto objetivo de recuperación):** < 1 hora
- **MTD (Tiempo máximo de tolerancia):** 24 horas

---

## 2. Análisis de Impacto en Negocio (BIA)

### 2.1 Servicios Críticos

| Servicio | Prioridad | Impacto si falla | Tiempo máximo offline |
|----------|-----------|------------------|----------------------|
| Videollamadas activas | 1 | Pacientes sin atención inmediata | 15 minutos |
| Agendamiento de citas | 1 | Pérdida de ingresos | 1 hora |
| Acceso a expedientes | 1 | Riesgo médico legal | 2 horas |
| Pagos | 2 | Ingresos diferidos | 4 horas |
| Notificaciones | 2 | Pacientes no informados | 8 horas |
| Analytics | 3 | Decisiones sin datos | 48 horas |

### 2.2 Análisis de Dependencias

```
Servicios Críticos:
├── Videollamadas
│   ├── Supabase (datos)
│   ├── Twilio (video)
│   └── Next.js (frontend)
├── Agendamiento
│   ├── Supabase (datos)
│   ├── Stripe (pagos)
│   └── WhatsApp (notificaciones)
└── Expedientes
    ├── Supabase (datos)
    ├── Storage (archivos)
    └── Firma digital (validación)
```

---

## 3. Procedimientos de Acceso de Emergencia

### 3.1 Acceso con Sistema Principal Caído

**Escenario:** Supabase no responde

**Pasos Inmediatos:**
1. **Activar modo mantenimiento**
   ```bash
   # Vercel CLI
   vercel deploy --prebuilt \
     --build-env NEXT_PUBLIC_MAINTENANCE_MODE=true
   ```

2. **Acceso a backups de emergencia**
   - Conectar a VPN de emergencia
   - Acceder a servidor de respaldo (AWS EC2)
   - Restaurar backup más reciente (ver BACKUP_STRATEGY.md)

3. **Sistema limitado disponible**
   ```typescript
   // Modo emergencia - solo lectura
   const emergencyMode = {
     appointments: true,        // Ver citas
     consultations: false,      // No nuevas consultas
     payments: false,           // No procesar pagos
     videoCalls: false,         // No videollamadas
     messaging: false           // No mensajería
   }
   ```

### 3.2 Credenciales de Emergencia

**Ubicación Segura:**
- **Físico:** Caja fuerte en oficinas (Calle Roma Norte #123)
- **Digital:** Password Manager (1Password) - "Emergency Access"
- **Copia:** Gerente de Operaciones (custodio designado)

**Contenido:**
- Credenciales de Supabase (root access)
- Llaves de API de emergencia (Twilio, Stripe)
- Acceso a AWS ( backups)
- Llaves GPG para desencriptar datos sensibles

**Procedimiento de Acceso:**
1. **Solo en emergencia declarada** (por CTO o CEO)
2. **Registrar acceso** en log de auditoría
3. **Notificar al equipo** inmediatamente
4. **Rotar credenciales** después del incidente

### 3.3 Acceso Remoto de Emergencia

**Herramientas:**
- **SSH Bastion:** `ssh.emergency.doctormx.com`
- **VPN:** AWS Client VPN (MFA autenticado)
- **Terminal:** AWS Systems Manager Session Manager

**Instrucciones:**
```bash
# 1. Conectar a VPN
aws-vpn-client --profile emergency

# 2. Acceder a bastión
ssh -i emergency-key.pem \
  emergency@ssh.emergency.doctormx.com

# 3. Acceder a servicios
ssh doctor-mx-db.internal
```

---

## 4. Documentación de Failover

### 4.1 Escenario: Falla de Supabase

**Síntomas:**
- Timeouts en todas las peticiones
- Error 502/503 en API
- Dashboard de Supabase inaccesible

**Procedimiento de Failover:**

**FASE 1: Mitigación Inmediata (0-15 min)**
1. **Declarar incidente** en #emergency
2. **Activar página de mantenimiento:**
   ```html
   <!-- maintenance.html -->
   <h1>Doctor.mx - Mantenimiento Temporal</h1>
   <p>Estamos trabajando para restablecer servicios.</p>
   <p>Tiempo estimado: 2-4 horas</p>
   <p>Emergencias: llamar al 55-1234-5678</p>
   ```

3. **Verificar estado en:**
   - https://status.supabase.com
   - https://status.doctormx.com
   - Twitter @supabase

**FASE 2: Evaluación (15-30 min)**
1. **Determinar tipo de falla:**
   - Regional (solo nuestro proyecto)
   - Global (toda la plataforma)
   - Red (conectividad)

2. **Contactar soporte:**
   - Slack: #supabase-support
   - Email: support@supabase.io
   - Prioridad: P1 - Critical

**FASE 3: Ejecutar Failover (30 min - 4 horas)**

**Opción A: Recuperación en misma región**
```bash
# 1. Verificar backups disponibles
supabase db list \
  --project-ref xxx

# 2. Crear proyecto temporal
supabase projects create \
  --name doctor-mx-emergency \
  --region us-east-1

# 3. Restaurar backup
supabase db restore \
  --project-ref yyy \
  --backup-id 20260210_030000

# 4. Actualizar DNS
# DNS > doctor-mx.supabase.co > yyy.supabase.co
```

**Opción B: Migración a región alternativa**
```bash
# 1. Crear proyecto en us-west-1
supabase projects create \
  --name doctor-mx-backup \
  --region us-west-1

# 2. Migrar dump
pg_dump -Fc postgres://... | \
  pg_restore -d postgres://...

# 3. Actualizar variables
NEXT_PUBLIC_SUPABASE_URL=https://yyy.supabase.co

# 4. Deploy de emergencia
vercel deploy --prod
```

**FASE 4: Verificación (4-6 horas)**
- [ ] Base de datos accesible
- [ ] API responde correctamente
- [ ] Videollamadas funcionan
- [ ] Pagos se procesan
- [ ] No hay pérdida de datos

### 4.2 Escenario: Falla de Vercel/Frontend

**Procedimiento:**
1. **Activar hosting de respaldo:**
   ```bash
   # Deploy a Netlify (backup)
   netlify deploy --prod --dir=.next
   ```

2. **Actualizar DNS:**
   ```
   CNAME www.doctormx.com -> emergency-doctormx.netlify.app
   ```

3. **Monitorear:**
   - Logs en Netlify Dashboard
   - Performance en Pingdom

### 4.3 Escenario: Falla de Stripe

**Impacto:** No se pueden procesar pagos nuevos

**Mitigación:**
1. **Activar modo "gratuito temporal":**
   ```typescript
   const emergencyConfig = {
     allowBookings: true,
     requirePayment: false,      // Suspender requisito
     collectPaymentLater: true   // Pagar después
   }
   ```

2. **Comunicación a pacientes:**
   - Banner en sitio web
   - Email masivo
   - WhatsApp broadcast

3. **Reactivación:**
   - Procesar pagos pendientes
   - Notificar a pacientes afectados

---

## 5. Plan de Comunicación

### 5.1 Comunicación Durante Outages

**Canales de Comunicación:**

| Audiencia | Canal | Actualización | Responsable |
|-----------|-------|---------------|-------------|
| Pacientes | Email + SMS | Cada 30 minutos | Customer Success |
| Doctores | Slack + WhatsApp | Cada 15 minutos | Ops Manager |
| Inversores | Email | Cada hora | CEO |
| Público | Status page + Twitter | Cada 30 minutos | Marketing |

**Plantillas de Comunicación:**

**Pacientes - Email:**
```plaintext
Asunto: Actualización - Doctor.mx temporalmente fuera de servicio

Estimado(a) [Nombre],

Experimentamos interrupciones temporales en nuestros servicios.
Nuestro equipo está trabajando para restablecer la normalidad.

Impacto actual:
- No se pueden agendar nuevas citas
- Las videollamadas activas continúan funcionando

Tiempo estimado de resolución: [X] horas

Si tienes una consulta programada en las próximas 2 horas,
por favor comunícate al 55-1234-5678.

Lamentamos los inconvenientes y agradecemos tu paciencia.

Equipo Doctor.mx
```

**Status Page - Twitter:**
```plaintext
⚠️ Incidente en progreso - Actualización #1

Detectamos interrupciones en el servicio de agendamiento.
Las videollamadas activas no están afectadas.

Próxima actualización: 30 minutos

https://status.doctormx.com
```

### 5.2 Comunicación Post-Incidente

**Memo Interno (24-48 horas después):**
```plaintext
PARA: Todo el equipo
DE: [CTO/CEO]
ASUNTO: Recapitulación del Incidente [Fecha]

RESUMEN EJECUTIVO:
- Duración: [X] horas
- Causa raíz: [Descripción]
- Impacto: [N] usuarios afectados
- Acciones inmediatas: [Lista]

LECCIONES APRENDIDAS:
1. [Lección 1]
2. [Lección 2]

ACCIONES PREVENTIVAS:
1. [Acción 1] - Responsable: [Nombre] - Fecha: [Fecha]
2. [Acción 2] - Responsable: [Nombre] - Fecha: [Fecha]

REUNIÓN DE POST-MORTEM: [Fecha/Hora]
```

**Comunicación a Pacientes (si incidente > 4 horas):**
```plaintext
Estimada comunidad,

El [fecha] experimentamos una interrupción en nuestros servicios
que duró [X] horas. Queremos ser transparentes sobre lo ocurrido:

Qué pasó:
[Explicación simple y honesta]

Qué estamos haciendo para prevenirlo:
[Mejoras implementadas]

Compensación:
[Ofrecer crédito/extensions si aplica]

Agradecemos su comprensión y confianza.
```

---

## 6. Roles y Responsabilidades

### 6.1 Equipo de Respuesta a Incidentes (IRT)

**Incident Commander (CTO):**
- Autoridad final durante incidentes
- Coordinación de todos los equipos
- Comunicación con ejecutivos
- Decisión de failover

**Technical Lead (Backend Lead):**
- Diagnóstico técnico
- Ejecución de recuperación
- Coordinación con proveedores
- Documentación técnica

**Communications Lead (Marketing Manager):**
- Redacción de comunicados
- Gestión de redes sociales
- Comunicación con usuarios
- Actualización de status page

**Customer Support Lead:**
- Atención a usuarios afectados
- Priorización de casos críticos
- Reasignación de citas si es necesario
- Recopilación de feedback

**Ops Engineer:**
- Ejecución de scripts de recuperación
- Monitoreo de métricas
- Verificación de servicios
- Documentación de logs

### 6.2 Matriz de Comunicación

```
Incidente Detectado
        ↓
Ops Engineer → Notifica a #emergency
        ↓
Incident Commander → Evalúa severidad
        ↓
┌─────────────────┬─────────────────┐
│ Severidad Alta  │  Severidad Baja │
│ (P1/P2)         │  (P3/P4)        │
├─────────────────┼─────────────────┤
│ Convocar IRT    │  Ops resuelve   │
│ completo        │  directamente   │
│                 │                 │
│ Comunicar a     │  Documentar     │
│ ejecutivos      │  después        │
└─────────────────┴─────────────────┘
```

### 6.3 Protocolos de Escalación

**Nivel 1: Ops Engineer**
- Puede resolver: Deploys fallidos, errores de configuración
- Tiempo de respuesta: 15 minutos
- Escala si: > 30 minutos sin resolución

**Nivel 2: Technical Lead + Ops Engineer**
- Puede resolver: Caídas de servicios, bugs críticos
- Tiempo de respuesta: 10 minutos
- Escala si: Impacto > 50% usuarios

**Nivel 3: Incident Response Team (IRT) completo**
- Puede resolver: Cualquier incidente
- Tiempo de respuesta: 5 minutos
- Escala si: Riesgo de pérdida de datos o seguridad

**Nivel 4: Ejecutivos + Legal (P1 Critical)**
- Puede autorizar: Failover total, gasto de emergencia
- Tiempo de respuesta: Inmediato
- Criterios: Pérdida de datos, incidente de seguridad, impacto financiero > $100k MXN

---

## 7. Sitios Alternativos de Operación

### 7.1 Infraestructura de Respaldo

**En caso de pérdida completa de infraestructura primaria:**

**Servidor de Emergencia (AWS):**
- Instancia: EC2 t3.xlarge
- Región: us-east-1
- AMI: Ubuntu 22.04 LTS
- Almacenamiento: EBS gp3 100GB
- Estado: Apagado (costo optimizado)

**Activación:**
```bash
# 1. Iniciar instancia
aws ec2 start-instances \
  --instance-ids i-xxxxxxxxx

# 2. Conectar via SSM
aws ssm start-session \
  --target i-xxxxxxxxx

# 3. Instalar dependencias
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs git

# 4. Clonar repositorio
git clone https://github.com/doctormx/app.git
cd app
npm install

# 5. Configurar variables
cp .env.emergency .env.local

# 6. Iniciar servicio
pm2 start npm --name "doctor-mx" -- start

# 7. Configurar nginx (reverse proxy)
# 8. Actualizar DNS a IP elástica
```

### 7.2 Proveedores Alternativos

**Si Supabase está completamente caído:**

**Opción 1: Neon (PostgreSQL Serverless)**
```bash
# Crear base de datos de emergencia
psql postgres://xxx.neon.tech/neondb

# Restaurar desde dump
psql -f doctor_mx_backup.dump \
  postgres://xxx.neon.tech/neondb

# Actualizar variables
DATABASE_URL=postgres://xxx.neon.tech/neondb
```

**Opción 2: Railway (PostgreSQL)**
```bash
# Via CLI
railway login
railway create --database postgres
railway variables set DATABASE_URL=...

# Obtener connection string
railway variables
```

**Opción 3: Google Cloud SQL**
```bash
# Crear instancia
gcloud sql instances create doctor-mx-emergency \
  --tier=db-f1-micro \
  --region=us-central1

# Restaurar backup
gcloud sql backups restore \
  --instance=doctor-mx-emergency \
  --backup-id=xxx
```

---

## 8. Plan de Recuperación de Desastres

### 8.1 Escenarios de Desastre

**Escenario 1: Ransomware**
- Aislamiento inmediato de redes
- Activación de backups offline
- Negociación solo si es crítico
- Recuperación desde backups limpios

**Escenario 2: Desastre Natural (CDMX)**
- Equipos trabajando remotamente
- Failover a nube (ya está en nube)
- Comunicación vía Slack/WhatsApp
- Prioridad: seguridad de pacientes

**Escenario 3: Incidente de Seguridad**
- Revocación de credenciales comprometidas
- Rotación de llaves API
- Auditoría forense
- Notificación a autoridades (si aplica)

### 8.2 Secuencia de Recuperación

**Hora 0-1: Respuesta Inmediata**
1. Aislar sistemas afectados
2. Activar canales de emergencia
3. Evaluar extensión del daño
4. Notificar al equipo IRT

**Hora 1-4: Estabilización**
1. Determinar causa raíz
2. Plan de recuperación
3. Iniciar restore de backups
4. Comunicar progreso

**Hora 4-12: Recuperación**
1. Restaurar servicios críticos
2. Verificar integridad de datos
3. Reactuar servicios gradualmente
4. Monitorear métricas

**Hora 12-24: Normalización**
1. Restaurar todos los servicios
2. Análisis post-incidente
3. Implementar mejoras
4. Cierre del incidente

---

## 9. Pruebas y Mantenimiento del Plan

### 9.1 Simulacros de Desastre

**Frecuencia:** Semestral
**Participantes:** Equipo completo
**Duración:** 2-4 horas

**Escenarios Probados:**
- Simulación de caída de Supabase
- Recuperación desde backups
- Comunicación de crisis
- Activación de infraestructura de emergencia

**Evaluación:**
- Tiempo de detección: < 5 min
- Tiempo de respuesta: < 15 min
- Tiempo de recuperación: < 4 horas
- Comunicación efectiva: Sí/No

### 9.2 Revisión del Plan

**Trimestral:**
- Actualizar contactos
- Verificar accesos de emergencia
- Revisar procedimientos con proveedores
- Actualizar documentación

**Anual:**
- Revisión completa del BIA
- Actualización de RPO/RTO
- Renegociación de SLAs
- Auditoría externa del plan

---

## 10. Métricas y KPIs

### 10.1 Métricas de Continuidad

**Disponibilidad:**
- Objetivo: 99.9% (43.8 min/mes)
- Actual: [Métrica]

**Tiempo de Recuperación:**
- Objetivo: < 4 horas
- Promedio últimos 12 meses: [Métrica]

**Pérdida de Datos:**
- Objetivo: 0 incidentes con pérdida
- Actual: [Métrica]

**Tiempo de Detección:**
- Objetivo: < 5 minutos
- Promedio: [Métrica]

### 10.2 Métricas de Comunicación

**Satisfacción de Usuarios:**
- Encuestas post-incidente
- Objetivo: > 4/5

**Transparencia:**
- Actualizaciones enviadas: 100%
- Tiempo entre actualizaciones: < 30 min

---

## 11. Documentación Relacionada

- [BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md) - Estrategia de respaldos
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) - Respuesta a incidentes
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía de despliegue

---

## 12. Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2026-02-10 | Versión inicial - FLOW-1.2 | Claude Opus |
| - | - | - |

---

**Este plan debe ser probado semestralmente y revisado trimestralmente.**

**En caso de emergencia real, seguir los procedimientos documentados y documentar cualquier desviación para mejora continua.**
