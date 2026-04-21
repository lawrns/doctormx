'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'

type FilterOption = {
  value: string
  label: string
}

const statusOptions: FilterOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'pending_payment', label: 'Pago pendiente' },
  { value: 'completed', label: 'Completadas' },
  { value: 'cancelled', label: 'Canceladas' },
]

const timeOptions: FilterOption[] = [
  { value: 'upcoming', label: 'Próximas' },
  { value: 'past', label: 'Pasadas' },
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'all', label: 'Todas' },
]

export function AppointmentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') || 'all'
  const currentTime = searchParams.get('time') || 'upcoming'
  const currentSearch = searchParams.get('search') || ''

  const [searchInput, setSearchInput] = useState(currentSearch)

  // Sync search input with URL params
  useEffect(() => {
    setSearchInput(currentSearch)
  }, [currentSearch])

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === '' || (key === 'status' && value === 'all') || (key === 'time' && value === 'upcoming')) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateFilter('search', searchInput)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, currentSearch, updateFilter])

  const clearSearch = () => {
    setSearchInput('')
    updateFilter('search', '')
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Search bar */}
      <div className="relative">
        <label htmlFor="search-filter" className="block text-sm font-medium text-muted-foreground mb-1">
          Buscar paciente
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            id="search-filter"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nombre del paciente..."
            className="block w-full pl-10 pr-10 py-2 border border-border rounded-lg focus:ring-ring focus:border-ring sm:text-sm"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-muted-foreground"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status and time filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="status-filter" className="block text-sm font-medium text-muted-foreground mb-1">
            Estado
          </label>
          <select
            id="status-filter"
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="block w-full rounded-lg border-border shadow-sm focus:border-ring focus:ring-ring sm:text-sm py-2"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="time-filter" className="block text-sm font-medium text-muted-foreground mb-1">
            Período
          </label>
          <select
            id="time-filter"
            value={currentTime}
            onChange={(e) => updateFilter('time', e.target.value)}
            className="block w-full rounded-lg border-border shadow-sm focus:border-ring focus:ring-ring sm:text-sm py-2"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters pills */}
      {(currentStatus !== 'all' || currentTime !== 'upcoming' || currentSearch) && (
        <div className="flex flex-wrap gap-2 pt-2">
          {currentSearch && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
              Búsqueda: {currentSearch}
              <button onClick={clearSearch} className="hover:text-primary">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          )}
          {currentStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-secondary text-foreground">
              {statusOptions.find(o => o.value === currentStatus)?.label}
              <button onClick={() => updateFilter('status', 'all')} className="hover:text-muted-foreground">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          )}
          {currentTime !== 'upcoming' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-secondary text-foreground">
              {timeOptions.find(o => o.value === currentTime)?.label}
              <button onClick={() => updateFilter('time', 'upcoming')} className="hover:text-muted-foreground">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          )}
          <button
            onClick={() => {
              clearSearch()
              updateFilter('status', 'all')
              updateFilter('time', 'upcoming')
            }}
            className="text-sm text-primary hover:text-primary font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )
}
