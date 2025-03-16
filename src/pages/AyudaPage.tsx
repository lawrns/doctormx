import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, HelpCircle, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, FileText, AlertCircle } from 'lucide-react';

// FAQ categories
const faqCategories = [
  {
    id: 'general',
    name: 'Preguntas generales',
    icon: <HelpCircle size={20} className="text-blue-600" />,
    questions: [
      {
        question: '¿Qué es Doctor.mx?',
        answer: 'Doctor.mx es la plataforma líder en México para encontrar médicos, agendar citas y recibir atención médica en línea. Conectamos a pacientes con profesionales de la salud calificados, facilitando el acceso a servicios médicos de calidad.'
      },
      {
        question: '¿Necesito crear una cuenta para usar Doctor.mx?',
        answer: 'Puedes buscar médicos sin crear una cuenta, pero necesitarás registrarte para agendar citas, acceder a telemedicina y gestionar tu historial médico. El registro es gratuito y solo toma unos minutos.'
      },
      {
        question: '¿Doctor.mx está disponible en todo México?',
        answer: 'Actualmente, Doctor.mx opera en las principales ciudades de México, incluyendo Ciudad de México, Guadalajara, Monterrey, Puebla y Querétaro. Estamos expandiendo constantemente nuestra cobertura para incluir más ciudades y regiones.'
      }
    ]
  },
  {
    id: 'appointments',
    name: 'Citas médicas',
    icon: <Calendar size={20} className="text-blue-600" />,
    questions: [
      {
        question: '¿Cómo puedo agendar una cita?',
        answer: 'Para agendar una cita, busca un médico según especialidad o nombre, selecciona su perfil, elige una fecha y hora disponible, y confirma tu reserva. Recibirás una confirmación por correo electrónico y recordatorios antes de tu cita.'
      },
      {
        question: '¿Puedo cancelar o reprogramar mi cita?',
        answer: 'Sí, puedes cancelar o reprogramar tu cita hasta 24 horas antes sin costo. Las cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a un cargo. Puedes gestionar tus citas desde la sección "Mis citas" en tu cuenta.'
      },
      {
        question: '¿Qué debo hacer si llego tarde a mi cita?',
        answer: 'Si prevés que llegarás tarde, te recomendamos contactar al consultorio médico lo antes posible. Dependiendo del retraso y la disponibilidad del médico, podrían atenderte o pedirte que reprogrames tu cita.'
      }
    ]
  },
  {
    id: 'telemedicine',
    name: 'Telemedicina',
    icon: <Video size={20} className="text-blue-600" />,
    questions: [
      {
        question: '¿Cómo funciona una consulta por telemedicina?',
        answer: 'Las consultas por telemedicina se realizan a través de videollamada en nuestra plataforma. Una vez agendada tu cita, recibirás un enlace para unirte a la consulta en la fecha y hora programadas. Solo necesitas un dispositivo con cámara, micrófono y conexión a internet.'
      },
      {
        question: '¿Es segura la telemedicina?',
        answer: 'Sí, nuestra plataforma cumple con los más altos estándares de seguridad y privacidad. Todas las videollamadas están encriptadas y la información médica se maneja de acuerdo con las regulaciones de protección de datos de salud.'
      },
      {
        question: '¿Qué especialidades están disponibles por telemedicina?',
        answer: 'Ofrecemos consultas por telemedicina en múltiples especialidades, incluyendo medicina general, pediatría, psicología, nutrición, dermatología, entre otras. Algunas especialidades que requieren examen físico pueden tener limitaciones.'
      }
    ]
  },
  {
    id: 'payments',
    name: 'Pagos y facturación',
    icon: <CreditCard size={20} className="text-blue-600" />,
    questions: [
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), así como transferencias bancarias para algunos servicios. Todos los pagos se procesan de forma segura a través de nuestros proveedores de pago.'
      },
      {
        question: '¿Cómo puedo solicitar una factura?',
        answer: 'Puedes solicitar una factura al momento de realizar tu pago marcando la opción correspondiente y proporcionando tus datos fiscales. También puedes solicitarla posteriormente desde la sección "Mis pagos" en tu cuenta o contactando a nuestro equipo de soporte.'
      },
      {
        question: '¿Puedo usar mi seguro médico para las citas?',
        answer: 'Muchos de los médicos en nuestra plataforma aceptan seguros médicos. Puedes filtrar por aseguradora al buscar médicos. Te recomendamos verificar la cobertura específica con tu aseguradora antes de agendar tu cita.'
      }
    ]
  },
  {
    id: 'doctors',
    name: 'Para médicos',
    icon: <Stethoscope size={20} className="text-blue-600" />,
    questions: [
      {
        question: '¿Cómo puedo registrarme como médico?',
        answer: 'Para registrarte como médico, visita la sección "Para médicos" en nuestra página principal y sigue el proceso de registro. Necesitarás proporcionar tus credenciales profesionales, que serán verificadas antes de activar tu perfil.'
      },
      {
        question: '¿Cuáles son los beneficios de unirme a Doctor.mx?',
        answer: 'Al unirte a Doctor.mx, obtienes visibilidad ante millones de pacientes potenciales, un sistema de gestión de citas eficiente, herramientas para telemedicina, y la posibilidad de expandir tu práctica médica. Ofrecemos diferentes planes según tus necesidades.'
      },
      {
        question: '¿Cómo funciona el proceso de verificación?',
        answer: 'Verificamos la identidad y credenciales profesionales de todos los médicos para garantizar la seguridad de los pacientes. Este proceso incluye la validación de tu cédula profesional, especialidad y experiencia, y puede tomar hasta 48 horas hábiles.'
      }
    ]
  },
  {
    id: 'account',
    name: 'Cuenta y perfil',
    icon: <User size={20} className="text-blue-600" />,
    questions: [
      {
        question: '¿Cómo puedo actualizar mi información personal?',
        answer: 'Puedes actualizar tu información personal accediendo a tu cuenta y navegando a la sección "Mi perfil". Allí podrás modificar tus datos personales, información de contacto y preferencias.'
      },
      {
        question: '¿Cómo cambio mi contraseña?',
        answer: 'Para cambiar tu contraseña, ve a la sección "Configuración" en tu cuenta, selecciona "Seguridad" y sigue las instrucciones para actualizar tu contraseña. Si olvidaste tu contraseña, puedes restablecerla desde la página de inicio de sesión.'
      },
      {
        question: '¿Puedo eliminar mi cuenta?',
        answer: 'Sí, puedes solicitar la eliminación de tu cuenta desde la sección "Configuración" > "Privacidad". Ten en cuenta que esto eliminará permanentemente todos tus datos y no podrás recuperar tu historial de citas o información médica.'
      }
    ]
  }
];

