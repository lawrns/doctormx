'use client'

import Link from 'next/link'
import { Calendar, Plus } from 'lucide-react'

export default function ImprovedEmptyState({ doctorId, doctor }: { doctorId: string; doctor: any }) {
  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(`https://doctor.mx/doctors/${doctorId}`)
    // Could add toast notification here
  }

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
        <Calendar className="w-10 h-10 text-blue-400" />
        <Plus className="w-6 h-6 text-blue-300 absolute -bottom-1 -right-1" />
      </div>
      <h4 className="text-lg font-semibold text-gray-800 mb-2">No tienes consultas programadas</h4>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Completa tu perfil y comparte tu enlace para que los pacientes te encuentren
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/doctor/profile"
          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
        >
          Completar mi perfil →
        </Link>
        <button
          onClick={handleCopyProfileLink}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Copiar enlace de mi perfil
        </button>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        💡 Consejo: Comparte tu enlace en WhatsApp y redes sociales para recibir tus primeros pacientes
      </p>
    </div>
  )
}
