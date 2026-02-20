/**
 * Repository Pattern Implementation
 *
 * This module provides repository classes for all database operations,
 * abstracting Supabase queries and providing a clean API for data access.
 *
 * @module repositories
 *
 * @example
 * ```typescript
 * import { appointmentRepository, doctorRepository } from '@/lib/repositories'
 *
 * // Using singleton instances
 * const appointment = await appointmentRepository.findById('uuid')
 * const doctors = await doctorRepository.findApproved()
 *
 * // Or create custom instances
 * import { AppointmentRepository } from '@/lib/repositories'
 * const repo = new AppointmentRepository({ useServiceRole: true })
 * ```
 */

// Export all repository classes (values)
export {
  AppointmentRepository,
  appointmentRepository,
} from './AppointmentRepository'

export {
  DoctorRepository,
  doctorRepository,
} from './DoctorRepository'

export {
  PatientRepository,
  patientRepository,
} from './PatientRepository'

export {
  UserRepository,
  userRepository,
} from './UserRepository'

// Export all types separately
export type {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  AppointmentFilters,
} from './AppointmentRepository'

export type {
  CreateDoctorDTO,
  UpdateDoctorDTO,
  DoctorFilters,
} from './DoctorRepository'

export type {
  CreatePatientDTO,
  UpdatePatientDTO,
  PatientFilters,
  PatientMedicalHistoryData,
  PatientMedicalHistoryRow,
} from './PatientRepository'

export type {
  CreateUserDTO,
  UpdateUserDTO,
  UserFilters,
  UserStatistics,
} from './UserRepository'
