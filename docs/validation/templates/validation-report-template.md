# Plantilla de Reporte de Validación
## Validation Report Template for SaMD

**Referencia:** VR-YYYY-XXX
**Fecha de Reporte:** DD/MM/YYYY
**Versión del Sistema:** X.Y.Z
**Periodo de Validación:** DD/MM/YYYY - DD/MM/YYYY

---

## 1. Información General

### 1.1 Identificación del Dispositivo

| Campo | Valor |
|-------|-------|
| **Nombre del Dispositivo** | Doctor.mx - Software as Medical Device |
| **Clasificación COFEPRIS** | Clase II (Bajo Riesgo Moderado) |
| **Tipo de Software** | SaMD - Sistema de Triage y Consulta AI |
| **Versión Validada** | X.Y.Z |
| **Fabricante** | Doctor.mx S.A. de C.V. |
| **Lugar de Fabricación** | México |

### 1.2 Propósito de la Validación

[Describir el propósito específico de esta validación]

**Ejemplos:**
- Validación inicial del sistema (pre-lanzamiento)
- Validación de cambio mayor
- Re-validación periódica
- Validación post-corrección

### 1.3 Alcance de la Validación

**Componentes Incluidos:**
- [ ] Triage Engine (`src/lib/triage/`)
- [ ] Enhanced Red Flags (`src/lib/ai/red-flags-enhanced.ts`)
- [ ] SOAP Generator (`src/lib/soap/`)
- [ ] AI Consultation (`src/app/api/ai/consult/route.ts`)
- [ ] Medical Knowledge (`src/lib/medical-knowledge/`)
- [ ] Medication Interactions
- [ ] Referral System
- [ ] Otro: _______________

**Componentes Excluidos:**
[Listar componentes excluidos con justificación]

---

## 2. Resumen Ejecutivo

### 2.1 Conclusiones Generales

[Resumen de hallazgos principales]

### 2.2 Estado de Cumplimiento

| Aspecto | Estado | Comentarios |
|---------|--------|-------------|
| Funcionalidad | ✅ Pass / ⚠️ Conditional / ❌ Fail | |
| Seguridad del Paciente | ✅ Pass / ⚠️ Conditional / ❌ Fail | |
| Performance | ✅ Pass / ⚠️ Conditional / ❌ Fail | |
| Usabilidad | ✅ Pass / ⚠️ Conditional / ❌ Fail | |
| Seguridad Datos | ✅ Pass / ⚠️ Conditional / ❌ Fail | |

### 2.3 Recomendación

[Recomendación final: Aprobar / Aprobar condicionalmente / No aprobar]

---

## 3. Metodología de Validación

### 3.1 Normas y Guías Aplicadas

- [ ] ISO 14971:2019 - Gestión de Riesgos
- [ ] IEC 62304:2006 - Ciclo de Vida del Software
- [ ] IEC 82304-1:2016 - Health Software
- [ ] COFEPRIS SaMD Guidelines
- [ ] NOM-004-SSA3-2012 - Expediente Clínico
- [ ] NOM-024-SSA3-2012 - Sistemas de Información

### 3.2 Tipos de Validación Realizadas

| Tipo | Descripción | Cobertura |
|------|-------------|-----------|
| Unit Testing | Pruebas de componentes individuales | __% |
| Integration Testing | Pruebas de integración de componentes | __% |
| System Testing | Pruebas de sistema completo | __% |
| Clinical Validation | Validación por especialistas | __ casos |
| Performance Testing | Pruebas de rendimiento | N/A |
| Security Testing | Pruebas de seguridad | N/A |

### 3.3 Ambientes de Prueba

| Ambiente | Propósito | Configuración |
|----------|-----------|---------------|
| Development | Desarrollo inicial | Local |
| Staging | Pre-producción | Cloud idéntico a prod |
| Production | Validación final (shadow) | Producción |

---

## 4. Resultados de Validación

### 4.1 Requisitos Funcionales

| Req ID | Descripción | Estado | Evidencia | Comentarios |
|--------|-------------|--------|-----------|-------------|
| RF-001 | Detección de Emergencias | ✅ / ⚠️ / ❌ | | |
| RF-002 | Clasificación de Urgencia | ✅ / ⚠️ / ❌ | | |
| RF-003 | Generación SOAP | ✅ / ⚠️ / ❌ | | |
| RF-004 | Interacciones Medicamentosas | ✅ / ⚠️ / ❌ | | |
| RF-005 | Referidos | ✅ / ⚠️ / ❌ | | |
| RF-006 | Crisis Salud Mental | ✅ / ⚠️ / ❌ | | |
| RF-007 | Detección Contextual | ✅ / ⚠️ / ❌ | | |
| RF-008 | Signos Vitales | ✅ / ⚠️ / ❌ | | |

