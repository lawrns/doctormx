'use client'

export type ProtocolStep =
  | 'first_name'
  | 'chief_complaint'
  | 'duration_onset'
  | 'location_quality'
  | 'severity'
  | 'red_flags'
  | 'context'
  | 'summary'
  | 'emergency'

export type ProtocolAnswers = {
  firstName?: string
  chiefComplaint?: string
  durationOnset?: string
  locationQuality?: string
  severity?: string
  redFlags?: string
  context?: string
}

export type ProtocolState = {
  step: ProtocolStep
  answers: ProtocolAnswers
  pendingChiefComplaint?: string
  completed: boolean
}

export type CaseSummary = {
  firstName?: string
  chiefComplaint?: string
  urgency: 'pending' | 'low' | 'moderate' | 'high' | 'emergency'
  specialty?: string
  nextQuestion: string
  summaryText?: string
}

export type ProtocolResult = {
  state: ProtocolState
  assistantMessage: string
  caseSummary: CaseSummary
}

const EMERGENCY_PATTERN =
  /dolor.{0,30}pecho|pecho.{0,30}dolor|falta.{0,12}aire|dificultad.{0,15}respirar|no puedo respirar|desmayo|convulsi|debilidad.{0,20}(brazo|pierna|lado)|confusi[oó]n|sangrado.{0,20}(fuerte|importante|no para)|suicid|hacerme da[nñ]o/i

function cleanAnswer(input: string) {
  return input.trim().replace(/\s+/g, ' ')
}

function extractFirstName(input: string) {
  const cleaned = cleanAnswer(input)
    .replace(/^(me llamo|soy|mi nombre es|puedes llamarme|ll[aá]mame)\s+/i, '')
    .replace(/[.,;:!?]+$/g, '')
    .trim()
  return cleaned.split(/\s+/)[0] || cleaned
}

export function createInitialProtocolState(): ProtocolState {
  return {
    step: 'first_name',
    answers: {},
    completed: false,
  }
}

export function getInitialAssistantMessage() {
  return 'Hola, soy Dr. Simeon. Antes de hablar de síntomas, ¿cuál es tu primer nombre?'
}

export function looksLikeClinicalPrompt(input: string) {
  return /dolor|fiebre|tos|mareo|náusea|nausea|vomit|diarrea|respir|pecho|espalda|cabeza|est[oó]mago|urgencia|síntoma|sintoma/i.test(input)
}

export function inferSpecialty(answers: ProtocolAnswers) {
  const text = Object.values(answers).filter(Boolean).join(' ').toLowerCase()
  if (/pecho|coraz[oó]n|palpit|presi[oó]n/.test(text)) return 'Cardiología'
  if (/cabeza|migra|mareo|v[eé]rtigo|debilidad|hormigueo/.test(text)) return 'Neurología'
  if (/espalda|rodilla|hombro|cuello|m[uú]sculo|articulaci[oó]n/.test(text)) return 'Traumatología'
  if (/est[oó]mago|abdomen|diarrea|n[aá]usea|v[oó]mito|reflujo/.test(text)) return 'Gastroenterología'
  if (/tos|garganta|respir|pulm[oó]n|asma/.test(text)) return 'Neumología'
  if (/piel|roncha|erupci[oó]n|mancha|comez[oó]n/.test(text)) return 'Dermatología'
  if (/ansiedad|p[aá]nico|triste|depresi[oó]n|insomnio/.test(text)) return 'Psicología'
  return 'Medicina General'
}

export function inferUrgency(answers: ProtocolAnswers): CaseSummary['urgency'] {
  const text = Object.values(answers).filter(Boolean).join(' ')
  if (EMERGENCY_PATTERN.test(text)) return 'emergency'

  const severityText = answers.severity || ''
  const severityMatch = severityText.match(/\b(10|[1-9])\b/)
  const severity = severityMatch ? Number(severityMatch[1]) : 0

  if (severity >= 8 || /empeor|muy fuerte|insoportable|intenso/i.test(text)) return 'high'
  if (severity >= 5 || /varios d[ií]as|semana|persist/i.test(text)) return 'moderate'
  return 'low'
}

export function summarizeCase(answers: ProtocolAnswers) {
  const parts = [
    answers.chiefComplaint && `motivo principal: ${answers.chiefComplaint}`,
    answers.durationOnset && `evolución: ${answers.durationOnset}`,
    answers.locationQuality && `características: ${answers.locationQuality}`,
    answers.severity && `intensidad: ${answers.severity}`,
    answers.redFlags && `alarmas revisadas: ${answers.redFlags}`,
    answers.context && `contexto: ${answers.context}`,
  ].filter(Boolean)

  return parts.join('; ')
}

