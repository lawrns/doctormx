/**
 * Question Generator
 * Generates adaptive, context-aware questions for the medical questionnaire
 */

import {
  Question,
  ConversationState,
  SYMPTOM_QUESTION_TEMPLATES,
  ConversationContext,
  ConversationPhase
} from './types'
import { toolRegistry } from './tool-registry'

export class QuestionGenerator {
  
  /**
   * Generate the next question based on current conversation state
   */
  async generateNextQuestion(context: ConversationContext): Promise<Question> {
    const { state, history } = context
    const { phase, collected_symptoms, knowledge_gaps, questions_asked } = state

    // Phase 1: History Taking - Open-ended exploration
    if (phase === 'history_taking') {
      return this.generateHistoryTakingQuestion(state, history)
    }

    // Phase 2: Focused Inquiry - Deep dive into symptoms
    if (phase === 'focused_inquiry') {
      return this.generateFocusedQuestion(state, knowledge_gaps, collected_symptoms)
    }

    // Phase 3: Synthesis - Confirmation and wrap-up
    if (phase === 'synthesis') {
      return this.generateSynthesisQuestion(state)
    }

    // Default fallback
    return this.createFallbackQuestion()
  }

  /**
   * Generate questions for the history taking phase
   */
  private generateHistoryTakingQuestion(
    state: ConversationState,
    history: { role: string; content: string }[]
  ): Question {
    const questionCount = state.question_count

    // First question - always open-ended
    if (questionCount === 0) {
      return {
        id: 'opening_question',
        text: 'Hola, soy tu asistente de orientación de salud de DoctorMx. ¿Qué te trae aquí hoy? Cuéntame qué te preocupa.',
        type: 'open',
        category: 'symptom',
        priority: 10,
        reasoning: 'Pregunta inicial abierta para exploración completa'
      }
    }

    // Second question - encourage elaboration
    if (questionCount === 1) {
      return {
        id: 'elaboration_prompt',
        text: 'Cuéntame más sobre eso. ¿Cuándo comenzó y cómo te ha afectado?',
        type: 'open',
        category: 'symptom',
        priority: 9,
        reasoning: 'Fomentar narrativa completa del paciente'
      }
    }

    // If we have symptoms but need more details
    if (state.collected_symptoms.length > 0 && questionCount < 5) {
      const lastSymptom = state.collected_symptoms[state.collected_symptoms.length - 1]
      
      if (!lastSymptom.severity) {
        return {
          id: `severity_${lastSymptom.name}`,
          text: `En una escala del 1 al 10, ¿qué tan intenso es el ${lastSymptom.name}?`,
          type: 'scale',
          min_value: 1,
          max_value: 10,
          category: 'symptom',
          priority: 10,
          reasoning: 'Evaluar severidad para determinar urgencia'
        }
      }

      if (!lastSymptom.duration) {
        return {
          id: `duration_${lastSymptom.name}`,
          text: `¿Cuánto tiempo llevas con ${lastSymptom.name}?`,
          type: 'open',
          category: 'symptom',
          priority: 9,
          reasoning: 'Determinar duración para diagnóstico agudo vs crónico'
        }
      }
    }

    // Ask about other symptoms
    return {
      id: 'other_symptoms',
      text: '¿Has notado algún otro síntoma o cambio en tu salud?',
      type: 'open',
      category: 'symptom',
      priority: 7,
      reasoning: 'Recopilar síntomas adicionales'
    }
  }

  /**
   * Generate focused questions for specific symptoms
   */
  private generateFocusedQuestion(
    state: ConversationState,
    knowledgeGaps: string[],
    symptoms: { name: string }[]
  ): Question {
    
    // Prioritize knowledge gaps
    if (knowledgeGaps.length > 0) {
      const gap = knowledgeGaps[0]
      const [type, detail] = gap.split(':')
      
      const gapQuestion = this.createGapQuestion(type, detail)
      if (gapQuestion) return gapQuestion
    }

    // Use symptom-specific templates if available
    for (const symptom of symptoms) {
      const templates = SYMPTOM_QUESTION_TEMPLATES[symptom.name.toLowerCase()]
      if (templates) {
        // Find a template that hasn't been asked
        for (const template of templates) {
          if (!state.questions_asked.includes(template.id)) {
            return template
          }
        }
      }
    }

    // Infer symptom type from description and ask relevant questions
    const symptomQuestions = this.inferSymptomQuestions(symptoms, state.questions_asked)
    if (symptomQuestions.length > 0) {
      return symptomQuestions[0]
    }

    // Risk factor assessment
    if (state.question_count < 10) {
      return this.generateRiskFactorQuestion(state)
    }

    // Final confirmation
    return {
      id: 'final_confirmation',
      text: '¿Hay algo más que deba saber sobre tu condición?',
      type: 'open',
      category: 'follow_up',
      priority: 5,
      reasoning: 'Confirmar que se ha recopilado toda la información relevante'
    }
  }

