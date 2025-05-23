import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, ChevronRight, Clock, Shield, Activity, Star, 
  ShoppingCart, Video, Lock, Stethoscope, Brain, Users, 
  Award, CheckCircle, ArrowRight, Heart
} from 'lucide-react';
import SEO from '../core/components/SEO';
import Button from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';

// Enhanced chat messages for the animation
const ENHANCED_MESSAGES = [
  {
    text: "¡Hola! Soy Dr. Simeon, tu médico mexicano inteligente. ¿Cómo puedo ayudarte hoy?",
    sender: "bot",
    confidence: 95
  },
  {
    text: "Tengo dolor de cabeza fuerte y un poco de fiebre desde ayer por la mañana.",
    sender: "user"
  },
  {
    text: "Entiendo tu preocupación. Analicemos estos síntomas juntos. ¿Has tomado algún medicamento?",
    sender: "bot",
    confidence: 92
  },
  {
    text: "Solo paracetamol, pero no me ha ayudado mucho.",
    sender: "user"
  },
  {
    text: "Basado en tus síntomas, te recomiendo ver a un médico. Te ayudo a encontrar uno cerca.",
    sender: "bot",
    confidence: 88
  }
];

const TRUST_METRICS = [
  { number: "25,000+", label: "Consultas realizadas", icon: MessageSquare },
  { number: "4.9", label: "Calificación promedio", icon: Star },
  { number: "98%", label: "Satisfacción del usuario", icon: Heart },
  { number: "24/7", label: "Disponibilidad", icon: Clock }
];

const ENHANCED_FEATURES = [
  {
    icon: Brain,
    title: "Inteligencia Artificial Médica",
    description: "Dr. Simeon utiliza IA avanzada entrenada específicamente para el contexto médico mexicano.",
    highlight: "90% de precisión diagnóstica"
  },
  {
    icon: Users,
    title: "Enfoque Familiar Mexicano", 
    description: "Entiende la dinámica familiar y cultural para brindarte consejos personalizados.",
    highlight: "Diseñado para familias mexicanas"
  },
  {
    icon: Shield,
    title: "Privacidad Garantizada",
    description: "Tus datos médicos están protegidos con cifrado de grado militar AES-256.",
    highlight: "100% confidencial"
  }
];

