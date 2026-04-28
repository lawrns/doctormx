import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type SupabaseClient = Awaited<ReturnType<typeof createClient>>

export type AuthContext = {
  user: NonNullable<Awaited<ReturnType<SupabaseClient['auth']['getUser']>>['data']['user']>
  supabase: SupabaseClient
  params?: Promise<Record<string, string>>
}

export type WithAuthHandler = (
  request: NextRequest,
  context: AuthContext
) => Promise<NextResponse>

export function withAuth(handler: WithAuthHandler) {
  return async (
    request: NextRequest,
    { params }: { params?: Promise<Record<string, string>> } = {}
  ): Promise<NextResponse> => {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      return await handler(request, { user, supabase, params })
    } catch (error) {
      console.error('[API] Unhandled error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
