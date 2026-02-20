/**
 * Test Data Factories for E2E Tests
 * 
 * Provides consistent, reusable test data for all E2E tests
 */

// Generate unique test IDs to avoid conflicts
const generateTestId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Simple data generators
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const generatePhone = () => `55${randomInt(10000000, 99999999)}`;
const generateName = () => {
  const firstNames = ['José', 'María', 'Juan', 'Ana', 'Luis', 'Carmen', 'Carlos', 'Laura', 'Miguel', 'Sofía', 'Antonio', 'Isabel'];
  const lastNames = ['García', 'López', 'Martínez', 'Hernández', 'González', 'Pérez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Torres'];
  return `${randomElement(firstNames)} ${randomElement(lastNames)}`;
};
const generateDate = (daysFromNow: number = 30) => {
  const date = new Date();
  date.setDate(date.getDate() + randomInt(1, daysFromNow));
  return date.toISOString().split('T')[0];
};

/**
 * Patient Test Data Factory
 */
export const patientFactory = {
  create: (overrides = {}) => ({
    email: `patient-${generateTestId()}@test.com`,
    password: 'TestPassword123!',
    fullName: generateName(),
    phone: generatePhone(),
    dateOfBirth: generateDate(365 * 30), // Approx 30 years ago
    ...overrides
  }),

  // Pre-defined test patients for consistent testing
  standard: {
    email: 'patient@test.com',
    password: 'TestPassword123!',
    fullName: 'Test Patient',
    phone: '5512345678'
  },

  premium: {
    email: 'premium-patient@test.com',
    password: 'TestPassword123!',
    fullName: 'Premium Patient',
    phone: '5587654321'
  }
};

/**
 * Doctor Test Data Factory
 */
export const doctorFactory = {
  create: (overrides = {}) => ({
    email: `doctor-${generateTestId()}@test.com`,
    password: 'TestPassword123!',
    fullName: `Dr. ${generateName()}`,
    specialty: randomElement([
      'Medicina General',
      'Cardiología',
      'Dermatología',
      'Pediatría',
      'Ginecología',
      'Neurología',
      'Psiquiatría',
      'Nutrición'
    ]),
    licenseNumber: `Cédula-${randomInt(100000, 999999)}`,
    phone: generatePhone(),
    consultationFee: randomInt(300, 1500),
    ...overrides
  }),

  standard: {
    email: 'doctor@test.com',
    password: 'TestPassword123!',
    fullName: 'Dr. Test Doctor',
    specialty: 'Medicina General',
    licenseNumber: 'Cédula-123456',
    phone: '5598765432',
    consultationFee: 500
  }
};

/**
 * Appointment Test Data Factory
 */
export const appointmentFactory = {
  create: (overrides = {}) => ({
    id: generateTestId(),
    doctorId: generateTestId(),
    patientId: generateTestId(),
    date: generateDate(30),
    time: randomElement(['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']),
    type: randomElement(['video', 'in-person']),
    reason: randomElement([
      'Consulta general',
      'Dolor de cabeza',
      'Chequeo rutinario',
      'Receta médica',
      'Seguimiento'
    ]),
    symptoms: 'Síntomas de prueba para la consulta',
    ...overrides
  }),

  // Test UUIDs for consistent API mocking
  testIds: {
    valid: '00000000-0000-0000-0000-000000000000',
    invalid: '11111111-1111-1111-1111-111111111111',
    expired: '22222222-2222-2222-2222-222222222222'
  }
};

/**
 * Payment Test Data Factory
 */
export const paymentFactory = {
  stripe: {
    // Stripe test card numbers
    cards: {
      visa: {
        number: '4242424242424242',
        expMonth: '12',
        expYear: '2030',
        cvc: '123',
        zip: '12345'
      },
      visaDebit: {
        number: '4000056655665556',
        expMonth: '12',
        expYear: '2030',
        cvc: '123',
        zip: '12345'
      },
      mastercard: {
        number: '5555555555554444',
        expMonth: '12',
        expYear: '2030',
        cvc: '123',
        zip: '12345'
      },
      // Cards that trigger specific Stripe responses
      decline: {
        number: '4000000000000002',
        expMonth: '12',
        expYear: '2030',
        cvc: '123',
        zip: '12345'
      },
      insufficientFunds: {
        number: '4000000000009995',
        expMonth: '12',
        expYear: '2030',
        cvc: '123',
        zip: '12345'
      },
      expired: {
        number: '4000000000000069',
        expMonth: '12',
        expYear: '2020',
        cvc: '123',
        zip: '12345'
      }
    }
  },

  oxxo: {
    // OXXO payment test data
    valid: true,
    amount: randomInt(300, 2000)
  },

  create: (overrides = {}) => ({
    amount: randomInt(300, 2000),
    currency: 'MXN',
    description: 'Pago por consulta médica',
    ...overrides
  })
};

