import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/observability/logger'
import { 
  verifyCedulaSEP, 
  storeVerificationResult, 
  mapTitleToSpecialty 
} from '@/lib/sep-verification'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cedula, fullName } = body

    if (!cedula) {
      return NextResponse.json(
        { error: 'Cédula profesional es requerida' },
        { status: 400 }
      )
    }

    // Get doctor's name from profile if not provided
    let nameToVerify = fullName
    if (!nameToVerify) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      
      nameToVerify = profile?.full_name ?? ''
    }

    // Verify the cédula
    const verificationResult = await verifyCedulaSEP(cedula, nameToVerify)

    // Store the verification result
    await storeVerificationResult(user.id, cedula, verificationResult)

    // If verified, extract and return additional data for auto-fill
    let autoFillData = null
    if (verificationResult.verified && verificationResult.data) {
      const specialty = mapTitleToSpecialty(verificationResult.data.title ?? '')
      
      autoFillData = {
        fullName: verificationResult.data.name,
        firstName: verificationResult.data.firstName,
        lastName: verificationResult.data.lastName,
        title: verificationResult.data.title,
        specialty: specialty,
        institution: verificationResult.data.institution,
        graduationYear: verificationResult.data.graduationYear,
        yearsExperience: verificationResult.data.graduationYear 
          ? new Date().getFullYear() - verificationResult.data.graduationYear 
          : undefined,
      }
    }

    return NextResponse.json({
      success: true,
      verification: {
        verified: verificationResult.verified,
        confidence: verificationResult.confidence,
        message: verificationResult.message,
        status: verificationResult.data?.status,
      },
      autoFillData,
    })
  } catch (error) {
    logger.error('Cédula verification error:', { err: error })
    return NextResponse.json(
      { error: 'Error al verificar la cédula profesional' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get doctor's verification status
    const { data: verification } = await supabase
      .from('doctor_verifications')
      .select('*')
      .eq('doctor_id', user.id)
      .single()

    if (!verification) {
      return NextResponse.json({
        verified: false,
        message: 'No se ha verificado ninguna cédula',
      })
    }

    return NextResponse.json({
      verified: verification.sep_verified,
      cedula: verification.cedula,
      verifiedAt: verification.verified_at,
      data: verification.verification_data,
    })
  } catch (error) {
    logger.error('Get verification error:', { err: error })
    return NextResponse.json(
      { error: 'Error al obtener estado de verificación' },
      { status: 500 }
    )
  }
}
