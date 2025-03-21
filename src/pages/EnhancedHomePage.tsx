import { Users, Calendar, ChevronRight, ChevronRight, ChevronRight, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Search, 
  Calendar, 
  Video, 
  Star, 
  Shield, 
  Clock, 
  Users, 
  ArrowRight,
  ChevronRight, 
  Award,
  MapPin,
  Heart
} from '../components/icons/IconProvider';
import { SocialIcons } from '../components/icons/IconProvider';

// Components
import SEO from '../components/seo/SEO';
import { generateHomePageSchema } from '../lib/schemaGenerators';
import EnhancedHeroSection from '../components/EnhancedHeroSection';
import EnhancedSpecialtySection from '../components/EnhancedSpecialtySection';
import SocialProofCloud from '../components/SocialProofCloud';
import LiveActivityFeed from '../components/LiveActivityFeed';
import { Button } from '../components/ui';
import Breadcrumbs from '../components/Breadcrumbs';

// Feature cards data
const features = [
  {
    title: "Evaluación de Síntomas con IA",
    description: "Nuestro asistente virtual te guía paso a paso para entender tus síntomas y encontrar la atención adecuada.",
    icon: (props) => <SocialIcons.Brain {...props} />,
    color: "blue",
    link: "/sintomas"
  },
  {
    title: "Directorio Médico Verificado",
    description: "Miles de profesionales de la salud certificados y verificados para tu tranquilidad.",
    icon: Shield,
    color: "green",
    link: "/buscar"
  },
  {
    title: "Telemedicina 24/7",
    description: "Consultas médicas en línea desde la comodidad de tu hogar, cuando lo necesites.",
    icon: Video,
    color: "purple",
    link: "/telemedicina"
  },
  {
    title: "Medicina Alternativa",
    description: "Accede a profesionales de medicina alternativa y complementaria certificados.",
    icon: Heart,
    color: "teal",
    link: "/alternativa"
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
  },
  {
    name: "Dra. Laura Vázquez",
    specialty: "Dermatología",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
    quote: "Gracias a Doctor.mx he podido expandir mi consulta y llegar a pacientes que de otra forma no habría podido atender.",
    metrics: {
      patients: "+180",
      satisfaction: "97%"
    }
  }
];

// Top specialties
const topSpecialties = [
  {
    id: 'medicina-general',
    name: 'Medicina General',
    icon: '👨‍⚕️',
    description: 'Atención integral para toda la familia'
  },
  {
    id: 'pediatria',
    name: 'Pediatría',
    icon: '👶',
    description: 'Especialistas en niños y adolescentes'
  },
  {
    id: 'ginecologia',
    name: 'Ginecología',
    icon: '👩‍⚕️',
    description: 'Salud integral de la mujer'
  },
  {
    id: 'psicologia',
    name: 'Psicología',
    icon: '🧠',
    description: 'Bienestar mental y emocional'
  },
  {
    id: 'dermatologia',
    name: 'Dermatología',
    icon: '🧴',
    description: 'Especialistas en piel, cabello y uñas'
  },
  {
    id: 'odontologia',
    name: 'Odontología',
    icon: '🦷',
    description: 'Salud bucal y tratamientos dentales'
  }
];

// Reviews data
const reviewsData = [
  {
    text: "Excelente servicio, conseguí cita el mismo día.",
    author: "Juan P.",
    rating: 5
  },
  {
    text: "El buscador de médicos es muy intuitivo y fácil de usar.",
    author: "María G.",
    rating: 5
  },
  {
    text: "Utilicé la función de telemedicina y me atendieron rápidamente.",
    author: "Roberto M.",
    rating: 4
  },
  {
    text: "La plataforma de evaluación de síntomas me ayudó a encontrar al especialista correcto.",
    author: "Laura S.",
    rating: 5
  },
  {
    text: "Muy buena experiencia con el servicio al cliente.",
    author: "Carlos F.",
    rating: 5
  }
];

