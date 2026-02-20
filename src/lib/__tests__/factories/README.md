# Mock Factories para Testing - Doctor.mx

Este directorio contiene factories estandarizadas para generar datos de prueba consistentes y realistas para el proyecto Doctor.mx.

## 📁 Estructura

```
src/lib/__tests__/factories/
├── index.ts                    # Exporta todas las factories
├── user.factory.ts             # Factory para usuarios (pacientes, doctores, admins)
├── appointment.factory.ts      # Factory para citas médicas
├── prescription.factory.ts     # Factory para recetas médicas
├── conversation.factory.ts     # Factory para conversaciones de chat
├── message.factory.ts          # Factory para mensajes de chat
├── *.factory.test.ts           # Tests de cada factory
├── README.md                   # Esta documentación
└── examples/
    └── usage-examples.test.ts  # Ejemplos de uso
```

## 🚀 Uso Rápido

```typescript
import { 
  UserFactory, 
  AppointmentFactory, 
  PrescriptionFactory 
} from '@/lib/__tests__/factories'

// Crear un paciente
const patient = UserFactory.createPatient()

// Crear un doctor
const doctor = UserFactory.createDoctor({ full_name: 'Dr. Carlos Pérez' })

// Crear una cita confirmada
const appointment = AppointmentFactory.createConfirmed({
  patient_id: patient.id,
  doctor_id: doctor.id,
})

// Crear una receta con 3 medicamentos
const prescription = PrescriptionFactory.createWithMedications(3, {
  appointment_id: appointment.id,
})

// Crear múltiples usuarios
const patients = UserFactory.createList(50)
```

## 📋 Factories Disponibles

### UserFactory

Crea perfiles de usuario con datos realistas mexicanos.

```typescript
// Métodos disponibles
UserFactory.create(overrides?)           // Usuario base
UserFactory.createPatient(overrides?)    // Paciente con fecha de nacimiento
UserFactory.createDoctor(overrides?)     // Doctor con prefijo "Dr."
UserFactory.createAdmin(overrides?)      // Administrador
UserFactory.createList(count, overrides?) // Lista de usuarios
```

**Características:**
- Nombres reales mexicanos (María, José, Ana, etc.)
- Apellidos hispanos (García, Martínez, López, etc.)
- Emails válidos basados en el nombre
- Teléfonos mexicanos válidos (+52)
- Fotos de perfil generadas automáticamente
- UUIDs únicos
- Timestamps coherentes

### AppointmentFactory

Crea citas médicas con diferentes estados.

```typescript
// Métodos disponibles
AppointmentFactory.create(overrides?)              // Cita base (confirmed)
AppointmentFactory.createPending(overrides?)       // Pendiente de pago
AppointmentFactory.createConfirmed(overrides?)     // Confirmada con sala de video
AppointmentFactory.createCompleted(overrides?)     // Completada con notas
AppointmentFactory.createCancelled(overrides?)     // Cancelada con razón
AppointmentFactory.createNoShow(overrides?)        // No asistió
AppointmentFactory.createRefunded(overrides?)      // Reembolsada
AppointmentFactory.createList(count, overrides?)   // Lista de citas
```

**Características:**
- Horarios de 30 minutos por defecto
- Fechas futuras realistas (próximos 30 días)
- URLs de sala de video para citas confirmadas
- Razones de visita médicas realistas
- Timestamps de video para citas completadas

### PrescriptionFactory

Crea recetas médicas con medicamentos.

```typescript
// Métodos disponibles
PrescriptionFactory.create(overrides?)                    // Receta base (1 medicamento)
PrescriptionFactory.createWithMedications(count, overrides?) // Con N medicamentos
PrescriptionFactory.createExpired(overrides?)             // Receta antigua (>30 días)
PrescriptionFactory.createWithPdf(overrides?)             // Con URL de PDF
PrescriptionFactory.createWithNotes(overrides?)           // Con notas médicas
PrescriptionFactory.createComplete(overrides?)            // Completa (meds + notas + PDF)
PrescriptionFactory.createList(count, overrides?)         // Lista de recetas
```

**Características:**
- Medicamentos comunes en México (Paracetamol, Amoxicilina, etc.)
- Dosis, frecuencia y duración realistas
- Instrucciones adicionales opcionales
- URLs de PDF generadas automáticamente
- Notas médicas contextualmente relevantes

### ConversationFactory

Crea conversaciones de chat entre pacientes y doctores.

```typescript
// Métodos disponibles
ConversationFactory.create(overrides?)              // Conversación base
ConversationFactory.createWithAppointment(id, overrides?) // Vinculada a cita
ConversationFactory.createArchived(overrides?)      // Archivada
ConversationFactory.createEmpty(overrides?)         // Sin mensajes
ConversationFactory.createActive(overrides?)        // Con mensaje reciente
ConversationFactory.createInactive(overrides?)      // Sin actividad reciente
ConversationFactory.createList(count, overrides?)   // Lista de conversaciones
ConversationFactory.createMixedList(count)          // Lista variada
```

