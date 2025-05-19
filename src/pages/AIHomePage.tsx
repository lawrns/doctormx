import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Clock, MessageSquare, ChevronRight, Flask, ShoppingCart, Video, Lock } from 'lucide-react';
import SEO from '../core/components/SEO';
import Section from '../components/ui/Section';
import Button from '../components/ui/Button';

function AIHomePage() {
  const [currentMessage, setCurrentMessage] = useState(0);
  
  // Chat messages for the animation
  const messages = [
    "¿Cómo puedo ayudarte hoy?",
    "Tengo dolor de cabeza y fiebre desde ayer.",
    "Entiendo. ¿Podrías decirme si has tomado algún medicamento y si tienes otros síntomas como dolor de garganta o tos?"
  ];
  
  // Animation effect for messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 5000);
    
    return () => clearInterval(messageInterval);
  }, [messages.length]);
  
  // Partners shown in the design
  const partners = [
    { id: 1, name: 'AXA', logo: '/placeholders/image-placeholder.svg' },
    { id: 2, name: 'GNP', logo: '/placeholders/image-placeholder.svg' },
    { id: 3, name: 'delAhorro', logo: '/placeholders/image-placeholder.svg' },
    { id: 4, name: 'Guadalajara', logo: '/placeholders/image-placeholder.svg' },
    { id: 5, name: 'Benavides', logo: '/placeholders/image-placeholder.svg' },
  ];
  
  return (
    <>
      
      <main>
        {/* Hero Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              {/* Left column - Text content */}
              <div className="md:col-span-5">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
                  Orientación de salud <span className="text-teal-600">instantánea</span>, gratis, desde casa
                </h1>
                <Link to="/wizard/step-1">
                  <Button variant="primary" size="lg" className="bg-coral-500 hover:bg-coral-600 text-white">
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
                    <AnimatePresence mode="wait">
                      {messages.map((message, index) => (
                        (index === currentMessage) && (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`${
                              index % 2 === 0 
                                ? "bg-brand-jade-100 text-brand-charcoal rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl ml-0 mr-8" 
                                : "bg-gray-100 text-brand-charcoal rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-2xl ml-8 mr-0"
                            } p-3 text-sm`}
                          >
                            {message}
                          </motion.div>
                        )
                      ))}
                    </AnimatePresence>
                    
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
        

        
        {/* Partners Section */}
        <section className="py-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">Aliado con</h3>
            <div className="flex flex-wrap justify-start items-center gap-12">
              {partners.map((partner) => (
                <div key={partner.id} className="transition-opacity">
                  {/* Using text as a fallback since we don't have the actual logo images */}
                  <div className="h-10 bg-gray-100 px-4 flex items-center justify-center rounded">
                    <span className="font-semibold text-gray-700">{partner.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Cómo Funciona Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Cómo Funciona</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-teal-500 text-white rounded-full mb-4 mx-auto">1</div>
                <h3 className="text-xl font-semibold mb-2">Describe tus síntomas o sube foto</h3>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-teal-500 text-white rounded-full mb-4 mx-auto">2</div>
                <h3 className="text-xl font-semibold mb-2">Recibe evaluación preliminar</h3>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-12 h-12 bg-teal-500 text-white rounded-full mb-4 mx-auto">3</div>
                <h3 className="text-xl font-semibold mb-2">Accede a laboratorios, farmacias o médicos</h3>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Lo que dicen nuestros usuarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-50 rounded-lg shadow">
                <p className="text-gray-700 italic mb-4">“Me salvó un fin de semana que creí tenía apendicitis.”</p>
                <p className="font-semibold">Ana G.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg shadow">
                <p className="text-gray-700 italic mb-4">“La guía en video me ayudó a entender mi examen de laboratorio.”</p>
                <p className="font-semibold">Luis M.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg shadow">
                <p className="text-gray-700 italic mb-4">“Rápido y confiable, lo recomendaría a mis amigos.”</p>
                <p className="font-semibold">María R.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios Section */}
        <section className="bg-teal-600 py-16 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold">15,000+</p>
                <p>Consultas atendidas</p>
              </div>
              <div>
                <p className="text-4xl font-bold">98%</p>
                <p>Satisfacción</p>
              </div>
              <div>
                <p className="text-4xl font-bold">4.9</p>
                <p>Estrellas</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sneak-Peek Features Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Nuestras Funciones</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-10 h-10 bg-coral-500 text-white rounded-full mb-4 mx-auto">
                  <Flask className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Laboratorios a domicilio</h3>
                <p className="text-gray-600">Solicita exámenes clínicos desde tu casa.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-10 h-10 bg-coral-500 text-white rounded-full mb-4 mx-auto">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Carrito de farmacia</h3>
                <p className="text-gray-600">Compra y recibe tus medicamentos en casa.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-center w-10 h-10 bg-coral-500 text-white rounded-full mb-4 mx-auto">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Videoconsulta con médico</h3>
                <p className="text-gray-600">Habla en vivo con un profesional de la salud.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Recursos Destacados Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Recursos Destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link to="/blog/guia-dolor-de-cabeza" className="p-6 bg-gray-50 rounded-lg shadow hover:bg-gray-100">
                <h3 className="text-xl font-semibold mb-2">¿Dolor de cabeza? Lee nuestra guía rápida</h3>
                <p className="text-gray-600 text-sm">Síntomas, causas y recomendaciones.</p>
              </Link>
              <Link to="/blog/fiebre-causas" className="p-6 bg-gray-50 rounded-lg shadow hover:bg-gray-100">
                <h3 className="text-xl font-semibold mb-2">Fiebre: causas y tratamientos</h3>
                <p className="text-gray-600 text-sm">Aprende cómo manejar la fiebre.</p>
              </Link>
            </div>
          </div>
        </section>

        {/* Seguridad Section */}
        <section className="bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center items-center gap-8">
            <img src="/logos/cofepris.svg" alt="COFEPRIS" className="h-12" />
            <img src="/logos/inai.svg" alt="INAI" className="h-12" />
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-gray-700" />
              <p className="text-gray-700 text-sm">Cifrado AES-256 y privacidad garantizada</p>
            </div>
            <button onClick={() => alert('Política de privacidad')} className="text-teal-600 underline text-sm">Cómo protegemos tus datos</button>
          </div>
        </section>

        {/* PWA Install Section */}
        <section className="bg-white py-16 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Lleva doctor.mx en tu teléfono</h2>
            <p className="text-gray-600 mb-6">Instala nuestra PWA y accede con un solo toque.</p>
            <button onClick={() => alert('Instalar PWA')} className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded">Agregar a pantalla inicio</button>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              <details className="bg-white p-4 rounded-lg shadow">
                <summary className="font-semibold cursor-pointer">¿Es gratis?</summary>
                <p className="mt-2 text-gray-600">Sí, el servicio de orientación preliminar es completamente gratuito.</p>
              </details>
              <details className="bg-white p-4 rounded-lg shadow">
                <summary className="font-semibold cursor-pointer">¿Necesito cuenta?</summary>
                <p className="mt-2 text-gray-600">Puedes consultar sin registro, pero crear una cuenta te guarda historial.</p>
              </details>
              <details className="bg-white p-4 rounded-lg shadow">
                <summary className="font-semibold cursor-pointer">¿Es un diagnóstico real?</summary>
                <p className="mt-2 text-gray-600">Ofrecemos orientación preliminar, no sustituye la consulta médica profesional.</p>
              </details>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="bg-coral-500 text-white py-6 text-center">
          <p className="mb-4">¿Listo para comenzar tu evaluación?</p>
          <Link to="/wizard/step-1">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-coral-500">Iniciar evaluación</Button>
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
