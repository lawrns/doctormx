# Sistema de Detección de Emergencias Médicas / Medical Emergency Detection System

**Última actualización:** 2026-02-09
**Versión:** 1.0.0
**Estado:** Producción

---

## Índice / Table of Contents

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Explicación de la Lógica Médica](#explicación-de-la-lógica-médica)
3. [Definiciones de Patrones](#definiciones-de-patrones)
4. [Criterios de Clasificación de Urgencia](#criterios-de-clasificación-de-urgencia)
5. [Requisitos de Validación Clínica](#requisitos-de-validación-clínica)
6. [Integración Técnica](#integración-técnica)
7. [Recursos de Salud Mental](#recursos-de-salud-mental)
8. [Referencias y Fuentes](#referencias-y-fuentes)

---

## Resumen Ejecutivo

### Español
El Sistema de Detección de Emergencias de Doctor.mx es un sistema de triaje médico automatizado que evalúa los síntomas de los pacientes y determina el nivel de atención requerido. Utiliza un enfoque de dos capas:

1. **Detección de Banderas Rojas (Red Flags)**: Evaluación basada en reglas para síntomas críticos
2. **Análisis Mejorado con Contexto del Paciente**: Detección contextual que considera condiciones médicas preexistentes, medicamentos y signos vitales

El sistema prioriza la seguridad del paciente por encima de todo, con una filosofía de "mejor false positive que false negative" en la detección de emergencias.

### English
The Doctor.mx Emergency Detection System is an automated medical triage system that evaluates patient symptoms and determines the required level of care. It uses a two-layer approach:

1. **Red Flag Detection**: Rule-based evaluation for critical symptoms
2. **Enhanced Context-Aware Detection**: Contextual detection considering pre-existing medical conditions, medications, and vital signs

The system prioritizes patient safety above all, with a philosophy of "better false positive than false negative" in emergency detection.

---

## Explicación de la Lógica Médica

### Arquitectura del Sistema / System Architecture

#### Capa 1: Detección de Banderas Rojas (Red Flags)

**Ubicación:** `src/lib/triage/index.ts`

Esta capa implementa una evaluación basada en reglas YAML embebidas que detectan patrones de síntomas críticos. Las reglas se evalúan en orden de prioridad, y la acción más severa prevalece.

**Características clave:**
- Evaluación de texto en español e inglés
- Análisis de signos vitales (SpO2, frecuencia cardíaca, presión arterial)
- Consideración de estado de embarazo
- Puntuación de severidad (0-100)

**Ejemplo de flujo:**
```
Input: "Tengo dolor de pecho y dificultad para respirar"
  ↓
Evaluación de reglas:
  - chest_pain_emergency → ER ✓
  - breathing_emergency → ER ✓
  ↓
Output: CareLevel=ER, Severity=100
```

#### Capa 2: Detección Mejorada con Contexto del Paciente

**Ubicación:** `src/lib/ai/red-flags-enhanced.ts`

Esta capa extiende la detección básica incorporando:

1. **Contexto de Condiciones Médicas:** Ajusta la urgencia basándose en condiciones preexistentes
2. **Interacciones Medicamentosas:** Detecta combinaciones peligrojas de síntomas-medicamentos
3. **Signos Vitales:** Evaluación automática de umbrales críticos
4. **Consideraciones Específicas por Edad:** Reglas especiales para pediatría y geriatría

**Ejemplo de flujo contextual:**
```
Input: "Tengo sangrado nasal"
Patient Context:
  - Medications: ["Warfarina"]
  ↓
Evaluación:
  - Sangrado basal: Urgency 3
  - + Warfarina interaction: +2 urgency
  ↓
Output: Urgency 5 (HIGH), Alert: "Paciente en anticoagulación"
```

### Proceso de Evaluación / Evaluation Process

```typescript
// Pseudocódigo del flujo de evaluación
function evaluateEmergency(patientInput: PatientInput): TriageResult {
  // Paso 1: Detección de banderas rojas básicas
  const basicFlags = evaluateRedFlags(patientInput.message);

  // Paso 2: Enriquecimiento con contexto del paciente
  const enhancedFlags = detectRedFlagsEnhanced(
    patientInput.message,
    patientInput.context  // conditions, medications, vitals
  );

  // Paso 3: Determinación de nivel de cuidado
  const careLevel = determineCareLevel(basicFlags, enhancedFlags);

  // Paso 4: Generación de recomendaciones
  const recommendations = generateRecommendations(careLevel);

  return {
    triggered: true,
    action: careLevel,
    severity: calculateSeverity(careLevel),
    recommendations: recommendations
  };
}
```

---

## Definiciones de Patrones

### Patrones Críticos (Emergencia 911 Inmediata)

#### Cardíacos / Cardiac

**Español:**
- "Dolor de pecho opresivo que se irradia al brazo"
- "Sensación de que me voy a morir"
- "Dolor torácico con dificultad para respirar"

**English:**
- "Crushing chest pain radiating to arm"
- "Feeling like I'm going to die"
- "Chest pain with shortness of breath"

**Patrón RegExp:** `/dolor.*pecho.*opresivo|dolor.*pecho.*brazo|angina|siento.*que.*me.*muero|chest.*pain|pressure.*chest|heart.*attack/i`

#### Neurológicos (ACV/Stroke) / Neurological (Stroke)

**Español:**
- "Cara caída" o "parálisis facial"
- "Dificultad para hablar o palabras enredadas"
- "Debilidad o incapacidad para levantar el brazo"

**English:**
- "Face drooping" or "facial paralysis"
- "Slurred speech or trouble speaking"
- "Arm weakness or inability to raise arm"

**Patrón RegExp:** `/paralisis|cara.*colgada|cara.*caida|brazo.*no.*puede.*levantar|slurred.*speech|cant.*speak|face.*drooping/i`

**Protocolo FAST implementado:**
- **F**acial (Cara)
- **A**rms (Brazos)
- **S**peech (Habla)
- **T**ime (Tiempo = llamar emergencias)

#### Respiratorios Severos / Severe Respiratory

**Español:**
- "No puedo respirar"
- "Me estoy ahogando"
- "Labios o cara azulada"

**English:**
- "Can't breathe"
- "Choking"
- "Blue lips or face"

**Patrón RegExp:** `/no.*puedo.*respirar|ahogo.*severo|labios.*azules|cant.*breathe|blue.*lips|cyanosis/i`

#### Salud Mental / Mental Health

**Español:**
- "Quiero morir"
- "Pensamientos suicidas"
- "Quiero quitarme la vida"

**English:**
- "I want to die"
- "Suicidal thoughts"
- "Want to end my life"

**Patrón RegExp:** `/quiero.*morir|pensamientos.*suicidio|quitarme.*vida|want.*die|suicidal/i`

**Acción inmediata:** Mostrar recursos de línea de crisis (Línea de la Vida: 800 911 2000)

### Patrones de Alta Urgencia

#### Fiebre Alta / High Fever

- **Umbral:** ≥40°C (104°F)
- **Acción:** Atención urgente en 2-4 horas
- **Excepción:** Fiebre en lactante <3 meses → Emergencia inmediata

#### Dolor Severo / Severe Pain

- **Umbral:** 10/10 en escala de dolor
- **Descripciones:** "El peor dolor de mi vida", "insoportable"

#### Signos Vitales Críticos / Critical Vital Signs

| Parámetro | Umbral Crítico | Acción |
|-----------|----------------|--------|
| SpO2 | <90% | Emergencia 911 |
| SpO2 | 90-92% | Urgencias 2-4 horas |
| Presión Arterial | ≥180/120 mmHg | Crisis hipertensiva - Urgencias |
| Frecuencia Cardíaca | >120 lpm | Taquicardia - Evaluación urgente |
| Temperatura | ≥40°C | Hipertermia - Urgencias |

### Patrones Moderados

- Dolor abdominal con signos de irritación peritoneal
- Trauma craneoencefálico con pérdida de conciencia
- Sangrado vaginal en embarazada
- Dolor de cabeza de inicio súbito ("thunderclap")

---

## Criterios de Clasificación de Urgencia

### Niveles de Cuidado / Care Levels

#### 1. EMERGENCIA (ER)
**Severity Score:** 100
**Tiempo de atención:** Inmediato (llamar 911)
**Color:** Rojo (#DC2626)

**Criterios:**
- Riesgo inminente de muerte o daño permanente
- Signos vitales críticos
- Síntomas de infarto, ACV, paro respiratorio

**Ejemplos:**
- Dolor de pecho con características cardíacas
- Signos de accidente cerebrovascular (FAST positivo)
- Pérdida de conciencia
- SpO2 < 90%

**Recomendaciones automáticas:**
```
🚨 EMERGENCIA: Busca atención médica inmediata
- Llama al 911 o acude a urgencias
- No conduzcas tú mismo si es posible
- Si hay signos de infarto: mastica una aspirina mientras esperas ayuda
```

#### 2. URGENTE
**Severity Score:** 60
**Tiempo de atención:** <24 horas
**Color:** Naranja (#F59E0B)

**Criterios:**
- Requiere evaluación médica pronto
- Riesgo de deterioro si no se trata
- No es inmediatamente peligroso para la vida

**Ejemplos:**
- Fiebre alta persistente (>39°C por >48h)
- Dolor severo (10/10)
- Signos de infección grave
- Deshidratación severa

**Recomendaciones automáticas:**
```
⚠️ Consulta médica recomendada en las próximas 24 horas
- Monitorea tus síntomas de cerca
- Si los síntomas empeoran, acude a urgencias
- Puedes agendar una consulta con un especialista aquí
```

#### 3. ATENCIÓN PRIMARIA
**Severity Score:** 30
**Tiempo de atención:** 3-7 días
**Color:** Azul (#3B82F6)

**Criterios:**
- Problemas médicos no urgentes
- Síntomas crónicos o recurrentes
- Consultas de rutina o seguimiento

**Ejemplos:**
- Dolor de espalda crónico
- Problemas dermatológicos leves
- Chequeos preventivos

**Recomendaciones automáticas:**
```
📋 Agenda una consulta médica regular
- Tus síntomas no son urgentes pero deben evaluarse
- Mientras tanto, puedes tomar medidas de autocuidado
- Un médico general puede ayudarte a determinar si necesitas un especialista
```

#### 4. AUTOCUIDADO
**Severity Score:** 10
**Tiempo de atención:** Electivo
**Color:** Verde (#10B981)

**Criterios:**
- Condiciones menores que pueden manejarse en casa
- Síntomas leves autolimitados
- No requiere intervención médica inmediata

**Ejemplos:**
- Resfriado común leve
- Pequeñas heridas superficiales
- Malestar general leve

**Recomendaciones automáticas:**
```
🏠 Puedes manejar esto en casa
- Descansa y mantente hidratado
- Si los síntomas persisten más de 3 días, consulta a un médico
- Puedes usar medicamentos de venta libre según sea apropiado
```

### Sistema de Puntuación de Urgencia

El sistema calcula un **Urgency Score (1-10)** basándose en:

1. **Severidad base del síntoma** (1-10)
2. **Ajustes por condiciones preexistentes** (+0 a +3)
3. **Interacciones medicamentosas** (+0 a +2)
4. **Signos vitales anormales** (+0 a +3)

**Tabla de Conversión:**

| Urgency Score | Nivel | Acción |
|--------------|-------|--------|
| 9-10 | EMERGENCIA CRÍTICA | Llamar 911 INMEDIATAMENTE |
| 7-8 | EMERGENCIA | Acudir a urgencias inmediatamente |
| 5-6 | URGENTE | Acudir a urgencias o consultar hoy |
| 3-4 | CONSULTA PRONTO | Consultar en 24 horas |
| 1-2 | NO URGENTE | Consulta electiva |

---

## Requisitos de Validación Clínica

### Validación de Banderas Rojas / Red Flag Validation

Todos los patrones de detección de emergencias deben cumplir con:

#### 1. Evidencia Clínica

Cada patrón de bandera roja debe estar respaldado por:
- **Guías clínicas internacionales** (ACC/AHA, AHA/ASA, NICE, etc.)
- **Literatura médica revisada por pares**
- **Consenso de especialistas**

**Ejemplo - Dolor de Pecho:**
```
Fuente: "2013 ACCF/AHA Guideline for the Management of ST-Elevation
Myocardial Infarction" - Circulation, 2013

Justificación: El dolor torácico isquémico clásico se presenta como
opresión retroesternal que puede irradiarse a brazos, mandíbula o espalda.
La identificación temprana reduce la mortalidad en 50%.
```

#### 2. Sensibilidad y Especificidad

Los patrones deben optimizar:
- **Sensibilidad > 95%**: Capturar todos los casos verdaderos de emergencia
- **Especificidad > 70%**: Minimizar falsas positivos razonablemente

**Compromiso aceptado:** Mejor sobre-triajar (falso positivo) que sub-triajar (falso negativo)

#### 3. Prueba de Concepto Clínica

Cada nuevo patrón debe pasar por:

1. **Revisión por comité médico**: Mínimo 3 especialistas
2. **Casos de prueba**: 50+ casos de validación
3. **Análisis de falsos positivos/negativos**: Documentación de edge cases
4. **Periodo de observación**: 30 días en modo "sombra" (sin alertas al usuario)

### Integraciones con Medicamentos / Medication Interactions

Las interacciones medicamentos-síntomas están validadas por:

- **Micromedex® Drug Interactions**
- **Lexicomp® Drug Reference**
- **Ficha técnica oficial** (COFEPRIS para México)

**Ejemplo - Warfarina y Sangrado:**
```
Interacción: Warfarina + Sangrado espontáneo
Severidad: Major (Contraindicación)
Evidencia: Nivel A (Estudios controlados bien diseñados)
Acción: INR urgente, reversión con vitamina K si INR > 5
```

### Consideraciones Especiales

#### Pediatria / Pediatrics

Los siguientes ajustes se aplican automáticamente:

| Edad | Ajuste de Umbral | Ejemplo |
|------|------------------|---------|
| <3 meses | Temperatura >38°C → Emergencia | Infección neonatal |
| 3-36 meses | Temperatura >39°C → Urgente | Fiebre alta en lactante |
| >65 años | Umbral de confusión reducido | Delirium como signo de sepsis |

#### Embarazo / Pregnancy

Sistema de detección especializada para:
- Preeclampsia (dolor de cabeza + visión borrosa + edema)
- Desprendimiento de placenta (sangrado vaginal + dolor)
- Trabajo de parto pretérmino (<37 semanas)

#### Geriatría / Geriatrics

Ajustes automáticos:
- Presentación atípica de IAM (confusión, sin dolor torácico)
- Umbral reducido para caídas
- Consideración de polifarmacia (≥5 medicamentos)

### Documentación de Casos Límite

Todos los casos dudosos deben documentarse en:

**Archivo:** `src/lib/ai/red-flags-enhanced.test.ts`

```typescript
// Caso límite: Dolor atípico en diabético
const edgeCase = {
  description: "Diabético con IAM silente",
  input: "Me siento cansado y con náuseas",
  context: {
    conditions: ["diabetes", "hypertension"],
    medications: ["metformina", "enalapril"]
  },
  expected: "URGENT", // No ER pero sí alta urgencia
  reasoning: "Los diabéticos pueden presentar IAM silente.
  Fatiga + náuseas en diabético hipertenso = urgencia cardiaca"
};
```

---

## Integración Técnica

### Archivos Principales

```
src/
├── lib/
│   ├── triage/
│   │   ├── index.ts                    # Motor de triaje principal
│   │   └── __tests__/
│   │       └── triage.test.ts          # Suite de pruebas
│   ├── ai/
│   │   ├── red-flags-enhanced.ts       # Detección con contexto
│   │   ├── constants/
│   │   │   └── ai.ts                   # Constantes de emergencia
│   │   └── prompts.ts                  # Prompts del sistema AI
│   └── medical-knowledge/
│       └── index.ts                    # Base de conocimiento médico
└── components/
    └── EmergencyAlert.tsx              # UI de alerta de emergencia
```

### API Endpoints

```
POST /api/ai/consult
{
  "messages": [
    {"role": "user", "content": "Tengo dolor de pecho"}
  ],
  "patientId": "uuid"
}

→ Response:
{
  "message": "⚠️ ALERTA: Se detectaron síntomas de EMERGENCIA...",
  "urgency": "emergency",
  "redFlags": ["chest_pain_emergency"],
  "recommendations": ["Llame al 911..."]
}
```

### Flujo de Integración

```typescript
// 1. Detectar emergencia en pre-consulta
import { evaluateRedFlags } from '@/lib/triage';

const triageResult = evaluateRedFlags({
  message: userMessage,
  intake: {
    isPregnant: patient.isPregnant,
    vitals: latestVitals
  }
});

// 2. Mostrar alerta si es emergencia
if (triageResult.action === 'ER') {
  showEmergencyAlert({
    severity: 'critical',
    message: triageResult.reasons[0],
    symptoms: extractSymptoms(userMessage)
  });

  // Bloquear flujo normal
  return;
}

// 3. Si no es emergencia, continuar con IA
const aiResponse = await aiChatCompletion({
  messages: conversationHistory
});
```

### Métricas y Monitoreo

**KPIs Monitoreados:**

| Métrica | Umbral | Alerta |
|---------|--------|--------|
| Tiempo de detección | <2 segundos | Warning |
| Tasa de falsos positivos | <30% | Info |
| Tasa de falsos negativos | 0% | Critical |
| Precisión de clasificación | >85% | Warning |

---

## Recursos de Salud Mental

### Líneas de Crisis México / Crisis Lines Mexico

El sistema muestra automáticamente estos recursos cuando detecta ideación suicida:

```
📞 Línea de la Vida: 800 911 2000 (24/7, gratuita)
📞 SAPTEL: 55 5259 8121 (24/7)
📞 Línea de Crisis: 800 290 0024
💬 Chat de apoyo disponible en nuestra plataforma
```

**Implementación:**
```typescript
import { isMentalHealthCrisis, getMentalHealthResources } from '@/lib/triage';

if (isMentalHealthCrisis(userMessage)) {
  const resources = getMentalHealthResources();
  // Mostrar recursos prominentemente
  // Notificar a equipo de intervención
}
```

### Palabras Clave Detectadas

**Español:**
- "Quiero morir"
- "Suicidarme"
- "Matarme"
- "No quiero vivir"
- "Acabar con mi vida"
- "Autolesión"
- "Cortarme"

**English:**
- "Want to die"
- "Kill myself"
- "End my life"
- "Suicide"
- "Self-harm"

---

## Referencias y Fuentes

### Guías Clínicas Utilizadas

1. **American Heart Association (AHA)**
   - "2023 AHA/ACC Guideline for the Management of Heart Failure"
   - "2021 AHA/ASA Guideline for the Prevention of Stroke in Patients With Stroke and TIA"

2. **American College of Emergency Physicians (ACEP)**
   - "Clinical Policy: Critical Issues in the Diagnosis and Management of the Adult Psychiatric Patient in the Emergency Department"

3. **Instituto Mexicano del Seguro Social (IMSS)**
   - "Guía de Práctica Clínica: Diagnóstico y Tratamiento de la Urgencia Hipertensiva en el Adulto"

4. **World Health Organization (WHO)**
   - "Mental Health Gap Action Programme (mhGAP)"

### Fuentes de Interacciones Medicamentosas

1. **Micromedex® Solutions** (IBM Watson Health)
2. **Lexicomp®** (Wolters Kluwer)
3. **DrugBank** (University of Alberta)
4. **Fichas Técnicas COFEPRIS**

### Estándares de Codificación

- **ICD-10:** Clasificación Internacional de Enfermedades
- **SNOMED CT:** Terminología clínica sistemática
- **LOINC:** Identificadores de observación clínica

---

## Anexos

### A. Glosario Bilingüe

| Español | English |
|---------|---------|
| Banderas rojas | Red flags |
| Triaje | Triage |
| Signos vitales | Vital signs |
| Saturación de oxígeno | Oxygen saturation |
| Presión arterial | Blood pressure |
| Crisis hipertensiva | Hypertensive crisis |
| Accidente cerebrovascular | Stroke/CVA |
| Infarto al miocardio | Myocardial infarction |
| Ideación suicida | Suicidal ideation |

### B. Checklists de Validación

**Antes de Activar Nuevo Patrón:**

- [ ] Revisión por 3+ especialistas
- [ ] Evidencia clínica documentada
- [ ] Casos de prueba pasados (50+)
- [ ] Pruebas de edge cases
- [ ] Documentación bilingüe
- [ ] Tests automatizados actualizados
- [ ] Revisión legal/compliance
- [ ] Periodo de observación completado

### C. Contacto de Soporte Clínico

Para preguntas sobre el sistema de detección de emergencias:

- **Equipo Médico:** clinical@doctormx.com
- **Ingeniería:** engineering@doctormx.com
- **Emergencias del Sistema:** oncall@doctormx.com

---

**Aviso Legal / Legal Notice:** Este documento es para fines informativos y educativos. No constituye consejo médico. En caso de emergencia médica real, siempre llame al 911 o acuda al servicio de urgencias más cercano.

**© 2026 Doctor.mx - Todos los derechos reservados**
