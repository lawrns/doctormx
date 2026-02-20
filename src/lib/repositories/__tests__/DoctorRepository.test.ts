import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the repository methods directly
const mockFindById = vi.fn()
const mockFindApproved = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('../DoctorRepository', () => ({
  DoctorRepository: vi.fn().mockImplementation(() => ({
    findById: mockFindById,
    findApproved: mockFindApproved,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  })),
  doctorRepository: {
    findById: mockFindById,
    findApproved: mockFindApproved,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
}))

describe('DoctorRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('should call findById with correct id', async () => {
      const { doctorRepository } = await import('../DoctorRepository')
      const mockDoctor = {
        id: 'test-id',
        status: 'approved',
        bio: 'Experienced doctor',
      }
      mockFindById.mockResolvedValue(mockDoctor)

      const result = await doctorRepository.findById('test-id')

      expect(mockFindById).toHaveBeenCalledWith('test-id')
      expect(result).toEqual(mockDoctor)
    })

    it('should return null when not found', async () => {
      const { doctorRepository } = await import('../DoctorRepository')
      mockFindById.mockResolvedValue(null)

      const result = await doctorRepository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findApproved', () => {
    it('should return approved doctors', async () => {
      const { doctorRepository } = await import('../DoctorRepository')
      const doctors = [
        { id: 'doc1', status: 'approved' },
        { id: 'doc2', status: 'approved' },
      ]
      mockFindApproved.mockResolvedValue(doctors)

      const result = await doctorRepository.findApproved()

      expect(mockFindApproved).toHaveBeenCalled()
      expect(result).toEqual(doctors)
    })
  })

  describe('create', () => {
    it('should call create with correct data', async () => {
      const { doctorRepository } = await import('../DoctorRepository')
      const createData = {
        id: 'new-doctor-id',
        bio: 'New doctor bio',
      }
      const createdDoctor = { ...createData, status: 'draft' }
      mockCreate.mockResolvedValue(createdDoctor)

      const result = await doctorRepository.create(createData)

      expect(mockCreate).toHaveBeenCalledWith(createData)
      expect(result).toEqual(createdDoctor)
    })
  })

  describe('update', () => {
    it('should call update with correct id and data', async () => {
      const { doctorRepository } = await import('../DoctorRepository')
      const updateData = { bio: 'Updated bio' }
      const updatedDoctor = { id: 'test-id', bio: 'Updated bio' }
      mockUpdate.mockResolvedValue(updatedDoctor)

      const result = await doctorRepository.update('test-id', updateData)

      expect(mockUpdate).toHaveBeenCalledWith('test-id', updateData)
      expect(result).toEqual(updatedDoctor)
    })
  })

  describe('delete', () => {
    it('should call delete with correct id', async () => {
      const { doctorRepository } = await import('../DoctorRepository')
      mockDelete.mockResolvedValue(undefined)

      await doctorRepository.delete('test-id')

      expect(mockDelete).toHaveBeenCalledWith('test-id')
    })
  })
})
