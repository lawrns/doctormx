'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Badge as BadgeIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SymptomAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  placeholder?: string;
  className?: string;
}

// Common symptoms for intelligent suggestions
const commonSymptoms = [
  'Dolor de cabeza',
  'Dolor abdominal',
  'Dolor en el pecho',
  'Dolor de espalda',
  'Fiebre',
  'Escalofríos',
  'Náuseas',
  'Vómitos',
  'Mareos',
  'Fatiga',
  'Cansancio',
  'Tos',
  'Dolor de garganta',
  'Congestión nasal',
  'Dificultad para respirar',
  'Dolor muscular',
  'Dolor articular',
  'Erupción cutánea',
  'Picazón',
  'Hinchazón',
  'Pérdida de apetito',
  'Insomnio',
  'Ansiedad',
  'Palpitaciones',
];

export function SymptomAutocomplete({
  value,
  onChange,
  suggestions = commonSymptoms,
  placeholder = 'Escribe tus síntomas...',
  className,
}: SymptomAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState(value);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const onChangeRef = React.useRef(onChange);

  // Keep callback ref up to date
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Filter suggestions based on input
  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue.trim()) {
      return suggestions.slice(0, 6); // Show first 6 when no input
    }
    const searchLower = inputValue.toLowerCase();
    return suggestions.filter((s) =>
      s.toLowerCase().includes(searchLower)
    ).slice(0, 8);
  }, [inputValue, suggestions]);

  // Update parent value when tags or input change
  React.useEffect(() => {
    const fullValue = [...selectedTags, inputValue.trim()].filter(Boolean).join(', ');
    onChangeRef.current(fullValue);
  }, [selectedTags, inputValue]);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (!selectedTags.includes(suggestion)) {
      setSelectedTags([...selectedTags, suggestion]);
    }
    setInputValue('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!selectedTags.includes(inputValue.trim())) {
        setSelectedTags([...selectedTags, inputValue.trim()]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      setSelectedTags(selectedTags.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-3"
        >
          <AnimatePresence>
            {selectedTags.map((tag) => (
              <motion.div
                key={tag}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Badge
                  variant="secondary"
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 pr-2 cursor-pointer"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Input Field */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'transition-all',
            showSuggestions ? 'border-blue-500' : 'border-gray-200'
          )}
          role="combobox"
          aria-expanded={showSuggestions}
          aria-label="Seleccionar síntomas"
        />

        {/* Clear Button */}
        {inputValue && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => {
              setInputValue('');
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-4 h-4 text-gray-400" />
          </motion.button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto">
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                  {inputValue.trim() ? 'Sugerencias' : 'Síntomas comunes'}
                </p>
                {filteredSuggestions.map((suggestion, index) => {
                  const isSelected = selectedTags.includes(suggestion);
                  return (
                    <motion.button
                      key={suggestion}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      disabled={isSelected}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg text-sm',
                        'transition-colors flex items-center justify-between',
                        'hover:bg-blue-50',
                        isSelected
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <BadgeIcon className="w-3 h-3 text-gray-400" />
                        {suggestion}
                      </span>
                      {isSelected && (
                        <span className="text-xs text-gray-400">Añadido</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Presiona <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> para añadir síntoma
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character count hint */}
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>{selectedTags.length} síntoma(s) seleccionado(s)</span>
        {inputValue.length > 0 && (
          <span>Escribe y presiona Enter para añadir</span>
        )}
      </div>
    </div>
  );
}
