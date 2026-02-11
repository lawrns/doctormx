# Guía de Estilo en Español - Doctor.mx

> **Versión:** 1.0
> **Fecha:** 2026-02-11
> **Marco:** LFPDPPP, NOM-004-SSA3-2012

---

## 📋 INTRODUCCIÓN

Esta guía establece los estándares para el uso del español en Doctor.mx, asegurando comunicación clara, empática y culturalmente apropiada para pacientes y profesionales de salud en México.

---

## 🎯 PRINCIPIOS FUNDAMENTALES

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRINCIPIOS DE COMUNICACIÓN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CLARIDAD                                                                │
│     └── Usar lenguaje claro y simple, avoiding medical jargon               │
│                                                                             │
│  2. EMPATÍA                                                                 │
│     └── Tono cálido y comprensivo con pacientes                            │
│                                                                             │
│  3. FORMALIDAD MÉDICA                                                      │
│     └── "Usted" para contextos médicos, "tú" solo en apropiado              │
│                                                                             │
│  4. PRECISIÓN TERMINOLÓGICA                                                │
│     └── Usar términos NOM-004 cuando sea necesario                         │
│                                                                             │
│  5. CULTURA MEXICANA                                                        │
│     └── Español de México, formatos locales, expresiones apropiadas         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 👨‍⚕️ TERMINOLOGÍA MÉDICA (NOM-004-SSA3-2012)

### Términos Estándar

| Español (Correcto) | Incorrecto | Inglés |
|--------------------|------------|--------|
| **Médico** | Doctor | Doctor (Physician) |
| **Enfermera/o** | Nurse | Nurse |
| **Paciente** | Paciente (OK) | Patient |
| **Expediente clínico** | Expediente (OK) | Medical record |
| **Receta médica** | Prescripción | Prescription |
| **Diagnóstico** | Diagnóstico (OK) | Diagnosis |
| **Tratamiento** | Tratamiento (OK) | Treatment |
| **Síntoma** | Síntoma (OK) | Symptom |
| **Signo vital** | Signo vital (OK) | Vital sign |
| **Hipertensión arterial** | Presión alta | High blood pressure |
| **Infarto al miocardio** | Ataque al corazón | Heart attack |
| **Accidente cerebrovascular** | Derrame cerebral | Stroke |
| **Diabetes mellitus** | Diabetes (OK) | Diabetes |
| **Neumonía** | Neumonía (OK) | Pneumonia |
| **Fractura** | Fractura (OK) | Fracture |
| **Lesión** | Lesión (OK) | Injury |
| **Traumatismo** | Traumatismo (OK) | Trauma |

### Explicaciones para Pacientes

Cuando se use terminología médica compleja, proporcionar explicación sencilla:

```typescript
// Ejemplo en código
const PATIENT_FRIENDLY_TERMS: Record<string, string> = {
  'hipertensión arterial': 'presión alta',
  'hiperglucemia': 'azúcar alta en la sangre',
  'disnea': 'dificultad para respirar',
  'edema': 'hinchazón',
  'cefalea': 'dolor de cabeza',
  'mialgia': 'dolor muscular',
  'artralgia': 'dolor en las articulaciones',
}
```

---

## 📝 MENSAJES DE ERROR

### Errores Comunes con Fraseología Apropiada

| Contexto | Mensaje |
|----------|---------|
| **Conexión fallida** | "No pudimos conectar. Por favor verifica tu internet e intenta de nuevo." |
| **Error genérico** | "Algo salió mal. Si continúa, contacta a soporte." |
| **Error médico** | "Lo sentimos, hubo un error. Por favor intenta nuevamente." |
| **Validación** | "Por favor revisa los campos marcados." |
| **Timeout** | "Tardó mucho tiempo. Intenta de nuevo." |
| **No encontrado** | "No encontramos lo que buscas." |
| **Sin permisos** | "No tienes permiso para realizar esta acción." |
| **Mantenimiento** | "Estamos mejorando el servicio. Vuelve en unos minutos." |

### Tono de Errores Médicos

```typescript
// Empático y claro
const MEDICAL_ERROR_MESSAGES = {
  consultation_failed: {
    title: "Lo sentimos, no pudimos procesar tu consulta",
    message: "Por favor intenta nuevamente. Si el problema persiste, nuestro equipo médico te ayudará.",
    action: "Intentar nuevamente"
  },
  appointment_unavailable: {
    title: "Horario no disponible",
    message: "Este horario ya fue reservado. Por favor selecciona otro.",
    action: "Ver otros horarios"
  },
  prescription_error: {
    title: "Error al generar receta",
    message: "No pudimos crear tu receta. Por favor intenta de nuevo o contacta a tu médico.",
    action: "Reintentar"
  }
}
```

---

## 🎨 ETIQUETAS DE UI

### Botones y Acciones

| Inglés | Español (México) | Notas |
|--------|------------------|-------|
| Sign up | Registrarse | No "Registrarse arriba" |
| Log in | Iniciar sesión | No "Entrar" |
| Sign out | Cerrar sesión | No "Salir" |
| Book appointment | Agendar cita | Más natural que "Reservar" |
| Cancel | Cancelar | OK |
| Confirm | Confirmar | OK |
| Submit | Enviar | OK |
| Save | Guardar | OK |
| Delete | Eliminar | OK |
| Edit | Editar | OK |
| Search | Buscar | OK |
| Filter | Filtrar | OK |
| Sort | Ordenar | OK |
| Back | Regresar | No "Volver" |
| Next | Siguiente | OK |
| Previous | Anterior | No "Atrás" |
| Continue | Continuar | OK |
| Finish | Finalizar | OK |
| Skip | Omitir | OK |
| Retry | Reintentar | OK |
| Refresh | Actualizar | OK |
| Download | Descargar | OK |
| Upload | Subir | OK |

