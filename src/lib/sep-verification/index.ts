/**
 * SEP (Secretaría de Educación Pública) Cédula Verification System
 * For verifying Mexican medical professional credentials
 */

import { createClient } from '@/lib/supabase/server'

export interface CedulaSearchResult {
  found: boolean;
  cedula?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  secondLastName?: string;
  title?: string;
  institution?: string;
  graduationYear?: number;
  status?: 'valid' | 'revoked' | 'expired' | 'not_found';
  specialty?: string;
  issueDate?: string;
  verificationDate?: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number; // 0-100
  data: CedulaSearchResult;
  message: string;
  matchDetails?: {
    nameMatch: boolean;
    nameMatchScore: number;
  };
}

// Mock database of cédulas for demonstration
// In production, this would query the actual SEP/RVOE database
const MOCK_CEDULA_DATABASE: Record<string, CedulaSearchResult> = {
  '12345678': {
    found: true,
    cedula: '12345678',
    name: 'María García López',
    firstName: 'María',
    lastName: 'García',
    secondLastName: 'López',
    title: 'Médico Cirujano',
    institution: 'Universidad Nacional Autónoma de México',
    graduationYear: 2015,
    status: 'valid',
    specialty: 'Medicina General',
    issueDate: '2015-07-15',
  },
  '87654321': {
    found: true,
    cedula: '87654321',
    name: 'Carlos Hernández Martínez',
    firstName: 'Carlos',
    lastName: 'Hernández',
    secondLastName: 'Martínez',
    title: 'Médico Especialista en Cardiología',
    institution: 'Instituto Politécnico Nacional',
    graduationYear: 2012,
    status: 'valid',
    specialty: 'Cardiología',
    issueDate: '2012-08-20',
  },
  '11223344': {
    found: true,
    cedula: '11223344',
    name: 'Ana Rodríguez Sánchez',
    firstName: 'Ana',
    lastName: 'Rodríguez',
    secondLastName: 'Sánchez',
    title: 'Médico Especialista en Pediatría',
    institution: 'Universidad de Guadalajara',
    graduationYear: 2018,
    status: 'valid',
    specialty: 'Pediatría',
    issueDate: '2018-06-10',
  },
  '99887766': {
    found: true,
    cedula: '99887766',
    name: 'Roberto Pérez Gómez',
    firstName: 'Roberto',
    lastName: 'Pérez',
    secondLastName: 'Gómez',
    title: 'Médico Cirujano',
    institution: 'Universidad Autónoma de Nuevo León',
    graduationYear: 2010,
    status: 'revoked',
    specialty: 'Medicina General',
    issueDate: '2010-07-01',
  },
};

// Common Mexican medical specialties mapping
const SPECIALTY_MAPPING: Record<string, string> = {
  'Médico Cirujano': 'Medicina General',
  'Médico General': 'Medicina General',
  'Medicina Interna': 'Medicina Interna',
  'Cardiología': 'Cardiología',
  'Dermatología': 'Dermatología',
  'Pediatría': 'Pediatría',
  'Ginecología y Obstetricia': 'Ginecología',
  'Traumatología y Ortopedia': 'Traumatología',
  'Oftalmología': 'Oftalmología',
  'Psiquiatría': 'Psiquiatría',
  'Neurología': 'Neurología',
  'Urología': 'Urología',
  'Gastroenterología': 'Gastroenterología',
  'Endocrinología': 'Endocrinología',
  'Neumología': 'Neumología',
  'Oncología': 'Oncología',
  'Cirugía General': 'Cirugía General',
};

/**
 * Search for a cédula in the SEP database
 */
export async function searchCedula(cedula: string): Promise<CedulaSearchResult> {
  // Normalize cedula (remove spaces, dashes)
  const normalizedCedula = cedula.replace(/[\s-]/g, '');
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check mock database
  const result = MOCK_CEDULA_DATABASE[normalizedCedula];
  
  if (result) {
    return {
      ...result,
      verificationDate: new Date().toISOString(),
    };
  }
  
  // Generate realistic mock data for unknown cédulas
  // In production, this would return not_found
  if (normalizedCedula.length >= 7 && normalizedCedula.length <= 10) {
    // For demo purposes, generate plausible data
    return {
      found: true,
      cedula: normalizedCedula,
      name: 'Profesional Médico',
      firstName: 'Nombre',
      lastName: 'Apellido',
      secondLastName: 'Segundo',
      title: 'Médico Cirujano',
      institution: 'Universidad Verificada',
      graduationYear: 2015 + Math.floor(Math.random() * 5),
      status: 'valid',
      specialty: 'Medicina General',
      issueDate: '2015-01-01',
      verificationDate: new Date().toISOString(),
    };
  }
  
  return {
    found: false,
    cedula: normalizedCedula,
    status: 'not_found',
    verificationDate: new Date().toISOString(),
  };
}

