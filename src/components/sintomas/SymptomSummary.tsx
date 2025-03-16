import { AlertTriangle, Clock, Calendar, Heart, Activity, Shield } from 'lucide-react';

interface SymptomSummaryProps {
  symptomName: string;
  bodyRegion?: string;
  severity: 'low' | 'moderate' | 'high';
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  duration?: string;
  frequency?: string;
  evaluationDate: Date;
  possibleConditions?: Array<{
    name: string;
    probability: 'alta' | 'media' | 'baja';
  }>;
  recommendedSpecialties?: string[];
  compact?: boolean;
}

const SymptomSummary: React.FC<SymptomSummaryProps> = ({
  symptomName,
  bodyRegion,
  severity,
  urgency,
  duration,
  frequency,
  evaluationDate,
  possibleConditions,
  recommendedSpecialties,
  compact = false
}) => {
  
  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'emergency':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'urgent':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'soon':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'routine':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityLabel = (level: string) => {
    switch (level) {
      case 'high':
        return 'Alta';
      case 'moderate':
        return 'Moderada';
      case 'low':
        return 'Baja';
      default:
        return 'Indeterminada';
    }
  };

  const getUrgencyLabel = (level: string) => {
    switch (level) {
      case 'emergency':
        return 'Emergencia (inmediata)';
      case 'urgent':
        return 'Urgente (1-2 días)';
      case 'soon':
        return 'Pronto (1 semana)';
      case 'routine':
        return 'Rutina (cuando sea conveniente)';
      default:
        return 'Indeterminada';
    }
  };

  const getUrgencyDescription = (level: string) => {
    switch (level) {
      case 'emergency':
        return 'Busque atención médica inmediatamente o llame a emergencias.';
      case 'urgent':
        return 'Consulte a un médico en las próximas 24-48 horas.';
      case 'soon':
        return 'Agende una consulta en la próxima semana.';
      case 'routine':
        return 'Agende una consulta cuando le sea conveniente.';
      default:
        return 'Consulte con un profesional médico para recibir orientación.';
    }
  };

  // Compact view for showing on dashboard or results preview
  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-medium text-gray-900">{symptomName}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>
              {getSeverityLabel(severity)}
            </span>
          </div>
          
          <div className="mb-2">
            <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${getUrgencyColor(urgency)}`}>
              <AlertTriangle size={14} className="mr-1" />
              {getUrgencyLabel(urgency)}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 flex items-center mb-3">
            <Calendar size={14} className="mr-1" />
            Evaluado: {evaluationDate.toLocaleDateString()}
          </div>
          
          {possibleConditions && possibleConditions.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Posibles condiciones:</p>
              <div className="flex flex-wrap gap-1">
                {possibleConditions.slice(0, 2).map((condition, index) => (
                  <span 
                    key={index} 
                    className="inline-block text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700"
                  >
                    {condition.name}
                  </span>
                ))}
                {possibleConditions.length > 2 && (
                  <span className="inline-block text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                    +{possibleConditions.length - 2} más
                  </span>
                )}
              </div>
            </div>
          )}
          
          {recommendedSpecialties && recommendedSpecialties.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Especialidades recomendadas:</p>
              <div className="flex flex-wrap gap-1">
                {recommendedSpecialties.map((specialty, index) => (
                  <span 
                    key={index} 
                    className="inline-block text-xs px-2 py-1 rounded-md bg-blue-100 text-blue-700"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full view for detailed results page
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Resumen de la Evaluación</h3>
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar size={14} className="mr-1" />
            {evaluationDate.toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Symptom Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Activity size={18} className="mr-2 text-blue-600" />
              Información del Síntoma
            </h4>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Síntoma principal</p>
                <p className="font-medium text-gray-900">{symptomName}</p>
              </div>
              
              {bodyRegion && (
                <div>
                  <p className="text-sm text-gray-500">Región del cuerpo</p>
                  <p className="font-medium text-gray-900">{bodyRegion}</p>
                </div>
              )}
              
              {duration && (
                <div>
                  <p className="text-sm text-gray-500">Duración</p>
                  <p className="font-medium text-gray-900">{duration}</p>
                </div>
              )}
              
              {frequency && (
                <div>
                  <p className="text-sm text-gray-500">Frecuencia</p>
                  <p className="font-medium text-gray-900">{frequency}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Nivel de severidad</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getSeverityColor(severity)}`}>
                  {getSeverityLabel(severity)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Recommendations */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Shield size={18} className="mr-2 text-blue-600" />
              Recomendaciones de Acción
            </h4>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Nivel de atención requerida</p>
              <div className={`rounded-lg p-3 ${getUrgencyColor(urgency)}`}>
                <div className="font-medium mb-1 flex items-center">
                  <AlertTriangle size={16} className="mr-1" />
                  {getUrgencyLabel(urgency)}
                </div>
                <p className="text-sm">{getUrgencyDescription(urgency)}</p>
              </div>
            </div>
            
            {recommendedSpecialties && recommendedSpecialties.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Especialidades recomendadas</p>
                <div className="flex flex-wrap gap-2">
                  {recommendedSpecialties.map((specialty, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-100 text-blue-700"
                    >
                      <Heart size={14} className="mr-1" />
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Possible Conditions */}
        {possibleConditions && possibleConditions.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Posibles Condiciones</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {possibleConditions.map((condition, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg p-3 hover:border-blue-200 transition"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-medium text-gray-900">{condition.name}</h5>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                      condition.probability === 'alta' 
                        ? 'bg-red-100 text-red-800' 
                        : condition.probability === 'media'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      Probabilidad {condition.probability}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-500 flex items-center">
              <Clock size={14} className="mr-1" />
              Esta información es orientativa y no constituye un diagnóstico médico.
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-md">
          <div className="flex">
            <Shield className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h5 className="text-blue-800 font-medium">Importante</h5>
              <p className="text-blue-700 text-sm mt-1">
                Esta evaluación es orientativa y no reemplaza la consulta con un profesional médico. 
                Si sus síntomas empeoran o no mejoran según lo esperado, busque atención médica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomSummary;