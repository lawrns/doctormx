# Guía de Prueba - Flujo Completo

## 🎯 Objetivo
Validar que los 4 flujos principales funcionan end-to-end

---

## ⚙️ Preparación (Una sola vez)

### 1. Ejecutar migración en Supabase
Ve a: https://supabase.com/dashboard/project/oxlbametpfubwnrmrbsv/sql/new

Ejecuta el contenido de: `supabase/migrations/002_simplify_doctor_status.sql`

### 2. Servidor corriendo
```bash
npm run dev
```

Abre: http://localhost:3000

---

## 🧪 FLUJO 1: Doctor se registra y configura

### Paso 1: Registro
1. Ve a http://localhost:3000/auth/register
2. Completa:
   - Email: `doctor1@test.com`
   - Contraseña: `Test123!`
   - Nombre: `Dr. Carlos Ruiz`
   - Teléfono: `5512345678`
   - **Selecciona: "Soy doctor"**
3. Click "Registrarse"

✅ **Esperado**: Redirige a `/doctor/onboarding`

### Paso 2: Completar Onboarding
En `/doctor/onboarding`:

1. **Perfil básico**:
   - Especialidad: `Medicina General`
   - Años de experiencia: `10`
   - Biografía: `Médico general con amplia experiencia`
   - Cédula: `MED-123456`

2. **Precio**:
   - Precio consulta: `500` (MXN)

3. **Disponibilidad** (habilitar al menos un día):
   - ✓ Lunes: 09:00 - 17:00
   - ✓ Martes: 09:00 - 17:00
   - ✓ Miércoles: 09:00 - 17:00

4. Click "Guardar y Continuar"

✅ **Esperado**: 
- Redirige a `/doctor` (dashboard)
- Muestra badge "En revisión"
- NO aparece en catálogo público aún

---

## 🧪 FLUJO 2: Admin verifica doctor

### Paso 1: Crear admin (SQL)
En Supabase SQL Editor:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'doctor1@test.com';
```

### Paso 2: Logout y login como admin
1. Logout en la app
2. Login con `doctor1@test.com` / `Test123!`

✅ **Esperado**: Redirige a `/admin`

### Paso 3: Verificar doctor
1. Ve a `/admin/verify` o click en "Verificar Doctores"
2. Deberías ver: `Dr. Carlos Ruiz` en la lista
3. Click en el doctor
4. Revisa la info
5. Click "Aprobar"

✅ **Esperado**:
- Status cambia a `approved`
- Doctor ahora visible en catálogo

---

## 🧪 FLUJO 3: Paciente reserva cita

### Paso 1: Crear paciente
1. Logout
2. Ve a `/auth/register`
3. Completa:
   - Email: `paciente1@test.com`
   - Contraseña: `Test123!`
   - Nombre: `María López`
   - Teléfono: `5587654321`
   - **Selecciona: "Soy paciente"**

✅ **Esperado**: Redirige a `/app`

### Paso 2: Explorar doctores (público)
1. Logout
2. Ve a http://localhost:3000
3. Click "Buscar doctores" o ve a `/doctors`

✅ **Esperado**: 
- Ves el catálogo SIN login
- Dr. Carlos Ruiz aparece en la lista

### Paso 3: Ver perfil doctor
1. Click en "Dr. Carlos Ruiz"

✅ **Esperado**: 
- Ves perfil completo
- Precio: $500 MXN
- Especialidad, bio, años experiencia
- Botón "Reservar cita"

### Paso 4: Intentar reservar SIN login
1. Click "Reservar cita"

✅ **Esperado**: 
- Redirige a `/auth/login?redirect=/book/{doctorId}`

### Paso 5: Login y reservar
1. Login con `paciente1@test.com` / `Test123!`

✅ **Esperado**: 
- Redirige a `/book/{doctorId}`
- Muestra formulario de reserva

### Paso 6: Seleccionar fecha/hora
1. Selecciona una fecha (hoy o mañana)
2. Espera a que carguen los slots
3. Selecciona un horario disponible
4. Click "Reservar cita"

✅ **Esperado**: 
- Redirige a `/checkout/{appointmentId}`
- Muestra formulario de pago Stripe

### Paso 7: Pagar (modo test)
1. Tarjeta: `4242 4242 4242 4242`
2. Fecha: Cualquier futura (ej: 12/25)
3. CVC: `123`
4. Click "Pagar"

✅ **Esperado**: 
- Redirige a `/payment-success`
- Cita confirmada
- Status: `confirmed`

---

## 🧪 FLUJO 4: Consulta médica

### Paso 1: Acceder a consulta (como paciente)
1. Login como `paciente1@test.com`
2. Ve a `/app` (dashboard)
3. Deberías ver tu cita próxima
4. Click "Entrar a consulta" (o ve directo a `/consultation/{appointmentId}`)

✅ **Esperado**: 
- Muestra página de consulta
- Botón "Ingresar a Videollamada"
- Link de Jitsi generado

### Paso 2: Unirse a videollamada
1. Click "Ingresar a Videollamada"

✅ **Esperado**: 
- Abre Jitsi en nueva pestaña
- Sala de video funcional

---

## ✅ Checklist de Validación

### Flujo Doctor:
- [ ] Registro exitoso
- [ ] Redirige a onboarding
- [ ] Form de onboarding completo
- [ ] Puede configurar disponibilidad
- [ ] Al guardar queda en "pending"
- [ ] NO aparece en catálogo público

### Flujo Admin:
- [ ] Ve lista de doctores pending
- [ ] Puede aprobar
- [ ] Doctor cambia a "approved"
- [ ] Aparece en catálogo

### Flujo Paciente:
- [ ] Ve catálogo sin login
- [ ] Al intentar reservar, pide login
- [ ] Tras login, lleva a booking
- [ ] Ve slots disponibles
- [ ] Crea cita correctamente
- [ ] Redirige a checkout
- [ ] Pago funciona (Stripe test mode)
- [ ] Cita se confirma

### Flujo Consulta:
- [ ] Paciente ve su cita
- [ ] Puede entrar a consulta
- [ ] Link de Jitsi funciona

---

## 🐛 Problemas Conocidos a Validar

1. **Middleware**: ¿Realmente bloquea /book sin auth?
2. **Slots**: ¿Se calculan correctamente según disponibilidad del doctor?
3. **Pago**: ¿Stripe test keys configuradas?
4. **Estados**: ¿Los 3 estados (pending/approved/suspended) funcionan?

---

## 📝 Notas

- Usar emails diferentes para cada prueba
- Stripe en modo test: usa tarjeta 4242...
- Si algo falla, revisar console del navegador
- Logs del servidor en terminal

