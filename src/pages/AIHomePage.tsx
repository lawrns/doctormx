import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, ChevronRight, Clock, Shield, Activity, Star, ShoppingCart, Video, Lock } from 'lucide-react';
import SEO from '../core/components/SEO';
import Button from '../components/ui/Button';

// Chat messages for the animation
const MESSAGES = [
  "¿Cómo puedo ayudarte hoy?",
  "Tengo dolor de cabeza y fiebre desde ayer.",
  "Entiendo. ¿Podrías decirme si has tomado algún medicamento?"
];

function AIHomePage() {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  // Simple message rotation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % MESSAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <>
      
      <main>
        {/* Hero Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              {/* Left column - Text content */}
              <div className="md:col-span-5">
                <p className="text-lg text-coral-500 mb-2 font-bold">Hola, Dios TodoPoderoso!</p>
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
                  Orientación de salud <span className="text-teal-600">instantánea</span>, gratis, desde casa
                </h1>
                <Link to="/wizard/step-1">
                  {/* Primary CTA button: using default primary variant for correct styling */}
                  <Button variant="primary" size="lg">
                    Iniciar evaluación
                  </Button>
                </Link>
              </div>
              
              {/* Middle column - Chat bubble */}
              <div className="md:col-span-3 order-3 md:order-2 mt-8 md:mt-0">
                <div className="rounded-2xl shadow-lg bg-white p-4 w-full md:w-72">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-brand-jade-500 flex items-center justify-center shadow-lg">
                      <MessageSquare size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-brand-charcoal">Dr. Simeon</p>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        <p className="text-xs text-gray-600">En línea ahora</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <motion.div
                      key={currentMessage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className={`${
                        currentMessage % 2 === 0 
                          ? "bg-brand-jade-100 text-brand-charcoal rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl ml-0 mr-8" 
                          : "bg-gray-100 text-brand-charcoal rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-2xl ml-8 mr-0"
                      } p-3 text-sm`}
                    >
                      {MESSAGES[currentMessage]}
                    </motion.div>
                    
                    <div className="flex items-center bg-gray-100 rounded-full p-2 mt-3">
                      <input 
                        type="text" 
                        placeholder="Escribe tu consulta aquí..." 
                        className="bg-transparent border-none text-brand-charcoal placeholder-gray-500 flex-grow focus:outline-none text-xs px-2"
                        disabled
                      />
                      <button className="w-6 h-6 rounded-full bg-brand-jade-500 flex items-center justify-center">
                        <ChevronRight size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Doctor image */}
              <div className="md:col-span-4 order-2 md:order-3">
                <div className="relative">
                  <img 
                    src="/images/simeon.png" 
                    alt="Dr. Simeon" 
                    className="h-96 w-auto relative z-10 mx-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-brand-jade-50/80 to-transparent z-20"></div>
                  {/* Subtle name tag in bottom right corner */}
                  <div className="absolute bottom-2 right-2 z-30 bg-brand-jade-500/80 text-white px-2 py-0.5 rounded-md text-xs">
                    <p className="font-medium">Dr. Simeon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section - now part of the hero section */}
        <section className="bg-gradient-to-br from-brand-jade-50 to-white pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <Clock className="text-blue-500 h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">Diagnóstico preliminar en 3 minutos</h3>
                </div>
                <p className="text-gray-600">Analiza tus síntomas y recibe evaluaciones instantáneas.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <Shield className="text-teal-500 h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">Indicaciones claras y confiables</h3>
                </div>
                <p className="text-gray-600">Nuestros resultados transparentes incluyen nivel de confianza</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="mr-4">
                    <Activity className="text-green-500 h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">Conexión a farmacias y laboratorios</h3>
                </div>
                <p className="text-gray-600">Accede fácilmente a servicios de salud cercanos.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Sponsors Section */}
        <section className="bg-white py-8 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <img src="/images/axa.png" alt="AXA" className="h-12 object-contain" />
              <img src="/images/fargdl.png" alt="Farmacias Guadalajara" className="h-12 object-contain" />
              <img src="/images/farmahor.png" alt="Farma Ahorro" className="h-12 object-contain" />
              <img src="/images/telcel.svg" alt="Telcel" className="h-12 object-contain" />
            </div>
          </div>
        </section>

        {/* Trustpilot Reviews Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que opinan de nosotros</h2>
            <div className="flex justify-center mb-4 space-x-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="text-teal-500 w-6 h-6" />)}
            </div>
            <p className="text-lg text-gray-700 mb-4">4.9 sobre 5 en Trustpilot</p>
            <a href="https://www.trustpilot.com/review/doctor.mx" target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">
              Leer más reseñas
            </a>
          </div>
        </section>

        {/* Metrics Section */}
        <section className="bg-gray-50 py-16 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-4xl font-bold text-gray-900">15,000+</p>
              <p className="text-gray-600">Consultas atendidas</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900">98%</p>
              <p className="text-gray-600">Satisfacción</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-gray-900">4.9</p>
              <p className="text-gray-600">Estrellas</p>
            </div>
          </div>
        </section>

        {/* Feature Callouts Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Nuestras Funciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-50 rounded-lg shadow">
                <Activity className="text-coral-500 w-8 h-8 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Laboratorios a domicilio</h3>
                <p className="text-gray-600">Solicita exámenes clínicos desde tu casa.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg shadow">
                <ShoppingCart className="text-coral-500 w-8 h-8 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Farmacia en 1 clic</h3>
                <p className="text-gray-600">Compra y recibe tus medicamentos en casa.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg shadow">
                <Video className="text-coral-500 w-8 h-8 mb-4 mx-auto" />
                <h3 className="font-semibold text-lg mb-2">Videoconsulta ahora</h3>
                <p className="text-gray-600">Habla en vivo con un profesional.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Ribbon */}
        <section className="bg-gray-50 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-2 text-gray-700">
              <Lock className="w-5 h-5" />
              <span>Cifrado AES-256 y privacidad garantizada</span>
            </div>
            <button onClick={() => window.alert('Política de privacidad')} className="text-teal-600 underline text-sm">
              Cómo protegemos tus datos
            </button>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="bg-brand-jade-600 text-white py-6 text-center">
          <p className="mb-4 font-semibold">¿Listo para comenzar tu evaluación?</p>
          <Link to="/wizard/step-1">
            {/* Use primary variant for clear contrast */}
            <Button variant="primary" size="md">
              Iniciar evaluación
            </Button>
          </Link>
        </div>

      </main>
      
      <SEO 
        title="DoctorMX | Tu asistente médico inteligente"
        description="Obtén orientación médica confiable al momento con nuestra plataforma impulsada por IA."
        canonical="/"
        keywords="doctor méxico, asistente médico, consulta médica online, salud digital, telemedicina"
      />
    </>
  );
}

export default AIHomePage;
