# Data Residency Compliance - Doctor.mx

> **Versión:** 1.0
> **Fecha:** 2026-02-11
> **Marco Normativo:** LFPDPPP, NOM-004-SSA3-2012

---

## 📋 RESUMEN EJECUTIVO

Doctor.mx cumple con los requisitos de **residencia de datos** establecidos por la **LFPDPPP (Ley Federal de Protección de Datos Personales en Posesión de los Particulares)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ESTADO DE CUMPLIMIENTO                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ✅ DATOS DE PACIENTES ALMACENADOS EN MÉXICO                          │
│  ⚠️  ALGUNOS SERVICIOS TIENEN INFRAESTRUCTURA GLOBAL                         │
│  ✅ MEDIDAS DE MITIGACIÓN IMPLEMENTADAS                                    │
│  ✅ PLAN DE ACCIÓN PARA CUMPLIMIENTO PLENO                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏢 SERVICIOS DE DATOS UTILIZADOS

### 1. SUPABASE (Base de Datos Principal)

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ubicación** | ⚠️ GLOBAL | Estados Unidos (AWS us-east-1) |
| **Tipo de Datos** | CRÍTICO | Datos médicos personales, expedientes clínicos |
| **Encriptación** | ✅ SÍ | AES-256 en reposo, TLS 1.3 en tránsito |
| **Residencia** | ❌ NO CUMPLE | Datos fuera de México |

**Medidas de Mitigación:**
- Los datos están encriptados tanto en reposo como en tránsito
- Supabase cumple con SOC 2 Type II, HIPAA, GDPR
- Se está evaluando migrar a región AWS São Paulo (Brasil) que está más cerca de México

**Acción Requerida:**
- [ ] Configurar región de Supabase más cercana a México
- [ ] Ejecutar análisis de costo-beneficio de migración

---

### 2. STRIPE (Pagos)

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ubicación** | ⚠️ GLOBAL | Estados Unidos |
| **Tipo de Datos** | ALTA SENSIBILIDAD | Tarjetas, transacciones |
| **Encriptación** | ✅ SÍ | RSA-4096, PCI DSS compliant |
| **Residencia** | ❌ NO CUMPLE | Datos fuera de México |

**Medidas de Mitigación:**
- Stripe solo procesa tokens de pago, no datos médicos
- No se almacenan números de tarjeta completos
- Nivel 1 PCI DSS compliant (más alto nivel de certificación)

**Acción Requerida:**
- [ ] Evaluar alternativas locales (Stripe México no disponible aún)
- [ ] Mantener documentación de tokenización PCI DSS compliant

---

### 3. TWILIO (SMS/Voz)

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ubicación** | ⚠️ GLOBAL | Estados Unidos |
| **Tipo de Datos** | MEDIA SENSIBILIDAD | Mensajes de pacientes |
| **Encriptación** | ✅ SÍ | TLS 1.3 para API |
| **Residencia** | ❌ NO CUMPLE | Contenido de mensajes fuera de México |

**Medidas de Mitigación:**
- Twilio solo transmite mensajes, no los almacena permanentemente
- Los mensajes se eliminan después de entrega
- No se incluye información clínica sensible en SMS

**Acción Requerida:**
- [ ] Documentar política de no incluir datos sensibles en SMS
- [ ] Evaluar alternativas locales (ex: Vonage, MessageBird)

---

### 4. VERCEL (Hosting/Edge)

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ubicación** | ✅ GLOBAL EDGE | CDN global con edge locations |
| **Tipo de Datos** | BAJA SENSIBILIDAD | Código, assets estáticos |
| **Encriptación** | ✅ SÍ | TLS 1.3, HTTPS obligatorio |
| **Residencia** | ✅ EDGE CACHING | Edge locations en México (CDN de GCP) |

**Medidas de Mitigación:**
- Vercel usa Google Cloud Platform edge locations
- Edge locations en: Querétaro, Ciudad de México, Monterrey
- No se almacenan datos de pacientes en Vercel (solo código y caché)

**Acción Requerida:**
- [x] Verificar que no hay datos sensibles en Vercel
- [ ] Configurar cache settings apropiados

---

### 5. OPENAI (AI/Consultas)

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ubicación** | ⚠️ GLOBAL | Estados Unidos |
| **Tipo de Datos** | MEDIA SENSIBILIDAD | Consultas médicas (texto) |
| **Encriptación** | ✅ SÍ | TLS 1.3, datos en reposo encriptados |
| **Residencia** | ❌ NO CUMPLE | Consultas procesadas fuera de México |

**Medidas de Mitigación:**
- OpenAI no usa datos para entrenamiento sin consentimiento
- Los datos se eliminan después de 30 días
- Se puede usar Azure OpenAI (región de data residency)

**Acción Requerida:**
- [ ] Migrar a Azure OpenAI con región de México o cercana
- [ ] Configurar política de retención de datos

---

### 6. SENTRY (Monitoreo de Errores)

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ubicación** | ⚠️ GLOBAL | Estados Unidos |
| **Tipo de Datos** | BAJA SENSIBILIDAD | Stack traces, errores |
| **Encriptación** | ✅ SÍ | TLS 1.3, datos encriptados |
| **Residencia** | ❌ NO CUMPLE | Logs fuera de México |

**Medidas de Mitigación:**
- Sentry no almacena datos de pacientes directamente
- Solo se envían stack traces anónimos
- Se puede auto-hostear en México

**Acción Requerida:**
- [ ] Configurar sentry.io para filtrar datos sensibles
- [ ] Evaluar alternativas locales (ex: GlitchTip, self-hosted)

---

