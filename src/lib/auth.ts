// Sistema de autenticación - Claridad y simplicidad
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types'

// Proceso simple: obtener usuario autenticado o redirigir
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return { user, supabase }
}

// Proceso simple: obtener perfil completo
export async function getProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  // If profile doesn't exist, return null instead of throwing
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - profile doesn't exist yet
      return null
    }
    throw error
  }

  return profile
}

// Proceso simple: verificar rol
export async function requireRole(role: UserRole) {
  const { user, supabase } = await requireAuth()
  const profile = await getProfile(user.id)

  // If no profile exists, redirect to complete registration
  if (!profile) {
    redirect('/auth/complete-profile')
  }

  if (profile.role !== role) {
    const dashboards = {
      patient: '/app',
      doctor: '/doctor',
      admin: '/admin',
    }
    redirect(dashboards[profile.role as UserRole])
  }

  return { user, profile, supabase }
}
