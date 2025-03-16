import { Link } from 'react-router-dom';
import { ArrowRight, BarChart2, Calendar, Star, Users, TrendingUp, Check } from 'lucide-react';

function ProviderCTADetailed() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-teal-50 py-16 my-12 rounded-xl overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative">
            {/* Floating elements */}
            <div className="absolute top-0 left-0 bg-white rounded-lg shadow-md p-4 z-10 animate-float">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80" 
                    alt="Doctor profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500">15:30</p>
                  <p className="font-medium">Dra. Martínez</p>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-0 right-0 bg-white rounded-lg shadow-md p-4 z-10 animate-float-delayed">
              <div className="flex flex-col items-center">
                <div className="flex text-yellow-400 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xl font-bold">4.9</p>
                <p className="text-xs text-gray-500">156 opiniones</p>
              </div>
            </div>
            
            <div className="absolute top-1/3 right-1/4 bg-white rounded-lg shadow-md p-4 z-10 animate-float-slow">
              <div>
                <div className="flex items-center mb-1">
                  <TrendingUp size={16} className="text-green-500 mr-1" />
                  <span className="text-green-500 text-sm font-medium">+38%</span>
                </div>
                <p className="font-bold text-xl">$42,800</p>
                <p className="text-xs text-gray-500">Ingresos mensuales</p>
              </div>
            </div>
            
            <img 
              src="https://images.unsplash.com/photo-1622902046580-2b47f47f5471?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
              alt="Doctor using tablet" 
              className="rounded-lg shadow-xl relative z-0 mx-auto"
              style={{ maxHeight: "360px", objectFit: "cover", objectPosition: "top" }}
            />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Eres profesional de la salud? Potencia tu práctica médica
            </h2>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                  <Users size={14} className="text-blue-600" />
                </div>
                <p className="text-gray-700">
                  Nuestra plataforma recibe más de 11 millones de visitas cada mes, hazte visible para todos esos pacientes potenciales.
                </p>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                  <Calendar size={14} className="text-blue-600" />
                </div>
                <p className="text-gray-700">
                  Permite que agenden contigo 24/7 sin depender del horario laboral o el teléfono.
                </p>
              </li>
              
              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                  <Star size={14} className="text-blue-600" />
                </div>
                <p className="text-gray-700">
                  Impulsa tu reputación en línea mostrando las opiniones de tus pacientes.
                </p>
              </li>

              <li className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                  <Check size={14} className="text-blue-600" />
                </div>
                <p className="text-gray-700">
                  <strong>Regístrate gratis sin cuotas mensuales obligatorias</strong> y accede a funciones básicas para comenzar a crecer.
                </p>
              </li>
            </ul>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/medicos/registro"
                className="btn-primary flex items-center justify-center"
              >
                Regístrate gratis
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link 
                to="/medicos/planes"
                className="btn-outline flex items-center justify-center"
              >
                Conocer planes premium
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-100 rounded-full opacity-30 -ml-20 -mb-20"></div>
    </section>
  );
}

export default ProviderCTADetailed;