**Características:**
- Previews de últimos mensajes realistas
- Estados de archivo (archived/unarchived)
- Timestamps de última actividad coherentes
- Vinculación opcional a citas

### MessageFactory

Crea mensajes de chat.

```typescript
// Métodos disponibles
MessageFactory.create(overrides?)                    // Mensaje base
MessageFactory.createFromPatient(overrides?)         // De paciente
MessageFactory.createFromDoctor(overrides?)          // De doctor
MessageFactory.createWithImage(overrides?)           # Con imagen adjunta
MessageFactory.createWithFile(overrides?)            // Con archivo adjunto
MessageFactory.createRead(overrides?)                // Mensaje leído
MessageFactory.createUnread(overrides?)              // Mensaje no leído
MessageFactory.createList(count, overrides?)         // Lista de mensajes
MessageFactory.createConversation(convId, patientId, doctorId, count) // Conversación simulada
MessageFactory.createMixedList(count)                // Lista variada
```

**Características:**
- Contenidos de mensajes contextualmente apropiados
- Soporte para imágenes y archivos adjuntos
- Estados de lectura (read_at)
- Generación de conversaciones completas

## 🎨 Características Comunes

Todas las factories:

1. **Generan IDs únicos** - UUID v4 válidos
2. **Datos realistas** - Nombres, emails, teléfonos mexicanos
3. **Timestamps coherentes** - Fechas válidas en formato ISO
4. **Override parcial** - Permite sobrescribir cualquier campo
5. **Tipado completo** - TypeScript con tipos estrictos
6. **JSDoc completo** - Documentación en cada método

## 📝 Ejemplos de Uso

### Escenario 1: Consulta Completa

```typescript
const patient = UserFactory.createPatient()
const doctor = UserFactory.createDoctor()

const appointment = AppointmentFactory.createCompleted({
  patient_id: patient.id,
  doctor_id: doctor.id,
})

const prescription = PrescriptionFactory.createComplete({
  appointment_id: appointment.id,
  patient_id: patient.id,
  doctor_id: doctor.id,
})
```

### Escenario 2: Prueba de Rendimiento

```typescript
const doctors = UserFactory.createList(10, { role: 'doctor' })
const patients = UserFactory.createList(100, { role: 'patient' })

const appointments = patients.map((patient, i) => 
  AppointmentFactory.createConfirmed({
    patient_id: patient.id,
    doctor_id: doctors[i % doctors.length].id,
  })
)
```

### Escenario 3: Conversación de Chat

```typescript
const conversation = ConversationFactory.createActive()
const patient = UserFactory.createPatient()
const doctor = UserFactory.createDoctor()

const messages = MessageFactory.createConversation(
  conversation.id,
  patient.id,
  doctor.id,
  20 // 20 mensajes
)
```

## ✅ Tests

Cada factory tiene sus propios tests:

```bash
# Ejecutar todos los tests de factories
npm test -- src/lib/__tests__/factories/ --run

# Ejecutar tests de una factory específica
npm test -- src/lib/__tests__/factories/user.factory.test.ts --run
```

## 🔗 Integración con Tests Existentes

Las factories pueden usarse junto con mocks existentes:

```typescript
import { mockSupabaseClient } from './mocks'
import { UserFactory, AppointmentFactory } from '@/lib/__tests__/factories'

describe('My Test', () => {
  it('should work with factories and mocks', async () => {
    const patient = UserFactory.createPatient()
    const appointment = AppointmentFactory.createConfirmed({
      patient_id: patient.id,
    })

    const mockClient = {
      ...mockSupabaseClient,
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ 
            data: appointment, 
            error: null 
          }),
        }),
      }),
    }

    // ... resto del test
  })
})
```

## 📊 Cobertura

Las factories cubren los siguientes tipos de datos:

- ✅ UserProfile (Pacientes, Doctores, Admins)
- ✅ Appointment (Todos los estados)
- ✅ Prescription (Con medicamentos)
- ✅ ChatConversation (Con/sin mensajes)
- ✅ ChatMessage (Texto, imágenes, archivos)

## 🔄 Actualización

Para agregar nuevos datos de prueba:

1. Agregar valores a los arrays de datos (nombres, medicamentos, etc.)
2. Crear nuevos métodos factory si es necesario
3. Actualizar los tests correspondientes
4. Mantener la compatibilidad hacia atrás

## 📄 Licencia

Parte del proyecto Doctor.mx - Uso interno.
