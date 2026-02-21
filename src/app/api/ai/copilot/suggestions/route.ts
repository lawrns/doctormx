import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSuggestions, checkDrugInteractions } from '@/lib/ai/copilot'
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

        const body = await req.json()
        const { symptoms, history, medications } = body

        if (!symptoms && !medications) {
            return NextResponse.json({ error: 'Se requiere symptoms o medications' }, { status: 400 })
        }

        const result: { questions?: string[]; redFlags?: Array<{ message: string; severity: string }>; interactions?: unknown[] } = {}

        if (symptoms) {
            const suggestions = await generateSuggestions(symptoms, history)
            result.questions = suggestions.questions
            result.redFlags = suggestions.redFlags
        }

        if (medications) {
            const interactions = await checkDrugInteractions(medications)
            result.interactions = interactions
        }

        return NextResponse.json(result)
    } catch (error) {
        logger.error('Error in copilot suggestions:', { err: error })
        return NextResponse.json({ error: 'Error procesando sugerencias' }, { status: 500 })
    }
}
