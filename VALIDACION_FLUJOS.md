# Validación de Flujos - Resultado

## ❌ FLUJO 1: Paciente reserva cita - ROTO

### Orden actual vs. orden correcto

**Actual:**
1. Catálogo público ✅
2. Perfil doctor ✅  
3. Click "Reservar" → **Lleva directo a booking sin autenticar** ❌
4. Booking permite seleccionar fecha/hora sin auth ❌
5. Submit crea cita vía API... **pero la API no valida auth** ❌
6. Redirección a checkout ❌ (sin haber validado que esté logueado)

**Correcto según FLUJOS.md:**
1. Catálogo público ✅
2. Perfil doctor ✅
3. Decidir (ve precio + disponibilidad) ✅
4. **Click "Reservar" → Detecta si está autenticado**
   - Si NO → Middleware redirect a /auth/login?redirect=/book/{doctorId}
   - Si SÍ → Permite continuar
5. Selecciona fecha/hora
6. Submit crea cita (ya autenticado)
7. Redirect a checkout
8. Pagar
9. Confirmación

### Problemas detectados:

1. **app/book/[doctorId]/page.tsx es client component sin protección**
   - No usa `requireAuth()` porque es client component
   - Cualquiera puede acceder sin login
   - El booking debería ser server component o validar auth en cliente

2. **api/appointments/route.ts no valida autenticación**
   - Debería obtener userId del session
   - Actualmente acepta patientId del body (inseguro)

3. **No hay manejo de "login/registro justo antes de confirmar"**
   - El flujo dice: "Login/registro solo si no está autenticado (justo antes de confirmar)"
   - Actual: No hay este checkpoint

### Fallas no manejadas:

- ✅ No hay slots disponibles → Muestra mensaje en frontend
- ❌ Login/registro falla → NO mantiene slot reservado 5 min
- ❌ Pago falla → NO libera slot automáticamente
- ❌ Doctor se desactiva → NO hay sistema de cancelación automática

---

## ⚠️ FLUJO 2: Doctor se registra - PARCIAL

### Orden actual vs. correcto

**Actual:**
1. Registro con ?type=doctor ✅
2. Crea perfil + doctor record (status: draft) ✅
3. Redirect a /doctor/onboarding ✅
4. Onboarding muestra "completa tu perfil" pero... **no hay form** ❌
5. Status puede ser: draft, pending, rejected, approved ✅

**Correcto según FLUJOS.md:**
1. Registro ✅
2. **Formulario de onboarding en pasos:**
   - Perfil básico (nombre, especialidad, experiencia)
   - Documentos (cédula + ID)
   - Disponibilidad
   - Precio
3. Submit → status: pending
4. Dashboard "en revisión"
5. Admin aprueba/rechaza
6. Si aprueba → status: approved → catálogo público

### Problemas detectados:

1. **/doctor/onboarding/page.tsx solo muestra mensajes según status**
   - No tiene formulario para completar perfil
   - No permite subir documentos
   - No permite configurar disponibilidad
   - No permite configurar precio (usa default $500 MXN)

2. **No hay validación de campos obligatorios**
   - El flujo dice: sin disponibilidad + precio → no puede activarse
   - Actual: puede quedar en pending sin estos datos

3. **No hay upload de documentos**
   - El sistema requiere cédula + ID según FLUJOS.md
   - No existe componente de upload

### Fallas manejadas:

- ✅ Documentos inválidos → Admin puede rechazar con motivo
- ✅ Diferentes estados (draft, pending, rejected, approved)
- ❌ No puede reenviar documentos tras rechazo

---

## ✅ FLUJO 3: Consulta médica - FUNCIONAL

### Orden actual vs. correcto

**Actual:**
1. Cita confirmada (status: confirmed) ✅
2. Patient accede a /consultation/[appointmentId] ✅
3. Valida que sea su cita y esté confirmada ✅
4. Genera URL de Jitsi ✅
5. Botón "Ingresar a Consulta" ✅
6. Se abre en nueva pestaña ✅

