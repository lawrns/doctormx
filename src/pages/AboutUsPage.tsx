import { Link } from 'react-router-dom';
import { Shield, Users, Star, Award, ChevronRight, Heart } from 'lucide-react';

function AboutUsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sobre Doctor.mx</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transformando la atención médica en México a través de la tecnología y la innovación
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h2>
            <p className="text-gray-600">
              Facilitar el acceso a servicios médicos de calidad para todos los mexicanos, 
              conectando pacientes con profesionales de la salud de manera eficiente y segura 
              a través de nuestra plataforma digital.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Visión</h2>
            <p className="text-gray-600">
              Ser la plataforma líder en servicios de salud digital en México, reconocida por 
              nuestra innovación, calidad y compromiso con el bienestar de la comunidad.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">+5,000</div>
            <div className="text-gray-600">Médicos Verificados</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">+50,000</div>
            <div className="text-gray-600">Pacientes Atendidos</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfacción</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Soporte Disponible</div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Nuestros Valores</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Compromiso</h3>
              <p className="text-gray-600">
                Dedicados a mejorar la salud y bienestar de nuestra comunidad
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confianza</h3>
              <p className="text-gray-600">
                Garantizamos la seguridad y privacidad de nuestros usuarios
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Excelencia</h3>
              <p className="text-gray-600">
                Mantenemos los más altos estándares de calidad en todo lo que hacemos
              </p>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestro Equipo</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un equipo multidisciplinario de profesionales comprometidos con la transformación 
              digital de la salud en México
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/doctor-board"
              className="bg-gray-50 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors"
            >
              <Award className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Junta Médica</h3>
              <p className="text-sm text-gray-600">
                Conoce a nuestros asesores médicos
              </p>
            </Link>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Equipo Técnico</h3>
              <p className="text-sm text-gray-600">
                Desarrolladores e ingenieros
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Seguridad</h3>
              <p className="text-sm text-gray-600">
                Expertos en privacidad y datos
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Heart className="h-8 w-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Soporte</h3>
              <p className="text-sm text-gray-600">
                Atención al usuario 24/7
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-lg shadow-sm p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿Quieres ser parte de Doctor.mx?</h2>
          <p className="text-xl mb-6 max-w-3xl mx-auto text-blue-100">
            Únete a nuestra red de profesionales de la salud y ayúdanos a transformar 
            la atención médica en México
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/medicos/registro"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Registrarme como médico
            </Link>
            <Link 
              to="/contacto"
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contactar al equipo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUsPage;