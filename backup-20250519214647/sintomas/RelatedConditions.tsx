import React, { useState } from 'react';
import { ExternalLink, AlertTriangle, ChevronDown, ChevronUp, Info, Shield } from 'lucide-react';

interface Condition {
  id: string;
  name: string;
  description: string;
  probability: 'high' | 'medium' | 'low';
  matchScore?: number; // percentage match
  symptoms?: string[];
  urgencyLevel?: 'routine' | 'soon' | 'urgent' | 'emergency';
  moreInfoUrl?: string;
  medicalSpecialties?: string[];
}

interface RelatedConditionsProps {
  conditions: Condition[];
  onSelectCondition?: (condition: Condition) => void;
  showDisclaimer?: boolean;
}

const RelatedConditions: React.FC<RelatedConditionsProps> = ({
  conditions,
  onSelectCondition,
  showDisclaimer = true
}) => {
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);

  const toggleExpandCondition = (conditionId: string) => {
    if (expandedCondition === conditionId) {
      setExpandedCondition(null);
    } else {
      setExpandedCondition(conditionId);
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProbabilityLabel = (probability: string) => {
    switch (probability) {
      case 'high':
        return 'Alta coincidencia';
      case 'medium':
        return 'Coincidencia moderada';
      case 'low':
        return 'Baja coincidencia';
      default:
        return 'Indeterminado';
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'emergency':
        return 'text-red-600';
      case 'urgent':
        return 'text-amber-600';
      case 'soon':
        return 'text-blue-600';
      case 'routine':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getUrgencyLabel = (urgency?: string) => {
    switch (urgency) {
      case 'emergency':
        return 'Atención inmediata';
      case 'urgent':
        return 'Urgente (1-2 días)';
      case 'soon':
        return 'Pronto (1 semana)';
      case 'routine':
        return 'Rutina';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Posibles Condiciones</h3>
      
      {conditions.length > 0 ? (
        <div className="space-y-4">
          {conditions.map((condition) => (
            <div 
              key={condition.id} 
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div
                className="bg-white p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpandCondition(condition.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{condition.name}</h4>
                    
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getProbabilityColor(condition.probability)}`}>
                        {getProbabilityLabel(condition.probability)}
                      </span>
                      
                      {condition.matchScore && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {condition.matchScore}% match
                        </span>
                      )}
                      
                      {condition.urgencyLevel && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 ${getUrgencyColor(condition.urgencyLevel)}`}>
                          {getUrgencyLabel(condition.urgencyLevel)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {expandedCondition === condition.id ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {expandedCondition === condition.id && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 mb-3">{condition.description}</p>
                  
                  {condition.symptoms && condition.symptoms.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Síntomas comunes:</h5>
                      <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                        {condition.symptoms.slice(0, 5).map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                        {condition.symptoms.length > 5 && (
                          <li className="text-gray-500">Y otros síntomas...</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  {condition.medicalSpecialties && condition.medicalSpecialties.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-1">Especialidades médicas relacionadas:</h5>
                      <div className="flex flex-wrap gap-1">
                        {condition.medicalSpecialties.map((specialty, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex mt-3 justify-between items-center">
                    {condition.urgencyLevel === 'emergency' && (
                      <div className="text-sm flex items-center text-red-600">
                        <AlertTriangle size={16} className="mr-1" />
                        Busque atención médica inmediata
                      </div>
                    )}
                    
                    <div className="flex justify-end flex-1">
                      {condition.moreInfoUrl && (
                        <a
                          href={condition.moreInfoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex items-center text-blue-600 hover:text-blue-800 mr-4"
                        >
                          Más información <ExternalLink size={14} className="ml-1" />
                        </a>
                      )}
                      
                      {onSelectCondition && (
                        <button
                          onClick={() => onSelectCondition(condition)}
                          className="text-sm flex items-center text-blue-600 hover:text-blue-800"
                        >
                          Ver detalles
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          No se encontraron condiciones relacionadas con los síntomas proporcionados.
        </div>
      )}
      
      {showDisclaimer && (
        <div className="mt-4 flex items-start bg-amber-50 rounded-lg p-4 text-amber-800 text-sm">
          <Shield className="flex-shrink-0 h-5 w-5 text-amber-500 mt-0.5 mr-2" />
          <p>
            Este análisis no constituye un diagnóstico médico. Las condiciones listadas son posibilidades basadas en los síntomas reportados. 
            Siempre consulte con un profesional de la salud para un diagnóstico apropiado.
          </p>
        </div>
      )}
    </div>
  );
};

export default RelatedConditions;