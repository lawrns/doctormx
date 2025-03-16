import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Check, Shield, Clock, Calendar, CreditCard, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

// FAQ items
const faqItems = [
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
  },
  {
    question: '¿Cómo recibo mi receta médica?',
    answer: 'Después de tu consulta, el médico puede emitir recetas digitales que recibirás por correo electrónico. Estas recetas son válidas y pueden ser utilizadas en farmacias físicas o en línea.'
  },
  {
    question: '¿Puedo usar mi seguro médico para telemedicina?',
    answer: 'Muchos seguros médicos cubren consultas por telemedicina. Te recomendamos verificar con tu aseguradora antes de agendar tu cita. En nuestra plataforma puedes filtrar médicos que acepten tu seguro específico.'
  },
  {
    question: '¿Qué hago si tengo problemas técnicos durante la consulta?',
    answer: 'Contamos con soporte técnico disponible durante el horario de consultas. Si experimentas problemas, puedes contactar a nuestro equipo de soporte a través del chat en la plataforma o llamando a nuestro número de atención al cliente.'
  }
];

// Specialty cards for telemedicine
const telemedicineSpecialties = [
  { id: 'medicina-general', name: 'Medicina General', icon: '👨‍⚕️', description: 'Consultas generales, seguimiento de tratamientos y orientación médica básica.' },
  { id: 'pediatria', name: 'Pediatría', icon: '👶', description: 'Atención médica para niños, consultas de rutina y seguimiento de desarrollo.' },
  { id: 'psicologia', name: 'Psicología', icon: '🧠', description: 'Terapia psicológica, manejo de estrés, ansiedad y otros trastornos emocionales.' },
  { id: 'nutricion', name: 'Nutrición', icon: '🥗', description: 'Planes alimenticios, seguimiento nutricional y asesoría en hábitos saludables.' },
  { id: 'dermatologia', name: 'Dermatología', icon: '🧴', description: 'Diagnóstico y tratamiento de condiciones de la piel, cabello y uñas.' },
  { id: 'endocrinologia', name: 'Endocrinología', icon: '⚗️', description: 'Control de diabetes, trastornos hormonales y metabólicos.' }
];

function TelemedicinaPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Consultas médicas en línea
              </h1>
              <p className="text-xl mb-8">
                Recibe atención médica de calidad desde la comodidad de tu hogar, sin traslados ni salas de espera.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/buscar?telemedicina=true"
                  className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                >
                  <Video size={20} className="mr-2" />
                  Buscar médicos en línea
                </Link>
                <Link 
                  to="/especialidades"
                  className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Ver especialidades
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                alt="Consulta médica por videollamada" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Beneficios de la telemedicina</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              La telemedicina ofrece una forma conveniente y eficiente de recibir atención médica sin salir de casa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ahorro de tiempo</h3>
              <p className="text-gray-600">
                Evita traslados y tiempos de espera. Conecta con tu médico en minutos desde cualquier lugar.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Disponibilidad</h3>
              <p className="text-gray-600">
                Accede a consultas médicas en horarios extendidos, incluso fuera del horario laboral tradicional.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seguridad</h3>
              <p className="text-gray-600">
                Reduce el riesgo de exposición a enfermedades contagiosas al evitar salas de espera y hospitales.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Costo accesible</h3>
              <p className="text-gray-600">
                Las consultas por telemedicina suelen tener un costo menor que las presenciales, además de ahorrar en transporte.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Video className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Calidad de atención</h3>
              <p className="text-gray-600">
                Recibe la misma calidad de atención médica que en una consulta presencial, con diagnósticos precisos y seguimiento adecuado.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Check className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Continuidad</h3>
              <p className="text-gray-600">
                Mantén un seguimiento constante de tus tratamientos y condiciones crónicas sin interrupciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">¿Cómo funciona?</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Recibir atención médica en línea es sencillo y rápido con nuestra plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Busca un especialista</h3>
              <p className="text-gray-600">
                Encuentra al médico adecuado según tu necesidad, filtrando por especialidad y disponibilidad.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Agenda tu cita</h3>
              <p className="text-gray-600">
                Selecciona la fecha y hora que mejor se adapte a tu horario y confirma tu reserva.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Únete a la consulta</h3>
              <p className="text-gray-600">
                Conéctate a la videollamada en el horario programado desde cualquier dispositivo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Recibe seguimiento</h3>
              <p className="text-gray-600">
                Obtén recetas, indicaciones y seguimiento posterior a tu consulta en tu correo electrónico.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link 
              to="/buscar?telemedicina=true"
              className="btn-primary inline-flex items-center"
            >
              <Video size={20} className="mr-2" />
              Agendar consulta en línea
            </Link>
          </div>
        </div>
      </section>

      {/* Specialties section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Especialidades disponibles</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Contamos con una amplia variedad de especialidades médicas disponibles para consultas por telemedicina.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {telemedicineSpecialties.map(specialty => (
              <div key={specialty.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="text-3xl mr-3">{specialty.icon}</div>
                    <h3 className="text-xl font-semibold text-gray-900">{specialty.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{specialty.description}</p>
                  <Link 
                    to={`/buscar?especialidad=${specialty.id}&telemedicina=true`}
                    className="text-blue-600 font-medium hover:text-blue-800 flex items-center"
                  >
                    Ver médicos disponibles
                    <ChevronDown size={16} className="ml-1 transform -rotate-90" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link 
              to="/especialidades"
              className="btn-outline inline-flex items-center"
            >
              Ver todas las especialidades
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Preguntas frecuentes</h2>
            <p className="mt-4 text-lg text-gray-600">
              Resolvemos tus dudas sobre las consultas médicas en línea.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={expandedFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <div className="flex items-start">
                    <HelpCircle size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <h3 className="font-medium text-gray-900">{item.question}</h3>
                  </div>
                  {expandedFaq === index ? (
                    <ChevronUp size={20} className="text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />
                  )}
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedFaq === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="p-6 pt-0 border-t border-gray-200">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">¿Tienes más preguntas?</p>
            <Link 
              to="/contacto"
              className="btn-primary inline-flex items-center"
            >
              Contactar soporte
            </Link>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Comienza a cuidar tu salud hoy mismo</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
            Agenda tu primera consulta por telemedicina y experimenta una nueva forma de recibir atención médica de calidad.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/buscar?telemedicina=true"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Buscar médicos en línea
            </Link>
            <Link 
              to="/registro"
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TelemedicinaPage;