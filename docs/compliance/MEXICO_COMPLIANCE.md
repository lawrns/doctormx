# Guía de Cumplimiento Normativo - México / Mexico Compliance Guide

**Plataforma:** Doctor.mx - Plataforma de Telemedicina
**Versión:** 1.0
**Última actualización:** 10 de febrero de 2026
**Jurisdicción:** México
**Estado:** Implementación en Progreso

---

## Índice / Table of Contents

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Marco Legal Aplicable](#marco-legal-aplicable)
3. [LFPDPPP - Protección de Datos Personales](#lfpdppp---protección-de-datos-personales)
4. [COFEPRIS - Regulación de Software Médico](#cofepris---regulación-de-software-médico)
5. [NOM-004-SSA3-2012 - Expediente Clínico Electrónico](#nom-004-ssa3-2012---expediente-clínico-electrónico)
6. [NOM-024-SSA3-2012 - Sistemas de Información](#nom-024-ssa3-2012---sistemas-de-información)
7. [Firma Digital - SAT e.firma](#firma-digital---sat-efirma)
8. [Localización de Datos](#localización-de-datos)
9. [Derechos ARCO](#derechos-arco)
10. [Retención de Datos](#retención-de-datos)
11. [Consentimiento Informado](#consentimiento-informado)
12. [Seguridad y Confidencialidad](#seguridad-y-confidencialidad)
13. [Telemedicina - Reforma Enero 2026](#telemedicina---reforma-enero-2026)
14. [Checklist de Cumplimiento](#checklist-de-cumplimiento)

---

## Resumen Ejecutivo

### Español

Doctor.mx es una plataforma de telemedicina que opera en México y debe cumplir con múltiples regulaciones federales:

- **Protección de Datos:** LFPDPPP y su Reglamento
- **Software Médico:** Regulación COFEPRIS como SaMD (Software as Medical Device)
- **Expediente Clínico:** NOM-004-SSA3-2012 para registros médicos electrónicos
- **Sistemas de Información:** NOM-024-SSA3-2012 para interoperabilidad
- **Firma Electrónica:** SAT e.firma para recetas digitales
- **Telemedicina:** Nueva regulación de Salud Digital (enero 2026)

### English

Doctor.mx is a telemedicine platform operating in Mexico that must comply with multiple federal regulations:

- **Data Protection:** LFPDPPP and its Regulations
- **Medical Software:** COFEPRIS regulation as SaMD (Software as Medical Device)
- **Clinical Records:** NOM-004-SSA3-2012 for electronic medical records
- **Information Systems:** NOM-024-SSA3-2012 for interoperability
- **Digital Signature:** SAT e.firma for digital prescriptions
- **Telemedicine:** New Digital Health regulation (January 2026)

---

## Marco Legal Aplicable

### Autoridades Regulatorias / Regulatory Authorities

| Autoridad | Rol | Sitio Web |
|-----------|-----|-----------|
| **COFEPRIS** | Regulador sanitario federal; autorizaciones de dispositivos médicos | [cofepris.gob.mx](https://www.gob.mx/cofepris) |
| **Secretaría de Salud** | Política de salud, emisión de NOMs | [www.gob.mx/salud](https://www.gob.mx/salud) |
| **Secretariado Ejecutivo del Sistema Nacional Anticorrupción** | Protección de datos personales (sucesor del INAI) | [www.gob.mx/sna](https://www.gob.mx/sna) |
| **PROFECO** | Protección al consumidor | [www.gob.mx/profeco](https://www.gob.mx/profeco) |
| **CONAMED** | Arbitraje médico | [conamed.gob.mx](https://www.gob.mx/conamed) |
| **SAT** | Firma electrónica (e.firma) | [www.sat.gob.mx](https://www.sat.gob.mx) |
| **DGP/SEP** | Cedulación profesional | [www.gob.mx/sep](https://www.gob.mx/sep) |

### Normas Oficiales Mexicanas (NOMs) Aplicables

1. **NOM-004-SSA3-2012**: Expediente clínico
2. **NOM-024-SSA3-2012**: Sistemas de información
3. **NOM-001-SSA1-2010**: Entorno clínico seguro
4. **NOM-168-SSA1-1998**: Del expediente clínico

---

## LFPDPPP - Protección de Datos Personales

### Ley Federal de Protección de Datos Personales en Posesión de los Particulares

**Referencia Legal:** [Texto completo LFPDPPP](http://www.dof.gob.mx/nota_detalle.php?codigo=5150631&fecha=05/07/2010)

#### Clasificación de Datos

Doctor.mx clasifica los datos según la LFPDPPP:

| Tipo de Dato | Clasificación | Nivel de Sensibilidad |
|--------------|---------------|----------------------|
| Identificación personal (nombre, email, teléfono) | Dato Personal | Medio |
| Historial médico | Dato Personal Sensible | Alto |
| Información de pago | Dato Personal | Alto |
| Diagnósticos y tratamientos | Dato Personal Sensible | Alto |
| Transcripciones de consultas | Dato Personal Sensible | Alto |
| Datos biométricos (huella digital, facial) | Dato Personal Sensible | Alto |

#### Aviso de Privacidad / Privacy Notice

**Estado de Implementación:** ✅ COMPLETO

**Ubicación:** `/privacidad` (src/app/privacy/page.tsx)

**Elementos Requeridos (Todos Implementados):**
- [x] Identidad y domicilio del responsable
- [x] Propósitos del tratamiento de datos
- [x] Tipos de datos recopilados
- [x] Opciones y medios para limitar el uso/divulgación
- [x] Explicación de derechos ARCO
- [x] Información de contacto para privacidad
- [x] Referencia a política de cookies

**Entrega del Aviso de Privacidad:**
- Presentado durante flujo de registro
- Accesible permanentemente en `/privacidad`
- Versión actualizada enero 2026
- Email: privacidad@doctormx.com

#### Consentimiento Expreso

**Requerido Para:**
- [ ] Recolección de datos médicos sensibles
- [ ] Grabación de videoconsultas
- [ ] Análisis de consultas por IA
- [ ] Compartición con especialistas
- [ ] Uso de datos para investigación (opcional)

**Implementación del Consentimiento:**
```typescript
// src/lib/consent.ts
export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'medical_data' | 'video_recording' | 'ai_analysis' | 'data_sharing';
  grantedAt: Date;
  ipAddress: string;
  userAgent: string;
  version: string;
}

// Registro de consentimiento
export async function recordConsent(
  userId: string,
  consentType: ConsentRecord['consentType']
): Promise<ConsentRecord> {
  // Implementación en tabla consents
}
```

---

## COFEPRIS - Regulación de Software Médico

### Comisión Federal para la Protección contra Riesgos Sanitarios

**Marco Legal:**
- [Ley General de Salud](https://www.dof.gob.mx/nota_detalle.php?codigo=5464385&fecha=07/02/1984)
- [Reglamento de Dispositivos Médicos](https://www.dof.gob.mx/nota_detalle.php?codigo=5436619&fecha=26/11/1999)

#### Clasificación como Dispositivo Médico

**Doctor.mx clasifica como:** Software como Dispositivo Médico (SaMD)

**Categoría COFEPRIS:** Clase II (Riesgo Moderado)

**Criterios de Clasificación:**
- Software utilizado para apoyo diagnóstico/consulta
- No invasivo, no afecta directamente la fisiología del paciente
- Proporciona información para toma de decisiones médicas
- No conduce directamente el tratamiento

#### Requisitos de Registro

| Requisito | Estado | Notas |
|-----------|--------|-------|
| Sistema de Gestión de Riesgos | 🟡 Planificado | Marco ISO 14971 |
| Validación de Software | 🟡 Parcial | Suite de pruebas automatizadas existe |
| Evaluación Clínica | ⚠️ Requerido | Necesita vigilancia post-comercialización |
| Certificación ISO 13485 | ⚠️ Recomendado | Sistema de calidad |
| Etiquetado COFEPRIS | ⚠️ Pendiente | Número de registro |
| Manual de Usuario | 🟡 Borrador | Documentación técnica |
| Información de Seguridad | 🟡 Parcial | Reporte de incidentes |

#### Clasificación de Riesgo de IA

**Sistema de IA de Doctor.mx:**

| Componente | Clasificación | Riesgo | Justificación |
|------------|---------------|--------|---------------|
| Triage de síntomas | SaMD Clase II | Moderado | Apoya decisión clínica, no diagnóstica |
| Generación de SOAP | SaMD Clase I | Bajo | Documentación clínica |
| Detección de emergencias | SaMD Clase II | Moderado | Alerta médica, requiere validación |
| Sugerencias de tratamiento | SaMD Clase II | Moderado | Recomendaciones, no prescripción |

---

## NOM-004-SSA3-2012 - Expediente Clínico Electrónico

### Norma Oficial Mexicana para el Expediente Clínico

**Referencia:** [NOM-004-SSA3-2012](https://www.dof.gob.mx/nota_detalle.php?codigo=5274869&fecha=15/10/2012)

#### Requisitos del Expediente Clínico Electrónico

**Estructura Mínima Requerida:**

```typescript
// src/types/medical-record.ts
interface ElectronicMedicalRecord {
  // Identificación del paciente
  patientIdentification: {
    fullName: string;
    dateOfBirth: Date;
    sex: 'M' | 'F' | 'X';
    address: string;
    phone: string;
    emergencyContact: EmergencyContact;
  };

  // Notas de evolución (SOAP)
  progressNotes: SOAPNote[];

  // Signos vitales
  vitalSigns: VitalSign[];

  // Diagnósticos (CIE-10)
  diagnoses: Diagnosis[];

  // Tratamientos
  treatments: Treatment[];

  // Recetas médicas
  prescriptions: Prescription[];

  // Consentimientos informados
  consents: Consent[];

  // Interconsultas
  referrals: Referral[];

  // Notas de egreso
  dischargeNotes?: DischargeNote;
}
```

#### Requisitos de Contenido

**Nota de Evolución (SOAP):**
- [x] **S**ubjetivo: Síntomas y padecimientos del paciente
- [x] **O**bjetivo: Datos de exploración física y signos vitales
- [x] **A**nálisis: Diagnóstico y diagnósticos diferenciales
- [x] **P**lan: Tratamiento y pronóstico

**Elementos Obligatorios:**
- [ ] Fecha y hora de la consulta
- [ ] Identificación del médico (cédula profesional)
- [ ] Identificación del paciente
- [ ] Reason for consultation (Motivo de consulta)
- [ ] Diagnóstico (preferiblemente con código CIE-10)
- [ ] Tratamiento indicado
- [ ] Pronóstico
- [ ] Firma electrónica del médico

#### Conservación de Registros

**Período de Retención:** 5 años mínimo (LFPDPPP para datos sensibles)

**Implementación:**
```sql
-- Tabla: medical_records
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  appointment_id UUID REFERENCES appointments(id),

  -- Contenido SOAP
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,

  -- Metadatos requeridos NOM-004
  consultation_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Identificación médica
  doctor_license VARCHAR(50) NOT NULL,
  doctor_signature TEXT, -- Firma digital

  -- Auditoría
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Retención (NOM-004 + LFPDPPP)
  retention_until TIMESTAMPTZ GENERATED ALWAYS AS (
    created_at + INTERVAL '5 years'
  ) STORED,
  archived BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);
```

---

## NOM-024-SSA3-2012 - Sistemas de Información

### Norma para los Sistemas de Información de Registros Médicos

**Referencia:** [NOM-024-SSA3-2012](https://www.dof.gob.mx/nota_detalle.php?codigo=5274873&fecha=15/10/2012)

#### Requisitos de Interoperabilidad

**Estándares Requeridos:**

1. **Codificación de Diagnósticos:** CIE-10 (Clasificación Internacional de Enfermedades)
2. **Terminología Clínica:** SNOMED CT (opcional pero recomendado)
3. **Identificadores de Paciente:** CURP estándar
4. **Formato de Intercambio:** HL7 CDA o FHIR

**Implementación CIE-10:**
```typescript
// src/lib/medical-codes/iec-10.ts
export interface ICD10Code {
  code: string; // Ej: 'I10' (Hipertensión esencial)
  description: {
    es: string; // 'Hipertensión esencial (primaria)'
    en: string; // 'Essential (primary) hypertension'
  };
  category: 'Chapter' | 'Block' | 'Code';
}

// Ejemplo de uso
const hypertension: ICD10Code = {
  code: 'I10',
  description: {
    es: 'Hipertensión esencial (primaria)',
    en: 'Essential (primary) hypertension'
  },
  category: 'Code'
};
```

#### Estructura del Expediente Electrónico

**Componentes Mínimos:**
- [ ] Datos de identificación del paciente
- [ ] Historia clínica
- [ ] Notas de evolución (SOAP)
- [ ] Recetas médicas
- [ ] Estudios de laboratorio y gabinete
- [ ] Consentimientos informados
- [ ] Resúmenes de egreso

---

## Firma Digital - SAT e.firma

### Firma Electrónica Avanzada para Recetas Médicas

**Marco Legal:**
- [Código de Comercio](https://www.dof.gob.mx/nota_detalle.php?codigo=5330358&fecha=24/05/1996)
- [Ley de Firma Electrónica Avanzada](https://www.dof.gob.mx/nota_detalle.php?codigo=5326355&fecha=11/01/2012)

#### Requisitos de Firma Digital

**Elementos de la e.firma:**
1. **Certificado Digital:** Emitido por el SAT
2. **Clave Privada:** Almacenada seguramente por el médico
3. **Cadena de Certificación:** Validación de la autoridad certificadora
4. **Sello Digital:** Hash del documento firmado

**Flujo de Firma de Receta:**
```typescript
// src/lib/digital-signature/prescription-signing.ts
interface DigitalPrescription {
  prescriptionId: string;
  patientData: PatientData;
  medications: Medication[];
  diagnosis: string;
  doctorLicense: string;
  issuedAt: Date;
  expiresAt: Date;
}

// Proceso de firma
async function signPrescription(
  prescription: DigitalPrescription,
  doctorEFirma: E Firma
): Promise<SignedPrescription> {
  // 1. Generar hash del documento
  const prescriptionHash = await crypto.hash(
    JSON.stringify(prescription)
  );

  // 2. Firmar con e.firma del médico
  const signature = await doctorEFirma.sign(prescriptionHash);

  // 3. Generar código QR para validación
  const qrCode = generateQRCode({
    prescriptionId: prescription.prescriptionId,
    signature: signature,
    validationUrl: `https://doctormx.com/validate/${prescription.prescriptionId}`
  });

  return {
    ...prescription,
    signature,
    qrCode,
    signedAt: new Date()
  };
}
```

#### Validación de Firma

**Endpoints de Validación:**
```
GET /api/prescriptions/{id}/validate
→ Verifica firma electrónica
→ Valida caducidad del certificado
→ Confirma identidad del médico

GET /api/prescriptions/{id}/qrcode
→ Genera código QR
→ Permite validación en farmacia
```

---

## Localización de Datos

### Requisitos de Almacenamiento en México

**Marco Legal LFPDPPP:**
- Datos de personales de mexicanos deben almacenarse preferentemente en México
- Transferencias internacionales requieren autorización expresa
- Infraestructura debe garantizar seguridad y confidencialidad

#### Infraestructura de Datos

**Proveedores Actuales:**

| Servicio | Proveedor | Ubicación de Datos | Medidas de Seguridad |
|----------|-----------|-------------------|---------------------|
| Base de Datos | Supabase | Estados Unidos | Encriptación AES-256, RLS |
| Autenticación | Supabase Auth | Estados Unidos | OAuth 2.0, JWT |
| Storage | Supabase Storage | Estados Unidos | Encriptación en reposo y tránsito |
| Cache | Upstash Redis | Región seleccionable | TLS 1.3 |
| Pagos | Stripe Mexico | México (entidad) | PCI DSS Level 1 |
| Video | Daily.co | Estados Unidos | E2E Encryption |

**Medidas de Cumplimiento:**
- [ ] Acuerdos de transferencia de datos (Data Processing Agreements)
- [ ] Certificación de seguridad con proveedores
- [ ] Encriptación de datos sensibles
- [ ] Anonimización para datos analíticos
- [ ] Plan de contingencia para repatriación de datos

---

## Derechos ARCO

### Derechos de Acceso, Rectificación, Cancelación y Oposición

**Base Legal:** LFPDPPP Artículos 22-28

#### Implementación de Derechos ARCO

**API Endpoints:**
```typescript
// src/app/api/arco/
POST   /api/arco/request      // Solicitar ejercicio de derecho ARCO
GET    /api/arco/status       // Verificar estado de solicitud
GET    /api/arco/data         // Acceso a datos (Acceso)
PUT    /api/arco/rectify      // Rectificar datos (Rectificación)
DELETE /api/arco/cancel       // Cancelar cuenta (Cancelación)
POST   /api/arco/oppose       // Oponerse a uso de datos (Oposición)
```

**Sistema de Solicitudes ARCO:**
```sql
-- Tabla: arco_requests
CREATE TABLE arco_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Tipo de derecho
  right_type VARCHAR(10) NOT NULL CHECK (right_type IN ('access', 'rectify', 'cancel', 'oppose')),

  -- Detalles de solicitud
  reason TEXT,
  requested_data TEXT[], -- Campos específicos solicitados

  -- Estado
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),

  -- Respuesta
  response_data JSONB, -- Datos devueltos (para acceso)
  response_reason TEXT, -- Razón de rechazo

  -- Tiempos de respuesta (LFPDPPP: 20 días hábiles)
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,

  -- Auditoría
  processed_by UUID REFERENCES users(id),
  notes TEXT
);

-- Índice para tiempos de respuesta
CREATE INDEX idx_arco_requests_requested_at ON arco_requests(requested_at);
```

**Tiempos de Respuesta (LFPDPPP):**
- **Máximo:** 20 días hábiles
- **Prórroga:** 15 días hábiles adicionales (una sola vez)
- **Notificación:** Al correo electrónico del usuario

---

## Retención de Datos

### Políticas de Retención Según LFPDPPP

**Períodos de Retención Mínimos:**

| Tipo de Dato | Período de Retención | Base Legal |
|--------------|---------------------|------------|
| Expediente clínico | 5 años después del último contacto | LFPDPPP + NOM-004 |
| Datos de facturación | 5 años | Código Fiscal |
| Datos de empleo | 1 año después de terminación | LFT |
| Datos de estudios | 6 meses | Constitución |
| Cookies de marketing | 5 años | LFPDPPP |

**Implementación:**
```typescript
// src/lib/data-retention.ts
export const RETENTION_PERIODS = {
  medicalRecords: 5 * 365 * 24 * 60 * 60 * 1000, // 5 años en ms
  billing: 5 * 365 * 24 * 60 * 60 * 1000,
  employment: 365 * 24 * 60 * 60 * 1000, // 1 año
  cookies: 5 * 365 * 24 * 60 * 60 * 1000
};

// Job programado para retención
export async function checkDataRetention(): Promise<void> {
  // Buscar registros elegibles para archivo/borrado
  const expiredRecords = await db.query(`
    SELECT id, patient_id, created_at
    FROM medical_records
    WHERE archived = false
    AND created_at < NOW() - INTERVAL '5 years'
  `);

  // Archivar registros expirados
  for (const record of expiredRecords) {
    await archiveMedicalRecord(record.id);
  }
}
```

---

## Consentimiento Informado

### Consentimientos Requeridos por Ley

#### 1. Consentimiento para Atención Médica

**Requisito NOM-004-SSA3-2012:**
```
CONSENTIMIENTO INFORMADO PARA ATENCIÓN MÉDICA VÍA TELEMEDICINA

Yo, [Nombre del paciente], identificado con [CURP/ID],

DECLARO QUE:

1. He sido informado de la naturaleza de los servicios médicos a través de telemedicina
2. Entiendo las limitaciones de la consulta remota
3. Autorizo al médico a realizar consulta y diagnóstico
4. Acepto que la telemedicina no sustituye atención presencial de emergencia
5. Autorizo grabación de consulta para expediente clínico
6. Entiendo que mis datos serán protegidos conforme a LFPDPPP

Nombre y Firma: _________________________
Fecha: ____/____/______
Testigo: _________________________
```

#### 2. Consentimiento para Uso de IA

**Requerimiento para SaMD:**
```
CONSENTIMIENTO PARA USO DE INTELIGENCIA ARTIFICIAL

Yo, [Nombre del paciente],

AUTORIZO el uso de sistemas de inteligencia artificial para:

□ Análisis de síntomas y triaje
□ Generación de notas clínicas (SOAP)
□ Sugerencias de tratamiento (siempre bajo supervisión médica)

ENTIENDO QUE:

□ La IA es una herramienta de apoyo, no un médico
□ Las sugerencias de la IA son validadas por médico humano
□ Mis datos pueden ser procesados por sistemas de IA alojados en servidores seguros
□ Puedo revocar este consentimiento en cualquier momento

Nombre y Firma: _________________________
Fecha: ____/____/______
```

#### 3. Consentimiento para Compartir Datos

**Para compartir con especialistas:**
```
AUTORIZACIÓN PARA COMPARTIR DATOS MÉDICOS

Yo, [Nombre del paciente],

AUTORIZO a Doctor.mx a compartir mis datos médicos con:

□ Especialistas médicos para segunda opinión
□ Laboratorios clínicos para estudios
□ Farmacias para surtir recetas

PROTECCIÓN DE DATOS:

□ Solo datos necesarios para el propósito específico
□ Transferencias encriptadas
□ Acuerdos de confidencialidad con terceros

Nombre y Firma: _________________________
Fecha: ____/____/______
```

---

## Seguridad y Confidencialidad

### Medidas de Seguridad Implementadas

**Seguridad Técnica:**
- [x] Encriptación AES-256 en reposo
- [x] Encriptación TLS 1.3 en tránsito
- [x] Autenticación multifactor (2FA) para médicos
- [x] Control de acceso basado en roles (RBAC)
- [x] Row Level Security (RLS) en Supabase
- [x] Auditoría de accesos a expedientes

**Seguridad Administrativa:**
- [ ] Política de seguridad escrita
- [ ] Capacitación anual en seguridad
- [ ] Procedimientos de respuesta a incidentes
- [ ] Acuerdos de confidencialidad con empleados
- [ ] Verificación de antecedentes del personal

**Seguridad Física:**
- [ ] Control de acceso a instalaciones
- [ ] Almacenamiento seguro de respaldos
- [ ] Plan de recuperación de desastres

**Monitoreo de Seguridad:**
```typescript
// src/lib/security/audit.ts
interface SecurityEvent {
  eventType: 'access' | 'modification' | 'deletion' | 'export';
  resourceType: 'medical_record' | 'prescription' | 'patient_data';
  resourceId: string;
  userId: string;
  userRole: 'doctor' | 'patient' | 'admin';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
}

// Registrar evento de seguridad
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  await db.insert('security_events', event);
}
```

---

## Telemedicina - Reforma Enero 2026

### Nueva Ley de Salud Digital

**Reforma Publicada:** 15 de enero de 2026

**Capítulo VI Bis: Salud Digital**

#### Requisitos para Servicios de Telesalud

**Artículo 94 Bis - Requisitos:**

1. **Personal Capacitado:** Servicios proporcionados por personal específicamente designado y capacitado
2. **Sistemas Seguros:** Garantizar integridad y disponibilidad de información médica
3. **Consentimiento Informado:** Mecanismos específicos para consentimiento remoto
4. **Documentación:** Toda atención debe documentarse correctamente
5. **Confidencialidad:** Protocolos de confidencialidad y protección de datos
6. **Interoperabilidad:** Capacidad de intercambio seguro de información

#### Objetivos Estratégicos

- **Accesibilidad:** Facilitar servicios médicos remotos
- **Cobertura:** Expandir acceso, especialmente en comunidades desatendidas
- **Eficiencia:** Optimizar recursos humanos y tecnológicos
- **Continuidad y Calidad:** Digitalizar información médica
- **Análisis de Datos:** Big Data para identificar patrones

---

## Checklist de Cumplimiento

### Matriz de Cumplimiento Normativo

| Norma | Tema | Estado | Documentación | Responsable |
|-------|------|--------|---------------|-------------|
| **LFPDPPP** | | | | |
| | Aviso de privacidad completo | ✅ | `/privacy` | Legal |
| | Consentimiento expreso | 🟡 | Formularios en desarrollo | Legal |
| | Derechos ARCO implementados | 🟡 | API parcial | Ingeniería |
| | Retención 5 años datos | 🟡 | Job programado | Ingeniería |
| | Respuesta ARCO <20 días | 🟡 | Proceso definido | Soporte |
| **COFEPRIS** | | | | |
| | Clasificación SaMD | ✅ | Documento técnico | Médico |
| | Registro COFEPRIS | ⚠️ | Pendiente | Regulatorio |
| | Sistema gestión riesgos | 🟡 | ISO 14971 parcial | Calidad |
| | Validación software | 🟡 | Suite de pruebas | QA |
| | Evaluación clínica | ⚠️ | Requerido | Médico |
| **NOM-004** | | | | |
| | Expediente SOAP completo | ✅ | Nota médica estructurada | Médico |
| | Firma electrónica | 🟡 | e.firma parcial | Ingeniería |
| | Códigos CIE-10 | ✅ | Catálogo integrado | Médico |
| | Retención 5 años | 🟡 | Archivo programado | Ingeniería |
| **NOM-024** | | | | |
| | Interoperabilidad CIE-10 | ✅ | Códigos integrados | Ingeniería |
| | Identificación CURP | ✅ | Campo en perfil | Ingeniería |
| | Estructura expediente | ✅ | Esquema validado | Ingeniería |
| **SAT e.firma** | | | | |
| | Firma recetas digitales | 🟡 | En desarrollo | Ingeniería |
| | Validación farmacias | 🟡 | Pendiente | Ingeniería |
| | Código QR validación | 🟡 | Diseño listo | Ingeniería |
| **Seguridad** | | | | |
| | Encriptación datos | ✅ | AES-256/TLS 1.3 | Infraestructura |
| | Control acceso RBAC | ✅ | Roles implementados | Ingeniería |
| | Auditoría accesos | ✅ | Sistema logging | Ingeniería |
| | Respuesta incidentes | 🟡 | Proceso parcial | CISO |
| **Telemedicina** | | | | |
| | Consentimiento remoto | ✅ | Formularios digitales | Legal |
| | Capacitación personal | ✅ | Curso completado | RRHH |
| | Documentación atención | ✅ | SOAP estructurado | Médico |
| | Interoperabilidad | 🟡 | Parcial | Ingeniería |

**Leyenda:**
- ✅ Completo
- 🟡 Parcial/En progreso
- ⚠️ Requiere atención inmediata
- ❌ No implementado

---

## Contacto de Cumplimiento

**Equipo de Cumplimiento Normativo:**

- **Director de Cumplimiento:** compliance@doctormx.com
- **Médico Director:** medical@doctormx.com
- **Oficial de Seguridad:** security@doctormx.com
- **Asesoría Legal:** legal@doctormx.com

**Reporte de Incidencias:**
- Brecha de seguridad: security@doctormx.com
- Incidente médico: medical@doctormx.com
- Solicitud ARCO: arco@doctormx.com
- Quejas PROFECO: consumidor@doctormx.com

---

**Aviso Legal / Legal Notice:** Este documento es para fines informativos y no constituye asesoría legal. Para asesoría legal específica, consulte a un abogado especializado en derecho de la salud y protección de datos en México.

**© 2026 Doctor.mx - Todos los derechos reservados**

*Última revisión: 10 de febrero de 2026*
*Próxima revisión programada: 10 de agosto de 2026*
