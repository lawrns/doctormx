import { NextResponse } from 'next/server'
import { enrichPracticeProfile } from '@/lib/connect/enrichment'
import type { ConnectPracticeSearchResult } from '@/lib/connect/types'

export const dynamic = 'force-dynamic'

function isPracticePayload(value: unknown): value is ConnectPracticeSearchResult {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.id === 'string'
    && typeof record.name === 'string'
    && typeof record.source === 'string'
    && typeof record.claimStatus === 'string'
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { practice?: unknown }
    if (!isPracticePayload(body.practice)) {
      return NextResponse.json(
        { error: 'Selecciona una práctica válida para preparar el perfil.' },
        { status: 400 }
      )
    }

    const draft = await enrichPracticeProfile(body.practice)
    return NextResponse.json({ draft })
  } catch {
    return NextResponse.json(
      { error: 'No pudimos preparar el borrador con IA en este momento.' },
      { status: 500 }
    )
  }
}
