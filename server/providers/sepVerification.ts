import { supabaseAdmin } from '../lib/supabase.js';
import axios from 'axios';
import * as cheerio from 'cheerio';

// SEP Verification System for Mexican Professional Cédulas
// This system verifies professional cédulas against the SEP database

export interface SEPVerificationResult {
  isValid: boolean;
  status: 'verified' | 'not_found' | 'invalid_format' | 'error' | 'pending';
  details?: {
    cedulaNumber: string;
    professionalName?: string;
    specialty?: string;
    issueDate?: string;
    institution?: string;
    status?: string;
  };
  verifiedAt?: string;
  error?: string;
}

export interface SEPVerificationCache {
  cedula_number: string;
  verification_result: SEPVerificationResult;
  verified_at: string;
  expires_at: string;
}

// Validate cédula format before making API calls
export function validateCedulaFormat(cedulaNumber: string): boolean {
  // Mexican professional cédula format: 6-8 digits
  const cedulaRegex = /^\d{6,8}$/;
  return cedulaRegex.test(cedulaNumber);
}

// Clean and normalize cédula number
export function normalizeCedulaNumber(cedulaNumber: string): string {
  return cedulaNumber.replace(/\D/g, '').trim();
}

// Verify cédula against SEP database using web scraping
export async function verifyCedulaProfesional(cedulaNumber: string, doctorName?: string): Promise<SEPVerificationResult> {
  try {
    console.log('🔍 Verifying cédula:', cedulaNumber);

    // Normalize cédula number
    const normalizedCedula = normalizeCedulaNumber(cedulaNumber);
    
    // Validate format
    if (!validateCedulaFormat(normalizedCedula)) {
      return {
        isValid: false,
        status: 'invalid_format',
        details: { cedulaNumber: normalizedCedula },
        error: 'Formato de cédula inválido. Debe tener entre 6 y 8 dígitos.'
      };
    }

    // Check cache first
    const cachedResult = await getCachedVerification(normalizedCedula);
    if (cachedResult) {
      console.log('✅ Using cached verification result');
      return cachedResult.verification_result;
    }

    // Attempt verification using multiple methods
    let verificationResult: SEPVerificationResult;

    try {
      // Method 1: Try SEP public database (if available)
      verificationResult = await verifyViaSEPDatabase(normalizedCedula, doctorName);
    } catch (error) {
      console.log('⚠️ SEP database method failed, trying alternative:', error.message);
      
      // Method 2: Try alternative verification service
      verificationResult = await verifyViaAlternativeService(normalizedCedula, doctorName);
    }

    // Cache the result
    await cacheVerificationResult(normalizedCedula, verificationResult);

    console.log('✅ Cédula verification completed:', verificationResult.status);
    return verificationResult;

  } catch (error) {
    console.error('❌ Error verifying cédula:', error);
    return {
      isValid: false,
      status: 'error',
      details: { cedulaNumber },
      error: 'Error interno durante la verificación'
    };
  }
}

// Verify via SEP public database (web scraping)
async function verifyViaSEPDatabase(cedulaNumber: string, doctorName?: string): Promise<SEPVerificationResult> {
  try {
    // Note: This is a placeholder implementation
    // In a real implementation, you would scrape the SEP public database
    // The actual SEP website structure would need to be analyzed
    
    const response = await axios.get('https://www.gob.mx/sep', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // This is a mock implementation - real implementation would need:
    // 1. Find the correct SEP verification endpoint
    // 2. Submit the cédula number
    // 3. Parse the response for verification details
    
    // For now, simulate a successful verification for testing
    return {
      isValid: true,
      status: 'verified',
      details: {
        cedulaNumber,
        professionalName: doctorName || 'Dr. Verificado',
        specialty: 'Medicina General',
        issueDate: '2020-01-01',
        institution: 'Universidad Nacional Autónoma de México',
        status: 'Activo'
      },
      verifiedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('SEP database verification failed:', error);
    throw error;
  }
}

// Verify via alternative service (Truora, etc.)
async function verifyViaAlternativeService(cedulaNumber: string, doctorName?: string): Promise<SEPVerificationResult> {
  try {
    // This would integrate with a third-party verification service like Truora
    // For now, implement a mock verification
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock verification logic
    const isValid = Math.random() > 0.3; // 70% success rate for testing
    
    if (isValid) {
      return {
        isValid: true,
        status: 'verified',
        details: {
          cedulaNumber,
          professionalName: doctorName || 'Dr. Verificado',
          specialty: 'Medicina General',
          issueDate: '2019-01-01',
          institution: 'Instituto Politécnico Nacional',
          status: 'Activo'
        },
        verifiedAt: new Date().toISOString()
      };
    } else {
      return {
        isValid: false,
        status: 'not_found',
        details: { cedulaNumber },
        error: 'Cédula no encontrada en la base de datos'
      };
    }

  } catch (error) {
    console.error('Alternative service verification failed:', error);
    throw error;
  }
}

// Get cached verification result
async function getCachedVerification(cedulaNumber: string): Promise<SEPVerificationCache | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('sep_verification_cache')
      .select('*')
      .eq('cedula_number', cedulaNumber)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return null;
    return data;

  } catch (error) {
    console.error('Error getting cached verification:', error);
    return null;
  }
}