function AIHomePage() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const { theme } = useTheme();
  
  // Enhanced message rotation with thinking animation
  useEffect(() => {
    const timer = setInterval(() => {
      setIsThinking(true);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % ENHANCED_MESSAGES.length);
        setIsThinking(false);
      }, 1000);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <>
      <main className="bg-gradient-to-br from-teal-50 via-white to-blue-50 min-h-screen">
        {/* Enhanced Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Enhanced Left Column - 6 cols */}
              <div className="lg:col-span-6 space-y-8">
                <div className="space-y-6">
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
                  >
                    <span className="text-teal-600">Dr. Simeon</span>
                    <br />
                    Tu médico mexicano inteligente
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-600 leading-relaxed max-w-lg"
                  >
                    Consulta médica personalizada con inteligencia artificial. 
                    Diseñado específicamente para mexicanos, por mexicanos.
                  </motion.p>
                </div>
                
                {/* Enhanced Trust Indicators */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1594824541406-27717d7e3b59?w=40&h=40&fit=crop&crop=face" 
                          alt="Usuario satisfecho"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=40&h=40&fit=crop&crop=face" 
                          alt="Usuario satisfecho"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face" 
                          alt="Usuario satisfecho"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=40&h=40&fit=crop&crop=face" 
                          alt="Usuario satisfecho"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
                          alt="Usuario satisfecho"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <span className="ml-3 text-gray-600">+25,000 consultas realizadas</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <span className="ml-2 text-gray-600 font-medium">4.9</span>
                  </div>
                </motion.div>
                
                {/* Enhanced CTA Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <Link to="/wizard/step-1" className="block w-full sm:w-auto">
                    <Button 
                      variant="primary" 
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Iniciar consulta gratuita
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      Primeras 5 consultas gratis
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      Sin tarjeta de crédito
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                      Respuesta inmediata
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Enhanced Right Column - 6 cols */}
              <div className="lg:col-span-6">
                <div className="relative">
                  {/* Enhanced Chat Interface Preview */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto relative overflow-hidden"
                  >
                    {/* Chat Header */}
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-teal-200 shadow-lg">
                        <img 
                          src="/images/simeon.png" 
                          alt="Dr. Simeon" 
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            // Fallback to stethoscope icon if image fails to load
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML = '<div class="w-full h-full bg-teal-100 flex items-center justify-center"><svg class="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg></div>';
                            }
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Dr. Simeon</p>
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                          <p className="text-xs text-green-600 font-medium">En línea • IA Médica Mexicana</p>
                        </div>
                      </div>
                      {isThinking && (
                        <div className="ml-auto">
                          <Brain className="w-6 h-6 text-teal-500 animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    {/* Enhanced Chat Messages */}
                    <div className="space-y-4 max-h-64 overflow-hidden">
                      <motion.div
                        key={currentMessage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`${
                          ENHANCED_MESSAGES[currentMessage]?.sender === 'bot'
                            ? "bg-gradient-to-br from-teal-50 to-blue-50 text-gray-900 rounded-bl-sm rounded-tr-2xl rounded-br-2xl rounded-tl-2xl mr-8" 
                            : "bg-gradient-to-br from-blue-600 to-teal-600 text-white rounded-br-sm rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl ml-8"
                        } p-4 text-sm leading-relaxed shadow-sm`}
                      >
                        {ENHANCED_MESSAGES[currentMessage]?.text}
                        
                        {/* Confidence indicator for bot messages */}
                        {ENHANCED_MESSAGES[currentMessage]?.sender === 'bot' && ENHANCED_MESSAGES[currentMessage]?.confidence && (
                          <div className="pt-3 mt-3 border-t border-teal-100">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-teal-600 font-medium">Confianza:</span>
                              <div className="flex items-center">
                                <div className="w-16 h-1 bg-gray-200 rounded-full mr-2">
                                  <div 
                                    className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${ENHANCED_MESSAGES[currentMessage]?.confidence}%` }}
                                  ></div>
                                </div>
                                <span className="text-teal-700 font-bold">{ENHANCED_MESSAGES[currentMessage]?.confidence}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </div>
                    
                    {/* Enhanced Input Preview */}
                    <div className="mt-6 flex items-center bg-gray-50 rounded-xl p-3">
                      <input 
                        type="text" 
                        placeholder="Describe tus síntomas aquí..." 
                        className="bg-transparent border-none text-gray-700 placeholder-gray-500 flex-grow focus:outline-none text-sm"
                        disabled
                      />
                      <button className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center hover:bg-teal-700 transition-colors">
                        <ChevronRight size={16} className="text-white" />
                      </button>
                    </div>
                  </motion.div>
                  
                  {/* Floating Trust Elements */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute -top-4 -right-4 bg-green-100 rounded-full p-3 shadow-lg"
                  >
                    <Shield className="w-6 h-6 text-green-600" />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 }}
                    className="absolute -bottom-4 -left-4 bg-teal-100 rounded-full p-3 shadow-lg"
                  >
                    <Clock className="w-6 h-6 text-teal-600" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Trust Metrics Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Confianza respaldada por resultados
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Miles de mexicanos ya confían en Dr. Simeon para sus consultas médicas
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              {TRUST_METRICS.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <metric.icon className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{metric.number}</p>
                  <p className="text-gray-600">{metric.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ¿Por qué elegir Dr. Simeon?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Diseñado específicamente para las necesidades de salud mexicanas
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {ENHANCED_FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group"
                >
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-teal-600" />
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full font-medium mb-3">
                        {feature.highlight}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Enhanced Sponsors Section */}
        <section className="bg-white py-12 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
                Respaldado por partners de confianza
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="h-16 px-6 flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 font-semibold text-lg hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 transition-all">
                AXA Seguros
              </div>
              <div className="h-16 px-6 flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 font-semibold text-lg hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 transition-all">
                Farmacias Guadalajara
              </div>
              <div className="h-16 px-6 flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 font-semibold text-lg hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 transition-all">
                Farma Ahorro
              </div>
              <div className="h-16 px-6 flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 font-semibold text-lg hover:from-teal-50 hover:to-blue-50 hover:text-teal-700 transition-all">
                Telcel Health
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Services Preview Section */}
        <section className="bg-gradient-to-br from-teal-600 to-blue-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Servicios médicos completos
              </h2>
              <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                Servicios médicos integrales diseñados para tu bienestar
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 rounded-2xl p-8 text-center group hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <Activity className="w-12 h-12 text-teal-200 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-4">Análisis Clínicos</h3>
                <p className="text-teal-100 mb-4">Solicita exámenes clínicos desde tu casa con resultados rápidos y confiables.</p>
                <Link to="/lab-testing" className="inline-flex items-center text-white hover:text-teal-200 transition">
                  <span>Solicitar ahora</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 rounded-2xl p-8 text-center group hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <ShoppingCart className="w-12 h-12 text-teal-200 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-4">Farmacia Digital</h3>
                <p className="text-teal-100 mb-4">Compra y recibe tus medicamentos recetados directamente en casa.</p>
                <Link to="/farmacia" className="inline-flex items-center text-white hover:text-teal-200 transition">
                  <span>Explorar farmacia</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 rounded-2xl p-8 text-center group hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                <Video className="w-12 h-12 text-teal-200 mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-4">Teleconsulta</h3>
                <p className="text-teal-100 mb-4">Habla en vivo con médicos especialistas certificados en México.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Enhanced Security & Privacy Section */}
        <section className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Tu privacidad es nuestra prioridad
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Utilizamos los más altos estándares de seguridad para proteger tu información médica personal.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Lock className="w-6 h-6 text-green-400 mr-3" />
                    <span>Cifrado AES-256 de grado militar</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 text-green-400 mr-3" />
                    <span>Cumplimiento total con GDPR y leyes mexicanas</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-6 h-6 text-green-400 mr-3" />
                    <span>Certificación ISO 27001 en proceso</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">100% Confidencial</h3>
                  <p className="text-gray-300">
                    Tus datos médicos nunca se comparten sin tu consentimiento explícito.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Final CTA */}
        <section className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para tu primera consulta con Dr. Simeon?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Únete a miles de mexicanos que ya confían en nuestra plataforma médica inteligente.
            </p>
            
            <div className="space-y-4">
              <Link to="/wizard/step-1">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="bg-white text-teal-600 hover:bg-gray-100 px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                  Comenzar consulta gratuita
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <p className="text-teal-100 text-sm">
                Sin compromisos • Sin tarjeta de crédito • Respuesta inmediata
              </p>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-gradient-to-br from-teal-600 to-blue-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Suscríbete a nuestro boletín
              </h2>
              <p className="text-xl text-teal-100 max-w-2xl mx-auto">
                Recibe actualizaciones sobre nuevas funciones y consejos de salud
              </p>
            </div>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:border-white/50 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-teal-600 rounded-lg font-medium hover:bg-white/90 transition"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </section>

      </main>
      
      <SEO 
        title="Dr. Simeon | Tu médico mexicano inteligente - DoctorMX"
        description="Consulta médica personalizada con IA diseñada para mexicanos. Obtén orientación médica confiable las 24 horas con Dr. Simeon, tu asistente médico inteligente."
        canonical="/"
        keywords="doctor méxico, Dr. Simeon, consulta médica IA, telemedicina México, asistente médico inteligente, salud digital, medicina familiar mexicana"
      />
    </>
  );
}

export default AIHomePage;
