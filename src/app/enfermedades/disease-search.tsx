'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Search, X, ArrowRight } from 'lucide-react'

interface Disease {
  id: string
  name: string
  slug: string
  description: string | null
  symptoms: string[] | null
}

interface DiseaseSearchProps {
  diseases: Disease[]
}

export function DiseaseSearch({ diseases }: DiseaseSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Disease[]>([])
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
    const filtered = diseases.filter(
      (d) =>
        d.name.toLowerCase().includes(value.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(value.toLowerCase()))
    )
    setResults(filtered.slice(0, 8))
    setIsOpen(filtered.length > 0)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Buscar enfermedad o condicion..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent shadow-sm text-base"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-secondary hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
          {results.map((disease) => (
            <Link
              key={disease.id}
              href={`/enfermedades/${disease.slug}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-primary/10 transition-colors border-b border-border last:border-0"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">{disease.name}</p>
                {disease.description && (
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {disease.description}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
