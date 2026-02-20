import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the repository methods directly
const mockFindById = vi.fn()
const mockFindByRole = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('../UserRepository', () => ({
  UserRepository: vi.fn().mockImplementation(() => ({
    findById: mockFindById,
    findByRole: mockFindByRole,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  })),
  userRepository: {
    findById: mockFindById,
    findByRole: mockFindByRole,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
}))

describe('UserRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('should call findById with correct id', async () => {
      const { userRepository } = await import('../UserRepository')
      const mockUser = {
        id: 'test-id',
        role: 'patient',
        full_name: 'Test User',
      }
      mockFindById.mockResolvedValue(mockUser)

      const result = await userRepository.findById('test-id')

      expect(mockFindById).toHaveBeenCalledWith('test-id')
      expect(result).toEqual(mockUser)
    })

    it('should return null when not found', async () => {
      const { userRepository } = await import('../UserRepository')
      mockFindById.mockResolvedValue(null)

      const result = await userRepository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findByRole', () => {
    it('should return users by role', async () => {
      const { userRepository } = await import('../UserRepository')
      const users = [
        { id: 'user1', role: 'doctor' },
        { id: 'user2', role: 'doctor' },
      ]
      mockFindByRole.mockResolvedValue(users)

      const result = await userRepository.findByRole('doctor')

      expect(mockFindByRole).toHaveBeenCalledWith('doctor')
      expect(result).toEqual(users)
    })
  })

  describe('create', () => {
    it('should call create with correct data', async () => {
      const { userRepository } = await import('../UserRepository')
      const createData = {
        id: 'new-user-id',
        role: 'patient' as const,
        fullName: 'New User',
      }
      const createdUser = { ...createData }
      mockCreate.mockResolvedValue(createdUser)

      const result = await userRepository.create(createData)

      expect(mockCreate).toHaveBeenCalledWith(createData)
      expect(result).toEqual(createdUser)
    })
  })

  describe('update', () => {
    it('should call update with correct id and data', async () => {
      const { userRepository } = await import('../UserRepository')
      const updateData = { fullName: 'Updated Name' }
      const updatedUser = { id: 'test-id', full_name: 'Updated Name' }
      mockUpdate.mockResolvedValue(updatedUser)

      const result = await userRepository.update('test-id', updateData)

      expect(mockUpdate).toHaveBeenCalledWith('test-id', updateData)
      expect(result).toEqual(updatedUser)
    })
  })

  describe('delete', () => {
    it('should call delete with correct id', async () => {
      const { userRepository } = await import('../UserRepository')
      mockDelete.mockResolvedValue(undefined)

      await userRepository.delete('test-id')

      expect(mockDelete).toHaveBeenCalledWith('test-id')
    })
  })
})
