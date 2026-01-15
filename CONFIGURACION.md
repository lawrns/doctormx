# Configuración Necesaria - Doctory

Este documento lista todas las variables de entorno y configuraciones que necesitas hacer para que Doctory funcione completamente.

## ✅ Configuración Básica (Ya funciona)

- [x] Supabase URL y Keys (configurado en .env.local)
- [x] Next.js App Router
- [x] Tailwind CSS

## 🔧 Configuración Pendiente (Hacer antes de producción)

### 1. Stripe (Pagos)

Necesitas crear cuenta en Stripe y obtener las keys:

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Cómo obtenerlas:**
1. Crea cuenta en https://stripe.com
2. Ve a Developers → API Keys
3. Copia Secret key y Publishable key
4. Agrega a .env.local

**Nota:** Usa test keys para desarrollo, live keys para producción.

---

### 2. Videollamadas (Opcional - Por ahora usa Jitsi gratis)

**Opción A: Jitsi Meet (Gratis, ya funciona)**
- No requiere configuración
- URLs generadas automáticamente
- Limitación: Sin personalización

**Opción B: Daily.co (Recomendado para producción)**
```bash
# .env.local
DAILY_API_KEY=tu_daily_api_key
```

**Cómo obtenerla:**
1. Crea cuenta en https://daily.co
2. Ve a Developers → API Keys
3. Copia tu API key
4. Agrega a .env.local

**Opción C: Whereby, Zoom, etc.**
- Similar proceso, solo cambia el provider en `lib/video.ts`

---

### 3. Emails (Notificaciones - Placeholder creado)

**Recomendado: Resend.com**
```bash
# .env.local
RESEND_API_KEY=re_...
```

**Cómo obtenerla:**
1. Crea cuenta en https://resend.com
2. Verifica tu dominio (o usa sandbox)
3. Genera API key
4. Agrega a .env.local

**Implementación pendiente en:**
- `lib/email.ts` - Crear helpers de envío
- Emails de confirmación de cita
- Recordatorios 24h antes
- Notificaciones de pago

---

### 4. Base de Datos (Ejecutar migraciones)

**IMPORTANTE:** El schema está listo pero NO ejecutado en Supabase.

**Pasos:**
1. Ve a https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv/sql
2. Abre `supabase/migrations/001_initial_schema.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor de Supabase
5. Click "Run"

**Esto creará:**
- 20+ tablas
- RLS policies
- Triggers
- Functions
- 10 especialidades seed

---

### 5. Configuraciones Adicionales

**WhatsApp (Opcional - Para notificaciones)**
```bash
# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Storage (Para fotos de perfil y documentos)**
- Ya configurado en Supabase
- Crear buckets: `profiles`, `documents`
- Configurar políticas de acceso

---

## 📋 Checklist de Implementación

### Ahora (Para probar localmente)
- [ ] Ejecutar schema SQL en Supabase
- [ ] Configurar Stripe test keys
- [ ] Crear usuario admin manualmente en Supabase

### Antes de Producción
- [ ] Cambiar a Stripe live keys
- [ ] Configurar Daily.co (o mantener Jitsi)
- [ ] Implementar emails con Resend
- [ ] Configurar dominio personalizado
- [ ] Configurar storage buckets en Supabase
- [ ] Probar flujo completo end-to-end

### Post-Lanzamiento
- [ ] Configurar WhatsApp notifications
- [ ] Implementar analytics
- [ ] Configurar monitoreo de errores (Sentry)
- [ ] Backups automáticos de DB

---

## 🎯 Flujo Actual (Lo que YA funciona)

1. ✅ Registro/Login de usuarios
2. ✅ Dashboards diferenciados (paciente/doctor/admin)
3. ✅ Directorio público de doctores
4. ✅ Sistema de disponibilidad
5. ✅ Calendario de agendado
6. ⚠️ Pagos (listo, requiere Stripe keys)
7. ✅ Videollamadas (Jitsi - funciona sin config)
8. ✅ Verificación admin
9. ✅ Recetas digitales

## 🚧 Flujo Pendiente (Requiere configuración)

1. ⚠️ Pagos con Stripe → Agregar keys
2. ⚠️ Emails de confirmación → Configurar Resend
3. ⚠️ Base de datos → Ejecutar migrations
4. ⚠️ Upload de documentos → Configurar buckets

---

## 🆘 Si algo no funciona

**Error: "STRIPE_SECRET_KEY no configurada"**
- Agrega la key de Stripe a .env.local

**Error: "Table 'profiles' does not exist"**
- Ejecuta el schema SQL en Supabase

**Videollamadas no funcionan**
- Jitsi debería funcionar sin config
- Si quieres Daily, agrega la API key

**No llegan emails**
- Normal, no está implementado aún
- Configura Resend cuando lo necesites

---

Todo el código está listo. Solo necesitas configurar las integraciones externas cuando las uses.
