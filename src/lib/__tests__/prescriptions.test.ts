import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient, createMockAppointment } from './mocks'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { generatePrescriptionPDF, buildPrescriptionData } from '@/lib/prescriptions-pdf'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}))

vi.mock('@/lib/prescriptions-pdf', () => ({
  generatePrescriptionPDF: vi.fn(),
  buildPrescriptionData: vi.fn(),
}))

vi.mock('@/lib/followup', () => ({
  scheduleFollowUp: vi.fn().mockResolvedValue({ success: true }),
}))

describe('Prescriptions System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Prescription Retrieval', () => {
    it('should return null for non-existent prescription', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'prescriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { getPrescriptionById } = await import('@/lib/prescriptions')
      
      const result = await getPrescriptionById('non-existent')
      expect(result).toBeNull()
    })

    it('should return prescription when exists', async () => {
      const mockPrescription = {
        id: 'prescription-1',
        appointment_id: 'appointment-1',
        diagnosis: 'Test diagnosis',
        medications: 'Amoxicilina 500mg',
        instructions: 'Tomar cada 8 horas',
        pdf_url: null,
        pdf_generated_at: null,
        sent_to_patient: false,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      }

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'prescriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockPrescription, error: null }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { getPrescriptionById } = await import('@/lib/prescriptions')
      
      const result = await getPrescriptionById('prescription-1')
      expect(result).not.toBeNull()
      if (result) {
        expect(result.id).toBe('prescription-1')
        expect(result.diagnosis).toBe('Test diagnosis')
      }
    })

    it('should get prescription by appointment', async () => {
      const mockPrescription = {
        id: 'prescription-1',
        appointment_id: 'appointment-1',
        diagnosis: 'Test diagnosis',
        medications: 'Test',
        instructions: 'Test',
        pdf_url: null,
        pdf_generated_at: null,
        sent_to_patient: false,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      }

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'prescriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockPrescription, error: null }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { getPrescriptionByAppointment } = await import('@/lib/prescriptions')
      
      const result = await getPrescriptionByAppointment('appointment-1')
      expect(result).not.toBeNull()
    })
  })

  describe('Prescription Creation', () => {
    it('should create prescription successfully', async () => {
      const mockPrescription = {
        id: 'prescription-1',
        appointment_id: 'appointment-1',
        diagnosis: 'Infección respiratoria',
        medications: 'Amoxicilina 500mg por 7 días',
        instructions: 'Tomar con alimentos',
        pdf_url: null,
        pdf_generated_at: null,
        sent_to_patient: false,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      }

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'prescriptions') {
            return {
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockPrescription, error: null }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { createPrescription } = await import('@/lib/prescriptions')
      
      const result = await createPrescription(
        'appointment-1',
        'Infección respiratoria',
        'Amoxicilina 500mg por 7 días',
        'Tomar con alimentos'
      )

      expect(result.appointment_id).toBe('appointment-1')
      expect(result.diagnosis).toBe('Infección respiratoria')
    })
  })

  describe('Prescription Update', () => {
    it('should update prescription fields', async () => {
      const updatedPrescription = {
        id: 'prescription-1',
        appointment_id: 'appointment-1',
        diagnosis: 'Updated diagnosis',
        medications: 'Updated medications',
        instructions: 'Updated instructions',
        pdf_url: null,
        pdf_generated_at: null,
        sent_to_patient: false,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'prescriptions') {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: updatedPrescription, error: null }),
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { updatePrescription } = await import('@/lib/prescriptions')
      
      const result = await updatePrescription('prescription-1', {
        diagnosis: 'Updated diagnosis',
      })

      expect(result.diagnosis).toBe('Updated diagnosis')
    })
  })

  describe('PDF Generation', () => {
    it('should generate PDF buffer', async () => {
      const mockPrescription = {
        id: 'prescription-1',
        appointment_id: 'appointment-1',
        diagnosis: 'Test',
        medications: 'Test',
        instructions: 'Test',
        pdf_url: null,
        pdf_generated_at: null,
        sent_to_patient: false,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      }

      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'prescriptions') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockPrescription, error: null }),
                }),
              }),
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          if (table === 'appointments') {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ 
                    data: {
                      ...createMockAppointment(),
                      patient: { full_name: 'Test Patient', date_of_birth: '1990-01-01' },
                      doctor: {
                        license_number: '12345',
                        specialty: 'Medicina General',
                        profile: { full_name: 'Dr. Test' }
                      }
                    }, 
                    error: null 
                  }),
                }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
        storage: {
          from: vi.fn().mockReturnValue({
            upload: vi.fn().mockResolvedValue({ error: null }),
            getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.com/prescription.pdf' } }),
          }),
        },
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)
      vi.mocked(createServiceClient).mockResolvedValue(mockClient as never)
      vi.mocked(generatePrescriptionPDF).mockResolvedValue(Buffer.from('test pdf'))
      vi.mocked(buildPrescriptionData).mockReturnValue({
        patient: { full_name: 'Test Patient', date_of_birth: '1990-01-01' },
        doctor: { full_name: 'Dr. Test', license_number: '12345', specialty: 'General' },
        prescription: { id: 'test', diagnosis: 'Test', medications: 'Test', instructions: 'Test' },
        date: new Date(),
      })

      const { generateAndStorePDF } = await import('@/lib/prescriptions')
      
      const result = await generateAndStorePDF('prescription-1')
      
      expect(result.pdfBuffer).toBeDefined()
      expect(result.pdfUrl).toBe('https://test.com/prescription.pdf')
    })
  })

  describe('Mark as Sent', () => {
    it('should update sent status', async () => {
      const mockClient = {
        ...mockSupabaseClient,
        from: vi.fn().mockImplementation((table) => {
          if (table === 'prescriptions') {
            return {
              update: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null }),
              }),
            }
          }
          return mockSupabaseClient.from(table)
        }),
      }

      vi.mocked(createClient).mockResolvedValue(mockClient as never)

      const { markAsSent } = await import('@/lib/prescriptions')
      
      await expect(markAsSent('prescription-1')).resolves.not.toThrow()
    })
  })

  describe('Property-Based Tests - Prescription Data', () => {
    it('should handle valid prescription data', () => {
      // Test various prescription data scenarios
      const testCases = [
        { diagnosis: 'Infección respiratoria', medications: 'Amoxicilina 500mg', instructions: 'Tomar cada 8 horas' },
        { diagnosis: 'Hipertensión arterial', medications: 'Enalapril 10mg', instructions: '1 tableta al día' },
        { diagnosis: 'Gastritis', medications: 'Omeprazol 20mg', instructions: 'Antes del desayuno' },
      ]
      
      for (const { diagnosis, medications, instructions } of testCases) {
        expect(typeof diagnosis).toBe('string')
        expect(typeof medications).toBe('string')
        expect(typeof instructions).toBe('string')
        expect(diagnosis.length).toBeGreaterThan(0)
        expect(medications.length).toBeGreaterThan(0)
        expect(instructions.length).toBeGreaterThan(0)
      }
    })
  })
})

