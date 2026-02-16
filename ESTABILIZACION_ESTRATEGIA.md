# ESTRATEGIA DE ESTABILIZACIÓN POR CAPAS
## Basada en CODEBASE_SALUDABLE_GUIA.md - Construir lo mínimo que funciona

---

## 🎯 PRINCIPIO DIRECTOR

> **"No reconstruir desde cero. Estabilizar lo que funciona, arreglar lo que está roto, completar lo que falta."**

---

## 📊 INVENTARIO DE LO QUE TENEMOS

### ✅ MÓDULOS QUE FUNCIONAN (Copiar tal cual)

```
src/lib/
├── security/           ✅ 100% funcional - IDOR, CSRF, Encryption
├── ai/                 ✅ 100% funcional - Router, providers, config
├── errors/             ✅ 100% funcional - AppError hierarchy completa
├── validation/         ✅ 100% funcional - Zod schemas + Mexican validators
└── supabase/           ✅ 100% funcional - Client, server, middleware
```

**Decisión:** Estos 5 módulos se COPIAN sin cambios. Son producción-listos.

---

### ⚠️ MÓDULOS PARCIALES (Estabilizar)

```
src/app/
├── api/                ⚠️ Algunos endpoints funcionan, otros no
├── (app)/              ⚠️ Estructura inconsistente
├── (marketing)/        ⚠️ Landing pages desconectadas
└── layout.tsx          ⚠️ Funciona pero necesita cleanup

src/components/
├── ui/                 ⚠️ shadcn/ui base funciona, custom components rotos
├── landing/            ⚠️ Componentes desorganizados
└── features/           ⚠️ Estructura inconsistente
```

**Decisión:** Estabilizar endpoint por endpoint, página por página.

---

### ❌ MÓDULOS ROTOS (Reconstruir selectivamente)

```
src/components/ui/error/  ❌ 71 archivos error.tsx → Unificar en 1
src/app/**/skeleton.tsx   ❌ Múltiples skeletons → Consolidar
src/app/**/page.tsx       ❌ Algunos con syntax errors (.doctores)
src/components/ui/*.tsx   ❌ Duplicados y inconsistentes
```

**Decisión:** Arreglar syntax errors, unificar duplicados, consolidar patterns.

---

## 🏗️ PLAN DE ESTABILIZACIÓN POR CAPAS

### CAPA 0: Fundación (Semana 1) - YA ESTÁ HECHA ✅

La mayoría de `src/lib/` ya funciona. Solo necesita organización.

```
Acciones:
✅ Copiar src/lib/security/ → Funciona perfecto
✅ Copiar src/lib/ai/ → Funciona perfecto
✅ Copiar src/lib/errors/ → Funciona perfecto
✅ Copiar src/lib/validation/ → Funciona perfecto
✅ Copiar src/lib/supabase/ → Funciona perfecto

Tiempo estimado: 1 día (copiar y verificar imports)
```

---

### CAPA 1: Autenticación (Semana 2)

**¿Qué necesitamos que funcione?**
- Login/Register
- Protección de rutas
- Logout

**¿Qué YA tenemos?**
- Middleware de auth ✅
- Supabase auth ✅
- RLS policies ✅

**Tareas:**
```
1. Crear /login/page.tsx (simple, funcional)
2. Crear /register/page.tsx (simple, funcional)
3. Verificar middleware protege rutas /app/*
4. Crear /app/dashboard básico (solo "Bienvenido")
```

**NO incluir aún:**
- ❌ Recuperación de contraseña compleja
- ❌ 2FA
- ❌ Verificación de email elaborada
- ❌ Perfiles de usuario detallados

**Tiempo estimado:** 2-3 días

---

### CAPA 2: Doctores - Búsqueda Básica (Semana 3)

**¿Qué necesitamos que funcione?**
- Ver lista de doctores
- Ver detalle de un doctor

**¿Qué YA tenemos?**
- Schema de doctores ✅
- API parcial de doctores ⚠️
- Componentes parciales ⚠️

**Tareas:**
```
1. Arreglar GET /api/v1/doctores (quitar syntax errors)
2. Crear /doctores/page.tsx (lista simple)
3. Crear /doctores/[id]/page.tsx (detalle simple)
4. Componentes: DoctorCard, DoctorList (básicos)
```

**MVP - Solo mostrar:**
- Nombre del doctor
- Especialidad
- Precio
- Botón "Ver detalle"

**NO incluir aún:**
- ❌ Búsqueda avanzada
- ❌ Filtros complejos
- ❌ Mapa
- ❌ Reviews
- ❌ Rating

**Tiempo estimado:** 3-4 días

---

### CAPA 3: Agendar Cita Básico (Semana 4)

**¿Qué necesitamos que funcione?**
- Seleccionar fecha
- Seleccionar hora
- Crear cita (sin pago)

**¿Qué YA tenemos?**
- Schema de citas ✅
- UNIQUE constraint ✅ (previene doble-booking)
- Función RPC reserve_slot_atomic ✅

**Tareas:**
```
1. Crear POST /api/v1/appointments (simple, sin pago)
2. Crear GET /api/v1/doctors/[id]/availability
3. Crear /book/[doctorId]/page.tsx
   - Calendario simple
   - Selector de hora
   - Formulario básico
4. Crear /app/appointments (listar citas del usuario)
```

**MVP - Flujo simple:**
```
Usuario ve doctor → Click "Agendar" → Selecciona fecha → 
Selecciona hora → Confirma → Cita creada (pendiente de pago)
```