**Leyenda:**
- ✅ Pass: Cumple criterios de aceptación
- ⚠️ Conditional: Cumple con observaciones
- ❌ Fail: No cumple criterios de aceptación

### 4.2 Requisitos No Funcionales

| Req ID | Descripción | Métrica | Objetivo | Actual | Estado |
|--------|-------------|---------|----------|--------|--------|
| RNF-001 | Seguridad Datos | N/A | N/A | N/A | ✅ / ⚠️ / ❌ |
| RNF-002 | Disponibilidad | Uptime % | ≥99.5% | __% | ✅ / ⚠️ / ❌ |
| RNF-003 | Rendimiento | Response time | <30s | __s | ✅ / ⚠️ / ❌ |
| RNF-004 | Trazabilidad | Coverage % | 100% | __% | ✅ / ⚠️ / ❌ |

### 4.3 Casos de Prueba

#### Priority 0 (Critical)

| Test ID | Descripción | Resultado | Tiempo | Evidencia |
|---------|-------------|-----------|--------|-----------|
| TC-EMERG-001 | Dolor pecho → ER | ✅ / ❌ | __ms | |
| TC-EMERG-002 | ACV → ER | ✅ / ❌ | __ms | |
| TC-EMERG-003 | Insuf. respiratoria → ER | ✅ / ❌ | __ms | |
| TC-EMERG-004 | Ideación suicida → ER | ✅ / ❌ | __ms | |
| TC-EMERG-005 | Crisis hipertensiva → ER | ✅ / ❌ | __ms | |
| TC-EMERG-006 | SpO2 <90% → ER | ✅ / ❌ | __ms | |

**Summary P0:**
- Total: __ tests
- Passed: __ (__%)
- Failed: __ (__%)

#### Priority 1 (High)

| Test ID | Descripción | Resultado | Tiempo | Evidencia |
|---------|-------------|-----------|--------|-----------|
| TC-URG-001 | Fiebre alta → Urgent | ✅ / ❌ | __ms | |
| TC-CTX-001 | Diabético IAM silente | ✅ / ❌ | __ms | |
| TC-DRUG-001 | Warfarina + sangrado | ✅ / ❌ | __ms | |
| TC-SOAP-001 | Generación SOAP | ✅ / ❌ | __s | |

**Summary P1:**
- Total: __ tests
- Passed: __ (__%)
- Failed: __ (__%)

### 4.4 Cobertura de Código

| Componente | Líneas | Líneas Ejecutadas | Cobertura | Estado |
|------------|--------|-------------------|-----------|--------|
| Triage Engine | __ | __ | __% | ✅ / ⚠️ / ❌ |
| Red Flags Enhanced | __ | __ | __% | ✅ / ⚠️ / ❌ |
| SOAP Generator | __ | __ | __% | ✅ / ⚠️ / ❌ |
| **Total** | __ | __ | __% | ✅ / ⚠️ / ❌ |

---

## 5. Validación Clínica

### 5.1 Revisión por Comité Médico

**Comité:**
- Dr./Dra. _______________, Especialidad: _____________
- Dr./Dra. _______________, Especialidad: _____________
- Dr./Dra. _______________, Especialidad: _____________

**Casos Evaluados:**
- Total de casos: __
- Casos reales (anonimizados): __
- Casos sintéticos: __
- Casos de texto: __

**Resultados:**

| Métrica | Resultado | Objetivo | Estado |
|---------|-----------|----------|--------|
| Aprobación clínica | __% | ≥90% | ✅ / ⚠️ / ❌ |
| Precisión diagnóstica | __% | ≥85% | ✅ / ⚠️ / ❌ |
| Seguridad del paciente | 0 incidentes | 0 | ✅ / ⚠️ / ❌ |

**Comentarios del Comité:**
[Espacio para comentarios de los revisores clínicos]

### 5.2 Casos de Estudio Clínicos

#### Caso 1: [Título del caso]

**Presentación:**
[Descripción del caso clínico]

**Evaluación del Sistema:**
- Input del sistema: [Síntomas presentados]
- Output del sistema: [Clasificación, diagnóstico]
- Evaluación del experto: [Acorde / No acorde]

**Lecciones Aprendidas:**
[Hallazgos de este caso]

[Repetir para casos adicionales]

---

## 6. Gestión de Riesgos

### 6.1 Análisis de Riesgos ISO 14971

**Resumen:**

| Riesgo ID | Peligro | Severidad | Probabilidad | Nivel Riesgo | Mitigación | Riesgo Residual |
|-----------|---------|-----------|--------------|--------------|------------|-----------------|
| R-001 | Falso negativo emergencia | Catastrófica | Improbable | Medio | Reglas conservadoras | Bajo |
| R-002 | Recomendación errónea | Crítica | Remota | Bajo | Multi-especialista | Bajo |
| R-003 | Interacción no detectada | Crítica | Rara | Bajo | DB actualizada | Bajo |

