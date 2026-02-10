/**
 * Test data factory for generating realistic test data
 */

export interface PatientData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface DoctorData {
  fullName: string;
  email: string;
  phone: string;
  specialty: string;
  license: string;
  experience: number;
  bio: string;
  consultationPrice: number;
  city: string;
  state: string;
  languages: string[];
}

export interface AppointmentData {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  type: 'video' | 'chat';
}

export interface MedicalHistoryData {
  allergies: string[];
  chronicConditions: string[];
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
  pastSurgeries: Array<{
    procedure: string;
    year: string;
  }>;
  familyHistory: Array<{
    condition: string;
    relationship: string;
  }>;
}

/**
 * Generate random patient data
 */
export function generatePatientData(overrides?: Partial<PatientData>): PatientData {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);

  return {
    fullName: `Paciente Test ${randomSuffix}`,
    email: `patient-${timestamp}@test.com`,
    phone: '5512345678',
    dateOfBirth: '1990-01-01',
    gender: 'other',
    address: {
      street: 'Av. Reforma 222',
      city: 'Ciudad de México',
      state: 'Ciudad de México',
      zipCode: '06600'
    },
    ...overrides
  };
}

/**
 * Generate random doctor data
 */
export function generateDoctorData(overrides?: Partial<DoctorData>): DoctorData {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);

  const specialties = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Pediatría',
    'Ginecología',
    'Medicina Interna',
    'Oftalmología',
    'Otorrinolaringología'
  ];

  const cities = [
    'Ciudad de México',
    'Guadalajara',
    'Monterrey',
    'Puebla',
    'Tijuana',
    'León',
    'Cancún'
  ];

  const states = [
    'Ciudad de México',
    'Jalisco',
    'Nuevo León',
    'Puebla',
    'Baja California',
    'Guanajuato',
    'Quintana Roo'
  ];

  return {
    fullName: `Dr. Juan Pérez ${randomSuffix}`,
    email: `doctor-${timestamp}@test.com`,
    phone: '5598765432',
    specialty: specialties[Math.floor(Math.random() * specialties.length)],
    license: `CED${timestamp}`,
    experience: Math.floor(Math.random() * 20) + 1,
    bio: 'Médico certificado con amplia experiencia en atención a pacientes.',
    consultationPrice: Math.floor(Math.random() * 500) + 300,
    city: cities[Math.floor(Math.random() * cities.length)],
    state: states[Math.floor(Math.random() * states.length)],
    languages: ['Español', 'Inglés'],
    ...overrides
  };
}

/**
 * Generate appointment data
 */
export function generateAppointmentData(overrides?: Partial<AppointmentData>): AppointmentData {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

  return {
    doctorId: '00000000-0000-0000-0000-000000000000',
    patientId: '00000000-0000-0000-0000-000000000000',
    date: tomorrow.toISOString().split('T')[0],
    time: times[Math.floor(Math.random() * times.length)],
    type: 'video',
    ...overrides
  };
}

/**
 * Generate medical history data
 */
export function generateMedicalHistoryData(overrides?: Partial<MedicalHistoryData>): MedicalHistoryData {
  return {
    allergies: ['Penicilina'],
    chronicConditions: ['Hipertensión'],
    currentMedications: [
      {
        name: 'Enalapril',
        dosage: '10 mg',
        frequency: 'Cada 24 horas'
      }
    ],
    pastSurgeries: [
      {
        procedure: 'Apendicectomía',
        year: '2010'
      }
    ],
    familyHistory: [
      {
        condition: 'Diabetes tipo 2',
        relationship: 'Padre'
      }
    ],
    ...overrides
  };
}

/**
 * Generate symptom descriptions for pre-consulta
 */
export const symptomDescriptions = [
  'Dolor de cabeza moderado en la parte frontal',
  'Dolor abdominal punzante en el lado derecho',
  'Tos persistente con flema verde',
  'Dolor de garganta al tragar',
  'Fiebre de 38.5°C desde hace 2 días',
  'Dolor en el pecho al respirar profundo',
  'Mareos y visión borrosa ocasional',
  'Erupción cutánea roja con picazón',
  'Dolor en las articulaciones por las mañanas',
  'Dificultad para dormir e insomnio'
];

/**
 * Generate realistic symptom description
 */
export function generateSymptomDescription(): string {
  return symptomDescriptions[Math.floor(Math.random() * symptomDescriptions.length)];
}

