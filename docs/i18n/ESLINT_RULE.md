# ESLint Rule: no-hardcoded-spanish

## Descripción

Esta regla de ESLint detecta y prohíbe el uso de strings hardcodeados en español en el código fuente. Todos los textos visibles al usuario deben usar el sistema de internacionalización (i18n) mediante la función `t()` de `next-intl`.

## Propósito

- **Mantener consistencia**: Garantizar que todo el texto esté centralizado en archivos de traducción
- **Facilitar mantenimiento**: Permitir cambios de texto sin modificar código
- **Soporte multi-idioma**: Preparar la aplicación para futuros idiomas
- **Evitar errores**: Detectar textos olvidados durante el desarrollo

## Cómo Funciona

La regla analiza:
- Strings literales en código JavaScript/TypeScript
- Texto en JSX (`<div>Texto aquí</div>`)
- Atributos JSX que contienen texto (placeholder, title, alt, aria-label)

### Criterios de Detección

Se considera un string "en español" si:
1. Contiene caracteres específicos del español: `áéíóúüñÁÉÍÓÚÜÑ¿¡`
2. Contiene palabras comunes en español: "iniciar sesión", "guardar", "cancelar", etc.
3. Tiene una longitud mínima de 3 caracteres

### Excepciones (Whitelist)

La regla **NO** detecta:
- **Términos técnicos**: JSON, API, URL, HTTP, React, TypeScript, etc.
- **Nombres propios**: Dr. Simeon, DoctorMX
- **Keys de objetos**: `{ nombre: valor }`
- **Console logs**: `console.log("mensaje")`
- **Imports/exports**: `import { algo } from "modulo"`
- **Atributos técnicos**: `id`, `name`, `className`, `data-testid`, etc.
- **Códigos y formatos**: UTF-8, SHA256, px, rem, em
- **Hooks de React**: useState, useEffect, etc.
- **Ya dentro de `t()`**: `t('auth.login')`

## Uso

### ❌ Incorrecto (Error)

```tsx
// JSX text
<button>Iniciar sesión</button>

// Atributos
<input placeholder="Nombre completo" />

// Strings literales
const message = "Cargando datos...";

// Aria labels
<div aria-label="Panel de control">
```

### ✅ Correcto

```tsx
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations();
  
  return (
    <>
      {/* JSX text */}
      <button>{t('auth.login')}</button>
      
      {/* Atributos */}
      <input placeholder={t('form.fullName')} />
      
      {/* Strings literales */}
      const message = t('common.loading');
      
      {/* Aria labels */}
      <div aria-label={t('dashboard.panel')}>
    </>
  );
}
```

## Configuración

### Opciones

```javascript
// eslint.config.mjs
{
  rules: {
    'custom/no-hardcoded-spanish': ['error', {
      // Longitud mínima del string para verificar (default: 3)
      minLength: 3,
      
      // Palabras adicionales a ignorar
      ignoredWords: [
        'Dr. Simeon',
        'DoctorMX',
        // Añadir más nombres propios aquí
      ]
    }]
  }
}
```

### Ignorar en Archivos Específicos

La regla está desactivada automáticamente en:
- Archivos de test (`*.test.ts`, `*.spec.ts`, `tests/**/*`)
- Scripts (`scripts/**/*`, `*.config.*`)
- El propio plugin ESLint

Para desactivar manualmente en un archivo específico:

```javascript
/* eslint-disable custom/no-hardcoded-spanish */
const text = "Este string es una excepción válida";
/* eslint-enable custom/no-hardcoded-spanish */

// O para toda una línea:
const text = "Texto"; // eslint-disable-line custom/no-hardcoded-spanish
```

## Auto-fix

La regla proporciona sugerencias de auto-fix que proponen reemplazar:

```tsx
// Antes:
<button>Iniciar sesión</button>

// Sugerencia:
<button>{t('auth.login')}</button>
```

Para aplicar el auto-fix:

```bash
npm run lint:fix
```

> **Nota**: El auto-fix solo funciona para strings simples. Si el string necesita interpolación de variables, deberás implementar la traducción manualmente.

## Mapeos Comunes

La regla sugiere automáticamente las siguientes keys para textos comunes:

| Texto Español | Key Sugerida |
|--------------|--------------|
| Iniciar sesión | `auth.login` |
| Cerrar sesión | `auth.logout` |
| Crear cuenta | `auth.register` |
| Nombre | `form.firstName` |
| Apellido | `form.lastName` |
| Correo electrónico | `form.email` |
| Contraseña | `form.password` |
| Guardar | `actions.save` |
| Cancelar | `actions.cancel` |
| Eliminar | `actions.delete` |
| Editar | `actions.edit` |
| Enviar | `actions.send` |
| Buscar | `actions.search` |
| Cargando | `common.loading` |
| Error | `common.error` |
| Éxito | `common.success` |
| Aceptar | `actions.accept` |
| Continuar | `actions.continue` |
| Volver | `actions.back` |
| Paciente | `entities.patient` |
| Doctor | `entities.doctor` |
| Cita | `entities.appointment` |

## Integración con CI/CD

La regla se ejecuta automáticamente en:

```bash
# Durante linting
npm run lint

# Durante quality check
npm run quality:check

# En pre-commit hooks
```

Si hay strings hardcodeados, el CI fallará y bloqueará el PR.

## Solución de Problemas

### "Pero este string es un nombre propio válido"

Añádelo a la lista `ignoredWords` en `eslint.config.mjs`:

```javascript
ignoredWords: ['Nombre Propio', 'MarcaRegistrada']
```

### "Este string técnico no debería detectarse"

Verifica que esté en la lista de términos técnicos. Si no, puedes:
1. Añadirlo a `ignoredWords` localmente
2. Proponer añadirlo al plugin para beneficio de todos

### "Necesito permitir un string específico temporalmente"

Usa comentarios de desactivación:

```tsx
{/* eslint-disable-next-line custom/no-hardcoded-spanish */}
<span>Texto temporal</span>
```

## Contribuir

Para añadir nuevos términos técnicos o mejorar la detección:

1. Editar `eslint-plugin-custom/rules/no-hardcoded-spanish.js`
2. Añadir términos a `DEFAULT_TECHNICAL_TERMS` o `SPANISH_INDICATORS`
3. Probar con `npm run lint`
4. Actualizar esta documentación

## Referencias

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules)
- [Project i18n Guide](./README.md)