**Correcto según FLUJOS.md:**
1. Notificación 15 min antes ❌ (no implementado)
2. Botón activo 10 min antes ❌ (siempre activo)
3. Sala de espera ❌ (directo a Jitsi)
4. Videollamada ✅
5. Notas durante consulta ❌ (no implementado)
6. Receta si necesario ❌ (existe sistema pero no integrado en flujo)
7. Finalizar → marca como completada ❌ (no hay botón)
8. Feedback paciente ❌ (no implementado)

### Problemas detectados:

1. **No hay restricción de tiempo para entrar**
   - Debería activarse 10 min antes
   - Debería desactivarse X tiempo después

2. **No hay sistema de "marcar como completada"**
   - Doctor no puede finalizar la consulta
   - No cambia status de confirmed → completed

3. **Receta no está integrada en flujo**
   - Existe api/prescriptions/route.ts
   - Pero no hay UI en la sala de consulta

### Fallas no manejadas:

- ❌ Paciente no entra → Doctor espera 15 min → no puede cancelar con reembolso
- ❌ Doctor no entra → no hay reembolso automático
- ✅ Conexión falla → pueden reconectar (Jitsi lo maneja)
- ❌ Consulta muy corta → no hay validación

---

## ✅ FLUJO 4: Admin verifica - FUNCIONAL

### Orden actual vs. correcto

**Actual:**
1. Dashboard admin ✅
2. /admin/verify muestra cola de pending ✅
3. Ordenados por fecha ✅
4. Click en doctor → ve info completa ✅
5. Botones Aprobar/Rechazar ✅
6. Si rechaza → debe escribir motivo ⚠️ (existe campo pero no es obligatorio en UI)
7. Submit via POST /api/admin/verify-doctor ✅
8. Doctor recibe cambio de status ✅
9. Si aprueba → status: approved → aparece en catálogo ✅

**Correcto según FLUJOS.md:**
1-9: Todos implementados ✅

### Problemas detectados:

1. **Motivo de rechazo no es obligatorio en frontend**
   - El form tiene el campo
   - Pero no hay validación required
   - Debería bloquear submit si rechaza sin motivo

2. **No hay notificación al doctor**
   - El status cambia pero no hay email/notificación
   - FLUJOS.md dice "Doctor recibe notificación"

### Resultado: **Funcional pero incompleto**

---

## Resumen de Validación

| Flujo | Estado | Pasos OK | Fallas Manejadas | Bloqueos | Decisiones Evitadas |
|-------|--------|----------|------------------|----------|---------------------|
| **1. Paciente reserva** | ❌ ROTO | 3/7 | 1/4 | 0/3 | 2/3 |
| **2. Doctor se registra** | ⚠️ PARCIAL | 3/9 | 2/3 | 0/3 | 3/3 |
| **3. Consulta médica** | ⚠️ PARCIAL | 3/8 | 1/4 | 0/3 | 2/3 |
| **4. Admin verifica** | ✅ FUNCIONAL | 9/9 | 3/3 | 2/3 | 2/2 |

---

## Prioridades de Arreglo

### 🔥 CRÍTICO (bloquea flujo completo):

1. **Proteger /book/[doctorId]** con auth
   - Hacer server component + requireAuth()
   - O agregar auth check en cliente antes de permitir submit

2. **Validar auth en api/appointments**
   - Obtener userId de session
   - No confiar en patientId del body

3. **Implementar onboarding form completo**
   - Perfil básico
   - Upload de documentos
   - Configurar disponibilidad
   - Configurar precio

### ⚠️ IMPORTANTE (degrada experiencia):

4. **Mantener slot reservado 5 min tras falla de login**
   - Agregar campo reserved_until en appointments
   - Limpiar con CRON o trigger

5. **Sistema de finalizar consulta**
   - Botón para doctor
   - Cambiar status a completed
   - Habilitar feedback de paciente

6. **Restricción de tiempo para entrar a consulta**
   - Botón activo 10 min antes
   - Validar tiempo en server

### 📋 DESEABLE (completa flujo ideal):

7. Notificaciones (email/push)
8. Sistema de cancelación automática
9. Reembolsos automáticos
10. Feedback de pacientes

---

## Siguiente Acción

¿Empiezo por los 3 críticos?

1. Proteger booking con auth
2. Validar auth en API appointments
3. Implementar onboarding form

O prefieres priorizar diferente?
