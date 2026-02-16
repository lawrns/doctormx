/**
 * Medical Specialties Catalog
 * Mexican medical specialties based on official classifications
 */

import { MedicalSpecialty } from '../types';

export const MEDICAL_SPECIALTIES: MedicalSpecialty[] = [
  {
    id: 'general',
    name: 'Medicina General',
    nameEn: 'General Medicine',
    description: 'Atención primaria de salud y diagnóstico inicial',
    commonKeywords: ['consulta', 'diagnóstico', 'prevención', 'tamizaje', 'signos vitales']
  },
  {
    id: 'cardiologia',
    name: 'Cardiología',
    nameEn: 'Cardiology',
    description: 'Enfermedades del corazón y sistema cardiovascular',
    commonKeywords: ['corazón', 'hipertensión', 'infarto', 'arritmia', 'insuficiencia cardiaca', 'ECG']
  },
  {
    id: 'endocrinologia',
    name: 'Endocrinología',
    description: 'Trastornos hormonales y metabólicos',
    commonKeywords: ['diabetes', 'tiroides', 'hormonas', 'metabolismo', 'obesidad', 'glucosa']
  },
  {
    id: 'neumologia',
    name: 'Neumología',
    nameEn: 'Pulmonology',
    description: 'Enfermedades del sistema respiratorio',
    commonKeywords: ['pulmón', 'asma', 'EPOC', 'neumonía', 'tos', 'disnea', 'espirometría']
  },
  {
    id: 'gastroenterologia',
    name: 'Gastroenterología',
    description: 'Enfermedades del sistema digestivo',
    commonKeywords: ['estómago', 'intestino', 'hígado', 'páncreas', 'reflujo', 'endoscopia']
  },
  {
    id: 'neurologia',
    name: 'Neurología',
    description: 'Enfermedades del sistema nervioso',
    commonKeywords: ['cerebro', 'migraña', 'epilepsia', 'derrame', 'Parkinson', 'cefalea']
  },
  {
    id: 'dermatologia',
    name: 'Dermatología',
    description: 'Enfermedades de la piel',
    commonKeywords: ['piel', 'acné', 'psoriasis', 'dermatitis', 'cáncer de piel', 'lesiones']
  },
  {
    id: 'infectologia',
    name: 'Infectología',
    description: 'Enfermedades infecciosas',
    commonKeywords: ['infección', 'VIH', 'tuberculosis', 'dengue', 'COVID', 'fiebre', 'antibióticos']
  },
  {
    id: 'psiquiatria',
    name: 'Psiquiatría',
    description: 'Salud mental y trastornos psiquiátricos',
    commonKeywords: ['depresión', 'ansiedad', 'insomnio', 'salud mental', 'terapia', 'antidepresivos']
  },
  {
    id: 'reumatologia',
    name: 'Reumatología',
    description: 'Enfermedades autoinmunes y reumáticas',
    commonKeywords: ['artritis', 'lupus', 'gota', 'articular', 'inflamación', 'autoinmune']
  },
  {
    id: 'nefrologia',
    name: 'Nefrología',
    description: 'Enfermedades del riñón',
    commonKeywords: ['riñón', 'dialisis', 'insuficiencia renal', 'proteinuria', 'creatinina']
  },
  {
    id: 'urologia',
    name: 'Urología',
    description: 'Enfermedades del sistema urinario y masculino',
    commonKeywords: ['próstata', 'vejiga', 'disfunción eréctil', 'cálculos', 'incontinencia']
  },
  {
    id: 'oftalmologia',
    name: 'Oftalmología',
    description: 'Enfermedades de los ojos',
    commonKeywords: ['ojo', 'visión', 'catarata', 'glaucoma', 'conjuntivitis', 'retina']
  },
  {
    id: 'otorrinolaringologia',
    name: 'Otorrinolaringología',
    description: 'Enfermedades de oído, nariz y garganta',
    commonKeywords: ['oído', 'nariz', 'garganta', 'rinitis', 'otitis', 'sinusitis', 'amígdalas']
  },
  {
    id: 'geriatria',
    name: 'Geriatría',
    description: 'Medicina del adulto mayor',
    commonKeywords: ['anciano', 'fragilidad', 'demencia', 'caídas', 'polifarmacia', 'Alzheimer']
  },
  {
    id: 'ginecologia',
    name: 'Ginecología y Obstetricia',
    nameEn: 'Obstetrics and Gynecology',
    description: 'Salud femenina y embarazo',
    commonKeywords: ['embarazo', 'preeclampsia', 'parto', 'ginecología', 'obstetricia', 'control prenatal']
  },
  {
    id: 'pediatria',
    name: 'Pediatría',
    description: 'Medicina infantil',
    commonKeywords: ['niño', 'lactante', 'desarrollo', 'vacunación', 'pediatría', 'crecimiento']
  },
  {
    id: 'medicina-urgencias',
    name: 'Medicina de Urgencias',
    nameEn: 'Emergency Medicine',
    description: 'Atención de emergencias médicas',
    commonKeywords: ['emergencia', 'trauma', 'RCP', 'shock', 'urgencias', 'ABCDE', 'reanimación']
  },
  {
    id: 'medicina-preventiva',
    name: 'Medicina Preventiva',
    description: 'Prevención de enfermedades y salud pública',
    commonKeywords: ['prevención', 'vacunación', 'promoción', 'salud pública', 'tamizaje']
  },
  {
    id: 'medicina-dolor',
    name: 'Medicina del Dolor',
    nameEn: 'Pain Medicine',
    description: 'Manejo del dolor crónico y agudo',
    commonKeywords: ['dolor', 'analgésicos', 'opioides', 'analgesia', 'morfina']
  },
  {
    id: 'traumatologia',
    name: 'Traumatología y Ortopedia',
    nameEn: 'Traumatology and Orthopedics',
    description: 'Lesiones musculoesqueléticas',
    commonKeywords: ['fractura', 'esguince', 'hueso', 'articulación', 'columna', 'lumbalgia']
  }
];

// Specialty lookup map for fast access
export const SPECIALTY_MAP: Record<string, MedicalSpecialty> = MEDICAL_SPECIALTIES.reduce(
  (acc, specialty) => {
    acc[specialty.id] = specialty;
    acc[specialty.name.toLowerCase()] = specialty;
    return acc;
  },
  {} as Record<string, MedicalSpecialty>
);

// Get specialty by ID or name
export function getSpecialty(identifier: string): MedicalSpecialty | undefined {
  const normalized = identifier.toLowerCase();
  return SPECIALTY_MAP[normalized] || 
    MEDICAL_SPECIALTIES.find(s => 
      s.name.toLowerCase().includes(normalized) ||
      s.nameEn?.toLowerCase().includes(normalized)
    );
}

// Get specialties by keyword
export function getSpecialtiesByKeyword(keyword: string): MedicalSpecialty[] {
  const normalizedKeyword = keyword.toLowerCase();
  return MEDICAL_SPECIALTIES.filter(specialty =>
    specialty.commonKeywords.some(k => k.toLowerCase().includes(normalizedKeyword)) ||
    specialty.name.toLowerCase().includes(normalizedKeyword) ||
    specialty.description?.toLowerCase().includes(normalizedKeyword)
  );
}
