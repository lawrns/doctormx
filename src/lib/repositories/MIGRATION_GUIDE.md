# Repository Pattern Migration Guide

This guide explains how to migrate from inline Supabase queries to using the new Repository classes.

## Overview

The Repository Pattern provides a clean abstraction layer between your application code and the database. Benefits include:

- **Type Safety**: Full TypeScript support for all queries
- **Testability**: Easy to mock for unit tests
- **Maintainability**: Centralized database logic
- **Consistency**: Standardized error handling and patterns
- **Reusability**: No duplicate query logic

## Repository Classes

### Available Repositories

1. **AppointmentRepository** - Manage appointments
2. **DoctorRepository** - Manage doctors and their specialties
3. **PatientRepository** - Manage patients and medical history
4. **UserRepository** - Manage user profiles (patients, doctors, admins)

### Singleton Instances

Each repository provides a singleton instance for common usage:

```typescript
import { 
  appointmentRepository, 
  doctorRepository,
  patientRepository,
  userRepository 
} from '@/lib/repositories'

// Use singleton instances
const appointment = await appointmentRepository.findById('uuid')
```

### Custom Instances

Create custom instances for special requirements (e.g., service role):

```typescript
import { AppointmentRepository } from '@/lib/repositories'

// Use service role for admin operations
const adminRepo = new AppointmentRepository({ useServiceRole: true })
```

## Migration Examples

### Before: Inline Supabase Query

```typescript
// src/lib/appointments.ts (OLD)
import { createClient } from '@/lib/supabase/server'

export async function getPatientAppointments(patientId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      doctor:doctores (*)
    `)
    .eq('patient_id', patientId)
    .order('start_ts', { ascending: false })
  
  if (error) throw error
  return data || []
}
```

### After: Using Repository

```typescript
// NEW - Using singleton
import { appointmentRepository } from '@/lib/repositories'

export async function getPatientAppointments(patientId: string) {
  return appointmentRepository.findByPatientWithDoctors(patientId, {
    orderDirection: 'desc'
  })
}
```

## Common Migrations

### Appointment Queries

| Old Pattern | New Repository Method |
|-------------|----------------------|
| `supabase.from('appointments').select('*').eq('id', id).single()` | `appointmentRepository.findById(id)` |
| `supabase.from('appointments').select('*').eq('doctor_id', doctorId)` | `appointmentRepository.findByDoctor(doctorId)` |
| `supabase.from('appointments').select('*').eq('patient_id', patientId)` | `appointmentRepository.findByPatient(patientId)` |
| `supabase.from('appointments').insert(data)` | `appointmentRepository.create(data)` |
| `supabase.from('appointments').update(data).eq('id', id)` | `appointmentRepository.update(id, data)` |
| `supabase.from('appointments').delete().eq('id', id)` | `appointmentRepository.delete(id)` |

### Doctor Queries

| Old Pattern | New Repository Method |
|-------------|----------------------|
| `supabase.from('doctores').select('*').eq('id', id).single()` | `doctorRepository.findById(id)` |
| `supabase.from('doctores').select('*').eq('status', 'approved')` | `doctorRepository.findApproved()` |
| `supabase.from('doctores').select('*').eq('status', 'pending')` | `doctorRepository.findPending()` |
| `supabase.from('doctores').insert(data)` | `doctorRepository.create(data)` |
| `supabase.from('doctores').update({ status: 'approved' }).eq('id', id)` | `doctorRepository.approve(id)` |

### Patient Queries

| Old Pattern | New Repository Method |
|-------------|----------------------|
| `supabase.from('profiles').select('*').eq('id', id).eq('role', 'patient').single()` | `patientRepository.findById(id)` |
| `supabase.from('profiles').select('*').eq('role', 'patient')` | `patientRepository.findAll()` |
| `supabase.from('patient_medical_history').select('*').eq('patient_id', id).single()` | `patientRepository.getMedicalHistory(id)` |

### User Queries

| Old Pattern | New Repository Method |
|-------------|----------------------|
| `supabase.from('profiles').select('*').eq('id', id).single()` | `userRepository.findById(id)` |
| `supabase.from('profiles').select('*').eq('role', 'doctor')` | `userRepository.findByRole('doctor')` |
| `supabase.from('profiles').select('*').or('full_name.ilike.query,phone.ilike.query')` | `userRepository.search(query)` |

## Backward Compatibility

The existing helper functions in `appointments.ts`, `doctors.ts`, `patient.ts`, and `auth.ts` remain functional. You can migrate gradually:

1. **Phase 1**: Keep existing code, start using repositories in new code
2. **Phase 2**: Migrate existing functions to use repositories internally
3. **Phase 3**: Deprecate old helper functions

### Wrapper Pattern

Update existing helpers to use repositories while maintaining the same API:

```typescript
// src/lib/appointments.ts
import { appointmentRepository } from '@/lib/repositories'