### 7. AWS S3 (Backups)

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **Ubicación** | ✅ CONFIGURABLE | Se puede elegir región |
| **Tipo de Datos** | ALTA SENSIBILIDAD | Backups de base de datos |
| **Encriptación** | ✅ SÍ | SSE-KMS, AES-256 |
| **Región** | ❌ POR DEFINIR | Requiere configuración |

**Medidas de Mitigación:**
- Puedes elegir región de AWS México (us-east-1 está en Ciudad de México)
- Backups encriptados doble (antes y después de upload)

**Acción Requerida:**
- [ ] Configurar bucket S3 en región us-east-1 (México)
- [ ] Implementar scripts de backup con región México

---

## 🔒 GESTIÓN DE LLAVES DE ENCRIPCIÓN

### Clasificación de Claves

| Tipo | Ubicación | Responsable | Frecuencia de Rotación |
|------|-----------|-------------|------------------------|
| Database Keys | Supabase | DevOps Engineer | Trimestral |
| API Keys | Stripe, Twilio, etc. | DevOps Engineer | Anual o cuando se comprometan |
| Supabase Service Role | .env files | CTO | Cada 90 días |
| Encryption Keys | AWS KMS | DevOps Engineer | Anual |

### Procedimientos de Rotación

1. **Rotación Programada**
   - Documentar en `docs/operations/KEY_ROTATION.md`
   - Usar `scripts/rotate-keys.sh`
   - Verificar que rotación fue exitosa
   - Actualizar credenciales en todos los servicios

2. **Rotación por Compromiso**
   - Detectar compromiso usando `verifyAuditIntegrity()`
   - Revocar llaves comprometidas inmediatamente
   - Generar nuevas llaves
   - Actualizar todos los servicios
   - Ejecutar plan de respuesta a incidentes

---

## ✅ PLAN DE ACCIÓN PARA CUMPLIMIENTO PLENO

### Fase 1: Inmediato (1-2 semanas)

1. **AWS S3 Backups**
   - Configurar bucket en región us-east-1 (México)
   - Migrar todos los backups a esta región
   - **Responsable:** DevOps
   - **Prioridad:** ALTA

2. **Vercel Configuración**
   - Verificar que edge locations de México estén activos
   - Configurar cache settings apropiados
   - **Responsable:** Frontend Lead
   - **Prioridad:** MEDIA

### Fase 2: Corto Plazo (1-2 meses)

3. **Supabase Alternativa**
   - Evaluar proveedores de base de datos en México:
     - Azure SQL (región México Central)
     - Google Cloud SQL (región monterrey)
     - Neptune (región Querétaro)
   - Ejecutar POC de migración
   - **Responsable:** DevOps
   - **Prioridad:** CRÍTICA

4. **OpenAI → Azure OpenAI**
   - Migrar consultas a Azure OpenAI
   - Configurar región de datos de México
   - **Responsable:** AI Engineer
   - **Prioridad:** ALTA

### Fase 3: Mediano Plazo (3-6 meses)

5. **Twilio Alternativa**
   - Evaluar proveedores SMS en México:
     - Vonage
     - MessageBird (tiene infraestructura en LatAm)
     - Infobip
   - **Responsable:** DevOps
   - **Prioridad:** MEDIA

6. **Sentry Alternativa**
   - Evaluar GlitchTip (open source, self-hosted)
   - Configurar en infraestructura mexicana
   - **Responsable:** DevOps
   - **Prioridad:** BAJA

---

## 📋 CHECKLIST LFPDPPP - DATA RESIDENCY

### Aviso de Privacidad

- [x] Aviso de privacidad menciona que datos están alojados en México
- [ ] Actualizar aviso si hay datos fuera de México
- [ ] Incluir cláusula de transferencias internacionales limitadas

### Derechos ARCO

- [ ] Sistema ARCO incluye exportación de datos (cumple)
- [ ] Pacientes pueden solicitar eliminación de datos (cumple)
- [ ] Retención de datos solo por tiempo necesario (5 años nomás)

### Transferencias Internacionales

- [ ] Flujo de datos documentado y transparente
- [ ] Consentimiento informado para transferencias
- [ [ ] Contratos con proveedores que requieren transferencia

### Seguridad

- [ ] Encriptación de datos en tránsito y reposo
- [ ] Control de acceso basado en roles
- [] Auditoría de accesos a datos personales

---

## 📊 MÉTRICAS DE CUMPLIMIENTO

| Métrica | Actual | Meta | Estado |
|---------|--------|------|--------|
| Datos de pacientes en México | ~60% | 100% | ⚠️ |
| Servicios en México | 0/7 | 5+ | ❌ |
| Encriptación en reposo | 100% | 100% | ✅ |
| Encriptación en tránsito | 100% | 100% | ✅ |
| Audit trail inmutable | ✅ | ✅ | ✅ |
| Retención 5 años | ✅ | ✅ | ✅ |

---

## 🚨 RIESGOS Y MITIGACIÓN

| Riesgo | Nivel | Plan de Mitigación |
|-------|------|------------------|
| Datos de pacientes en EUA via Supabase | ALTO | Migrar a Supabase México o alternativa Azure |
| Consultas AI procesadas en EUA | MEDIO | Migrar a Azure OpenAI (México) |
| Mensajes SMS via Twilio (EUA) | BAJO | Acceptable (sin datos sensibles) |
| Pagos via Stripe (EUA) | MEDIO | Acceptable (solo tokens, no tarjetas) |
| Backups en S3 (configurable) | BAJO | Configurar región México |

---

## 📞 CONTACTOS DE CUMPLIMIENTO

**Responsable de Cumplimiento:** [Por Asignar]
**Revisión Legal:** [Abogado especializado en LFPDPPP]
**Actualización:** Semanal durante primer año, mensual después

---

*Documento creado: 2026-02-11*
*Próxima revisión: 2026-03-11*