**Conclusión de Riesgo:**
[Resumen de evaluación de riesgos]

### 6.2 Incidentes Durante Validación

**Incidentes Reportados:**
- Total: __
- Críticos: __
- Altos: __
- Medios: __
- Bajos: __

**Análisis de Incidentes:**

| Incidente ID | Descripción | Severidad | Resolución | Estado |
|--------------|-------------|-----------|------------|--------|
| INC-YYYY-XXX | [Descripción] | [Crítico/Alto/Medio/Bajo] | [Acción tomada] | [Cerrado/Abierto] |

---

## 7. Desviaciones y No Conformidades

### 7.1 Desviaciones Documentadas

| Desviación ID | Descripción | Impacto | Acción Correctiva | Estado |
|---------------|-------------|---------|-------------------|--------|
| DEV-001 | [Descripción] | [Alto/Medio/Bajo] | [Acción] | [Abierta/Cerrada] |

### 7.2 Observaciones

[Listar observaciones que no constituyen no conformidades pero deben ser monitoreadas]

---

## 8. Configuración del Sistema Validado

### 8.1 Versiones de Componentes

| Componente | Versión | Hash Commit | Fecha |
|------------|---------|-------------|-------|
| Triage Engine | X.Y.Z | ___________ | DD/MM |
| Red Flags Enhanced | X.Y.Z | ___________ | DD/MM |
| SOAP Generator | X.Y.Z | ___________ | DD/MM |
| Medical Knowledge | YYYY.MM | ___________ | DD/MM |

### 8.2 Dependencias Externas

| Dependencia | Versión | Propósito |
|-------------|---------|-----------|
| OpenAI API | __ | AI model |
| Supabase | __ | Database |
| Vercel | __ | Hosting |

### 8.3 Base de Datos Médica

| Fuente | Versión | Fecha Actualización |
|--------|---------|---------------------|
| Medical Knowledge DB | YYYY.MM | DD/MM/YYYY |
| Drug Interactions DB | YYYY.MM | DD/MM/YYYY |

---

## 9. Entrenamiento y Calificación

### 9.1 Personal Entrenado

| Rol | Persona | Entrenamiento Completado | Evidencia |
|-----|---------|-------------------------|-----------|
| Oficial de Validación | | [ ] Sí / [ ] No | |
| Comité Médico | | [ ] Sí / [ ] No | |
| Desarrollo | | [ ] Sí / [ ] No | |
| QA | | [ ] Sí / [ ] No | |

### 9.2 Documentación Revisada

- [ ] Protocolo de Validación
- [ ] Matriz de Trazabilidad
- [ ] Procedimientos de Control de Cambios
- [ ] Evaluación de Riesgos
- [ ] Manuales de Usuario
- [ ] Documentación Técnica

---

## 10. Conclusiones y Recomendaciones

### 10.1 Resumen de Hallazgos

[Resumen de los hallazgos más importantes de la validación]

### 10.2 Recomendación Final

Basado en los resultados de la validación, el sistema:

**[ ] APROBADO** para uso en producción

**[ ] APROBADO CONDICIONALMENTE** con las siguientes condiciones:
1. [Condiciones específicas]
2. [Condiciones específicas]

**[ ] NO APROBADO** por las siguientes razones:
1. [Razones específicas]
2. [Razones específicas]

### 10.3 Próximos Pasos

[Listar acciones requeridas siguientes, si aplica]

---

## 11. Aprobaciones

### 11.1 Aprobación del Reporte

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Oficial de Validación | | | DD/MM/YYYY |
| Director Médico | | | DD/MM/YYYY |
| CTO | | | DD/MM/YYYY |
| Oficial de Cumplimiento | | | DD/MM/YYYY |

### 11.2 Distribución del Reporte

**Copia enviada a:**
- [ ] Archivo de Validación
- [ ] Oficial de Cumplimiento
- [ ] Dirección Médica
- [ ] COFEPRIS (si aplica)

---

## 12. Anexos

### Anexo A: Casos de Prueba Completos
[Detalles de casos de prueba si no se incluyeron arriba]

### Anexo B: Resultados de Comité Médico
[Transcripción de revisión del comité]

### Anexo C: Análisis de Riesgos Completo
[ISO 14971 risk analysis details]

### Anexo D: Evidencias de Pruebas
[Screenshots, logs, outputs]

---

**Historial de Revisiones del Reporte:**

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | DD/MM/YYYY | Versión inicial | Nombre |

---

**Este reporte es un documento controlado. Cualquier cambio requiere aprobación del Oficial de Validación.**
