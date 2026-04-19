'use client'

import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg border bg-gray-100 flex items-center justify-center">
      <div className="text-gray-500">Cargando mapa...</div>
    </div>
  ),
})

export default MapView
