# Plantilla de Evaluación de Riesgos
## Risk Assessment Template (ISO 14971)

**ID de Evaluación:** RA-YYYY-XXX
**Versión:** 1.0
**Fecha:** DD/MM/YYYY
**Componente del Sistema:** [Nombre del componente]
**Versión del Componente:** X.Y.Z

---

## 1. Información General

### 1.1 Identificación del Dispositivo

| Campo | Valor |
|-------|-------|
| **Nombre del Dispositivo** | Doctor.mx SaMD |
| **Componente Evaluado** | [Nombre del componente] |
| **Versión del Componente** | X.Y.Z |
| **Clasificación COFEPRIS** | Clase II |
| **Tipo de Evaluación** | [Inicial / Actualización / Periódica] |

### 1.2 Propósito de la Evaluación

[Describir el propósito de esta evaluación de riesgos]

**Ejemplo:** Evaluar riesgos asociados con el motor de detección de emergencias según ISO 14971:2019.

### 1.3 Alcance

**Incluye:**
- [ ] Análisis de peligros
- [ ] Estimación de riesgos
- [ ] Evaluación de riesgos
- [ ] Control de riesgos
- [ ] Evaluación de riesgo residual

**Excluye:**
[Listar aspectos excluidos con justificación]

---

## 2. Análisis de Peligros (Hazard Analysis)

### 2.1 Identificación de Peligros

| ID Peligro | Descripción del Peligro | Situación Predecible | Secuencia de Eventos | Condición Preexistente |
|------------|------------------------|---------------------|---------------------|----------------------|
| H-001 | [Descripción] | [Cuándo puede ocurrir] | [Secuencia] | [Condiciones] |

### 2.2 Peligros Identificados

#### Peligro 1: Falso Negativo en Detección de Emergencia

| Campo | Valor |
|-------|-------|
| **ID** | H-001 |
| **Descripción** | El sistema falla en detectar una condición de emergencia médica |
| **Situación Predecible** | Paciente con síntomas atípicos o poco comunes |
| **Secuencia de Eventos** | 1. Paciente describe síntoma atípico → 2. Sistema no detecta patrón → 3. Paciente no busca atención de emergencia → 4. Daño al paciente |
| **Condición Preexistente** | Condiciones que alteran presentación (diabetes, embarazo, geriatría) |

#### Peligro 2: Falso Positivo Excesivo

| Campo | Valor |
|-------|-------|
| **ID** | H-002 |
| **Descripción** | El sistema clasifica erróneamente como emergencia casos no urgentes |
| **Situación Predecible** | Paciente con síntomas comunes mal descritos |
| **Secuencia de Eventos** | 1. Paciente describe síntoma leve → 2. Sistema activa emergencia → 3. Paciente acude innecesariamente a urgencias → 4. Sobrecarga del sistema de salud |
| **Condición Preexistente** | Ansiedad del paciente, pobre descripción de síntomas |

#### Peligro 3: Recomendación Clínica Incorrecta

| Campo | Valor |
|-------|-------|
| **ID** | H-003 |
| **Descripción** | El sistema genera recomendación clínica inadecuada |
| **Situación Predecible** | Casos clínicos complejos o raros |
| **Secuencia de Eventos** | 1. Paciente presenta caso complejo → 2. AI genera recomendación → 3. Recomendación seguida inapropiadamente → 4. Daño al paciente |
| **Condición Preexistente** | Múltiples comorbilidades, polifarmacia |

#### Peligro 4: Pérdida de Datos del Paciente

| Campo | Valor |
|-------|-------|
| **ID** | H-004 |
| **Descripción** | Datos médicos del paciente se pierden o corrompen |
| **Situación Predecible** | Falla técnica, error humano |
| **Secuencia de Eventos** | 1. Falla en sistema → 2. Datos no respaldados → 3. Pérdida irreversible → 4. Incapacidad de brindar atención adecuada |
| **Condición Preexistente** | Falta de backups, fallo en redundancia |

#### Peligro 5: Acceso No Autorizado a Datos

