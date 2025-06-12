import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MessageSquare, ChevronRight, Clock, Shield, Activity, Star, 
  ShoppingCart, Video, Lock, Stethoscope, Brain, Users, 
  Award, CheckCircle, ArrowRight, Heart, Phone, AlertTriangle,
  DollarSign, Zap, MapPin, CreditCard
} from 'lucide-react';
import SEO from '../core/components/SEO';
import Button from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

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
  const [onlineDoctors, setOnlineDoctors] = useState(147);
  const [todayConsults, setTodayConsults] = useState(3245);
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

  // Live metrics animation
  useEffect(() => {
    const metricsTimer = setInterval(() => {
      setOnlineDoctors(prev => prev + Math.floor(Math.random() * 3) - 1);
      setTodayConsults(prev => prev + Math.floor(Math.random() * 5));
    }, 5000);
    return () => clearInterval(metricsTimer);
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
                    className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight"
                  >
                    Encuentra al médico adecuado,
                    <br />
                    <span className="text-[#006D77]">fácilmente</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg leading-7 text-neutral-700 max-w-lg"
                  >
                    Dr. Simeon, tu médico virtual disponible 24/7. 
                    Consultas gratuitas con IA médica certificada.
                  </motion.p>
                </div>
                
                {/* Trust Badges */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-3"
                >
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Médicos Certificados
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    <Clock className="w-4 h-4" />
                    Consulta 24/7
                  </div>
                  <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    <MessageSquare className="w-4 h-4" />
                    {todayConsults.toLocaleString()} consultas hoy
                  </div>
                  <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm font-medium">
                    <Users className="w-4 h-4" />
                    {onlineDoctors} doctores en línea
                  </div>
                </motion.div>

                {/* Enhanced Trust Indicators with improved layout */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center space-x-6"
                >
                  <div className="flex items-center">
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
                      <span className="text-gray-600">+25,000 consultas realizadas</span>
                      <div className="flex items-center mt-1 space-x-3">
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">🔒 Datos cifrados</span>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium whitespace-nowrap">✅ NOM-004-SSA3</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
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
                  <div className="space-y-3">
                    {/* Primary CTA - AI Doctor */}
                    <Link 
                      to="/doctor"
                      className="w-full bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-6 sm:px-8 py-4 text-lg sm:text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group inline-flex items-center justify-center"
                      aria-label="Iniciar consulta médica gratuita"
                    >
                      <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Hablar con un Doctor Ahora
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    {/* Secondary CTA - Human Doctors */}
                    <Link 
                      to="/consultation/instant"
                      className="w-full bg-gradient-to-r from-[#007B8A] to-[#006D77] hover:from-[#006D77] hover:to-[#005B66] text-white px-4 sm:px-6 py-3 text-base sm:text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group inline-flex items-center justify-center border-2 border-white/20"
                      aria-label="Consulta instantánea con doctor real"
                    >
                      <Video className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Consulta Instantánea con Doctor Real - $50 MXN
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    {/* Tertiary CTA - WhatsApp */}
                    <a 
                      href="https://wa.me/+525512345678?text=Hola%20Dr.%20Simeon%2C%20necesito%20ayuda%20médica"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white px-4 sm:px-6 py-2.5 text-sm sm:text-base font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] group inline-flex items-center justify-center"
                      aria-label="Consultar por WhatsApp"
                    >
                      <Phone className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      WhatsApp Directo
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
                    className="bg-white rounded-2xl shadow-xl max-w-lg mx-auto relative overflow-hidden border border-gray-200 p-4 sm:p-6"
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
                        className={`${
                          ENHANCED_MESSAGES[currentMessage]?.sender === 'bot'
                            ? "bg-[#006D77]/10 text-[#006D77] rounded-bl-sm rounded-tr-2xl rounded-br-2xl rounded-tl-2xl mr-8 border border-[#006D77]/20" 
                            : "bg-gradient-to-r from-[#006D77] to-[#007B8A] text-white rounded-br-sm rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl ml-8"
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

        {/* Quick Services Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Nuestros Servicios</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Consulta Virtual */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate('/doctor')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#D0F0EF] rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-[#006D77]" />
                  </div>
                  <span className="text-sm text-gray-500">Respuesta inmediata</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Consulta Virtual</h3>
                <p className="text-gray-600 text-sm mb-4">Habla con Dr. Simeon o un médico real por chat o video</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#006D77] font-semibold">Desde $0 MXN</span>
                  <ArrowRight className="w-5 h-5 text-[#006D77]" />
                </div>
              </motion.div>

              {/* Análisis de Imágenes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate('/image-analysis')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#D0F0EF] rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-[#006D77]" />
                  </div>
                  <span className="text-sm text-gray-500">Análisis en segundos</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Análisis de Imágenes</h3>
                <p className="text-gray-600 text-sm mb-4">Sube fotos para diagnóstico visual con IA avanzada</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#006D77] font-semibold">Incluido gratis</span>
                  <ArrowRight className="w-5 h-5 text-[#006D77]" />
                </div>
              </motion.div>

              {/* Exámenes a Domicilio */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                onClick={() => navigate('/lab-testing')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-[#D0F0EF] rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-[#006D77]" />
                  </div>
                  <span className="text-sm text-gray-500">A domicilio</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Exámenes a Domicilio</h3>
                <p className="text-gray-600 text-sm mb-4">Laboratorios certificados van a tu casa u oficina</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#006D77] font-semibold">Desde $299 MXN</span>
                  <ArrowRight className="w-5 h-5 text-[#006D77]" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Carousel */}
        <section className="py-12 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Lo que dicen nuestros pacientes</h2>
            </div>
            <div className="relative">
              <motion.div
                key={currentMessage % MEXICAN_TESTIMONIALS.length}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-[#D0F0EF] to-white p-8 rounded-2xl shadow-lg border border-[#006D77]/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex text-yellow-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                  <img src="/Doctorlogo.png" alt="DoctorMX" className="h-8 opacity-50" />
                </div>
                <p className="text-lg text-gray-700 mb-6 italic">
                  "{MEXICAN_TESTIMONIALS[currentMessage % MEXICAN_TESTIMONIALS.length].text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-[#006D77] rounded-full flex items-center justify-center text-white font-semibold">
                    {MEXICAN_TESTIMONIALS[currentMessage % MEXICAN_TESTIMONIALS.length].name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{MEXICAN_TESTIMONIALS[currentMessage % MEXICAN_TESTIMONIALS.length].name}</p>
                    <p className="text-sm text-gray-600">{MEXICAN_TESTIMONIALS[currentMessage % MEXICAN_TESTIMONIALS.length].location}</p>
                  </div>
                </div>
              </motion.div>
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
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#D0F0EF] to-[#006D77]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-[#006D77]" />
                    </div>
                    <div className="mb-2">
                      <span className="inline-block bg-[#D0F0EF] text-[#006D77] text-xs px-3 py-1 rounded-full font-medium mb-3 uppercase tracking-wider">
                        {feature.highlight}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mexican Health Context Section - Simplified */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Consulta rápida sobre síntomas comunes
              </h2>
            </div>
            
            {/* Common Mexican Health Issues */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Consultas más comunes en México:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                {COMMON_MEXICAN_SYMPTOMS.map((item, index) => (
                  <motion.button
                    key={item.symptom}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate('/doctor', { state: { initialMessage: `Tengo problemas con ${item.symptom.toLowerCase()}` } })}
                    className={`h-24 p-3 rounded-xl border-2 hover:shadow-lg transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center text-center ${
                      item.urgent
                        ? 'border-red-200 bg-gradient-to-br from-red-50 to-red-100 hover:border-red-300 hover:from-red-100 hover:to-red-200'
                        : 'border-[#006D77]/20 bg-gradient-to-br from-[#D0F0EF]/40 to-white hover:border-[#006D77] hover:from-[#D0F0EF]/60 hover:to-[#D0F0EF]/20'
                    }`}
                  >
                    <div className="text-xl mb-1">{item.icon}</div>
                    <div className={`text-xs font-semibold leading-tight ${
                      item.urgent ? 'text-red-700' : 'text-[#006D77]'
                    }`}>
                      {item.symptom}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Simple Pricing Banner */}
        <section className="py-12 bg-gradient-to-br from-[#D0F0EF] to-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Empieza gratis, mejora cuando quieras
            </h2>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 inline-block">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-lg font-semibold text-gray-900">Plan Básico</p>
                  <p className="text-3xl font-bold text-[#006D77]">Gratis</p>
                  <p className="text-sm text-gray-600">5 consultas al mes</p>
                </div>
                <div className="text-gray-400">
                  <ArrowRight className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Plan Familiar</p>
                  <p className="text-3xl font-bold text-[#006D77]">$99 MXN</p>
                  <p className="text-sm text-gray-600">Consultas ilimitadas</p>
                </div>
              </div>
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
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
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




        {/* Simple Final CTA */}
        <section className="bg-gradient-to-r from-[#006D77] to-[#007B8A] text-white py-12 mb-16 md:mb-0">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-lg text-[#D0F0EF] mb-6">
              Habla con Dr. Simeon ahora mismo
            </p>
            <Link 
              to="/doctor"
              className="bg-white text-[#006D77] hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] inline-flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Comenzar consulta gratuita
            </Link>
          </div>
        </section>

      </main>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:hidden z-50">
        <Link 
          to="/doctor"
          className="w-full bg-gradient-to-r from-[#006D77] to-[#007B8A] hover:from-[#005B66] hover:to-[#006D77] text-white px-6 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group inline-flex items-center justify-center"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Hablar con Dr. Simeon
        </Link>
      </div>
      
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