  /**
   * Generate synthesis phase questions
   */
  private generateSynthesisQuestion(state: ConversationState): Question {
    const { question_count, collected_symptoms, urgency_level } = state

    // Emergency situation
    if (urgency_level === 'emergency') {
      return {
        id: 'emergency_escalation',
        text: 'Basándome en lo que me cuentas, esto podría ser una emergencia médica. ¿Estás en un lugar seguro y puedes llamar al 911 o ir a emergencias?',
        type: 'yes_no',
        category: 'red_flag',
        priority: 10,
        reasoning: 'Escalación de emergencia detectada'
      }
    }

    // Urgent situation
    if (urgency_level === 'high') {
      return {
        id: 'urgent_recommendation',
        text: 'Recomiendo que busques atención médica hoy mismo. ¿Tienes acceso a un médico o clínica cercana?',
        type: 'yes_no',
        category: 'red_flag',
        priority: 9,
        reasoning: 'Situación de alta urgencia'
      }
    }

    // Summary confirmation
    return {
      id: 'summary_confirmation',
      text: `Veo que mencionas ${collected_symptoms.map(s => s.name).join(', ')}. ¿Es correcto? ¿Hay algo más que quieras agregar antes de que prepare tu resumen?`,
      type: 'open',
      category: 'follow_up',
      priority: 7,
      reasoning: 'Confirmación final antes de síntesis'
    }
  }

  /**
   * Create question for a specific knowledge gap
   */
  private createGapQuestion(type: string, detail: string): Question | null {
    const gapQuestions: Record<string, (detail: string) => Question> = {
      severity: (symptom) => ({
        id: `severity_${symptom}`,
        text: `En una escala del 1 al 10, donde 10 es el peor dolor imaginable, ¿cómo calificarías el ${symptom}?`,
        type: 'scale',
        min_value: 1,
        max_value: 10,
        category: 'symptom',
        priority: 10,
        reasoning: 'La severidad es crucial para evaluar urgencia'
      }),
      duration: (symptom) => ({
        id: `duration_${symptom}`,
        text: `¿Cuánto tiempo llevas experimentando ${symptom}? (por ejemplo: horas, días, semanas)`,
        type: 'open',
        category: 'symptom',
        priority: 10,
        reasoning: 'La duración diferencia agudo de crónico'
      }),
      location: (symptom) => ({
        id: `location_${symptom}`,
        text: `¿Dónde exactamente sientes ${symptom}? Sé lo más específico posible.`,
        type: 'location',
        category: 'symptom',
        priority: 10,
        reasoning: 'La localización ayuda al diagnóstico diferencial'
      }),
      patient: (field) => {
        const patientQuestions: Record<string, Question> = {
          age: {
            id: 'patient_age',
            text: '¿Cuál es tu edad?',
            type: 'open',
            category: 'history',
            priority: 9,
            reasoning: 'La edad es un factor de riesgo importante'
          },
          gender: {
            id: 'patient_gender',
            text: '¿Cuál es tu género? (Esto ayuda a considerar condiciones específicas)',
            type: 'choice',
            options: ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'],
            category: 'history',
            priority: 8,
            reasoning: 'Algunas condiciones son específicas de género'
          },
          medical_history: {
            id: 'medical_history',
            text: '¿Tienes alguna condición médica preexistente? (diabetes, hipertensión, asma, etc.)',
            type: 'open',
            category: 'history',
            priority: 9,
            reasoning: 'Antecedentes médicos influyen en diagnóstico'
          }
        }
        return patientQuestions[field] || null
      },
      diagnosis: () => ({
        id: 'additional_symptoms',
        text: '¿Has notado algún otro síntoma que no hayas mencionado?',
        type: 'open',
        category: 'symptom',
        priority: 8,
        reasoning: 'Recopilar más información para mejorar diagnóstico'
      })
    }

    const questionGenerator = gapQuestions[type]
    return questionGenerator ? questionGenerator(detail) : null
  }

