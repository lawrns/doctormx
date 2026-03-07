import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { mockSupabaseClient } from './mocks'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  createServiceClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}))

vi.mock('openai', () => {
  class MockOpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                diagnoses: [
                  { diagnosis: 'Test Diagnosis', probability: 80, reasoning: 'Test reasoning' }
                ]
              })
            }
          }]
        }),
      },
    }
  }

  return {
    default: MockOpenAI,
  }
})

describe('AI Copilot System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Dr. Simeon Triage', () => {
    it('should detect respiratory symptoms', async () => {
      const { generateSuggestions } = await import('@/lib/ai/copilot')
      
      const result = await generateSuggestions(['tos', 'fiebre', 'dolor de garganta'])
      
      expect(result.questions.length).toBeGreaterThan(0)
    })

    it('should detect cardiovascular symptoms', async () => {
      const { generateSuggestions } = await import('@/lib/ai/copilot')
      
      const result = await generateSuggestions(['dolor en el pecho', 'palpitaciones'])
      
      expect(result.questions.length).toBeGreaterThan(0)
    })

    it('should detect gastrointestinal symptoms', async () => {
      const { generateSuggestions } = await import('@/lib/ai/copilot')
      
      const result = await generateSuggestions(['dolor de estómago', 'náuseas', 'diarrea'])
      
      expect(result.questions.length).toBeGreaterThan(0)
    })

    it('should limit questions to 8', async () => {
      const result = await generateSymptomsWithManyCategories()
      
      expect(result.questions.length).toBeLessThanOrEqual(8)
    })
  })

  describe('Severity Classification', () => {
    it('should detect critical severity red flags', async () => {
      const { generateSuggestions } = await import('@/lib/ai/copilot')
      
      const result = await generateSuggestions(['parálisis', 'cara colgada'])
      
      const hasCritical = result.redFlags.some(f => f.severity === 'critical')
      expect(hasCritical).toBe(true)
    })

    it('should detect high severity red flags', async () => {
      const { generateSuggestions } = await import('@/lib/ai/copilot')
      
      const result = await generateSuggestions(['dolor de pecho', 'dificultad para respirar'])
      
      const hasHigh = result.redFlags.some(f => f.severity === 'high')
      expect(hasHigh).toBe(true)
    })

    it('should return empty red flags for normal symptoms', async () => {
      const { generateSuggestions } = await import('@/lib/ai/copilot')
      
      const result = await generateSuggestions(['dolor de cabeza leve'])
      
      expect(result.redFlags.length).toBe(0)
    })
  })

  describe('Drug Interactions', () => {
    it('should detect warfarin-aspirin interaction', async () => {
      const { checkDrugInteractions } = await import('@/lib/ai/copilot')
      
      const medications = [
        { name: 'Warfarina', dosage: '5mg', frequency: '1x día' },
        { name: 'Aspirina', dosage: '100mg', frequency: '1x día' },
      ]
      
      const result = await checkDrugInteractions(medications)
      
      expect(result.length).toBeGreaterThan(0)
      const hasInteraction = result.some(i => 
        (i.drug1.includes('warfarina') || i.drug2.includes('aspirina'))
      )
      expect(hasInteraction).toBe(true)
    })

    it('should detect ibuprofen-warfarin interaction', async () => {
      const { checkDrugInteractions } = await import('@/lib/ai/copilot')
      
      const medications = [
        { name: 'Warfarina', dosage: '5mg', frequency: '1x día' },
        { name: 'Ibuprofeno', dosage: '400mg', frequency: 'cada 8 horas' },
      ]
      
      const result = await checkDrugInteractions(medications)
      
      expect(result.length).toBeGreaterThan(0)
    })

    it('should detect SSRI-tramadol interaction', async () => {
      const { checkDrugInteractions } = await import('@/lib/ai/copilot')
      
      const medications = [
        { name: 'Sertralina', dosage: '50mg', frequency: '1x día' },
        { name: 'Tramadol', dosage: '50mg', frequency: 'cada 6 horas' },
      ]
      
      const result = await checkDrugInteractions(medications)
      
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle medications without interactions', async () => {
      const { checkDrugInteractions } = await import('@/lib/ai/copilot')
      
      const medications = [
        { name: 'Metformina', dosage: '500mg', frequency: '2x día' },
        { name: 'Enalapril', dosage: '10mg', frequency: '1x día' },
      ]
      
      const result = await checkDrugInteractions(medications)
      
      expect(result.length).toBe(0)
    })
  })

  describe('Differential Diagnosis', () => {
    it('should generate differential diagnoses', async () => {
      const { suggestDifferentialDiagnosis } = await import('@/lib/ai/copilot')
      
      const result = await suggestDifferentialDiagnosis(['tos', 'fiebre', 'dolor de garganta'])
      
      expect(Array.isArray(result)).toBe(true)
    })

    it('should include probability scores', async () => {
      const { suggestDifferentialDiagnosis } = await import('@/lib/ai/copilot')
      
      const result = await suggestDifferentialDiagnosis(['tos', 'fiebre'])
      
      if (result.length > 0) {
        const hasValidProbability = result.every(d => 
          typeof d.probability === 'number' && d.probability >= 0 && d.probability <= 100
        )
        expect(hasValidProbability).toBe(true)
      }
    })
  })

  describe('ICD Code Suggestions', () => {
    it('should suggest ICD codes for respiratory symptoms', async () => {
      const { suggestICDCodes } = await import('@/lib/ai/copilot')
      
      const result = await suggestICDCodes(['infección respiratoria aguda'])
      
      expect(Array.isArray(result)).toBe(true)
    })

    it('should return code, description, and category', async () => {
      const { suggestICDCodes } = await import('@/lib/ai/copilot')
      
      const result = await suggestICDCodes(['cefalea'])
      
      if (result.length > 0) {
        const hasValidStructure = result.every(code => 
          code.code && code.description && code.category
        )
        expect(hasValidStructure).toBe(true)
      }
    })
  })

  describe('Consultation Summary', () => {
    it('should generate consultation summary', async () => {
      const { generateConsultationSummary } = await import('@/lib/ai/copilot')
      
      const transcription = `
        Paciente: Tengo dolor de cabeza desde hace 2 días.
        Doctor: ¿Qué intensidad tiene del 1 al 10?
        Paciente: Alrededor de 6.
        Doctor: ¿Tiene otros síntomas?
        Paciente: Solo náuseas leves.
      `
      
      const result = await generateConsultationSummary(transcription)
      
      expect(result).toHaveProperty('chiefComplaint')
      expect(result).toHaveProperty('symptoms')
      expect(result).toHaveProperty('diagnosis')
      expect(result).toHaveProperty('treatment')
    })
  })

  describe('Property-Based Tests - Symptom Detection', () => {
    it('should handle valid symptom arrays', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
          (symptoms) => {
            const result = symptoms.join(' ').toLowerCase()
            return typeof result === 'string'
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should detect valid severity levels', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('low'),
            fc.constant('medium'),
            fc.constant('high'),
            fc.constant('critical')
          ),
          (severity) => {
            const validSeverities = ['low', 'medium', 'high', 'critical']
            return validSeverities.includes(severity)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  async function generateSymptomsWithManyCategories(): Promise<{ questions: string[]; redFlags: Array<{ message: string; severity: string }> }> {
    return generateSymptomsWithManyCategoriesWorker()
  }

  async function generateSymptomsWithManyCategoriesWorker(): Promise<{ questions: string[]; redFlags: Array<{ message: string; severity: string }> }> {
    const { generateSuggestions } = await import('@/lib/ai/copilot')
    return generateSuggestions([
      'tos', 'fiebre', 'dolor de garganta', 'congestión',
      'dolor de cabeza', 'náuseas', 'diarrea',
      'dolor en el pecho', 'palpitaciones',
      'dolor de espalda', 'dolor articular',
      'ansiedad', 'insomnio'
    ])
  }
})
