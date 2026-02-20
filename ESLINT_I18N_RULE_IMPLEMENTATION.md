# ESLint Rule Implementation Summary

## Resumen

Se implementó exitosamente una regla de ESLint personalizada (`no-hardcoded-spanish`) que detecta y prohíbe strings hardcodeados en español en el código fuente del proyecto DoctorMX.

## Archivos Creados

### 1. `eslint-plugin-custom/index.js`
Plugin principal que exporta la regla personalizada.

### 2. `eslint-plugin-custom/rules/no-hardcoded-spanish.js`
Regla completa con:
- Detección de caracteres españoles (áéíóúüñ¿¡)
- Detección de palabras comunes en español
- Whitelist de términos técnicos (300+ términos)
- Ignorado de clases CSS de Tailwind
- Ignorado de keys de objetos
- Ignorado de console logs
- Ignorado de imports/exports
- Sugerencias de keys de i18n para strings comunes
- Auto-fix para strings simples

### 3. `eslint-plugin-custom/README.md`
Documentación del plugin.

### 4. `docs/i18n/ESLINT_RULE.md`
Documentación completa de uso para desarrolladores.

### 5. `ESLINT_I18N_RULE_IMPLEMENTATION.md`
Este archivo de resumen.

## Archivos Modificados

### 1. `eslint.config.mjs`
- Import del plugin usando `createRequire`
- Configuración de la regla con opciones
- Excepciones para tests y scripts

### 2. `package.json`
- Script `lint:i18n` para verificar strings hardcodeados
- Dependencias añadidas: `typescript-eslint`, `@next/eslint-plugin-next`

## Características de la Regla

### Detección
| Tipo | Ejemplo | Detectado |
|------|---------|-----------|
| JSX Text | `<button>Iniciar</button>` | ✅ |
| Atributos | `placeholder="Nombre"` | ✅ |
| Strings | `"Cargando..."` | ✅ |
| Aria labels | `aria-label="Panel"` | ✅ |
| Con caracteres españoles | `"Configuración"` | ✅ |
| Con palabras comunes | `"Iniciar sesión"` | ✅ |

### Excepciones (Ignorado)
| Tipo | Ejemplo | Ignorado |
|------|---------|----------|
| Términos técnicos | `"JSON"`, `"API"`, `"useState"` | ✅ |
| Clases Tailwind | `"w-full flex items-center"` | ✅ |
| Keys de objetos | `{ nombre: value }` | ✅ |
| Console logs | `console.log("msg")` | ✅ |
| Imports | `from "module"` | ✅ |
| Uso de t() | `t('key')` | ✅ |
| Nombres propios (config) | `"Dr. Simeon"` | ✅ |

### Sugerencias de Auto-fix
La regla sugiere keys de i18n para strings comunes:

| String Español | Key Sugerida |
|---------------|--------------|
| "Iniciar sesión" | `auth.login` |
| "Crear cuenta" | `auth.register` |
| "Correo electrónico" | `form.email` |
| "Guardar" | `actions.save` |
| "Cancelar" | `actions.cancel` |
| "Cargando" | `common.loading` |

## Resultados

### Estadísticas del Proyecto
- **Total de strings hardcodeados detectados**: ~3879
- **Archivo con más strings**: `src/app/help/page.tsx` (28 strings)

### Verificación
```bash
# Verificar strings hardcodeados
npm run lint:i18n

# Fix automático (donde sea posible)
npm run lint:fix
```

## Uso

### Bloquear PRs con strings hardcodeados
La regla está configurada como `error`, por lo tanto:
- `npm run lint` fallará si hay strings hardcodeados
- CI/CD bloqueará PRs que no cumplan
- Pre-commit hooks pueden detectarlos antes del push

### Ignorar temporalmente
```tsx
// eslint-disable-next-line custom/no-hardcoded-spanish
<span>Texto temporal</span>
```

### Agregar excepciones permanentes
```javascript
// eslint.config.mjs
{
  rules: {
    'custom/no-hardcoded-spanish': ['error', {
      ignoredWords: ['Nombre Propio', 'Marca']
    }]
  }
}
```

## Próximos Pasos Recomendados

1. **Migración gradual**: Los ~3879 strings detectados deben migrarse a archivos de i18n
2. **Priorización**: Comenzar con los componentes más usados
3. **Equipo**: Asignar la tarea de migración a desarrolladores
4. **Calidad**: Agregar `npm run lint:i18n` al CI/CD pipeline

## Notas Técnicas

- Compatible con ESLint 10.x y flat config
- Soporta TypeScript y JSX
- Usa la API moderna de ESLint (sourceCode.getAncestors)
- Incluye meta.hasSuggestions para sugerencias
- Permite auto-fix para strings simples

## Verificación de Funcionamiento

```bash
# Test en archivo específico
npx eslint src/app/help/page.tsx --no-cache

# Contar strings hardcodeados
npx eslint src --ext .ts,.tsx --no-cache 2>&1 | grep -c "custom/no-hardcoded-spanish"
# Resultado: 3879 strings detectados
```

---

**Estado**: ✅ Implementado y funcionando
**Fecha**: 2026-02-20