/**
 * Mexican cities for testing
 */
export const mexicanCities = [
  'Ciudad de México',
  'Guadalajara',
  'Monterrey',
  'Puebla',
  'Tijuana',
  'León',
  'Cancún',
  'San Luis Potosí',
  'Querétaro',
  'Mérida'
];

/**
 * Medical specialties for testing
 */
export const medicalSpecialties = [
  'Medicina General',
  'Cardiología',
  'Dermatología',
  'Pediatría',
  'Ginecología',
  'Medicina Interna',
  'Oftalmología',
  'Otorrinolaringología',
  'Neurología',
  'Ortopedia',
  'Psiquiatría',
  'Urología',
  'Nefrología',
  'Endocrinología',
  'Reumatología'
];

/**
 * Generate Mexican phone number
 */
export function generateMexicanPhoneNumber(): string {
  const areaCodes = ['55', '33', '81', '22', '66', '47', '99', '44', '22'];
  const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return `${areaCode}${number}`;
}

/**
 * Generate Mexican postal code
 */
export function generateMexicanPostalCode(): string {
  // Mexican postal codes are 5 digits
  return Math.floor(Math.random() * 90000 + 10000).toString();
}

/**
 * Generate test email
 */
export function generateTestEmail(prefix?: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${prefix || 'test'}-${timestamp}-${randomSuffix}@doctormx.test`;
}

/**
 * Generate appointment dates for testing
 */
export function generateAppointmentDates(daysAhead: number = 30): string[] {
  const dates: string[] = [];
  const now = new Date();

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * Generate time slots for a day
 */
export function generateTimeSlots(startHour: number = 9, endHour: number = 18): string[] {
  const slots: string[] = [];

  for (let hour = startHour; hour < endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return slots;
}

/**
 * Generate consultation notes
 */
export function generateConsultationNotes(): string {
  const templates = [
    'Paciente acude por dolor de cabeza de 3 días de evolución. Signos vitales normales. No fiebre. Sin antecedentes de migraña. Se recomienda reposo y analgésicos.',
    'Paciente con síntomas gripales de 5 días. Tos productiva, congestión nasal. No dificultad respiratoria. Examen físico normal.',
    'Consulta de control para hipertensión. Presión arterial 130/85. Adherente al tratamiento. Sin efectos adversos reportados.',
    'Paciente con dolor abdominal en cuadrante inferior derecho. Dolor a la palpación. Se solicita ultrasonido para descartar apendicitis.',
    'Evaluación por lesión dermatológica en antebrazo. Eritema leve, sin fiebre. Se prescribe crema tópica y seguimiento en una semana.'
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Generate prescription data
 */
export function generatePrescriptionData() {
  const medications = [
    { name: 'Paracetamol', dosage: '500 mg', frequency: 'Cada 8 horas', duration: '5 días' },
    { name: 'Ibuprofeno', dosage: '400 mg', frequency: 'Cada 6 horas', duration: '7 días' },
    { name: 'Amoxicilina', dosage: '500 mg', frequency: 'Cada 8 horas', duration: '7 días' },
    { name: 'Omeprazol', dosage: '20 mg', frequency: 'Cada 24 horas', duration: '14 días' },
    { name: 'Loratadina', dosage: '10 mg', frequency: 'Cada 24 horas', duration: '5 días' }
  ];

  return medications[Math.floor(Math.random() * medications.length)];
}

/**
 * Generate diagnosis text
 */
export function generateDiagnosis(): string {
  const diagnoses = [
    'Cefalea tensional leve',
    'Rinofaringitis viral aguda',
    'Hipertensión arterial esencial controlada',
    'Dolor abdominal de origen a determinar',
    'Dermatitis de contacto leve'
  ];

  return diagnoses[Math.floor(Math.random() * diagnoses.length)];
}

/**
 * Generate test users for different scenarios
 */
export const testUsers = {
  newPatient: () => generatePatientData(),
  existingPatient: () => ({
    ...generatePatientData(),
    email: 'patient@test.com'
  }),
  newDoctor: () => generateDoctorData(),
  existingDoctor: () => ({
    ...generateDoctorData(),
    email: 'doctor@test.com'
  }),
  admin: () => ({
    ...generatePatientData(),
    email: 'admin@test.com',
    fullName: 'Admin User'
  })
};
