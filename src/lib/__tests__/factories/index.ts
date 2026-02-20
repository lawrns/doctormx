/**
 * Test Factories Index
 *
 * Exporta todas las factories de datos de prueba para uso consistente
 * en tests unitarios e integración.
 *
 * @example
 * ```typescript
 * import { UserFactory, AppointmentFactory } from '@/lib/__tests__/factories'
 *
 * const user = UserFactory.createPatient()
 * const appointment = AppointmentFactory.createConfirmed()
 * ```
 */

// User Factory
export { UserFactory } from './user.factory'
export type { UserFactoryType } from './user.factory'

// Appointment Factory
export { AppointmentFactory } from './appointment.factory'
export type { AppointmentFactoryType } from './appointment.factory'

// Prescription Factory
export { PrescriptionFactory } from './prescription.factory'
export type { PrescriptionFactoryType } from './prescription.factory'

// Conversation Factory
export { ConversationFactory } from './conversation.factory'
export type { ConversationFactoryType } from './conversation.factory'

// Message Factory
export { MessageFactory } from './message.factory'
export type { MessageFactoryType } from './message.factory'