// Function to create a component for the missing Lucide React icons
function Stethoscope(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  );
}

function Calendar(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function Video(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  );
}

function CreditCard(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

function User(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

function AyudaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  
  // Filter questions based on search term
  const filteredQuestions = searchTerm
    ? faqCategories.flatMap(category => 
        category.questions
          .filter(q => 
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
            q.answer.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(q => ({ ...q, category: category.name, categoryId: category.id }))
      )
    : [];
  
  const toggleQuestion = (categoryId: string, index: number) => {
    const key = `${categoryId}-${index}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Centro de ayuda</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Encuentra respuestas a tus preguntas sobre Doctor.mx y nuestros servicios
          </p>
          
          {/* Search bar */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10 py-3 w-full text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Buscar en preguntas frecuentes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {searchTerm ? (
          // Search results
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Resultados de búsqueda</h2>
              <p className="text-gray-600 mt-1">
                {filteredQuestions.length} {filteredQuestions.length === 1 ? 'resultado' : 'resultados'} para "{searchTerm}"
              </p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredQuestions.map((question, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start">
                    <HelpCircle size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">{question.question}</h3>
                      <p className="text-gray-600">{question.answer}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Categoría: {question.category}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredQuestions.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No se encontraron resultados para "{searchTerm}". Intenta con otros términos o contacta a nuestro soporte.
                </div>
              )}
            </div>
          </div>
        ) : (
          // FAQ categories and questions
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-8">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900">Categorías</h2>
                </div>
                <nav className="p-4">
                  <ul className="space-y-1">
                    {faqCategories.map(category => (
                      <li key={category.id}>
                        <button
                          onClick={() => setActiveCategory(category.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            activeCategory === category.id
                              ? 'bg-blue-50 text-blue-600'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {category.icon}
                          <span className="ml-3">{category.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-600 mb-3">¿No encuentras lo que buscas?</p>
                  <Link 
                    to="/contacto"
                    className="flex items-center justify-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    <MessageCircle size={16} className="mr-1" />
                    Contactar soporte
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Questions content */}
            <div className="lg:col-span-3">
              {faqCategories.map(category => (
                activeCategory === category.id && (
                  <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center">
                        {category.icon}
                        <h2 className="text-xl font-bold text-gray-900 ml-2">{category.name}</h2>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {category.questions.map((question, index) => {
                        const isExpanded = expandedQuestions[`${category.id}-${index}`];
                        
                        return (
                          <div key={index} className="p-0">
                            <button
                              onClick={() => toggleQuestion(category.id, index)}
                              className="w-full text-left p-6 flex justify-between items-center focus:outline-none hover:bg-gray-50"
                              aria-expanded={isExpanded}
                            >
                              <h3 className="font-medium text-gray-900">{question.question}</h3>
                              {isExpanded ? (
                                <ChevronUp size={20} className="text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />
                              )}
                            </button>
                            
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                isExpanded ? 'max-h-96' : 'max-h-0'
                              }`}
                            >
                              <div className="p-6 pt-0 bg-gray-50">
                                <p className="text-gray-600">{question.answer}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              ))}
              
              {/* Contact information */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Contacto</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Teléfono</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          <a href="tel:+525512345678" className="text-blue-600 hover:text-blue-800">
                            +52 55 1234 5678
                          </a>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Lunes a viernes de 9:00 a 18:00
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Correo electrónico</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          <a href="mailto:ayuda@doctor.mx" className="text-blue-600 hover:text-blue-800">
                            ayuda@doctor.mx
                          </a>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Respondemos en 24-48 horas
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <MessageCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">Chat en vivo</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Disponible en nuestra plataforma
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Lunes a domingo de 8:00 a 22:00
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Link 
                      to="/contacto"
                      className="btn-primary inline-flex items-center"
                    >
                      Ir al formulario de contacto
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Resources */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-8">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Recursos adicionales</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link 
                      to="/privacidad"
                      className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Shield size={24} className="text-blue-600 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Política de privacidad</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Conoce cómo protegemos tu información personal y datos médicos.
                        </p>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/terminos"
                      className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <FileText size={24} className="text-blue-600 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Términos y condiciones</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Revisa los términos legales de uso de nuestra plataforma.
                        </p>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/telemedicina"
                      className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Video size={24} className="text-blue-600 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Guía de telemedicina</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Aprende cómo funcionan las consultas médicas en línea.
                        </p>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/buscar"
                      className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Search size={24} className="text-blue-600 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-gray-900">Buscar médicos</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Encuentra el especialista adecuado para tus necesidades.
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AyudaPage;