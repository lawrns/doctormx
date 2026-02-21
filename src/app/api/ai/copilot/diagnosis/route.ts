import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { suggestDifferentialDiagnosis, suggestICDCodes } from '@/lib/ai/copilot'
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

        const { symptoms, diagnosis, patientInfo } = await req.json()

        if (!symptoms || !Array.isArray(symptoms)) {
            return NextResponse.json({ error: 'Se requiere un array de sintomas' }, { status: 400 })
        }

        const [diagnoses, icdCodes] = await Promise.all([
            suggestDifferentialDiagnosis(symptoms, patientInfo),
            suggestICDCodes(symptoms, diagnosis),
        ])

        return NextResponse.json({
            diagnoses,
            icdCodes,
        })
    } catch (error) {
        logger.error('Error in copilot diagnosis:', { err: error })
        return NextResponse.json({ error: 'Error procesando diagnostico' }, { status: 500 })
    }
}
