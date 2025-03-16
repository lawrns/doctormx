import { X } from 'lucide-react';

type Filter = {
  id: string;
  label: string;
  value: string;
};

type FilterChipsProps = {
  filters: Filter[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
};

function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  if (filters.length === 0) return null;
  
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center">
        {filters.map((filter) => (
          <div key={filter.id} className="filter-chip filter-chip-active mr-2 mb-2">
            <span className="mr-1">{filter.label}:</span>
            <span className="font-medium">{filter.value}</span>
            <button
              onClick={() => onRemove(filter.id)}
              className="ml-1 text-blue-800 hover:text-blue-900"
              aria-label={`Eliminar filtro ${filter.label}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {filters.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-sm text-blue-600 hover:text-blue-800 mb-2"
          >
            Limpiar todos
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterChips;