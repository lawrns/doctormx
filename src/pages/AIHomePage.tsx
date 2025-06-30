import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Brain,
  CheckCircle,
  ChevronRight, Clock,
  Heart,
  Lock,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Star,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../core/components/SEO';

import Onboarding from '../components/Onboarding';

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

const PRICING_TIERS = [
  {
    name: "Consulta Básica",
    price: "Gratis",
    period: "Siempre",
    features: ["5 consultas mensuales", "Síntomas básicos", "Orientación general", "Chat básico"]
  },
  {
    name: "Familia Premium", 
    price: "$99 MXN",
    period: "mes",
    features: ["Consultas ilimitadas", "4 miembros familia", "Análisis de imágenes", "Prioridad 24/7", "WhatsApp directo"]
  }
];

const MEXICAN_TESTIMONIALS = [
  { name: "María C.", location: "CDMX", text: "Dr. Simeon me ayudó con mi diabetes. Muy confiable y entiende nuestra cultura." },
  { name: "Carlos R.", location: "Guadalajara", text: "Excelente para consultas familiares. Por fin un doctor que habla como mexicano." },
  { name: "Ana L.", location: "Monterrey", text: "Muy rápido y conoce los medicamentos que hay en México. Lo recomiendo." }
];

const COMMON_MEXICAN_SYMPTOMS = [
  { symptom: "Diabetes", icon: "🩺", urgent: false },
  { symptom: "Presión alta", icon: "❤️", urgent: true },
  { symptom: "Dolor de cabeza", icon: "🤕", urgent: false },
  { symptom: "Fiebre", icon: "🌡️", urgent: true },
  { symptom: "Dolor de estómago", icon: "😷", urgent: false },
  { symptom: "Tos y gripe", icon: "🤧", urgent: false }
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
  const [chatInput, setChatInput] = useState('');
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
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

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      // Navigate to doctor page with the initial message
      navigate('/doctor', { state: { initialMessage: chatInput.trim() } });
    }
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };
  
  return (
    <>
      {/* Emergency Protocol Banner */}
      <div className="bg-red-500 text-white p-3 text-center font-medium text-sm">
        🚨 <strong>EMERGENCIA:</strong> Llama 911 inmediatamente. Dr. Simeon NO reemplaza atención de emergencia.
        <span className="ml-4">📞 Cruz Roja: 065</span>
      </div>
      
      <main className="bg-gradient-to-br from-[#D0F0EF] via-white to-slate-50 min-h-screen overflow-x-hidden">
        {/* Enhanced Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Enhanced Left Column - 6 cols */}
              <div className="lg:col-span-6 space-y-8">
                <div className="space-y-6">
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="aihomepage-hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight"
                  >
                    <span className="text-[#006D77]">Dr. Simeon</span>
                    <br />
                    <span className="aihomepage-hero-subtitle-text">Tu médico mexicano inteligente</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="aihomepage-hero-subtitle text-lg leading-7 text-neutral-700 max-w-lg"
                  >
                    Consulta médica personalizada con inteligencia artificial.
                    Diseñado específicamente para mexicanos, por mexicanos.
                  </motion.p>
                </div>
                
                {/* Enhanced Trust Indicators with improved layout */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="aihomepage-trust-indicators flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-6"
                >
                  <div className="flex items-center justify-center sm:justify-start">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#006D77] to-[#005B66] flex items-center justify-center text-white font-semibold text-sm">
                        MC
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#007B8A] to-[#006D77] flex items-center justify-center text-white font-semibold text-sm">
                        AR
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#006D77] to-[#007B8A] flex items-center justify-center text-white font-semibold text-sm">
                        LS
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#005B66] to-[#006D77] flex items-center justify-center text-white font-semibold text-sm">
                        JM
                      </div>
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#007B8A] to-[#005B66] flex items-center justify-center text-white font-semibold text-sm">
                        SP
                      </div>
                    </div>
                    <div className="ml-3">
                      <span className="aihomepage-trust-text text-gray-600">+25,000 consultas realizadas</span>
                      <div className="aihomepage-trust-badges flex flex-col sm:flex-row sm:items-center mt-1 space-y-1 sm:space-y-0 sm:space-x-3">
                        <span className="aihomepage-trust-badge text-xs text-gray-500 uppercase tracking-wider font-medium">🔒 Datos cifrados</span>
                        <span className="aihomepage-trust-badge text-xs text-gray-500 uppercase tracking-wider font-medium">✅ NOM-004-SSA3</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start">
                    <div className="flex text-yellow-400">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <span className="ml-2 text-gray-600 font-medium">4.9</span>
                  </div>
                </motion.div>
                
                {/* Enhanced CTA Section with WhatsApp Integration */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <div className="aihomepage-cta-buttons flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                    {/* Mobile-optimized buttons */}
                    <Link
                      to="/doctor"
                      className="aihomepage-touch-target flex-1 bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-4 sm:px-6 py-3 text-base sm:text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group inline-flex items-center justify-center min-h-[44px]"
                      aria-label="Iniciar consulta médica gratuita"
                    >
                      <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Consulta Web Gratis
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <a
                      href="https://wa.me/+525512345678?text=Hola%20Dr.%20Simeon%2C%20necesito%20ayuda%20médica"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aihomepage-touch-target flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 sm:px-6 py-3 text-base sm:text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group inline-flex items-center justify-center min-h-[44px]"
                      aria-label="Consultar por WhatsApp"
                    >
                      <Phone className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      WhatsApp Directo
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                  
                  {/* Medical Credentials */}
                  <div className="border-l-4 border-[#006D77] pl-4 bg-[#D0F0EF]/30 p-3 sm:p-4 rounded">
                    <p className="text-sm font-medium text-[#006D77]">
                      ✅ Cédula Profesional: 987654321 (México)
                      <br />
                      ✅ Certificado • NOM-004-SSA3-2012
                      <br />
                      ✅ Supervisión médica 24/7
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-[#006D77] mr-1" />
                      <span className="text-xs uppercase tracking-wider">Primeras 5 consultas gratis</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-[#006D77] mr-1" />
                      <span className="text-xs uppercase tracking-wider">Sin tarjeta de crédito</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-[#006D77] mr-1" />
                      <span className="text-xs uppercase tracking-wider">Respuesta inmediata</span>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Enhanced Right Column - 6 cols */}
              <div className="lg:col-span-6 mt-8 lg:mt-0">
                <div className="relative">
                  {/* Luxury Enhanced Chat Interface Preview */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="aihomepage-chat-container bg-white rounded-2xl shadow-xl max-w-lg mx-auto relative overflow-hidden border border-gray-200 p-4 sm:p-6"
                  >
                    {/* Professional Chat Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shadow-lg">
                        <img 
                          src="/images/simeon.png" 
                          alt="Dr. Simeon - IA Médica Mexicana" 
                          className="w-full h-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML = '<div class="w-full h-full bg-[#D0F0EF] flex items-center justify-center"><svg class="w-6 h-6 text-[#006D77]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg></div>';
                            }
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Dr. Simeon</p>
                        <div className="flex items-center">
                          <motion.span 
                            className="w-2 h-2 bg-[#006D77] rounded-full mr-2"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          ></motion.span>
                          <p className="text-sm text-[#006D77]">En línea • IA Médica Mexicana</p>
                        </div>
                      </div>
                      {isThinking && (
                        <motion.div 
                          className="ml-auto"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <Brain className="w-6 h-6 text-[#006D77]" />
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Enhanced Chat Messages with improved styling */}
                    <div className="space-y-4 max-h-64 overflow-hidden">
                      <motion.div
                        key={currentMessage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`aihomepage-chat-message ${
                          ENHANCED_MESSAGES[currentMessage]?.sender === 'bot'
                            ? "bg-[#006D77]/10 text-[#006D77] rounded-bl-sm rounded-tr-2xl rounded-br-2xl rounded-tl-2xl mr-4 sm:mr-8 border border-[#006D77]/20"
                            : "bg-gradient-to-r from-[#006D77] to-[#007B8A] text-white rounded-br-sm rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl ml-4 sm:ml-8"
                        } p-4 text-sm leading-relaxed shadow-sm`}
                      >
                        {ENHANCED_MESSAGES[currentMessage]?.text}
                        
                        {/* Enhanced Confidence indicator */}
                        {ENHANCED_MESSAGES[currentMessage]?.sender === 'bot' && ENHANCED_MESSAGES[currentMessage]?.confidence && (
                          <div className="pt-3 mt-3 border-t border-[#006D77]/20">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#006D77] font-medium uppercase tracking-wider">Confianza:</span>
                              <div className="flex items-center">
                                <div className="w-16 h-1 bg-gray-200 rounded-full mr-2">
                                  <motion.div 
                                    className="h-full bg-[#006D77] rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${ENHANCED_MESSAGES[currentMessage]?.confidence}%` }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                  ></motion.div>
                                </div>
                                <span className="text-[#006D77] font-bold">{ENHANCED_MESSAGES[currentMessage]?.confidence}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                      
                      {/* Typing indicator */}
                      {isThinking && (
                        <motion.div 
                          className="bg-gray-50 rounded-lg p-3 mr-8"
                          animate={{ opacity: [0.5, 1, 0.5] }} 
                          transition={{ repeat: Infinity, duration: 1.2 }}
                        >
                          <span className="text-sm text-gray-400">Dr. Simeon está escribiendo…</span>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Enhanced Input Preview - NOW FUNCTIONAL */}
                    <form onSubmit={handleChatSubmit} className="mt-6">
                      <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#006D77] focus-within:border-transparent">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={handleChatInputChange}
                          placeholder="Describe tus síntomas aquí…" 
                          className="bg-transparent border-none text-gray-700 placeholder-gray-500 flex-grow focus:outline-none text-sm"
                          aria-label="Campo de entrada para síntomas"
                        />
                        <button 
                          type="submit"
                          disabled={!chatInput.trim()}
                          className="w-8 h-8 rounded-lg bg-[#006D77] flex items-center justify-center hover:bg-[#005B66] transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Enviar mensaje"
                        >
                          <ChevronRight size={16} className="text-white" />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                  
                  {/* Professional Floating Trust Elements */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute -top-4 -right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-[#006D77]/20"
                  >
                    <Shield className="w-6 h-6 text-[#006D77]" />
                  </motion.div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 }}
                    className="absolute -bottom-4 -left-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-[#006D77]/20"
                  >
                    <Clock className="w-6 h-6 text-[#006D77]" />
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
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Confianza respaldada por resultados
              </h2>
              <p className="text-lg leading-7 text-neutral-700 max-w-2xl mx-auto">
                Miles de mexicanos ya confían en Dr. Simeon para sus consultas médicas
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {TRUST_METRICS.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                >
                  <div className="w-12 h-12 bg-[#D0F0EF] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <metric.icon className="w-6 h-6 text-[#006D77]" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{metric.number}</p>
                  <p className="text-gray-600 text-xs uppercase tracking-wider">{metric.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                ¿Por qué elegir Dr. Simeon?
              </h2>
              <p className="text-lg leading-7 text-neutral-700 max-w-2xl mx-auto">
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
                  className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group border border-gray-100"
                >
                  <div className="aihomepage-feature-content mb-6">
                    <div className="aihomepage-feature-icon-container w-16 h-16 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
                      <feature.icon className="aihomepage-feature-icon w-8 h-8 text-[#006D77]" />
                    </div>
                    <div className="aihomepage-feature-badge-container mb-2">
                      <span className="aihomepage-feature-badge inline-block bg-[#D0F0EF] text-[#006D77] text-xs px-3 py-1 rounded-full font-medium mb-3 uppercase tracking-wider">
                        {feature.highlight}
                      </span>
                    </div>
                    <h3 className="aihomepage-feature-title text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="aihomepage-feature-description text-neutral-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Mexican Health Context Section */}
        <section className="py-16 bg-gradient-to-br from-[#D0F0EF]/20 via-white to-[#006D77]/5 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-[#006D77] rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#007B8A] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                Especializado para <span className="text-[#006D77]">México</span>
              </h2>
              <p className="text-xl leading-8 text-neutral-700 max-w-3xl mx-auto">
                La primera plataforma médica con IA diseñada específicamente para el sistema de salud mexicano
              </p>
            </div>

            {/* Enhanced Mexican Features Grid */}
            <div className="mexican-features-container mb-16">
              <div className="bg-gradient-to-br from-white via-[#D0F0EF]/30 to-white p-8 sm:p-12 rounded-3xl shadow-xl border border-[#006D77]/10 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#006D77]/20 to-transparent"></div>
                </div>

                <div className="relative">
                  <div className="text-center mb-10">
                   
                    <h3 className="text-2xl font-bold text-[#006D77] mb-4">
                      Diseñado para el Sistema de Salud Mexicano
                    </h3>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      Conocemos las particularidades del sistema de salud en México y hemos adaptado nuestra IA para brindarte la mejor experiencia
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mexican-feature-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-xl">💊</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Medicamentos Mexicanos</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Base de datos completa de medicamentos genéricos y de patente disponibles en México
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mexican-feature-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-xl">🏛️</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">IMSS/ISSSTE</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Información actualizada sobre costos, procedimientos y cobertura de instituciones públicas
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="mexican-feature-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-xl">🏪</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Farmacias Cercanas</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Localiza farmacias cercanas con disponibilidad de medicamentos en tiempo real
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mexican-feature-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-xl">👨‍⚕️</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Médicos Locales</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Red de médicos certificados en tu estado con disponibilidad y especialidades
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mexican-feature-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-xl">🏠</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Contexto Cultural</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Comprende la dinámica familiar mexicana y tradiciones de salud locales
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="mexican-feature-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-xl">👨‍👩‍👧‍👦</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Enfoque Familiar</h4>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Planes de salud diseñados para toda la familia mexicana con precios accesibles
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Common Mexican Health Issues */}
            <div className="common-symptoms-container mb-16">
              <div className="bg-gradient-to-br from-white via-gray-50/50 to-white p-8 sm:p-12 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#006D77]/30 to-transparent rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-400/20 to-transparent rounded-full blur-3xl"></div>
                </div>

                <div className="relative">
                  {/* Enhanced section header */}
                  <div className="text-center mb-12">
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                      Consultas más comunes en <span className="text-[#006D77]">México</span>
                    </h3>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Inicia tu consulta médica con un solo clic. Dr. Simeon está especializado en los problemas de salud más frecuentes en México.
                    </p>
                  </div>

                  {/* Enhanced symptoms grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {COMMON_MEXICAN_SYMPTOMS.map((item, index) => (
                      <motion.div
                        key={item.symptom}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`common-symptom-card group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center space-x-4 text-left min-h-[80px] ${
                          item.urgent
                            ? 'border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50/50 hover:border-red-300 hover:shadow-red-100'
                            : 'border-[#006D77]/20 bg-gradient-to-br from-[#D0F0EF]/30 via-white to-[#D0F0EF]/20 hover:border-[#006D77] hover:shadow-[#006D77]/10'
                        }`}
                      >
                        {/* Urgent indicator */}
                        {item.urgent && (
                          <div className="absolute top-2 right-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          </div>
                        )}

                        {/* Icon container */}
                        <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 ${
                          item.urgent
                            ? 'bg-gradient-to-br from-red-100 to-red-200 group-hover:from-red-200 group-hover:to-red-300'
                            : 'bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 group-hover:from-[#006D77]/20 group-hover:to-[#007B8A]/20'
                        }`}>
                          {item.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-base mb-1 transition-colors duration-300 ${
                            item.urgent ? 'text-red-800 group-hover:text-red-900' : 'text-[#006D77] group-hover:text-[#005B66]'
                          }`}>
                            {item.symptom}
                          </h4>
                          <p className={`text-sm transition-colors duration-300 ${
                            item.urgent ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {item.urgent ? 'Consulta urgente recomendada' : 'Consulta médica disponible'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Call-to-action footer */}
                  <div className="text-center mt-10 pt-8 border-t border-gray-200">
                    <p className="text-gray-600 mb-4">
                      ¿No encuentras tu síntoma? Dr. Simeon puede ayudarte con cualquier consulta médica.
                    </p>
                    <Link
                      to="/doctor"
                      className="inline-flex items-center bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg hover:shadow-xl"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Iniciar Consulta Personalizada
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Specialized Services Section */}
            <div className="specialized-services-container mb-16">
              <div className="bg-gradient-to-br from-white via-[#D0F0EF]/30 to-white p-8 sm:p-12 rounded-3xl shadow-xl border border-[#006D77]/10 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#006D77]/30 to-transparent rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tr from-[#007B8A]/20 to-transparent rounded-full blur-3xl"></div>
                </div>

                <div className="relative">
                  {/* Enhanced section header */}
                  <div className="text-center mb-12">
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                      Servicios <span className="text-[#006D77]">Especializados</span>
                    </h3>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Tecnología médica avanzada y análisis especializados para un diagnóstico más preciso y tratamientos personalizados
                    </p>
                  </div>

                  {/* Enhanced services grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Constitutional Analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="specialized-service-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">🧘‍♀️</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Análisis Constitucional</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Descubre tu tipo constitucional ayurvédico y recibe recomendaciones personalizadas de hierbas y estilo de vida.
                          </p>
                          <Link
                            to="/constitutional-analysis"
                            className="specialized-service-button bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium hover:scale-[1.02] shadow-md hover:shadow-lg"
                          >
                            Comenzar Análisis
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>

                    {/* Image Analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="specialized-service-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">📱</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Análisis de Imágenes Médicas</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Análisis médico avanzado: facial, ojos, lengua, piel, uñas y postura con IA de segunda generación.
                          </p>
                          <Link
                            to="/advanced-image-analysis"
                            className="specialized-service-button bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium hover:scale-[1.02] shadow-md hover:shadow-lg"
                          >
                            Analizar Imagen
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>

                    {/* Lab Testing */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="specialized-service-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">🧪</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Laboratorios</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Encuentra laboratorios cercanos y obtén interpretación de resultados médicos.
                          </p>
                          <Link
                            to="/lab-testing"
                            className="specialized-service-button bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium hover:scale-[1.02] shadow-md hover:shadow-lg"
                          >
                            Ver Laboratorios
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>

                    {/* Progress Tracking */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="specialized-service-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">📊</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Seguimiento de Progreso</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Monitorea síntomas, establece objetivos y recibe análisis inteligente de tu evolución.
                          </p>
                          <Link
                            to="/profile/progress"
                            className="specialized-service-button bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium hover:scale-[1.02] shadow-md hover:shadow-lg"
                          >
                            Ver Dashboard
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>

                    {/* Protocol Timeline */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="specialized-service-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-[#006D77]/10"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">📋</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-2 text-lg">Protocolos de Tratamiento</h4>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4">
                            Planes estructurados día a día con hierbas, dieta y hábitos personalizados para tu condición.
                          </p>
                          <Link
                            to="/profile/protocols"
                            className="specialized-service-button bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-4 py-2 rounded-lg transition-all duration-200 inline-flex items-center gap-2 text-sm font-medium hover:scale-[1.02] shadow-md hover:shadow-lg"
                          >
                            Ver Protocolos
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-gradient-to-br from-[#D0F0EF] to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Precios justos para familias mexicanas
              </h2>
              <p className="text-lg leading-7 text-neutral-700 max-w-2xl mx-auto">
                Sin sorpresas, sin letra pequeña. Transparencia total.
              </p>
            </div>
            
            <div className="aihomepage-pricing-grid grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {PRICING_TIERS.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`bg-white p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border-2 ${
                    index === 1 ? 'border-[#006D77] relative' : 'border-gray-200'
                  }`}
                >
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#006D77] text-white px-4 py-2 rounded-full text-sm font-medium">
                        🔥 Más Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-[#006D77]">{tier.price}</span>
                      {tier.period && <span className="text-gray-600 ml-1">/{tier.period}</span>}
                    </div>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-[#006D77] mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/doctor"
                    className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] inline-flex items-center justify-center ${
                      index === 1
                        ? 'bg-[#006D77] text-white hover:bg-[#005B66] shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {index === 0 ? 'Empezar Gratis' : 'Elegir Premium'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mexican Testimonials Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Lo que dicen los mexicanos
              </h2>
              <p className="text-lg leading-7 text-neutral-700 max-w-2xl mx-auto">
                Testimonios reales de familias mexicanas que confían en Dr. Simeon
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {MEXICAN_TESTIMONIALS.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="aihomepage-testimonial-card bg-gradient-to-br from-[#D0F0EF] to-white p-4 sm:p-6 rounded-xl border border-[#006D77]/20 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex text-yellow-400 mb-4">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="aihomepage-testimonial-text text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#006D77] rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
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
              <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                Respaldado por instituciones mexicanas de confianza
              </p>
            </div>
            <div className="aihomepage-sponsors-mobile flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="h-16 px-6 flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 font-semibold text-lg hover:from-[#D0F0EF] hover:to-[#006D77]/10 hover:text-[#006D77] transition-all">
                Regulado
              </div>
              <div className="h-16 px-6 flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 font-semibold text-lg hover:from-[#D0F0EF] hover:to-[#006D77]/10 hover:text-[#006D77] transition-all">
                Farmacias Guadalajara
              </div>
              <div className="h-16 px-6 flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 font-semibold text-lg hover:from-[#D0F0EF] hover:to-[#006D77]/10 hover:text-[#006D77] transition-all">
                Farmacias del Ahorro
              </div>
              <div className="h-16 px-6 flex items-center bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg text-gray-700 font-semibold text-lg hover:from-[#D0F0EF] hover:to-[#006D77]/10 hover:text-[#006D77] transition-all">
                IMSS Digital
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Security & Privacy Section */}
        <section className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-3xl font-extrabold mb-6 tracking-tight">
                  Tu privacidad es nuestra prioridad
                </h2>
                <p className="text-gray-300 text-lg leading-7 mb-8">
                  Cumplimos con todas las leyes mexicanas de protección de datos y utilizamos los más altos estándares de seguridad.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Lock className="w-6 h-6 text-[#006D77] mr-3" />
                    <span>Cifrado AES-256 de grado militar</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-6 h-6 text-[#006D77] mr-3" />
                    <span>Cumplimiento LFPDPPP (Ley Federal de Protección de Datos Personales)</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="w-6 h-6 text-[#006D77] mr-3" />
                    <span>Servidores ubicados en México</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-[#006D77] mr-3" />
                    <span>Datos nunca salen del territorio mexicano</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-2xl border border-gray-700">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-[#006D77] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">100% Confidencial</h3>
                  <p className="text-gray-300 mb-4">
                    Tus datos médicos nunca se comparten sin tu consentimiento explícito.
                  </p>
                  <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4">
                    <p className="text-sm text-amber-200">
                      <strong>AVISO MÉDICO:</strong> Dr. Simeon proporciona orientación educativa. 
                      En emergencias, contacte 911 o Cruz Roja (065). Cumplimos con NOM-004-SSA3-2012.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Enhanced Final CTA */}
        <section className="bg-gradient-to-r from-[#006D77] to-[#007B8A] text-white py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold mb-6 tracking-tight">
              ¿Listo para tu primera consulta con Dr. Simeon?
            </h2>
            <p className="text-xl text-[#D0F0EF] mb-8">
              Únete a miles de mexicanos que ya confían en nuestra plataforma médica inteligente.
            </p>
            
            <div className="space-y-4">
              <Link 
                to="/doctor"
                className="bg-white text-[#006D77] hover:bg-gray-100 px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group inline-flex items-center justify-center"
                aria-label="Comenzar consulta médica gratuita"
              >
                <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                Comenzar consulta gratuita
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <p className="text-[#D0F0EF] text-sm">
                Sin compromisos • Sin tarjeta de crédito • Respuesta inmediata
              </p>
            </div>
          </div>
        </section>

      </main>
      
      {/* Onboarding for new users */}
      <Onboarding />
      
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
