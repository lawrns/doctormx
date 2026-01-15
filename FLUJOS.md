# Flujos del Sistema

> **Principio:** El flujo es más importante que el diseño. Primero definimos los pasos, las fallas y lo obligatorio. La UI solo refleja el flujo.

---

## Flujo 1: Paciente reserva cita

### Orden de pasos
1. **Descubrir** → Catálogo de doctores (público, sin login)
2. **Elegir** → Click en doctor que le interesa
3. **Decidir** → Ve perfil completo + precio + disponibilidad
4. **Reservar** → Selecciona fecha/hora disponible
5. **Autenticar** → Login/registro solo si no está autenticado (justo antes de confirmar)
6. **Pagar** → Stripe checkout
7. **Confirmar** → Cita agendada + email confirmación

### Puntos de falla
- **No hay slots disponibles** → Muestra mensaje, sugiere otros doctores similares
- **Login/registro falla** → Mantiene slot reservado 5 min, permite reintentar
- **Pago falla** → Slot se libera, permite reintentar con otro método
- **Doctor se desactiva** → Cancela cita automática, reembolso completo

### Obligatorio vs Opcional
**Obligatorio:**
- Seleccionar doctor
- Seleccionar slot
- Estar autenticado
- Pagar

**Opcional:**
- Filtros de búsqueda (puede navegar sin filtrar)
- Notas al doctor (puede dejar vacío)

### Decisiones evitadas
- ❌ No preguntar "¿crear cuenta o iniciar sesión?" → Detectar email y decidir automático
- ❌ No preguntar "¿continuar como paciente?" → Ya está en flujo de paciente
- ❌ No preguntar "¿deseas agregar más citas?" → Una cosa a la vez

**Resultado:** 7 pasos lineales, sin bifurcaciones innecesarias.

---

## Flujo 2: Doctor se registra y verifica

### Orden de pasos
1. **Registro** → Crea cuenta con email + contraseña + tipo "doctor"
2. **Perfil básico** → Nombre, especialidad, experiencia
3. **Documentos** → Sube cédula profesional + identificación
4. **Disponibilidad** → Define horarios disponibles (lunes-domingo)
5. **Precio** → Define tarifa por consulta
6. **Enviar** → Submit para verificación
7. **Esperar** → Dashboard de "en revisión"
8. **Aprobación** → Admin aprueba → Doctor activo
9. **Publicación** → Aparece en catálogo público

### Puntos de falla
- **Documentos inválidos** → Admin rechaza con motivo → Doctor puede reenviar
- **Sin disponibilidad** → No puede activarse, muestra advertencia
- **Sin precio** → No puede activarse, obliga a definir

### Obligatorio vs Opcional
**Obligatorio:**
- Cédula profesional
- Al menos 1 horario disponible
- Precio definido
- Aprobación de admin

**Opcional:**
- Foto de perfil (usa placeholder)
- Bio extendida (usa bio corta)
- Múltiples especialidades (mínimo 1)

### Decisiones evitadas
- ❌ No preguntar "¿quieres llenar perfil después?" → Todo en onboarding lineal
- ❌ No preguntar "¿cuántos años de experiencia?" → Input numérico simple
- ❌ No preguntar "¿activar cuenta ahora?" → Solo se activa con aprobación

**Resultado:** Onboarding guiado en 5 pasos, no se puede omitir nada obligatorio.

---

## Flujo 3: Consulta médica

### Orden de pasos
1. **Notificación** → 15 min antes, email + push (si implementado)
2. **Entrar** → Botón "Unirse a consulta" se activa 10 min antes
3. **Sala de espera** → Ambos ven quién ya está conectado
4. **Videollamada** → Consulta (Jitsi/Daily)
5. **Notas** → Doctor toma notas durante consulta (opcional)
6. **Receta** → Doctor genera receta si es necesario (opcional)
7. **Finalizar** → Doctor marca como completada
8. **Feedback** → Paciente puede calificar (1-5 estrellas)

### Puntos de falla
- **Paciente no entra** → Doctor espera 15 min → Puede cancelar con reembolso
- **Doctor no entra** → Paciente espera 15 min → Reembolso automático
- **Conexión falla** → Ambos pueden reconectar sin perder la cita
- **Consulta muy corta (<5 min)** → Sistema sugiere verificar si fue error

### Obligatorio vs Opcional
**Obligatorio:**
- Pago previo confirmado
- Ambos entrar a la sala
- Doctor marcar como completada

**Opcional:**
- Notas durante consulta
- Receta (solo si doctor decide)
- Calificación de paciente

### Decisiones evitadas
- ❌ No preguntar "¿cómo quieres conectarte?" → Siempre video, un solo método
- ❌ No preguntar "¿enviar receta por email o descargar?" → Ambos automático
- ❌ No preguntar "¿dejar nota antes de entrar?" → Las notas son durante/después

**Resultado:** Flujo automático activado por horario, mínima intervención manual.

---

## Flujo 4: Admin verifica doctor

### Orden de pasos
1. **Dashboard** → Ve cola de doctores pendientes (ordenados por fecha)
2. **Revisar** → Click en doctor → Ve toda la info + documentos
3. **Decisión** → Aprobar o Rechazar
4. **Si rechaza** → Escribe motivo obligatorio
5. **Confirmar** → Doctor recibe notificación
6. **Si aprueba** → Doctor se activa automáticamente
7. **Publicación** → Doctor aparece en catálogo público inmediatamente

### Puntos de falla
- **Documentos ilegibles** → Rechazar con "Documentos no legibles"
- **Cédula inválida** → Rechazar con "Cédula no válida"
- **Datos incorrectos** → Rechazar con motivo específico

### Obligatorio vs Opcional
**Obligatorio:**
- Revisar documentos
- Tomar decisión (aprobar/rechazar)
- Motivo si rechaza

**Opcional:**
- Notas internas del admin (para seguimiento)

### Decisiones evitadas
- ❌ No preguntar "¿verificar ahora o después?" → Decide inmediatamente
- ❌ No preguntar "¿enviar email de confirmación?" → Automático siempre
- ❌ No opciones de "verificación parcial" → Es sí o no

**Resultado:** Proceso binario (aprobar/rechazar), sin estados intermedios.

---

## Principios de los flujos

### 1. Orden claro
Cada paso sabe cuál es el siguiente. No hay "elige tu propio camino".

### 2. Fallas previstas
Cada punto de falla tiene una acción clara, no deja al usuario colgado.

### 3. Obligatorio explícito
Si algo es obligatorio, se bloquea el avance. Si es opcional, se puede omitir sin preguntar.

### 4. Sin decisiones falsas
No preguntamos cosas que podemos decidir por el usuario de forma razonable.

### 5. Progreso visible
El usuario siempre sabe en qué paso está y cuántos faltan.

---

## Validación de implementación

### ¿Cómo verificar que la UI sigue el flujo?

Para cada flujo, revisar:

1. **¿Los pasos están en orden?** → Navegar y contar clicks
2. **¿Las fallas están manejadas?** → Simular errores y ver qué pasa
3. **¿Lo obligatorio bloquea?** → Intentar omitir pasos
4. **¿Se evitan decisiones?** → Contar cuántas veces se pregunta algo

Si la UI no refleja el flujo, el problema es el flujo, no la UI.

**La interfaz solo refleja un flujo ya claro.**
