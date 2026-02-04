import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para registrar usuario con verificación de email
export async function signUpUser({ email, password, full_name }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name,
      },
    },
  })

  return { data, error }
}

// Función para iniciar sesión
export async function signInUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

// Función para cerrar sesión
export async function signOutUser() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Función para obtener el usuario actual
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Función para reenviar email de confirmación
export async function resendConfirmation(email) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  })

  return { data, error }
}