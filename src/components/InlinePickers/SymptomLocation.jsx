import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

export default function SymptomLocation({ onSelect, currentValue }) {
  const [inputValue, setInputValue] = useState(currentValue || '');
  const [predictions, setPredictions] = useState([]);
  const autocompleteRef = useRef(null);
  const predictionsRef = useRef(null);

  useEffect(() => {
    // Load Google Places Autocomplete
    if (window.google && window.google.maps && window.google.maps.places) {
      autocompleteRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length > 2 && autocompleteRef.current) {
      autocompleteRef.current.getPlacePredictions(
        {
          input: value,
          componentRestrictions: { country: 'mx' }, // Mexico only
          types: ['(cities)']
        },
        (predictions, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            setPredictions(predictions.slice(0, 5));
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  };

  const handleSelect = (prediction) => {
    setInputValue(prediction.description);
    setPredictions([]);
    onSelect(prediction.description);
  };

  return (
    <div className="w-full mt-3 relative">
      <p className="text-sm font-medium text-ink-secondary mb-2 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        ¿En qué ciudad estás?
      </p>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Ciudad de México, Guadalajara..."
          className="w-full px-4 py-2.5 border border-ink-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {predictions.length > 0 && (
          <div 
            ref={predictionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-ink-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {predictions.map((prediction) => (
              <button
                key={prediction.place_id}
                onClick={() => handleSelect(prediction)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-brand-50 transition-colors border-b border-ink-border last:border-b-0"
              >
                {prediction.description}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

