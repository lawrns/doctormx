import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Configuración de rutas protegidas - Sistema centralizado
const ROUTES = {
  public: [
    '/auth/login',
    '/auth/register',
    '/auth/complete-profile',
    '/',
    '/doctors',
    '/specialties',
    '/for-doctors',
    '/doctor/pricing',
    '/unauthorized',
  ],
  requiresAuth: ['/book', '/checkout'],  // Requieren login pero cualquier rol
  patient: ['/app'],
  doctor: ['/doctor'],
  admin: ['/admin'],
} as const

// Type for route roles
type RouteRole = 'patient' | 'doctor' | 'admin'

const DASHBOARDS = {
  patient: '/app',
  doctor: '/doctor',
  admin: '/admin',
} as const

/**
 * Determine which role is required for a given path
 * Returns undefined if path doesn't require a specific role
 */
function getRequiredRole(path: string): RouteRole | undefined {
  // Check each role's routes
  for (const [role, routes] of Object.entries(ROUTES)) {
    if (role === 'public' || role === 'requiresAuth') continue

    const typedRole = role as RouteRole
    for (const route of routes) {
      if (path.startsWith(route)) {
        return typedRole
      }
    }
  }
  return undefined
}

/**
 * Check if path is public
 */
function isPublicPath(path: string): boolean {
  return ROUTES.public.some(route => path === route || path.startsWith(route))
}

/**
 * Check if path requires authentication but no specific role
 */
function requiresAuthOnly(path: string): boolean {
  return ROUTES.requiresAuth.some(route => path.startsWith(route))
}

// Proceso claro: 1) Autenticar, 2) Verificar acceso, 3) Redirigir si es necesario
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })

  // Skip Supabase client creation during build
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
              ...options,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
            })
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // 1. Rutas públicas - permitir acceso sin autenticación
  if (isPublicPath(path)) {
    return supabaseResponse
  }

  // 2. Verificar si la ruta requiere autenticación
  const authRequired = requiresAuthOnly(path) || getRequiredRole(path) !== undefined

  if (authRequired && !user) {
    // No autenticado - redirigir a login
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  // 3. Si solo requiere auth (sin rol específico), permitir
  if (requiresAuthOnly(path) && user) {
    return supabaseResponse
  }

  // 4. Verificar roles para rutas protegidas
  const requiredRole = getRequiredRole(path)
  if (requiredRole && user) {
    // Obtener perfil del usuario con su rol
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Si hay error o no hay perfil, redirigir a completar perfil
    if (profileError || !userProfile) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/complete-profile'
      return NextResponse.redirect(url)
    }

    // Verificar si el usuario tiene el rol requerido
    if (userProfile.role !== requiredRole) {
      // Usuario autenticado pero sin el rol correcto - redirigir a unauthorized
      // O redirigir a su dashboard correcto
      const userDashboard = DASHBOARDS[userProfile.role as keyof typeof DASHBOARDS]
      if (userDashboard) {
        const url = request.nextUrl.clone()
        url.pathname = userDashboard
        return NextResponse.redirect(url)
      }
      // Fallback a página de unauthorized si no hay dashboard
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return supabaseResponse
}

