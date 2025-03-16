import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useQuestionnaireContext } from '../../contexts/QuestionnaireContext';
import SymptomQuestionnaire from '../../components/SymptomQuestionnaire';

function SymptomQuestionnairePage() {
  const navigate = useNavigate();
  const { state, context, reset } = useQuestionnaireContext();
  
  useEffect(() => {
    // Redirect to intro page if no body region selected
    if (!context.bodyRegion) {
      navigate('/sintomas');
    }
    
    // Navigate to results when complete
    if (state.matches('complete')) {
      navigate('/sintomas/resultados');
    }
  }, [context.bodyRegion, state, navigate]);
  
  const handleBack = () => {
    navigate('/sintomas/seleccion');
  };
  
  const handleQuestionnaireComplete = () => {
    navigate('/sintomas/resultados');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handleBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <ChevronLeft size={20} className="mr-1" />
          Volver a selección
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Cuestionario de Síntomas</h1>
        
        <div style={{ width: '24px' }}></div> {/* Empty div for flex spacing */}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        {context.bodyRegion ? (
          <SymptomQuestionnaire 
            bodyRegion={context.bodyRegion}
            onComplete={handleQuestionnaireComplete}
          />
        ) : (
          <div className="p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se ha seleccionado una zona del cuerpo
            </h3>
            <p className="text-gray-600 mb-4">
              Por favor, regresa y selecciona la zona donde sientes molestias.
            </p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a selección
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Importante</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Esta herramienta no sustituye una evaluación médica profesional. Si experimentas síntomas graves o una emergencia médica, busca atención médica inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SymptomQuestionnairePage;