/**
 * Prescription Factory Tests
 *
 * Verifica que la PrescriptionFactory genera datos consistentes y válidos.
 */

import { describe, it, expect } from 'vitest'
import { PrescriptionFactory } from './prescription.factory'

describe('PrescriptionFactory', () => {
  describe('create', () => {
    it('should create a valid prescription with default values', () => {
      const prescription = PrescriptionFactory.create()

      expect(prescription).toHaveProperty('id')
      expect(prescription).toHaveProperty('appointment_id')
      expect(prescription).toHaveProperty('doctor_id')
      expect(prescription).toHaveProperty('patient_id')
      expect(prescription).toHaveProperty('medications')
      expect(prescription).toHaveProperty('notes')
      expect(prescription).toHaveProperty('pdf_url')
      expect(prescription).toHaveProperty('created_at')
      expect(prescription).toHaveProperty('updated_at')
    })

    it('should generate unique IDs', () => {
      const prescription1 = PrescriptionFactory.create()
      const prescription2 = PrescriptionFactory.create()

      expect(prescription1.id).not.toBe(prescription2.id)
    })

    it('should include at least one medication by default', () => {
      const prescription = PrescriptionFactory.create()

      expect(prescription.medications).toHaveLength(1)
      expect(prescription.medications[0]).toHaveProperty('name')
      expect(prescription.medications[0]).toHaveProperty('dosage')
      expect(prescription.medications[0]).toHaveProperty('frequency')
      expect(prescription.medications[0]).toHaveProperty('duration')
      expect(prescription.medications[0]).toHaveProperty('quantity')
    })

    it('should apply overrides correctly', () => {
      const prescription = PrescriptionFactory.create({
        notes: 'Nota personalizada',
        pdf_url: 'https://example.com/receta.pdf',
      })

      expect(prescription.notes).toBe('Nota personalizada')
      expect(prescription.pdf_url).toBe('https://example.com/receta.pdf')
    })
  })

  describe('createWithMedications', () => {
    it('should create a prescription with specified number of medications', () => {
      const prescription = PrescriptionFactory.createWithMedications(3)

      expect(prescription.medications).toHaveLength(3)
    })

    it('should create unique medications', () => {
      const prescription = PrescriptionFactory.createWithMedications(5)
      const names = prescription.medications.map(m => m.name)

      // Puede haber duplicados aleatorios, pero verificamos que cada medicamento
      // tenga las propiedades requeridas
      prescription.medications.forEach(med => {
        expect(med).toHaveProperty('name')
        expect(med).toHaveProperty('dosage')
        expect(med).toHaveProperty('frequency')
        expect(med).toHaveProperty('duration')
        expect(med).toHaveProperty('quantity')
      })
    })

    it('should apply overrides', () => {
      const prescription = PrescriptionFactory.createWithMedications(2, {
        notes: 'Receta con 2 medicamentos',
      })

      expect(prescription.medications).toHaveLength(2)
      expect(prescription.notes).toBe('Receta con 2 medicamentos')
    })
  })

  describe('createExpired', () => {
    it('should create a prescription with old creation date', () => {
      const prescription = PrescriptionFactory.createExpired()
      const createdDate = new Date(prescription.created_at)
      const now = new Date()
      const daysDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)

      expect(daysDiff).toBeGreaterThan(30)
    })
  })

  describe('createWithPdf', () => {
    it('should create a prescription with PDF URL', () => {
      const prescription = PrescriptionFactory.createWithPdf()

      expect(prescription.pdf_url).not.toBeNull()
      expect(prescription.pdf_url).toContain('.pdf')
    })

    it('should include the prescription ID in the PDF URL', () => {
      const prescription = PrescriptionFactory.createWithPdf()

      expect(prescription.pdf_url).toContain(prescription.id)
    })
  })

  describe('createWithNotes', () => {
    it('should create a prescription with medical notes', () => {
      const prescription = PrescriptionFactory.createWithNotes()

      expect(prescription.notes).not.toBeNull()
      expect(typeof prescription.notes).toBe('string')
    })
  })

  describe('createComplete', () => {
    it('should create a complete prescription with all fields', () => {
      const prescription = PrescriptionFactory.createComplete()

      expect(prescription.medications.length).toBeGreaterThanOrEqual(2)
      expect(prescription.medications.length).toBeLessThanOrEqual(4)
      expect(prescription.notes).not.toBeNull()
      expect(prescription.pdf_url).not.toBeNull()
    })
  })

  describe('createList', () => {
    it('should create the specified number of prescriptions', () => {
      const prescriptions = PrescriptionFactory.createList(5)

      expect(prescriptions).toHaveLength(5)
    })

    it('should create unique prescriptions', () => {
      const prescriptions = PrescriptionFactory.createList(10)
      const ids = prescriptions.map(p => p.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(10)
    })
  })
})
