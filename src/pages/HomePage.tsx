import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Video, Star, Shield, Users, MapPin,
  Leaf, ChevronRight, Image
} from 'lucide-react';
import { SocialIcons } from '../components/icons/IconProvider';
import EmbeddedAIDoctor from '../components/ai/EmbeddedAIDoctor';

// Components
import SEO from '../components/seo/SEO';
import { generateHomePageSchema } from '../lib/schemaGenerators';
import DynamicHeroSection from '../components/DynamicHeroSection';
import EnhancedSpecialtySection from '../components/EnhancedSpecialtySection';
import SocialProofCloud from '../components/SocialProofCloud';
import LiveActivityFeed from '../components/LiveActivityFeed';

// Feature cards data
const features = [
  {
    title: "Evaluación de Síntomas con IA",
    description: "Nuestro asistente virtual te guía paso a paso para entender tus síntomas y encontrar la atención adecuada.",
    icon: (props: React.SVGProps<SVGSVGElement>) => <SocialIcons.Brain {...props} />,
    color: "teal"
  },
  {
    title: "Directorio Médico Verificado",
    description: "Miles de profesionales de la salud certificados y verificados para tu tranquilidad.",
    icon: Shield,
    color: "teal"
  },
  {
    title: "Telemedicina 24/7",
    description: "Consultas médicas en línea desde la comodidad de tu hogar, cuando lo necesites.",
    icon: Video,
    color: "teal"
  },
  {
    title: "Medicina Alternativa",
    description: "Accede a profesionales de medicina alternativa y complementaria certificados.",
    icon: Leaf,
    color: "teal"
  }
];

// Success stories
const successStories = [
  {
    name: "Dra. María Rodríguez",
    specialty: "Medicina General",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    quote: "Doctor.mx me ha permitido atender más pacientes y gestionar mi consulta de manera eficiente.",
    metrics: {
      patients: "+150",
      satisfaction: "98%"
    }
  },
  {
    name: "Dr. Carlos Méndez",
    specialty: "Pediatría",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    quote: "La plataforma me ayuda a mantener un seguimiento detallado de mis pacientes pediátricos.",
    metrics: {
      patients: "+200",
      satisfaction: "96%"
    }
  }
];

