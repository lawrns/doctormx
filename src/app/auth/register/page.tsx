'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

function RegisterContent() {
  const searchParams = useSearchParams()
  const isDoctor = searchParams.get('type') === 'doctor'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Create user record in users table
      const { error: userError } = await supabase.from('users').insert({
        id: data.user.id,
        email: email,
        full_name: fullName,
        phone,
        role: isDoctor ? 'doctor' : 'patient',
      })

      // If user already exists (409 or 23505), that's okay - continue to profile completion
      if (userError && userError.code !== '23505' && userError.code !== '409') {
        setError(userError.message)
        setLoading(false)
        return
      }

      // Redirect to profile completion page
      router.push('/auth/complete-profile')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#0066CC] rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Doctory</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-xl border-gray-200">
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 ${isDoctor ? 'bg-green-50' : 'bg-blue-50'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                {isDoctor ? (
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-[#0066CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isDoctor ? 'Registro de médico' : 'Crear cuenta'}
              </h1>
              <p className="text-gray-500 mt-2">
                {isDoctor 
                  ? 'Únete a nuestra red de profesionales de la salud'
                  : 'Comienza a cuidar tu salud hoy'
                }
              </p>
            </div>

            {/* Doctor Badge */}
            {isDoctor && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertDescription className="text-green-700 text-sm">
                  Después del registro, completarás tu perfil profesional
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="h-12"
                  placeholder={isDoctor ? 'Dr. Juan Pérez' : 'Juan Pérez'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-12"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional)
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="h-12"
                  placeholder="55 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="h-12"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full h-12 font-semibold text-base ${isDoctor ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0066CC] hover:bg-[#0052A3]'}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creando cuenta...
                  </span>
                ) : (
                  isDoctor ? 'Registrarme como médico' : 'Crear cuenta gratis'
                )}
              </Button>
            </form>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center mt-4">
              Al registrarte, aceptas nuestros{' '}
              <Link href="/terms" className="text-[#0066CC] hover:underline">Términos</Link>
              {' '}y{' '}
              <Link href="/privacy" className="text-[#0066CC] hover:underline">Política de Privacidad</Link>
            </p>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-400">o</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            {/* Login Link */}
            <p className="text-center text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-[#0066CC] hover:text-[#0052A3] font-medium">
                Inicia sesión
              </Link>
            </p>

            {/* Toggle Doctor/Patient */}
            {!isDoctor && (
              <p className="text-center text-gray-400 text-sm mt-4">
                ¿Eres médico?{' '}
                <Link href="/auth/register?type=doctor" className="text-green-600 hover:text-green-700 font-medium">
                  Regístrate aquí
                </Link>
              </p>
            )}
          </Card>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-gray-400 hover:text-[#0066CC] text-sm transition-colors inline-flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-[#0066CC] border-t-transparent rounded-full"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  )
}
