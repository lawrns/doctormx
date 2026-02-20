/**
 * Factory Usage Examples
 *
 * Ejemplos de cómo usar las factories en tests existentes.
 * Estos ejemplos demuestran el uso de factories en lugar de mocks manuales.
 *
 * @example
 * ```typescript
 * // ANTES: Mock manual
 * const mockUser = {
 *   id: 'user-123',
 *   full_name: 'Test User',
 *   email: 'test@test.com',
 *   // ... más campos
 * }
 *
 * // DESPUÉS: Con Factory
 * const user = UserFactory.createPatient()
 * ```
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  UserFactory,
  AppointmentFactory,
  PrescriptionFactory,
  ConversationFactory,
  MessageFactory,
} from '@/lib/__tests__/factories'

describe('Factory Usage Examples', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('UserFactory Examples', () => {
    it('should create realistic patient data for user tests', () => {
      // Crear un paciente con datos específicos
      const patient = UserFactory.createPatient({
        full_name: 'María González López',
        email: 'maria.gonzalez@email.com',
      })

      expect(patient.role).toBe('patient')
      expect(patient.full_name).toBe('María González López')
      expect(patient.email).toBe('maria.gonzalez@email.com')
      expect(patient.date_of_birth).not.toBeNull()
      expect(patient.gender).not.toBeNull()
    })

    it('should create realistic doctor data', () => {
      // Crear un doctor
      const doctor = UserFactory.createDoctor({
        full_name: 'Dr. Carlos Ramírez',
      })

      expect(doctor.role).toBe('doctor')
      expect(doctor.full_name).toMatch(/^Dr\.\s/)
      expect(doctor.phone).toMatch(/^\+52/)
    })

    it('should create multiple users for batch operations', () => {
      // Crear 50 pacientes para pruebas de rendimiento
      const patients = UserFactory.createList(50, { role: 'patient' })

      expect(patients).toHaveLength(50)
      
      // Verificar que todos tienen IDs únicos
      const ids = patients.map(p => p.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(50)
    })
  })

  describe('AppointmentFactory Examples', () => {
    it('should create appointments for different scenarios', () => {
      // Cita pendiente
      const pending = AppointmentFactory.createPending()
      expect(pending.status).toBe('pending_payment')

      // Cita confirmada
      const confirmed = AppointmentFactory.createConfirmed()
      expect(confirmed.status).toBe('confirmed')
      expect(confirmed.video_room_url).not.toBeNull()

      // Cita completada
      const completed = AppointmentFactory.createCompleted()
      expect(completed.status).toBe('completed')
      expect(completed.video_started_at).not.toBeNull()
      expect(completed.consultation_notes).not.toBeNull()

      // Cita cancelada
      const cancelled = AppointmentFactory.createCancelled()
      expect(cancelled.status).toBe('cancelled')
      expect(cancelled.cancellation_reason).not.toBeNull()
    })

    it('should create appointments with specific patient and doctor', () => {
      const patient = UserFactory.createPatient()
      const doctor = UserFactory.createDoctor()

      const appointment = AppointmentFactory.createConfirmed({
        patient_id: patient.id,
        doctor_id: doctor.id,
        reason_for_visit: 'Dolor de cabeza persistente',
      })

      expect(appointment.patient_id).toBe(patient.id)
      expect(appointment.doctor_id).toBe(doctor.id)
      expect(appointment.reason_for_visit).toBe('Dolor de cabeza persistente')
    })

    it('should create a schedule of appointments', () => {
      // Crear un calendario de citas para un doctor
      const doctorId = UserFactory.createDoctor().id
      
      const todayAppointments = AppointmentFactory.createList(5, {
        doctor_id: doctorId,
        status: 'confirmed',
        start_ts: new Date().toISOString(),
      })

      const tomorrowAppointments = AppointmentFactory.createList(3, {
        doctor_id: doctorId,
        status: 'pending_payment',
        start_ts: new Date(Date.now() + 86400000).toISOString(),
      })

      const allAppointments = [...todayAppointments, ...tomorrowAppointments]
      expect(allAppointments).toHaveLength(8)
      expect(allAppointments.every(a => a.doctor_id === doctorId)).toBe(true)
    })
  })

  describe('PrescriptionFactory Examples', () => {
    it('should create prescriptions with medications', () => {
      // Receta con 3 medicamentos
      const prescription = PrescriptionFactory.createWithMedications(3, {
        notes: 'Paciente con alergia a penicilina',
      })

      expect(prescription.medications).toHaveLength(3)
      expect(prescription.notes).toBe('Paciente con alergia a penicilina')
      
      // Verificar estructura de medicamentos
      prescription.medications.forEach(med => {
        expect(med).toHaveProperty('name')
        expect(med).toHaveProperty('dosage')
        expect(med).toHaveProperty('frequency')
        expect(med).toHaveProperty('duration')
        expect(med).toHaveProperty('quantity')
      })
    })

    it('should create a complete prescription with PDF', () => {
      const prescription = PrescriptionFactory.createComplete()

      expect(prescription.medications.length).toBeGreaterThanOrEqual(2)
      expect(prescription.notes).not.toBeNull()
      expect(prescription.pdf_url).not.toBeNull()
      expect(prescription.pdf_url).toContain(prescription.id)
    })

    it('should create prescription for a specific appointment', () => {
      const appointment = AppointmentFactory.createCompleted()
      const doctor = UserFactory.createDoctor()
      const patient = UserFactory.createPatient()

      const prescription = PrescriptionFactory.createComplete({
        appointment_id: appointment.id,
        doctor_id: doctor.id,
        patient_id: patient.id,
      })

      expect(prescription.appointment_id).toBe(appointment.id)
      expect(prescription.doctor_id).toBe(doctor.id)
      expect(prescription.patient_id).toBe(patient.id)
    })
  })

  describe('ConversationFactory Examples', () => {
    it('should create conversations with different states', () => {
      // Conversación activa (mensaje reciente)
      const active = ConversationFactory.createActive()
      expect(active.is_archived).toBe(false)
      expect(active.last_message_at).not.toBeNull()

      // Conversación inactiva
      const inactive = ConversationFactory.createInactive()
      expect(inactive.is_archived).toBe(false)
      const lastMessageDate = new Date(inactive.last_message_at!)
      const daysAgo = (Date.now() - lastMessageDate.getTime()) / (1000 * 60 * 60 * 24)
      expect(daysAgo).toBeGreaterThan(7)

      // Conversación archivada
      const archived = ConversationFactory.createArchived()
      expect(archived.is_archived).toBe(true)

      // Conversación vacía
      const empty = ConversationFactory.createEmpty()
      expect(empty.last_message_preview).toBeNull()
      expect(empty.last_message_at).toBeNull()
    })

    it('should create conversation linked to appointment', () => {
      const appointment = AppointmentFactory.createConfirmed()
      const conversation = ConversationFactory.createWithAppointment(appointment.id)

      expect(conversation.appointment_id).toBe(appointment.id)
    })
  })

  describe('MessageFactory Examples', () => {
    it('should create conversation messages', () => {
      const conversationId = ConversationFactory.create().id
      const patient = UserFactory.createPatient()
      const doctor = UserFactory.createDoctor()

      // Crear una conversación simulada de 10 mensajes
      const messages = MessageFactory.createConversation(
        conversationId,
        patient.id,
        doctor.id,
        10
      )

      expect(messages).toHaveLength(10)
      expect(messages.every(m => m.conversation_id === conversationId)).toBe(true)

      // Verificar que hay mensajes de ambos participantes
      const patientMessages = messages.filter(m => m.sender_type === 'patient')
      const doctorMessages = messages.filter(m => m.sender_type === 'doctor')
      expect(patientMessages.length).toBeGreaterThan(0)
      expect(doctorMessages.length).toBeGreaterThan(0)
    })

    it('should create messages with attachments', () => {
      // Mensaje con imagen
      const imageMessage = MessageFactory.createWithImage()
      expect(imageMessage.message_type).toBe('image')
      expect(imageMessage.attachment_url).not.toBeNull()
      expect(imageMessage.attachment_type).toBe('image/jpeg')

      // Mensaje con archivo
      const fileMessage = MessageFactory.createWithFile()
      expect(fileMessage.message_type).toBe('file')
      expect(fileMessage.attachment_name).not.toBeNull()
    })

    it('should simulate read/unread messages', () => {
      // Mensaje leído
      const readMessage = MessageFactory.createRead()
      expect(readMessage.read_at).not.toBeNull()

      // Mensaje no leído
      const unreadMessage = MessageFactory.createUnread()
      expect(unreadMessage.read_at).toBeNull()
    })
  })

  describe('Combined Usage Examples', () => {
    it('should create a complete patient consultation scenario', () => {
      // Crear todos los datos necesarios para una consulta completa
      const patient = UserFactory.createPatient()
      const doctor = UserFactory.createDoctor()
      
      const appointment = AppointmentFactory.createCompleted({
        patient_id: patient.id,
        doctor_id: doctor.id,
        reason_for_visit: 'Dolor de pecho y dificultad para respirar',
      })

      const prescription = PrescriptionFactory.createComplete({
        appointment_id: appointment.id,
        doctor_id: doctor.id,
        patient_id: patient.id,
        notes: 'Paciente estable, signos vitales normales',
      })

      const conversation = ConversationFactory.createWithAppointment(appointment.id, {
        patient_id: patient.id,
        doctor_id: doctor.id,
      })

      const messages = MessageFactory.createConversation(
        conversation.id,
        patient.id,
        doctor.id,
        5
      )

      // Verificar integridad de los datos
      expect(appointment.patient_id).toBe(patient.id)
      expect(appointment.doctor_id).toBe(doctor.id)
      expect(prescription.appointment_id).toBe(appointment.id)
      expect(conversation.appointment_id).toBe(appointment.id)
      expect(messages.every(m => m.conversation_id === conversation.id)).toBe(true)
    })

    it('should create bulk data for performance testing', () => {
      // Crear datos masivos para pruebas de rendimiento
      const doctors = UserFactory.createList(10, { role: 'doctor' })
      const patients = UserFactory.createList(100, { role: 'patient' })
      
      const appointments: ReturnType<typeof AppointmentFactory.create>[] = []
      const prescriptions: ReturnType<typeof PrescriptionFactory.create>[] = []
      const conversations: ReturnType<typeof ConversationFactory.create>[] = []

      // Crear citas y recetas para cada paciente
      patients.forEach((patient, index) => {
        const doctor = doctors[index % doctors.length]
        
        const appointment = AppointmentFactory.createCompleted({
          patient_id: patient.id,
          doctor_id: doctor.id,
        })
        appointments.push(appointment)

        const prescription = PrescriptionFactory.createComplete({
          appointment_id: appointment.id,
          doctor_id: doctor.id,
          patient_id: patient.id,
        })
        prescriptions.push(prescription)

        const conversation = ConversationFactory.createWithAppointment(appointment.id, {
          patient_id: patient.id,
          doctor_id: doctor.id,
        })
        conversations.push(conversation)
      })

      expect(appointments).toHaveLength(100)
      expect(prescriptions).toHaveLength(100)
      expect(conversations).toHaveLength(100)
    })
  })
})