export function getCaseSummary(state: ProtocolState): CaseSummary {
  const urgency = state.completed || state.step === 'emergency'
    ? inferUrgency(state.answers)
    : 'pending'

  const specialty = state.completed || state.step === 'emergency'
    ? inferSpecialty(state.answers)
    : undefined

  return {
    firstName: state.answers.firstName,
    chiefComplaint: state.answers.chiefComplaint || state.pendingChiefComplaint,
    urgency,
    specialty,
    nextQuestion: getPromptForStep(state.step, state.answers.firstName),
    summaryText: state.completed ? summarizeCase(state.answers) : undefined,
  }
}

export function getPromptForStep(step: ProtocolStep, firstName?: string) {
  const name = firstName ? `${firstName}, ` : ''
  switch (step) {
    case 'first_name':
      return '¿Cuál es tu primer nombre?'
    case 'chief_complaint':
      return `${name}¿qué te trae hoy? Cuéntame el síntoma o preocupación principal.`
    case 'duration_onset':
      return '¿Desde cuándo empezó y fue de repente o poco a poco?'
    case 'location_quality':
      return '¿Dónde lo sientes exactamente y cómo lo describirías?'
    case 'severity':
      return 'En una escala del 1 al 10, ¿qué tan intenso es?'
    case 'red_flags':
      return '¿Tienes falta de aire, dolor fuerte en el pecho, desmayo, debilidad de un lado, confusión o sangrado importante?'
    case 'context':
      return 'Para cerrar el contexto: ¿tomas medicamentos, tienes alergias, embarazo, enfermedades previas o algo relevante?'
    case 'summary':
      return 'Ya tengo lo necesario para ordenar el caso.'
    case 'emergency':
      return 'Busca atención urgente ahora.'
  }
}

export function applyProtocolTurn(state: ProtocolState, rawInput: string): ProtocolResult {
  const input = cleanAnswer(rawInput)
  const nextState: ProtocolState = {
    ...state,
    answers: { ...state.answers },
  }

  if (EMERGENCY_PATTERN.test(input)) {
    if (nextState.step !== 'first_name') {
      if (nextState.step === 'chief_complaint') nextState.answers.chiefComplaint = input
      if (nextState.step === 'red_flags') nextState.answers.redFlags = input
    }
    nextState.step = 'emergency'
    nextState.completed = true
    const caseSummary = getCaseSummary(nextState)
    return {
      state: nextState,
      caseSummary,
      assistantMessage:
        'Esto puede ser una señal de alarma. No esperes una orientación por chat: llama al 911 o acude a urgencias ahora. Si puedes, pide a alguien que te acompañe.',
    }
  }

  switch (state.step) {
    case 'first_name': {
      const firstName = extractFirstName(input)
      nextState.answers.firstName = firstName
      if (state.pendingChiefComplaint) {
        nextState.answers.chiefComplaint = state.pendingChiefComplaint
        nextState.step = 'duration_onset'
        break
      }
      nextState.step = 'chief_complaint'
      break
    }
    case 'chief_complaint':
      nextState.answers.chiefComplaint = input
      nextState.step = 'duration_onset'
      break
    case 'duration_onset':
      nextState.answers.durationOnset = input
      nextState.step = 'location_quality'
      break
    case 'location_quality':
      nextState.answers.locationQuality = input
      nextState.step = 'severity'
      break
    case 'severity':
      nextState.answers.severity = input
      nextState.step = 'red_flags'
      break
    case 'red_flags':
      nextState.answers.redFlags = input
      nextState.step = 'context'
      break
    case 'context':
      nextState.answers.context = input
      nextState.step = 'summary'
      nextState.completed = true
      break
    case 'summary':
    case 'emergency':
      nextState.answers.context = [nextState.answers.context, input].filter(Boolean).join(' · ')
      nextState.completed = true
      break
  }

  const caseSummary = getCaseSummary(nextState)

  if (nextState.completed) {
    return {
      state: nextState,
      caseSummary,
      assistantMessage: `${nextState.answers.firstName ? `${nextState.answers.firstName}, ` : ''}ya ordené el caso. ${caseSummary.summaryText ? `Resumen: ${caseSummary.summaryText}. ` : ''}La orientación inicial es ${caseSummary.urgency === 'high' ? 'consultar pronto, idealmente hoy.' : caseSummary.urgency === 'moderate' ? 'buscar consulta esta semana.' : 'agendar una consulta de rutina si continúa.'} La especialidad sugerida es ${caseSummary.specialty}.`,
    }
  }

  return {
    state: nextState,
    caseSummary,
    assistantMessage: `Gracias${nextState.answers.firstName ? `, ${nextState.answers.firstName}` : ''}. ${getPromptForStep(nextState.step, nextState.answers.firstName)}`,
  }
}

export function seedChiefComplaintBeforeName(state: ProtocolState, prompt: string): ProtocolResult {
  const nextState: ProtocolState = {
    ...state,
    pendingChiefComplaint: prompt,
  }

  return {
    state: nextState,
    caseSummary: getCaseSummary(nextState),
    assistantMessage: 'Lo tomo como el motivo principal. Antes de seguir, ¿cuál es tu primer nombre?',
  }
}
