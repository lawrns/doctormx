# ESLint Plugin Custom para DoctorMX

Plugin ESLint personalizado con reglas específicas para el proyecto DoctorMX.

## Instalación

Este plugin está incluido en el proyecto y no requiere instalación adicional.

## Reglas

### `no-hardcoded-spanish`

Prohíbe el uso de strings hardcodeados en español en el código fuente. Todos los textos visibles al usuario deben usar el sistema de internacionalización (i18n).

#### Uso

```javascript
// eslint.config.mjs
import customPlugin from './eslint-plugin-custom/index.js';

export default [
  {
    plugins: {
      'custom': customPlugin
    },
    rules: {
      'custom/no-hardcoded-spanish': ['error', {
        minLength: 3,
        ignoredWords: ['Dr. Simeon', 'DoctorMX']
      }]
    }
  }
];
```

#### Opciones

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `minLength` | `number` | `3` | Longitud mínima del string para verificar |
| `ignoredWords` | `string[]` | `[]` | Palabras adicionales a ignorar |

#### Ejemplos

##### ❌ Incorrecto

```tsx
<button>Iniciar sesión</button>
<input placeholder="Correo electrónico" />
const message = "Cargando...";
```

##### ✅ Correcto

```tsx
<button>{t('auth.login')}</button>
<input placeholder={t('form.email')} />
const message = t('common.loading');
```

#### Qué se detecta

- Strings con caracteres específicos del español: `áéíóúüñÁÉÍÓÚÜÑ¿¡`
- Palabras comunes en español: "iniciar sesión", "guardar", "cancelar", etc.
- Texto en JSX y atributos (placeholder, title, alt, aria-label)

#### Qué se ignora

- Términos técnicos: JSON, API, URL, HTTP, React, TypeScript, hooks, etc.
- Clases CSS de Tailwind
- Keys de objetos
- Console logs
- Imports/exports
- Nombres propios (configurables)

## Desarrollo

Para agregar nuevas reglas:

1. Crear archivo en `rules/nombre-regla.js`
2. Exportar la regla en `index.js`
3. Actualizar esta documentación

## Licencia

MIT - Parte del proyecto DoctorMX
