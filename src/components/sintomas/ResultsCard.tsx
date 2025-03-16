import { FC } from 'react';
import { 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConditionInfo {
  name: string;
  probability: 'alta' | 'media' | 'baja';
  description: string;
  moreInfo?: string;
}

interface AnalysisResult {
  severityLevel: 'low' | 'moderate' | 'high';
  urgency: 'routine' | 'soon' | 'urgent';
  possibleConditions: ConditionInfo[];
  recommendedSpecialties: string[];
  recommendedTests: string[];
  selfCareRecommendations: string[];
}

interface ResultsCardProps {
  analysis: AnalysisResult;
}

const ResultsCard: FC<ResultsCardProps> = ({ analysis }) => {
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);

  const toggleCondition = (conditionName: string) => {
    if (expandedCondition === conditionName) {
      setExpandedCondition(null);
    } else {
      setExpandedCondition(conditionName);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600';
      case 'moderate':
        return 'text-amber-500';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-blue-600';
    }
  };

  const getSeverityBgColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100';
      case 'moderate':
        return 'bg-amber-100';
      case 'low':
        return 'bg-green-100';
      default:
        return 'bg-blue-100';
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

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
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

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'alta':
        return 'text-red-600 bg-red-50';
      case 'media':
        return 'text-amber-600 bg-amber-50';
      case 'baja':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Resultados del Análisis</h2>
      
      {/* Severity and Urgency */}
      <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="flex-1 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-full ${getSeverityBgColor(analysis.severityLevel)} flex items-center justify-center mr-3`}>
              <AlertTriangle className={`h-5 w-5 ${getSeverityColor(analysis.severityLevel)}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Nivel de severidad</p>
              <p className={`font-semibold ${getSeverityColor(analysis.severityLevel)}`}>
                {getSeverityLabel(analysis.severityLevel)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {analysis.severityLevel === 'high' 
              ? 'Tus síntomas indican una condición que requiere atención médica prioritaria.' 
              : analysis.severityLevel === 'moderate'
              ? 'Tus síntomas sugieren una condición que debería ser evaluada por un médico.' 
              : 'Tus síntomas indican una condición que probablemente puede tratarse con cuidados en casa.'}
          </p>
        </div>
        
        <div className="flex-1 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className={`w-10 h-10 rounded-full ${getSeverityBgColor(analysis.urgency)} flex items-center justify-center mr-3`}>
              <Info className={`h-5 w-5 ${getSeverityColor(analysis.urgency)}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Atención recomendada</p>
              <p className={`font-semibold ${getSeverityColor(analysis.urgency)}`}>
                {getUrgencyLabel(analysis.urgency)}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {analysis.urgency === 'urgent' 
              ? 'Se recomienda buscar atención médica en los próximos 1-2 días.' 
              : analysis.urgency === 'soon'
              ? 'Se sugiere programar una consulta médica en la próxima semana.' 
              : 'Puedes agendar una consulta médica cuando te sea conveniente.'}
          </p>
        </div>
      </div>
      
      {/* Possible Conditions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Posibles Condiciones</h3>
        <div className="space-y-3">
          {analysis.possibleConditions.map((condition, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <div 
                className="p-4 bg-white cursor-pointer flex justify-between items-center"
                onClick={() => toggleCondition(condition.name)}
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 mr-3">{condition.name}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getProbabilityColor(condition.probability)}`}>
                    Probabilidad {condition.probability}
                  </span>
                </div>
                {expandedCondition === condition.name ? 
                  <ChevronUp size={20} className="text-gray-500" /> :
                  <ChevronDown size={20} className="text-gray-500" />
                }
              </div>
              
              <AnimatePresence>
                {expandedCondition === condition.name && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-4 bg-gray-50">
                      <p className="text-gray-700 mb-3">{condition.description}</p>
                      {condition.moreInfo && (
                        <a 
                          href="#" 
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          onClick={(e) => {
                            e.preventDefault();
                            // In a real app, this would link to a detail page
                            console.log(`View more info about ${condition.name}`);
                          }}
                        >
                          Más información <ExternalLink size={14} className="ml-1" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Nota: Este análisis no es un diagnóstico. Solo un médico puede proporcionar un diagnóstico preciso.
        </p>
      </div>
      
      {/* Recommended Specialties */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Especialidades Recomendadas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {analysis.recommendedSpecialties.map((specialty, index) => (
            <div 
              key={index}
              className="bg-blue-50 rounded-lg p-3 flex justify-between items-center"
            >
              <span className="text-blue-800">{specialty}</span>
              <ArrowRight size={16} className="text-blue-600" />
            </div>
          ))}
        </div>
      </div>
      
      {/* Recommended Tests */}
      {analysis.recommendedTests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exámenes Sugeridos</h3>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.recommendedTests.map((test, index) => (
              <li key={index} className="text-gray-700">{test}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 mt-3">
            Estos exámenes podrían ser solicitados por tu médico para ayudar en el diagnóstico.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResultsCard;