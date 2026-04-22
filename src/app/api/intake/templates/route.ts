import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'

// Types
export type IntakeFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'yesno'
  | 'scale'
  | 'date'
  | 'file'

export interface IntakeField {
  id: string
  type: IntakeFieldType
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
  conditional?: { fieldId: string; value: string }
  helpText?: string
}

// GET - List templates for logged-in doctor or public default
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get('doctor_id')
  const includeDefaults = searchParams.get('defaults') === 'true'

  try {
    const supabase = createServiceClient()

    let query = supabase
      .from('intake_form_templates')
      .select('*')
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (doctorId) {
      query = query.eq('doctor_id', doctorId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no templates exist for this doctor, return defaults
    if (includeDefaults && (!data || data.length === 0) && doctorId) {
      return NextResponse.json({ templates: [getDefaultIntakeTemplate(doctorId)] })
    }

    return NextResponse.json({ templates: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - Create new template (doctor only)
export async function POST(request: NextRequest) {
  try {
    const { user } = await requireRole('doctor')
    const body = await request.json()
    const supabase = createServiceClient()

    // Validate fields JSON
    if (!body.fields_json || !Array.isArray(body.fields_json)) {
      return NextResponse.json(
        { error: 'fields_json must be an array of field definitions' },
        { status: 400 }
      )
    }

    // If setting as default, clear previous default
    if (body.is_default) {
      await supabase
        .from('intake_form_templates')
        .update({ is_default: false })
        .eq('doctor_id', user.id)
    }

    const { data, error } = await supabase
      .from('intake_form_templates')
      .insert({
        doctor_id: user.id,
        name: body.name,
        specialty_context: body.specialty_context || null,
        description: body.description || null,
        fields_json: body.fields_json,
        is_default: body.is_default ?? false,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, template: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

// PATCH - Update template (doctor only)
export async function PATCH(request: NextRequest) {
  try {
    const { user } = await requireRole('doctor')
    const body = await request.json()
    const supabase = createServiceClient()

    if (!body.id) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('intake_form_templates')
      .select('doctor_id')
      .eq('id', body.id)
      .single()

    if (!existing || existing.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    // If setting as default, clear previous
    if (body.is_default) {
      await supabase
        .from('intake_form_templates')
        .update({ is_default: false })
        .eq('doctor_id', user.id)
    }

    const { data, error } = await supabase
      .from('intake_form_templates')
      .update({
        name: body.name,
        specialty_context: body.specialty_context,
        description: body.description,
        fields_json: body.fields_json,
        is_default: body.is_default,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, template: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

// DELETE - Soft delete template
export async function DELETE(request: NextRequest) {
  try {
    const { user } = await requireRole('doctor')
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('id')
    const supabase = createServiceClient()

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('intake_form_templates')
      .select('doctor_id')
      .eq('id', templateId)
      .single()

    if (!existing || existing.doctor_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('intake_form_templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', templateId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401 }
    )
  }
}

/**
 * Default intake template — used when doctor hasn't created one.
 */
function getDefaultIntakeTemplate(doctorId: string) {
  const fields: IntakeField[] = [
    {
      id: 'chief_complaint',
      type: 'textarea',
      label: '¿Cuál es el motivo principal de tu consulta hoy?',
      required: true,
      placeholder: 'Describe tus síntomas, cuándo comenzaron, y qué te preocupa...',
      helpText: 'Sé lo más específico posible para que el doctor pueda prepararse.',
    },
    {
      id: 'symptom_start',
      type: 'text',
      label: '¿Desde cuándo tienes estos síntomas?',
      required: true,
      placeholder: 'Ej: 3 días, 1 semana, desde el mes pasado',
    },
    {
      id: 'pain_level',
      type: 'scale',
      label: 'Si tienes dolor, ¿qué tan intenso es? (0 = sin dolor, 10 = insoportable)',
      required: false,
      min: 0,
      max: 10,
    },
    {
      id: 'previous_conditions',
      type: 'textarea',
      label: '¿Tienes alguna condición médica previa? (diabetes, hipertensión, alergias, etc.)',
      required: false,
      placeholder: 'Lista tus condiciones y medicamentos actuales...',
    },
    {
      id: 'current_medications',
      type: 'textarea',
      label: '¿Estás tomando algún medicamento actualmente?',
      required: false,
      placeholder: 'Nombre, dosis y frecuencia...',
    },
    {
      id: 'allergies',
      type: 'text',
      label: '¿Tienes alergias conocidas?',
      required: false,
      placeholder: 'Medicamentos, alimentos, otros...',
    },
    {
      id: 'smoking_alcohol',
      type: 'select',
      label: '¿Fumas o consumes alcohol?',
      required: false,
      options: ['No fumo ni tomo alcohol', 'Fumo ocasionalmente', 'Fumo regularmente', 'Tomo alcohol ocasionalmente', 'Tomo alcohol regularmente'],
    },
  ]

  return {
    id: 'default',
    doctor_id: doctorId,
    name: 'Consulta General',
    specialty_context: 'general',
    description: 'Formulario estándar para consultas médicas generales',
    fields_json: fields,
    is_default: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
