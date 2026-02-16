# UI/UX TESTING CHECKLIST - Doctor.mx
## Guía Completa de Pruebas de Interfaz y Experiencia de Usuario

---

## 🎯 OBJETIVOS DEL TESTING

1. Verificar que todas las páginas cargan correctamente
2. Validar flujos de usuario principales
3. Identificar errores visuales o de comportamiento
4. Comprobar responsive design
5. Verificar accesibilidad básica

---

## 📋 CHECKLIST POR FLUJO

### FLUJO 1: LANDING PAGE → REGISTRO (Prioridad CRÍTICA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 1.1 | Cargar landing page | Abrir `http://localhost:3000` | Página carga sin errores, muestra Hero section | ⬜ |
| 1.2 | Navegación visible | Verificar menú superior | Logo, links (Especialidades, Para Doctores, etc.) visibles | ⬜ |
| 1.3 | Botón "Consulta Ahora" | Click en CTA principal | Navega a `/ai-consulta` o muestra login si no autenticado | ⬜ |
| 1.4 | Sección de especialidades | Scroll hasta especialidades | Muestra cards de especialidades médicas | ⬜ |
| 1.5 | Footer | Scroll al final | Muestra links legales, contacto, redes sociales | ⬜ |
| 1.6 | Link "Registrarse" | Click en registro | Navega a `/auth/register` | ⬜ |

### FLUJO 2: REGISTRO DE USUARIO (Prioridad CRÍTICA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 2.1 | Formulario de registro | Ir a `/auth/register` | Muestra formulario con campos: email, password, tipo de cuenta | ⬜ |
| 2.2 | Validación email | Ingresar email inválido | Muestra error de validación | ⬜ |
| 2.3 | Validación password | Ingresar password corto (<8 chars) | Muestra error "contraseña muy corta" | ⬜ |
| 2.4 | Toggle tipo de cuenta | Cambiar entre Paciente/Doctor | Formulario cambia según tipo seleccionado | ⬜ |
| 2.5 | Registro exitoso | Completar formulario válido | Redirige a dashboard o verificación de email | ⬜ |
| 2.6 | Link a login | Click en "¿Ya tienes cuenta?" | Navega a `/auth/login` | ⬜ |

### FLUJO 3: LOGIN (Prioridad CRÍTICA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 3.1 | Formulario de login | Ir a `/auth/login` | Muestra campos email y password | ⬜ |
| 3.2 | Login con credenciales válidas | Ingresar usuario registrado | Redirige a dashboard correspondiente | ⬜ |
| 3.3 | Login con credenciales inválidas | Ingresar password incorrecto | Muestra error "credenciales inválidas" | ⬜ |
| 3.4 | "Olvidé mi contraseña" | Click en link | Navega a `/auth/forgot-password` | ⬜ |
| 3.5 | Login social (si aplica) | Click en Google/Apple | Abre popup de autenticación | ⬜ |

### FLUJO 4: DASHBOARD PACIENTE (Prioridad ALTA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 4.1 | Cargar dashboard | Login como paciente | Muestra próximas citas, acciones rápidas | ⬜ |
| 4.2 | Navegación lateral | Verificar menú | Links: Inicio, Citas, Perfil, etc. | ⬜ |
| 4.3 | Botón "Agendar Cita" | Click en agendar | Navega a búsqueda de doctores | ⬜ |
| 4.4 | Sección "Próximas Citas" | Verificar lista | Muestra citas programadas o estado vacío | ⬜ |
| 4.5 | Acceso a consulta | Click en cita activa | Entra a sala de videollamada (o muestra detalle) | ⬜ |

### FLUJO 5: BÚSQUEDA DE DOCTORES (Prioridad ALTA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 5.1 | Lista de doctores | Ir a `/doctors` | Muestra cards de doctores con foto, nombre, especialidad | ⬜ |
| 5.2 | Filtro por especialidad | Seleccionar "Cardiología" | Lista se filtra solo cardiólogos | ⬜ |
| 5.3 | Filtro por ciudad | Seleccionar ciudad | Lista se filtra por ubicación | ⬜ |
| 5.4 | Búsqueda por nombre | Escribir nombre en search | Filtra resultados en tiempo real | ⬜ |
| 5.5 | Ver perfil de doctor | Click en card de doctor | Navega a `/doctors/[id]` con detalle completo | ⬜ |
| 5.6 | Disponibilidad | En perfil de doctor | Muestra calendario con slots disponibles | ⬜ |

### FLUJO 6: AGENDAR CITA (Prioridad ALTA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 6.1 | Seleccionar fecha | Click en día del calendario | Muestra slots disponibles para ese día | ⬜ |
| 6.2 | Seleccionar hora | Click en slot de tiempo | Slot queda seleccionado/highlighted | ⬜ |
| 6.3 | Formulario de booking | Continuar a booking | Muestra resumen y formulario de datos | ⬜ |
| 6.4 | Confirmar cita | Click en "Confirmar" | Crea cita y redirige a checkout/pago | ⬜ |
| 6.5 | Validación de campos | Dejar campos vacíos | Muestra errores de validación | ⬜ |

### FLUJO 7: PAGO (Prioridad MEDIA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 7.1 | Formulario de pago | En checkout | Muestra formulario Stripe (tarjeta) | ⬜ |
| 7.2 | Pago con tarjeta | Ingresar datos de prueba (4242...) | Procesa pago exitosamente | ⬜ |
| 7.3 | Pago OXXO (si aplica) | Seleccionar OXXO | Genera código de barras/instrucciones | ⬜ |
| 7.4 | Error de pago | Usar tarjeta declinada (4000...) | Muestra error de pago | ⬜ |
| 7.5 | Confirmación de pago | Después de pago exitoso | Muestra confirmación y detalles de cita | ⬜ |