| Campo | Valor |
|-------|-------|
| **ID** | H-005 |
| **Descripción** | Datos del paciente son accesados sin autorización |
| **Situación Predecible** | Brecha de seguridad, autenticación comprometida |
| **Secuencia de Eventos** | 1. Brecha de seguridad → 2. Acceso a datos → 3. Exposición de información médica → 4. Violación de privacidad y legal |
| **Condición Preexistente** | Controles de seguridad insuficientes |

---

## 3. Estimación de Riesgos

### 3.1 Matriz de Severidad

| Nivel | Descripción | Criterio |
|-------|-------------|----------|
| **Catastrófica** | Muerte o daño permanente al paciente | Muerte, discapacidad permanente |
| **Crítica** | Daño severo reversible al paciente | Hospitalización, intervención urgente |
| **Moderada** | Daño moderado reversible al paciente | Tratamiento médico requerido |
| **Menor** | Daño menor al paciente | Malestar, inconveniencia |
| **Insignificante** | Sin daño al paciente | Inconveniencia menor |

### 3.2 Matriz de Probabilidad

| Nivel | Descripción | Criterio | Frecuencia Estimada |
|-------|-------------|----------|---------------------|
| **Frecuente** | Ocurre continuamente | >1 en 10 |
| **Probable** | Ocurrirá probablemente | 1 en 10 a 1 en 100 |
| **Ocasional** | Ocurrirá ocasionalmente | 1 en 100 a 1 en 1,000 |
| **Remota** | Poco probable pero posible | 1 en 1,000 a 1 en 10,000 |
| **Improbable** | Casi improbable | <1 en 10,000 |

### 3.3 Estimación por Peligro

| ID Riesgo | Peligro | Severidad | Probabilidad | Nivel Riesgo Inicial |
|-----------|---------|-----------|--------------|---------------------|
| R-001 | Falso negativo emergencia | Catastrófica | Improbable | Medio |
| R-002 | Falso positivo excesivo | Menor | Probable | Bajo |
| R-003 | Recomendación incorrecta | Crítica | Remota | Medio |
| R-004 | Pérdida de datos | Crítica | Remota | Bajo |
| R-005 | Acceso no autorizado | Moderada | Remota | Bajo |

### 3.4 Matriz de Riesgo

```
                 PROBABILIDAD
                 F  Pr  O   R   I
              ┌───┬───┬───┬───┬───┐
              │ M │ M │ A │ A │ B │ I  Insignificante
        S    M├───┼───┼───┼───┼───┤
        E    e├───┼───┼───┼───┼───┤ M  Menor
        V    d├───┼───┼───┼───┼───┤
        E    i├───┼───┼───┼───┼───┤
        R    u├───┼───┼───┼───┼───┤ A  Alta
        I    m├───┼───┼───┼───┼───┤
        D    └───┴───┴───┴───┴───┘
           Catastrófica
```

**Leyenda:**
- **M (Medio):** Requiere evaluación adicional
- **A (Alta):** Requiere control obligatorio
- **B (Baja):** Aceptable con monitoreo

---

## 4. Evaluación de Riesgos

### 4.1 Criterios de Aceptabilidad

| Nivel de Riesgo | Aceptabilidad | Acción Requerida |
|-----------------|---------------|------------------|
| **Inaceptable** | No es aceptable bajo ninguna circunstancia | Control obligatorio antes de uso |
| **No Aceptable** | No es aceptable en condiciones normales | Reducción requerida |
| **ALARP** (As Low As Reasonably Practicable) | Aceptable con controles | Monitoreo y mantenimiento de controles |
| **Aceptable** | Aceptable sin controles adicionales | Monitoreo rutinario |

### 4.2 Evaluación de Cada Riesgo

#### Riesgo R-001: Falso Negativo en Emergencia

| Campo | Valor |
|-------|-------|
| **Riesgo** | Falso negativo en detección de emergencia |
| **Severidad** | Catastrófica |
| **Probabilidad** | Improbable |
| **Nivel Inicial** | Medio |
| **Aceptabilidad** | No Aceptable (riesgo catastrófico no aceptable aún con baja probabilidad) |
| **Justificación** | Cualquier falla en detectar emergencia puede resultar en muerte o daño permanente |

