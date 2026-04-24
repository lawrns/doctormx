import { NextResponse } from 'next/server'
import { searchConnectPractices } from '@/lib/connect/practice-search'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get('q') || '').trim()

  if (query.length < 2) {
    return NextResponse.json({ results: [], provider: process.env.GOOGLE_MAPS_API_KEY ? 'directory_google' : 'directory_mock' })
  }

  try {
    const payload = await searchConnectPractices(query)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(
      { error: 'No pudimos buscar prácticas en este momento.' },
      { status: 500 }
    )
  }
}
