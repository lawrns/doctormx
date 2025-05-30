/**
 * HerbCard - Display individual herb information with Mexican context
 */

import React from 'react';
import { Leaf, AlertTriangle, Star, MapPin, Calendar } from 'lucide-react';
import type { Herb } from '@pkg/types';

interface HerbCardProps {
  herb: Herb;
  onLearnMore?: (herb: Herb) => void;
  compact?: boolean;
  showEvidence?: boolean;
}

export default function HerbCard({ 
  herb, 
  onLearnMore, 
  compact = false, 
  showEvidence = true 
}: HerbCardProps) {
  const getEvidenceColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEvidenceLabel = (grade: string) => {
    switch (grade) {
      case 'A': return 'Evidencia Fuerte';
      case 'B': return 'Evidencia Moderada';
      case 'C': return 'Evidencia Limitada';
      case 'D': return 'Evidencia Mínima';
      default: return 'Sin Clasificar';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'common': return '🌿';
      case 'seasonal': return '🍂';
      case 'rare': return '🌺';
      default: return '🌱';
    }
  };

  const primaryName = herb.commonNames[0] || herb.latinName;
  const secondaryNames = herb.commonNames.slice(1);

  if (compact) {
    return (
      <div className="bg-white border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-gray-900">{primaryName}</h4>
            </div>
            <p className="text-sm text-gray-600 italic mt-1">{herb.latinName}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {herb.traditionalUses.slice(0, 2).map((use, index) => (
                <span 
                  key={index}
                  className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
                >
                  {use}
                </span>
              ))}
            </div>
          </div>
          
          {showEvidence && (
            <div className={`text-xs px-2 py-1 rounded border ${getEvidenceColor(herb.evidence_grade)}`}>
              {herb.evidence_grade}
            </div>
          )}
        </div>

        {herb.contraindications.length > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
            <AlertTriangle className="w-3 h-3" />
            <span>Precauciones</span>
          </div>
        )}

        {onLearnMore && (
          <button
            onClick={() => onLearnMore(herb)}
            className="text-xs text-green-600 hover:text-green-700 mt-2 underline"
          >
            Más información
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">{primaryName}</h3>
            </div>
            
            <p className="text-sm text-gray-600 italic mb-2">{herb.latinName}</p>
            
            {secondaryNames.length > 0 && (
              <p className="text-sm text-gray-500">
                También conocida como: {secondaryNames.join(', ')}
              </p>
            )}
          </div>

          {showEvidence && (
            <div className="flex flex-col items-end gap-2">
              <div className={`text-sm px-3 py-1 rounded-full border ${getEvidenceColor(herb.evidence_grade)}`}>
                {getEvidenceLabel(herb.evidence_grade)}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{herb.sourcing.nativeRegion?.[0] || 'México'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Traditional Uses */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" />
            Usos Tradicionales
          </h4>
          <div className="flex flex-wrap gap-2">
            {herb.traditionalUses.map((use, index) => (
              <span 
                key={index}
                className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm border border-green-200"
              >
                {use}
              </span>
            ))}
          </div>
        </div>

        {/* Active Compounds */}
        {herb.activeCompounds.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Compuestos Activos</h4>
            <p className="text-sm text-gray-600">
              {herb.activeCompounds.join(', ')}
            </p>
          </div>
        )}

        {/* Preparation */}
        {herb.preparation.forms && herb.preparation.forms.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Formas de Preparación</h4>
            <div className="flex flex-wrap gap-2">
              {herb.preparation.forms.map((form, index) => (
                <span 
                  key={index}
                  className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
                >
                  {form}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getAvailabilityIcon(herb.sourcing.availability)}</span>
            <span className="text-gray-600 capitalize">
              Disponibilidad: {herb.sourcing.availability}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Todo el año</span>
          </div>
        </div>

        {/* Contraindications Warning */}
        {herb.contraindications.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-medium text-amber-800 mb-1">Precauciones Importantes</h5>
                <ul className="text-sm text-amber-700 space-y-1">
                  {herb.contraindications.map((contraindication, index) => (
                    <li key={index}>• {contraindication}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {onLearnMore && (
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => onLearnMore(herb)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Ver Detalles Completos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}