### Términos Médicos en UI

| Contexto | Término |
|----------|---------|
| Doctor profile | Perfil del médico |
| Medical specialty | Especialidad médica |
| Consultation | Consulta médica |
| Appointment | Cita |
| Prescription | Receta médica |
| Diagnosis | Diagnóstico |
| Symptoms | Síntomas |
| Medical history | Historial médico |
| Vital signs | Signos vitales |
| Treatment plan | Plan de tratamiento |
| Follow-up | Seguimiento |
| Referral | Referencia |

---

## 📅 FORMATOS LOCALES

### Fechas

```typescript
// Formato mexicano: DD/MM/YYYY
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
  // Resultado: "11/02/2026"
}

// Con nombre del mes
const formatDateLong = (date: Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  // Resultado: "11 de febrero de 2026"
}
```

### Horas

```typescript
// 12-hour format con AM/PM (común en México)
const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
  // Resultado: "3:30 PM"
}

// Hora relativa
const formatRelativeTime = (date: Date): string => {
  const rtf = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' })
  // Resultados: "hace 5 minutos", "en 2 horas"
}
```

### Números y Moneda

```typescript
// Formato de moneda mexicana
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount)
  // Resultado: "$1,234.56 MXN"
}

// Números con separadores
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-MX').format(num)
  // Resultado: "1,234.56"
}
```

---

## 🗣️ NIVELES DE FORMALIDAD

### Usted vs Tú

```typescript
// REGLA: Usar "usted" en contextos médicos
const FORMALITY_RULES = {
  // Contextos que requieren "usted"
  usted: [
    'paciente_hablando_con_medico',
    'expediente_clinico',
    'diagnostico',
    'tratamiento',
    'signos_vitales',
    'receta_medica',
  ],

  // Contextos donde "tú" es aceptable
  tu: [
    'chat_entre_pacientes',  // Si se implementa
    'mensajes_informativos',  // Algunos casos
    'recordatorios_casuales',  // Citas próximas
  ],

  // Siempre "usted"
  siempre_usted: [
    'primera_interaccion',
    'mayor_de_40',
    'contexto_profesional',
  ]
}
```

### Ejemplos de Formalidad

| Informal | Formal (Preferido) | Contexto |
|----------|-------------------|----------|
| "Tienes un appointment" | "Tiene una cita" | Paciente |
| "Dime tus síntomas" | "Cuénteme sus síntomas" | Consulta |
| "Vas a tomar este medicamento" | "Tomará este medicamento" | Receta |

---

## ❌ ERRORES COMUNES

### Traducciones Incorrectas a Evitar

| ❌ No Usar | ✅ Usar En Su Lugar |
|------------|-------------------|
| "Apúntate" | "Agendar" / "Registrarse" |
| "Checar" | "Verificar" / "Revisar" |
| "Aplastar" (botón) | "Presionar" / "Tocar" |
| "Cliquear" | "Hacer clic" |
| "Flete" | "Envío" |
| "Rentar" | "Alquilar" / "Reservar" |
| "Llamarme" | "Contactarme" |
| "Parquear" | "Estacionar" |
| "Troca" | "Camioneta" / "Pickup" |

### Falsos Cognados

| Inglés | No Significa | Significado Correcto |
|--------|--------------|---------------------|
| Actually | Actualmente | En realidad / De hecho |
| Embarrassed | Embarazada | Avergonzada |
| Exit | Éxito | Salida |
| introduce | Introducir | Presentar / Insertar |
| realize | Realizar | Darse cuenta / Comprender |
| attend | Atender | Asistir / Presentarse |

---

## 📊 REFERENCIA RÁPIDA

### Constantes para Código

```typescript
// src/lib/constants/medical-terminology.ts

export const SPANISH_UI = {
  // Acciones comunes
  actions: {
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    search: 'Buscar',
    filter: 'Filtrar',
    retry: 'Reintentar',
    close: 'Cerrar',
  },

  // Estado
  status: {
    loading: 'Cargando...',
    success: '¡Completado!',
    error: 'Algo salió mal',
    pending: 'Pendiente',
  },

  // Términos médicos
  medical: {
    doctor: 'Médico',
    patient: 'Paciente',
    appointment: 'Cita',
    prescription: 'Receta médica',
    diagnosis: 'Diagnóstico',
    symptoms: 'Síntomas',
    treatment: 'Tratamiento',
  },

  // Errores
  errors: {
    network: 'No pudimos conectar. Intenta de nuevo.',
    generic: 'Algo salió mal. Si continúa, contacta soporte.',
    medical: 'Lo sentimos, hubo un error. Intenta nuevamente.',
  },
}
```

---

## 🔍 REVISIÓN

### Checklist para Nuevas Características

- [ ] Términos médicos siguen NOM-004
- [ ] "Usted" para contextos médicos
- [ ] Mensajes de error son claros y empáticos
- [ ] Fechas en formato DD/MM/YYYY
- [ ] Moneda en formato MXN
- [ ] No usar modismos regionales específicos
- [ ] Explicaciones simples para términos complejos
- [ ] Verificar traducción con hablante nativo español

---

*Documento creado: 2026-02-11*
*Próxima revisión: 2026-05-11*
