'use client'

import dynamic from 'next/dynamic'

const MapView = dynamic(() => import('./MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-lg border bg-secondary flex items-center justify-center">
      <div className="text-muted-foreground">Cargando mapa...</div>
    </div>
  ),
})

export default MapView
