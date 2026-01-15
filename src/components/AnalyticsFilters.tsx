'use client'

import { useState, useCallback } from 'react'
import { clsx } from 'clsx'

interface DateRange {
  start: Date
  end: Date
}

interface PresetRange {
  label: string
  value: string
  days: number
}

const PRESETS: PresetRange[] = [
  { label: 'Hoy', value: 'today', days: 1 },
  { label: 'Últimos 7 días', value: '7days', days: 7 },
  { label: 'Últimos 30 días', value: '30days', days: 30 },
  { label: 'Este mes', value: 'thisMonth', days: 0 },
  { label: 'Mes pasado', value: 'lastMonth', days: 0 },
  { label: 'Últimos 3 meses', value: '3months', days: 90 },
  { label: 'Últimos 6 meses', value: '6months', days: 180 },
  { label: 'Último año', value: '12months', days: 365 },
]

interface AnalyticsFiltersProps {
  onRangeChange?: (range: DateRange) => void
  onSpecialtyChange?: (specialty: string) => void
  onCityChange?: (city: string) => void
  specialties?: string[]
  cities?: string[]
  className?: string
}

export function AnalyticsFilters({
  onRangeChange,
  onSpecialtyChange,
  onCityChange,
  specialties = [],
  cities = [],
  className,
}: AnalyticsFiltersProps) {
  const [selectedPreset, setSelectedPreset] = useState('30days')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const handlePresetChange = useCallback((preset: string) => {
    setSelectedPreset(preset)
    const presetObj = PRESETS.find(p => p.value === preset)
    
    if (presetObj && presetObj.days > 0) {
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - presetObj.days)
      onRangeChange?.({ start, end })
    }
  }, [onRangeChange])

  const handleCustomRange = useCallback(() => {
    if (customStart && customEnd) {
      onRangeChange?.({
        start: new Date(customStart),
        end: new Date(customEnd),
      })
    }
  }, [customStart, customEnd, onRangeChange])

  return (
    <div className={clsx('bg-white rounded-xl border border-gray-200 p-4', className)}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Período:</span>
          <select
            value={selectedPreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        {(selectedPreset === 'custom' || PRESETS.find(p => p.value === selectedPreset)?.days === 0) && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <span className="text-gray-500">a</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={handleCustomRange}
              className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Aplicar
            </button>
          </div>
        )}

        {specialties.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Especialidad:</span>
            <select
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value)
                onSpecialtyChange?.(e.target.value)
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>
        )}

        {cities.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Ciudad:</span>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value)
                onCityChange?.(e.target.value)
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Todas</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

export function ExportButton({ onExport }: { onExport: () => void }) {
  return (
    <button
      onClick={onExport}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Exportar
    </button>
  )
}
