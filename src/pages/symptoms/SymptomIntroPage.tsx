import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, MapPin, AlertCircle, ChevronRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

function SymptomIntroPage() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedOption === 'body') {
      navigate('/sintomas/seleccion');
    } else if (selectedOption === 'ai') {
      navigate('/sintomas/ai');
    }
  };

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Evaluación de Síntomas</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprende tus síntomas y recibe orientación sobre los siguientes pasos con nuestra herramienta de evaluación.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Elige una opción para comenzar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div 
              className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all ${
                selectedOption === 'body' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedOption('body')}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <MapPin size={32} className="text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Selección Corporal</h3>
              <p className="text-gray-600 text-center">
                Indica la zona del cuerpo donde tienes molestias utilizando nuestro modelo interactivo.
              </p>
            </motion.div>
            
            <motion.div 
              className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all ${
                selectedOption === 'ai' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedOption('ai')}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Brain size={32} className="text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">Asistente de IA</h3>
              <p className="text-gray-600 text-center">
                Describe tus síntomas y nuestro asistente virtual te guiará a través de una evaluación personalizada.
              </p>
            </motion.div>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedOption}
              className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors ${
                selectedOption 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Continuar
              <ChevronRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Privacidad y Seguridad</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Tu información médica está protegida con los más altos estándares de seguridad y encriptación.
          </p>
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
                  Esta herramienta no sustituye una evaluación médica profesional. Si experimentas síntomas graves o una emergencia médica, busca atención médica inmediata o llama al número de emergencias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SymptomIntroPage;