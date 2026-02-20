import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/auth'
import { analyzeMedicalImage, saveAnalysis, ImageType } from '@/lib/ai/vision'
import { validateFile, createValidationErrorResponse } from '@/lib/file-security'
import { withRateLimit } from '@/lib/rate-limit/middleware'
import { logger } from '@/lib/observability/logger'

export async function POST(req: NextRequest) {
  return withRateLimit(req, async (request) => {
    const startTime = Date.now()

    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json(
          { error: 'No autenticado' },
          { status: 401 }
        )
      }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const imageType = formData.get('imageType') as string | null
    const patientNotes = formData.get('patientNotes') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó imagen' },
        { status: 400 }
      )
    }

    if (!imageType) {
      return NextResponse.json(
        { error: 'Tipo de imagen requerido' },
        { status: 400 }
      )
    }

    const validTypes: ImageType[] = ['skin', 'xray', 'lab_result', 'wound', 'eye', 'other']
    if (!validTypes.includes(imageType as ImageType)) {
      return NextResponse.json(
        { error: 'Tipo de imagen inválido' },
        { status: 400 }
      )
    }

    // Get user profile to check role
    const profile = await getProfile(user.id)
    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 400 }
      )
    }

    let limit = 0
    let currentUsage = 0
    let tier = 'starter'

    // Patient flow: 3 free analyses per month
    if (profile.role === 'patient') {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: patientAnalyses } = await supabase
        .from('medical_image_analyses')
        .select('id')
        .eq('patient_id', user.id)
        .gte('created_at', monthStart)

      currentUsage = patientAnalyses?.length ?? 0
      limit = 3
      tier = 'patient'

      if (currentUsage >= limit) {
        return NextResponse.json(
          {
            error: 'Has alcanzado tu límite de 3 análisis gratis este mes',
            requiresUpgrade: true,
            upgradeTo: 'premium',
            currentTier: tier,
            currentUsage,
            limit,
            message: 'Has usado tus 3 análisis gratuitos este mes. Actualiza a Premium para continuar.'
          },
          { status: 403 }
        )
      }
    } else if (profile.role === 'doctor') {
      // Doctor flow: check subscription
      const { data: subscription } = await supabase
        .from('doctor_subscriptions')
        .select('plan_id, status, current_period_start, current_period_end')
        .eq('doctor_id', user.id)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        return NextResponse.json(
          {
            error: 'Esta funcionalidad requiere un plan Pro o Elite',
            requiresUpgrade: true,
            upgradeTo: 'pro',
            currentTier: 'none',
            message: 'Upgrade a Pro para acceder al análisis de imágenes con IA'
          },
          { status: 403 }
        )
      }

      tier = subscription.plan_id ?? 'starter'

      const tierLimits: Record<string, number> = {
        none: 0,
        starter: 0,
        pro: 5,
        elite: 10,
      }

      limit = tierLimits[tier] ?? 0

      if (tier !== 'pro' && tier !== 'elite') {
        return NextResponse.json(
          {
            error: 'Esta funcionalidad requiere un plan Pro o Elite',
            requiresUpgrade: true,
            upgradeTo: 'pro',
            currentTier: tier,
            message: 'Upgrade a Pro para acceder al análisis de imágenes con IA'
          },
          { status: 403 }
        )
      }

      const { data: usageRecord } = await supabase
        .from('premium_feature_usage')
        .select('id, usage_count')
        .eq('doctor_id', user.id)
        .eq('feature_key', 'image_analysis')
        .eq('period_start', subscription.current_period_start)
        .single()

      currentUsage = usageRecord?.usage_count ?? 0

      if (currentUsage >= limit && limit > 0) {
        return NextResponse.json(
          {
            error: 'Límite de análisis alcanzado',
            requiresUpgrade: true,
            upgradeTo: 'elite',
            currentTier: tier,
            currentUsage,
            limit,
            message: `Has usado ${currentUsage} de ${limit} análisis este mes. Upgrade a Elite para más análisis.`
          },
          { status: 403 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Rol no autorizado' },
        { status: 403 }
      )
    }

    // Validate file upload
    const fileValidation = await validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      validateMagicNumbers: true
    })

    if (!fileValidation.isValid) {
      return createValidationErrorResponse(fileValidation)
    }

    const fileBuffer = await file.arrayBuffer()
    const fileName = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    const { error: uploadError } = await supabase
      .storage
      .from('medical-images')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      logger.error('[VISION] Upload error:', { err: uploadError })
      return NextResponse.json(
        { error: 'Error al subir imagen' },
        { status: 500 }
      )
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('medical-images')
      .getPublicUrl(fileName)

    const analysisResult = await analyzeMedicalImage({
      imageUrl: publicUrl,
      imageType: imageType as ImageType,
      patientContext: patientNotes || undefined
    })

    const analysisRecord = await saveAnalysis(
      user.id,
      publicUrl,
      imageType as ImageType,
      {
        imageUrl: publicUrl,
        imageType: imageType as ImageType,
        patientNotes: patientNotes || undefined
      },
      analysisResult
    )

    // Update usage tracking for doctores only
    // Patients don't need premium_feature_usage tracking - they get 3 free per month
    if (profile.role === 'doctor') {
      const { data: subscription } = await supabase
        .from('doctor_subscriptions')
        .select('current_period_start, current_period_end')
        .eq('doctor_id', user.id)
        .eq('status', 'active')
        .single()

      if (subscription) {
        const { data: usageRecord } = await supabase
          .from('premium_feature_usage')
          .select('id')
          .eq('doctor_id', user.id)
          .eq('feature_key', 'image_analysis')
          .eq('period_start', subscription.current_period_start)
          .single()

        if (usageRecord) {
          await supabase
            .from('premium_feature_usage')
            .update({
              usage_count: currentUsage + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', usageRecord.id)
        } else {
          await supabase
            .from('premium_feature_usage')
            .insert({
              doctor_id: user.id,
              feature_key: 'image_analysis',
              usage_count: 1,
              period_start: subscription.current_period_start,
              period_end: subscription.current_period_end
            })
        }
      }
    }

    logger.info('[VISION] Analysis complete', {
      analysisId: analysisRecord.id,
      imageType,
      urgency: analysisResult.urgencyLevel,
      confidence: analysisResult.confidencePercent,
      latencyMs: Date.now() - startTime,
      tier,
      usage: currentUsage + 1,
      limit
    })

    return NextResponse.json({
      success: true,
      analysisId: analysisRecord.id,
      imageUrl: publicUrl,
      urgency: analysisResult.urgencyLevel,
      confidence: analysisResult.confidencePercent,
      status: 'completed',
      usage: {
        used: currentUsage + 1,
        limit,
        remaining: limit - currentUsage - 1
      }
    })
    } catch (error) {
      logger.error('[VISION] Error in analyze route:', { err: error })

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

      return NextResponse.json(
        { error: `Error analizando imagen: ${errorMessage}` },
        { status: 500 }
      )
    }
  })
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') ?? 'all'

    let query = supabase
      .from('medical_image_analyses')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: analyses, error } = await query.limit(100)

    if (error) {
      logger.error('[VISION] Error fetching analyses:', { err: error })
      return NextResponse.json(
        { error: 'Error al obtener análisis' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      analyses: analyses || []
    })
  } catch (error) {
    logger.error('[VISION] Error in GET route:', { err: error })
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
