/**
 * Message Factory
 *
 * Factory para generar datos de prueba de mensajes de chat consistentes y realistas.
 * Soporta mensajes de pacientes y doctores, con diferentes tipos de contenido.
 *
 * @example
 * ```typescript
 * const message = MessageFactory.create();
 * const fromPatient = MessageFactory.createFromPatient();
 * const messages = MessageFactory.createList(10);
 * ```
 */

import type { ChatMessage as Message, ChatMessageType, ChatSenderType } from '@/types'

/**
 * Genera un UUID v4 válido
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Genera un timestamp ISO válido
 */
function generateTimestamp(minutesAgo: number = 0): string {
  const date = new Date()
  date.setMinutes(date.getMinutes() - minutesAgo)
  return date.toISOString()
}

/**
 * Contenidos de mensajes de pacientes
 */
const PATIENT_MESSAGES = [
  'Buenos días doctor, tengo una consulta',
  '¿Debo continuar con el tratamiento?',
  'Me siento mucho mejor, gracias',
  'Tengo una molestia en el estómago',
  '¿Puede revisar mis resultados?',
  '¿Cuándo es mi próxima cita?',
  'El medicamento me causó sueño',
  '¿Es normal sentir estos síntomas?',
  'Adjunto mi receta anterior',
  '¿Puede recetarme algo para el dolor?',
  'Gracias por su tiempo doctor',
  'Tengo una urgencia médica',
]

/**
 * Contenidos de mensajes de doctores
 */
const DOCTOR_MESSAGES = [
  'Buenos días, ¿en qué puedo ayudarle?',
  'Continúe con el tratamiento por 5 días más',
  'Me da gusto saber que se siente mejor',
  'Vamos a programar unos análisis',
  'Sus resultados se ven bien',
  'Su próxima cita es el próximo martes',
  'Ese efecto es normal, no se preocupe',
  'Venga a consulta si persiste el malestar',
  'Recibí su receta, está en orden',
  'Le receto un analgésico',
  'Gracias a usted, cuídese',
  'Acuda a urgencias de inmediato',
]

/**
 * Nombres de archivos adjuntos comunes
 */
const ATTACHMENT_NAMES = [
  'resultados_laboratorio.pdf',
  'receta_medica.jpg',
  'rayos_x.png',
  'ultrasonido.pdf',
  'historial_medico.pdf',
  'análisis_sangre.jpg',
  'receta_farmacia.png',
  'orden_estudios.pdf',
]

/**
 * Tipos MIME comunes
 */
const MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

/**
 * Factory para crear mensajes de prueba
 */
export const MessageFactory = {
  /**
   * Crea un mensaje base con valores por defecto
   */
  create(overrides: Partial<Message> = {}): Message {
    const createdAt = overrides.created_at || generateTimestamp(Math.floor(Math.random() * 60))

    return {
      id: generateUUID(),
      conversation_id: generateUUID(),
      sender_id: generateUUID(),
      sender_type: 'patient',
      content: PATIENT_MESSAGES[Math.floor(Math.random() * PATIENT_MESSAGES.length)],
      message_type: 'text',
      attachment_url: null,
      attachment_name: null,
      attachment_type: null,
      read_at: null,
      created_at: createdAt,
      ...overrides,
    }
  },

  /**
   * Crea un mensaje de un paciente
   */
  createFromPatient(overrides: Partial<Message> = {}): Message {
    return this.create({
      sender_type: 'patient',
      content: PATIENT_MESSAGES[Math.floor(Math.random() * PATIENT_MESSAGES.length)],
      ...overrides,
    })
  },

  /**
   * Crea un mensaje de un doctor
   */
  createFromDoctor(overrides: Partial<Message> = {}): Message {
    return this.create({
      sender_type: 'doctor',
      content: DOCTOR_MESSAGES[Math.floor(Math.random() * DOCTOR_MESSAGES.length)],
      ...overrides,
    })
  },

  /**
   * Crea un mensaje con imagen adjunta
   */
  createWithImage(overrides: Partial<Message> = {}): Message {
    return this.create({
      message_type: 'image',
      attachment_url: `https://storage.doctormx.com/chat/${generateUUID()}.jpg`,
      attachment_name: 'imagen.jpg',
      attachment_type: 'image/jpeg',
      content: 'Adjunto imagen para su revisión',
      ...overrides,
    })
  },

  /**
   * Crea un mensaje con archivo adjunto
   */
  createWithFile(overrides: Partial<Message> = {}): Message {
    const fileName = ATTACHMENT_NAMES[Math.floor(Math.random() * ATTACHMENT_NAMES.length)]
    const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
    
    return this.create({
      message_type: 'file',
      attachment_url: `https://storage.doctormx.com/chat/${generateUUID()}/${fileName}`,
      attachment_name: fileName,
      attachment_type: mimeType,
      content: `Adjunto archivo: ${fileName}`,
      ...overrides,
    })
  },

  /**
   * Crea un mensaje leído
   */
  createRead(overrides: Partial<Message> = {}): Message {
    const createdAt = generateTimestamp(Math.floor(Math.random() * 60))
    return this.create({
      read_at: generateTimestamp(Math.max(0, Math.floor(Math.random() * 30) - 10)),
      created_at: createdAt,
      ...overrides,
    })
  },

  /**
   * Crea un mensaje no leído
   */
  createUnread(overrides: Partial<Message> = {}): Message {
    return this.create({
      read_at: null,
      created_at: generateTimestamp(0),
      ...overrides,
    })
  },

  /**
   * Crea una lista de mensajes
   */
  createList(count: number, overrides: Partial<Message> = {}): Message[] {
    return Array.from({ length: count }, () => this.create(overrides))
  },

  /**
   * Crea una conversación simulada con mensajes alternados
   */
  createConversation(
    conversationId: string,
    patientId: string,
    doctorId: string,
    messageCount: number = 10
  ): Message[] {
    const messages: Message[] = []
    const isPatientStart = Math.random() > 0.5
    const baseTime = Date.now()

    for (let i = 0; i < messageCount; i++) {
      const isPatient = isPatientStart ? i % 2 === 0 : i % 2 !== 0
      const minutesAgo = (messageCount - i) * 5 // Más antiguo a más reciente
      
      messages.push(
        this.create({
          conversation_id: conversationId,
          sender_id: isPatient ? patientId : doctorId,
          sender_type: isPatient ? 'patient' : 'doctor',
          content: isPatient
            ? PATIENT_MESSAGES[Math.floor(Math.random() * PATIENT_MESSAGES.length)]
            : DOCTOR_MESSAGES[Math.floor(Math.random() * DOCTOR_MESSAGES.length)],
          read_at: i < messageCount - 3 ? generateTimestamp(minutesAgo + 2) : null,
          created_at: new Date(baseTime - minutesAgo * 60 * 1000).toISOString(),
        })
      )
    }

    return messages
  },

  /**
   * Crea una lista de mensajes variados
   */
  createMixedList(count: number): Message[] {
    const messages: Message[] = []

    for (let i = 0; i < count; i++) {
      const rand = Math.random()
      
      if (rand < 0.15) {
        messages.push(this.createWithImage())
      } else if (rand < 0.25) {
        messages.push(this.createWithFile())
      } else if (rand < 0.5) {
        messages.push(this.createFromDoctor())
      } else {
        messages.push(this.createFromPatient())
      }
    }

    return messages
  },
}

/**
 * Tipo de retorno de la factory para uso en tests
 */
export type MessageFactoryType = typeof MessageFactory
