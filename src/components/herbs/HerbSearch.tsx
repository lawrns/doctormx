/**
 * HerbSearch - Search and filter herbs interface
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader, X } from 'lucide-react';
import { herbService } from '@svc/HerbService';
import type { Herb, HerbSearchFilters } from '@pkg/types';
import HerbCard from './HerbCard';

interface HerbSearchProps {
  onHerbSelect?: (herb: Herb) => void;
  initialQuery?: string;
  compact?: boolean;
}

export default function HerbSearch({ onHerbSelect, initialQuery = '', compact = false }: HerbSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<HerbSearchFilters>({});
  const [error, setError] = useState<string | null>(null);

  const evidenceOptions = [
    { value: 'A', label: 'Evidencia Fuerte', color: 'green' },
    { value: 'B', label: 'Evidencia Moderada', color: 'blue' },
    { value: 'C', label: 'Evidencia Limitada', color: 'yellow' },
    { value: 'D', label: 'Evidencia Mínima', color: 'gray' }
  ];

  const useOptions = [
    'dolor de cabeza', 'fiebre', 'digestivo', 'ansiedad', 'inflamación', 
    'tos', 'dolor muscular', 'insomnio', 'náuseas', 'fatiga'
  ];

  useEffect(() => {
    if (initialQuery) {
      searchHerbs();
    }
  }, [initialQuery]);

  const searchHerbs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const searchFilters: HerbSearchFilters = {
        query: query.trim(),
        ...filters
      };

      const result = await herbService.searchHerbs(searchFilters);
      setHerbs(result.herbs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar hierbas');
      setHerbs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchHerbs();
  };

  const handleFilterChange = (key: keyof HerbSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Auto-search when filters change
    setTimeout(() => {
      const searchFilters: HerbSearchFilters = {
        query: query.trim(),
        ...newFilters
      };
      
      setLoading(true);
      herbService.searchHerbs(searchFilters)
        .then(result => setHerbs(result.herbs))
        .catch(err => setError(err instanceof Error ? err.message : 'Error'))
        .finally(() => setLoading(false));
    }, 300);
  };

  const clearFilters = () => {
    setFilters({});
    setQuery('');
    setHerbs([]);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar hierbas medicinales... (ej: manzanilla, dolor de cabeza)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          {(Object.keys(filters).length > 0 || query) && (
            <button
              type="button"
              onClick={clearFilters}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </form>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          {/* Evidence Grade Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Evidencia Científica
            </label>
            <div className="flex flex-wrap gap-2">
              {evidenceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    const current = filters.evidenceGrade || [];
                    const newValue = current.includes(option.value as any)
                      ? current.filter(v => v !== option.value)
                      : [...current, option.value as any];
                    handleFilterChange('evidenceGrade', newValue);
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.evidenceGrade?.includes(option.value as any)
                      ? `bg-${option.color}-100 text-${option.color}-800 border-${option.color}-300`
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Uses Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usos Tradicionales
            </label>
            <div className="flex flex-wrap gap-2">
              {useOptions.map((use) => (
                <button
                  key={use}
                  onClick={() => {
                    const current = filters.uses || [];
                    const newValue = current.includes(use)
                      ? current.filter(u => u !== use)
                      : [...current, use];
                    handleFilterChange('uses', newValue);
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.uses?.includes(use)
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {use}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Buscando hierbas...</span>
          </div>
        )}

        {!loading && herbs.length === 0 && (query || Object.keys(filters).length > 0) && (
          <div className="text-center py-8 text-gray-500">
            <p>No se encontraron hierbas con los criterios de búsqueda.</p>
            <p className="text-sm mt-1">Intenta con términos más generales o ajusta los filtros.</p>
          </div>
        )}

        {!loading && herbs.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Se encontraron {herbs.length} hierbas medicinales
              </p>
            </div>

            <div className={compact ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
              {herbs.map((herb) => (
                <HerbCard
                  key={herb.id}
                  herb={herb}
                  compact={compact}
                  onLearnMore={onHerbSelect}
                />
              ))}
            </div>
          </>
        )}

        {!loading && herbs.length === 0 && !query && Object.keys(filters).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🌿</div>
            <p>Busca hierbas medicinales mexicanas</p>
            <p className="text-sm mt-1">Escribe el nombre de una hierba o el síntoma que quieres tratar</p>
          </div>
        )}
      </div>
    </div>
  );
}