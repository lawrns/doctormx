/**
 * Message Factory Tests
 *
 * Verifica que la MessageFactory genera datos consistentes y válidos.
 */

import { describe, it, expect } from 'vitest'
import { MessageFactory } from './message.factory'

describe('MessageFactory', () => {
  describe('create', () => {
    it('should create a valid message with default values', () => {
      const message = MessageFactory.create()

      expect(message).toHaveProperty('id')
      expect(message).toHaveProperty('conversation_id')
      expect(message).toHaveProperty('sender_id')
      expect(message).toHaveProperty('sender_type')
      expect(message).toHaveProperty('content')
      expect(message).toHaveProperty('message_type')
      expect(message).toHaveProperty('attachment_url')
      expect(message).toHaveProperty('attachment_name')
      expect(message).toHaveProperty('attachment_type')
      expect(message).toHaveProperty('read_at')
      expect(message).toHaveProperty('created_at')
    })

    it('should generate unique IDs', () => {
      const message1 = MessageFactory.create()
      const message2 = MessageFactory.create()

      expect(message1.id).not.toBe(message2.id)
    })

    it('should generate valid UUIDs', () => {
      const message = MessageFactory.create()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(message.id).toMatch(uuidRegex)
      expect(message.conversation_id).toMatch(uuidRegex)
      expect(message.sender_id).toMatch(uuidRegex)
    })

    it('should have text message type by default', () => {
      const message = MessageFactory.create()

      expect(message.message_type).toBe('text')
    })

    it('should have patient as default sender_type', () => {
      const message = MessageFactory.create()

      expect(message.sender_type).toBe('patient')
    })

    it('should apply overrides correctly', () => {
      const message = MessageFactory.create({
        content: 'Mensaje personalizado',
        message_type: 'image',
        sender_type: 'doctor',
      })

      expect(message.content).toBe('Mensaje personalizado')
      expect(message.message_type).toBe('image')
      expect(message.sender_type).toBe('doctor')
    })
  })

  describe('createFromPatient', () => {
    it('should create a message from a patient', () => {
      const message = MessageFactory.createFromPatient()

      expect(message.sender_type).toBe('patient')
    })

    it('should have patient message content', () => {
      const message = MessageFactory.createFromPatient()

      expect(message.content.length).toBeGreaterThan(0)
    })
  })

  describe('createFromDoctor', () => {
    it('should create a message from a doctor', () => {
      const message = MessageFactory.createFromDoctor()

      expect(message.sender_type).toBe('doctor')
    })

    it('should have doctor message content', () => {
      const message = MessageFactory.createFromDoctor()

      expect(message.content.length).toBeGreaterThan(0)
    })
  })

  describe('createWithImage', () => {
    it('should create a message with image attachment', () => {
      const message = MessageFactory.createWithImage()

      expect(message.message_type).toBe('image')
      expect(message.attachment_url).not.toBeNull()
      expect(message.attachment_type).toBe('image/jpeg')
    })

    it('should have attachment name', () => {
      const message = MessageFactory.createWithImage()

      expect(message.attachment_name).toBe('imagen.jpg')
    })
  })

  describe('createWithFile', () => {
    it('should create a message with file attachment', () => {
      const message = MessageFactory.createWithFile()

      expect(message.message_type).toBe('file')
      expect(message.attachment_url).not.toBeNull()
      expect(message.attachment_name).not.toBeNull()
    })

    it('should have valid attachment type', () => {
      const message = MessageFactory.createWithFile()

      expect(['application/pdf', 'image/jpeg']).toContain(message.attachment_type)
    })
  })

  describe('createRead', () => {
    it('should create a read message', () => {
      const message = MessageFactory.createRead()

      expect(message.read_at).not.toBeNull()
    })
  })

  describe('createUnread', () => {
    it('should create an unread message', () => {
      const message = MessageFactory.createUnread()

      expect(message.read_at).toBeNull()
    })
  })

  describe('createList', () => {
    it('should create the specified number of messages', () => {
      const messages = MessageFactory.createList(5)

      expect(messages).toHaveLength(5)
    })

    it('should create unique messages', () => {
      const messages = MessageFactory.createList(10)
      const ids = messages.map(m => m.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(10)
    })

    it('should apply overrides to all messages', () => {
      const messages = MessageFactory.createList(3, { sender_type: 'doctor' })

      messages.forEach(message => {
        expect(message.sender_type).toBe('doctor')
      })
    })
  })

  describe('createConversation', () => {
    it('should create a simulated conversation', () => {
      const conversationId = 'conv-123'
      const patientId = 'patient-456'
      const doctorId = 'doctor-789'
      
      const messages = MessageFactory.createConversation(conversationId, patientId, doctorId, 10)

      expect(messages).toHaveLength(10)
    })

    it('should have all messages in the same conversation', () => {
      const conversationId = 'conv-123'
      const patientId = 'patient-456'
      const doctorId = 'doctor-789'
      
      const messages = MessageFactory.createConversation(conversationId, patientId, doctorId, 5)

      messages.forEach(message => {
        expect(message.conversation_id).toBe(conversationId)
      })
    })

    it('should alternate between patient and doctor', () => {
      const conversationId = 'conv-123'
      const patientId = 'patient-456'
      const doctorId = 'doctor-789'
      
      const messages = MessageFactory.createConversation(conversationId, patientId, doctorId, 6)
      const patientMessages = messages.filter(m => m.sender_type === 'patient')
      const doctorMessages = messages.filter(m => m.sender_type === 'doctor')

      // Con 6 mensajes, debería haber ~3 de cada uno
      expect(patientMessages.length).toBeGreaterThanOrEqual(2)
      expect(doctorMessages.length).toBeGreaterThanOrEqual(2)
    })

    it('should have correct sender IDs', () => {
      const conversationId = 'conv-123'
      const patientId = 'patient-456'
      const doctorId = 'doctor-789'
      
      const messages = MessageFactory.createConversation(conversationId, patientId, doctorId, 4)

      messages.forEach(message => {
        if (message.sender_type === 'patient') {
          expect(message.sender_id).toBe(patientId)
        } else {
          expect(message.sender_id).toBe(doctorId)
        }
      })
    })

    it('should have messages in chronological order', () => {
      const conversationId = 'conv-123'
      const patientId = 'patient-456'
      const doctorId = 'doctor-789'
      
      const messages = MessageFactory.createConversation(conversationId, patientId, doctorId, 5)

      for (let i = 1; i < messages.length; i++) {
        const prevDate = new Date(messages[i - 1].created_at)
        const currDate = new Date(messages[i].created_at)
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime())
      }
    })
  })

  describe('createMixedList', () => {
    it('should create a mixed list of messages', () => {
      const messages = MessageFactory.createMixedList(20)

      expect(messages).toHaveLength(20)
    })

    it('should create different types of messages', () => {
      const messages = MessageFactory.createMixedList(100)
      
      const images = messages.filter(m => m.message_type === 'image')
      const files = messages.filter(m => m.message_type === 'file')
      const texts = messages.filter(m => m.message_type === 'text')

      // Con 100 mensajes, debería haber variedad (probabilidades: 15% imagen, 10% archivo, 75% texto)
      expect(images.length + files.length + texts.length).toBe(100)
      expect(texts.length).toBeGreaterThanOrEqual(1)
    })
  })
})
