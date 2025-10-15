import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AnimatedChat from './components/AnimatedChat'
import StatsBoard from './components/StatsBoard'

function Logo() {
  return (
    <div className="flex items-center gap-2.5 group">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-medical-500 text-white shadow-sm transition-all duration-200 group-hover:shadow-brand group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
        </svg>
      </span>
      <span className="text-xl font-semibold tracking-tight text-ink-primary transition-colors duration-200 group-hover:text-brand-600">doctor.mx</span>
    </div>
  )
}

function MobileMenu({ isOpen, onClose }) {
  const { user, logout, isLoggingOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="fixed inset-0 bg-ink-primary/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-ink-border">
          <Logo />
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-ink-bg transition-colors" aria-label="Cerrar menú">
            <svg className="h-6 w-6 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          {user ? (
            <div className="space-y-4">
              <div className="text-center py-4 border-b border-ink-border mb-4">
                <span className="text-sm text-ink-secondary">
                  Hola, {user.user_metadata?.full_name || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="block w-full text-center text-ink-secondary hover:text-brand-600 transition-colors py-2.5 border border-ink-border rounded-xl hover:bg-ink-bg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cerrando sesión...
                  </div>
                ) : (
                  'Cerrar Sesión'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <a href="/login" className="block text-center text-ink-secondary hover:text-brand-600 transition-colors py-2.5 font-medium text-sm">
                Iniciar Sesión
              </a>
              <a href="/register" className="block text-center text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-colors py-2.5 rounded-xl font-medium text-sm shadow-sm">
                Registrarse
              </a>
            </div>
          )}

          <div className="pt-4 border-t border-ink-border">
            <Link
              to="/doctor"
              className="block w-full text-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3.5 text-base font-semibold text-white shadow-brand transition-all duration-200 hover:shadow-lg"
            >
              Consultar ahora
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, title, children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div className={`flex items-start gap-5 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="h-12 w-12 shrink-0 rounded-xl bg-medical-50 flex items-center justify-center text-medical-600 transition-all duration-200 hover:bg-medical-100 hover:scale-105">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-ink-primary mb-1.5 leading-snug">{title}</h3>
        <p className="text-ink-secondary leading-relaxed text-sm">{children}</p>
      </div>
    </div>
  )
}

function ScrollIndicator() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-0.5 bg-ink-border z-50">
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-medical-500 transition-all duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}


export default function App(){
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const { user, logout, isLoggingOut } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }
  
  useEffect(() => {
    setIsLoaded(true)
    // Prevent scroll when mobile menu is open
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-50 via-ink-inverse to-ink-bg overflow-x-hidden">
      <ScrollIndicator />

      {/* Top nav with glassmorphism */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-ink-border/50">
        <div className="mx-auto flex max-w-container items-center justify-between px-6 py-4 md:px-8">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-ink-secondary border-r border-ink-border pr-4">
                  Hola, {user.user_metadata?.full_name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center justify-center px-4 py-2 border border-ink-border text-sm font-medium rounded-lg text-ink-secondary hover:text-brand-600 hover:border-brand-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Cerrando sesión...
                    </div>
                  ) : (
                    'Cerrar Sesión'
                  )}
                </button>
              </div>
            ) : (
              <>
                <a href="/login" className="text-sm font-medium text-ink-secondary hover:text-brand-600 transition-colors">
                  Iniciar Sesión
                </a>
                <a href="/register" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 transition-all duration-200 shadow-sm">
                  Registrarse
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-ink-bg transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="h-6 w-6 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <main>
        {/* Hero Section - Dark Modern */}
        <section className="relative mx-auto max-w-container px-6 py-24 md:py-32 lg:py-40 md:px-8 overflow-hidden">
          {/* Dark background with modern gradients */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-dark-50 via-dark-100 to-dark-50">
            {/* Glowing orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-brand-500/20 to-transparent rounded-full blur-3xl animate-glow-pulse"></div>
            <div className="absolute -bottom-32 -left-32 w-[600px] h-[600px] bg-gradient-to-tr from-medical-500/20 to-transparent rounded-full blur-3xl animate-glow-pulse" style={{animationDelay: '1.5s'}}></div>
            {/* Subtle grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              {/* Badge */}
              <div className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-400"></span>
                  </span>
                  Disponible 24/7 · Respuesta inmediata
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.05]">
                Atención médica{' '}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-brand-400 via-brand-300 to-medical-400 bg-clip-text text-transparent">instantánea</span>
                </span>
                {' '}por IA
              </h1>

              {/* Description */}
              <p className="text-xl text-white/80 leading-relaxed mb-10 max-w-xl">
                Consulta con IA médica de última generación. Diagnóstico inicial en segundos, referencias a especialistas verificados.
                <span className="block mt-3 text-white font-semibold">Desde $79 MXN · Sin citas · Sin esperas</span>
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  to="/doctor"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-brand/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand/60 hover:scale-105"
                >
                  Consultar ahora
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

                <a
                  href="#precios"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105"
                >
                  Ver planes
                  <span className="text-sm font-normal text-white/70">desde $79</span>
                </a>
              </div>

              {/* Trust indicators - Modern dark style */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-medical-500/20 backdrop-blur-sm ring-1 ring-medical-400/30">
                    <svg className="h-5 w-5 text-medical-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white/90">NOM-004 compliant</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/20 backdrop-blur-sm ring-1 ring-brand-400/30">
                    <svg className="h-5 w-5 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white/90">Datos encriptados</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-medical-500/20 backdrop-blur-sm ring-1 ring-medical-400/30">
                    <svg className="h-5 w-5 text-medical-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-white/90">Médicos verificados</span>
                </div>
              </div>
            </div>
            <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
              {/* Animated chat conversation with modern glow */}
              <div className="relative">
                {/* Enhanced glow effect */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-500/30 via-medical-500/20 to-transparent rounded-[3rem] blur-3xl"></div>
                <div className="absolute inset-0 -z-10 bg-gradient-to-tl from-brand-400/20 to-transparent rounded-[3rem] blur-2xl"></div>
                <AnimatedChat />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Dashboard - Clean White Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="mx-auto max-w-container px-6 md:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-ink-primary mb-6 tracking-tight">
                  Atención médica en tiempo real
                </h2>
                <p className="text-xl text-ink-secondary leading-relaxed mb-10">
                  Miles de personas confían en doctor.mx cada día para recibir atención médica rápida, segura y profesional.
                </p>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-medical-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-medical-500/25">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-ink-primary text-lg">Disponibilidad 24/7</div>
                      <div className="text-ink-secondary">Acceso inmediato a doctores en cualquier momento del día</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/25">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-ink-primary text-lg">Respuesta instantánea</div>
                      <div className="text-ink-secondary">Diagnóstico inicial en segundos, no en días</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-500/25">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold text-ink-primary text-lg">4.9/5.0 de satisfacción</div>
                      <div className="text-ink-secondary">Miles de pacientes satisfechos confían en nosotros</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:pl-8">
                <StatsBoard />
              </div>
            </div>
          </div>
        </section>

        {/* Features - Modern Bento Layout with Dark Background */}
        <section id="features" className="py-24 md:py-32 bg-gradient-to-b from-dark-50 to-dark-100 relative overflow-hidden">
          {/* Background patterns */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:64px_64px]"></div>

          <div className="mx-auto max-w-container px-6 md:px-8 relative z-10">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Atención médica moderna
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                La plataforma más rápida y accesible para consultas médicas en México
              </p>
            </div>

            {/* Bento Box Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large Feature 1 - Spans 2 columns */}
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 p-10 shadow-2xl lg:col-span-2 transition-all duration-500 hover:shadow-brand hover:scale-[1.02]">
                <div className="relative z-10">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white mb-8 backdrop-blur-sm ring-1 ring-white/30 shadow-xl">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-white">
                    Respuesta instantánea con IA
                  </h3>
                  <p className="text-white/90 leading-relaxed text-lg">
                    Tecnología de inteligencia artificial médica disponible 24/7. Diagnóstico inicial en segundos, referencias a especialistas en minutos.
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              </div>

              {/* Feature 2 - Glassmorphism */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl p-8 shadow-xl ring-1 ring-white/20 transition-all duration-500 hover:bg-white/15 hover:ring-white/30">
                <div className="mb-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-medical-500/20 backdrop-blur-sm text-medical-400 ring-1 ring-medical-400/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-medical-500/30">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">
                  Privacidad garantizada
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Cumplimos NOM-004. Datos encriptados y protegidos por ley mexicana.
                </p>
              </div>

              {/* Feature 3 - Glassmorphism */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl p-8 shadow-xl ring-1 ring-white/20 transition-all duration-500 hover:bg-white/15 hover:ring-white/30 md:col-span-2 lg:col-span-1">
                <div className="mb-6">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/20 backdrop-blur-sm text-brand-400 ring-1 ring-brand-400/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-500/30">
                    <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">
                  Médicos verificados
                </h3>
                <p className="text-white/70 leading-relaxed">
                  Red de especialistas certificados. Validación de cédula profesional y experiencia comprobada.
                </p>
              </div>

              {/* Large Feature 4 - Teal Gradient */}
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-medical-500 to-medical-600 p-10 shadow-2xl md:col-span-2 transition-all duration-500 hover:shadow-glow-teal hover:scale-[1.02]">
                <div className="relative z-10">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-white mb-8 backdrop-blur-sm ring-1 ring-white/30 shadow-xl">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="mb-4 text-3xl font-bold text-white">
                    100% por WhatsApp
                  </h3>
                  <p className="text-white/90 leading-relaxed text-lg">
                    Sin apps nuevas ni complicaciones. Usa la aplicación que ya tienes y conoces. Simple, rápido y familiar.
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - Clean White */}
        <section id="precios" className="py-20 md:py-32 bg-white">
          <div className="mx-auto max-w-container px-6 md:px-8">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-ink-primary mb-6 tracking-tight">
                Planes accesibles para todos
              </h2>
              <p className="text-xl text-ink-secondary max-w-2xl mx-auto leading-relaxed">
                Desde consultas gratuitas con IA hasta atención médica profesional
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Free Plan */}
              <div className="bg-white border border-ink-border rounded-2xl p-6 hover:shadow-card-hover transition-all duration-200">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-ink-primary mb-2">Gratis</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-ink-primary">$0</span>
                    <span className="text-ink-secondary text-sm">MXN</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    IA triage + guía básica
                  </li>
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Recordatorios WhatsApp
                  </li>
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Pre-check de recetas
                  </li>
                </ul>
                <Link to="/doctor" className="block w-full text-center py-2.5 rounded-lg border border-ink-border text-ink-primary font-medium hover:bg-ink-bg transition-colors">
                  Empezar gratis
                </Link>
              </div>

              {/* Chat Plan */}
              <div className="bg-white border border-ink-border rounded-2xl p-6 hover:shadow-card-hover transition-all duration-200">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-ink-primary mb-2">Consulta Chat</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-ink-primary">$79</span>
                    <span className="text-ink-secondary text-sm">MXN</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Doctor chat 15 min
                  </li>
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    e-Rx cuando aplique
                  </li>
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Referencia a especialista
                  </li>
                </ul>
                <Link to="/doctor" className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:from-brand-700 hover:to-brand-600 transition-colors">
                  Consultar ahora
                </Link>
              </div>

              {/* Video Plan */}
              <div className="bg-white border-2 border-brand-500 rounded-2xl p-6 relative hover:shadow-brand transition-all duration-200">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-brand-600 to-brand-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-ink-primary mb-2">Video Exprés</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-ink-primary">$149</span>
                    <span className="text-ink-secondary text-sm">MXN</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Videollamada 15 min
                  </li>
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    e-Rx + orden de lab
                  </li>
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Expediente digital
                  </li>
                </ul>
                <Link to="/doctor" className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold hover:from-brand-700 hover:to-brand-600 transition-colors shadow-sm">
                  Iniciar video
                </Link>
              </div>

              {/* Family Plan */}
              <div className="bg-white border border-ink-border rounded-2xl p-6 hover:shadow-card-hover transition-all duration-200">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-ink-primary mb-2">Familiar</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-ink-primary">$199</span>
                    <span className="text-ink-secondary text-sm">/mes</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Hasta 4 miembros
                  </li>
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Prioridad en consultas
                  </li>
                  <li className="flex items-start gap-2 text-sm text-ink-secondary">
                    <svg className="h-5 w-5 text-medical-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Seguimiento 30 días
                  </li>
                </ul>
                <Link to="/register" className="block w-full text-center py-2.5 rounded-lg border border-ink-border text-ink-primary font-medium hover:bg-ink-bg transition-colors">
                  Suscribirse
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-ink-secondary mt-8">
              Acepta SPEI, OXXO, tarjeta. CFDI disponible para reembolso de seguros.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-ink-border">
        <div className="mx-auto max-w-container px-6 py-12 md:px-8 md:py-16">
          <div className="grid gap-8 md:grid-cols-4 lg:gap-12 mb-12">
            <div className="md:col-span-1">
              <Logo />
              <p className="mt-4 text-sm text-ink-secondary leading-relaxed">
                Atención médica accesible desde WhatsApp.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink-primary mb-4">Producto</h3>
              <ul className="space-y-3 text-sm text-ink-secondary">
                <li><a href="#features" className="hover:text-brand-600 transition-colors">Características</a></li>
                <li><a href="#precios" className="hover:text-brand-600 transition-colors">Precios</a></li>
                <li><a href="#como-funciona" className="hover:text-brand-600 transition-colors">Cómo funciona</a></li>
                <li><Link to="/doctor" className="hover:text-brand-600 transition-colors">Consultar ahora</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink-primary mb-4">Para médicos</h3>
              <ul className="space-y-3 text-sm text-ink-secondary">
                <li><a href="#" className="hover:text-brand-600 transition-colors">Únete al equipo</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Portal médico</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Requisitos</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">FAQ Médicos</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink-primary mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-ink-secondary">
                <li><a href="#" className="hover:text-brand-600 transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Consentimiento</a></li>
                <li><a href="#" className="hover:text-brand-600 transition-colors">Contacto</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-ink-border pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <p className="text-sm text-ink-secondary text-center sm:text-left">
                © 2025 Doctor.mx. Todos los derechos reservados.
              </p>

              <div className="flex items-center gap-2 text-sm text-ink-secondary">
                <div className="w-2 h-2 bg-medical-500 rounded-full animate-pulse"></div>
                <span>Sistema operativo</span>
              </div>
            </div>

            <div className="p-4 bg-alert-50 border border-alert-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-alert-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-alert-800 leading-relaxed">
                  <strong>Aviso importante:</strong> Doctor.mx proporciona orientación médica mediante IA supervisada por profesionales.
                  No sustituye diagnóstico ni tratamiento médico profesional. En emergencias, marca 911 o acude a urgencias inmediatamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
