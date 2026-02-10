# Plantilla de Caso de Prueba
## Test Case Template for SaMD Validation

**ID del Caso de Prueba:** TC-YYYY-XXX
**Versión:** 1.0
**Fecha de Creación:** DD/MM/YYYY
**Última Actualización:** DD/MM/YYYY

---

## 1. Información General

### 1.1 Identificación

| Campo | Valor |
|-------|-------|
| **ID del Caso de Prueba** | TC-YYYY-XXX |
| **Título** | [Título descriptivo del caso] |
| **Prioridad** | [P0-Critical / P1-High / P2-Medium / P3-Low] |
| **Tipo de Prueba** | [Unit / Integration / System / Clinical / Performance] |
| **Automatizado** | [Sí / No] |
| **Requisitos Asociados** | [Listar IDs de requisitos] |
| **Componente** | [Nombre del componente] |
| **Archivo de Implementación** | [Ruta del archivo de test] |

### 1.2 Propósito

[Describir el propósito específico de este caso de prueba]

**Ejemplo:** Verificar que el sistema detecta correctamente signos de infarto al miocardio y clasifica como emergencia (ER).

---

## 2. Descripción del Caso de Prueba

### 2.1 Pre-condiciones

**Estado Requerido del Sistema:**
- [ ] Sistema configurado y ejecutándose
- [ ] Base de datos de conocimiento médico actualizada
- [ ] Servicios AI disponibles
- [ ] Usuario autenticado (si aplica)

**Datos de Prueba Requeridos:**
- [ ] Paciente test configurado
- [ ] Historial médico (si aplica)
- [ ] Medicamentos actuales (si aplica)
- [ ] Signos vitales (si aplica)

**Entorno:**
- [ ] Environment: [Development / Staging / Production-shadow]
- [ ] Configuración específica: ...

### 2.2 Escenario de Prueba

**Descripción Narrativa:**
Como [rol de usuario]
quiero [acción a realizar]
para [resultado esperado]

**Ejemplo:**
Como paciente con dolor de pecho
quiero ingresar mi síntoma
para ser clasificado correctamente como emergencia

### 2.3 Datos de Input

**Input Primario:**

| Campo | Valor | Notas |
|-------|-------|-------|
| Message | "Tengo dolor de pecho opresivo que se irradia al brazo izquierdo" | Input del usuario |
| Patient Age | 55 | Opcional |
| Patient Sex | M | Opcional |
| Conditions | ["hypertension", "diabetes"] | Opcional |
| Medications | [] | Opcional |
| Vitals | {spo2: 95, bp: "140/90"} | Opcional |

**Input Secundario (si aplica):**
[Listar otros inputs relevantes]

---

## 3. Procedimiento de Prueba

### 3.1 Pasos de Ejecución

| Paso # | Acción | Resultado Esperado | Notas |
|--------|--------|-------------------|-------|
| 1 | [Descripción de acción] | [Resultado esperado] | |
| 2 | [Descripción de acción] | [Resultado esperado] | |
| 3 | [Descripción de acción] | [Resultado esperado] | |
| 4 | [Descripción de acción] | [Resultado esperado] | |
| 5 | [Descripción de acción] | [Resultado esperado] | |

**Ejemplo:**

| Paso # | Acción | Resultado Esperado | Notas |
|--------|--------|-------------------|-------|
| 1 | Ingresar mensaje: "Tengo dolor de pecho opresivo..." | Sistema acepta input | |
| 2 | Invocar función `evaluateRedFlags()` | Función retorna resultado | |
| 3 | Verificar `result.triggered` | es `true` | |
| 4 | Verificar `result.action` | es `'ER'` | |
| 5 | Verificar `result.ruleIds` | contiene `'chest_pain_emergency'` | |

### 3.2 Código de Prueba (si aplica)

```typescript
// Test case implementation
describe('TC-EMERG-001: Chest Pain Detection', () => {
  it('should detect chest pain as ER emergency', () => {
    const input = {
      message: 'Tengo dolor de pecho opresivo que se irradia al brazo izquierdo'
    };

    const result = evaluateRedFlags(input);

    expect(result.triggered).toBe(true);
    expect(result.action).toBe('ER');
    expect(result.severity).toBe(100);
    expect(result.ruleIds).toContain('chest_pain_emergency');
    expect(result.recommendations).toContain('Llama al 911 INMEDIATAMENTE');
  });
});
```

