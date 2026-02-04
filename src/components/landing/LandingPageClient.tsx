'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { HeroSection } from './HeroSection'
import DrSimeonShowcase from './DrSimeonShowcase'
import { StatsSection } from './StatsSection'
import { FeaturesSection } from './FeaturesSection'
import { TestimonialsSection } from './TestimonialsSection'
import { CTASection } from './CTASection'
import { TrustFooter } from '@/components/TrustSignals'
import { Logo } from '@/components/Logo'
import { Search, UserPlus, Sparkles, ShieldCheck } from 'lucide-react'

export function LandingPageClient() {
  return (
    <main className="min-h-screen bg-[#fdfaf6] overflow-x-hidden">
      {/* Announcement Bar - EMPHASIZE FREE + COFEPRIS Trust */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 text-center"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span className="inline-flex items-center gap-2 font-bold text-base">
            <Sparkles className="w-5 h-5" fill="currentColor" />
            5 CONSULTAS MÉDICAS GRATIS PARA TODOS LOS MEXICANOS
            <Sparkles className="w-5 h-5" fill="currentColor" />
          </span>
          <span className="hidden sm:inline text-blue-200">|</span>
          <span className="inline-flex items-center gap-1.5 text-sm text-blue-100 bg-blue-700/30 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            Verificado por COFEPRIS
          </span>
        </div>
      </motion.div>

      {/* Animated Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-neutral-200/50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Logo size="md" />
            </motion.div>

            <nav className="hidden lg:flex items-center gap-1">
              {[
                { href: '/ai-consulta', label: '5 Consultas GRATIS', icon: Sparkles },
                { href: '/doctors', label: 'Buscar doctores', icon: Search },
                { href: '/for-doctors', label: 'Para doctores', icon: UserPlus },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <motion.span
                    whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.08)' }}
                    className="text-sm font-medium text-text-secondary hover:text-primary-600 transition-colors px-4 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </motion.span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="ghost" className="text-sm font-medium text-text-secondary hover:text-primary-600 hidden sm:flex">
                    Iniciar sesión
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/register">
                <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.98 }}>
                  <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-sm font-bold shadow-lg shadow-blue-500/30 px-6 py-2.5">
                    Empezar GRATIS →
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Page Sections */}
      <HeroSection />
      <DrSimeonShowcase />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />

      {/* Trust & Credibility Signals */}
      <TrustFooter />

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <Logo size="md" variant="light" />
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                La plataforma de salud digital más confiable de México. Conectamos pacientes con los mejores especialistas certificados.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Pacientes</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><Link href="/doctors" className="hover:text-white transition-colors">Buscar doctores</Link></li>
                <li><Link href="/specialties" className="hover:text-white transition-colors">Especialidades</Link></li>
                <li><Link href="/app/second-opinion" className="hover:text-white transition-colors">Segunda opinión</Link></li>
                <li><Link href="/app" className="hover:text-white transition-colors">Mi cuenta</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Doctores</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><Link href="/for-doctors" className="hover:text-white transition-colors">Únete como doctor</Link></li>
                <li><Link href="/doctor" className="hover:text-white transition-colors">Portal de doctores</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Planes y precios</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-neutral-400 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Centro de ayuda</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} Doctor.mx. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
