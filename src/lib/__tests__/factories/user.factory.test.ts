/**
 * User Factory Tests
 *
 * Verifica que la UserFactory genera datos consistentes y válidos.
 */

import { describe, it, expect } from 'vitest'
import { UserFactory } from './user.factory'
import type { UserProfile } from '@/types'

describe('UserFactory', () => {
  describe('create', () => {
    it('should create a valid user with default values', () => {
      const user = UserFactory.create()

      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('role')
      expect(user).toHaveProperty('full_name')
      expect(user).toHaveProperty('email')
      expect(user).toHaveProperty('phone')
      expect(user).toHaveProperty('photo_url')
      expect(user).toHaveProperty('created_at')
      expect(user).toHaveProperty('updated_at')
    })

    it('should generate unique IDs', () => {
      const user1 = UserFactory.create()
      const user2 = UserFactory.create()

      expect(user1.id).not.toBe(user2.id)
    })

    it('should generate valid UUIDs', () => {
      const user = UserFactory.create()
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

      expect(user.id).toMatch(uuidRegex)
    })

    it('should generate valid email addresses', () => {
      const user = UserFactory.create()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      expect(user.email).toMatch(emailRegex)
    })

    it('should generate valid Mexican phone numbers', () => {
      const user = UserFactory.create()
      const phoneRegex = /^\+52\d{10,12}$/

      expect(user.phone).toMatch(phoneRegex)
    })

    it('should apply overrides correctly', () => {
      const user = UserFactory.create({
        full_name: 'Juan Pérez García',
        email: 'juan@test.com',
        role: 'doctor',
      })

      expect(user.full_name).toBe('Juan Pérez García')
      expect(user.email).toBe('juan@test.com')
      expect(user.role).toBe('doctor')
    })

    it('should generate valid timestamps', () => {
      const user = UserFactory.create()
      const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

      expect(user.created_at).toMatch(dateRegex)
      expect(user.updated_at).toMatch(dateRegex)
    })
  })

  describe('createPatient', () => {
    it('should create a user with patient role', () => {
      const patient = UserFactory.createPatient()

      expect(patient.role).toBe('patient')
    })

    it('should include date_of_birth for patients', () => {
      const patient = UserFactory.createPatient()

      expect(patient.date_of_birth).toBeDefined()
      expect(patient.date_of_birth).not.toBeNull()
    })

    it('should include gender for patients', () => {
      const patient = UserFactory.createPatient()

      expect(['male', 'female', 'other', 'prefer_not_to_say']).toContain(patient.gender)
    })
  })

  describe('createDoctor', () => {
    it('should create a user with doctor role', () => {
      const doctor = UserFactory.createDoctor()

      expect(doctor.role).toBe('doctor')
    })

    it('should prefix doctor name with Dr.', () => {
      const doctor = UserFactory.createDoctor()

      expect(doctor.full_name).toMatch(/^Dr\.\s/)
    })

    it('should apply overrides for specialty', () => {
      const doctor = UserFactory.createDoctor({
        full_name: 'Dra. María López',
        email: 'maria.doctor@test.com',
      })

      expect(doctor.full_name).toBe('Dra. María López')
      expect(doctor.email).toBe('maria.doctor@test.com')
    })
  })

  describe('createAdmin', () => {
    it('should create a user with admin role', () => {
      const admin = UserFactory.createAdmin()

      expect(admin.role).toBe('admin')
    })
  })

  describe('createList', () => {
    it('should create the specified number of users', () => {
      const users = UserFactory.createList(5)

      expect(users).toHaveLength(5)
    })

    it('should create unique users', () => {
      const users = UserFactory.createList(10)
      const ids = users.map(u => u.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(10)
    })

    it('should apply overrides to all users', () => {
      const users = UserFactory.createList(3, { role: 'doctor' })

      users.forEach(user => {
        expect(user.role).toBe('doctor')
      })
    })
  })
})
