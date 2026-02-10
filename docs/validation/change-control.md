# Procedimientos de Control de Cambios
## Change Control Procedures for Medical Device Software

**Versión:** 1.0
**Fecha:** 9 de febrero de 2026
**Clasificación COFEPRIS:** Clase II
**Norma Aplicable:** IEC 62304:2006, ISO 13485:2016

---

## Índice

1. [Propósito y Alcance](#propósito-y-alcance)
2. [Proceso de Solicitud de Cambio](#proceso-de-solicitud-de-cambio)
3. [Categorización de Cambios](#categorización-de-cambios)
4. [Requisitos de Re-validación](#requisitos-de-re-validación)
5. [Workflow de Aprobación](#workflow-de-aprobación)
6. [Implementación y Validación](#implementación-y-validación)
7. [Documentación de Cambios](#documentación-de-cambios)
8. [Gestión de Versiones](#gestión-de-versiones)

---

## Propósito y Alcance

### 1.1 Propósito

Establecer un proceso controlado para gestionar cambios en el sistema Doctor.mx clasificado como Software as Medical Device (SaMD) Clase II, asegurando que:

1. La seguridad del paciente no se comprometa
2. La validación del sistema se mantenga
3. El cumplimiento regulatorio se preserve
4. La trazabilidad de cambios sea completa

### 1.2 Alcance

Este procedimiento aplica a todos los cambios que afectan:

**Componentes del SaMD (Alcance):**
- Motor de detección de emergencias (`src/lib/triage/`)
- Sistema de banderas rojas mejorado (`src/lib/ai/red-flags-enhanced.ts`)
- Sistema de consulta AI SOAP (`src/app/api/ai/consult/`)
- Base de conocimiento médico (`src/lib/medical-knowledge/`)
- Sistema de interacciones medicamentosas
- Sistema de prescripciones
- Sistema de seguimiento de pacientes

**Fuera del Alcance:**
- Cambios puramente cosméticos (UI sin impacto clínico)
- Cambios en infraestructura no relacionada con SaMD
- Cambios administrativos (agendamiento, pagos)

---

## Proceso de Solicitud de Cambio

### 2.1 Iniciación del Cambio

Cualquier cambio al sistema SaMD debe iniciarse con una **Solicitud de Cambio (Change Request - CR)**.

**Plantilla de Solicitud de Cambio:**

```yaml
ID del Cambio: CR-YYYY-XXX
Fecha de Solicitud: DD/MM/YYYY
Solicitante: [Nombre, Rol]

Título del Cambio: [Breve descripción]
Categoría Propuesta: [Major / Minor / Patch]
Prioridad: [P0-Crítica / P1-Alta / P2-Media / P3-Baja]

Descripción Detallada:
- ¿Qué se quiere cambiar?
- ¿Por qué es necesario?
- ¿Qué problema resuelve?

Componentes Afectados:
- Lista de archivos/módulos

Impacto en Seguridad del Paciente:
- [ ] Crítico - Afecta seguridad directa
- [ ] Alto - Afecta calidad clínica
- [ ] Medio - Afecta usabilidad
- [ ] Bajo - Sin impacto clínico

Riesgos Asociados:
- Análisis preliminar de riesgos

Beneficios Esperados:
- Justificación del cambio

Alternativas Consideradas:
- Otras opciones evaluadas
```

### 2.2 Revisión Inicial

El Oficial de Validación realiza una revisión inicial:

**Checklist de Revisión Inicial:**
- [ ] Solicitud completa y clara
- [ ] Categoría propuesta apropiada
- [ ] Impacto en seguridad del paciente evaluado
- [ ] Documentación de soporte adecuada
- [ ] Análisis de riesgo preliminar incluido

**Decisiones Posibles:**
1. **Aprobar para revisión detallada**
2. **Solicitar información adicional**
3. **Rechazar** (con justificación)

---

## Categorización de Cambios

### 3.1 Definiciones de Categorías

#### MAJOR (Cambio Mayor)

**Definición:** Cambios que afectan significativamente la seguridad del paciente, el funcionamiento clínico, o el cumplimiento regulatorio.

**Criterios:**
- [ ] Cambios en algoritmos de detección de emergencias
- [ ] Cambios en lógica de clasificación de urgencia
- [ ] Adición de nuevas funcionalidades clínicas
- [ ] Cambios en base de conocimiento médico (diagnósticos, tratamientos)
- [ ] Cambios en interacciones medicamentosas (adiciones significativas)
- [ ] Cambios arquitectónicos que afectan trazabilidad
- [ ] Cambios requeridos por COFEPRIS o nueva regulación

**Requisitos de Validación:**
- Re-validación completa del componente
- Revisión por comité médico
- Análisis de riesgo completo (ISO 14971)
- Pruebas de regresión extensivas
- Actualización de documentación de validación
- Posible notificación a COFEPRIS

**Ejemplos:**
- Nueva regla de detección de emergencia
- Cambio en algoritmo de clasificación SOAP
- Adición de nueva especialidad en sistema multi-agente
- Cambio significativo en umbral de signos vitales

#### MINOR (Cambio Menor)

**Definición:** Cambios que mejoran o corrigen el sistema sin afectar significativamente la seguridad del paciente.

**Criterios:**
- [ ] Corrección de bugs no críticos
- [ ] Mejoras en usabilidad clínica
- [ ] Optimización de rendimiento (sin cambio funcional)
- [ ] Adición de tests existentes
- [ ] Actualización menor de bibliotecas (sin breaking changes)
- [ ] Mejoras en documentación

**Requisitos de Validación:**
- Validación parcial del componente afectado
- Pruebas de regresión específicas
- Revisión técnica
- Actualización de documentación de usuario
- Análisis de riesgo simplificado

**Ejemplos:**
- Corrección de error en display de resultado
- Mejora en mensaje de error
- Adición de test nuevo para cobertura
- Actualización de versión menor de biblioteca

#### PATCH (Parche)

**Definición:** Cambios menores que corrigen issues específicos sin cambio funcional.

**Criterios:**
- [ ] Corrección de typos
- [ ] Cambios cosméticos menores
- [ ] Actualización de comentarios/código
- [ ] Refactorización sin cambio funcional
- [ ] Configuración de ambiente

**Requisitos de Validación:**
- Prueba unitaria del cambio específico
- Verificación de no regresión
- Documentación de cambio en changelog

**Ejemplos:**
- Corrección de typo en mensaje
- Cambio de color en UI
- Formateo de código
- Actualización de variable de entorno

### 3.2 Matriz de Decisión de Categorización

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPACTO EN SEGURIDAD DEL PACIENTE            │
├─────────────────────────────────────────────────────────────────┤
│                    │ Crítico │ Alto  │ Medio │ Bajo  │ Ninguno │
│ Impacto            │   │       │       │       │       │         │
│ Funcional          │   │       │       │       │       │         │
├────────────────────┼───┼───────┼───────┼───────┼───────┼─────────┤
│ Nuevo (Nueva       │   │       │       │       │       │         │
│ funcionalidad)     │   │ MAJOR │ MAJOR │ MINOR │ MINOR │ MINOR   │
├────────────────────┼───┼───────┼───────┼───────┼───────┼─────────┤
│ Cambio (Modifica  │   │       │       │       │       │         │
│ existente)         │   │ MAJOR │ MAJOR │ MINOR │ MINOR │ PATCH   │
├────────────────────┼───┼───────┼───────┼───────┼───────┼─────────┤
│ Corrección (Fix)  │   │       │       │       │       │         │
│                    │   │ MAJOR │ MINOR │ MINOR │ PATCH │ PATCH   │
├────────────────────┼───┼───────┼───────┼───────┼───────┼─────────┤
│ Eliminación (Remove│   │       │       │       │       │         │
│ funcionalidad)     │   │ MAJOR │ MAJOR │ MAJOR │ MINOR │ MINOR   │
└────────────────────┴───┴───────┴───────┴───────┴───────┴─────────┘
```

---

## Requisitos de Re-validación

### 4.1 Matriz de Re-validación

| Tipo de Cambio | Pruebas Unit | Pruebas Integr | Pruebas Sistema | UAT Clínico | Análisis Riesgo | Update Doc |
|----------------|--------------|----------------|-----------------|-------------|-----------------|------------|
| **MAJOR** | ✅ Completo | ✅ Completo | ✅ Completo | ✅ Sí | ✅ Completo (ISO 14971) | ✅ Sí |
| **MINOR** | ✅ Parcial | ✅ Específico | ⚠️ Casos clave | ⚠️ Si aplica | ✅ Simplificado | ✅ Sí |
| **PATCH** | ✅ Específico | ❌ No | ❌ No | ❌ No | ❌ No | ⚠️ Changelog |

### 4.2 Plan de Pruebas por Tipo de Cambio

#### Para Cambios MAJOR

**1. Pruebas Unitarias**
- 100% de cobertura de nuevo código
- 100% de cobertura de código modificado
- Todas las pruebas existentes deben pasar

**2. Pruebas de Integración**
- Todos los flujos que involucran el componente cambiado
- Pruebas de edge cases
- Pruebas de condiciones límite

**3. Pruebas de Sistema**
- Todos los casos de prueba críticos (P0)
- Muestreo de casos P1 (mínimo 50%)
- Pruebas de carga y rendimiento si aplica

**4. Validación Clínica (UAT)**
- Revisión por comité médico (mínimo 3 especialistas)
- Casos de prueba reales o sintéticos
- Período de observación en modo "shadow" (30 días)
- Documentación de resultados

**5. Análisis de Riesgo**
- Completo según ISO 14971
- Identificación de nuevos peligros
- Estimación de riesgos
- Medidas de control necesarias
- Evaluación de riesgo residual

#### Para Cambios MINOR

**1. Pruebas Unitarias**
- Cobertura de nuevo código modificado
- Pruebas existentes del componente deben pasar

**2. Pruebas de Integración**
- Flujos específicos que utilizan el componente modificado
- Casos edge relevantes

**3. Pruebas de Sistema**
- Casos de prueba P0 afectados
- Casos de prueba P1 específicos

**4. Validación Clínica**
- Solo si afecta decisiones clínicas
- Revisión por 1-2 especialistas

**5. Análisis de Riesgo**
- Simplificado: solo riesgos nuevos/modificados

#### Para Cambios PATCH

**1. Prueba Específica**
- Verificación de corrección del issue específico
- No regressión en área afectada

**2. Documentación**
- Changelog actualizado
- Comentarios en código si es necesario

---

## Workflow de Aprobación

### 5.1 Flujo de Aprobación

```
┌─────────────────────────────────────────────────────────────┐
│              1. SOLICITUD DE CAMBIO (CR)                    │
│            Solicitante crea ticket de cambio                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         2. REVISIÓN INICIAL POR OFICIAL DE VALIDACIÓN        │
│      Evalúa completitud y categorización propuesta          │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
   [Rechazar]                  [Aprobar Revisión]
         │                           │
         │                           ▼
         │            ┌──────────────────────────────────────┐
         │            │   3. TRIAGE POR CATEGORÍA            │
         │            │   (Major/Minor/Patch)                │
         │            └───────────────┬──────────────────────┘
         │                            │
         │            ┌───────────────┴───────────────┐
         │            │                               │
         │            ▼                               ▼
         │      ┌──────────┐                   ┌──────────┐
         │      │  MAJOR   │                   │ MINOR/   │
         │      │          │                   │  PATCH   │
         │      └────┬─────┘                   └────┬─────┘
         │           │                               │
         │           ▼                               ▼
         │    ┌────────────────┐           ┌────────────────┐
         │    │ 4a. COMITÉ     │           │ 4b. REVISIÓN   │
         │    │    MÉDICO      │           │   TÉCNICA      │
         │    │  (Si aplica)   │           │                │
         │    └───────┬────────┘           └───────┬────────┘
         │            │                            │
         │            └────────────┬───────────────┘
         │                         │
         │                         ▼
         │              ┌──────────────────────┐
         │              │ 5. ANÁLISIS DE       │
         │              │     RIESGO           │
         │              │  (ISO 14971)         │
         │              └──────────┬───────────┘
         │                         │
         │                         ▼
         │              ┌──────────────────────┐
         │              │ 6. APROBACIÓN FINAL  │
         │              │                      │
         │              │ [ ] Oficial de       │
         │              │     Validación       │
         │              │ [ ] Director Médico  │
         │              │ [ ] CTO              │
         │              │ [ ] Compliance       │
         │              └──────────┬───────────┘
         │                         │
         │            ┌────────────┴────────────┐
         │            │                         │
         │            ▼                         ▼
         │       [Aprobado]               [Rechazado]
         │            │                         │
         │            ▼                         │
         │  ┌─────────────────┐                 │
         │  │ 7. IMPLEMENTAR  │                 │
         │  │   Y VALIDAR     │                 │
         │  └────────┬────────┘                 │
         │           │                          │
         │           ▼                          │
         │  ┌─────────────────┐                 │
         │  │ 8. CERRAR TICKET│                 │
         │  │    Y ACTUALIZAR │                 │
         │  │   DOCUMENTACIÓN │                 │
         │  └─────────────────┘                 │
         │                                        │
         └────────────────────────────────────────┘
```

### 5.2 Roles y Responsabilidades

#### Solicitante
- Responsable de crear la solicitud de cambio
- Provee toda la información necesaria
- Responde a preguntas de revisores

#### Oficial de Validación
- Revisa todas las solicitudes de cambio
- Determina la categoría apropiada
- Aprueba o rechaza cambios
- Mantiene la trazabilidad de validación

#### Comité Médico (para cambios MAJOR clínicos)
- Revisa cambios que afectan decisiones clínicas
- Evalúa la seguridad del paciente
- Aprueba cambios clínicos

#### Director Médico
- Aprobación final para cambios clínicos mayores
- Responsabilidad última de seguridad del paciente

#### CTO
- Aprobación final para cambios técnicos mayores
- Evalúa viabilidad técnica

#### Oficial de Cumplimiento
- Revisa cumplimiento regulatorio
- Evalúa necesidad de notificar a COFEPRIS

### 5.3 Criterios de Aprobación

**Aprobación Requerida Por:**

| Tipo de Cambio | Validación | Médico | CTO | Compliance |
|----------------|------------|--------|-----|------------|
| **MAJOR Clínico** | ✅ | ✅ | ✅ | ✅ |
| **MAJOR Técnico** | ✅ | ⚠️ | ✅ | ⚠️ |
| **MINOR Clínico** | ✅ | ⚠️ | - | - |
| **MINOR Técnico** | ✅ | - | ⚠️ | - |
| **PATCH** | ✅ | - | - | - |

⚠️ = Requerido solo si aplica

---

## Implementación y Validación

### 6.1 Proceso de Implementación

**1. Branch Strategy**
```bash
# Para cambios MAJOR
git checkout -b feature/CR-YYYY-XXX-major-nombre

# Para cambios MINOR
git checkout -b feature/CR-YYYY-XXX-minor-nombre

# Para cambios PATCH
git checkout -b fix/CR-YYYY-XXX-patch-nombre
```

**2. Desarrollo**
- Código según criterios de aceptación
- Tests según tipo de cambio
- Documentación de cambios

**3. Code Review**
- Revisión por par técnico
- Revisión de seguridad si aplica
- Aprobación antes de merge

**4. Integración**
- Merge a branch de desarrollo
- Ejecución de CI/CD
- Corrección de issues

**5. Deploy a Staging**
- Deploy a ambiente de staging
- Ejecución de pruebas completas
- Validación por solicitante

**6. Validación**
- Pruebas según tipo de cambio
- UAT si aplica
- Documentación de resultados

**7. Deploy a Producción**
- Aprobación final de deploy
- Ejecución de deploy controlado
- Monitoreo post-deploy

### 6.2 Validación Post-Implementación

**Checklist de Validación:**

**Para Cambios MAJOR:**
- [ ] Todas las pruebas unitarias pasan
- [ ] Todas las pruebas de integración pasan
- [ ] Todas las pruebas de sistema pasan
- [ ] Validación clínica completada
- [ ] Análisis de riesgo completado
- [ ] Documentación actualizada
- [ ] Equipo entrenado en cambios
- [ ] Plan de contingencia preparado
- [ ] Monitoreo post-deploy configurado

**Para Cambios MINOR:**
- [ ] Pruebas del componente afectado pasan
- [ ] Regresión no detectada
- [ ] Documentación relevante actualizada
- [ ] Notificación a equipo relevante

**Para Cambios PATCH:**
- [ ] Issue específico corregido
- [ ] Sin regresión en área afectada
- [ ] Changelog actualizado

---

## Documentación de Cambios

### 7.1 Registro de Cambios (Changelog)

**Formato de Changelog:**

```markdown
## [Versión] - YYYY-MM-DD

### Added (Nuevas características)
- [MAJOR/MINOR] Descripción de nueva funcionalidad (CR-YYYY-XXX)

### Changed (Cambios)
- [MAJOR/MINOR] Descripción de cambio existente (CR-YYYY-XXX)

### Deprecated (Deprecado)
- [MAJOR] Funcionalidad que será removida (CR-YYYY-XXX)

### Removed (Removido)
- [MAJOR] Funcionalidad removida (CR-YYYY-XXX)

### Fixed (Corregido)
- [PATCH/MINOR] Bug corregido (CR-YYYY-XXX)

### Security (Seguridad)
- [MAJOR/MINOR] Corrección de seguridad (CR-YYYY-XXX)

### Clinical (Clínico)
- [MAJOR/MINOR] Cambio clínico validado (CR-YYYY-XXX)
```

### 7.2 Documentación de Validación

**Cada cambio debe incluir:**

1. **Solicitud de Cambio Original**
   - ID del cambio
   - Descripción
   - Justificación

2. **Análisis de Impacto**
   - Componentes afectados
   - Riesgos identificados
   - Plan de mitigación

3. **Resultados de Pruebas**
   - Suite de pruebas ejecutadas
   - Resultados (pass/fail)
   - Issues encontrados y resueltos

4. **Validación Clínica** (si aplica)
   - Revisión por comité médico
   - Casos evaluados
   - Aprobación clínicos

5. **Análisis de Riesgo**
   - Peligros identificados
   - Estimación de riesgos
   - Controles implementados
   - Riesgo residual

6. **Aprobaciones**
   - Firmas de aprobación
   - Fecha de aprobación
   - Comentarios

### 7.3 Trazabilidad de Cambios

**Cada cambio debe ser trazable a:**
- Requisitos afectados
- Tests actualizados/creados
- Documentación modificada
- Incidentes relacionados
- Versiones de software

---

## Gestión de Versiones

### 8.1 Esquema de Versionado (SemVer)

**Formato:** `MAJOR.MINOR.PATCH`

**MAJOR:** Cambios incompatibles en API o cambios mayores en funcionalidad clínica
**MINOR:** Nueva funcionalidad compatible backwards
**PATCH:** Corrección de bugs compatible backwards

**Ejemplos:**
- `1.0.0` → `1.0.1`: Corrección de bug (PATCH)
- `1.0.0` → `1.1.0`: Nueva funcionalidad (MINOR)
- `1.0.0` → `2.0.0`: Cambio mayor (MAJOR)

### 8.2 Versionado de Componentes

**Componentes críticos tienen versiones independientes:**

| Componente | Versión | Archivo Versión |
|------------|---------|-----------------|
| Triage Engine | 1.2.3 | `src/lib/triage/VERSION` |
| Enhanced Red Flags | 1.0.5 | `src/lib/ai/red-flags-enhanced.ts` |
| SOAP Generator | 2.1.0 | `src/lib/soap/VERSION` |
| Medical Knowledge | 2026.02 | `src/lib/medical-knowledge/VERSION` |

### 8.3 Release Notes

**Cada release debe incluir:**

1. **Resumen Ejecutivo**
   - Versión y fecha
   - Tipo de release (Major/Minor/Patch)
   - Resumen de cambios

2. **Cambios Incluidos**
   - Lista de CRs incluidos
   - Categoría de cada CR
   - Breve descripción

3. **Impacto en Usuario**
   - Cambios en workflow
   - Nuevas capacidades
   - Capacidades deprecadas

4. **Requisitos de Actualización**
   - Dependencias actualizadas
   - Migraciones de DB requeridas
   - Configuraciones necesarias

5. **Known Issues**
   - Issues conocidos
   - Workarounds disponibles
   - Plan de resolución

6. **Descarga de Documentación**
   - Documentación actualizada
   - Guías de usuario
   - Notas clínicas si aplica

---

## Notificación a COFEPRIS

### 9.1 Cambios Requeriendo Notificación

**Notificar a COFEPRIS cuando:**

1. Cambios que afectan la seguridad del paciente
2. Cambios en clasificación de riesgo del dispositivo
3. Cambios en indicaciones de uso
4. Corrección de problemas de seguridad identificados
5. Cambios requeridos por regulación actualizada

**No requiere notificación:**
- Correcciones de bugs que no afectan seguridad
- Mejoras de usabilidad
- Cambios técnicos internos
- Actualizaciones de seguridad rutinarias

### 9.2 Proceso de Notificación

**1. Evaluación de Necesidad de Notificar**
- Oficial de Cumplimiento evalúa
- Consulta con legal si es necesario

**2. Preparación de Documentación**
- Resumen del cambio
- Análisis de riesgo
- Impacto en seguridad del paciente
- Validación realizada

**3. Envío a COFEPRIS**
- Formato específico COFEPRIS
- Timeline de notificación (30 días previo o 10 días post)

**4. Seguimiento**
- Tracking de respuesta
- Respuesta a preguntas
- Documentación de resolución

---

## Plantilla de Solicitud de Cambio

```markdown
# SOLICITUD DE CAMBIO - DOCTOR.MX SaMD

## Información General
- **ID del Cambio:** CR-YYYY-XXX
- **Fecha de Solicitud:** DD/MM/YYYY
- **Solicitante:** [Nombre, Rol]
- **Prioridad:** [P0/P1/P2/P3]

## Clasificación del Cambio
- **Categoría Propuesta:** [Major/Minor/Patch]
- **Componentes Afectados:**
  - [ ] Triage Engine
  - [ ] Red Flags Enhanced
  - [ ] SOAP Generator
  - [ ] Medical Knowledge
  - [ ] Medication Interactions
  - [ ] Referrals
  - [ ] Otro: ___________

## Descripción del Cambio

### Propósito
¿Qué se quiere lograr con este cambio?

### Justificación
¿Por qué es necesario este cambio?

### Impacto en Seguridad del Paciente
- [ ] Crítico - Afecta seguridad directa
- [ ] Alto - Afecta calidad clínica
- [ ] Medio - Afecta usabilidad
- [ ] Bajo - Sin impacto clínico

## Componentes Afectados
- Archivos a modificar: ...
- APIs a cambiar: ...
- Base de datos: ...

## Riesgos Asociados
1. Riesgo: ...
   - Probabilidad: [Alta/Media/Baja]
   - Severidad: [Crítica/Alta/Media/Baja]
   - Mitigación: ...

## Beneficios Esperados
- ...
- ...

## Alternativas Consideradas
1. Alternativa: ...
   - Ventajas: ...
   - Desventajas: ...
   - Por qué no se eligió: ...

## Plan de Pruebas Propuesto
- Unit tests: ...
- Integration tests: ...
- System tests: ...
- Clinical validation: ...

## Documentación Requerida
- [ ] Update validation protocol
- [ ] Update traceability matrix
- [ ] Update risk assessment
- [ ] Update user documentation
- [ ] Update technical documentation

## Aprobaciones Requeridas
- [ ] Oficial de Validación
- [ ] Comité Médico (si aplica)
- [ ] CTO (si aplica)
- [ ] Oficial de Cumplimiento (si aplica)

## Adjuntos
- [ ] Diseño técnico
- [ ] Análisis de riesgo detallado
- [ ] Especificación de requisitos
- [ ] Otros: ...

---
**Firma del Solicitante:** _________________ **Fecha:** ______
```

---

**Propietario del Proceso:** Oficial de Validación
**Revisión del Proceso:** Anual
**Próxima Revisión:** Febrero 2027
**Aprobado por:** _________________ **Fecha:** ______