function EnhancedHomePage() {
  // Generate FAQ schema data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Cómo puedo encontrar un médico en Doctor.mx?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes buscar médicos por especialidad, ubicación o nombre. También ofrecemos filtros avanzados para ayudarte a encontrar el profesional ideal para tus necesidades.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Qué es la evaluación de síntomas con IA?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Es un asistente virtual que te ayuda a entender tus síntomas y te guía hacia la atención médica adecuada, proporcionando análisis inteligente y recomendaciones personalizadas.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Puedo agendar una cita con un médico en línea?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sí, Doctor.mx te permite agendar citas con médicos de forma online, eligiendo la fecha y hora que mejor se adapte a tu horario.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Cómo funciona el servicio de telemedicina?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Puedes agendar una consulta virtual con el médico de tu elección. En el horario acordado, recibirás un enlace para iniciar la videoconsulta desde cualquier dispositivo con conexión a internet.'
        }
      },
      {
        '@type': 'Question',
        name: '¿Son confiables los médicos en Doctor.mx?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Todos los médicos en nuestra plataforma pasan por un riguroso proceso de verificación de credenciales y certificaciones para garantizar su profesionalismo y experiencia.'
        }
      }
    ]
  };

  // Generate homepage schema with all necessary structured data
  const homePageSchema = generateHomePageSchema();
  
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');
  const [userPreferences, setUserPreferences] = useState(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  
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
  
  const { ref: specialtiesRef, inView: specialtiesInView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  const { ref: reviewsRef, inView: reviewsInView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });
  
  // Simulate loading user preferences (would come from an API in a real application)
  useEffect(() => {
    setTimeout(() => {
      const mockPreferences = {
        recentSearches: [
          { specialty: 'Cardiología', location: 'Ciudad de México' },
          { specialty: 'Pediatría', location: 'Guadalajara' }
        ],
        lastVisitedDoctors: ['123', '456', '789']
      };
      
      setUserPreferences(mockPreferences);
    }, 1000);
  }, []);
  
  // Rotate through reviews
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviewsData.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <SEO 
        title="Doctor.mx | Encuentra médicos, agenda citas y consultas por telemedicina" 
        description="La plataforma líder de salud en México. Encuentra especialistas médicos, agenda citas, accede a telemedicina y evaluación de síntomas con IA."
        canonical="/"
        schema={homePageSchema}
      />
      
      {/* Hero Section */}
      <EnhancedHeroSection userPreferences={userPreferences} />

      {/* Audience Toggle */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-4">
            <div className="bg-white rounded-full shadow-sm p-1 inline-flex" role="group">
              <motion.button
                type="button"
                onClick={() => setActiveTab('patient')}
                className={`px-5 py-2 text-sm font-medium rounded-full ${
                  activeTab === 'patient'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-colors`}
                whileHover={{ scale: activeTab !== 'patient' ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                Para pacientes
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setActiveTab('doctor')}
                className={`px-5 py-2 text-sm font-medium rounded-full ${
                  activeTab === 'doctor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-colors`}
                whileHover={{ scale: activeTab !== 'doctor' ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
              >
                Para profesionales
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-y-2">
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm">
                <strong className="text-gray-900">2,500+ pacientes</strong> han reservado citas este mes
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Shield className="h-4 w-4 text-green-600 mr-1" />
                Médicos verificados
              </span>
              <span className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-600 mr-1" />
                +10,000 citas mensuales
              </span>
              <span className="flex items-center">
                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                4.8/5 satisfacción
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Reviews Carousel */}
      <div ref={reviewsRef} className="bg-blue-50 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {reviewsData.map((review, index) => (
              <motion.div
                key={index}
                className="flex items-center justify-center text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: currentReviewIndex === index ? 1 : 0,
                  y: currentReviewIndex === index ? 0 : 20,
                  position: currentReviewIndex === index ? 'relative' : 'absolute'
                }}
                transition={{ duration: 0.5 }}
              >
                {currentReviewIndex === index && (
                  <>
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-gray-700">
                      <span className="font-medium">{review.author}:</span> "{review.text}"
                    </p>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Features Section */}
      <section ref={featuresRef} className="py-16 bg-white">
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
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className={`w-12 h-12 rounded-full bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                  <feature.icon className={`text-${feature.color}-600`} size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link to={feature.link} className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                  Saber más
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Popular Specialties Section */}
      <section ref={specialtiesRef} className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={specialtiesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900">Especialidades populares</h2>
            <p className="mt-4 text-xl text-gray-600">
              Encuentra rápidamente el especialista que necesitas
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {topSpecialties.map((specialty, index) => (
              <motion.div
                key={specialty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={specialtiesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center">
                  <span className="text-3xl mr-4">{specialty.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{specialty.name}</h3>
                    <p className="text-gray-600 text-sm">{specialty.description}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Doctores disponibles: 100+</span>
                  <Link to={`/buscar?especialidad=${specialty.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                    Ver doctores
                    <ChevronRight size={16} className="ml-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Button
              as="link"
              to="/buscar"
              variant="outline"
            >
              Ver todas las especialidades
            </Button>
          </div>
        </div>
      </section>

      {/* AI Symptom Checker Section */}
      <section ref={aiRef} className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={aiInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Evaluación de Síntomas con IA</h2>
              <p className="text-xl text-blue-100 mb-8">
                Nuestro asistente virtual te ayuda a entender tus síntomas y te guía hacia la atención médica adecuada.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <SocialIcons.Brain size={20} className="text-white" />
                  </div>
                  <span>Análisis inteligente de síntomas</span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <Clock size={20} className="text-white" />
                  </div>
                  <span>Resultados en minutos</span>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center mr-3">
                    <SocialIcons.Doctor size={20} className="text-white" />
                  </div>
                  <span>Recomendaciones personalizadas</span>
                </li>
              </ul>
              <Button 
                as="link"
                to="/sintomas"
                variant="secondary"
                icon={<ChevronRight size={20} />}
                iconPosition="right"
              >
                Iniciar evaluación
              </Button>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={aiInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
                alt="AI Health Assistant"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                <div className="flex items-start">
                  <SocialIcons.Brain size={24} className="text-blue-600 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-600">
                    "Basado en tus síntomas, te recomiendo consultar con un especialista en..."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Cómo funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Busca especialistas</h3>
              <p className="text-gray-600">Encuentra al médico ideal por especialidad, ubicación y disponibilidad</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Agenda tu cita</h3>
              <p className="text-gray-600">Selecciona la fecha y hora que mejor se adapte a tu horario</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Recibe atención médica</h3>
              <p className="text-gray-600">Asiste a tu consulta presencial o conéctate vía telemedicina</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Medicine Section */}
      <section ref={alternativeRef} className="py-16 bg-gradient-to-r from-teal-600 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={alternativeInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6">Medicina Alternativa</h2>
              <p className="text-xl text-teal-100 mb-8">
                Descubre un enfoque integral para tu salud con profesionales certificados en medicina alternativa y complementaria.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-teal-700 rounded-lg p-4">
                  <Heart size={24} className="text-teal-300 mb-2" />
                  <h3 className="font-medium mb-1">Acupuntura</h3>
                  <p className="text-sm text-teal-100">Técnicas milenarias para tu bienestar</p>
                </div>
                <div className="bg-teal-700 rounded-lg p-4">
                  <Heart size={24} className="text-teal-300 mb-2" />
                  <h3 className="font-medium mb-1">Homeopatía</h3>
                  <p className="text-sm text-teal-100">Tratamientos naturales personalizados</p>
                </div>
                <div className="bg-teal-700 rounded-lg p-4">
                  <Heart size={24} className="text-teal-300 mb-2" />
                  <h3 className="font-medium mb-1">Nutrición</h3>
                  <p className="text-sm text-teal-100">Planes alimenticios integrales</p>
                </div>
                <div className="bg-teal-700 rounded-lg p-4">
                  <Heart size={24} className="text-teal-300 mb-2" />
                  <h3 className="font-medium mb-1">Quiropráctico</h3>
                  <p className="text-sm text-teal-100">Alineación y bienestar corporal</p>
                </div>
              </div>
              <Button 
                as="link"
                to="/alternativa"
                variant="secondary"
                icon={<ChevronRight size={20} />}
                iconPosition="right"
              >
                Explorar terapias
              </Button>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start mb-4">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-16 h-16 rounded-full object-cover mr-4"
                    />
                    <div>
                      <div className="flex text-yellow-400 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={16} fill="currentColor" />
                        ))}
                      </div>
                      <h3 className="font-medium text-gray-900">{story.name}</h3>
                      <p className="text-sm text-gray-600">{story.specialty}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 italic mb-4 flex-grow">"{story.quote}"</p>
                  
                  <div className="flex space-x-6 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{story.metrics.patients}</p>
                      <p className="text-sm text-gray-600">Pacientes nuevos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{story.metrics.satisfaction}</p>
                      <p className="text-sm text-gray-600">Satisfacción</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {activeTab === 'doctor' && (
            <div className="mt-10 text-center">
              <Button 
                as="link"
                to="/medicos/planes"
                variant="primary"
              >
                Únete como profesional
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof and Live Activity Section */}
      <section className="py-12 bg-gray-50">
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

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Preguntas frecuentes</h2>
            <p className="mt-4 text-xl text-gray-600">
              Respuestas a las dudas más comunes
            </p>
          </div>
          
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <motion.button
                  initial={false}
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left font-medium text-gray-900 flex justify-between items-center"
                >
                  {faq.name}
                  <ChevronDown
                    size={20}
                    className={`transform transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                  />
                </motion.button>
                
                {expandedFaq === index && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200"
                  >
                    <p className="text-gray-600">{faq.acceptedAnswer.text}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Comienza a cuidar tu salud hoy mismo</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-blue-100">
            Únete a miles de pacientes que ya encontraron al profesional de salud ideal para sus necesidades.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              as="link" 
              to="/buscar"
              variant="secondary"
              size="lg"
            >
              Buscar médicos
            </Button>
            <Button 
              as="link" 
              to="/sintomas"
              variant="outline"
              size="lg"
              className="text-white border-white hover:bg-blue-700"
            >
              Evaluar síntomas
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default EnhancedHomePage;