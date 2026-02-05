'use client'

import Link from 'next/link'
import { CheckCircle, X } from 'lucide-react'

export default function OnboardingChecklist({ completeness, doctorId, doctor }: {
  completeness: { completed: number; total: number; missing: string[] }
  doctorId: string
  doctor: any
}) {
  const handleDismiss = () => {
    localStorage.setItem('doctor-onboarding-dismissed', 'true')
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configura tu perfil para recibir pacientes</h3>
          <p className="text-sm text-gray-600 mt-1">{completeness.completed} de {completeness.total} pasos completados</p>
        </div>
        <div className="text-right">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-1">
            <span className="text-2xl font-bold text-blue-600">{Math.round((completeness.completed / completeness.total) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${(completeness.completed / completeness.total) * 100}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Crear cuenta</span>
          <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓</span>
        </div>
        <div className="flex items-center gap-3 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Verificar cédula profesional</span>
          <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">✓</span>
        </div>

        {completeness.missing.includes('biografía detallada') && (
          <Link href="/doctor/profile" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-white transition-colors">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
            <span className="text-sm flex-1">Completar perfil</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-auto">Pendiente</span>
          </Link>
        )}

        {completeness.missing.includes('disponibilidad') && (
          <Link href="/doctor/availability" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-white transition-colors">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
            <span className="text-sm flex-1">Configurar disponibilidad</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-auto">Pendiente</span>
          </Link>
        )}

        {(completeness.missing.includes('cédula') || completeness.missing.includes('nombre') || completeness.missing.includes('precio de consulta')) && (
          <Link href="/doctor/onboarding" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 p-2 rounded-lg hover:bg-white transition-colors">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
            <span className="text-sm flex-1">Completar información requerida</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-auto">Pendiente</span>
          </Link>
        )}
      </div>
    </div>
  )
}
