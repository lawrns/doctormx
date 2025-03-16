import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, X } from 'lucide-react';

type Location = {
  id: string;
  name: string;
};

type LocationDropdownProps = {
  locations: Location[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

function LocationDropdown({
  locations,
  value,
  onChange,
  placeholder = "Selecciona una ubicación",
  className = ''
}: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(locations);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filter locations based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = locations.filter(location => 
        location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }, [searchTerm, locations]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };
  
  const handleLocationSelect = (location: Location) => {
    onChange(location.name);
    setSearchTerm('');
    setIsOpen(false);
  };
  
  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin size={20} className="text-gray-400" />
        </div>
        
        <input
          type="text"
          className="input-field pl-10 pr-10 py-3 w-full text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          placeholder={placeholder}
          value={searchTerm || value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="location-dropdown"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {(searchTerm || value) && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear input"
            >
              <X size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={toggleDropdown}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label={isOpen ? "Close dropdown" : "Open dropdown"}
          >
            <ChevronDown
              size={18}
              className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div
          id="location-dropdown"
          className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg max-h-80 overflow-y-auto border border-gray-200 animate-fade-in"
          role="listbox"
        >
          {filteredLocations.length > 0 ? (
            <ul className="py-2">
              {filteredLocations.map((location) => (
                <li
                  key={location.id}
                  onClick={() => handleLocationSelect(location)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center transition-colors"
                  role="option"
                  aria-selected={value === location.name}
                >
                  <MapPin size={18} className="text-gray-400 mr-3" />
                  <span className="text-gray-900">{location.name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              No se encontraron ubicaciones
            </div>
          )}
          
          <div className="border-t border-gray-200 p-2 flex justify-between items-center">
            <button
              onClick={() => setIsOpen(false)}
              className="text-center text-blue-600 hover:text-blue-800 py-2 px-4 font-medium"
            >
              Ver más
            </button>
            <div className="text-xs text-gray-400 pr-2">
              powered by Google
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationDropdown;