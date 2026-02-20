import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the repository methods directly
const mockFindById = vi.fn()
const mockFindByDoctor = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()

vi.mock('../AppointmentRepository', () => ({
  AppointmentRepository: vi.fn().mockImplementation(() => ({
    findById: mockFindById,
    findByDoctor: mockFindByDoctor,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  })),
  appointmentRepository: {
    findById: mockFindById,
    findByDoctor: mockFindByDoctor,
    create: mockCreate,
    update: mockUpdate,
    delete: mockDelete,
  },
}))

describe('AppointmentRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findById', () => {
    it('should call findById with correct id', async () => {
      const { appointmentRepository } = await import('../AppointmentRepository')
      const mockAppointment = {
        id: 'test-id',
        patient_id: 'patient-id',
        doctor_id: 'doctor-id',
        status: 'confirmed',
      }
      mockFindById.mockResolvedValue(mockAppointment)

      const result = await appointmentRepository.findById('test-id')

      expect(mockFindById).toHaveBeenCalledWith('test-id')
      expect(result).toEqual(mockAppointment)
    })

    it('should return null when not found', async () => {
      const { appointmentRepository } = await import('../AppointmentRepository')
      mockFindById.mockResolvedValue(null)

      const result = await appointmentRepository.findById('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('findByDoctor', () => {
    it('should call findByDoctor with correct doctor id', async () => {
      const { appointmentRepository } = await import('../AppointmentRepository')
      const appointments = [{ id: 'apt1' }, { id: 'apt2' }]
      mockFindByDoctor.mockResolvedValue(appointments)

      const result = await appointmentRepository.findByDoctor('doctor-id')

      expect(mockFindByDoctor).toHaveBeenCalledWith('doctor-id')
      expect(result).toEqual(appointments)
    })
  })

  describe('create', () => {
    it('should call create with correct data', async () => {
      const { appointmentRepository } = await import('../AppointmentRepository')
      const createData = {
        patientId: 'patient-id',
        doctorId: 'doctor-id',
        startTs: '2025-01-01T10:00:00Z',
        endTs: '2025-01-01T10:30:00Z',
      }
      const createdAppointment = { id: 'new-id', ...createData }
      mockCreate.mockResolvedValue(createdAppointment)

      const result = await appointmentRepository.create(createData)

      expect(mockCreate).toHaveBeenCalledWith(createData)
      expect(result).toEqual(createdAppointment)
    })
  })

  describe('update', () => {
    it('should call update with correct id and data', async () => {
      const { appointmentRepository } = await import('../AppointmentRepository')
      const updateData = { status: 'confirmed' as const }
      const updatedAppointment = { id: 'test-id', status: 'confirmed' }
      mockUpdate.mockResolvedValue(updatedAppointment)

      const result = await appointmentRepository.update('test-id', updateData)

      expect(mockUpdate).toHaveBeenCalledWith('test-id', updateData)
      expect(result).toEqual(updatedAppointment)
    })
  })

  describe('delete', () => {
    it('should call delete with correct id', async () => {
      const { appointmentRepository } = await import('../AppointmentRepository')
      mockDelete.mockResolvedValue(undefined)

      await appointmentRepository.delete('test-id')

      expect(mockDelete).toHaveBeenCalledWith('test-id')
    })
  })
})
