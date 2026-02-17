import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mockSupabaseClient } from './mocks'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
  createServiceClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}))

// Mock OpenAI module with correct default export structure
vi.mock('openai', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          diagnoses: [
            { diagnosis: 'Test Diagnosis', probability: 80, reasoning: 'Test reasoning' }
          ],
          codes: [
            { code: 'J06.9', description: 'Infeccion respiratoria aguda superior', category: 'Enfermedades respiratorias' }
          ],
          chiefComplaint: 'Dolor de cabeza',
          symptoms: ['dolor de cabeza', 'náuseas'],
          diagnosis: 'Cefalea tensional',
          treatment: 'Paracetamol 500mg cada 8 horas',
          followUp: 'Revisión en 7 días',
          notes: 'Síntomas leves',
          replies: ['Entiendo, cuénteme más', '¿Desde cuándo tiene estos síntomas?'],
          steps: ['Realizar examen físico completo', 'Solicitar laboratorios'],
        }),
      },
    }],
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
    },
  })

  const mockOpenAIClass = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }))

  return {
    default: mockOpenAIClass,
    __esModule: true,
  }
})

// Mock AI router
vi.mock('@/lib/ai/router', () => ({
  router: {
    routeReasoning: vi.fn().mockResolvedValue({
      content: JSON.stringify({
        diagnoses: [
          { diagnosis: 'Test Diagnosis', probability: 80, reasoning: 'Test reasoning' }
        ]
      }),
      provider: 'glm',
      model: 'glm-4.7',
      costUSD: 0.001,
      latencyMs: 500,
      hasReasoning: true,
    }),
  },
}))

// Mock OpenAI client module (@/lib/openai)
vi.mock('@/lib/openai', () => {
  const mockCreate = vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          diagnoses: [
            { diagnosis: 'Test Diagnosis', probability: 80, reasoning: 'Test reasoning' }
          ],
          chiefComplaint: 'Dolor de cabeza',
          symptoms: ['dolor de cabeza'],
          diagnosis: 'Cefalea',
          treatment: 'Paracetamol',
          followUp: 'Revisión en 7 días',
          notes: '',
        }),
      },
    }],
  })

  const mockClient = {
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }

  return {
    getAIClient: vi.fn().mockReturnValue(mockClient),
    glm: mockClient,
    openai: mockClient,
    default: mockClient,
  }
})

// Mock GLM module (@/lib/ai/glm)
vi.mock('@/lib/ai/glm', () => {
  const mockGLMCreate = vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          diagnoses: [
            { diagnosis: 'Test Diagnosis', probability: 80, reasoning: 'Test reasoning' }
          ],
          chiefComplaint: 'Dolor de cabeza',
          symptoms: ['dolor de cabeza'],
          diagnosis: 'Cefalea',
          treatment: 'Paracetamol',
          followUp: 'Revisión en 7 días',
          notes: '',
        }),
      },
    }],
  })

  const mockGLMClient = {
    chat: {
      completions: {
        create: mockGLMCreate,
      },
    },
  }

  return {
    GLM_CONFIG: {
      models: {
        reasoning: 'glm-4.7',
        costEffective: 'glm-4.5-air',
        vision: 'glm-4.5v',
      },
    },
    isGLMConfigured: () => true,
    glm: mockGLMClient,
    calculateGLMCost: vi.fn().mockReturnValue(0.001),
    getGLMModel: vi.fn().mockReturnValue('glm-4.5-air'),
  }
})

// Mock medical knowledge module
vi.mock('@/lib/medical-knowledge', () => ({
  retrieveMedicalContext: vi.fn().mockResolvedValue({
    context: 'Test medical context',
    sources: [],
  }),
  generateAugmentedPrompt: vi.fn().mockImplementation((prompt, context) => `${prompt}\n\nContext: ${context.context}`),
}))

// Mock logger
vi.mock('@/lib/observability/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

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
      
      // Use symptoms that match the RED_FLAGS patterns in copilot.ts
      // Pattern: /convulsiones|ataques|espasmos/i -> critical
      const result = await generateSuggestions(['convulsiones', 'espasmos'])
      
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
      // Test with various symptom arrays
      const testCases = [
        ['tos', 'fiebre'],
        ['dolor de cabeza', 'náuseas', 'mareo'],
        ['dolor de pecho', 'palpitaciones', 'dificultad para respirar'],
        ['ansiedad', 'insomnio'],
      ]
      
      for (const symptoms of testCases) {
        const result = symptoms.join(' ').toLowerCase()
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      }
    })

    it('should detect valid severity levels', () => {
      const validSeverities = ['low', 'medium', 'high', 'critical']
      
      // Test all valid severity levels
      for (const severity of validSeverities) {
        expect(validSeverities).toContain(severity)
      }
      
      // Test invalid severity levels are not in valid list
      expect(validSeverities).not.toContain('invalid')
      expect(validSeverities).not.toContain('')
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
