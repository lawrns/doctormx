import { useState, useEffect } from 'react';
import { 
  Thermometer, 
  AlertTriangle, 
  Clock, 
  BarChart, 
  Stethoscope, 
  UserRound, 
  ArrowRight,
  Info,
  Zap,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  Flame
} from 'lucide-react';

interface Condition {
  name: string;
  probability: 'alta' | 'media' | 'baja';
  description: string;
  color?: string;
}

interface ResultsData {
  id?: string;
  severity: 'low' | 'moderate' | 'high';
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  primarySymptom: {
    id: string;
    name: string;
    duration?: string;
    bodyRegion?: string;
  };
  possibleConditions: Condition[];
  recommendedSpecialties: string[];
  recommendedTests?: string[];
  selfCareRecommendations: string[];
  redFlags?: Array<{
    description: string;
    urgencyLevel: string;
    action: string;
  }>;
  importantNotes?: string[];
}

interface ResultsVisualizationProps {
  data: ResultsData;
  showButtons?: boolean;
  showDetails?: boolean;
  compactView?: boolean;
  onViewDoctors?: () => void;
  onBookTelemedicine?: () => void;
}

// Helper for generating a random ID if none is provided
const generateId = () => `result_${Math.random().toString(36).substring(2, 9)}`;

const ResultsVisualization: React.FC<ResultsVisualizationProps> = ({
  data,
  showButtons = true,
  showDetails = true,
  compactView = false,
  onViewDoctors,
  onBookTelemedicine
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'conditions' | 'recommendations'>('overview');
  const [resultId, setResultId] = useState<string>(data.id || generateId());

  useEffect(() => {
    if (!data.id) {
      setResultId(generateId());
    } else {
      setResultId(data.id);
    }
  }, [data.id]);

  // Functions to determine styling based on severity/urgency
  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600';
      case 'moderate':
        return 'text-amber-500';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityBg = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100';
      case 'moderate':
        return 'bg-amber-100';
      case 'low':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getSeverityBorder = (level: string) => {
    switch (level) {
      case 'high':
        return 'border-red-200';
      case 'moderate':
        return 'border-amber-200';
      case 'low':
        return 'border-green-200';
      default:
        return 'border-gray-200';
    }
  };

  const getUrgencyText = (level: string) => {
    switch (level) {
      case 'emergency':
        return 'Buscar atención médica inmediata';
      case 'urgent':
        return 'Buscar atención médica en las próximas 24-48 horas';
      case 'soon':
        return 'Consultar a un médico en la próxima semana';
      case 'routine':
        return 'Consultar a un médico cuando sea conveniente';
      default:
        return 'Consultar a un médico';
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'media':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'baja':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // If using compact view, render a simplified version
  if (compactView) {
    return (
      <div className={`border rounded-lg overflow-hidden ${getSeverityBorder(data.severity)}`}>
        <div className={`p-4 ${getSeverityBg(data.severity)}`}>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">{data.primarySymptom.name}</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(data.severity)} ${getSeverityBg(data.severity)}`}>
              {data.severity === 'high' ? 'Severidad Alta' : 
               data.severity === 'moderate' ? 'Severidad Moderada' : 
               'Severidad Baja'}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Clock size={16} className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Nivel de Atención</span>
            </div>
            <div className={`text-sm ${getSeverityColor(data.urgency)}`}>
              {getUrgencyText(data.urgency)}
            </div>
          </div>

          {data.possibleConditions && data.possibleConditions.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Stethoscope size={16} className="text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Condiciones Posibles</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {data.possibleConditions.slice(0, 2).map((condition, index) => (
                  <span 
                    key={index} 
                    className={`text-xs px-2 py-1 rounded-full ${getProbabilityColor(condition.probability)}`}
                  >
                    {condition.name}
                  </span>
                ))}
                {data.possibleConditions.length > 2 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    +{data.possibleConditions.length - 2} más
                  </span>
                )}
              </div>
            </div>
          )}

          {showButtons && (
            <div className="flex space-x-2 pt-2">
              {onViewDoctors && (
                <button
                  onClick={onViewDoctors}
                  className={`px-3 py-1 text-xs border ${
                    data.urgency === 'emergency' || data.urgency === 'urgent'
                      ? 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                      : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  } rounded`}
                >
                  {data.urgency === 'emergency' ? 'Atención Urgente' : 'Ver Médicos'}
                </button>
              )}
              {onBookTelemedicine && data.urgency !== 'routine' && (
                <button
                  onClick={onBookTelemedicine}
                  className="px-3 py-1 text-xs bg-green-600 text-white border border-green-700 hover:bg-green-700 rounded"
                >
                  Telemedicina
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full detailed view
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header with severity indicator */}
      <div className={`p-6 ${getSeverityBg(data.severity)} border-b ${getSeverityBorder(data.severity)}`}>
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center mb-2 sm:mb-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getSeverityBg(data.severity)}`}>
              {data.severity === 'high' ? (
                <Flame size={24} className="text-red-600" />
              ) : data.severity === 'moderate' ? (
                <AlertCircle size={24} className="text-amber-500" />
              ) : (
                <CheckCircle size={24} className="text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{data.primarySymptom.name}</h3>
              <p className="text-gray-600">
                {data.primarySymptom.bodyRegion && `Región: ${data.primarySymptom.bodyRegion} • `}
                {data.primarySymptom.duration && `Duración: ${data.primarySymptom.duration}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Severidad</div>
              <div className={`font-medium ${getSeverityColor(data.severity)}`}>
                {data.severity === 'high' ? 'Alta' : 
                 data.severity === 'moderate' ? 'Moderada' : 
                 'Baja'}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-500 mb-1">Nivel de Atención</div>
              <div className={`font-medium ${getSeverityColor(data.urgency)}`}>
                {data.urgency === 'emergency' ? 'Emergencia' : 
                 data.urgency === 'urgent' ? 'Urgente' : 
                 data.urgency === 'soon' ? 'Pronto' : 
                 'Rutina'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Red flags banner (if any) */}
      {data.redFlags && data.redFlags.length > 0 && data.urgency !== 'routine' && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                {data.redFlags[0].description}
              </h4>
              <p className="mt-1 text-sm text-red-700">
                {data.redFlags[0].action}
              </p>
              {data.redFlags.length > 1 && (
                <div className="mt-1">
                  <button
                    onClick={() => setActiveTab('recommendations')}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Ver {data.redFlags.length - 1} {data.redFlags.length - 1 === 1 ? 'aviso' : 'avisos'} más
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs for detailed view */}
      {showDetails && (
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Resumen
            </button>
            <button
              onClick={() => setActiveTab('conditions')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'conditions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posibles Condiciones
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'recommendations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recomendaciones
            </button>
          </nav>
        </div>
      )}

      {/* Tab content */}
      <div className="p-6">
        {showDetails ? (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Urgency and next steps */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Clock size={20} className="text-blue-600 mr-2" />
                    Próximos Pasos Recomendados
                  </h4>
                  <div className={`p-4 rounded-lg ${getSeverityBg(data.urgency)} ${getSeverityBorder(data.urgency)} mb-4`}>
                    <p className={`font-medium ${getSeverityColor(data.urgency)}`}>
                      {getUrgencyText(data.urgency)}
                    </p>
                  </div>

                  {data.recommendedSpecialties && data.recommendedSpecialties.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-700 mb-2 font-medium">Especialidades recomendadas:</p>
                      <div className="flex flex-wrap gap-2">
                        {data.recommendedSpecialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {showButtons && (
                    <div className="flex flex-wrap gap-3 mt-6">
                      {onViewDoctors && (
                        <button
                          onClick={onViewDoctors}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Stethoscope size={18} className="mr-2" />
                          Buscar Especialistas
                        </button>
                      )}
                      {onBookTelemedicine && data.urgency !== 'routine' && (
                        <button
                          onClick={onBookTelemedicine}
                          className={`px-4 py-2 ${
                            data.urgency === 'emergency'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white rounded-lg flex items-center`}
                        >
                          <Zap size={18} className="mr-2" />
                          {data.urgency === 'emergency' ? 'Telemedicina Urgente' : 'Consulta Virtual'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick summary of conditions and recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Stethoscope size={20} className="text-blue-600 mr-2" />
                      Posibles Condiciones
                    </h4>
                    
                    {data.possibleConditions && data.possibleConditions.length > 0 ? (
                      <div>
                        {data.possibleConditions.slice(0, 3).map((condition, index) => (
                          <div 
                            key={index} 
                            className={`mb-3 p-3 rounded-lg ${getProbabilityColor(condition.probability)}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="font-medium">{condition.name}</h5>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-50">
                                Probabilidad {condition.probability}
                              </span>
                            </div>
                            <p className="text-sm">
                              {condition.description.length > 100
                                ? `${condition.description.substring(0, 100)}...`
                                : condition.description}
                            </p>
                          </div>
                        ))}
                        
                        {data.possibleConditions.length > 3 && (
                          <button
                            onClick={() => setActiveTab('conditions')}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-2"
                          >
                            Ver {data.possibleConditions.length - 3} condiciones más
                            <ArrowRight size={14} className="ml-1" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay suficiente información para sugerir condiciones específicas.</p>
                    )}
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-5">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <ThumbsUp size={20} className="text-blue-600 mr-2" />
                      Recomendaciones de Cuidado
                    </h4>
                    
                    {data.selfCareRecommendations && data.selfCareRecommendations.length > 0 ? (
                      <div>
                        <ul className="space-y-2">
                          {data.selfCareRecommendations.slice(0, 5).map((rec, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle size={16} className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                        
                        {data.selfCareRecommendations.length > 5 && (
                          <button
                            onClick={() => setActiveTab('recommendations')}
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-3"
                          >
                            Ver {data.selfCareRecommendations.length - 5} recomendaciones más
                            <ArrowRight size={14} className="ml-1" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay recomendaciones específicas disponibles.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'conditions' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info size={20} className="text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-blue-700">
                        Esta información no constituye un diagnóstico médico. Las posibles condiciones se basan en los síntomas reportados y deben ser evaluadas por un profesional de la salud para un diagnóstico preciso.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {data.possibleConditions && data.possibleConditions.length > 0 ? (
                    data.possibleConditions.map((condition, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg overflow-hidden ${
                          condition.probability === 'alta'
                            ? 'border-red-200'
                            : condition.probability === 'media'
                            ? 'border-amber-200'
                            : 'border-blue-200'
                        }`}
                      >
                        <div className={`p-4 ${getProbabilityColor(condition.probability)}`}>
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{condition.name}</h4>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                              Probabilidad {condition.probability}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-white">
                          <p className="text-gray-700 mb-4">{condition.description}</p>
                          
                          {/* In a real app, you might add more details, links, etc. */}
                          <div className="flex justify-end">
                            <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                              Más información
                              <ArrowRight size={14} className="ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <BarChart size={48} className="mx-auto text-gray-300 mb-3" />
                      <h3 className="text-gray-500 font-medium mb-1">No hay suficiente información</h3>
                      <p className="text-gray-400">
                        No podemos sugerir condiciones específicas en base a la información proporcionada.
                      </p>
                    </div>
                  )}
                </div>
                
                {data.recommendedTests && data.recommendedTests.length > 0 && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Exámenes que su médico podría considerar</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.recommendedTests.map((test, index) => (
                        <li key={index} className="flex items-start">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                            <span className="text-blue-700 text-xs font-medium">{index + 1}</span>
                          </div>
                          <span className="text-gray-700">{test}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-sm text-gray-500">
                      Estos exámenes son solo sugerencias y su médico determinará cuáles son necesarios según su evaluación clínica.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                {/* Self-care recommendations */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ThumbsUp size={20} className="text-blue-600 mr-2" />
                    Recomendaciones de Cuidado Personal
                  </h4>
                  
                  {data.selfCareRecommendations && data.selfCareRecommendations.length > 0 ? (
                    <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                      <ul className="space-y-3">
                        {data.selfCareRecommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle size={16} className="text-green-600 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-green-800">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay recomendaciones específicas disponibles.</p>
                  )}
                </div>
                
                {/* Red flags and warnings */}
                {data.redFlags && data.redFlags.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <AlertTriangle size={20} className="text-red-600 mr-2" />
                      Señales de Alerta Importantes
                    </h4>
                    
                    <div className="space-y-4">
                      {data.redFlags.map((flag, index) => (
                        <div key={index} className="bg-red-50 rounded-lg p-4 border border-red-100">
                          <h5 className="font-medium text-red-800 mb-1">{flag.description}</h5>
                          <p className="text-red-700 text-sm">{flag.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Important notes */}
                {data.importantNotes && data.importantNotes.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Info size={20} className="text-blue-600 mr-2" />
                      Notas Importantes
                    </h4>
                    
                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                      <ul className="space-y-3">
                        {data.importantNotes.map((note, index) => (
                          <li key={index} className="flex items-start">
                            <Info size={16} className="text-blue-600 mt-1 mr-2 flex-shrink-0" />
                            <span className="text-blue-700">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Action buttons */}
                {showButtons && (
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <p className="text-gray-600 mb-4">
                      Basado en su evaluación, recomendamos los siguientes pasos:
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      {onViewDoctors && (
                        <button
                          onClick={onViewDoctors}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                          <Stethoscope size={18} className="mr-2" />
                          Buscar Especialistas
                        </button>
                      )}
                      {onBookTelemedicine && data.urgency !== 'routine' && (
                        <button
                          onClick={onBookTelemedicine}
                          className={`px-4 py-2 ${
                            data.urgency === 'emergency'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-green-600 hover:bg-green-700'
                          } text-white rounded-lg flex items-center`}
                        >
                          <Zap size={18} className="mr-2" />
                          {data.urgency === 'emergency' ? 'Telemedicina Urgente' : 'Consulta Virtual'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // Simple view without tabs
          <div className="space-y-6">
            <p className="text-gray-700">
              Este análisis está basado en los síntomas y datos proporcionados. Recuerde que esta información no constituye un diagnóstico médico.
            </p>
            
            {/* Quick urgency info */}
            <div className={`p-4 rounded-lg ${getSeverityBg(data.urgency)} ${getSeverityBorder(data.urgency)}`}>
              <div className="flex items-center">
                <Clock size={20} className={`${getSeverityColor(data.urgency)} mr-3`} />
                <div>
                  <h4 className={`font-medium ${getSeverityColor(data.urgency)}`}>
                    {data.urgency === 'emergency' ? 'Se recomienda atención de emergencia' : 
                     data.urgency === 'urgent' ? 'Se recomienda atención urgente' : 
                     data.urgency === 'soon' ? 'Se recomienda atención pronta' : 
                     'Se recomienda atención de rutina'}
                  </h4>
                  <p className="text-sm text-gray-700">{getUrgencyText(data.urgency)}</p>
                </div>
              </div>
            </div>
            
            {/* Red flag if present */}
            {data.redFlags && data.redFlags.length > 0 && data.urgency !== 'routine' && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800">{data.redFlags[0].description}</h4>
                    <p className="text-sm text-red-700">{data.redFlags[0].action}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            {showButtons && (
              <div className="flex flex-wrap gap-3 pt-2">
                {onViewDoctors && (
                  <button
                    onClick={onViewDoctors}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex-1 flex items-center justify-center"
                  >
                    <Stethoscope size={18} className="mr-2" />
                    Buscar Médicos
                  </button>
                )}
                {onBookTelemedicine && data.urgency !== 'routine' && (
                  <button
                    onClick={onBookTelemedicine}
                    className={`px-4 py-2 flex-1 flex items-center justify-center ${
                      data.urgency === 'emergency'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white rounded-lg`}
                  >
                    <Zap size={18} className="mr-2" />
                    {data.urgency === 'emergency' ? 'Atención Urgente' : 'Telemedicina'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Disclaimer footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <p className="text-xs text-gray-500 flex items-center">
          <Info size={12} className="mr-1 flex-shrink-0" />
          Esta evaluación no sustituye el consejo médico profesional. Si sus síntomas son graves o empeoran, busque atención médica inmediata.
        </p>
      </div>
    </div>
  );
};

export default ResultsVisualization;