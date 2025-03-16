import { Clock, AlertTriangle } from 'lucide-react';

interface ResultsSummaryProps {
  symptom: string;
  severity: 'low' | 'moderate' | 'high';
  urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
  recommendedSpecialties: string[];
  date: Date;
  compact?: boolean;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  symptom,
  severity,
  urgency,
  recommendedSpecialties,
  date,
  compact = false
}) => {
  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getUrgencyText = (level: string) => {
    switch (level) {
      case 'emergency':
        return 'Buscar atención médica inmediata';
      case 'urgent':
        return 'Atención en 24-48 horas';
      case 'soon':
        return 'Atención en la próxima semana';
      case 'routine':
      default:
        return 'Atención cuando sea conveniente';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'soon':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'routine':
      default:
        return 'bg-green-50 text-green-700 border-green-100';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900">{symptom}</h3>
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <Clock size={12} className="mr-1" />
              {date.toLocaleString()}
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>
            {severity === 'high' 
              ? 'Severo' 
              : severity === 'moderate' 
              ? 'Moderado' 
              : 'Leve'}
          </div>
        </div>
        
        <div className="mt-3">
          <div className={`text-xs rounded-md p-2 ${getUrgencyColor(urgency)}`}>
            {getUrgencyText(urgency)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
        <h3 className="text-xl font-semibold text-blue-900">Resumen de la Evaluación</h3>
      </div>
      
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-sm text-gray-500 mb-1">Síntoma principal</div>
            <div className="text-lg font-medium text-gray-900">{symptom}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Fecha de evaluación</div>
            <div className="text-base text-gray-900">{date.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className={`rounded-lg p-4 ${getSeverityColor(severity)}`}>
            <div className="font-medium mb-1">Nivel de severidad</div>
            <div className="text-lg font-semibold">
              {severity === 'high' 
                ? 'Severo' 
                : severity === 'moderate' 
                ? 'Moderado' 
                : 'Leve'}
            </div>
          </div>
          
          <div className={`rounded-lg p-4 ${getUrgencyColor(urgency)}`}>
            <div className="font-medium mb-1">Atención recomendada</div>
            <div className="text-lg font-semibold">
              {urgency === 'emergency' 
                ? 'Emergencia' 
                : urgency === 'urgent' 
                ? 'Urgente' 
                : urgency === 'soon'
                ? 'Pronto'
                : 'Rutina'}
            </div>
            <div className="text-sm mt-1">{getUrgencyText(urgency)}</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="text-sm text-gray-500 mb-2">Especialidades recomendadas</div>
          <div className="flex flex-wrap gap-2">
            {recommendedSpecialties.map((specialty, index) => (
              <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                {specialty}
              </span>
            ))}
          </div>
        </div>
        
        {(urgency === 'emergency' || urgency === 'urgent') && (
          <div className="mt-6 bg-red-50 rounded-lg p-4 flex items-start">
            <AlertTriangle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" size={20} />
            <div>
              <div className="font-medium text-red-800">Atención requerida</div>
              <p className="text-sm text-red-700 mt-1">
                {urgency === 'emergency'
                  ? 'Sus síntomas requieren atención médica inmediata. Por favor, acuda a un servicio de urgencias o llame a emergencias.'
                  : 'Sus síntomas requieren atención médica pronta. Consulte con un médico en las próximas 24-48 horas.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsSummary;