import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Brain, Image, MessageSquare, Shield, Activity, Clock, ChevronRight } from 'lucide-react';
import SEO from '../core/components/SEO';
// Import components with explicit type checking
import FeatureCard from '../components/ui/FeatureCard';
import CallToAction from '../components/ui/CallToAction';
// Import styles as JS objects, not as React components
import { animations } from '../styles/animations';

function AIHomePage() {
  const controls = useAnimation();
  const [currentMessage, setCurrentMessage] = useState(0);
  
  const messages = [
    "¿Cómo puedo ayudarte hoy?",
    "Tengo dolor de cabeza y fiebre desde ayer.",
    "Entiendo. ¿Podrías decirme si has tomado algún medicamento y si tienes otros síntomas como dolor de garganta o tos?"
  ];
  
  useEffect(() => {
    controls.start("visible");
    
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 5000);
    
    return () => clearInterval(messageInterval);
  }, [controls, messages.length]);
  
  const features = [
    {
      title: "Análisis de síntomas",
      description: "Describe tus síntomas y nuestro sistema de IA analizará posibles condiciones médicas basadas en la información proporcionada.",
      icon: Brain,
      color: "primary" as const
    },
    {
      title: "Análisis de imágenes",
      description: "Sube imágenes de condiciones visibles y recibe un análisis preliminar de lo que podría estar ocurriendo.",
      icon: Image,
      color: "secondary" as const
    },
    {
      title: "Privacidad garantizada",
      description: "Toda tu información médica está protegida con encriptación de extremo a extremo y cumplimos con los estándares de protección de datos.",
      icon: Shield,
      color: "accent" as const
    },
    {
      title: "Recomendaciones personalizadas",
      description: "Recibe recomendaciones adaptadas a tu perfil médico, historial y síntomas específicos.",
      icon: Activity,
      color: "primary" as const
    },
    {
      title: "Consultas ilimitadas",
      description: "Realiza todas las consultas que necesites, a cualquier hora del día, sin límites ni restricciones.",
      icon: MessageSquare,
      color: "secondary" as const
    },
    {
      title: "Disponible 24/7",
      description: "Accede a nuestro Doctor IA en cualquier momento, sin tiempos de espera ni horarios limitados.",
      icon: Clock,
      color: "accent" as const
    }
  ];
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="bg-white">
      <SEO 
        title="DoctorAI | Asistente médico inteligente con IA avanzada"
        description="Consulta con nuestro asistente médico impulsado por inteligencia artificial. Obtén análisis de síntomas, diagnósticos preliminares y recomendaciones personalizadas."
        canonical="/"
        keywords="doctor ia, asistente médico, análisis de síntomas, inteligencia artificial médica, consulta médica online"
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-secondary-600">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Animated Gradient Orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary-500 filter blur-3xl opacity-20"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary-500 filter blur-3xl opacity-20"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="md:flex md:items-center md:space-x-12">
            <motion.div 
              className="md:w-1/2 text-center md:text-left"
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.6,
                    ease: animations.easing.easeOut
                  }
                }
              }}
            >
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-2 md:mb-0">
                  Tu asistente médico <span className="text-white opacity-80">inteligente</span>
                </h1>
                <motion.div 
                  className="md:ml-4 flex items-center bg-white/10 rounded-full px-3 py-1.5 backdrop-blur-sm border border-white/20"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <img src="/mexico-flag.png" alt="Mexico" className="h-5 w-auto mr-2" />
                  <span className="text-xs font-medium text-white">Hecho en México</span>
                </motion.div>
              </div>
              <motion.p 
                className="mt-6 text-xl text-white opacity-90 text-lg md:text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Consulta con nuestro Doctor IA para obtener orientación médica personalizada, análisis de síntomas y recomendaciones basadas en la última tecnología de inteligencia artificial.
              </motion.p>
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Link
                  to="/doctor"
                  className="group px-8 py-3 border border-transparent text-base font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                >
                  Consultar ahora
                  <motion.span 
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ x: -5 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight size={18} />
                  </motion.span>
                </Link>
                <Link
                  to="/doctor-dashboard"
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-800/40 hover:bg-primary-800/60 backdrop-blur-sm md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Panel de Doctor
                </Link>
                <Link
                  to="/image-analysis"
                  className="px-8 py-3 border border-white/30 text-base font-medium rounded-lg text-white hover:bg-white/10 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Análisis de imágenes
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="hidden md:block md:w-1/2 mt-12 md:mt-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="relative h-96 flex justify-center items-center">
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.05, 1, 0.95, 1]
                  }}
                  transition={{ 
                    duration: 20, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <Brain size={320} className="text-white opacity-5" />
                </motion.div>
                <motion.div 
                  className="relative z-10 bg-white/10 backdrop-filter backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 w-full max-w-md"
                  whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shadow-lg">
                      <MessageSquare size={24} className="text-white" />
                    </div>
                    <div className="text-white">
                      <p className="font-semibold text-lg">Doctor IA</p>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        <p className="text-sm text-white/80">En línea ahora</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <AnimatePresence mode="wait">
                      {messages.map((message, index) => (
                        (index === currentMessage || index === currentMessage - 1 || (currentMessage === 0 && index === messages.length - 1)) && (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`${
                              index % 2 === 0 
                                ? "bg-primary-600/30 rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl" 
                                : "bg-white/20 rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-2xl"
                            } p-4 text-white text-sm shadow-sm`}
                          >
                            {message}
                          </motion.div>
                        )
                      ))}
                    </AnimatePresence>
                    <div className="flex items-center bg-white/10 rounded-full p-2 mt-6">
                      <input 
                        type="text" 
                        placeholder="Escribe tu consulta aquí..." 
                        className="bg-transparent border-none text-white placeholder-white/50 flex-grow focus:outline-none text-sm px-2"
                        disabled
                      />
                      <button className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                        <ChevronRight size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Inteligencia artificial al servicio de tu salud
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Nuestro sistema utiliza tecnología avanzada para brindarte la mejor orientación médica posible.
            </p>
          </motion.div>
          
          <motion.div 
            className="mt-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                  delay={index * 0.1}
                  className="h-full"
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* CTA Section */}
      <CallToAction
        title="¿Listo para consultar?"
        description="Comienza ahora con nuestro Doctor IA y obtén respuestas inmediatas a tus preguntas médicas."
        primaryButtonText="Iniciar consulta"
        primaryButtonLink="/doctor"
        secondaryButtonText="Conocer más"
        secondaryButtonLink="/about"
        background="gradient"
        align="center"
        className="py-16"
      />
    </div>
  );
}

export default AIHomePage;
