import React, { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ChevronRight, Clock, Shield, Activity, Star, 
  Brain, Users, Award, CheckCircle, ArrowRight, Heart, Phone, 
  AlertTriangle, Mic, Camera, TrendingUp, Family, MapPin,
  Stethoscope, Pill, Calendar, Bell, Zap, Globe, Sparkles
} from 'lucide-react';
import SEO from '../core/components/SEO';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Lazy load heavy components for better performance
const PredictiveHealthCard = React.lazy(() => import('../components/health/PredictiveHealthCard'));
const VoiceEnabledNavigation = React.lazy(() => import('../components/voice/VoiceEnabledNavigation'));
const FamilyHealthOverview = React.lazy(() => import('../components/family/FamilyHealthOverview'));
const CommunityHealthInsights = React.lazy(() => import('../components/community/CommunityHealthInsights'));
const RealTimeVitalsWidget = React.lazy(() => import('../components/vitals/RealTimeVitalsWidget'));
const AIHealthAssistant = React.lazy(() => import('../components/ai/AIHealthAssistant'));

interface PersonalizedHealthData {
  healthScore: number;
  riskFactors: Array<{
    condition: string;
    risk: number;
    prevention: string[];
  }>;
  nextActions: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: string;
  }>;
  familyInsights: {
    sharedRisks: string[];
    familyScore: number;
  };
  communityHealth: {
    localAlerts: string[];
    healthTrends: Array<{
      condition: string;
      trend: 'up' | 'down' | 'stable';
    }>;
  };
}

const ENHANCED_MESSAGES = [
  {
    text: "¡Hola! Soy Dr. Simeon, tu asistente de salud personalizado. He analizado tu perfil y tengo recomendaciones importantes para ti.",
    sender: "bot",
    confidence: 98,
    type: "personalized_greeting"
  },
  {
    text: "Basado en tu historial familiar y estilo de vida, veo que tienes un 15% de riesgo de diabetes en los próximos 5 años.",
    sender: "bot", 
    confidence: 92,
    type: "risk_assessment"
  },
  {
    text: "Te recomiendo una evaluación de glucosa y un plan nutricional personalizado. ¿Te gustaría que programe una cita?",
    sender: "bot",
    confidence: 95,
    type: "actionable_recommendation"
  }
];

const TRUST_METRICS = [
  { number: "125,000+", label: "Vidas impactadas", icon: Heart, trend: "+25%" },
  { number: "4.9", label: "Calificación IA médica", icon: Star, trend: "+0.2" },
  { number: "98%", label: "Precisión diagnóstica", icon: Brain, trend: "+3%" },
  { number: "24/7", label: "Disponibilidad global", icon: Clock, trend: "100%" }
];

const PERSONALIZED_FEATURES = [
  {
    icon: TrendingUp,
    title: "Predicciones de Salud IA",
    description: "Análisis predictivo personalizado basado en tu perfil genético, estilo de vida y entorno",
    benefits: ["Prevención proactiva", "Riesgos identificados temprano", "Plan personalizado"],
    available: true
  },
  {
    icon: Family,
    title: "Salud Familiar Integrada", 
    description: "Coordinación de salud multigeneracional con seguimiento de riesgos compartidos",
    benefits: ["Historia familiar completa", "Riesgos genéticos", "Cuidado coordinado"],
    available: true
  },
  {
    icon: Mic,
    title: "Asistente de Voz Médico",
    description: "Consultas médicas en español mexicano con comprensión cultural",
    benefits: ["Interfaz natural", "Comprensión cultural", "Acceso manos libres"],
    available: true
  },
  {
    icon: Globe,
    title: "Contexto Cultural Mexicano",
    description: "Integración de medicina tradicional con tratamientos modernos",
    benefits: ["Medicina tradicional", "Contexto cultural", "Enfoque holístico"],
    available: true
  },
  {
    icon: MapPin,
    title: "Salud Comunitaria Local",
    description: "Insights de salud pública y alertas específicas de tu región",
    benefits: ["Alertas locales", "Tendencias regionales", "Recursos comunitarios"],
    available: true
  },
  {
    icon: Sparkles,
    title: "IA Médica Colaborativa",
    description: "Múltiples modelos de IA trabajando juntos para diagnósticos precisos",
    benefits: ["Consenso IA", "Mayor precisión", "Diagnósticos complejos"],
    available: true
  }
];

