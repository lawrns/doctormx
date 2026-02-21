import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateConsultationSummary } from '@/lib/ai/copilot'
import { logger } from '@/lib/observability/logger'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'doctor') {
            return NextResponse.json({ error: 'Solo doctores pueden usar esta funcionalidad' }, { status: 403 })
        }

        const { transcription } = await req.json()

        if (!transcription || typeof transcription !== 'string') {
            return NextResponse.json({ error: 'Se requiere la transcripcion de la consulta' }, { status: 400 })
        }

        if (transcription.length < 50) {
            return NextResponse.json({ error: 'La transcripcion es muy corta para generar un resumen' }, { status: 400 })
        }

        const summary = await generateConsultationSummary(transcription)

        return NextResponse.json(summary)
    } catch (error) {
        logger.error('Error in copilot summary:', { err: error })
        return NextResponse.json({ error: 'Error generando resumen' }, { status: 500 })
    }
}
