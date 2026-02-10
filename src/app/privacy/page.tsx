'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Shield, Lock, FileText } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Política de Privacidad
            </h1>
            <p className="text-gray-600">
              Última actualización: Enero 2026
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu privacidad es nuestra prioridad</h3>
                  <p className="text-gray-600 text-sm">
                    En Doctor.mx nos comprometemos a proteger tu información personal y médica 
                    con los más altos estándares de seguridad.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Información que Recopilamos</h2>
            <p className="text-gray-600 mb-4">
              Recopilamos información que nos proporcionas directamente, incluyendo:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Información de cuenta (nombre, correo electrónico, teléfono)</li>
              <li>Información de perfil médico (historial, alergias, medicamentos)</li>
              <li>Datos de consultas y citas médicas</li>
              <li>Información de pago (procesada de forma segura por terceros)</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Uso de la Información</h2>
            <p className="text-gray-600 mb-4">
              Utilizamos tu información para:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Facilitar la conexión entre pacientes y doctores</li>
              <li>Proporcionar servicios de telemedicina</li>
              <li>Enviar recordatorios de citas y seguimientos</li>
              <li>Mejorar nuestros servicios y experiencia de usuario</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Protección de Datos Médicos</h2>
            <p className="text-gray-600 mb-4">
              Tu información médica está protegida por:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Encriptación de extremo a extremo (AES-256)</li>
              <li>Cumplimiento con la Ley Federal de Protección de Datos Personales</li>
              <li>Servidores seguros con certificación SOC 2</li>
              <li>Acceso restringido solo a personal autorizado</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Compartir Información</h2>
            <p className="text-gray-600 mb-6">
              No vendemos tu información personal. Solo compartimos datos con:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Los doctores que elijas para tu atención médica</li>
              <li>Proveedores de servicios esenciales (pagos, comunicaciones)</li>
              <li>Autoridades cuando sea legalmente requerido</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Tus Derechos</h2>
            <p className="text-gray-600 mb-4">
              Tienes derecho a:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Acceder a tu información personal</li>
              <li>Rectificar datos incorrectos</li>
              <li>Solicitar la eliminación de tus datos</li>
              <li>Oponerte al procesamiento de tus datos</li>
              <li>Portabilidad de tus datos</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Contacto</h2>
            <p className="text-gray-600 mb-6">
              Para ejercer tus derechos o consultas sobre privacidad, contacta a nuestro 
              Oficial de Protección de Datos en: <a href="mailto:privacidad@doctormx.com" className="text-blue-600 hover:underline">privacidad@doctormx.com</a>
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mt-8">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Documentos relacionados</span>
              </div>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-blue-600 hover:underline text-sm">Términos y Condiciones</a>
                </li>
                <li>
                  <a href="/cookies" className="text-blue-600 hover:underline text-sm">Política de Cookies</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
