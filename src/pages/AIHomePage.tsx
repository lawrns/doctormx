import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Brain, Image, MessageSquare, Shield, Activity, Clock, ChevronRight } from 'lucide-react';
import SEO from '../core/components/SEO';
import FeatureCard from '../components/ui/FeatureCard';
import CallToAction from '../components/ui/CallToAction';

// Check if prefers-reduced-motion
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const onChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };
    
    mediaQuery.addEventListener('change', onChange);
    return () => {
      mediaQuery.removeEventListener('change', onChange);
    };
  }, []);
  
  return prefersReducedMotion;
};

function AIHomePage() {
  const controls = useAnimation();
  const [currentMessage, setCurrentMessage] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();
  
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
      id: 1,
      title: "Consultas Inmediatas",
      description: "Conecta con médicos en minutos, sin esperas ni filas.",
      icon: Clock,
      color: "primary" as const
    },
    {
      id: 2,
      title: "Red de Especialistas",
      description: "Accede a especialistas certificados en todas las áreas médicas.",
      icon: Activity,
      color: "primary" as const
    },
    {
      id: 3,
      title: "Historial Médico",
      description: "Mantén tu historial médico seguro y accesible desde cualquier lugar.",
      icon: Shield,
      color: "primary" as const
    },
    {
      id: 4,
      title: "Análisis de Síntomas",
      description: "Describe tus síntomas y nuestro sistema de IA analizará posibles condiciones médicas.",
      icon: Brain,
      color: "primary" as const
    },
  ];

  const sponsors = [
    { id: 1, name: 'Instituto Nacional de Salud', logo: '/placeholders/sponsor1.svg' },
    { id: 2, name: 'Hospital Ángeles', logo: '/placeholders/sponsor2.svg' },
    { id: 3, name: 'Universidad Nacional', logo: '/placeholders/sponsor3.svg' },
    { id: 4, name: 'Clínica Médica', logo: '/placeholders/sponsor4.svg' },
    { id: 5, name: 'Laboratorios México', logo: '/placeholders/sponsor5.svg' },
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
  
  const itemVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const navbarVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-brand-jade-500">
        Saltar al contenido principal
      </a>
      
      {/* Header */}
      <header className="sticky top-0 backdrop-blur bg-white/80 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img src="/Doctorlogo.png" alt="DoctorMX" className="h-8 w-auto" />
                <span className="ml-2 text-xl font-bold text-brand-charcoal">Doctor<span className="text-brand-jade-500">MX</span></span>
              </Link>
            </div>
            
            <motion.div 
              className="hidden md:flex space-x-8" 
              variants={navbarVariants}
              initial="hidden"
              animate="visible"
            >
              {['Características', 'Planes', 'Ayuda'].map((item, i) => (
                <motion.div key={i} variants={navItemVariants}>
                  <a href={`#${item.toLowerCase()}`} className="text-brand-charcoal hover:text-brand-jade-500 focus:text-brand-jade-500 transition-colors">
                    {item}
                  </a>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
            >
              <Link 
                to="/doctor"
                className="inline-flex items-center justify-center rounded-md px-4 py-2 font-medium bg-brand-jade-500 text-white hover:bg-brand-jade-600 focus:outline-none focus:ring-2 focus:ring-brand-jade-500 focus:ring-offset-2 transition-colors"
              >
                Comenzar
              </Link>
            </motion.div>
          </nav>
        </div>
      </header>
      
      <main id="main-content">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-brand-jade-50 to-white pt-24 pb-24 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-brand-charcoal mb-6"
                  variants={itemVariants}
                >
                  Tu salud, al instante
                </motion.h1>
                <motion.p 
                  className="text-lg text-gray-700 mb-8 max-w-lg"
                  variants={itemVariants}
                >
                  Conecta con médicos especializados desde cualquier lugar. Diagnósticos precisos, consultas inmediatas y soluciones personalizadas para tu bienestar.
                </motion.p>
                <motion.div 
                  className="flex flex-wrap gap-4"
                  variants={itemVariants}
                >
                  <Link
                    to="/doctor"
                    className="inline-flex items-center justify-center rounded-md px-6 py-3 h-12 font-medium bg-brand-jade-500 text-white hover:bg-brand-jade-600 transition-colors"
                  >
                    Consultar ahora
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center rounded-md px-6 py-3 h-12 font-medium border-2 border-brand-jade-500 text-brand-jade-500 hover:bg-brand-jade-50 transition-colors"
                  >
                    Conozca más
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div
                className="relative md:h-[500px]"
                initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 100, delay: 0.2 }}
              >
                <div className="absolute right-0 md:right-[-10%] w-full h-full max-w-md">
                  <div className="relative w-full h-full">
                    <motion.div 
                      className="absolute w-[300px] h-[300px] bg-brand-jade-50 rounded-full right-0 top-[10%]"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 4
                      }}
                    />
                    
                    {/* Chat interface */}
                    <motion.div 
                      className="relative z-10 bg-white/90 backdrop-filter backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-brand-jade-100 w-full max-w-md mt-16"
                      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-brand-jade-500 flex items-center justify-center shadow-lg">
                          <MessageSquare size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-brand-charcoal">Dr. Cóatl</p>
                          <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                            <p className="text-sm text-gray-600">En línea ahora</p>
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
                                    ? "bg-brand-jade-100 text-brand-charcoal rounded-tl-sm rounded-tr-2xl rounded-br-2xl rounded-bl-2xl ml-0 mr-8" 
                                    : "bg-gray-100 text-brand-charcoal rounded-tl-2xl rounded-tr-sm rounded-br-2xl rounded-bl-2xl ml-8 mr-0"
                                } p-4 text-sm shadow-sm`}
                              >
                                {message}
                              </motion.div>
                            )
                          ))}
                        </AnimatePresence>
                        <div className="flex items-center bg-gray-100 rounded-full p-2 mt-6">
                          <input 
                            type="text" 
                            placeholder="Escribe tu consulta aquí..." 
                            className="bg-transparent border-none text-brand-charcoal placeholder-gray-500 flex-grow focus:outline-none text-sm px-2"
                            disabled
                          />
                          <button className="w-8 h-8 rounded-full bg-brand-jade-500 flex items-center justify-center">
                            <ChevronRight size={18} className="text-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-charcoal mb-4">
                Nuestros Servicios
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Ofrecemos soluciones médicas integradas para mejorar tu experiencia de salud digital.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <FeatureCard
                    title={feature.title}
                    description={feature.description}
                    icon={feature.icon}
                    color={feature.color}
                    delay={index * 0.1}
                    className="h-full"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Sponsors Section */}
        <section className="py-10 bg-gradient-to-r from-sky-50 to-brand-jade-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="sr-only">Patrocinadores y colaboradores</h2>
            <div className="flex flex-wrap justify-around items-center gap-8">
              {sponsors.map((sponsor) => (
                <motion.div
                  key={sponsor.id}
                  className="flex items-center justify-center"
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  initial={{ opacity: 0.5 }}
                  whileInView={{ opacity: 0.5 }}
                  viewport={{ once: true }}
                >
                  <div className="h-12 w-32 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-sm text-gray-600">{sponsor.name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-16 md:py-20 bg-brand-sky-50 text-center" id="planes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-brand-charcoal mb-4">
                Planes flexibles para todos
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-12">
                Elige el plan que mejor se adapte a tus necesidades de salud y presupuesto.
              </p>
              
              <div className="flex justify-center">
                <Link 
                  to="/planes"
                  className="inline-flex items-center justify-center rounded-md px-6 py-3 font-medium bg-brand-jade-500 text-white hover:bg-brand-jade-600 transition-colors"
                >
                  Ver todos los planes
                  <ChevronRight size={18} className="ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Call to Action */}
        <CallToAction
          title="Comienza tu experiencia de salud digital hoy"
          description="Únete a miles de personas que confían en DoctorMX para su atención médica."
          primaryButtonText="Registrarme gratis"
          primaryButtonLink="/register"
          background="gradient"
          align="center"
          className="py-16 md:py-20"
        />
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <Link to="/" className="flex items-center mb-4">
                <img src="/Doctorlogo.png" alt="DoctorMX" className="h-8 w-auto" />
                <span className="ml-2 text-xl font-bold text-white">Doctor<span className="text-brand-jade-500">MX</span></span>
              </Link>
              <p className="text-sm">
                Transformando la atención médica en México con tecnología e innovación.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Planes</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Para médicos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ayuda</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm">
                <li>contacto@doctormx.com</li>
                <li>+52 (55) 1234-5678</li>
                <li>Ciudad de México, México</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center md:text-left md:flex md:justify-between">
            <p>&copy; {new Date().getFullYear()} DoctorMX. Todos los derechos reservados.</p>
            <div className="mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors mr-4">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
      
      <SEO 
        title="DoctorMX | Tu asistente médico inteligente"
        description="Conecta con médicos especializados desde cualquier lugar. Diagnósticos precisos, consultas inmediatas y soluciones personalizadas para tu bienestar."
        canonical="/"
        keywords="doctor méxico, asistente médico, consulta médica online, salud digital, telemedicina"
      />
    </div>
  );
}

export default AIHomePage;