import Link from 'next/link'
import { ArrowLeft, User, FileText, Calendar } from 'lucide-react'

export default function ProfileLoadingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Back to Home */}
        <div className="mb-6">
          <Link href="/app" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al Inicio
          </Link>
        </div>

        {/* Loading State */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <User className="w-6 h-6 text-primary-500 animate-pulse" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-600">Cargando tu perfil...</p>
              </div>
            </div>
          </div>

          {/* Skeleton Form */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link href="/doctores" className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
            <Calendar className="w-5 h-5" />
            Buscar Doctores
          </Link>
          <Link href="/app/ai-consulta" className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <FileText className="w-5 h-5 text-gray-600" />
            Consulta IA
          </Link>
        </div>
      </div>
    </div>
  )
}