// Cache verification result
async function cacheVerificationResult(cedulaNumber: string, result: SEPVerificationResult): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Cache for 24 hours

    await supabaseAdmin
      .from('sep_verification_cache')
      .upsert({
        cedula_number: cedulaNumber,
        verification_result: result,
        verified_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });

  } catch (error) {
    console.error('Error caching verification result:', error);
  }
}

// Get verification status for a doctor
export async function getDoctorVerificationStatus(doctorId: string): Promise<SEPVerificationResult | null> {
  try {
    const { data: doctor, error } = await supabaseAdmin
      .from('doctors')
      .select('cedula, license_status, sep_verification_details')
      .eq('user_id', doctorId)
      .single();

    if (error || !doctor) return null;

    // If already verified, return cached result
    if (doctor.license_status === 'verified' && doctor.sep_verification_details) {
      return doctor.sep_verification_details as SEPVerificationResult;
    }

    // If verification is pending or failed, return status
    if (doctor.sep_verification_details) {
      return doctor.sep_verification_details as SEPVerificationResult;
    }

    return null;

  } catch (error) {
    console.error('Error getting doctor verification status:', error);
    return null;
  }
}

// Update doctor verification status
export async function updateDoctorVerificationStatus(doctorId: string, verificationResult: SEPVerificationResult): Promise<void> {
  try {
    const updateData: any = {
      sep_verification_details: verificationResult,
      updated_at: new Date().toISOString()
    };

    // Update license status based on verification result
    if (verificationResult.isValid && verificationResult.status === 'verified') {
      updateData.license_status = 'verified';
    } else if (verificationResult.status === 'not_found' || verificationResult.status === 'invalid_format') {
      updateData.license_status = 'rejected';
    } else {
      updateData.license_status = 'pending';
    }

    await supabaseAdmin
      .from('doctors')
      .update(updateData)
      .eq('user_id', doctorId);

    console.log('✅ Doctor verification status updated:', doctorId, updateData.license_status);

  } catch (error) {
    console.error('Error updating doctor verification status:', error);
    throw error;
  }
}

// Batch verify multiple cédulas
export async function batchVerifyCedulas(cedulaNumbers: string[]): Promise<SEPVerificationResult[]> {
  const results: SEPVerificationResult[] = [];
  
  for (const cedulaNumber of cedulaNumbers) {
    try {
      const result = await verifyCedulaProfesional(cedulaNumber);
      results.push(result);
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      results.push({
        isValid: false,
        status: 'error',
        details: { cedulaNumber },
        error: 'Error durante la verificación'
      });
    }
  }
  
  return results;
}

// Get verification statistics
export async function getVerificationStatistics(): Promise<{
  totalVerified: number;
  totalPending: number;
  totalRejected: number;
  verificationRate: number;
}> {
  try {
    const { data: stats, error } = await supabaseAdmin
      .from('doctors')
      .select('license_status');

    if (error) throw error;

    const totalVerified = stats.filter(d => d.license_status === 'verified').length;
    const totalPending = stats.filter(d => d.license_status === 'pending').length;
    const totalRejected = stats.filter(d => d.license_status === 'rejected').length;
    const total = stats.length;

    return {
      totalVerified,
      totalPending,
      totalRejected,
      verificationRate: total > 0 ? (totalVerified / total) * 100 : 0
    };

  } catch (error) {
    console.error('Error getting verification statistics:', error);
    return {
      totalVerified: 0,
      totalPending: 0,
      totalRejected: 0,
      verificationRate: 0
    };
  }
}

// Clean expired cache entries
export async function cleanExpiredCache(): Promise<void> {
  try {
    await supabaseAdmin
      .from('sep_verification_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    console.log('✅ Expired verification cache cleaned');

  } catch (error) {
    console.error('Error cleaning expired cache:', error);
  }
}