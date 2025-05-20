import React from 'react';
import { X, HelpCircle, Search, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: 'intro' | 'evaluation' | 'results';
}

const HelpModal: React.FC<HelpModalProps> = ({ 
  isOpen, 
  onClose,
  currentPage = 'intro'
}) => {
  if (!isOpen) return null;
  
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
          <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-blue-900 flex items-center" id="modal-title">
              <HelpCircle size={20} className="mr-2" />
              Ayuda del Evaluador de Síntomas
            </h3>
            <button
              onClick={onClose}
              className="text-blue-500 hover:text-blue-700"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {currentPage === 'intro' && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">¿Qué es el evaluador de síntomas?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  El evaluador de síntomas es una herramienta que le ayuda a entender mejor sus síntomas y le proporciona orientación sobre posibles condiciones relacionadas y especialistas médicos que podría consultar.
                </p>
                
                <h4 className="text-base font-medium text-gray-900 mb-3">¿Cómo funciona?</h4>
                <div className="space-y-3 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                      1
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">Seleccione un método de evaluación:</span> Puede elegir entre indicar visualmente dónde siente molestias en un modelo del cuerpo, o describir sus síntomas a nuestro asistente inteligente.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                      2
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">Responda algunas preguntas:</span> Nuestro sistema le hará preguntas específicas sobre sus síntomas para entender mejor su situación.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                      3
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-800">Reciba resultados y recomendaciones:</span> Basado en sus respuestas, le proporcionaremos información sobre posibles condiciones relacionadas y especialistas recomendados.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        <span className="font-medium text-amber-800">Importante:</span> Esta herramienta no proporciona diagnósticos médicos y no sustituye la consulta con un profesional de la salud.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-base font-medium text-gray-900 mb-3">¿Cuándo buscar atención médica inmediata?</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Busque atención médica de emergencia si experimenta:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
                  <li>Dolor de pecho intenso o presión</li>
                  <li>Dificultad para respirar</li>
                  <li>Confusión o alteración del estado mental</li>
                  <li>Debilidad o entumecimiento repentino, especialmente en un lado del cuerpo</li>
                  <li>Dolor de cabeza severo y repentino</li>
                  <li>Lesiones graves</li>
                </ul>
              </div>
            )}
            
            {currentPage === 'evaluation' && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Evaluación de Síntomas</h4>
                <p className="text-sm text-gray-600 mb-4">
                  En esta etapa, responderá preguntas sobre sus síntomas para que podamos entender mejor su situación médica.
                </p>
                
                <h4 className="text-base font-medium text-gray-900 mb-3">Consejos para una evaluación precisa</h4>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Sea lo más específico posible al describir sus síntomas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Mencione cuándo comenzaron los síntomas y si han empeorado</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Indique si algo mejora o empeora los síntomas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Incluya información sobre medicamentos que está tomando</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Mencione cualquier condición médica que ya tenga diagnosticada</span>
                  </li>
                </ul>
                
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <HelpCircle className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Puede actualizar su perfil de salud para proporcionar información sobre sus condiciones médicas existentes y medicamentos actuales. Esto ayuda a personalizar la evaluación.
                      </p>
                    </div>
                  </div>
                </div>
                
                <h4 className="text-base font-medium text-gray-900 mb-3">Preguntas frecuentes</h4>
                <div className="space-y-3">
                  <details className="bg-gray-50 p-2 rounded-md">
                    <summary className="font-medium text-sm text-gray-800 cursor-pointer">¿Puedo cambiar mis respuestas?</summary>
                    <p className="text-sm text-gray-600 mt-2 pl-2">
                      Sí, puede volver a preguntas anteriores usando el botón "Anterior" durante la evaluación.
                    </p>
                  </details>
                  
                  <details className="bg-gray-50 p-2 rounded-md">
                    <summary className="font-medium text-sm text-gray-800 cursor-pointer">¿Cuánto tiempo toma completar la evaluación?</summary>
                    <p className="text-sm text-gray-600 mt-2 pl-2">
                      La mayoría de las evaluaciones toman entre 2-5 minutos, dependiendo de la complejidad de los síntomas.
                    </p>
                  </details>
                  
                  <details className="bg-gray-50 p-2 rounded-md">
                    <summary className="font-medium text-sm text-gray-800 cursor-pointer">¿Qué pasa si tengo múltiples síntomas?</summary>
                    <p className="text-sm text-gray-600 mt-2 pl-2">
                      Comience con el síntoma principal o más preocupante. Puede realizar evaluaciones adicionales para otros síntomas después.
                    </p>
                  </details>
                </div>
              </div>
            )}
            
            {currentPage === 'results' && (
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Entendiendo sus resultados</h4>
                <p className="text-sm text-gray-600 mb-4">
                  En esta página encontrará información sobre posibles condiciones relacionadas con sus síntomas y recomendaciones sobre especialistas médicos que podría consultar.
                </p>
                
                <h4 className="text-base font-medium text-gray-900 mb-3">Cómo interpretar los resultados</h4>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <Search size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600"><span className="font-medium text-gray-800">Posibles condiciones:</span> Estas son condiciones médicas que podrían estar relacionadas con sus síntomas, pero no son diagnósticos.</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600"><span className="font-medium text-gray-800">Nivel de atención:</span> Indica la urgencia recomendada para buscar atención médica basada en sus síntomas.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600"><span className="font-medium text-gray-800">Especialistas recomendados:</span> Médicos especialistas que podrían ser adecuados para evaluar y tratar sus síntomas.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600"><span className="font-medium text-gray-800">Cuidados personales:</span> Acciones que puede tomar para aliviar los síntomas mientras espera su consulta médica.</span>
                  </li>
                </ul>
                
                <h4 className="text-base font-medium text-gray-900 mb-3">Próximos pasos</h4>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Agende una cita con uno de los especialistas recomendados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Exporte o comparta sus resultados para mostrarlos a su médico</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Siga las recomendaciones de cuidado personal sugeridas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">Consulte los recursos educativos proporcionados para aprender más sobre sus síntomas</span>
                  </li>
                </ul>
                
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        <span className="font-medium text-amber-800">Recuerde:</span> Esta información es orientativa y no sustituye una consulta médica profesional. Siempre consulte con un médico para un diagnóstico adecuado.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Entendido
            </button>
            <a
              href="/ayuda"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Más ayuda
              <ExternalLink size={16} className="ml-1" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;