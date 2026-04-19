'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapDoctor {
  id: string
  name: string
  specialty: string
  lat: number
  lng: number
  price: number
  rating: number
  slug?: string
}

interface MapViewProps {
  doctors: MapDoctor[]
  center?: [number, number]
  zoom?: number
  onMarkerClick?: (doctorId: string) => void
}

export default function MapView({
  doctors,
  center = [19.4326, -99.1332],
  zoom = 12,
  onMarkerClick,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current).setView(center, zoom)
    mapInstanceRef.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const markers: L.Marker[] = []

    doctors.forEach((doctor) => {
      if (!doctor.lat || !doctor.lng) return

      const marker = L.marker([doctor.lat, doctor.lng]).addTo(map)
      marker.bindPopup(`
        <div style="min-width: 200px">
          <strong style="font-size: 14px">${doctor.name}</strong>
          <div style="color: #666; font-size: 12px; margin-top: 4px">${doctor.specialty}</div>
          <div style="margin-top: 6px; display: flex; gap: 8px; align-items: center">
            <span style="color: #f59e0b">${'★'.repeat(Math.round(doctor.rating))}</span>
            <span style="font-size: 12px; color: #666">$${doctor.price} MXN</span>
          </div>
        </div>
      `)

      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(doctor.id))
      }

      markers.push(marker)
    })

    if (markers.length > 0) {
      const group = L.featureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1))
    }

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [doctors, center, zoom, onMarkerClick])

  return <div ref={mapRef} className="w-full h-[500px] rounded-lg border" />
}
