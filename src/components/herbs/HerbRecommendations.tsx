/**
 * HerbRecommendations - Display herb recommendations within AI doctor chat
 */

import React, { useState } from 'react';
import { Leaf, Star, AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { Herb } from '@pkg/types';
import HerbCard from './HerbCard';

interface HerbRecommendationsProps {
  recommendations: {
    primary: Herb[];
    secondary: Herb[];
    cautions: string[];
  };
  onHerbSelect?: (herb: Herb) => void;
  className?: string;
}

export default function HerbRecommendations({ 
  recommendations, 
  onHerbSelect,
  className = '' 
}: HerbRecommendationsProps) {
  const [showSecondary, setShowSecondary] = useState(false);
  const [showCautions, setShowCautions] = useState(false);
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);

  const { primary, secondary, cautions } = recommendations;

  if (primary.length === 0 && secondary.length === 0) {
    return null;
  }

  const handleHerbClick = (herb: Herb) => {
    setSelectedHerb(herb);
    onHerbSelect?.(herb);
  };

  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Leaf className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-800">
          Medicina Tradicional Mexicana
        </h3>
      </div>

      {/* Primary Recommendations */}
      {primary.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <h4 className="font-medium text-gray-900">
              Remedios Principales (Con evidencia científica)
            </h4>
          </div>
          
          <div className="grid gap-3">
            {primary.map((herb) => (
              <HerbCard 
                key={herb.id} 
                herb={herb} 
                compact 
                onLearnMore={handleHerbClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Secondary Recommendations */}
      {secondary.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center gap-2 mb-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            {showSecondary ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span className="font-medium">
              Remedios Complementarios ({secondary.length})
            </span>
          </button>

          {showSecondary && (
            <div className="grid gap-3">
              {secondary.map((herb) => (
                <HerbCard 
                  key={herb.id} 
                  herb={herb} 
                  compact 
                  onLearnMore={handleHerbClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cautions */}
      {cautions.length > 0 && (
        <div>
          <button
            onClick={() => setShowCautions(!showCautions)}
            className="flex items-center gap-2 mb-2 text-amber-700 hover:text-amber-900 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">
              Precauciones Importantes
            </span>
            {showCautions ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showCautions && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <ul className="space-y-1 text-sm text-amber-800">
                {cautions.map((caution, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{caution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Important Notice */}
      <div className="mt-4 pt-3 border-t border-green-200">
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong>Importante:</strong> Estas recomendaciones son orientativas basadas en medicina tradicional mexicana. 
            Consulta con un profesional de la salud antes de usar cualquier remedio herbal, especialmente si tomas medicamentos 
            o tienes condiciones médicas preexistentes.
          </p>
        </div>
      </div>

      {/* Herb Detail Modal */}
      {selectedHerb && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Detalles del Remedio</h3>
              <button
                onClick={() => setSelectedHerb(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <HerbCard herb={selectedHerb} showEvidence />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}