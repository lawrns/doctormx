'use client'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Eye,
  EyeOff,
  Loader2,
  Stethoscope,
  UserCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const loginSchema = z.object({
  email: z.string().email('Correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
  userType: z.enum(['patient', 'doctor']).optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const [supabase] = useState(() => {
    try {
      return createClient()
    } catch {
      return null
    }
  })

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      userType: 'patient',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)

    if (!supabase) {
      form.setError('root', { message: 'Authentication not available' })
      setIsLoading(false)
      return
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (authError) {
        form.setError('root', { message: authError.message })
      } else {
        const redirectUrl = searchParams.get('redirect') ||
          (data.userType === 'doctor' ? '/doctor' : '/app')
        router.push(redirectUrl)
        router.refresh()
      }
      setIsLoading(false)
    } catch {
      form.setError('root', { message: 'Ocurrió un error inesperado' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    if (!supabase) return
    setIsLoading(true)

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) {
        form.setError('root', { message: oauthError.message })
        setIsLoading(false)
      }
    } catch {
      form.setError('root', { message: 'Error al iniciar sesión con ' + provider })
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Image & Branding */}
      <div className="absolute inset-0 bg-cover bg-center pointer-events-none z-0">
        <div
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-zinc-900/70 pointer-events-none" />
      </div>

      {/* Content container - properly contained */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen p-10">
        {/* Top section - Back button & Logo */}
        <div className="flex items-center justify-between gap-2.5">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between gap-2.5 p-6 border-b">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.158 1.32l-4.3-3-9 0 0 0 3.009h.32a6.318 4.5.004 3.01.9 0 3.81.009h.32a4.036 2.92.707.682a4.5 0.006.364L12 7.636l1.3181.318a4.5 4.5.01 0 0 0 0z" />
              </svg>
            </div>

            {/* Desktop logo */}
            <div className="hidden lg:flex flex-1 w-46 shrink-0">
              <Image
                src="/logo.svg"
                alt="Doctor.mx"
                width={184}
                height={48}
                priority
              />
            </div>
          </div>

          {/* Main Content */}
          <main id="main-content" className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Iniciar sesión
              </h1>
            </div>

            {/* Left Panel - Image & Branding */}
            <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:bg-white lg:p-8 overflow-y-auto">
              <div className="flex-1 flex-col">
                {/* Fixed background layers - positioned absolutely, no z-index needed */}
                <div
                  className="absolute inset-0 bg-cover bg-center pointer-events-none"
                  style={{
                    backgroundImage: 'url(https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=2091&auto=format&fit=crop)',
                  }}
                >
                  <div className="absolute inset-0 bg-zinc-900/70 pointer-events-none" />
                </div>

                {/* Testimonial Card */}
                <div className="bg-white/10 p-6 border border-gray-200 rounded-xl">
                  <blockquote className="space-y-2">
                    <p className="text-lg leading-relaxed">
                      &ldquo;Doctor.mx ha transformado la forma en que atiendo a mis pacientes. La plataforma es intuitiva y el sistema de IA me ayuda a dar mejores diagnósticos.&rdquo;
                    </p>
                    <footer className="text-sm text-zinc-300">
                      Dra. María García &mdash; Medicina General, CDMX
                    </footer>
                  </blockquote>;
                  <div className="mt-6">
                    {/* Right Panel - Login Form */}
                  </div>
                </div>
              </div>
            </main>

            {/* Bottom section - Testimonial & Terms */}
            <div className="bg-gray-50 p-6 lg:mt-8 lg:hidden">
              {/* Desktop testimonial */}
              <blockquote className="hidden lg:block text-center space-y-2">
                    <p className="text-xl font-light text-gray-400 mb-4">
                      ¿No tienes cuenta?{' '}
                      <span className="lg:hidden">
                        {' '}
                        <Link href="/auth/register" className="text-blue-500 hover:text-blue-600">
                          Regístrate gratis
                        </Link>
                        {' '}
                        <span className="text-blue-500"> y obtén acceso a todas las funcionalidades.
                      </span>
                      </p>
                      <Link href="/auth/register" className="underline underline-offset-4 hover:text-blue-600">
                        <Button variant="outline" size="sm" className="mt-4">
                          Crear cuenta
                        </Button>
                      </Link>
                    </span>
                  </blockquote>
                  {/* Mobile testimonial */}
                  <div className="hidden lg:hidden bg-gradient-to-b from-gray-50 to-gray-100 p-8">
                    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl">
                      <p className="text-lg leading-relaxed">
                        ¿No tienes cuenta?{' '}
                        <Link href="/auth/register" className="text-blue-500">
                          Regístrate gratis
                        </Link>
                        {' '}
                        <span className="text-blue-500"> y obtén acceso a todas las funcionalidades.
                        </span>
                      </Link>
                    </div>
                    </div>
                  {/* Terms */}
                  <div>
                    <p className="px-2 text-center text-xs text-muted-foreground">
                      Al continuar, aceptas nuestros{' '}
                      <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                        Términos de Servicio
                      </Link>
                      {' '}
                      <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                        Política de Privacidad
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
