'use client'

import { ErrorState } from '@/components/ErrorState'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <ErrorState
        icon={Search}
        title="Página no encontrada"
        description="No pudimos encontrar la página que estás buscando. Puede que haya sido movida o eliminada."
        action={{
          label: 'Volver al inicio',
          href: '/',
        }}
        showHome={false}
      />
    </div>
  )
}
