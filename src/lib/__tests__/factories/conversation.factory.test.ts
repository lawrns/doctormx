/**
 * Conversation Factory Tests
 *
 * Verifica que la ConversationFactory genera datos consistentes y válidos.
 */

import { describe, it, expect } from 'vitest'
import { ConversationFactory } from './conversation.factory'

describe('ConversationFactory', () => {
  describe('create', () => {
    it('should create a valid conversation with default values', () => {
      const conversation = ConversationFactory.create()

      expect(conversation).toHaveProperty('id')
      expect(conversation).toHaveProperty('patient_id')
      expect(conversation).toHaveProperty('doctor_id')
      expect(conversation).toHaveProperty('appointment_id')
      expect(conversation).toHaveProperty('last_message_preview')
      expect(conversation).toHaveProperty('last_message_at')
      expect(conversation).toHaveProperty('is_archived')
      expect(conversation).toHaveProperty('created_at')
      expect(conversation).toHaveProperty('updated_at')
    })

    it('should generate unique IDs', () => {
      const conversation1 = ConversationFactory.create()
      const conversation2 = ConversationFactory.create()

      expect(conversation1.id).not.toBe(conversation2.id)
    })

    it('should generate valid UUIDs', () => {
      const conversation = ConversationFactory.create()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(conversation.id).toMatch(uuidRegex)
      expect(conversation.patient_id).toMatch(uuidRegex)
      expect(conversation.doctor_id).toMatch(uuidRegex)
    })

    it('should have is_archived as false by default', () => {
      const conversation = ConversationFactory.create()

      expect(conversation.is_archived).toBe(false)
    })

    it('should have last_message_preview by default', () => {
      const conversation = ConversationFactory.create()

      expect(conversation.last_message_preview).not.toBeNull()
      expect(typeof conversation.last_message_preview).toBe('string')
    })

    it('should apply overrides correctly', () => {
      const customDate = '2024-12-25T10:00:00.000Z'
      const conversation = ConversationFactory.create({
        is_archived: true,
        last_message_at: customDate,
      })

      expect(conversation.is_archived).toBe(true)
      expect(conversation.last_message_at).toBe(customDate)
    })
  })

  describe('createWithAppointment', () => {
    it('should create a conversation linked to an appointment', () => {
      const appointmentId = 'test-appointment-id-123'
      const conversation = ConversationFactory.createWithAppointment(appointmentId)

      expect(conversation.appointment_id).toBe(appointmentId)
    })
  })

  describe('createArchived', () => {
    it('should create an archived conversation', () => {
      const conversation = ConversationFactory.createArchived()

      expect(conversation.is_archived).toBe(true)
    })
  })

  describe('createEmpty', () => {
    it('should create a conversation without messages', () => {
      const conversation = ConversationFactory.createEmpty()

      expect(conversation.last_message_preview).toBeNull()
      expect(conversation.last_message_at).toBeNull()
    })
  })

  describe('createActive', () => {
    it('should create a conversation with recent message', () => {
      const conversation = ConversationFactory.createActive()
      const lastMessageAt = new Date(conversation.last_message_at!)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastMessageAt.getTime()) / (1000 * 60)

      expect(conversation.last_message_at).not.toBeNull()
      expect(diffMinutes).toBeLessThanOrEqual(10)
    })
  })

  describe('createInactive', () => {
    it('should create a conversation with old message', () => {
      const conversation = ConversationFactory.createInactive()
      const lastMessageAt = new Date(conversation.last_message_at!)
      const now = new Date()
      const diffDays = (now.getTime() - lastMessageAt.getTime()) / (1000 * 60 * 60 * 24)

      expect(conversation.last_message_at).not.toBeNull()
      expect(diffDays).toBeGreaterThanOrEqual(7)
    })
  })

  describe('createList', () => {
    it('should create the specified number of conversations', () => {
      const conversations = ConversationFactory.createList(5)

      expect(conversations).toHaveLength(5)
    })

    it('should create unique conversations', () => {
      const conversations = ConversationFactory.createList(10)
      const ids = conversations.map(c => c.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(10)
    })

    it('should apply overrides to all conversations', () => {
      const conversations = ConversationFactory.createList(3, { is_archived: true })

      conversations.forEach(conversation => {
        expect(conversation.is_archived).toBe(true)
      })
    })
  })

  describe('createMixedList', () => {
    it('should create a mixed list of conversations', () => {
      const conversations = ConversationFactory.createMixedList(20)

      expect(conversations).toHaveLength(20)
    })

    it('should create different types of conversations', () => {
      const conversations = ConversationFactory.createMixedList(50)
      
      const archivedCount = conversations.filter(c => c.is_archived).length
      const emptyCount = conversations.filter(c => c.last_message_preview === null).length

      // Con 50 conversaciones, debería haber al menos algunas variadas
      expect(archivedCount).toBeGreaterThanOrEqual(1)
      expect(emptyCount).toBeGreaterThanOrEqual(1)
    })
  })
})
