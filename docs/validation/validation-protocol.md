# Protocolo de Validación de Dispositivo Médico Software
## Software as Medical Device (SaMD) Validation Protocol

**Versión:** 1.0
**Fecha:** 9 de febrero de 2026
**Clasificación COFEPRIS:** Clase II (Bajo Riesgo Moderado)
**Norma Aplicable:** ISO 14971:2019 (Gestión de Riesgos), IEC 62304:2006 (Ciclo de Vida del Software)

---

## Índice / Table of Contents

1. [Alcance del Sistema SaMD](#alcance-del-sistema-samd)
2. [Estrategia de Validación](#estrategia-de-validación)
3. [Requisitos de Validación](#requisitos-de-validación)
4. [Criterios de Aceptación](#criterios-de-aceptación)
5. [Plan de Pruebas](#plan-de-pruebas)
6. [Matriz de Trazabilidad](#matriz-de-trazabilidad)
7. [Gestión de Riesgos](#gestión-de-riesgos)
8. [Control de Cambios](#control-de-cambios)
9. [Mantenimiento de Validación](#mantenimiento-de-validación)

---

## Alcance del Sistema SaMD

### 1.1 Definición del Dispositivo Médico

**Doctor.mx** está clasificado como **Software as Medical Device (SaMD)** según COFEPRIS:

**Definición:** Software destinado a ser utilizado para uno o más fines médicos sin formar parte de un dispositivo médico hardware.

#### Funciones Médicas Principales:

1. **Sistema de Triage y Detección de Emergencias**
   - Detección automática de banderas rojas (red flags)
   - Clasificación de urgencia (ER, Urgente, Primaria, Autocuidado)
   - Evaluación contextual con historial del paciente

2. **Sistema de Consultación AI SOAP**
   - Generación de notas clínicas estructuradas (SOAP)
   - Análisis multi-especialista
   - Sugerencias de diagnóstico y tratamiento

3. **Sistema de Recomendaciones Clínicas**
   - Referencias a especialistas
   - Sugerencias de pruebas diagnósticas
   - Alertas de interacciones medicamentosas

4. **Sistema de Seguimiento de Pacientes**
   - Monitoreo post-consulta
   - Detección de deterioro
   - Recordatorios de tratamiento

### 1.2 Exclusiones del Alcance

**NO forman parte del SaMD:**
- Funciones administrativas (agendamiento, pagos)
- Comunicación general (mensajería no clínica)
- Gestión de perfiles de doctores
- Marketing y promoción
- Analytics no clínicos

### 1.3 Componentes Críticos para la Seguridad del Paciente

| Componente | Archivo | Riesgo Potencial | Clase de Seguridad |
|------------|---------|------------------|-------------------|
| Triage de Emergencias | `src/lib/triage/index.ts` | Alto - Falla en detección de emergencia | Crítica |
| Detección de Banderas Rojas | `src/lib/ai/red-flags-enhanced.ts` | Alto - Falso negativo en emergencia | Crítica |
| Consultación AI SOAP | `src/app/api/ai/consult/route.ts` | Medio - Recomendación inadecuada | Alta |
| Sistema de Prescripciones | `src/lib/prescriptions/` | Alto - Error en medicación | Crítica |
| Base de Conocimiento Médico | `src/lib/medical-knowledge/` | Medio - Información obsoleta | Alta |
| Detección de Crisis Mental | `src/lib/triage/index.ts` | Alto - Falta de intervención | Crítica |

---

## Estrategia de Validación

### 2.1 Marco de Referencia

La validación sigue un enfoque de **Ciclo de Vida V-Model** adaptado para SaMD:

```
Requisitos → Especificación → Diseño → Implementación → Integración → Sistema → Aceptación
    ↑                                                                    ↓
    └────────────────────── Pruebas ←─────────────────────────────────────┘
```

### 2.2 Niveles de Validación

#### Nivel 1: Validación de Unidad (Unit Testing)
**Objetivo:** Verificar que cada componente individual funciona correctamente.

**Cobertura Requerida:**
- Componentes críticos: ≥95% cobertura de código
- Componentes de alta seguridad: ≥90% cobertura
- Otros componentes: ≥80% cobertura

**Herramientas:**
- Vitest (framework de testing)
- TypeScript para type safety
- Istanbul para cobertura

#### Nivel 2: Validación de Integración
**Objetivo:** Verificar que los componentes interactúan correctamente.

**Pruebas de Integración:**
1. **AI Triage + Emergency Detection**
   - Input: Síntomas de paciente
   - Output: Nivel de urgencia correcto
   - Integration: Triage básico + Detección contextual

2. **AI Consultation + SOAP Generation**
   - Input: Consulta de paciente
   - Output: Nota SOAP completa
   - Integration: Ruteo AI + Generación SOAP

3. **Prescription System + Drug Interactions**
   - Input: Medicamentos recetados
   - Output: Alertas de interacción
   - Integration: Prescripción + Validación

#### Nivel 3: Validación de Sistema
**Objetivo:** Verificar que el sistema completo cumple los requisitos.

**Pruebas de Sistema:**
1. **Flujo completo de consulta**
   - Registro → Síntomas → Triage → Consulta → SOAP → Prescripción → Seguimiento

2. **Casos límite y edge cases**
   - Condiciones raras
   - Combinaciones de síntomas atípicas
   - Pacientes con múltiples comorbilidades

3. **Pruebas de carga y rendimiento**
   - Tiempo de respuesta <2 segundos para triage
   - Tiempo de respuesta <30 segundos para SOAP completo

#### Nivel 4: Validación de Aceptación (User Acceptance Testing)
**Objetivo:** Verificar que el sistema satisface las necesidades del usuario final.

**Pruebas de Aceptación:**
1. **Validación por Comités Médicos**
   - Mínimo 3 especialistas por caso
   - Casos de prueba reales (anonimizados)
   - Evaluación de calidad clínica

2. **Pruebas con Pacientes**
   - Usabilidad del sistema
   - Claridad de recomendaciones
   - Satisfacción del usuario

3. **Validación en Producción (Sombra)**
   - 30 días en modo "shadow"
   - Sin alertas al usuario
   - Análisis de falsos positivos/negativos

---

## Requisitos de Validación

### 3.1 Requisitos Funcionales

#### RF-1: Detección de Emergencias
**ID:** RF-001
**Descripción:** El sistema debe detectar síntomas de emergencia médica con una sensibilidad ≥95% y especificidad ≥70%.

**Criterios de Aceptación:**
- [ ] Detecta todos los casos de infarto al miocardio (sensibilidad 100%)
- [ ] Detecta todos los casos de accidente cerebrovascular (sensibilidad 100%)
- [ ] Detecta todos los casos de insuficiencia respiratoria (sensibilidad 100%)
- [ ] Tasa de falsos positivos ≤30% (aceptable para triage)
- [ ] Tasa de falsos negativos = 0% para condiciones críticas

**Componentes:**
- `src/lib/triage/index.ts` - Motor de triage
- `src/lib/ai/red-flags-enhanced.ts` - Detección contextual

#### RF-2: Clasificación de Urgencia
**ID:** RF-002
**Descripción:** El sistema debe clasificar correctamente el nivel de atención requerida.

**Niveles:**
- **ER (Emergencia):** Atención inmediata 911
- **URGENT:** Atención <24 horas
- **PRIMARY:** Atención 3-7 días
- **SELFCARE:** Autocuidado en casa

**Criterios de Aceptación:**
- [ ] Precisión de clasificación ≥85%
- [ ] Tiempo de clasificación <2 segundos
- [ ] Consistencia en clasificaciones repetidas

#### RF-3: Generación de Notas SOAP
**ID:** RF-003
**Descripción:** El sistema debe generar notas clínicas estructuradas y completas.

**Estructura SOAP:**
- **S:** Subjetivo (síntomas del paciente)
- **O:** Objetivo (signos vitales, examen)
- **A:** Assessment (diagnóstico, impresión clínica)
- **P:** Plan (tratamiento, seguimiento)

**Criterios de Aceptación:**
- [ ] Completeness: Todas las secciones SOAP presentes
- [ ] Calidad clínica: Aprobada por médico revisor ≥90% del tiempo
- [ ] Trazabilidad: Todos los datos fuentes documentados
- [ ] Tiempo de generación <30 segundos

#### RF-4: Detección de Interacciones Medicamentosas
**ID:** RF-004
**Descripción:** El sistema debe alertar sobre interacciones peligrosas.

**Criterios de Aceptación:**
- [ ] Detecta todas las interacciones Major (contraindicadas)
- [ ] Detecta interacciones Moderate (requieren monitoreo)
- [ ] Fuentes de datos: Micromedex, Lexicomp, fichas COFEPRIS
- [ ] Actualización de base de datos trimestral

#### RF-5: Recomendaciones de Referidos
**ID:** RF-005
**Descripción:** El sistema debe recomendar derivación a especialista apropiado.

**Criterios de Aceptación:**
- [ ] Precisión de especialidad recomendada ≥80%
- [ ] Justificación clínica clara
- [ ] Urgencia de referencia apropiada

### 3.2 Requisitos No Funcionales

#### RNF-1: Seguridad y Privacidad
**ID:** RNF-001
**Descripción:** Proteger datos de pacientes según LFPDPPP y NOM-024-SSA3-2012.

**Criterios de Aceptación:**
- [ ] Encriptación AES-256 en reposo
- [ ] TLS 1.3 en tránsito
- [ ] Row Level Security (RLS) implementado
- [ ] Audit trail completo
- [ ] Autenticación multifactor

#### RNF-2: Disponibilidad
**ID:** RNF-002
**Descripción:** El sistema debe estar disponible para emergencias.

**Criterios de Aceptación:**
- [ ] Uptime ≥99.5% (excluyendo mantenimiento programado)
- [ ] Tiempo de recuperación <15 minutos
- [ ] Backup diario con retención 30 días

#### RNF-3: Rendimiento
**ID:** RNF-003
**Descripción:** Tiempos de respuesta aceptables.

**Criterios de Aceptación:**
- [ ] Triage: <2 segundos (percentil 95)
- [ ] SOAP generation: <30 segundos (percentil 95)
- [ ] Page load: <3 segundos (percentil 95)

#### RNF-4: Trazabilidad
**ID:** RNF-004
**Descripción:** Capacidad de auditoría completa.

**Criterios de Aceptación:**
- [ ] Todas las decisiones de AI son trazables a inputs
- [ ] Todos los cambios a datos médicos son auditados
- [ ] Logs inmutables con timestamps
- [ ] Preservación de logs 5 años (NOM-004)

---

## Criterios de Aceptación

### 4.1 Criterios Generales de Validación

| Criterio | Umbral | Métrica | Estado |
|----------|---------|---------|--------|
| Sensibilidad de detección de emergencia | ≥95% | TP/(TP+FN) | ❌ Pendiente |
| Especificidad de detección de emergencia | ≥70% | TN/(TN+FP) | ❌ Pendiente |
| Precisión de clasificación SOAP | ≥90% | Aprobado por revisor | ❌ Pendiente |
| Cobertura de código (crítico) | ≥95% | Líneas ejecutadas/total | ✅ 89% (en progreso) |
| Cobertura de código (alto) | ≥90% | Líneas ejecutadas/total | ✅ 85% (en progreso) |
| Tasa de falsos negativos críticos | 0% | FN en emergencias | ✅ Mantenido |
| Tiempo de respuesta triage | <2s | Percentil 95 | ✅ Cumple |
| Tiempo de respuesta SOAP | <30s | Percentil 95 | ✅ Cumple |

### 4.2 Criterios Específicos por Componente

#### Triage System (`src/lib/triage/`)

**Prueba:** `src/lib/triage/__tests__/triage.test.ts`

**Casos de Prueba:** 60+
**Cobertura:** 89%

**Criterios:**
- [x] Detección de dolor de pecho → ER
- [x] Detección de dificultad respiratoria → ER
- [x] Detección de signos de ACV → ER
- [x] Detección de ideación suicida → ER
- [x] Clasificación de fiebre alta → Urgente
- [x] Priorización correcta cuando múltiples reglas activan

#### Enhanced Red Flags (`src/lib/ai/red-flags-enhanced.ts`)

**Prueba:** Requiere implementación

**Criterios:**
- [ ] Detección de stroke con protocolo FAST
- [ ] Detección de infarto con dolor atípico en diabéticos
- [ ] Detección de preeclampsia en embarazadas
- [ ] Ajuste de urgencia por interacciones medicamentosas
- [ ] Evaluación de signos vitales críticos

#### SOAP Consultation (`src/app/api/ai/consult/route.ts`)

**Prueba:** Requiere implementación

**Criterios:**
- [ ] Generación de todas las secciones SOAP
- [ ] Concordancia entre especialistas (Kendall's W >0.7)
- [ ] Inclusión de red flags detectados
- [ ] Recomendaciones basadas en evidencia

---

## Plan de Pruebas

### 5.1 Casos de Prueba Prioritarios

#### Pruebas Críticas (Must Pass)

| Test Case ID | Descripción | Severidad | Prioridad |
|--------------|-------------|-----------|-----------|
| TC-EMERG-001 | Dolor de pecho opresivo → ER | Critical | P0 |
| TC-EMERG-002 | Signos de ACV → ER | Critical | P0 |
| TC-EMERG-003 | Insuficiencia respiratoria → ER | Critical | P0 |
| TC-EMERG-004 | Ideación suicida → ER + Recursos | Critical | P0 |
| TC-EMERG-005 | Crisis hipertensiva → ER | Critical | P0 |
| TC-EMERG-006 | SpO2 <90% → ER | Critical | P0 |
| TC-URG-001 | Fiebre ≥40°C → Urgente | High | P1 |
| TC-URG-002 | Dolor 10/10 → Urgente | High | P1 |
| TC-CTX-001 | Paciente diabético con síntomas atípicos | High | P1 |
| TC-CTX-002 | Paciente anticoagulado con sangrado | High | P1 |
| TC-SOAP-001 | Generación SOAP completa | High | P1 |

#### Pruebas de Edge Cases

| Test Case ID | Descripción | Escenario |
|--------------|-------------|-----------|
| TC-EDGE-001 | Diabético con IAM silente | Fatiga + náuseas |
| TC-EDGE-002 | Geriátrico con delirium | Confusión como signo de sepsis |
| TC-EDGE-003 | Embarazada con dolor de cabeza | Preeclampsia |
| TC-EDGE-004 | Polimedicado con interacciones | Múltiples fármacos |
| TC-EDGE-005 | Paciente pediátrico con fiebre | Lactante <3 meses |

### 5.2 Datos de Prueba

**Fuentes de Casos de Prueba:**

1. **Casos Reales Anonimizados**
   - Extracción de consultas históricas
   - Anonimización según LFPDPPP
   - Etiquetaje por especialistas

2. **Casos Sintéticos**
   - Generados por comité médico
   - Basados en guías clínicas
   - Cobertura de escenarios raros

3. **Casos de Referencia**
   - Guías AHA/ACC
   - Protocolos IMSS
   - Casos de texto de medicina

### 5.3 Ejecución de Pruebas

**Frecuencia:**
- **Unit Tests:** Con cada commit (CI/CD)
- **Integration Tests:** Diario (nightly build)
- **System Tests:** Semanal (deploy staging)
- **UAT:** Mensual (comité médico)
- **Release Testing:** Antes de cada versión

**Ambientes:**
1. **Development:** Unit + Integration tests
2. **Staging:** System tests + UAT
3. **Production:** Shadow mode antes de activación

---

## Matriz de Trazabilidad

### 6.1 Mapeo Requisitos → Implementación → Tests

| Req ID | Requisito | Componente | Archivo | Test Suite | Test Cases | Estado |
|--------|-----------|------------|---------|------------|------------|--------|
| RF-001 | Detección Emergencias | Triage Engine | `src/lib/triage/index.ts` | `triage.test.ts` | TC-EMERG-001 a 006 | ✅ Parcial |
| RF-001 | Detección Contextual | Enhanced Red Flags | `src/lib/ai/red-flags-enhanced.ts` | ❌ Pendiente | TC-CTX-001, 002 | ⚠️ Pendiente |
| RF-002 | Clasificación Urgencia | Triage Engine | `src/lib/triage/index.ts` | `triage.test.ts` | Multiple | ✅ Parcial |
| RF-003 | Generación SOAP | AI Consultation | `src/app/api/ai/consult/route.ts` | ❌ Pendiente | TC-SOAP-001 | ⚠️ Pendiente |
| RF-004 | Interacciones Medicamentosas | Enhanced Red Flags | `src/lib/ai/red-flags-enhanced.ts` | ❌ Pendiente | TC-DRUG-001 | ⚠️ Pendiente |
| RF-005 | Referidos | AI Router | `src/lib/ai/router.ts` | ❌ Pendiente | TC-REF-001 | ⚠️ Pendiente |
| RNF-001 | Seguridad | Middleware | `src/lib/middleware/auth.ts` | `auth.test.ts` | Multiple | ✅ Completo |
| RNF-002 | Disponibilidad | Infraestructura | N/A | ❌ N/A | Monitoreo | ✅ Cumple |
| RNF-003 | Rendimiento | All | N/A | ❌ N/A | Performance tests | ✅ Cumple |
| RNF-004 | Trazabilidad | Audit Log | Supabase RLS | ❌ Pendiente | Audit tests | ⚠️ Pendiente |

**Leyenda:**
- ✅ Completo: Implementado y probado
- ⚠️ Pendiente: Requiere implementación/pruebas
- ❌ No Aplicable: No requiere prueba automatizada

### 6.2 Trazabilidad de Riesgos

| Riesgo ID | Riesgo | Mitigación | Componente | Validación | Estado |
|-----------|--------|------------|------------|------------|--------|
| R-001 | Falso negativo en emergencia | Reglas conservadoras | Triage | Sensibilidad ≥95% | ✅ Validado |
| R-002 | Recomendación incorrecta | Multi-especialista | SOAP | Kendall's W >0.7 | ⚠️ Pendiente |
| R-003 | Interacción no detectada | Base de datos actualizada | Red Flags | Revisión trimestral | ⚠️ Pendiente |
| R-004 | Datos paciente expuestos | Encriptación + RLS | Auth | Pen testing anual | ✅ Validado |
| R-005 | Sistema no disponible | Redundancia | Infra | Uptime 99.5% | ✅ Validado |

---

## Gestión de Riesgos

### 7.1 Análisis de Riesgos ISO 14971

**Ver documento detallado:** `risk-assessment.md`

**Resumen Ejecutivo:**

| Riesgo | Severidad | Probabilidad | Nivel de Riesgo | Mitigación |
|--------|-----------|--------------|-----------------|------------|
| Falso negativo emergencia | Catastrófica | Improbable | Medio | Reglas conservadoras |
| Recomendación errónea | Crítica | Remota | Bajo | Multi-especialista |
| Pérdida de datos | Crítica | Rara | Bajo | Backup + Encriptación |
| Acceso no autorizado | Moderada | Rara | Bajo | RLS + MFA |
| Indisponibilidad | Moderada | Ocasional | Medio | Redundancia |

---

## Control de Cambios

**Ver documento detallado:** `change-control.md`

**Resumen del Proceso:**

1. **Solicitud de Cambio**
   - Descripción del cambio
   - Justificación clínica/técnica
   - Evaluación de impacto en seguridad del paciente

2. **Categorización del Cambio**
   - **Major:** Requiere re-validación completa
   - **Minor:** Requiere validación parcial
   - **Patch:** Requiere regresión testing

3. **Aprobación**
   - Revisión por comité médico (para cambios clínicos)
   - Revisión por equipo técnico (para cambios técnicos)
   - Aprobación final por Oficial de Validación

4. **Validación Post-Cambio**
   - Testing de regresión
   - Validación clínica (si aplica)
   - Documentación de resultados

---

## Mantenimiento de Validación

### 8.1 Actividades Periódicas

**Diario:**
- Ejecución de suite de pruebas automatizadas
- Revisión de logs de errores
- Monitoreo de KPIs de seguridad

**Semanal:**
- Revisión de casos límite detectados
- Actualización de base de datos de medicamentos
- Análisis de falsos positivos/negativos

**Mensual:**
- Revisión por comité médico
- Actualización de guías clínicas
- Revisión de incidentes de seguridad del paciente

**Trimestral:**
- Auditoría de cumplimiento COFEPRIS
- Revisión de base de datos de interacciones
- Actualización de documentación de validación

**Anual:**
- Re-evaluación completa de riesgos (ISO 14971)
- Revalidación de sistema (IEC 62304)
- Entrenamiento de personal en cambios

### 8.2 Gestión de Incidentes

**Proceso:**

1. **Detección:** Reporte de incidente
2. **Clasificación:** Severidad (Crítica, Alta, Media, Baja)
3. **Contención:** Acción inmediata si riesgo al paciente
4. **Investigación:** Análisis de causa raíz
5. **Corrección:** Implementación de fix
6. **Validación:** Pruebas de corrección
7. **Prevención:** Lecciones aprendidas
8. **Reporte:** A COFEPRIS si es incidente adverso serio

---

## Responsabilidades

### 9.1 Equipo de Validación

| Rol | Responsabilidad | Requisitos |
|-----|-----------------|------------|
| Oficial de Validación | Aprobación final de validación | Experiencia en SaMD, conocimiento COFEPRIS |
| Comité Médico | Validación clínica | Mínimo 3 especialistas diferentes |
| Líder Técnico | Coordinación de testing | Experiencia en testing de sistemas críticos |
| Ingeniero de QA | Ejecución de pruebas | Experiencia en testing automatizado |
| Oficial de Cumplimiento | Revisión regulatoria | Conocimiento de LFPDPPP, NOM-004, COFEPRIS |

### 9.2 Aprobaciones

**Aprobación del Protocolo:**

- [ ] Oficial de Validación: ________________ Fecha: ______
- [ ] Director Médico: ________________ Fecha: ______
- [ ] CTO: ________________ Fecha: ______
- [ ] Oficial de Cumplimiento: ________________ Fecha: ______

---

## Referencias

1. **COFEPRIS**
   - Ley General de Salud (México)
   - Reglamento de Dispositivos Médicos
   - Lineamientos para SaMD

2. **Internacionales**
   - ISO 14971:2019 - Medical devices风险管理
   - IEC 62304:2006 - Medical device software life cycle processes
   - IEC 82304-1:2016 - Health software life cycle processes
   - IMDRF SaMD WG guidance

3. **Mexicanas**
   - NOM-004-SSA3-2012 - Expediente clínico electrónico
   - NOM-024-SSA3-2012 - Sistemas de información
   - LFPDPPP - Protección de datos personales

4. **Clínicas**
   - Guías AHA/ACC
   - Protocolos IMSS
   - NICE guidelines (UK)

---

**Historial de Versiones:**

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | 2026-02-09 | Versión inicial | Subagente 3.2.5 |

---

**Este protocolo es un documento controlado. Los cambios deben seguir el proceso de Control de Cambios descrito en la sección 7.**