function HomePage() {
  // Generate enhanced schema data for homepage using our utility function
  const homePageSchemas = generateHomePageSchema();
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  
  const { ref: featuresRef, inView: featuresInView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  const { ref: aiRef, inView: aiInView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  const { ref: alternativeRef, inView: alternativeInView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  return (
    <div>
      <SEO 
        title="Doctor.mx | Encuentra médicos especialistas, agenda citas online y consultas por telemedicina" 
        description="La plataforma líder de salud en México. Encuentra especialistas médicos verificados, agenda citas presenciales, accede a telemedicina 24/7 y evaluación de síntomas con IA."
        canonical="/"
        schema={homePageSchemas}
        keywords="médicos especialistas, citas médicas online, telemedicina México, directorio médico, doctor en línea, consulta médica, diagnóstico síntomas, especialistas certificados"
      />
      {/* Hero Section */}
      <DynamicHeroSection />

      {/* Audience Toggle */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-2">
            <div className="inline-flex rounded-lg shadow-sm" role="group">
              <motion.button
                type="button"
                onClick={() => setActiveTab('patient')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  activeTab === 'patient'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: activeTab !== 'patient' ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
              >
                Para pacientes
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setActiveTab('doctor')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  activeTab === 'doctor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                whileHover={{ scale: activeTab !== 'doctor' ? 1.05 : 1 }}
                whileTap={{ scale: 0.95 }}
              >
                Para profesionales
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Elements */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm">
                <strong className="text-gray-900">2,500+ pacientes</strong> han reservado citas este mes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SocialProofCloud />
            </div>
            <div>
              <LiveActivityFeed />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section ref={featuresRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900">Todo lo que necesitas en un solo lugar</h2>
            <p className="mt-4 text-xl text-gray-600">
              Descubre una nueva forma de cuidar tu salud con nuestra plataforma integral
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 175, 135, 0.1)' }}
                className="bg-white rounded-xl shadow-sm p-6 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-blue-700"></div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Doctor Section */}
      <section ref={aiRef} className="py-16 bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={aiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              Doctor IA
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={aiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Consulta con nuestro asistente médico impulsado por inteligencia artificial avanzada. 
              Describe tus síntomas, sube imágenes o usa tu voz para recibir orientación médica personalizada.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={aiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <EmbeddedAIDoctor className="max-w-4xl mx-auto shadow-xl rounded-xl overflow-hidden" />
          </motion.div>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <motion.div 
              className="bg-white p-5 rounded-lg shadow-sm flex items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={aiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 175, 135, 0.1)' }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <SocialIcons.Brain size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Análisis inteligente</h3>
                <p className="text-sm text-gray-600">Evaluación precisa de tus síntomas con IA avanzada</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-5 rounded-lg shadow-sm flex items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={aiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 175, 135, 0.1)' }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <Image size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Análisis de imágenes</h3>
                <p className="text-sm text-gray-600">Sube fotos para una evaluación visual de tus condiciones</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-5 rounded-lg shadow-sm flex items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={aiInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 175, 135, 0.1)' }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Conexión local</h3>
                <p className="text-sm text-gray-600">Encuentra farmacias y especialistas cercanos a tu ubicación</p>
              </div>
            </motion.div>
          </div>
          
          <div className="mt-10 text-center">
            <Link
              to="/ai-doctor"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Consultar ahora
              <ChevronRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Busca especialistas</h3>
              <p className="text-gray-600">Encuentra al médico ideal por especialidad, ubicación y disponibilidad</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Agenda tu cita</h3>
              <p className="text-gray-600">Selecciona la fecha y hora que mejor se adapte a tu horario</p>
            </motion.div>
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Recibe atención médica</h3>
              <p className="text-gray-600">Asiste a tu consulta presencial o conéctate vía telemedicina</p>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Popular Specialties */}
      <EnhancedSpecialtySection />

      {/* Alternative Medicine Section */}
      <section ref={alternativeRef} className="py-16 bg-gradient-to-r from-[#00af87] to-[#008c6c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={alternativeInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold">Medicina Alternativa</h2>
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={alternativeInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="ml-4 flex items-center bg-white/10 rounded-full px-2 py-1"
                >
                  <img src="/mexico-flag.png" alt="Mexico" className="h-5 w-auto mr-1" />
                  <span className="text-xs font-medium">Hecho en México</span>
                </motion.div>
              </div>
              <p className="text-xl text-white opacity-90 mb-8">
                Descubre un enfoque integral para tu salud con profesionales certificados en medicina alternativa y complementaria.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                  whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <Leaf size={24} className="text-white mb-2" />
                  <h3 className="font-medium mb-1">Acupuntura</h3>
                  <p className="text-sm text-white opacity-90">Técnicas milenarias para tu bienestar</p>
                </motion.div>
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-4"
                  whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <Leaf size={24} className="text-white mb-2" />
                  <h3 className="font-medium mb-1">Homeopatía</h3>
                  <p className="text-sm text-white opacity-90">Tratamientos naturales personalizados</p>
                </motion.div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/alternativa"
                  className="inline-flex items-center px-6 py-3 bg-white text-[#00af87] font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-md"
                >
                  Explorar terapias
                  <ChevronRight size={20} className="ml-2" />
                </Link>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={alternativeInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <img
                src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                alt="Alternative Medicine"
                className="rounded-lg shadow-xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Historias de Éxito</h2>
            <p className="mt-4 text-xl text-gray-600">
              Conoce a los profesionales que confían en Doctor.mx
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-16 h-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic mb-4">"{story.quote}"</p>
                    <p className="font-medium text-gray-900">{story.name}</p>
                    <p className="text-sm text-gray-600">{story.specialty}</p>
                    <div className="flex mt-4 space-x-6">
                      <div>
                        <p className="text-2xl font-bold text-[#00af87]">{story.metrics.patients}</p>
                        <p className="text-sm text-gray-600">Pacientes nuevos</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#00af87]">{story.metrics.satisfaction}</p>
                        <p className="text-sm text-gray-600">Satisfacción</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#00af87] to-[#008c6c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-4"
          >
            Comienza a cuidar tu salud hoy mismo
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl mb-8 max-w-3xl mx-auto text-white opacity-90"
          >
            Únete a miles de pacientes que ya encontraron al profesional de salud ideal para sus necesidades.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Link 
              to="/buscar"
              className="px-6 py-3 bg-white text-[#00af87] font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-md"
            >
              Buscar médicos
            </Link>
            <Link 
              to="/sintomas/"
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-[#006951] transition-colors shadow-md"
            >
              Evaluar síntomas
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
