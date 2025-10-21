import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Verifies a professional cédula with SEP's database
 * @param cedula - The professional cédula number
 * @param name - The doctor's full name for verification
 * @returns Promise<SEPVerificationResult>
 */
async function verifyCedulaSEP(cedula, name) {
  try {
    console.log(`🔍 Verifying cédula ${cedula} for ${name}...`);

    // Clean and validate cédula format
    const cleanCedula = cedula.replace(/\D/g, '');
    if (cleanCedula.length < 6 || cleanCedula.length > 10) {
      return {
        valid: false,
        error: 'Formato de cédula inválido. Debe tener entre 6 y 10 dígitos.'
      };
    }

    // Clean and normalize name for comparison
    const normalizedName = normalizeName(name);

    // Simulate SEP API call (replace with actual implementation)
    const verificationResult = await simulateSEPVerification(cleanCedula, normalizedName);

    if (verificationResult.valid) {
      console.log(`✅ Cédula ${cedula} verified successfully`);
      
      // Store verification result in database
      await storeVerificationResult(cedula, verificationResult.data);
      
      return verificationResult;
    } else {
      console.log(`❌ Cédula ${cedula} verification failed: ${verificationResult.error}`);
      return verificationResult;
    }

  } catch (error) {
    console.error('Error verifying cédula:', error);
    return {
      valid: false,
      error: 'Error interno del servidor durante la verificación'
    };
  }
}

/**
 * Simulates SEP verification (replace with actual API implementation)
 * In production, this would make actual HTTP requests to SEP's API
 */
async function simulateSEPVerification(cedula, name) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock verification logic (replace with actual SEP API)
  const mockDatabase = [
    {
      cedula: '12345678',
      name: 'Juan Carlos Pérez López',
      specialty: 'Medicina General',
      institution: 'Universidad Nacional Autónoma de México',
      graduationYear: 2015,
      status: 'active'
    },
    {
      cedula: '87654321',
      name: 'María Elena García Rodríguez',
      specialty: 'Pediatría',
      institution: 'Instituto Politécnico Nacional',
      graduationYear: 2018,
      status: 'active'
    },
    {
      cedula: '11223344',
      name: 'Carlos Alberto Martínez Silva',
      specialty: 'Cardiología',
      institution: 'Universidad Autónoma de Guadalajara',
      graduationYear: 2012,
      status: 'expired'
    }
  ];

  const foundRecord = mockDatabase.find(record => 
    record.cedula === cedula && 
    nameMatch(record.name, name)
  );

  if (!foundRecord) {
    return {
      valid: false,
      error: 'Cédula no encontrada en la base de datos de la SEP'
    };
  }

  if (foundRecord.status !== 'active') {
    return {
      valid: false,
      error: `Cédula ${foundRecord.status === 'expired' ? 'expirada' : 'suspendida'}`
    };
  }

  return {
    valid: true,
    data: {
      cedula: foundRecord.cedula,
      name: foundRecord.name,
      specialty: foundRecord.specialty,
      institution: foundRecord.institution,
      graduationYear: foundRecord.graduationYear,
      status: foundRecord.status,
      verifiedAt: new Date().toISOString()
    }
  };
}

/**
 * Normalizes a name for comparison
 */
function normalizeName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n');
}

/**
 * Checks if two names match (fuzzy matching)
 */
function nameMatch(recordName, inputName) {
  const normalizedRecord = normalizeName(recordName);
  const normalizedInput = normalizeName(inputName);

  // Extract first and last names
  const recordParts = normalizedRecord.split(' ');
  const inputParts = normalizedInput.split(' ');

  // Check if at least first and last name match
  const recordFirst = recordParts[0];
  const recordLast = recordParts[recordParts.length - 1];
  const inputFirst = inputParts[0];
  const inputLast = inputParts[inputParts.length - 1];

  return recordFirst === inputFirst && recordLast === inputLast;
}

/**
 * Stores verification result in database
 */
async function storeVerificationResult(cedula, data) {
  try {
    const { error } = await supabase
      .from('doctor_verifications')
      .upsert({
        cedula: cedula,
        sep_verified: true,
        verification_data: data,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'cedula'
      });

    if (error) {
      console.error('Error storing verification result:', error);
    }
  } catch (error) {
    console.error('Error storing verification result:', error);
  }
}

/**
 * Updates doctor record with verification status
 */
async function updateDoctorVerificationStatus(doctorId, verified, verificationData) {
  try {
    const updateData = {
      sep_verified: verified,
      license_status: verified ? 'verified' : 'rejected',
      verification_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (verificationData) {
      updateData.verification_data = verificationData;
    }

    const { error } = await supabase
      .from('doctors')
      .update(updateData)
      .eq('user_id', doctorId);

    if (error) {
      console.error('Error updating doctor verification status:', error);
      throw error;
    }

    console.log(`✅ Doctor ${doctorId} verification status updated: ${verified ? 'verified' : 'rejected'}`);
    return true;
  } catch (error) {
    console.error('Error updating doctor verification status:', error);
    throw error;
  }
}

export async function handler(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  try {
    const { doctorId } = JSON.parse(event.body);
    
    if (!doctorId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required field: doctorId' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    console.log('🔍 Starting verification for doctor:', doctorId);
    
    // Get doctor data
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .select('cedula, users!inner(name)')
      .eq('user_id', doctorId)
      .single();

    if (doctorError || !doctor) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Doctor no encontrado' }),
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
    }

    const doctorName = doctor.users?.name || '';
    
    // Verify cédula using SEP provider
    const verificationResult = await verifyCedulaSEP(doctor.cedula, doctorName);
    
    // Update doctor verification status
    await updateDoctorVerificationStatus(doctorId, verificationResult.valid, verificationResult.data);
    
    console.log('✅ Doctor verification completed:', verificationResult.valid ? 'verified' : 'rejected');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        verified: verificationResult.valid,
        data: verificationResult.data,
        error: verificationResult.error,
        message: verificationResult.valid 
          ? 'Verificación exitosa' 
          : verificationResult.error || 'Verificación fallida'
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };

  } catch (error) {
    console.error('❌ Error verifying doctor:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
}
