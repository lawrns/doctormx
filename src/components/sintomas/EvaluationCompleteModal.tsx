import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Video, User, Clock, ArrowRight } from 'lucide-react';

interface EvaluationCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluationData: {
    symptomName: string;
    urgency: 'routine' | 'soon' | 'urgent' | 'emergency';
    recommendedSpecialties?: string[];
  };
}

const EvaluationCompleteModal: React.FC<EvaluationCompleteModalProps> = ({
  isOpen,
  onClose,
  evaluationData
}) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // Auto-redirect countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleViewResults();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setIsVisible(false);
      setCountdown(10);
    }
  }, [isOpen]);

  const getUrgencyMessage = () => {
    switch (evaluationData.urgency) {
      case 'emergency':
        return 'Se recomienda atención médica inmediata.';
      case 'urgent':
        return 'Se recomienda atención médica en las próximas 24-48 horas.';
      case 'soon':
        return 'Se recomienda agendar una consulta en la próxima semana.';
      case 'routine':
        return 'Puede agendar una consulta cuando le sea conveniente.';
      default:
        return 'Se recomienda consultar con un profesional médico.';
    }
  };

  const getUrgencyColor = () => {
    switch (evaluationData.urgency) {
      case 'emergency':
        return 'bg-red-500';
      case 'urgent':
        return 'bg-amber-500';
      case 'soon':
        return 'bg-blue-500';
      case 'routine':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleViewResults = () => {
    navigate('/sintomas/resultados');
    onClose();
  };

  const handleBookAppointment = () => {
    const specialty = evaluationData.recommendedSpecialties?.[0] || '';
    navigate(`/buscar?especialidad=${encodeURIComponent(specialty)}`);
    onClose();
  };

  const handleTelemedicine = () => {
    navigate('/telemedicina');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="relative">
            {/* Colored status bar based on urgency */}
            <div className={`h-2 w-full ${getUrgencyColor()}`}></div>
            
            <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Evaluación completada
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Hemos analizado tu síntoma <span className="font-medium text-gray-800">{evaluationData.symptomName}</span> y preparado algunas recomendaciones para ti.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{getUrgencyMessage()}</span>
                </div>
                
                {evaluationData.recommendedSpecialties && evaluationData.recommendedSpecialties.length > 0 && (
                  <div className="flex items-center mt-2">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      Especialidad recomendada: <span className="font-medium">{evaluationData.recommendedSpecialties[0]}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                onClick={handleViewResults}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Ver resultados 
                <span className="ml-1 text-blue-200 text-xs">({countdown})</span>
              </button>
              
              {evaluationData.urgency === 'urgent' || evaluationData.urgency === 'emergency' ? (
                <button
                  type="button"
                  onClick={handleTelemedicine}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Video className="mr-1 h-4 w-4" />
                  Telemedicina urgente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBookAppointment}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Calendar className="mr-1 h-4 w-4" />
                  Agendar cita
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationCompleteModal;