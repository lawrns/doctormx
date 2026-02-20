/**
 * Schema Validation Tests for Factories
 *
 * Verifica que los datos generados por las factories
 * pasan la validación de esquemas Zod del proyecto.
 */

import { describe, it, expect } from 'vitest'
import {
  prescriptionSchema,
  appointmentSchema,
  profileUpdateSchema,
} from '@/lib/validation/schemas'
import {
  UserFactory,
  AppointmentFactory,
  PrescriptionFactory,
  MessageFactory,
} from '@/lib/__tests__/factories'

describe('Factory Data Schema Validation', () => {
  describe('PrescriptionFactory', () => {
    it('should generate valid prescription data for schema', () => {
      const prescription = PrescriptionFactory.createWithMedications(2)

      // Adaptar los datos al esquema (el esquema usa camelCase)
      const schemaData = {
        appointmentId: prescription.appointment_id,
        medications: prescription.medications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
        })),
        notes: prescription.notes || undefined,
      }

      const result = prescriptionSchema.safeParse(schemaData)
      expect(result.success).toBe(true)
    })

    it('should generate valid medications structure', () => {
      const prescription = PrescriptionFactory.create()

      prescription.medications.forEach(med => {
        expect(med.name).toBeTruthy()
        expect(med.name.length).toBeGreaterThan(0)
        expect(med.dosage).toBeTruthy()
        expect(med.frequency).toBeTruthy()
        expect(med.duration).toBeTruthy()
        expect(med.quantity).toBeTruthy()
      })
    })
  })

  describe('UserFactory', () => {
    it('should generate valid phone numbers', () => {
      const user = UserFactory.create()

      // El esquema espera: ^\+?[1-9]\d{9,14}$
      const phoneRegex = /^\+?[1-9]\d{9,14}$/
      expect(user.phone).toMatch(phoneRegex)
    })

    it('should generate valid full names', () => {
      const user = UserFactory.create()

      // El esquema espera al menos 2 caracteres
      expect(user.full_name.length).toBeGreaterThanOrEqual(2)
      expect(user.full_name.length).toBeLessThanOrEqual(100)
    })

    it('should generate valid patient data for profile update', () => {
      const patient = UserFactory.createPatient()

      const schemaData = {
        fullName: patient.full_name,
        phone: patient.phone || undefined,
        dateOfBirth: patient.date_of_birth?.split('T')[0], // Convertir ISO a YYYY-MM-DD
      }

      const result = profileUpdateSchema.safeParse(schemaData)
      expect(result.success).toBe(true)
    })
  })

  describe('AppointmentFactory', () => {
    it('should generate valid UUIDs for IDs', () => {
      const appointment = AppointmentFactory.create()

      // Verificar que los IDs son UUIDs válidos
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      expect(appointment.id).toMatch(uuidRegex)
      expect(appointment.patient_id).toMatch(uuidRegex)
      expect(appointment.doctor_id).toMatch(uuidRegex)
    })

    it('should generate valid ISO timestamps', () => {
      const appointment = AppointmentFactory.create()

      // Verificar formato ISO 8601
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

      expect(appointment.start_ts).toMatch(isoRegex)
      expect(appointment.end_ts).toMatch(isoRegex)
      expect(appointment.created_at).toMatch(isoRegex)
    })

    it('should have valid appointment time ranges', () => {
      const appointment = AppointmentFactory.create()

      const startDate = new Date(appointment.start_ts)
      const endDate = new Date(appointment.end_ts)

      // La fecha de fin debe ser posterior a la de inicio
      expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())
    })
  })

  describe('MessageFactory', () => {
    it('should generate valid message content', () => {
      const message = MessageFactory.create()

      // El contenido no debe estar vacío
      expect(message.content).toBeTruthy()
      expect(message.content.length).toBeGreaterThan(0)
      expect(message.content.length).toBeLessThanOrEqual(4000)
    })

    it('should generate valid message types', () => {
      const textMessage = MessageFactory.create()
      const imageMessage = MessageFactory.createWithImage()
      const fileMessage = MessageFactory.createWithFile()

      expect(['text', 'image', 'file']).toContain(textMessage.message_type)
      expect(imageMessage.message_type).toBe('image')
      expect(fileMessage.message_type).toBe('file')
    })

    it('should generate valid sender types', () => {
      const patientMessage = MessageFactory.createFromPatient()
      const doctorMessage = MessageFactory.createFromDoctor()

      expect(patientMessage.sender_type).toBe('patient')
      expect(doctorMessage.sender_type).toBe('doctor')
    })
  })

  describe('Cross-Entity Consistency', () => {
    it('should create consistent patient-doctor-appointment relationship', () => {
      const patient = UserFactory.createPatient()
      const doctor = UserFactory.createDoctor()
      const appointment = AppointmentFactory.createConfirmed({
        patient_id: patient.id,
        doctor_id: doctor.id,
      })

      // Verificar que las relaciones son correctas
      expect(appointment.patient_id).toBe(patient.id)
      expect(appointment.doctor_id).toBe(doctor.id)

      // Verificar que los IDs son UUIDs válidos
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      expect(appointment.patient_id).toMatch(uuidRegex)
      expect(appointment.doctor_id).toMatch(uuidRegex)
    })

    it('should create consistent appointment-prescription relationship', () => {
      const appointment = AppointmentFactory.createCompleted()
      const prescription = PrescriptionFactory.createComplete({
        appointment_id: appointment.id,
        doctor_id: appointment.doctor_id,
        patient_id: appointment.patient_id,
      })

      // Verificar que las relaciones son correctas
      expect(prescription.appointment_id).toBe(appointment.id)
      expect(prescription.doctor_id).toBe(appointment.doctor_id)
      expect(prescription.patient_id).toBe(appointment.patient_id)
    })

    it('should generate valid conversation-message relationship', () => {
      const conversationId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })

      const messages = MessageFactory.createList(5, {
        conversation_id: conversationId,
      })

      // Todos los mensajes deben pertenecer a la misma conversación
      messages.forEach(message => {
        expect(message.conversation_id).toBe(conversationId)
      })
    })
  })
})
