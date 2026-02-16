# Mock Utilities for Tests

## next/headers Mocks

Cuando se prueban API routes de Next.js que usan `headers()` o `cookies()` de `next/headers`, es necesario mockear estos módulos para evitar el error:

```
headers was called outside a request scope
```

### Configuración Global (Recomendada)

Los mocks están configurados globalmente en `src/lib/__tests__/setup.ts`. Esto significa que todos los tests tienen acceso automático a mocks funcionales de `next/headers`.

### Uso en Tests Específicos

Si necesitas configurar comportamientos específicos en un test:

```typescript
import { describe, it, beforeEach, vi } from 'vitest'
import { mockHeadersGet, mockCookiesGet } from '@/lib/__tests__/setup'

// Importar la route DESPUÉS de los mocks (si es necesario)
import { POST } from '@/app/api/my-route/route'

describe('My API Route', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Configurar mock específico
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'authorization') return 'Bearer token123'
      return null
    })
    
    mockCookiesGet.mockImplementation((name: string) => {
      if (name === 'session') return { value: 'session-value' }
      return null
    })
  })
  
  it('should handle request', async () => {
    // Tu test aquí
  })
})
```

### API de Mocks

#### `mockHeadersGet(name: string): string | null`

Mock para el método `get()` de headers. Configúralo para retornar valores específicos:

```typescript
// Retornar un header específico
mockHeadersGet.mockReturnValue('application/json')

// O basado en el nombre
mockHeadersGet.mockImplementation((name: string) => {
  if (name === 'content-type') return 'application/json'
  if (name === 'stripe-signature') return 'sig_123'
  return null
})
```

#### `mockCookiesGetAll(): Cookie[]`

Mock para obtener todas las cookies:

```typescript
mockCookiesGetAll.mockReturnValue([
  { name: 'auth-token', value: 'token123' },
  { name: 'session', value: 'session456' },
])
```

#### `mockCookiesGet(name: string): Cookie | null`

Mock para obtener una cookie específica:

```typescript
mockCookiesGet.mockImplementation((name: string) => {
  if (name === 'auth-token') return { value: 'token123' }
  return null
})
```

#### `mockCookiesSet(name: string, value: string, options?: object): void`

Mock para establecer cookies:

```typescript
// Verificar que se llamó
expect(mockCookiesSet).toHaveBeenCalledWith(
  'session',
  'new-value',
  expect.any(Object)
)
```

### Ejemplo Completo: Stripe Webhook

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockHeadersGet } from '@/lib/__tests__/setup'

// Mock next/headers para este test
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({
    get: mockHeadersGet,
  })),
  cookies: vi.fn(() => Promise.resolve({
    getAll: vi.fn(() => []),
    set: vi.fn(),
    get: vi.fn(),
  })),
}))

import { POST } from '@/app/api/webhooks/stripe/route'

describe('Stripe Webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHeadersGet.mockImplementation((name: string) => {
      if (name === 'stripe-signature') return 'test_signature'
      return null
    })
  })
  
  it('should verify signature', async () => {
    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ event: 'test' }),
      headers: { 'stripe-signature': 'test_signature' },
    })
    
    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

### Solución de Problemas

#### Error: "headers was called outside a request scope"

Este error ocurre cuando `headers()` o `cookies()` se llaman fuera del contexto de una solicitud de Next.js. Soluciones:

1. **Verifica que el mock esté antes de las importaciones**:
   ```typescript
   // ✅ Correcto
   vi.mock('next/headers', () => ({ ... }))
   import { POST } from './route'
   
   // ❌ Incorrecto
   import { POST } from './route'
   vi.mock('next/headers', () => ({ ... }))
   ```

2. **Usa la configuración global**: Los mocks están en `src/lib/__tests__/setup.ts`.

3. **Para imports dinámicos**: Si usas `await import()`, asegúrate de que sea DESPUÉS de configurar los mocks.

#### Error: "Cannot find module 'next/headers'"

Asegúrate de que el mock esté correctamente configurado:

```typescript
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({ get: vi.fn() })),
  cookies: vi.fn(() => Promise.resolve({ getAll: vi.fn(), set: vi.fn() })),
}))
```