export default function PersonalizedHealthHub() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [healthData, setHealthData] = useState<PersonalizedHealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [personalizedInsights, setPersonalizedInsights] = useState<any>(null);

  useEffect(() => {
    loadPersonalizedHealthData();
    
    // Auto-advance messages
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => 
        prev < ENHANCED_MESSAGES.length - 1 ? prev + 1 : 0
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [user]);

  const loadPersonalizedHealthData = async () => {
    try {
      setIsLoading(true);
      
      if (user) {
        // Load personalized health data for authenticated users
        const [healthProfile, predictions, familyData, communityData] = await Promise.all([
          fetch('/api/health/profile').then(r => r.json()),
          fetch('/api/health/predictions').then(r => r.json()),
          fetch('/api/health/family').then(r => r.json()),
          fetch('/api/health/community').then(r => r.json())
        ]);

        setHealthData({
          healthScore: predictions.healthScore || 85,
          riskFactors: predictions.riskFactors || [],
          nextActions: predictions.nextActions || [],
          familyInsights: familyData,
          communityHealth: communityData
        });

        setPersonalizedInsights(predictions.insights);
      } else {
        // Demo data for non-authenticated users
        setHealthData({
          healthScore: 78,
          riskFactors: [
            { condition: "Diabetes", risk: 15, prevention: ["Ejercicio regular", "Dieta balanceada"] },
            { condition: "Hipertensión", risk: 22, prevention: ["Reducir sodio", "Manejo de estrés"] }
          ],
          nextActions: [
            { action: "Examen de glucosa", priority: "medium", dueDate: "2 semanas" },
            { action: "Evaluación cardiológica", priority: "low", dueDate: "3 meses" }
          ],
          familyInsights: {
            sharedRisks: ["Diabetes", "Hipertensión"],
            familyScore: 82
          },
          communityHealth: {
            localAlerts: ["Aumento de casos de dengue en tu zona"],
            healthTrends: [
              { condition: "Diabetes", trend: "up" },
              { condition: "Hipertensión", trend: "stable" }
            ]
          }
        });
      }
    } catch (error) {
      console.error('Error loading personalized health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    // Process voice commands
    if (command.includes('doctor') || command.includes('consulta')) {
      navigate('/doctor', { state: { initialMessage: command } });
    } else if (command.includes('cita') || command.includes('appointment')) {
      navigate('/appointments');
    } else if (command.includes('perfil') || command.includes('profile')) {
      navigate('/profile');
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 10) return 'text-green-600';
    if (risk < 25) return 'text-yellow-600'; 
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-green-500 bg-green-50';
    }
  };

  return (
    <>
      <SEO
        title="DoctorMX - Plataforma de Salud Personalizada con IA"
        description="Plataforma avanzada de salud con IA predictiva, análisis familiar, medicina personalizada y contexto cultural mexicano. Revoluciona tu salud con tecnología de vanguardia."
        canonical="/"
        keywords="salud personalizada, IA médica, predicciones salud, medicina familiar, salud México, asistente médico IA"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Voice-Enabled Navigation */}
        <Suspense fallback={<div className="h-16 bg-white dark:bg-gray-800"></div>}>
          <VoiceEnabledNavigation 
            onVoiceCommand={handleVoiceCommand}
            enabled={voiceEnabled}
            onToggle={setVoiceEnabled}
          />
        </Suspense>

        {/* Hero Section with Personalized Greeting */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Personalized Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-800 dark:text-blue-200 text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    IA Médica de Nueva Generación
                  </motion.div>
                  
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                    Tu Salud
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                      {" "}Personalizada
                    </span>
                    <br />
                    Con IA Predictiva
                  </h1>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    La primera plataforma de salud con IA que combina medicina moderna, 
                    tradiciones mexicanas y análisis predictivo para tu bienestar integral.
                  </p>
                </div>

                {/* Personalized Health Score */}
                {healthData && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Tu Puntuación de Salud
                      </h3>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="text-2xl font-bold text-green-600">
                          {healthData.healthScore}/100
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Riesgos Identificados:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {healthData.riskFactors.length}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Acciones Pendientes:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {healthData.nextActions.length}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => navigate('/doctor')}
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Consulta IA Personalizada
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    {voiceEnabled ? 'Desactivar Voz' : 'Activar Comandos de Voz'}
                  </Button>
                </div>
              </motion.div>

              {/* Right Column - AI Chat Preview */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Chat Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <Stethoscope className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Dr. Simeon IA</h3>
                        <p className="text-blue-100 text-sm">Asistente Médico Personalizado</p>
                      </div>
                      <div className="ml-auto flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs">En línea</span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-4 space-y-4 h-64 overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {ENHANCED_MESSAGES.slice(0, currentMessageIndex + 1).map((message, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}>
                            <p className="text-sm">{message.text}</p>
                            {message.confidence && (
                              <div className="mt-2 flex items-center space-x-2">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span className="text-xs opacity-75">
                                  Confianza: {message.confidence}%
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Describe tus síntomas o haz una pregunta..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        readOnly
                      />
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate('/doctor')}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Personalized Health Dashboard */}
        {healthData && !isLoading && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Tu Panel de Salud Personalizado
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Insights inteligentes basados en tu perfil único
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Predictive Health Card */}
                <Suspense fallback={<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>}>
                  <PredictiveHealthCard 
                    healthData={healthData}
                    onActionClick={(action) => navigate('/appointments')}
                  />
                </Suspense>

                {/* Family Health Overview */}
                <Suspense fallback={<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>}>
                  <FamilyHealthOverview 
                    familyData={healthData.familyInsights}
                    onFamilyClick={() => navigate('/family-health')}
                  />
                </Suspense>

                {/* Community Health Insights */}
                <Suspense fallback={<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>}>
                  <CommunityHealthInsights 
                    communityData={healthData.communityHealth}
                    onCommunityClick={() => navigate('/community')}
                  />
                </Suspense>
              </div>
            </div>
          </section>
        )}

        {/* Advanced Features Grid */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Funciones Revolucionarias
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Tecnología de vanguardia diseñada específicamente para el contexto de salud mexicano
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PERSONALIZED_FEATURES.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      {feature.available && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Metrics Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Confianza Respaldada por Resultados
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Métricas reales de impacto en salud
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {TRUST_METRICS.map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <metric.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {metric.number}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 mb-2">
                    {metric.label}
                  </div>
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {metric.trend}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Health Assistant Widget */}
        <Suspense fallback={null}>
          <AIHealthAssistant 
            personality="mexican-empathetic"
            context={user?.user_metadata}
            onInteraction={(data) => console.log('AI interaction:', data)}
          />
        </Suspense>

        {/* Real-time Vitals Widget (if user has connected devices) */}
        {user && (
          <Suspense fallback={null}>
            <RealTimeVitalsWidget 
              userId={user.id}
              onAnomalyDetected={(anomaly) => {
                console.log('Health anomaly detected:', anomaly);
                // Could trigger notifications or emergency protocols
              }}
            />
          </Suspense>
        )}
      </div>
    </>
  );
}