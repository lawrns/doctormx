'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 rounded focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2" aria-label="Doctor.mx - Inicio">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">Doctor.mx</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              La plataforma de salud digital más confiable de México.
            </p>
            <Link href="/contact" className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Contactar soporte
            </Link>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Para pacientes
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/doctors"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Buscar doctores
                </Link>
              </li>
              <li>
                <Link
                  href="/specialties"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Especialidades
                </Link>
              </li>
              <li>
                <Link
                  href="/app/second-opinion"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Segunda opinión
                </Link>
              </li>
              <li>
                <Link
                  href="/consulta-online"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Videoconsulta
                </Link>
              </li>
            </ul>
          </div>

          {/* For Doctors */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Para doctores
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/for-doctors"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Únete a Doctor.mx
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link
                  href="/for-doctors"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Reclama tu perfil
                </Link>
              </li>
              <li>
                <Link
                  href="/for-doctors"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Leads para doctores
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Compañía
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/for-doctors"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Para doctores
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Términos
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Doctor.mx. Todos los derechos
              reservados.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hecho con</span>
              <svg
                className="w-4 h-4 text-coral"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-muted-foreground">en México</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