**NO incluir aún:**
- ❌ Pagos
- ❌ Videollamada
- ❌ Notificaciones complejas
- ❌ Recordatorios
- ❌ Cancelación elaborada

**Tiempo estimado:** 4-5 días

---

### CAPA 4: Pagos (Semana 5)

**¿Qué necesitamos que funcione?**
- Pagar con tarjeta (Stripe)
- Pagar con OXXO (México)

**¿Qué YA tenemos?**
- Stripe integration parcial ⚠️
- Webhook handlers ✅ (funcionan)
- Tabla payments ✅

**Tareas:**
```
1. Arreglar POST /api/v1/payments/create-intent
2. Arreglar POST /api/v1/payments/webhook
3. Crear /checkout/[appointmentId]/page.tsx
4. Integrar Stripe Elements
5. Implementar OXXO flow
```

**MVP:**
- Tarjeta: Stripe Elements básico
- OXXO: Generar voucher, mostrar instrucciones

**Tiempo estimado:** 4-5 días

---

### CAPA 5: Compliance Básico (Semana 6)

**¿Qué necesitamos que funcione?**
- Medical disclaimer visible
- Consentimiento informado básico
- Exportar mis datos (ARCO)

**¿Qué YA tenemos?**
- MedicalDisclaimer component ✅
- Tablas ARCO ✅
- APIs parciales ⚠️

**Tareas:**
```
1. Agregar MedicalDisclaimer a flujo de consulta
2. Crear /app/data-rights (exportar datos básico)
3. Crear /app/consent (gestionar consentimientos)
4. Implementar export JSON básico
```

**NO incluir aún:**
- ❌ Export PDF complejo
- ❌ Historial completo de consentimientos
- ❌ Rectificación de datos compleja

**Tiempo estimado:** 3-4 días

---

### CAPA 6: AI Consulta Básica (Semana 7)

**¿Qué necesitamos que funcione?**
- Cuestionario médico simple
- Detección de emergencias
- Recomendación básica

**¿Qué YA tenemos?**
- AI Router ✅
- Prompts médicos ⚠️
- Red flag detection ⚠️

**Tareas:**
```
1. Crear flujo de cuestionario (3-5 preguntas)
2. Integrar AI Router real (no mock)
3. Implementar detección de red flags
4. Mostrar recomendación básica
5. Escalar a doctor si es necesario
```

**NO incluir aún:**
- ❌ Análisis de imágenes
- ❌ Diagnóstico completo
- ❌ Prescripción automática

**Tiempo estimado:** 4-5 días

---

### CAPA 7: Videollamada (Semana 8)

**¿Qué necesitamos que funcione?**
- Sala de videollamada
- Conexión básica

**¿Qué YA tenemos?**
- Nada (deferred en fase anterior)

**Tareas:**
```
1. Integrar Daily.co o similar
2. Crear /app/appointments/[id]/video
3. Implementar sala básica
4. Grabación con consentimiento
```

**Tiempo estimado:** 3-4 días

---

## 📋 CHECKPOINTS POR CAPA

```
ANTES de pasar a la siguiente capa, VERIFICAR:

□ La capa anterior FUNCIONA (la probé manualmente)
□ Puedo demostrar el flujo completo
□ No hay errores de TypeScript
□ No hay errores de runtime
□ Build pasa sin warnings
□ Puedo explicar el código a alguien más
```

---

## 🧹 RITUAL DE LIMPIEZA (Cada 3 días, 30 min)

```
Día 3: Revisar capa actual
  □ ¿Hay código que no uso? → ELIMINAR
  □ ¿Hay duplicados? → UNIFICAR
  □ ¿Hay tipos "any"? → ARREGLAR

Día 6: Revisar entre capas
  □ ¿Hay redundancia? → FUSIONAR
  □ ¿Se puede simplificar? → SIMPLIFICAR

Día 9: Revisar todo
  □ ¿Hay patrón repetido? → EXTRAER función
  □ ¿Archivo muy grande? → DIVIDIR
```

---

## 🎯 MÉTRICA DE ÉXITO

```
Semana 2: Puedo loguearme y ver dashboard ✅
Semana 3: Puedo ver doctores y sus detalles ✅
Semana 4: Puedo agendar una cita ✅
Semana 5: Puedo pagar la cita ✅
Semana 6: Cumplo con regulaciones básicas ✅
Semana 7: Puedo hacer consulta IA básica ✅
Semana 8: Puedo tener videollamada ✅
```

---

## 📁 ESTRUCTURA DE TRABAJO

```
workspace/
├── doctormx/                    # Código ORIGINAL (no tocar)
├── doctormx-stable/             # Nuevo codebase estabilizado
│   ├── src/
│   │   ├── lib/                 # Copiar de original (funciona)
│   │   ├── app/                 # Construir capa por capa
│   │   └── components/          # Construir capa por capa
│   └── ...
└── ESTABILIZACION_ESTRATEGIA.md # Este documento
```

---

## 💡 PRINCIPIOS CLAVE

1. **NO reconstruir desde cero** - Copiar lo que funciona
2. **UNA capa a la vez** - No adelantarse
3. **PROBAR antes de continuar** - Cada capa estable antes de la siguiente
4. **LIMPIAR constantemente** - 30 min cada 3 días
5. **MVP primero** - Lo mínimo que funciona, luego mejorar
6. **Si funciona, no lo toques** - No arreglar lo que no está roto

---

**Estrategia basada en:** CODEBASE_SALUDABLE_GUIA.md Sección 2, Pasos 5-9