  /**
   * Infer appropriate questions based on symptom patterns
   */
  private inferSymptomQuestions(
    symptoms: { name: string }[],
    questionsAsked: string[]
  ): Question[] {
    const questions: Question[] = []
    const symptomText = symptoms.map(s => s.name.toLowerCase()).join(' ')

    // Pain-related symptoms
    if (/dolor|molestia|malestar/i.test(symptomText)) {
      if (!questionsAsked.includes('pain_characteristics')) {
        questions.push({
          id: 'pain_characteristics',
          text: '¿Cómo describirías el dolor? (punzante, opresivo, ardiente, sordo, etc.)',
          type: 'open',
          category: 'symptom',
          priority: 8,
          reasoning: 'Características del dolor orientan diagnóstico'
        })
      }

      if (!questionsAsked.includes('pain_radiation')) {
        questions.push({
          id: 'pain_radiation',
          text: '¿El dolor se mueve o irradia a otras partes del cuerpo?',
          type: 'yes_no',
          category: 'symptom',
          priority: 7,
          reasoning: 'Radiación del dolor indica origen específico'
        })
      }
    }

    // Respiratory symptoms
    if (/tos|respirar|pecho|gripe|resfriado/i.test(symptomText)) {
      if (!questionsAsked.includes('breathing_difficulty')) {
        questions.push({
          id: 'breathing_difficulty',
          text: '¿Tienes dificultad para respirar?',
          type: 'yes_no',
          category: 'red_flag',
          priority: 10,
          reasoning: 'Dificultad respiratoria es signo de alarma'
        })
      }
    }

    // Gastrointestinal symptoms
    if (/estómago|náusea|vómito|diarrea|abdomen/i.test(symptomText)) {
      if (!questionsAsked.includes('appetite_change')) {
        questions.push({
          id: 'appetite_change',
          text: '¿Has notado cambios en tu apetito?',
          type: 'choice',
          options: ['Aumentó', 'Disminuyó', 'Sin cambios', 'No he comido'],
          category: 'symptom',
          priority: 6,
          reasoning: 'Cambios en apetito son relevantes GI'
        })
      }
    }

    // Neurological symptoms
    if (/cabeza|mareo|vértigo|visión/i.test(symptomText)) {
      if (!questionsAsked.includes('neurological_symptoms')) {
        questions.push({
          id: 'neurological_symptoms',
          text: '¿Has notado alguno de estos síntomas: hormigueo, debilidad, dificultad para hablar o confusión?',
          type: 'yes_no',
          category: 'red_flag',
          priority: 10,
          reasoning: 'Síntomas neurológicos requieren evaluación urgente'
        })
      }
    }

    return questions
  }

  /**
   * Generate risk factor assessment questions
   */
  private generateRiskFactorQuestion(state: ConversationState): Question {
    const riskFactorQuestions = [
      {
        id: 'smoking',
        text: '¿Fumas o has fumado alguna vez?',
        type: 'choice' as const,
        options: ['Fumo actualmente', 'Fumé antes pero dejé', 'Nunca he fumado'],
        priority: 7
      },
      {
        id: 'alcohol',
        text: '¿Consumes alcohol? Si es así, ¿con qué frecuencia?',
        type: 'open' as const,
        priority: 6
      },
      {
        id: 'exercise',
        text: '¿Realizas actividad física regularmente?',
        type: 'choice' as const,
        options: ['Diariamente', 'Varias veces por semana', 'Ocasionalmente', 'Nunca'],
        priority: 5
      },
      {
        id: 'family_history',
        text: '¿Hay alguna enfermedad en tu familia que deba conocer? (diabetes, cáncer, cardíacas)',
        type: 'open' as const,
        priority: 8
      }
    ]

    // Find first risk factor question not yet asked
    for (const question of riskFactorQuestions) {
      if (!state.questions_asked.includes(question.id)) {
        return {
          ...question,
          category: 'risk_factor',
          reasoning: 'Evaluación de factores de riesgo'
        }
      }
    }

    // If all asked, return follow-up
    return {
      id: 'additional_info',
      text: '¿Hay algo más sobre tu estilo de vida o antecedentes que consideres relevante?',
      type: 'open',
      category: 'history',
      priority: 5,
      reasoning: 'Recopilar información adicional relevante'
    }
  }

  /**
   * Create fallback question when no specific question can be generated
   */
  private createFallbackQuestion(): Question {
    return {
      id: 'fallback',
      text: 'Cuéntame más sobre cómo te sientes.',
      type: 'open',
      category: 'symptom',
      priority: 5,
      reasoning: 'Pregunta genérica de respaldo'
    }
  }

  /**
   * Generate multiple questions (for batch processing)
   */
  async generateQuestionQueue(
    context: ConversationContext,
    count: number = 3
  ): Promise<Question[]> {
    const questions: Question[] = []
    const tempContext = { ...context }

    for (let i = 0; i < count; i++) {
      const question = await this.generateNextQuestion(tempContext)
      questions.push(question)
      
      // Simulate asking the question
      tempContext.state.questions_asked.push(question.id)
      tempContext.state.question_count++
    }

    return questions
  }

  /**
   * Reorder questions by priority and context
   */
  prioritizeQuestions(questions: Question[], state: ConversationState): Question[] {
    return questions.sort((a, b) => {
      // Red flag questions first
      if (a.category === 'red_flag' && b.category !== 'red_flag') return -1
      if (b.category === 'red_flag' && a.category !== 'red_flag') return 1

      // Then by priority
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }

      // Then by category relevance
      const categoryOrder = ['symptom', 'history', 'risk_factor', 'follow_up']
      return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category)
    })
  }
}

export const questionGenerator = new QuestionGenerator()
