/**
 * Adaptive Questionnaire System Tests
 * Comprehensive tests for all components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { StateTransitionEngine } from '../state-engine'
import { ToolRegistry } from '../tool-registry'
import { QuestionGenerator } from '../question-generator'
import { ConversationState, ConversationContext, RED_FLAG_PATTERNS } from '../types'

describe('StateTransitionEngine', () => {
  let engine: StateTransitionEngine

  beforeEach(() => {
    engine = new StateTransitionEngine()
  })

  describe('evaluatePhaseTransition', () => {
    it('should stay in history_taking phase initially', () => {
      const state: ConversationState = {
        phase: 'history_taking',
        collected_symptoms: [],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 0,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const newPhase = engine.evaluatePhaseTransition(state)
      expect(newPhase).toBe('history_taking')
    })

    it('should transition to focused_inquiry after collecting symptoms', () => {
      const state: ConversationState = {
        phase: 'history_taking',
        collected_symptoms: [
          { name: 'dolor de cabeza', severity: 7, duration: '2 días' }
        ],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: ['q1', 'q2', 'q3'],
        question_count: 4,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const newPhase = engine.evaluatePhaseTransition(state)
      expect(newPhase).toBe('focused_inquiry')
    })

    it('should transition to synthesis with critical red flags', () => {
      const state: ConversationState = {
        phase: 'history_taking',
        collected_symptoms: [{ name: 'dolor de pecho' }],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'emergency',
        red_flags: [
          {
            symptom: 'dolor de pecho',
            severity: 'critical',
            message: 'Dolor torácico - Evaluar emergencia cardiaca',
            action: 'CALL_EMERGENCY',
            detected_at: new Date().toISOString()
          }
        ],
        questions_asked: [],
        question_count: 1,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const newPhase = engine.evaluatePhaseTransition(state)
      expect(newPhase).toBe('synthesis')
    })
  })

  describe('detectRedFlags', () => {
    it('should detect chest pain as critical', () => {
      const redFlags = engine.detectRedFlags('tengo dolor en el pecho fuerte')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags[0].severity).toBe('critical')
    })

    it('should detect suicidal ideation', () => {
      const redFlags = engine.detectRedFlags('he tenido pensamientos de suicidio')
      expect(redFlags.length).toBeGreaterThan(0)
      expect(redFlags[0].severity).toBe('critical')
      expect(redFlags[0].action).toBe('CRISIS_LINE')
    })

    it('should detect breathing difficulty', () => {
      const redFlags = engine.detectRedFlags('no puedo respirar bien, me ahogo')
      expect(redFlags.length).toBeGreaterThan(0)
    })

    it('should return empty array for normal symptoms', () => {
      const redFlags = engine.detectRedFlags('me duele un poco la garganta')
      expect(redFlags.length).toBe(0)
    })
  })

  describe('calculateUrgencyLevel', () => {
    it('should return emergency for critical red flags', () => {
      const state: ConversationState = {
        phase: 'history_taking',
        collected_symptoms: [],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [
          { symptom: 'test', severity: 'critical', message: '', action: '', detected_at: '' }
        ],
        questions_asked: [],
        question_count: 0,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const urgency = engine.calculateUrgencyLevel(state)
      expect(urgency).toBe('emergency')
    })

    it('should return high for severe symptoms', () => {
      const state: ConversationState = {
        phase: 'focused_inquiry',
        collected_symptoms: [
          { name: 'dolor', severity: 9 }
        ],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 3,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const urgency = engine.calculateUrgencyLevel(state)
      expect(urgency).toBe('high')
    })

    it('should return low for mild symptoms', () => {
      const state: ConversationState = {
        phase: 'history_taking',
        collected_symptoms: [
          { name: 'resfriado leve', severity: 3 }
        ],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 2,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const urgency = engine.calculateUrgencyLevel(state)
      expect(urgency).toBe('low')
    })
  })

  describe('identifyKnowledgeGaps', () => {
    it('should identify missing symptom details', () => {
      const state: ConversationState = {
        phase: 'focused_inquiry',
        collected_symptoms: [
          { name: 'dolor de cabeza' } // Missing severity, duration, location
        ],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 2,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const gaps = engine.identifyKnowledgeGaps(state)
      expect(gaps).toContain('severity:dolor de cabeza')
      expect(gaps).toContain('duration:dolor de cabeza')
      expect(gaps).toContain('location:dolor de cabeza')
    })

    it('should identify missing patient info', () => {
      const state: ConversationState = {
        phase: 'focused_inquiry',
        collected_symptoms: [
          { name: 'dolor', severity: 5, duration: '1 día', location: 'abdomen' }
        ],
        patient_info: {}, // Missing age, gender, medical_history
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 2,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const gaps = engine.identifyKnowledgeGaps(state)
      expect(gaps).toContain('patient:age')
      expect(gaps).toContain('patient:gender')
    })
  })

  describe('calculateProgress', () => {
    it('should calculate progress based on phase and questions', () => {
      const state: ConversationState = {
        phase: 'history_taking',
        collected_symptoms: [],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 2,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const progress = engine.calculateProgress(state)
      expect(progress).toBeGreaterThanOrEqual(25)
      expect(progress).toBeLessThanOrEqual(100)
    })

    it('should show higher progress in synthesis phase', () => {
      const state: ConversationState = {
        phase: 'synthesis',
        collected_symptoms: [{ name: 'dolor', severity: 5, duration: '1d', location: 'head' }],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 10,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const progress = engine.calculateProgress(state)
      expect(progress).toBeGreaterThanOrEqual(85)
    })
  })
})

describe('ToolRegistry', () => {
  let registry: ToolRegistry

  beforeEach(() => {
    registry = new ToolRegistry()
  })

  describe('tool registration', () => {
    it('should have default tools registered', () => {
      expect(registry.get('analyzeSymptom')).toBeDefined()
      expect(registry.get('assessUrgency')).toBeDefined()
      expect(registry.get('generateDifferentialDiagnosis')).toBeDefined()
      expect(registry.get('generateFollowUpQuestion')).toBeDefined()
      expect(registry.get('detectRedFlags')).toBeDefined()
      expect(registry.get('triagePatient')).toBeDefined()
    })

    it('should return all registered tools', () => {
      const tools = registry.getAll()
      expect(tools.length).toBeGreaterThanOrEqual(8)
    })
  })

  describe('tool execution', () => {
    it('should execute detectRedFlags tool', async () => {
      const tool = registry.get('detectRedFlags')
      expect(tool).toBeDefined()
      if (!tool) {
        throw new Error('detectRedFlags tool not found in registry')
      }

      const context: ConversationContext = {
        state: {
          phase: 'history_taking',
          collected_symptoms: [],
          patient_info: {},
          diagnostic_hypotheses: [],
          knowledge_gaps: [],
          urgency_level: 'low',
          red_flags: [],
          questions_asked: [],
          question_count: 0,
          start_time: new Date().toISOString(),
          last_update: new Date().toISOString(),
          completed: false
        },
        history: []
      }

      const result = await tool.execute({ text: 'dolor de pecho intenso' }, context)
      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('red_flags')
      expect(result.data).toHaveProperty('has_critical')
    })

    it('should execute assessUrgency tool', async () => {
      const tool = registry.get('assessUrgency')
      expect(tool).toBeDefined()
      if (!tool) {
        throw new Error('assessUrgency tool not found in registry')
      }

      const context: ConversationContext = {
        state: {
          phase: 'history_taking',
          collected_symptoms: [],
          patient_info: {},
          diagnostic_hypotheses: [],
          knowledge_gaps: [],
          urgency_level: 'low',
          red_flags: [],
          questions_asked: [],
          question_count: 0,
          start_time: new Date().toISOString(),
          last_update: new Date().toISOString(),
          completed: false
        },
        history: []
      }

      const result = await tool.execute({
        symptoms: ['dolor de cabeza', 'fiebre'],
        patient_text: 'me duele la cabeza y tengo fiebre'
      }, context)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('urgency_level')
    })

    it('should execute triagePatient tool', async () => {
      const tool = registry.get('triagePatient')
      expect(tool).toBeDefined()
      if (!tool) {
        throw new Error('triagePatient tool not found in registry')
      }

      const context: ConversationContext = {
        state: {
          phase: 'synthesis',
          collected_symptoms: [],
          patient_info: {},
          diagnostic_hypotheses: [],
          knowledge_gaps: [],
          urgency_level: 'high',
          red_flags: [],
          questions_asked: [],
          question_count: 5,
          start_time: new Date().toISOString(),
          last_update: new Date().toISOString(),
          completed: false
        },
        history: []
      }

      const result = await tool.execute({
        symptoms: ['dolor abdominal', 'fiebre'],
        urgency_level: 'high',
        red_flags: []
      }, context)

      expect(result.success).toBe(true)
      expect(result.data).toHaveProperty('level')
      expect(result.data).toHaveProperty('action')
      expect(result.data).toHaveProperty('specialty')
    })
  })
})

describe('QuestionGenerator', () => {
  let generator: QuestionGenerator

  beforeEach(() => {
    generator = new QuestionGenerator()
  })

  describe('generateNextQuestion', () => {
    it('should generate opening question at start', async () => {
      const context: ConversationContext = {
        state: {
          phase: 'history_taking',
          collected_symptoms: [],
          patient_info: {},
          diagnostic_hypotheses: [],
          knowledge_gaps: [],
          urgency_level: 'low',
          red_flags: [],
          questions_asked: [],
          question_count: 0,
          start_time: new Date().toISOString(),
          last_update: new Date().toISOString(),
          completed: false
        },
        history: []
      }

      const question = await generator.generateNextQuestion(context)
      expect(question.id).toBe('opening_question')
      expect(question.type).toBe('open')
      expect(question.text).toContain('Hola')
    })

    it('should generate severity question for symptom without severity', async () => {
      const context: ConversationContext = {
        state: {
          phase: 'history_taking',
          collected_symptoms: [
            { name: 'dolor de cabeza' }
          ],
          patient_info: {},
          diagnostic_hypotheses: [],
          knowledge_gaps: [],
          urgency_level: 'low',
          red_flags: [],
          questions_asked: ['opening_question', 'elaboration_prompt'],
          question_count: 2,
          start_time: new Date().toISOString(),
          last_update: new Date().toISOString(),
          completed: false
        },
        history: []
      }

      const question = await generator.generateNextQuestion(context)
      expect(question.type).toBe('scale')
      expect(question.text).toContain('escala')
    })

    it('should generate emergency question in synthesis phase with emergency urgency', async () => {
      const context: ConversationContext = {
        state: {
          phase: 'synthesis',
          collected_symptoms: [{ name: 'dolor de pecho', severity: 10 }],
          patient_info: {},
          diagnostic_hypotheses: [],
          knowledge_gaps: [],
          urgency_level: 'emergency',
          red_flags: [
            { symptom: 'dolor de pecho', severity: 'critical', message: 'test', action: '', detected_at: '' }
          ],
          questions_asked: [],
          question_count: 3,
          start_time: new Date().toISOString(),
          last_update: new Date().toISOString(),
          completed: false
        },
        history: []
      }

      const question = await generator.generateNextQuestion(context)
      expect(question.id).toBe('emergency_escalation')
      expect(question.category).toBe('red_flag')
    })
  })

  describe('prioritizeQuestions', () => {
    it('should prioritize red_flag questions first', () => {
      const questions = [
        { id: '1', text: '', type: 'open' as const, category: 'symptom' as const, priority: 10, reasoning: '' },
        { id: '2', text: '', type: 'open' as const, category: 'red_flag' as const, priority: 8, reasoning: '' },
        { id: '3', text: '', type: 'open' as const, category: 'history' as const, priority: 9, reasoning: '' }
      ]

      const state: ConversationState = {
        phase: 'focused_inquiry',
        collected_symptoms: [],
        patient_info: {},
        diagnostic_hypotheses: [],
        knowledge_gaps: [],
        urgency_level: 'low',
        red_flags: [],
        questions_asked: [],
        question_count: 0,
        start_time: new Date().toISOString(),
        last_update: new Date().toISOString(),
        completed: false
      }

      const prioritized = generator.prioritizeQuestions(questions, state)
      expect(prioritized[0].category).toBe('red_flag')
    })
  })
})

describe('RED_FLAG_PATTERNS', () => {
  it('should have all critical patterns defined', () => {
    expect(RED_FLAG_PATTERNS.length).toBeGreaterThan(0)
    
    const criticalPatterns = RED_FLAG_PATTERNS.filter(p => p.severity === 'critical')
    expect(criticalPatterns.length).toBeGreaterThanOrEqual(5)
  })

  it('should match expected symptoms', () => {
    const chestPainPattern = RED_FLAG_PATTERNS.find(p => p.message.includes('torácico'))
    expect(chestPainPattern).toBeDefined()
    expect(chestPainPattern?.pattern.test('dolor de pecho')).toBe(true)

    const strokePattern = RED_FLAG_PATTERNS.find(p => p.message.includes('ACV'))
    expect(strokePattern).toBeDefined()
    expect(strokePattern?.pattern.test('parálisis en el brazo')).toBe(true)
  })
})