/**
 * Calculate name similarity score using Levenshtein distance
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const s1 = name1.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const s2 = name2.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (s1 === s2) return 100;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 100;
  
  // Levenshtein distance
  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  
  const distance = costs[s2.length];
  const similarity = ((longer.length - distance) / longer.length) * 100;
  
  return Math.round(similarity);
}

/**
 * Verify a cédula with name matching
 */
export async function verifyCedulaSEP(
  cedula: string,
  providedName: string
): Promise<VerificationResult> {
  const searchResult = await searchCedula(cedula);
  
  if (!searchResult.found) {
    return {
      verified: false,
      confidence: 0,
      data: searchResult,
      message: 'Cédula profesional no encontrada en el registro de la SEP',
    };
  }
  
  if (searchResult.status === 'revoked') {
    return {
      verified: false,
      confidence: 0,
      data: searchResult,
      message: 'Esta cédula profesional ha sido revocada',
    };
  }
  
  if (searchResult.status === 'expired') {
    return {
      verified: false,
      confidence: 0,
      data: searchResult,
      message: 'Esta cédula profesional ha expirado',
    };
  }
  
  // Calculate name similarity
  const nameMatchScore = calculateNameSimilarity(
    providedName,
    searchResult.name || ''
  );
  
  const nameMatch = nameMatchScore >= 70; // 70% threshold
  
  // Calculate overall confidence
  let confidence = 0;
  if (searchResult.status === 'valid') {
    confidence = nameMatch ? Math.min(nameMatchScore + 10, 100) : Math.max(nameMatchScore - 20, 0);
  }
  
  const verified = confidence >= 70;
  
  let message: string;
  if (verified) {
    message = `Cédula verificada exitosamente. ${searchResult.title} de ${searchResult.institution}`;
  } else if (searchResult.status === 'valid' && !nameMatch) {
    message = `La cédula es válida pero el nombre no coincide con el registro (${nameMatchScore}% similitud)`;
  } else {
    message = 'No se pudo verificar la cédula profesional';
  }
  
  return {
    verified,
    confidence,
    data: searchResult,
    message,
    matchDetails: {
      nameMatch,
      nameMatchScore,
    },
  };
}

/**
 * Store verification result in database
 */
export async function storeVerificationResult(
  doctorId: string,
  cedula: string,
  result: VerificationResult
): Promise<void> {
  const supabase = await createClient();
  
  // Store in doctor_verifications table
  const { error } = await supabase
    .from('doctor_verifications')
    .upsert({
      doctor_id: doctorId,
      cedula: cedula,
      sep_verified: result.verified,
      verification_data: {
        ...result.data,
        confidence: result.confidence,
        matchDetails: result.matchDetails,
        message: result.message,
      },
      verified_at: result.verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'cedula'
    });
  
  if (error) {
    console.error('Error storing verification result:', error);
    throw error;
  }
  
  // Update doctor record with verification status
  if (result.verified) {
    await supabase
      .from('doctors')
      .update({
        license_number: cedula,
        updated_at: new Date().toISOString(),
      })
      .eq('id', doctorId);
  }
}

/**
 * Get doctor's verification status
 */
export async function getDoctorVerification(doctorId: string): Promise<VerificationResult | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('doctor_verifications')
    .select('*')
    .eq('doctor_id', doctorId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return {
    verified: data.sep_verified,
    confidence: data.verification_data?.confidence || 0,
    data: {
      found: true,
      cedula: data.cedula,
      ...data.verification_data,
    },
    message: data.verification_data?.message || '',
    matchDetails: data.verification_data?.matchDetails,
  };
}

/**
 * Map title to specialty
 */
export function mapTitleToSpecialty(title: string): string {
  for (const [key, value] of Object.entries(SPECIALTY_MAPPING)) {
    if (title.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 'Medicina General';
}
