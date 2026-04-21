'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AvailabilityGridProps {
  doctorId: string
  price: string
}

export function AvailabilityGrid({ doctorId, price }: AvailabilityGridProps) {
  const router = useRouter()
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null)

  // Mock slots for the preview
  const days = [
    { day: 'Hoy', date: '17 Ene' },
    { day: 'Mañ', date: '18 Ene' },
    { day: 'Lun', date: '19 Ene' },
  ]

  const slots = ['09:00', '10:30', '14:00', '16:30']

  return (
    <div className="flex flex-col h-full bg-neutral-50/50 rounded-2xl p-4 border border-neutral-100">
      <div className="flex items-center gap-2 mb-4 text-neutral-900 font-semibold text-sm">
        <Calendar className="w-4 h-4 text-blue-600" />
        Próxima disponibilidad
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {days.map((d) => (
          <div key={d.date} className="text-center">
            <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">{d.day}</div>
            <div className="text-xs font-semibold text-neutral-700">{d.date}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="space-y-1.5">
            {slots.slice(0, 3).map((slot) => (
              <button
                key={`${dayIdx}-${slot}`}
                onClick={(e) => {
                  e.preventDefault()
                  router.push(`/book/${doctorId}?date=2026-01-${17 + dayIdx}&time=${slot}`)
                }}
                onMouseEnter={() => setHoveredSlot(`${dayIdx}-${slot}`)}
                onMouseLeave={() => setHoveredSlot(null)}
                className="w-full py-2 text-[11px] font-bold bg-white border border-neutral-200 rounded-lg text-neutral-600 hover:border-blue-600 hover:text-blue-600 hover:shadow-sm transition-all"
              >
                {slot}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <Button 
          onClick={(e) => {
            e.preventDefault()
            router.push(`/book/${doctorId}`)
          }}
          variant="outline" 
          className="w-full text-xs font-bold border-neutral-200 hover:bg-white group"
        >
          Ver todos los horarios
          <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </div>
  )
}