---

## 4. Resultados Esperados

### 4.1 Criterios de Éxito

El caso de prueba PASA si:

- [ ] Criterio 1: [Descripción específica]
- [ ] Criterio 2: [Descripción específica]
- [ ] Criterio 3: [Descripción específica]
- [ ] Criterio 4: [Descripción específica]

**Ejemplo:**
- [ ] `result.triggered === true`
- [ ] `result.action === 'ER'`
- [ ] `result.severity === 100`
- [ ] Tiempo de respuesta <2000ms

### 4.2 Salida Esperada

**Estructura de Respuesta:**

```json
{
  "triggered": true,
  "action": "ER",
  "ruleIds": ["chest_pain_emergency"],
  "reasons": ["Dolor de pecho puede indicar infarto..."],
  "severity": 100,
  "recommendations": [
    "🚨 EMERGENCIA: Busca atención médica inmediata",
    "Llama al 911 o acude a urgencias",
    "Si hay signos de infarto: mastica una aspirina..."
  ]
}
```

### 4.3 Métricas Esperadas

| Métrica | Valor Objetivo | Valor Real | Estado |
|---------|----------------|------------|--------|
| Tiempo de respuesta | <2000ms | __ms | ✅ / ❌ |
| Uso de memoria | <10MB | __MB | ✅ / ❌ |
| Precisión | 100% | __% | ✅ / ❌ |

---

## 5. Resultados de Ejecución

### 5.1 Ejecución

| Fecha | Ejecutado Por | Ambiente | Resultado | Tiempo |
|-------|---------------|-----------|-----------|--------|
| DD/MM/YYYY | [Nombre] | [Dev/Stag/Prod] | [Pass/Fail] | __ms |

### 5.2 Datos Capturados

**Actual Output:**
[Pegar output real de la ejecución]

**Diferencias con Esperado:**
[Describir cualquier diferencia]

### 5.3 Evidencias

**Screenshots:**
[Adjuntar screenshots si aplica]

**Logs:**
[Pegar logs relevantes]

**Archivos Generados:**
[Listar archivos generados durante la prueba]

---

## 6. Manejo de Errores

### 6.1 Escenarios de Error

| Escenario | Acción Esperada | Verificación |
|-----------|-----------------|--------------|
| Input inválido | Retornar error apropiado | Error message correcto |
| Servicio AI no disponible | Retornar fallback | Fallback activado |
| Timeout | Manejar timeout gracefully | Timeout manejado |

### 6.2 Manejo de Edge Cases

[Listar edge cases específicos y su manejo esperado]

**Ejemplo:**
- Input vacío → Retornar triage vacío
- Input en otro idioma → Intentar detectar
- Input con slang → Interpretar correctamente

---

## 7. Casos Relacionados

| Caso ID | Título | Relación |
|---------|--------|----------|
| TC-YYYY-XXX | [Título] | [Similar / Dependiente / Secuencial] |
| TC-YYYY-XXX | [Título] | [Similar / Dependiente / Secuencial] |

---

## 8. Mantenimiento del Caso de Prueba

### 8.1 Historial de Cambios

| Versión | Fecha | Cambios | Autor |
|---------|-------|---------|-------|
| 1.0 | DD/MM/YYYY | Creación inicial | [Nombre] |
| 1.1 | DD/MM/YYYY | [Descripción cambio] | [Nombre] |

### 8.2 Revisión Programada

**Próxima Revisión:** DD/MM/YYYY
**Frecuencia de Revisión:** [Trimestral / Semestral / Anual]

---

## 9. Aprobación

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| Desarrollador | | | DD/MM/YYYY |
| QA Engineer | | | DD/MM/YYYY |
| Oficial de Validación | | | DD/MM/YYYY |

---

## Anexos

### Anexo A: Datos de Prueba Adicionales
[Cualquier dato de prueba adicional no incluido arriba]

### Anexo B: Referencias
[Referencias a guías clínicas, documentos de requisitos, etc.]

---

**Este caso de prueba es un documento controlado. Los cambios requieren aprobación del Oficial de Validación.**