#### Riesgo R-002: Falso Positivo Excesivo

| Campo | Valor |
|-------|-------|
| **Riesgo** | Falso positivo excesivo |
| **Severidad** | Menor |
| **Probabilidad** | Probable |
| **Nivel Inicial** | Bajo |
| **Aceptabilidad** | ALARP (aceptable pero requiere optimización) |
| **Justificación** | Sobrecarga de sistema de salud, pero mejor que falsos negativos |

#### Riesgo R-003: Recomendación Incorrecta

| Campo | Valor |
|-------|-------|
| **Riesgo** | Recomendación clínica incorrecta |
| **Severidad** | Crítica |
| **Probabilidad** | Remota |
| **Nivel Inicial** | Medio |
| **Aceptabilidad** | No Aceptable (requiere controles adicionales) |
| **Justificación** | Puede causar daño severo aunque probabilidad sea baja |

---

## 5. Control de Riesgos

### 5.1 Estrategias de Control

| Estrategia | Descripción | Aplicación |
|------------|-------------|------------|
| **Eliminación** | Remover el peligro completamente | Diseño por defecto |
| **Mitigación** | Reducir probabilidad o severidad | Controles de ingeniería |
| **Protección** | Agregar barreras de protección | Controles administrativos |
| **Aceptación** | Aceptar riesgo residual | Monitoreo |

### 5.2 Controles Implementados

#### Para R-001: Falso Negativo en Emergencia

| Control | Tipo | Evidencia | Eficacia |
|---------|------|-----------|----------|
| Reglas conservadoras de detección | Ingeniería | Tests unitarios pasan | Alta |
| Detección multi-capa | Ingeniería | Validación clínica | Alta |
| Validación por comité médico | Administrativo | Actas de revisión | Alta |
| Monitoreo de falsos negativos | Administrativo | Logs de producción | Media |
| "Better safe than sorry" | Diseño | Filosofía del sistema | Alta |

**Riesgo Residual Estimado:**
- Severidad: Catastrófica
- Probabilidad: Muy Improbable (<1 en 10,000)
- Nivel: Bajo (ALARP)

#### Para R-002: Falso Positivo Excesivo

| Control | Tipo | Evidencia | Eficacia |
|---------|------|-----------|----------|
| Optimización de patrones | Ingeniería | Mejora continua | Media |
| Validación clínica | Administrativo | Revisión periódica | Alta |
| Retroalimentación de doctores | Administrativo | Encuestas | Media |

**Riesgo Residual Estimado:**
- Severidad: Menor
- Probabilidad: Ocasional
- Nivel: Bajo (Aceptable)

#### Para R-003: Recomendación Incorrecta

| Control | Tipo | Evidencia | Eficacia |
|---------|------|-----------|----------|
| Multi-especialista consensus | Ingeniería | Kendall's W >0.7 | Alta |
| Validación por humano | Administrativo | Workflow de aprobación | Alta |
| Limitación de responsabilidad | Diseño | Disclaimer clínicamente explícito | Media |
| Base de conocimiento validada | Ingeniería | Revisión por expertos | Alta |

**Riesgo Residual Estimado:**
- Severidad: Crítica
- Probabilidad: Muy Remota
- Nivel: Bajo (ALARP)

#### Para R-004: Pérdida de Datos

| Control | Tipo | Evidencia | Eficacia |
|---------|------|-----------|----------|
| Backups diarios automáticos | Técnico | Configuración backup | Alta |
| Encriptación AES-256 | Técnico | Implementación verificada | Alta |
| Redundancia geográfica | Técnico | Multi-region cloud | Alta |
| Política de retención | Administrativo | Documentación | Alta |

**Riesgo Residual Estimado:**
- Severidad: Crítica
- Probabilidad: Muy Remota
- Nivel: Bajo (Aceptable)

#### Para R-005: Acceso No Autorizado

