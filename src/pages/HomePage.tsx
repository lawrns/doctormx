import React from 'react';
import { SocialIcons } from "../components/icons/IconProvider";
import SEO from "../components/seo/SEO";
import EnhancedHeroSection from "../components/EnhancedHeroSection";
import SocialProofCloud from "../components/SocialProofCloud";
import LiveActivityFeed from "../components/LiveActivityFeed";

const HomePage: React.FC = () => {
  return (
    <>
      {/* SEO */}
      <SEO 
        title="Doctor.mx - Encuentra médicos especialistas en México"
        description="Conectamos pacientes con los mejores médicos especialistas de México. Agenda citas fácilmente y recibe atención médica de calidad."
      />
      
      {/* Hero Section */}
      <EnhancedHeroSection />
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              ¿Por qué elegir Doctor.mx?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos la forma más fácil y confiable de encontrar y reservar citas con médicos especialistas en México.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-xl p-6 text-center transition-transform hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Doctores Verificados</h3>
              <p className="text-gray-600">
                Todos nuestros médicos son verificados y cuentan con credenciales profesionales validadas.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-green-50 rounded-xl p-6 text-center transition-transform hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Citas Inmediatas</h3>
              <p className="text-gray-600">
                Encuentra citas disponibles y agenda al instante, sin largas esperas ni complicaciones.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-purple-50 rounded-xl p-6 text-center transition-transform hover:transform hover:scale-105">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Reseñas Verificadas</h3>
              <p className="text-gray-600">
                Lee opiniones de pacientes reales y toma decisiones informadas sobre tu atención médica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              En tres simples pasos podrás conectar con el médico especialista que necesitas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step line connector (visible on md screens and up) */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-blue-200 z-0"></div>
            
            {/* Step 1 */}
            <div className="relative z-10">
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto -mt-10 mb-6 text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Busca Especialista</h3>
                <p className="text-gray-600 mb-4">
                  Encuentra el médico ideal según especialidad, ubicación o disponibilidad.
                </p>
                <img 
                  src="/images/illustrations/search-doctor.svg" 
                  alt="Buscar médico" 
                  className="w-40 h-40 mx-auto" 
                />
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="relative z-10">
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto -mt-10 mb-6 text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Agenda tu Cita</h3>
                <p className="text-gray-600 mb-4">
                  Selecciona el horario que más te convenga y agenda en segundos.
                </p>
                <img 
                  src="/images/illustrations/book-appointment.svg" 
                  alt="Agendar cita" 
                  className="w-40 h-40 mx-auto" 
                />
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="relative z-10">
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto -mt-10 mb-6 text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Recibe Atención</h3>
                <p className="text-gray-600 mb-4">
                  Asiste a tu cita y recibe atención médica de calidad.
                </p>
                <img 
                  src="/images/illustrations/doctor-consultation.svg" 
                  alt="Consulta médica" 
                  className="w-40 h-40 mx-auto" 
                />
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <a
              href="/how-it-works"
              className="btn btn-outline px-8 py-3 rounded-lg inline-flex items-center"
            >
              Conocer más
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
      
      {/* Social Proof Cloud */}
      <SocialProofCloud />
      
      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Lo que dicen nuestros pacientes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Miles de pacientes satisfechos con el servicio de Doctor.mx.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4 italic">
                "Encontré un excelente cardiólogo cerca de mi casa en minutos. La plataforma es super fácil de usar y pude agendar mi cita al instante. ¡Totalmente recomendado!"
              </p>
              <div className="flex items-center">
                <img 
                  src="/images/testimonials/patient-1.jpg" 
                  alt="Paciente" 
                  className="w-12 h-12 rounded-full object-cover mr-4" 
                />
                <div>
                  <p className="font-semibold text-gray-800">Laura Méndez</p>
                  <p className="text-gray-500 text-sm">Paciente de Cardiología</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4 italic">
                "Como padre primerizo, necesitaba un pediatra urgentemente. Gracias a Doctor.mx encontré uno disponible el mismo día. El proceso fue rápido y las reseñas me ayudaron a elegir con confianza."
              </p>
              <div className="flex items-center">
                <img 
                  src="/images/testimonials/patient-2.jpg" 
                  alt="Paciente" 
                  className="w-12 h-12 rounded-full object-cover mr-4" 
                />
                <div>
                  <p className="font-semibold text-gray-800">Miguel Álvarez</p>
                  <p className="text-gray-500 text-sm">Paciente de Pediatría</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4 italic">
                "He usado Doctor.mx varias veces para diferentes especialidades y siempre ha sido una experiencia excelente. Los recordatorios de citas y la facilidad para reagendar son características que realmente valoro."
              </p>
              <div className="flex items-center">
                <img 
                  src="/images/testimonials/patient-3.jpg" 
                  alt="Paciente" 
                  className="w-12 h-12 rounded-full object-cover mr-4" 
                />
                <div>
                  <p className="font-semibold text-gray-800">Carolina Torres</p>
                  <p className="text-gray-500 text-sm">Paciente recurrente</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <a
              href="/testimonials"
              className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
            >
              Ver más testimonios
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Comienza a cuidar tu salud hoy mismo
            </h2>
            <p className="text-lg md:text-xl mb-8 text-blue-100">
              Más de 100,000 pacientes ya confían en Doctor.mx para encontrar los mejores especialistas médicos en México.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <a
                href="/search"
                className="btn bg-white text-blue-600 hover:bg-gray-100 text-center px-8 py-3 rounded-lg text-lg font-medium"
              >
                Buscar médicos
              </a>
              <a
                href="/register"
                className="btn bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 text-center px-8 py-3 rounded-lg text-lg font-medium"
              >
                Crear cuenta
              </a>
            </div>
          </div>
        </div>
      </section>
      
      {/* Live Activity Feed */}
      <LiveActivityFeed />
      
      {/* Social Media Icons */}
      <div className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-white p-2 rounded-l-lg shadow-md hidden lg:block">
        <SocialIcons className="flex flex-col space-y-4" />
      </div>
    </>
  );
};

export default HomePage;