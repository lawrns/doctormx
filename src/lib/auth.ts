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
  
  if (error) throw error
  
  return profile
}

// Proceso simple: verificar rol
export async function requireRole(role: UserRole) {
  const { user, supabase } = await requireAuth()
  const profile = await getProfile(user.id)
  
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