| Control | Tipo | Evidencia | Eficacia |
|---------|------|-----------|----------|
| Row Level Security (RLS) | Técnico | Configuración verificada | Alta |
| Autenticación multifactor | Técnico | SMS MFA implementado | Alta |
| Encriptación TLS 1.3 | Técnico | Certificado válido | Alta |
| Audit logging | Técnico | Logs inmutables | Alta |
| Pen testing anual | Administrativo | Prueba externa | Alta |

**Riesgo Residual Estimado:**
- Severidad: Moderada
- Probabilidad: Muy Remota
- Nivel: Bajo (Aceptable)

---

## 6. Evaluación de Riesgo Residual

### 6.1 Riesgo Residual por Peligro

| ID Riesgo | Nivel Inicial | Controles Aplicados | Nivel Residual | Aceptabilidad |
|-----------|---------------|-------------------|----------------|---------------|
| R-001 | Medio | Múltiples | Bajo | ✅ Aceptable (ALARP) |
| R-002 | Bajo | Optimización | Bajo | ✅ Aceptable |
| R-003 | Medio | Multi-especialista | Bajo | ✅ Aceptable (ALARP) |
| R-004 | Bajo | Backups + Encriptación | Bajo | ✅ Aceptable |
| R-005 | Bajo | RLS + MFA + Encriptación | Bajo | ✅ Aceptable |

### 6.2 Riesgo Global Residual

**Evaluación:**
El riesgo residual global del sistema se considera **ACEPTABLE** bajo el principio ALARP (As Low As Reasonably Practicable).

**Justificación:**
1. Todos los riesgos catastróficos y críticos han sido mitigados a niveles aceptables
2. Los controles implementados son proporcionales al riesgo
3. Los controles se monitorean y mejoran continuamente
4. La filosofía del sistema prioriza la seguridad del paciente

---

## 7. Monitoreo y Revisión

### 7.1 Indicadores de Monitoreo

| Indicador | Métrica | Objetivo | Frecuencia Medición |
|-----------|---------|----------|---------------------|
| Tasa de falsos negativos | % | 0% (absoluto) | Diario |
| Tasa de falsos positivos | % | <30% | Semanal |
| Incidentes de seguridad | Count | 0 | Mensual |
| Tiempo de recuperación mineria | Minutos | <15 | Mensual |
| Uptime del sistema | % | ≥99.5% | Mensual |

### 7.2 Revisión Periódica

| Actividad | Frecuencia | Responsable |
|-----------|------------|-------------|
| Revisión de riesgos | Trimestral | Oficial de Validación |
| Reevaluación completa | Anual | Comité de Riesgos |
| Análisis de incidentes | Per incidente | Equipo correspondiente |
| Actualización de controles | Según necesidad | Responsable de componente |

### 7.3 Gestión de Cambios

[Cualquier cambio en el sistema debe incluir reevaluación de riesgos según Change Control Procedures]

---

## 8. Conclusiones

### 8.1 Resumen

[Resumen ejecutivo de la evaluación de riesgos]

### 8.2 Recomendaciones

1. **Implementar controles identificados** antes del deployment
2. **Establecer monitoreo continuo** de indicadores de riesgo
3. **Programar revisión periódica** de evaluación de riesgos
4. **Mantener registro de incidentes** para mejora continua

### 8.3 Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Oficial de Validación | | | DD/MM/YYYY |
| Director Médico | | | DD/MM/YYYY |
| Oficial de Cumplimiento | | | DD/MM/YYYY |
| CTO | | | DD/MM/YYYY |

---

## Anexos

### Anexo A: Análisis Detallado de Peligros
[Detalles adicionales si es necesario]

### Anexo B: Evidencias de Controles
[Evidencias de implementación de controles]

### Anexo C: Cálculos de Probabilidad
[Métodos de cálculo utilizados]

---

**Historial de Revisiones:**

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | DD/MM/YYYY | Versión inicial | [Nombre] |

---

**Este documento es controlado. Los cambios requieren aprobación del Oficial de Validación.**
