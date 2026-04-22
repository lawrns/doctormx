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

  return fetchFromSEP(normalizedCedula);
}

function getFirstString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return undefined
}

type SEPRecord = Record<string, unknown>

function getSepRows(data: unknown): SEPRecord[] {
  if (Array.isArray(data)) return data.filter((item): item is SEPRecord => Boolean(item) && typeof item === 'object')
  if (!data || typeof data !== 'object') return []

  const record = data as SEPRecord
  for (const key of ['items', 'results', 'resultados', 'cedulas']) {
    const value = record[key]
    if (Array.isArray(value)) {
      return value.filter((item): item is SEPRecord => Boolean(item) && typeof item === 'object')
    }
  }

  if (record.items && typeof record.items === 'object') {
    return Object.values(record.items).filter((item): item is SEPRecord => Boolean(item) && typeof item === 'object')
  }

  return [record]
}

function mapSEPResponse(data: unknown, cedula: string): CedulaSearchResult {
  const rows = getSepRows(data)
  const row = rows.find((item) => {
    const rowCedula = getFirstString(item.cedula) || getFirstString(item.idCedula) || getFirstString(item.numeroCedula)
    return rowCedula?.replace(/\D/g, '') === cedula
  }) || rows[0]

  if (!row) {
    return {
      found: false,
      cedula,
      status: 'not_found',
      verificationDate: new Date().toISOString(),
    }
  }

  const firstName =
    getFirstString(row.nombre) ||
    getFirstString(row.nombres) ||
    getFirstString(row.nombreProfesionista)
  const lastName =
    getFirstString(row.paterno) ||
    getFirstString(row.apellidoPaterno) ||
    getFirstString(row.primerApellido)
  const secondLastName =
    getFirstString(row.materno) ||
    getFirstString(row.apellidoMaterno) ||
    getFirstString(row.segundoApellido)
  const name =
    getFirstString(row.nombreCompleto) ||
    getFirstString(row.nombre_completo) ||
    [firstName, lastName, secondLastName].filter(Boolean).join(' ').trim()
  const title =
    getFirstString(row.titulo) ||
    getFirstString(row.profesion) ||
    getFirstString(row.carrera) ||
    getFirstString(row.nombreTitulo)
  const institution =
    getFirstString(row.institucion) ||
    getFirstString(row.universidad) ||
    getFirstString(row.escuela) ||
    getFirstString(row.nombreInstitucion)
  const issueDate =
    getFirstString(row.fechaExpedicion) ||
    getFirstString(row.fechaRegistro) ||
    getFirstString(row.fecha)
  const graduationYearValue =
    row.anio ||
    row.anioRegistro ||
    row.year ||
    (issueDate ? new Date(issueDate).getFullYear() : undefined)
  const graduationYear = Number.isFinite(Number(graduationYearValue))
    ? Number(graduationYearValue)
    : undefined

  return {
    found: Boolean(name || title || institution),
    cedula,
    name: name || undefined,
    firstName,
    lastName,
    secondLastName,
    title,
    institution,
    graduationYear,
    status: name || title || institution ? 'valid' : 'not_found',
    specialty: title ? mapTitleToSpecialty(title) : undefined,
    issueDate,
    verificationDate: new Date().toISOString(),
  }
}

async function fetchFromSEP(cedula: string): Promise<CedulaSearchResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 3000)

  try {
    const response = await fetch(
      `https://www.cedulaprofesional.sep.gob.mx/cedula/presidencia/indexAvanzada.action?json=true&cedula=${encodeURIComponent(cedula)}`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    )

    clearTimeout(timeout)

    if (!response.ok) throw new Error(`SEP API ${response.status}`)

    const data = await response.json()
    return mapSEPResponse(data, cedula)
  } catch (error) {
    clearTimeout(timeout)
    console.warn('SEP lookup failed; routing to manual review:', error)
    return {
      found: false,
      cedula,
      status: 'not_found',
      verificationDate: new Date().toISOString(),
    }
  }
}

/**
 * Calculate name similarity score using Levenshtein distance
 */
function calculateNameSimilarity(name1: string, name2: string): number {
  const s1 = name1.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const s2 = name2.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (s1 === s2) return 100;
  
  const longer = s1.length > s2.length ? s1 : s2;
  
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
  
  await supabase
    .from('doctors')
    .update({
      license_number: cedula,
      status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', doctorId);
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
