/**
 * Conversation Factory
 *
 * Factory para generar datos de prueba de conversaciones de chat consistentes y realistas.
 * Soporta conversaciones con mensajes y diferentes estados.
 *
 * @example
 * ```typescript
 * const conversation = ConversationFactory.create();
 * const withMessages = ConversationFactory.createWithMessages(5);
 * const conversations = ConversationFactory.createList(3);
 * ```
 */

import type { ChatConversation as Conversation } from '@/types'

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
 * Previews de últimos mensajes comunes
 */
const LAST_MESSAGE_PREVIEWS = [
  'Gracias doctor, me siento mejor',
  '¿Debo tomar el medicamento antes o después de comer?',
  'Adjunto los resultados de los análisis',
  'Perfecto, nos vemos en la consulta',
  '¿Cuándo debo hacerme el siguiente chequeo?',
  'El dolor ha disminuido considerablemente',
  'Tengo una duda sobre la receta',
  '¿Puede darme una cita para la próxima semana?',
  'Muchas gracias por su atención',
  '¿Es normal tener estos síntomas?',
]

/**
 * Factory para crear conversaciones de prueba
 */
export const ConversationFactory = {
  /**
   * Crea una conversación base con valores por defecto
   */
  create(overrides: Partial<Conversation> = {}): Conversation {
    const lastMessageAt = overrides.last_message_at || generateTimestamp(Math.floor(Math.random() * 60))
    const createdAt = overrides.created_at || generateTimestamp(Math.floor(Math.random() * 60 * 24 * 7))

    return {
      id: generateUUID(),
      patient_id: generateUUID(),
      doctor_id: generateUUID(),
      appointment_id: null,
      last_message_preview: LAST_MESSAGE_PREVIEWS[Math.floor(Math.random() * LAST_MESSAGE_PREVIEWS.length)],
      last_message_at: lastMessageAt,
      is_archived: false,
      created_at: createdAt,
      updated_at: generateTimestamp(0),
      ...overrides,
    }
  },

  /**
   * Crea una conversación vinculada a una cita
   */
  createWithAppointment(appointmentId: string, overrides: Partial<Conversation> = {}): Conversation {
    return this.create({
      appointment_id: appointmentId,
      ...overrides,
    })
  },

  /**
   * Crea una conversación archivada
   */
  createArchived(overrides: Partial<Conversation> = {}): Conversation {
    return this.create({
      is_archived: true,
      ...overrides,
    })
  },

  /**
   * Crea una conversación sin mensajes (nueva)
   */
  createEmpty(overrides: Partial<Conversation> = {}): Conversation {
    return this.create({
      last_message_preview: null,
      last_message_at: null,
      ...overrides,
    })
  },

  /**
   * Crea una conversación activa (mensaje reciente)
   */
  createActive(overrides: Partial<Conversation> = {}): Conversation {
    return this.create({
      last_message_at: generateTimestamp(Math.floor(Math.random() * 10)),
      ...overrides,
    })
  },

  /**
   * Crea una conversación inactiva (sin mensajes recientes)
   */
  createInactive(overrides: Partial<Conversation> = {}): Conversation {
    return this.create({
      last_message_at: generateTimestamp(60 * 24 * 7 + Math.floor(Math.random() * 60 * 24 * 23)), // 7-30 días
      ...overrides,
    })
  },

  /**
   * Crea una lista de conversaciones
   */
  createList(count: number, overrides: Partial<Conversation> = {}): Conversation[] {
    return Array.from({ length: count }, () => this.create(overrides))
  },

  /**
   * Crea conversaciones variadas para simular datos reales
   */
  createMixedList(count: number): Conversation[] {
    const conversations: Conversation[] = []
    
    for (let i = 0; i < count; i++) {
      const rand = Math.random()
      if (rand < 0.1) {
        conversations.push(this.createEmpty())
      } else if (rand < 0.3) {
        conversations.push(this.createArchived())
      } else if (rand < 0.6) {
        conversations.push(this.createActive())
      } else {
        conversations.push(this.createInactive())
      }
    }
    
    return conversations
  },
}

/**
 * Tipo de retorno de la factory para uso en tests
 */
export type ConversationFactoryType = typeof ConversationFactory
