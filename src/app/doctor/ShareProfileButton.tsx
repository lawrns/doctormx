'use client'

import { Link2 } from 'lucide-react'

export default function ShareProfileButton({ doctorId }: { doctorId: string }) {
  const handleShare = () => {
    navigator.clipboard.writeText(`https://doctor.mx/doctors/${doctorId}`)
    // Could add toast notification here
  }

  return (
    <button
      onClick={handleShare}
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all flex items-center gap-3 group"
    >
      <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
        <Link2 className="w-5 h-5 text-purple-600" />
      </div>
      <span className="text-sm font-medium text-gray-700">Compartir perfil</span>
    </button>
  )
}
