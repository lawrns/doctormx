/**
 * Prescription Factory
 *
 * Factory para generar datos de prueba de recetas médicas consistentes y realistas.
 * Soporta recetas con múltiples medicamentos y diferentes estados.
 *
 * @example
 * ```typescript
 * const prescription = PrescriptionFactory.create();
 * const withMeds = PrescriptionFactory.createWithMedications(3);
 * const expired = PrescriptionFactory.createExpired();
 * ```
 */

import type { Prescription, PrescriptionMedication } from '@/types'

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
 * Medicamentos comunes disponibles en México
 */
const COMMON_MEDICATIONS: Omit<PrescriptionMedication, 'instructions'>[] = [
  { name: 'Paracetamol 500mg', dosage: '1 tableta', frequency: 'cada 8 horas', duration: '5 días', quantity: '15 tabletas' },
  { name: 'Ibuprofeno 400mg', dosage: '1 tableta', frequency: 'cada 8 horas', duration: '3 días', quantity: '9 tabletas' },
  { name: 'Amoxicilina 500mg', dosage: '1 cápsula', frequency: 'cada 8 horas', duration: '7 días', quantity: '21 cápsulas' },
  { name: 'Omeprazol 20mg', dosage: '1 cápsula', frequency: 'en ayunas', duration: '14 días', quantity: '14 cápsulas' },
  { name: 'Loratadina 10mg', dosage: '1 tableta', frequency: 'diaria', duration: '10 días', quantity: '10 tabletas' },
  { name: 'Metformina 850mg', dosage: '1 tableta', frequency: 'cada 12 horas', duration: '30 días', quantity: '60 tabletas' },
  { name: 'Losartán 50mg', dosage: '1 tableta', frequency: 'diaria', duration: '30 días', quantity: '30 tabletas' },
  { name: 'Atorvastatina 20mg', dosage: '1 tableta', frequency: 'en la noche', duration: '30 días', quantity: '30 tabletas' },
  { name: 'Salbutamol inhalador', dosage: '2 inhalaciones', frequency: 'cada 6 horas', duration: 'prn', quantity: '1 inhalador' },
  { name: 'Clonazepam 0.5mg', dosage: '1/2 tableta', frequency: 'en la noche', duration: '14 días', quantity: '7 tabletas' },
  { name: 'Diclofenaco 75mg', dosage: '1 tableta', frequency: 'cada 12 horas', duration: '5 días', quantity: '10 tabletas' },
  { name: 'Ranitidina 150mg', dosage: '1 tableta', frequency: 'cada 12 horas', duration: '7 días', quantity: '14 tabletas' },
  { name: 'Azitromicina 500mg', dosage: '2 tabletas', frequency: 'día 1, luego 1 diaria', duration: '5 días', quantity: '6 tabletas' },
  { name: 'Ambroxol 30mg', dosage: '1 tableta', frequency: 'cada 8 horas', duration: '7 días', quantity: '21 tabletas' },
  { name: 'Ketorolaco 10mg', dosage: '1 tableta', frequency: 'cada 8 horas', duration: '3 días', quantity: '9 tabletas' },
]

/**
 * Instrucciones adicionales comunes
 */
const COMMON_INSTRUCTIONS = [
  'Tomar con alimentos',
  'Tomar con abundante agua',
  'No tomar con alcohol',
  'No conducir después de tomar',
  'Tomar en ayunas',
  'Suspender si hay malestar estomacal',
  'No suspender antes de terminar el tratamiento',
  'Conservar en refrigeración',
  'Agitar antes de usar',
  'Aplicar en área afectada',
]

/**
 * Notas médicas para recetas
 */
const PRESCRIPTION_NOTES = [
  'Paciente con alergia a penicilina.',
  'Monitorear presión arterial.',
  'Revisar niveles de glucosa en 1 semana.',
  'Suspender si hay reacción adversa.',
  'No combinar con otros antiinflamatorios.',
  'Seguimiento en 2 semanas.',
  'Paciente embarazada - dosis ajustada.',
  'Evitar exposición solar durante tratamiento.',
]

/**
 * Genera un medicamento aleatorio con instrucciones
 */
function generateMedication(): PrescriptionMedication {
  const base = COMMON_MEDICATIONS[Math.floor(Math.random() * COMMON_MEDICATIONS.length)]
  const instructions = Math.random() > 0.5 
    ? COMMON_INSTRUCTIONS[Math.floor(Math.random() * COMMON_INSTRUCTIONS.length)]
    : undefined
  
  return {
    ...base,
    instructions,
  }
}

/**
 * Factory para crear recetas de prueba
 */
export const PrescriptionFactory = {
  /**
   * Crea una receta base con valores por defecto
   */
  create(overrides: Partial<Prescription> = {}): Prescription {
    const createdAt = overrides.created_at || generateTimestamp(Math.floor(Math.random() * 30))

    return {
      id: generateUUID(),
      appointment_id: generateUUID(),
      doctor_id: generateUUID(),
      patient_id: generateUUID(),
      medications: [generateMedication()],
      notes: null,
      pdf_url: null,
      created_at: createdAt,
      updated_at: generateTimestamp(0),
      ...overrides,
    }
  },

  /**
   * Crea una receta con múltiples medicamentos
   */
  createWithMedications(count: number, overrides: Partial<Prescription> = {}): Prescription {
    const medications = Array.from({ length: count }, () => generateMedication())
    return this.create({
      medications,
      ...overrides,
    })
  },

  /**
   * Crea una receta expirada (más de 30 días)
   */
  createExpired(overrides: Partial<Prescription> = {}): Prescription {
    return this.create({
      created_at: generateTimestamp(60),
      updated_at: generateTimestamp(60),
      ...overrides,
    })
  },

  /**
   * Crea una receta con PDF generado
   */
  createWithPdf(overrides: Partial<Prescription> = {}): Prescription {
    const id = generateUUID()
    return this.create({
      id,
      pdf_url: `https://storage.doctormx.com/prescriptions/${id}.pdf`,
      ...overrides,
    })
  },

  /**
   * Crea una receta con notas médicas
   */
  createWithNotes(overrides: Partial<Prescription> = {}): Prescription {
    return this.create({
      notes: PRESCRIPTION_NOTES[Math.floor(Math.random() * PRESCRIPTION_NOTES.length)],
      ...overrides,
    })
  },

  /**
   * Crea una receta completa (con múltiples medicamentos, PDF y notas)
   */
  createComplete(overrides: Partial<Prescription> = {}): Prescription {
    const id = generateUUID()
    return this.create({
      id,
      medications: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => generateMedication()),
      notes: PRESCRIPTION_NOTES[Math.floor(Math.random() * PRESCRIPTION_NOTES.length)],
      pdf_url: `https://storage.doctormx.com/prescriptions/${id}.pdf`,
      ...overrides,
    })
  },

  /**
   * Crea una lista de recetas
   */
  createList(count: number, overrides: Partial<Prescription> = {}): Prescription[] {
    return Array.from({ length: count }, () => this.create(overrides))
  },
}

/**
 * Tipo de retorno de la factory para uso en tests
 */
export type PrescriptionFactoryType = typeof PrescriptionFactory
