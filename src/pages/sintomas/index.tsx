import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  User, // Changed from Human to User 
  AlertCircle, 
  Shield, 
  ArrowRight, 
  Stethoscope,
  ChevronRight,
  Info,
  CheckCircle,
  HeartPulse,
  FileText,
  Bell,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';

// Track how many users have used the symptom checker
const COUNTER_KEY = 'symptom_checker_counter';
const getUniqueVisitors = () => {
  try {
    const count = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10);
    // In a real app, this would be fetched from a backend API
    return 8426 + count;
  } catch (e) {
    return 8426;
  }
};

const incrementVisitorCount = () => {
  try {
    const current = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10);
    localStorage.setItem(COUNTER_KEY, (current + 1).toString());
  } catch (e) {
    // Ignore storage errors
  }
};

const SymptomCheckerPage = () => {
  const navigate = useNavigate();
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [visitorCount, setVisitorCount] = useState(getUniqueVisitors());

  useEffect(() => {
    // Check if there was a previous symptom check
    const lastResults = sessionStorage.getItem('symptomResults');
    if (lastResults) {
      try {
        const parsed = JSON.parse(lastResults);
        const date = new Date(parsed.timestamp || Date.now());
        setLastCheck(date.toLocaleDateString());
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Increment visitor count
    incrementVisitorCount();
  }, []);

  const handleSelectOption = (option: 'body' | 'ai') => {
    // Save the selection to session storage for the next page
    sessionStorage.setItem('symptomCheckerMethod', option);
    navigate('/sintomas/evaluacion');
  };

  const benefits = [
    {
      icon: <HeartPulse className="h-6 w-6 text-blue-600" />,
      title: 'Evaluación Precisa',
      description: 'Nuestro sistema analiza tus síntomas utilizando bases de conocimiento médico actualizadas para proporcionar orientación relevante.'
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: 'Privacidad Garantizada',
      description: 'Toda tu información es confidencial y protegida con los más altos estándares de seguridad.'
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
      title: 'Respaldo Médico',
      description: 'Desarrollado y validado por profesionales médicos para asegurar la precisión y relevancia de las evaluaciones.'
    },
    {
      icon: <Brain className="h-6 w-6 text-blue-600" />,
      title: 'Inteligencia Avanzada',
      description: 'Utilizamos tecnología de IA para personalizar la evaluación y ofrecer recomendaciones adaptadas a tus síntomas específicos.'
    }
  ];

  const testimonials = [
    {
      quote: "El evaluador de síntomas me ayudó a entender la urgencia de mi situación y me conectó con un especialista rápidamente.",
      author: "María G.",
      role: "Paciente"
    },
    {
      quote: "Como médico, valoro que pacientes lleguen con una evaluación preliminar que ahorra tiempo en la consulta.",
      author: "Dr. Ramírez",
      role: "Cardiología"
    },
    {
      quote: "La interfaz es muy intuitiva y las recomendaciones fueron precisas en mi caso.",
      author: "Carlos P.",
      role: "Paciente"
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Evaluación Inteligente de Síntomas</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Comprende mejor tus síntomas y recibe orientación profesional sobre los especialistas adecuados para tu situación.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button
                onClick={() => handleSelectOption('body')}
                className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition flex items-center justify-center"
              >
                Comenzar Evaluación
                <ArrowRight size={18} className="ml-2" />
              </button>
              {lastCheck && (
                <button
                  onClick={() => navigate('/sintomas/resultados')}
                  className="px-6 py-3 bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
                >
                  Ver Mi Último Resultado
                  <FileText size={18} className="ml-2" />
                </button>
              )}
            </div>
            <div className="flex justify-center items-center space-x-4 text-sm text-blue-100">
              <div className="flex items-center">
                <CheckCircle size={16} className="mr-1" />
                Respaldado por médicos
              </div>
              <div className="flex items-center">
                <Shield size={16} className="mr-1" />
                100% confidencial
              </div>
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                {visitorCount.toLocaleString()} evaluaciones realizadas
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Method Selection Cards */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Elige el Método de Evaluación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Body Selection Option */}
            <motion.div 
              className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                hoveredOption === 'body' ? 'border-blue-500 shadow-md' : 'border-transparent'
              }`}
              whileHover={{ y: -8 }}
              onMouseEnter={() => setHoveredOption('body')}
              onMouseLeave={() => setHoveredOption(null)}
              onClick={() => handleSelectOption('body')}
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <User size={32} className="text-blue-600" /> {/* Changed from Human to User */}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Selección por Cuerpo</h3>
                <p className="text-gray-600 mb-6">
                  Indica en un modelo interactivo qué parte del cuerpo te causa molestias y responde preguntas específicas.
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center text-gray-700">
                    <ChevronRight size={18} className="text-blue-500 mr-2" />
                    Ideal para síntomas localizados
                  </li>
                  <li className="flex items-center text-gray-700">
                    <ChevronRight size={18} className="text-blue-500 mr-2" />
                    Interfaz visual intuitiva
                  </li>
                  <li className="flex items-center text-gray-700">
                    <ChevronRight size={18} className="text-blue-500 mr-2" />
                    Rápido y preciso
                  </li>
                </ul>
                <div className="flex items-center text-blue-600 font-medium">
                  Comenzar <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </motion.div>

            {/* AI Conversation Option */}
            <motion.div 
              className={`bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                hoveredOption === 'ai' ? 'border-blue-500 shadow-md' : 'border-transparent'
              }`}
              whileHover={{ y: -8 }}
              onMouseEnter={() => setHoveredOption('ai')}
              onMouseLeave={() => setHoveredOption(null)}
              onClick={() => handleSelectOption('ai')}
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <Brain size={32} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Asistente Inteligente</h3>
                <p className="text-gray-600 mb-6">
                  Describe tus síntomas y nuestro asistente virtual te guiará con preguntas específicas para entender tu situación.
                </p>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-center text-gray-700">
                    <ChevronRight size={18} className="text-blue-500 mr-2" />
                    Perfecto para síntomas complejos o múltiples
                  </li>
                  <li className="flex items-center text-gray-700">
                    <ChevronRight size={18} className="text-blue-500 mr-2" />
                    Experiencia conversacional natural
                  </li>
                  <li className="flex items-center text-gray-700">
                    <ChevronRight size={18} className="text-blue-500 mr-2" />
                    Análisis detallado y personalizado
                  </li>
                </ul>
                <div className="flex items-center text-blue-600 font-medium">
                  Comenzar <ArrowRight size={18} className="ml-2" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Beneficios de Nuestra Evaluación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-blue-200 hover:shadow transition"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">¿Cómo Funciona?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-xl font-bold text-blue-600">1</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Evalúa tus síntomas</h3>
              <p className="text-gray-600">
                Responde preguntas sobre tus síntomas utilizando nuestras herramientas interactivas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-xl font-bold text-blue-600">2</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Recibe un análisis</h3>
              <p className="text-gray-600">
                Nuestro sistema analiza tus respuestas utilizando conocimiento médico actualizado y proporciona información relevante sobre tus síntomas.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-xl font-bold text-blue-600">3</div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Conecta con especialistas</h3>
              <p className="text-gray-600">
                Basado en tu evaluación, te recomendaremos los especialistas más adecuados para tu caso y facilitaremos la programación de consultas.
              </p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Lo Que Dicen Nuestros Usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="text-blue-600 mb-4">
                  <svg width="24" height="24" fill="currentColor" className="inline-block">
                    <path d="M10 7L8 11L4 12L8 13L10 17L12 13L16 12L12 11L10 7Z" />
                  </svg>
                  <svg width="24" height="24" fill="currentColor" className="inline-block">
                    <path d="M10 7L8 11L4 12L8 13L10 17L12 13L16 12L12 11L10 7Z" />
                  </svg>
                  <svg width="24" height="24" fill="currentColor" className="inline-block">
                    <path d="M10 7L8 11L4 12L8 13L10 17L12 13L16 12L12 11L10 7Z" />
                  </svg>
                  <svg width="24" height="24" fill="currentColor" className="inline-block">
                    <path d="M10 7L8 11L4 12L8 13L10 17L12 13L16 12L12 11L10 7Z" />
                  </svg>
                  <svg width="24" height="24" fill="currentColor" className="inline-block">
                    <path d="M10 7L8 11L4 12L8 13L10 17L12 13L16 12L12 11L10 7Z" />
                  </svg>
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Preguntas Frecuentes</h2>
          
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Es confiable esta evaluación de síntomas?</h3>
              <p className="text-gray-700">
                Nuestra evaluación está respaldada por conocimiento médico actualizado y ha sido desarrollada con la colaboración de profesionales de la salud. Sin embargo, es importante recordar que no sustituye una consulta médica profesional.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Es segura mi información médica?</h3>
              <p className="text-gray-700">
                Sí, toda tu información es confidencial y está protegida con los más altos estándares de seguridad. No compartimos tus datos con terceros sin tu consentimiento explícito.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Qué debo hacer después de recibir mi evaluación?</h3>
              <p className="text-gray-700">
                Dependiendo de la urgencia indicada en tu evaluación, deberías agendar una consulta con un médico especialista o buscar atención médica inmediata. Nuestro sistema te facilitará la conexión con profesionales adecuados para tu caso.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Puedo usar esta evaluación para emergencias médicas?</h3>
              <p className="text-gray-700">
                No. Si experimentas síntomas graves como dolor intenso en el pecho, dificultad para respirar, pérdida de consciencia o cualquier otra situación que amenace la vida, debes buscar atención médica de emergencia inmediatamente o llamar al número de emergencias.
              </p>
            </div>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-12">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-blue-800">Importante</h3>
              <div className="mt-2 text-blue-700">
                <p>
                  Esta herramienta no sustituye una evaluación médica profesional. 
                  Si experimentas síntomas graves o una emergencia médica, busca atención médica inmediata o llama al número de emergencias.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Comienza tu Evaluación de Síntomas</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Obtén información valiosa sobre tus síntomas y conéctate con los especialistas adecuados para recibir la atención que necesitas.
          </p>
          <button
            onClick={() => handleSelectOption('body')}
            className="px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Evaluar mis Síntomas
          </button>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Privacidad y Seguridad</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Tu información médica está protegida con los más altos estándares de seguridad y encriptación. Nunca compartimos tus datos sin tu consentimiento.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <Stethoscope className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Respaldado por Médicos</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Nuestro sistema es desarrollado y validado por profesionales médicos para asegurar la precisión y relevancia de la información proporcionada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomCheckerPage;