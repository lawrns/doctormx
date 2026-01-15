# Principios del Proyecto Doctory

## Guía Central

> **Claridad antes que complejidad**  
> **Sistema antes que feature**  
> **Proceso antes que código**

## Reglas de Decisión

Cuando tengas dudas entre dos opciones:

1. **Elige la más clara** - El código debe ser fácil de leer y entender
2. **Elige la más simple** - Menos código, menos bugs, más mantenible
3. **Elige la más fácil de cambiar** - El cambio es inevitable, prepárate para él

## Aplicación Práctica

### ✅ Sistema de Autenticación
```typescript
// SIMPLE Y CLARO
const { user, profile } = await requireRole('doctor')

// ❌ COMPLEJO Y REPETITIVO
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/auth/login')
const { data: profile } = await supabase.from('profiles')...
if (profile?.role !== 'doctor') redirect('/app')
```

### ✅ Componentes Reutilizables
- `DashboardHeader` - Un header, una responsabilidad
- `QuickActionCard` - Tarjetas de acción simples
- `StatCard` - Estadísticas claras
- `Icons` - Iconos centralizados

### ✅ Utilidades Claras
```typescript
// CLARO Y DIRECTO
isToday(date)
isFuture(date)
formatCurrency(cents)

// ❌ COMPLEJO Y REPETITIVO
new Date(date).toDateString() === new Date().toDateString()
```

### ✅ Configuración Centralizada
```typescript
// Sistema centralizado
const ROUTES = {
  public: ['/auth/login', '/auth/register', '/'],
  patient: ['/app'],
  doctor: ['/doctor'],
  admin: ['/admin'],
}
```

## Estructura del Código

```
src/
├── lib/
│   ├── auth.ts          # Sistema de autenticación (helpers simples)
│   ├── utils.ts         # Utilidades claras y reutilizables
│   └── supabase/        # Clientes de base de datos
├── components/          # Componentes reutilizables
│   ├── DashboardHeader.tsx
│   ├── QuickActionCard.tsx
│   ├── StatCard.tsx
│   └── Icons.tsx
├── app/                 # Rutas (lógica mínima, composición clara)
└── types/               # Tipos TypeScript compartidos
```

## Beneficios

1. **Mantenibilidad** - Cambios localizados, no en cascada
2. **Legibilidad** - Código auto-documentado
3. **Testing** - Funciones simples son fáciles de probar
4. **Onboarding** - Nuevos desarrolladores entienden rápido
5. **Debugging** - Menos complejidad = menos bugs

## Anti-Patrones a Evitar

❌ Código duplicado en cada página  
❌ Lógica compleja inline  
❌ Componentes gigantes que hacen todo  
❌ Configuración dispersa por el proyecto  
❌ Nombres poco claros o abreviados  

## Ejemplos del Proyecto

### Middleware Simplificado
- Configuración centralizada de rutas
- Proceso claro: autenticar → verificar → redirigir
- Fácil de modificar cuando cambien los requisitos

### Helpers de Auth
- Una función, un propósito
- Código reutilizable en todas las páginas
- Fácil de testear y mantener

### Componentes UI
- Props claros y tipados
- Responsabilidad única
- Composición sobre configuración