// OLD API - now uses repository internally
export async function getPatientAppointments(patientId: string) {
  return appointmentRepository.findByPatientWithDoctors(patientId)
}

// Add deprecation notice for future migration
/**
 * @deprecated Use appointmentRepository.findByPatientWithDoctors() instead
 */
export async function getPatientAppointments(patientId: string) {
  return appointmentRepository.findByPatientWithDoctors(patientId)
}
```

## Error Handling

Repositories throw descriptive errors that you can catch:

```typescript
try {
  const appointment = await appointmentRepository.findById('invalid-id')
} catch (error) {
  if (error instanceof Error) {
    // Handle specific error
    console.error(error.message)
  }
}
```

## Testing with Repositories

Repositories are designed to be easily mockable:

```typescript
import { vi, describe, it, expect } from 'vitest'
import { appointmentRepository } from '@/lib/repositories'

vi.mock('@/lib/repositories', () => ({
  appointmentRepository: {
    findById: vi.fn(),
    create: vi.fn(),
  }
}))

describe('MyService', () => {
  it('should use repository', async () => {
    vi.mocked(appointmentRepository.findById).mockResolvedValue({
      id: 'test-id',
      status: 'confirmed'
    })
    
    // Your test code
  })
})
```

## DTO Reference

### CreateAppointmentDTO
```typescript
{
  patientId: string
  doctorId: string
  startTs: string
  endTs: string
  reasonForVisit?: string
  notes?: string
  appointmentType?: 'in_person' | 'video'
}
```

### CreateDoctorDTO
```typescript
{
  id: string
  bio?: string
  languages?: string[]
  licenseNumber?: string
  yearsExperience?: number
  city?: string
  state?: string
  country?: string
  priceCents?: number
  currency?: string
  videoEnabled?: boolean
  acceptsInsurance?: boolean
}
```

### CreatePatientDTO
```typescript
{
  id: string
  fullName: string
  phone?: string
  photoUrl?: string
}
```

### CreateUserDTO
```typescript
{
  id: string
  role: 'patient' | 'doctor' | 'admin'
  fullName: string
  phone?: string
  photoUrl?: string
}
```

## Advanced Usage

### Using Filters

All `findAll` and `findBy*` methods support filters:

```typescript
const appointments = await appointmentRepository.findByDoctor(doctorId, {
  status: 'confirmed',
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  limit: 10,
  offset: 0,
  orderBy: 'start_ts',
  orderDirection: 'desc'
})
```

### Using Service Role

For admin operations or background jobs:

```typescript
const adminRepo = new AppointmentRepository({ useServiceRole: true })
const allAppointments = await adminRepo.findAll()
```

## Migration Checklist

- [ ] Identify all Supabase queries in your feature
- [ ] Find equivalent repository methods
- [ ] Update imports to use repositories
- [ ] Replace queries with repository calls
- [ ] Update tests to mock repositories
- [ ] Verify error handling
- [ ] Run full test suite

## Support

For questions or issues with the repository pattern, refer to:

1. The repository test files for usage examples
2. TypeScript types for DTO definitions
3. Existing migrated code in the codebase
