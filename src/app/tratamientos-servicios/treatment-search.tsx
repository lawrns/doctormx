'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, X, ArrowRight } from 'lucide-react'

interface Treatment {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
}

interface TreatmentSearchProps {
  treatments: Treatment[]
}

export function TreatmentSearch({ treatments }: TreatmentSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Treatment[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    const filtered = treatments.filter(
      (t) =>
        t.name.toLowerCase().includes(value.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(value.toLowerCase())) ||
        (t.category && t.category.toLowerCase().includes(value.toLowerCase()))
    )
    setResults(filtered.slice(0, 8))
    setIsOpen(filtered.length > 0)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Buscar tratamiento o servicio..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white border border-neutral-200 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-neutral-200 shadow-xl z-50 overflow-hidden">
          {results.map((treatment) => (
            <Link
              key={treatment.id}
              href={`/tratamientos-servicios/${treatment.slug}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50 transition-colors border-b border-neutral-50 last:border-0"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-neutral-900">
                  {treatment.name}
                </p>
                {treatment.category && (
                  <span className="text-xs text-blue-600 font-medium">
                    {treatment.category}
                  </span>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
