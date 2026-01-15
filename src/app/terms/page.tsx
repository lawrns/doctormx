'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-gray-600">
              Última actualización: Enero 2026
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Aviso Importante</h3>
                  <p className="text-gray-600 text-sm">
                    Doctor.mx es una plataforma de telemedicina. Las consultas virtuales no sustituyen 
                    la atención médica presencial de emergencia. En caso de emergencia, llama al 911.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Aceptación de los Términos</h2>
            <p className="text-gray-600 mb-6">
              Al acceder y utilizar Doctor.mx, aceptas estos términos y condiciones en su totalidad. 
              Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Descripción del Servicio</h2>
            <p className="text-gray-600 mb-4">
              Doctor.mx proporciona:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Plataforma para conectar pacientes con médicos certificados</li>
              <li>Servicios de videoconsulta y chat médico</li>
              <li>Sistema de gestión de citas</li>
              <li>Asistente de IA para orientación médica (Dr. Simeon)</li>
              <li>Recetas digitales y seguimiento de tratamientos</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Elegibilidad</h2>
            <p className="text-gray-600 mb-6">
              Para usar Doctor.mx debes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Ser mayor de 18 años o contar con autorización de un tutor</li>
              <li>Proporcionar información veraz y actualizada</li>
              <li>Residir en México o tener acceso legal a servicios de salud mexicanos</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Uso del Servicio de IA (Dr. Simeon)</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-gray-600 text-sm">
                    Dr. Simeon es un asistente de inteligencia artificial diseñado para proporcionar 
                    orientación médica general. <strong>No es un sustituto de la consulta médica profesional.</strong> 
                    Siempre verifica cualquier recomendación con un médico certificado.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Responsabilidades del Usuario</h2>
            <p className="text-gray-600 mb-4">
              Como usuario, te comprometes a:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-6">
              <li>Proporcionar información médica precisa y completa</li>
              <li>No utilizar la plataforma para fines ilegales</li>
              <li>Mantener la confidencialidad de tu cuenta</li>
              <li>Respetar a los profesionales de salud en la plataforma</li>
              <li>No compartir recetas o recomendaciones médicas con terceros</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Pagos y Reembolsos</h2>
            <p className="text-gray-600 mb-6">
              Los pagos se procesan de forma segura. Las políticas de reembolso varían según el tipo 
              de servicio. Consultas canceladas con menos de 24 horas de anticipación pueden no ser 
              reembolsables.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Propiedad Intelectual</h2>
            <p className="text-gray-600 mb-6">
              Todo el contenido de Doctor.mx, incluyendo logos, textos, imágenes y software, 
              está protegido por derechos de autor y no puede ser reproducido sin autorización.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Limitación de Responsabilidad</h2>
            <p className="text-gray-600 mb-6">
              Doctor.mx actúa como intermediario entre pacientes y médicos. No somos responsables 
              por diagnósticos, tratamientos o resultados médicos. Los médicos en la plataforma 
              son profesionales independientes.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Modificaciones</h2>
            <p className="text-gray-600 mb-6">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. 
              Los cambios serán notificados a través de la plataforma.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Contacto</h2>
            <p className="text-gray-600 mb-6">
              Para preguntas sobre estos términos, contacta a: <a href="mailto:legal@doctor.mx" className="text-blue-600 hover:underline">legal@doctor.mx</a>
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mt-8">
              <p className="text-sm text-gray-500">
                Al usar Doctor.mx, confirmas que has leído, entendido y aceptado estos términos y condiciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