### FLUJO 8: CONSULTA IA - DR. SIMEON (Prioridad ALTA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 8.1 | Iniciar consulta IA | Ir a `/ai-consulta` | Carga interfaz de chat con Dr. Simeon | ⬜ |
| 8.2 | Enviar mensaje | Escribir síntomas y enviar | Dr. Simeon responde con pregunta de seguimiento | ⬜ |
| 8.3 | Flujo de preguntas | Responder preguntas del sistema | Avanza por el cuestionario (OPQRST) | ⬜ |
| 8.4 | Detección de emergencia | Escribir "dolor de pecho severo" | Muestra ALERTA ROJA de emergencia | ⬜ |
| 8.5 | Generación de resumen | Completar consulta | Muestra resumen con recomendaciones | ⬜ |
| 8.6 | Escalar a doctor | Click en "Hablar con un doctor" | Redirige a búsqueda de doctores | ⬜ |

### FLUJO 9: VIDEO CONSULTA (Prioridad MEDIA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 9.1 | Sala de videollamada | Entrar a consulta programada | Carga interfaz de video (Daily.co) | ⬜ |
| 9.2 | Controles de video | Probar mute/unmute | Botones funcionan correctamente | ⬜ |
| 9.3 | Chat durante consulta | Enviar mensaje en chat | Mensaje aparece en el chat | ⬜ |
| 9.4 | Finalizar llamada | Click en colgar | Finaliza sesión y muestra resumen | ⬜ |

### FLUJO 10: PERFIL Y CONFIGURACIÓN (Prioridad MEDIA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 10.1 | Ver perfil | Ir a `/app/profile` | Muestra datos del usuario | ⬜ |
| 10.2 | Editar perfil | Click en "Editar" | Formulario editable se activa | ⬜ |
| 10.3 | Cambiar foto | Subir nueva foto | Preview de foto se actualiza | ⬜ |
| 10.4 | Configuración de notificaciones | Ir a settings | Muestra opciones de notificación | ⬜ |
| 10.5 | Privacidad y datos | Ir a sección de datos | Muestra opciones ARCO (acceso, rectificación, etc.) | ⬜ |

### FLUJO 11: DASHBOARD DOCTOR (Prioridad MEDIA)

| # | Prueba | Pasos | Resultado Esperado | Estado |
|---|--------|-------|-------------------|--------|
| 11.1 | Login como doctor | Usar cuenta de doctor | Dashboard muestra pacientes del día | ⬜ |
| 11.2 | Calendario de disponibilidad | Ir a disponibilidad | Muestra horarios configurables | ⬜ |
| 11.3 | Configurar horarios | Agregar/modificar slot | Guarda cambios correctamente | ⬜ |
| 11.4 | Ver pacientes | Lista de pacientes | Muestra historial de pacientes | ⬜ |
| 11.5 | Subir documentos | Sección de verificación | Permite subir cédula, título, etc. | ⬜ |

---

## 📱 PRUEBAS RESPONSIVE (Mobile)

| Dispositivo | Resolución | Estado |
|-------------|------------|--------|
| iPhone SE | 375×667 | ⬜ |
| iPhone 12/13/14 | 390×844 | ⬜ |
| iPad | 768×1024 | ⬜ |
| Android (Pixel 5) | 393×851 | ⬜ |

**Verificar en cada uno:**
- [ ] Menú hamburguesa funciona
- [ ] No hay scroll horizontal no deseado
- [ ] Botones son fáciles de tocar (mínimo 44px)
- [ ] Texto es legible (sin zoom necesario)

---

## ♿ PRUEBAS DE ACCESIBILIDAD

| # | Prueba | Resultado Esperado | Estado |
|---|--------|-------------------|--------|
| A1 | Navegación con Tab | Todos los elementos interactivos son alcanzables | ⬜ |
| A2 | Skip Link | Presionar Tab muestra "Saltar al contenido" | ⬜ |
| A3 | Contraste de colores | Texto legible sobre fondos (ratio 4.5:1+) | ⬜ |
| A4 | Labels en formularios | Todos los inputs tienen label asociado | ⬜ |
| A5 | Alt text en imágenes | Imágenes tienen descripción alternativa | ⬜ |

---

## 🐛 ERRORES A REPORTAR

**Formato:**
```
Flujo: [Nombre del flujo]
Paso: [# del paso]
Error: [Descripción del error]
Severidad: [Crítica/Alta/Media/Baja]
Screenshot: [Adjuntar imagen]
```

### Lista de Errores Encontrados:

| # | Flujo | Error | Severidad | Estado |
|---|-------|-------|-----------|--------|
| 1 | | | | ⬜ |
| 2 | | | | ⬜ |
| 3 | | | | ⬜ |

---

## ✅ CRITERIOS DE APROBACIÓN

**Mínimo para aprobar:**
- ✅ Todos los flujos CRÍTICOS funcionan (1-3)
- ✅ Todos los flujos ALTOS funcionan (4-6)
- ✅ No hay errores de JavaScript en consola (F12)
- ✅ Responsive funciona en mobile

**Ideal:**
- ✅ Todos los flujos funcionan
- ✅ Sin errores visuales
- ✅ Performance aceptable (< 3s carga)

---

**Instructor de Testing:** Abre `http://localhost:3000` y sigue el checklist paso a paso. Marca cada prueba como ✅ (pasa) o ❌ (falla). Si encuentras errores, documentalos en la sección de errores.

