# Doctory - Plataforma de Teleconsultas Médicas

Sistema de teleconsultas médicas construido con Next.js 16, Supabase y Stripe.

## Setup en 5 minutos

### 1. Clonar e instalar
```bash
git clone <repo>
cd doctory-v2
npm install
```

### 2. Variables de entorno

Crear .env.local con las credenciales de Supabase y Stripe.

### 3. Inicializar base de datos

Ejecutar en Supabase SQL Editor (en orden):
1. supabase/migrations/001_initial_schema.sql
2. supabase/migrations/002_simplify_doctor_status.sql

### 4. Crear admin

UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';

### 5. Correr proyecto

npm run dev → http://localhost:3000

## Arquitectura: Sistemas Independientes

- lib/booking.ts: Input paciente+doctor+slot → Output cita
- lib/availability.ts: Input doctor+fecha → Output slots disponibles
- lib/payment.ts: Input cita → Output confirmada
- lib/discovery.ts: Input filtros → Output doctores
- lib/auth.ts: Input usuario → Output autorizado/redirect

## Estados del Doctor

Solo 2: unverified (puede configurar todo) y verified (publicado en catálogo).
Ver DECISIONES.md para el por qué.

## Flujos

Paciente: Explorar sin login → Ver slots sin login → Reservar → Login → Pago → Videollamada
Doctor: Registro → Onboarding 1 paso → Admin verifica → Publicado

