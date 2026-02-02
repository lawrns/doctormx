'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type SortBy = 'rating' | 'price' | 'experience'

interface SortSelectProps {
  defaultValue: SortBy
  currentParams: {
    specialty?: string
    search?: string
    sortOrder?: 'asc' | 'desc'
  }
}

export function SortSelect({ defaultValue, currentParams }: SortSelectProps) {
  const buildQueryString = (newParams: Record<string, string | undefined>) => {
    const searchParams = new URLSearchParams()
    if (currentParams.specialty) searchParams.set('specialty', currentParams.specialty)
    if (currentParams.search) searchParams.set('search', currentParams.search)
    if (currentParams.sortOrder) searchParams.set('sortOrder', currentParams.sortOrder)

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        searchParams.set(key, value)
      } else {
        searchParams.delete(key)
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `?${queryString}` : ''
  }

  return (
    <Select
      defaultValue={defaultValue}
      onValueChange={(value: SortBy) => {
        const url = `/doctors${buildQueryString({ sortBy: value })}`
        window.location.href = url
      }}
    >
      <SelectTrigger className="w-[160px]">
        <SelectValue placeholder="Ordenar por" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="rating">Calificación</SelectItem>
        <SelectItem value="price">Precio</SelectItem>
        <SelectItem value="experience">Experiencia</SelectItem>
      </SelectContent>
    </Select>
  )
}