/**
 * Emergency Test Data Factory
 */
export const emergencyFactory = {
  scenarios: {
    chestPain: {
      symptoms: 'Dolor intenso en el pecho, dificultad para respirar, sudoración',
      severity: 'high',
      expectedResponse: 'immediate'
    },
    severeBleeding: {
      symptoms: 'Sangrado abundante que no cesa, mareos, piel pálida',
      severity: 'high',
      expectedResponse: 'immediate'
    },
    stroke: {
      symptoms: 'Debilidad repentina en un lado del cuerpo, confusión, dificultad para hablar',
      severity: 'high',
      expectedResponse: 'immediate'
    },
    moderateSymptoms: {
      symptoms: 'Dolor de cabeza leve, fiebre baja, malestar general',
      severity: 'low',
      expectedResponse: 'scheduled'
    }
  },

  create: (overrides = {}) => ({
    symptoms: 'Síntomas de emergencia de prueba',
    location: 'Ciudad de México',
    contactPhone: generatePhone(),
    ...overrides
  })
};

/**
 * Address Test Data Factory
 */
export const addressFactory = {
  create: (overrides = {}) => ({
    street: `Calle ${randomInt(1, 200)} #${randomInt(1, 100)}`,
    city: randomElement(['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro']),
    state: randomElement([
      'Ciudad de México',
      'Jalisco',
      'Nuevo León',
      'Puebla',
      'Querétaro',
      'Estado de México'
    ]),
    zipCode: `${randomInt(10000, 99999)}`,
    ...overrides
  }),

  sample: {
    street: 'Av. Reforma 222',
    city: 'Ciudad de México',
    state: 'Ciudad de México',
    zipCode: '06600'
  }
};

/**
 * Consultation Test Data Factory
 */
export const consultationFactory = {
  create: (overrides = {}) => ({
    id: generateTestId(),
    appointmentId: generateTestId(),
    status: randomElement(['scheduled', 'in-progress', 'completed', 'cancelled']),
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * 60000).toISOString(),
    notes: 'Notas de la consulta médica',
    prescription: {
      medications: [
        {
          name: 'Medicamento de prueba',
          dosage: '1 tableta cada 8 horas',
          duration: '7 días'
        }
      ]
    },
    ...overrides
  }),

  // Test video room URLs
  videoRooms: {
    valid: 'https://meet.daily.co/test-room-123',
    invalid: 'https://invalid-room.test',
    expired: 'https://expired-room.test'
  }
};

/**
 * Review Test Data Factory
 */
export const reviewFactory = {
  create: (overrides = {}) => ({
    rating: randomInt(1, 5),
    comment: 'Comentario de prueba para la consulta',
    wouldRecommend: Math.random() > 0.5,
    ...overrides
  }),

  positive: {
    rating: 5,
    comment: 'Excelente atención, muy profesional y amable. Resolvió todas mis dudas.',
    wouldRecommend: true
  },

  negative: {
    rating: 2,
    comment: 'La consulta fue rápida, sentí que no me escuchó bien.',
    wouldRecommend: false
  }
};

/**
 * API Response Fixtures
 */
export const apiResponses = {
  success: {
    status: 200,
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} })
  },
  
  error: {
    status: 400,
    ok: false,
    json: () => Promise.resolve({ success: false, error: 'Bad Request' })
  },

  unauthorized: {
    status: 401,
    ok: false,
    json: () => Promise.resolve({ success: false, error: 'Unauthorized' })
  },

  notFound: {
    status: 404,
    ok: false,
    json: () => Promise.resolve({ success: false, error: 'Not Found' })
  },

  serverError: {
    status: 500,
    ok: false,
    json: () => Promise.resolve({ success: false, error: 'Internal Server Error' })
  }
};

/**
 * Time slots for booking tests
 */
export const timeSlots = {
  morning: ['09:00', '10:00', '11:00', '12:00'],
  afternoon: ['14:00', '15:00', '16:00', '17:00', '18:00'],
  evening: ['19:00', '20:00', '21:00'],
  
  getAll: () => [...timeSlots.morning, ...timeSlots.afternoon, ...timeSlots.evening],
  
  getRandom: () => randomElement(timeSlots.getAll())
};

/**
 * Mexican phone number generator
 */
export const phoneNumberFactory = {
  mobile: () => {
    const prefixes = ['55', '81', '33', '442', '222', '999', '614'];
    const prefix = randomElement(prefixes);
    const number = randomInt(10000000, 99999999).toString();
    return `${prefix}${number}`;
  },
  
  landline: () => {
    const prefixes = ['55', '81', '33'];
    const prefix = randomElement(prefixes);
    const number = randomInt(10000000, 99999999).toString();
    return `${prefix}${number}`;
  }
};
