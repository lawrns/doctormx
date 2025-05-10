import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Image, MessageSquare, Shield, Activity, Clock } from 'lucide-react';
import SEO from '../core/components/SEO';

function AIHomePage() {
  return (
    <div className="bg-white">
      <SEO 
        title="DoctorAI | Asistente médico inteligente con IA avanzada"
        description="Consulta con nuestro asistente médico impulsado por inteligencia artificial. Obtén análisis de síntomas, diagnósticos preliminares y recomendaciones personalizadas."
        canonical="/"
        keywords="doctor ia, asistente médico, análisis de síntomas, inteligencia artificial médica, consulta médica online"
      />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#00af87] to-[#008c6c] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="md:flex md:items-center md:space-x-12">
            <div className="md:w-1/2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Tu asistente médico <span className="text-white opacity-80">inteligente</span>
                </h1>
                <div className="ml-4 flex items-center bg-white/10 rounded-full px-2 py-1">
                  <img src="/mexico-flag.png" alt="Mexico" className="h-5 w-auto mr-1" />
                  <span className="text-xs font-medium text-white">Hecho en México</span>
                </div>
              </div>
              <p className="mt-4 text-xl text-white opacity-90">
                Consulta con nuestro Doctor IA para obtener orientación médica personalizada, análisis de síntomas y recomendaciones basadas en la última tecnología de inteligencia artificial.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/doctor"
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#00af87] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-md"
                >
                  Consultar ahora
                </Link>
                <Link
                  to="/image-analysis"
                  className="px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-[#008c6c] md:py-4 md:text-lg md:px-10 shadow-md"
                >
                  Análisis de imágenes
                </Link>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2">
              <div className="relative h-64 md:h-96 flex justify-center items-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain size={280} className="text-white opacity-10" />
                </div>
                <div className="relative z-10 bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white border-opacity-20">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#00af87] flex items-center justify-center">
                      <MessageSquare size={20} className="text-white" />
                    </div>
                    <div className="text-white">
                      <p className="font-medium">Doctor IA</p>
                      <p className="text-sm text-white opacity-80">En línea ahora</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-[#00af87] bg-opacity-20 rounded-lg p-3 text-white text-sm">
                      ¿Cómo puedo ayudarte hoy?
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-3 text-white text-sm">
                      Tengo dolor de cabeza y fiebre desde ayer.
                    </div>
                    <div className="bg-[#00af87] bg-opacity-20 rounded-lg p-3 text-white text-sm">
                      Entiendo. ¿Podrías decirme si has tomado algún medicamento y si tienes otros síntomas como dolor de garganta o tos?
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Inteligencia artificial al servicio de tu salud
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Nuestro sistema utiliza tecnología avanzada para brindarte la mejor orientación médica posible.
            </p>
          </div>
          
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#00af87] rounded-md shadow-lg">
                        <Brain className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Análisis de síntomas</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Describe tus síntomas y nuestro sistema de IA analizará posibles condiciones médicas basadas en la información proporcionada.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#00af87] rounded-md shadow-lg">
                        <Image className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Análisis de imágenes</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Sube imágenes de condiciones visibles y recibe un análisis preliminar de lo que podría estar ocurriendo.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#00af87] rounded-md shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Privacidad garantizada</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Toda tu información médica está protegida con encriptación de extremo a extremo y cumplimos con los estándares de protección de datos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#00af87] rounded-md shadow-lg">
                        <Activity className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Recomendaciones personalizadas</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Recibe recomendaciones adaptadas a tu perfil médico, historial y síntomas específicos.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#00af87] rounded-md shadow-lg">
                        <MessageSquare className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Consultas ilimitadas</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Realiza todas las consultas que necesites, a cualquier hora del día, sin límites ni restricciones.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-[#00af87] rounded-md shadow-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Disponible 24/7</h3>
                    <p className="mt-5 text-base text-gray-500">
                      Accede a nuestro Doctor IA en cualquier momento, sin tiempos de espera ni horarios limitados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-[#00af87]">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">¿Listo para consultar?</span>
            <span className="block text-white opacity-80">Comienza ahora con nuestro Doctor IA.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow-lg">
              <Link
                to="/doctor"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[#00af87] bg-white hover:bg-gray-50 transition-colors"
              >
                Iniciar consulta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIHomePage;
