import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/observability/logger'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/doctores/[id]
 *
 * Get specific doctor by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient()

    const { data: doctor } = await supabase
      .from('doctores')
      .select('id, full_name, bio, specialty_id')
      .eq('id', id)
      .single()

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ doctor })
  } catch (error) {
    logger.error('Error fetching doctor by ID', { error })
    return NextResponse.json(
      { error: 'Error fetching doctor' },
      { status: 500 }
    )
  }
}
}
