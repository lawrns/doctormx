import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase/server'
import {
  createCorsHeaders,
  getWidgetContext,
  normalizeWidgetServices,
} from '@/lib/widget'

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/

function cleanText(value: unknown, max = 240) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function normalizeColor(value: unknown, fallback: string) {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback
}

function normalizeOrigins(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((origin) => cleanText(origin, 240))
    .filter(Boolean)
    .slice(0, 12)
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: createCorsHeaders(request.headers.get('origin')),
  })
}

export async function GET(request: NextRequest) {
  const cors = createCorsHeaders(request.headers.get('origin'))
  const doctorId = request.nextUrl.searchParams.get('doctorId')

  try {
    if (doctorId) {
      const context = await getWidgetContext(doctorId, { publicOnly: true })
      if (!context) {
        return NextResponse.json({ error: 'Widget not available' }, { status: 404, headers: cors })
      }

      return NextResponse.json(context, { headers: cors })
    }

    const { user } = await requireRole('doctor')
    const context = await getWidgetContext(user.id)

    if (!context) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404, headers: cors })
    }

    return NextResponse.json(context, { headers: cors })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401, headers: cors }
    )
  }
}

export async function POST(request: NextRequest) {
  const cors = createCorsHeaders(request.headers.get('origin'))

  try {
    const { user } = await requireRole('doctor')
    const body = await request.json()
    const context = await getWidgetContext(user.id)

    if (!context) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404, headers: cors })
    }

    const enabledServices = normalizeWidgetServices(body.enabled_services, context.doctor)
    const upsertData = {
      doctor_id: user.id,
      primary_color: normalizeColor(body.primary_color, context.config.primary_color),
      accent_color: normalizeColor(body.accent_color, context.config.accent_color),
      enabled_services: enabledServices,
      custom_title: cleanText(body.custom_title, 96) || null,
      custom_message: cleanText(body.custom_message, 220) || null,
      allowed_origins: normalizeOrigins(body.allowed_origins),
      is_active: body.is_active !== false,
      updated_at: new Date().toISOString(),
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('doctor_widget_configs')
      .upsert(upsertData, { onConflict: 'doctor_id' })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers: cors })
    }

    const nextContext = await getWidgetContext(user.id)
    if (!nextContext) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404, headers: cors })
    }

    return NextResponse.json({ success: true, ...nextContext }, { headers: cors })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unauthorized' },
      { status: 401, headers: cors }
    )
  }
}
