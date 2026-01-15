# Proceso Obligatorio del Agente

## Antes de CUALQUIER cambio, SIEMPRE:

### 1. Leer contexto (OBLIGATORIO)
```
- PRINCIPIOS.md → Validar que sigo "claridad antes que complejidad"
- CONFIGURACION.md → Verificar que no estoy inventando configs
- DECISIONES.md → Revisar decisiones arquitectónicas relevantes
- FLUJOS.md → Entender el flujo completo antes de modificar
```

### 2. Activar checklist condicional SI:
- Cambios en config/pipelines
- Más de 2 archivos afectados
- Contradicción docs vs código
- Tarea ambigua ("optimizar", "limpiar", "refactor")
- Loop repetido en la sesión

**Formato checklist:**
```
□ 1. Objetivo claro (1 línea)
□ 2. Archivos afectados (lista)
□ 3. Validación contra PRINCIPIOS.md
□ 4. Riesgo de breaking changes
□ 5. Plan de rollback

¿Proceder? (esperar confirmación usuario)
```

### 3. Validar ANTES de ejecutar
- ✅ ¿Es el cambio más SIMPLE posible?
- ✅ ¿Sigo el patrón existente en el código?
- ✅ ¿Estoy inventando algo o reutilizando?
- ✅ ¿El código será CLARO para leer en 6 meses?

### 4. Ejecutar cambios mínimos
- Modificar el MENOR número de archivos posible
- Usar herramientas en paralelo cuando sea independiente
- NO refactorizar código no relacionado

### 5. Validar DESPUÉS
```bash
npm run typecheck  # SIEMPRE
npm run lint       # SIEMPRE
```

## Recordatorios constantes

**Cuando tengas dudas:**
1. Lee PRINCIPIOS.md
2. Busca código similar existente
3. Elige la opción MÁS SIMPLE

**Cuando encuentres un error:**
1. NO modificar 5 archivos a la vez
2. Arreglar el error específico
3. Validar con typecheck
4. LUEGO continuar

## Triggers para detenerme y pedir confirmación

- Usuario dice: "¿estás siguiendo X?"
- Error que ya apareció antes
- Más de 3 archivos modificados en una operación
- Cambio en middleware/auth/core
- Inventar nueva dependencia o patrón

## Compromiso

Este archivo es mi contrato. Si no lo sigo:
- El usuario debe señalarlo
- Debo volver a leer este archivo
- Debo revertir cambios complejos innecesarios
