import React from 'react';
import { X } from './icons/IconProvider';

interface FilterChip {
  id: string;
  label: string;
  value: string;
}

interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onRemove,
  onClearAll,
  className = '',
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center flex-wrap gap-2">
        {filters.map((filter) => (
          <div
            key={`${filter.id}-${filter.value}`}
            className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm"
          >
            <span className="text-xs text-blue-500 font-medium mr-1">{filter.label}:</span>
            <span className="font-medium">{filter.value}</span>
            <button
              onClick={() => onRemove(filter.id)}
              className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`Eliminar filtro ${filter.label}: ${filter.value}`}
            >
              <X size={14} className="text-blue-500" />
            </button>
          </div>
        ))}
        
        <button
          onClick={onClearAll}
          className="text-sm text-gray-600 hover:text-blue-600 font-medium ml-2"
          aria-label="Limpiar todos los filtros"
        >
          Limpiar todos
        </button>
      </div>
    </div>
  );
};

export default FilterChips;