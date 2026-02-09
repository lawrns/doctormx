# Doctory - Project Context

> **Última actualización:** 2026-02-09
> **Stack:** Next.js 16, Supabase, Stripe

---

## Descripción

Plataforma de teleconsultas médicas. Conecta pacientes con doctores a través de videollamadas.

---

## Arquitectura: Sistemas Independientes

| Sistema | Input | Output |
|---------|-------|--------|
| `lib/booking.ts` | paciente+doctor+slot | cita |
| `lib/availability.ts` | doctor+fecha | slots disponibles |
| `lib/payment.ts` | cita | confirmada |
| `lib/discovery.ts` | filtros | doctores |
| `lib/auth.ts` | usuario | autorizado/redirect |

---

## Estados del Doctor

Solo 2 estados:
- `unverified` — Puede configurar todo
- `verified` — Publicado en catálogo

Ver `DECISIONES.md` para el por qué.

---

## Flujos Principales

**Paciente:**
Explorar sin login → Ver slots sin login → Reservar → Login → Pago → Videollamada

**Doctor:**
Registro → Onboarding 1 paso → Admin verifica → Publicado

---

## Setup en 5 minutos

```bash
# 1. Clonar e instalar
git clone <repo>
cd doctory-v2
npm install

# 2. Variables de entorno
# Crear .env.local con Supabase y Stripe

# 3. Base de datos
# Ejecutar en Supabase SQL Editor:
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/002_simplify_doctor_status.sql

# 4. Crear admin
# UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';

# 5. Correr
npm run dev → http://localhost:3000
```

---

## Aprendizajes del Proyecto

*Añadir aquí aprendizajes específicos de Doctory*

---

## Archivo de Contexto

*Decisiones importantes, trade-offs, justificaciones*
