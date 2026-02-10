# Protocolo de Estudio de Validación Clínica
# Clinical Validation Study Protocol

**Versión:** 1.0.0
**Fecha:** 2026-02-09
**Estado:** Borrador para Revisión del Consejo Médico
**Sistema:** Detección de Emergencias Doctor.mx

---

## Índice / Table of Contents

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Objetivos del Estudio](#objetivos-del-estudio)
3. [Diseño del Estudio](#diseño-del-estudio)
4. [Población del Estudio](#población-del-estudio)
5. [Métodos de Validación](#métodos-de-validación)
6. [Criterios de Evaluación](#criterios-de-evaluación)
7. [Análisis Estadístico](#análisis-estadístico)
8. [Control de Calidad](#control-de-calidad)
9. [Consideraciones Éticas](#consideraciones-éticas)
10. [Cronograma](#cronograma)

---

## Resumen Ejecutivo

### Español
Este protocolo establece los procedimientos para validar clínicamente el sistema de detección de emergencias de Doctor.mx. El estudio evaluará la sensibilidad y especificidad del sistema utilizando un conjunto de 100+ casos de validación, con criterios de referencia establecidos por un panel de especialistas médicos.

### English
This protocol establishes procedures for clinically validating Doctor.mx's emergency detection system. The study will evaluate the system's sensitivity and specificity using a dataset of 100+ validation cases, with reference criteria established by a panel of medical specialists.

---

## Objetivos del Estudio

### Objetivo Principal
Validar que el sistema de detección de emergencias cumpla con los siguientes estándares de rendimiento clínico:

1. **Sensibilidad ≥95%**: Capacidad de detectar verdaderas emergencias médicas
2. **Especificidad ≥90%**: Capacidad de identificar correctamente casos no urgentes
3. **Tiempo de detección <2 segundos**: Respuesta en tiempo real
4. **Tasa de falsos negativos = 0%**: Ninguna emergencia real pasada por alto

### Objetivos Secundarios

1. Evaluar la precisión de la clasificación de urgencia (scores 1-10)
2. Validar la detección contextual basada en condiciones médicas preexistentes
3. Medir la eficacia de las alertas de interacción medicamentosa
4. Analizar los casos límite y falsos positivos
5. Establecer un conjunto de casos de prueba para validación continua

---

## Diseño del Estudio

### Tipo de Estudio
**Estudio de Validación Diagnóstica Retrospectiva y Prospectiva**

- **Fase 1 (Retrospectiva):** Validación con casos históricos anonimizados
- **Fase 2 (Prospectiva):** Validación en tiempo real con modo "sombra" (shadow mode)
- **Fase 3 (Comparativa):** Comparación con triaje realizado por especialistas humanos

### Tamaño de Muestra

| Categoría | Casos Requeridos | Justificación |
|-----------|------------------|---------------|
| Emergencias Críticas | 30 | Suficiente potencia estadística para sensibilidad |
| Urgencias Altas | 30 | Evaluación de clasificación intermedia |
| Casos No Urgentes | 25 | Evaluación de especificidad |
| Casos Límite | 15 | Análisis de edge cases |
| **Total** | **100+** | **Mínimo para validación estadística** |

### Distribución por Especialidad

| Especialidad | Casos | % del Total |
|--------------|-------|-------------|
| Cardiología | 15 | 15% |
| Neurología | 15 | 15% |
| Medicina de Emergencia | 20 | 20% |
| Pediatría | 10 | 10% |
| Medicina Interna | 15 | 15% |
| Psiquiatría | 10 | 10% |
| Obstetricia/Ginecología | 10 | 10% |
| Geriatría | 5 | 5% |

---

## Población del Estudio

### Criterios de Inclusión

1. **Casos Retrospectivos:**
   - Pacientes que utilizaron Doctor.mx entre [fecha inicio] y [fecha fin]
   - Casos con resultado clínico conocido (vía seguimiento o registros médicos)
   - Consentimiento informado para uso de datos anonimizados

2. **Casos Prospectivos:**
   - Pacientes ≥18 años (o casos pediátricos con consentimiento parental)
   - Pacientes que aceptan participar en el estudio
   - Casos con sufficiente información clínica en la descripción de síntomas

### Criterios de Exclusión

1. Casos con información clínica insuficiente
2. Casos donde el resultado clínico no pudo ser determinado
3. Pacientes que revocaron consentimiento
4. Casos duplicados

---

## Métodos de Validación

### 1. Preparación de Casos de Prueba

#### Casos Golden Standard
Cada caso debe incluir:

```typescript
interface ValidationCase {
  id: string;
  category: 'cardiac' | 'neurological' | 'respiratory' | 'psychiatric' | 'other';

  // Input del sistema
  patientInput: {
    message: string;           // Descripción de síntomas del paciente
    language: 'es' | 'en';
  };

  patientContext?: {
    age: number;
    conditions: string[];
    medications: Array<{name: string, dosage?: string}>;
    vitalSigns?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      oxygenSaturation?: number;
    };
  };

  // Referencia clínica (Gold Standard)
  clinicalReference: {
    actualUrgency: 'critical' | 'high' | 'moderate' | 'low';
    actualDiagnosis?: string;
    requiredAction: 'call_911' | 'er_24h' | 'consult_24h' | 'elective';
    verifiedBy: string;        // Especialista que verificó
    verificationMethod: 'follow_up' | 'medical_records' | 'specialist_review';
    outcome: string;           // Resultado clínico conocido
  };

  // Evaluación requerida
  expectedSystemResponse: {
    shouldDetectEmergency: boolean;
    expectedUrgencyScore: number;  // 1-10
    expectedFlags: string[];
    expectedRecommendation: string;
  };
}
```

#### Ejemplo de Caso de Validación

```typescript
const cardiacCase: ValidationCase = {
  id: 'CARD-001',
  category: 'cardiac',

  patientInput: {
    message: 'Tengo un dolor en el pecho que se siente como una presión fuerte, me va hacia el brazo izquierdo y siento que me voy a desmayar',
    language: 'es',
  },

  patientContext: {
    age: 58,
    conditions: ['hypertension', 'diabetes_type2'],
    medications: [
      {name: 'enalapril', dosage: '20mg daily'},
      {name: 'metformina', dosage: '850mg twice daily'}
    ],
    vitalSigns: {
      bloodPressure: '165/105',
      heartRate: 102,
      oxygenSaturation: 96
    }
  },

  clinicalReference: {
    actualUrgency: 'critical',
    actualDiagnosis: 'Síndrome coronario agudo (IAM)',
    requiredAction: 'call_911',
    verifiedBy: 'Dr. María González, Cardiología',
    verificationMethod: 'medical_records',
    outcome: 'Paciente recibió intervención coronaria percutánea, evolución favorable'
  },

  expectedSystemResponse: {
    shouldDetectEmergency: true,
    expectedUrgencyScore: 10,
    expectedFlags: ['chest_pain_emergency', 'hypertensive_urgency'],
    expectedRecommendation: 'Llame al 911 INMEDIATAMENTE. Posible infarto al miocardio'
  }
};
```

### 2. Proceso de Validación

#### Paso 1: Ejecución del Sistema
```typescript
async function validateCase(testCase: ValidationCase): Promise<ValidationResult> {
  // Ejecutar el sistema de detección
  const systemResult = await detectRedFlagsEnhanced(
    testCase.patientInput.message,
    testCase.patientContext
  );

  // Comparar con gold standard
  const comparison = compareWithReference(
    systemResult,
    testCase.expectedSystemResponse,
    testCase.clinicalReference
  );

  return {
    caseId: testCase.id,
    systemResult,
    comparison,
    passed: comparison.allCriteriaPassed,
    discrepancies: comparison.discrepancies
  };
}
```

#### Paso 2: Revisión por Especialista
Cada caso es evaluado por mínimo 3 especialistas:

```typescript
interface SpecialistReview {
  caseId: string;
  specialistId: string;
  specialty: string;
  credentials: string;

  agreement: {
    detectionCorrect: boolean;
    urgencyScoreCorrect: boolean;
    recommendationAppropriate: boolean;
  };

  comments: {
    detection?: string;
    urgency?: string;
    recommendation?: string;
    overall?: string;
  };

  suggestedChanges?: {
    urgencyScore?: number;
    flags?: string[];
    recommendation?: string;
  };

  reviewedAt: Date;
}
```

### 3. Clasificación de Resultados

#### Matriz de Confusión

| | Emergencia Real | No Emergencia |
|---|---|---|
| **Sistema Detecta Emergencia** | Verdadero Positivo (VP) | Falso Positivo (FP) |
| **Sistema No Detecta** | Falso Negativo (FN) | Verdadero Negativo (VN) |

#### Cálculos de Rendimiento

```
Sensibilidad = VP / (VP + FN) ≥ 95%
Especificidad = VN / (VN + FP) ≥ 90%
Precisión = (VP + VN) / (VP + VN + FP + FN)
Valor Predictivo Positivo = VP / (VP + FP)
Valor Predictivo Negativo = VN / (VN + FN)
F1-Score = 2 × (Precisión × Sensibilidad) / (Precisión + Sensibilidad)
```

---

## Criterios de Evaluación

### 1. Detección de Emergencia

| Criterio | Especificación | Peso |
|----------|---------------|------|
| Detección de emergencia crítica | 100% de casos detectados | 40% |
| Detección de urgencia alta | ≥95% de casos detectados | 30% |
| Tiempo de detección | <2 segundos | 15% |
| Estabilidad ante variaciones | ≥95% consistencia | 15% |

### 2. Clasificación de Urgencia

| Score Esperado | Rango Aceptable | Precisión Requerida |
|----------------|-----------------|---------------------|
| 9-10 (Crítico) | 8-10 | ±1 punto |
| 7-8 (Emergencia) | 6-9 | ±1 punto |
| 5-6 (Urgente) | 4-7 | ±1 punto |
| 3-4 (Consulta) | 2-5 | ±1 punto |
| 1-2 (No urgente) | 1-3 | ±1 punto |

### 3. Contextualización Clínica

| Aspecto | Métrica | Umbral |
|---------|---------|--------|
| Ajuste por condiciones preexistentes | % de ajustes correctos | ≥90% |
| Detección de interacciones medicamentosas | % de interacciones detectadas | ≥95% |
| Consideraciones por edad | % de ajustes pediátricos/geriátricos correctos | ≥95% |
| Signos vitales críticos | % de umbrales detectados | 100% |

### 4. Recomendaciones Clínicas

| Criterio | Evaluación |
|----------|-----------|
| Claridad de mensaje | Escala 1-5, ≥4 |
| Accionalidad | Recomendación ejecutable |
| Alineación con guías clínicas | 100% según especialista |
| Seguridad del paciente | No recomendaciones dañinas |

---

## Análisis Estadístico

### 1. Análisis de Sensibilidad

```typescript
interface SensitivityAnalysis {
  byCategory: {
    [category: string]: {
      truePositives: number;
      falseNegatives: number;
      sensitivity: number;
      confidenceInterval: [number, number]; // 95% CI
    }
  };

  overall: {
    sensitivity: number;
    confidenceInterval: [number, number];
    pValue: number; // vs. threshold of 95%
  };
}
```

**Método:** Wilson Score Interval con α=0.05

### 2. Análisis de Especificidad

```typescript
interface SpecificityAnalysis {
  byCategory: {
    [category: string]: {
      trueNegatives: number;
      falsePositives: number;
      specificity: number;
      confidenceInterval: [number, number];
    }
  };

  overall: {
    specificity: number;
    confidenceInterval: [number, number];
    pValue: number; // vs. threshold of 90%
  };
}
```

### 3. Análisis de Casos Límite

Casos que requieren consideración especial:

| Tipo de Caso Límite | Ejemplo | Manejo Esperado |
|---------------------|---------|-----------------|
| Presentación atípica | IAM en diabético (sin dolor torácico) | Detección por síntomas asociados |
| Síntomas vagos | "Me siento mal" con signos vitales normales | Evaluación conservadora |
| Condiciones múltiples | Polifarmacia + síntomas inespecíficos | Priorizar seguridad |
| Edades extremas | Fiebre en lactante <3 meses | Umbral reducido |
| Contexto psiquiátrico | Síntomas somáticos en depresión | Diferenciación adecuada |

### 4. Análisis de Concordancia

**Kappa de Cohen** para acuerdo entre especialistas:

```
κ = (P_o - P_e) / (1 - P_e)

Donde:
P_o = proporción de acuerdo observado
P_e = proporción de acuerdo esperado por azar
```

**Interpretación:**
- κ < 0.20: Pobre acuerdo
- κ 0.21-0.40: Acuerdo débil
- κ 0.41-0.60: Acuerdo moderado
- κ 0.61-0.80: Acuerdo sustancial
- κ 0.81-1.00: Acuerdo casi perfecto

**Meta:** κ ≥ 0.80 entre sistema y gold standard

---

## Control de Calidad

### 1. Verificación de Casos

**Checkpoint 1: Integridad de Datos**
```typescript
function validateTestCase(testCase: ValidationCase): ValidationResult {
  const checks = [
    {
      name: 'patientInput completo',
      pass: !!testCase.patientInput?.message?.length > 0
    },
    {
      name: 'clinicalReference presente',
      pass: !!testCase.clinicalReference?.verifiedBy
    },
    {
      name: 'expectedResponse definido',
      pass: testCase.expectedSystemResponse?.expectedUrgencyScore !== undefined
    },
    {
      name: 'consentimiento verificado',
      pass: testCase.consentVerified === true
    }
  ];

  return {
    passed: checks.every(c => c.pass),
    checks
  };
}
```

**Checkpoint 2: Consistencia de Referencia**
- Verificación que diagnóstico final sea compatible con síntomas
- Confirmación que acción recomendada es apropiada para diagnóstico
- Validación que especialista revisor tiene credenciales apropiadas

### 2. Revisión por Pares

```typescript
interface PeerReviewProcess {
  caseId: string;

  primaryReviewer: {
    specialistId: string;
    decision: 'approve' | 'reject' | 'request_changes';
    comments: string;
  };

  secondaryReviewer: {
    specialistId: string;
    decision: 'approve' | 'reject' | 'request_changes';
    comments: string;
  };

  tieBreaker?: {
    specialistId: string;
    finalDecision: 'approve' | 'reject';
    rationale: string;
  };

  consensusReached: boolean;
  finalStatus: 'approved' | 'rejected' | 'needs_revision';
}
```

### 3. Auditoría de Datos

**Verificaciones Aleatorias:**
- 10% de casos seleccionados para auditoría profunda
- Verificación de integridad de datos anonimizados
- Confirmación de consentimiento vigente
- Validación de chain of custody de datos

---

## Consideraciones Éticas

### 1. Consentimiento Informado

**Elementos Requeridos:**
1. Propósito del estudio (validación de sistema de detección de emergencias)
2. Uso de datos clinicos anonimizados
3. Voluntariedad de participación
4. Derecho a retirarse en cualquier momento
5. Protección de datos personales y privacidad
6. Contacto para preguntas o preocupaciones

**Plantilla de Consentimiento:**
```markdown
# CONSENTIMIENTO INFORMADO - ESTUDIO DE VALIDACIÓN CLÍNICA

**Título del Estudio:** Validación del Sistema de Detección de Emergencias de Doctor.mx

**Propósito:**
Este estudio tiene como objetivo validar la precisión de nuestro sistema de detección de emergencias médicas para mejorar la seguridad de nuestros pacientes.

**Procedimientos:**
- Se analizarán datos de su consulta médica (descripción de síntomas, contexto médico)
- Los datos serán anonimizados (sin identificadores personales)
- El sistema de detección será ejecutado y comparado con el criterio de especialistas

**Riesgos:**
- No hay riesgos directos para su participación
- Sus datos estarán protegidos con medidas de seguridad robustas

**Beneficios:**
- Contribuirá a mejorar la precisión del sistema
- Potencialmente ayudará a futuros pacientes a recibir atención más rápida

**Confidencialidad:**
- Todos los datos serán anonimizados
- Solo personal autorizado tendrá acceso
- Los datos serán utilizados únicamente para este estudio

**Voluntariedad:**
Su participación es completamente voluntaria. Puede retirarse en cualquier momento sin consecuencias.

**Contacto:**
Para preguntas: clinical@doctormx.com

[ ] Acepto participar en este estudio
[ ] No deseo participar en este estudio
```

### 2. Anonimización de Datos

**Proceso de Anonimización:**
```typescript
interface AnonymizationPipeline {
  input: RawClinicalData;

  steps: [
    {
      name: 'Remove PHI',
      action: 'strip_identifiers'
    },
    {
      name: 'Generalize Dates',
      action: 'convert_to_relative_dates' // e.g., "3 days ago" instead of "2026-02-06"
    },
    {
      name: 'Perturb Location',
      action: 'convert_to_region_only' // e.g., "CDMX" instead of specific neighborhood
    },
    {
      name: 'Hash Identifiers',
      action: 'replace_ids_with_hashes' // For cross-reference without identification
    },
    {
      name: 'Validate Anonymity',
      action: 'check_k_anonymity' // Ensure k≥5
    }
  ];

  output: AnonymizedValidationData;
}
```

### 3. Cumplimiento Regulatorio

**Regulaciones Aplicables:**
- **México:** Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)
- **Internacional:** HIPAA (si aplicable), GDPR (para datos de ciudadanos EU)
- **Médico:** Norma Oficial Mexicana NOM-024-SSA3-2012 (Expediente clínico electrónico)

**Comité de Ética:**
- Requisito: Aprobación por Comité de Ética en Investigación
- Frecuencia de revisión: Anual
- Reporte de eventos adversos: Inmediato (24 horas)

### 4. Gestión de Conflictos de Interés

**Declaración Obligatoria:**
Todo especialista participante debe declarar:
- Relaciones financieras con Doctor.mx
- Patentes o intereses relacionados
- Competencia con plataformas similares
- Cualquier otro conflicto potencial

---

## Cronograma

### Fase 1: Preparación (4 semanas)

| Semana | Actividad | Responsable |
|--------|-----------|-------------|
| 1 | Aprobación del protocolo por Comité de Ética | Director Médico |
| 1 | Desarrollo de casos de prueba iniciales (30 casos) | Equipo Médico |
| 2 | Configuración de infraestructura de validación | Equipo Técnico |
| 2 | Capacitación de especialistas en proceso de revisión | Director Médico |
| 3 | Prueba piloto con 10 casos | Todos |
| 3 | Ajustes basados en piloto | Todos |
| 4 | Validación final de metodología | Comité Ética |

### Fase 2: Recolección de Datos (8 semanas)

| Semana | Actividad | Objetivo |
|--------|-----------|----------|
| 5-6 | Casos retrospectivos (50 casos) | Análisis de datos históricos |
| 7-8 | Casos prospectivos modo sombra (30 casos) | Validación en tiempo real |
| 9-10 | Casos límite adicionales (20 casos) | Cobertura de edge cases |
| 11-12 | Revisión por especialistas | Evaluación independiente |
| 12 | Consenso y resolución de discrepancias | Acuerdo final |

### Fase 3: Análisis y Reporte (4 semanas)

| Semana | Actividad | Entregable |
|--------|-----------|------------|
| 13 | Análisis estadístico preliminar | Resultados cuantitativos |
| 14 | Análisis cualitativo de casos discrepantes | Categorización de errores |
| 15 | Redacción de reporte final | Documento completo |
| 16 | Revisión por pares y aprobación | Versión final |

### Fase 4: Implementación de Mejoras (variable)

| Actividad | Duración | Trigger |
|-----------|----------|---------|
| Ajustes a algoritmos según resultados | 2-4 semanas | Si sensitividad <95% |
| Nuevas reglas de detección | 1-2 semanas | Si falsos negativos identificados |
| Optimización de mensajes | 1 semana | Si claridad <4/5 |
| Segunda ronda de validación | 4 semanas | Si cambios implementados |

---

## Métricas de Éxito

### Criterios de Aprobación

El sistema será considerado **CLÍNICAMENTE VALIDADO** si cumple TODOS:

1. ✅ Sensibilidad ≥95% (IC 95%: 90-100%)
2. ✅ Especificidad ≥90% (IC 95%: 85-95%)
3. ✅ Cero falsos negativos en emergencias críticas
4. ✅ Tiempo de respuesta <2 segundos en 99% de casos
5. ✅ Concordancia κ ≥0.80 con gold standard
6. ✅ Aprobación por ≥80% de especialistas revisores
7. ✅ Cumplimiento de todos los requisitos éticos

### Criterios de Aprobación Condicional

El sistema puede ser aprobado con **USO RESTRINGIDO** si:

1. ✅ Sensibilidad 90-94%
2. ✅ Especificidad ≥85%
3. ✅ Falsos negativos solo en casos de presentación atípica documentada
4. ✅ Plan de mitigación implementado

### Fallos y Acciones Correctivas

| Condición de Fallo | Acción Requerida |
|--------------------|------------------|
| Sensibilidad <90% | Rediseño completo de algoritmos |
| Falso negativo crítico | Suspensión inmediata, análisis root cause |
| Especificidad <85% | Optimización de umbrales de detección |
| Tiempo >2 segundos | Optimización de performance |
| κ <0.80 | Revisión de criterios de clasificación |

---

## Anexos

### Anexo A: Plantilla de Caso de Validación

[Formato estructurado para documentar casos]

### Anexo B: Cuestionario de Especialista Revisor

[Instrumento de evaluación para especialistas]

### Anexo C: Diccionario de Datos

[Definiciones de todos los campos y códigos]

### Anexo D: Plan de Análisis Estadístico Detallado

[Software, métodos, suposiciones]

---

**Aprobaciones Requeridas:**

- [ ] Director Médico
- [ ] Comité de Ética en Investigación
- [ ] Oficial de Privacidad
- [ ] Director Técnico
- [ ] Legal/Compliance

---

**Documento Controlado:**
- Versión: 1.0.0
- Fecha: 2026-02-09
- Próxima Revisión: 2026-05-09 o según cambios significativos
- Propietario: Director Médico, Doctor.mx
