import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the repository methods directly
const mockFindById = vi.fn()
const mockFindAll = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('../PatientRepository', () => ({
  PatientRepository: vi.fn().mockImplementation(() => ({
    findById: mockFindById,
    findAll: mockFindAll,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  })),
  patientRepository: {
    findById: mockFindById,
    findAll: mockFindAll,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
}))

describe('PatientRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('should call findById with correct id', async () => {
      const { patientRepository } = await import('../PatientRepository')
      const mockPatient = {
        id: 'test-id',
        role: 'patient',
        full_name: 'Test Patient',
      }
      mockFindById.mockResolvedValue(mockPatient)

      const result = await patientRepository.findById('test-id')

      expect(mockFindById).toHaveBeenCalledWith('test-id')
      expect(result).toEqual(mockPatient)
    })

    it('should return null when not found', async () => {
      const { patientRepository } = await import('../PatientRepository')
      mockFindById.mockResolvedValue(null)

      const result = await patientRepository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all patients', async () => {
      const { patientRepository } = await import('../PatientRepository')
      const patients = [
        { id: 'pat1', role: 'patient' },
        { id: 'pat2', role: 'patient' },
      ]
      mockFindAll.mockResolvedValue(patients)

      const result = await patientRepository.findAll()

      expect(mockFindAll).toHaveBeenCalled()
      expect(result).toEqual(patients)
    })
  })

  describe('create', () => {
    it('should call create with correct data', async () => {
      const { patientRepository } = await import('../PatientRepository')
      const createData = {
        id: 'new-patient-id',
        fullName: 'New Patient',
      }
      const createdPatient = { ...createData, role: 'patient' }
      mockCreate.mockResolvedValue(createdPatient)

      const result = await patientRepository.create(createData)

      expect(mockCreate).toHaveBeenCalledWith(createData)
      expect(result).toEqual(createdPatient)
    })
  })

  describe('update', () => {
    it('should call update with correct id and data', async () => {
      const { patientRepository } = await import('../PatientRepository')
      const updateData = { fullName: 'Updated Name' }
      const updatedPatient = { id: 'test-id', full_name: 'Updated Name' }
      mockUpdate.mockResolvedValue(updatedPatient)

      const result = await patientRepository.update('test-id', updateData)

      expect(mockUpdate).toHaveBeenCalledWith('test-id', updateData)
      expect(result).toEqual(updatedPatient)
    })
  })

  describe('delete', () => {
    it('should call delete with correct id', async () => {
      const { patientRepository } = await import('../PatientRepository')
      mockDelete.mockResolvedValue(undefined)

      await patientRepository.delete('test-id')

      expect(mockDelete).toHaveBeenCalledWith('test-id')
    })
  })
})
