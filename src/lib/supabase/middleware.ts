import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Configuración de rutas protegidas - Sistema centralizado
const ROUTES = {
  public: [
    '/auth/login', 
    '/auth/register', 
    '/auth/callback',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/complete-profile', 
    '/', 
    '/doctors', 
    '/specialties',
    '/for-doctors',
    '/doctor/pricing'
  ],
  requiresAuth: ['/book', '/checkout'],  // Requieren login pero cualquier rol
  patient: ['/app'],
  doctor: ['/doctor'],
  admin: ['/admin'],
} as const

const DASHBOARDS = {
  patient: '/app',
  doctor: '/doctor',
  admin: '/admin',
} as const

// Proceso claro: 1) Autenticar, 2) Verificar acceso, 3) Redirigir si es necesario
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request,
  })
  const path = request.nextUrl.pathname

  // Public routes should not pay the Supabase auth round-trip.
  if (ROUTES.public.some(route => path === route || path.startsWith(route))) {
    return supabaseResponse
  }

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

  // Rutas públicas - permitir acceso
  if (ROUTES.public.some(route => path === route || path.startsWith(route))) {
    return supabaseResponse
  }

  // Rutas que requieren autenticación (cualquier rol)
  const requiresAuth = ROUTES.requiresAuth.some(route => path.startsWith(route))

  // Rutas protegidas por rol específico
  const protectedRoutes = [
    ...ROUTES.patient,
    ...ROUTES.doctor,
    ...ROUTES.admin,
  ]

  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  // Si requiere auth o es protegida, verificar usuario
  if (requiresAuth || isProtected) {
    // Sin usuario - redirigir a login
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect', path)
      return NextResponse.redirect(url)
    }
  }

  // Si solo requiere auth (no rol específico), permitir
  if (requiresAuth && !isProtected) {
    return supabaseResponse
  }

  // Si no es protegida, permitir
  if (!isProtected) {
    return supabaseResponse
  }

  // Usuario debe existir aquí (verificado arriba)
  if (!user) return supabaseResponse

  // Verificar rol del usuario
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userProfile) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }

  if (userProfile.role === 'doctor' && path.startsWith('/app')) {
    return NextResponse.redirect(new URL('/doctor', request.url))
  }

  if (userProfile.role === 'patient' && path.startsWith('/doctor')) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // Redirigir al dashboard correcto si está en la ruta incorrecta
  const correctDashboard = DASHBOARDS[userProfile.role as keyof typeof DASHBOARDS]
  if (correctDashboard && !path.startsWith(correctDashboard)) {
    const url = request.nextUrl.clone()
    url.pathname = correctDashboard
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
