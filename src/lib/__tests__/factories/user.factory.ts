/**
 * User Factory
 *
 * Factory para generar datos de prueba de usuarios consistentes y realistas.
 * Soporta perfiles de pacientes, doctores y administradores.
 *
 * @example
 * ```typescript
 * const patient = UserFactory.createPatient();
 * const doctor = UserFactory.createDoctor({ specialty: 'Cardiología' });
 * const users = UserFactory.createList(5);
 * ```
 */

import type { UserProfile, UserRole } from '@/types'

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
function generateTimestamp(daysAgo: number = 0): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

/**
 * Nombres reales mexicanos para generar datos realistas
 */
const FIRST_NAMES = [
  'María', 'José', 'Ana', 'Juan', 'Carmen', 'Luis', 'Laura', 'Carlos',
  'Patricia', 'Miguel', 'Gabriela', 'Alejandro', 'Fernanda', 'Diego',
  'Valentina', 'Jorge', 'Sofía', 'Ricardo', 'Daniela', 'Andrés',
  'Ximena', 'Fernando', 'Paola', 'Roberto', 'Natalia', 'Alberto',
  'Isabella', 'Pedro', 'Camila', 'Hugo', 'Lucía', 'Santiago',
  'Mariana', 'Eduardo', 'Victoria', 'Rafael', 'Antonella', 'Francisco',
  'Paula', 'Arturo', 'Renata', 'Manuel', 'Elena', 'Pablo',
  'Adriana', 'Javier', 'Alejandra', 'Sergio', 'Montserrat', 'Martín'
]

const LAST_NAMES = [
  'García', 'Martínez', 'López', 'Hernández', 'González', 'Pérez', 'Rodríguez',
  'Sánchez', 'Ramírez', 'Flores', 'Torres', 'Rivera', 'Gómez', 'Díaz',
  'Reyes', 'Morales', 'Ortiz', 'Cruz', 'Jiménez', 'Ruiz', 'Mendoza',
  'Aguilar', 'Álvarez', 'Castillo', 'Vásquez', 'Romero', 'Moreno',
  'Chávez', 'Domínguez', 'Ramos', 'Vargas', 'Méndez', 'Herrera',
  'Medina', 'Guerrero', 'Castro', 'Vargas', 'Contreras', 'Estrada',
  'Sandoval', 'Ibarra', 'Campos', 'Santos', 'Miranda', 'Cabrera',
  'Vega', 'Ríos', 'Fuentes', 'Marín', 'Silva'
]

const DOCTOR_SPECIALTIES = [
  'Medicina General',
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Neurología',
  'Oftalmología',
  'Oncología',
  'Ortopedia',
  'Pediatría',
  'Psiquiatría',
  'Traumatología',
  'Urología',
  'Nutrición'
]

/**
 * Genera un nombre completo aleatorio
 */
function generateFullName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]
  const lastName1 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  const lastName2 = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
  return `${firstName} ${lastName1} ${lastName2}`
}

/**
 * Genera un email válido basado en el nombre
 */
function generateEmail(fullName: string): string {
  const normalized = fullName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.mx', 'live.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${normalized}${Math.floor(Math.random() * 999)}@${domain}`
}

/**
 * Genera un número de teléfono mexicano válido
 */
function generatePhone(): string {
  const prefixes = ['55', '81', '33', '656', '614', '999', '444', '222']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(8, '0')
  return `+52${prefix}${suffix}`
}

/**
 * Genera una URL de foto de perfil
 */
function generatePhotoUrl(fullName: string): string {
  const encoded = encodeURIComponent(fullName)
  return `https://ui-avatars.com/api/?name=${encoded}&background=random&size=128`
}

/**
 * Factory para crear usuarios de prueba
 */
export const UserFactory = {
  /**
   * Crea un usuario base con valores por defecto
   */
  create(overrides: Partial<UserProfile> = {}): UserProfile {
    const fullName = overrides.full_name || generateFullName()
    const createdAt = overrides.created_at || generateTimestamp(Math.floor(Math.random() * 365))

    return {
      id: generateUUID(),
      role: 'patient',
      full_name: fullName,
      email: overrides.email ?? generateEmail(fullName),
      phone: overrides.phone ?? generatePhone(),
      photo_url: overrides.photo_url ?? generatePhotoUrl(fullName),
      date_of_birth: overrides.date_of_birth ?? null,
      gender: overrides.gender ?? null,
      created_at: createdAt,
      updated_at: generateTimestamp(0),
      ...overrides,
    }
  },

  /**
   * Crea un paciente con valores por defecto
   */
  createPatient(overrides: Partial<UserProfile> = {}): UserProfile {
    return this.create({
      role: 'patient',
      date_of_birth: generateTimestamp(Math.floor(Math.random() * 365 * 30 + 365 * 18)),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      ...overrides,
    })
  },

  /**
   * Crea un doctor con valores por defecto
   */
  createDoctor(overrides: Partial<UserProfile> = {}): UserProfile {
    const fullName = overrides.full_name || `Dr. ${generateFullName()}`
    return this.create({
      role: 'doctor',
      full_name: fullName,
      email: overrides.email ?? generateEmail(fullName),
      photo_url: overrides.photo_url ?? generatePhotoUrl(fullName),
      ...overrides,
    })
  },

  /**
   * Crea un administrador con valores por defecto
   */
  createAdmin(overrides: Partial<UserProfile> = {}): UserProfile {
    return this.create({
      role: 'admin',
      ...overrides,
    })
  },

  /**
   * Crea una lista de usuarios
   */
  createList(count: number, overrides: Partial<UserProfile> = {}): UserProfile[] {
    return Array.from({ length: count }, () => this.create(overrides))
  },
}

/**
 * Tipo de retorno de la factory para uso en tests
 */
export type UserFactoryType = typeof UserFactory
