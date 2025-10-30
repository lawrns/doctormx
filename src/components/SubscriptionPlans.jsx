import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '../lib/toast';
import Layout from './Layout';

export default function SubscriptionPlans({ onPlanSelect, currentPlan }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingInterval, setBillingInterval] = useState('monthly');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock plans data
      const mockPlans = [
        {
          id: 'free',
          name: 'Gratuito',
          description: 'Perfecto para empezar tu viaje de salud',
          price: 0,
          currency: 'MXN',
          interval: 'monthly',
          features: [
            '3 consultas AI por mes',
            '1 análisis de imagen por mes',
            'Acceso a Dr. María y Dr. Carlos',
            'Logros y puntos básicos',
            'Soporte por email'
          ],
          limits: {
            consultations: 3,
            visionAnalysis: 1,
            prioritySupport: false,
            advancedAnalytics: false,
            customPersonalities: false,
            premiumContent: false
          },
          color: 'from-gray-500 to-gray-600',
          icon: '🆓'
        },
        {
          id: 'basic',
          name: 'Básico',
          description: 'Para usuarios que buscan más consultas',
          price: 199,
          currency: 'MXN',
          interval: 'monthly',
          features: [
            '15 consultas AI por mes',
            '5 análisis de imagen por mes',
            'Acceso a todas las personalidades',
            'Trivia médica ilimitada',
            'Soporte prioritario',
            'Análisis avanzados'
          ],
          limits: {
            consultations: 15,
            visionAnalysis: 5,
            prioritySupport: true,
            advancedAnalytics: true,
            customPersonalities: false,
            premiumContent: false
          },
          color: 'from-blue-500 to-blue-600',
          icon: '💙'
        },
        {
          id: 'premium',
          name: 'Premium',
          description: 'La opción más popular para usuarios activos',
          price: 399,
          currency: 'MXN',
          interval: 'monthly',
          features: [
            'Consultas AI ilimitadas',
            'Análisis de imagen ilimitados',
            'Personalidades personalizadas',
            'Contenido premium exclusivo',
            'Soporte prioritario 24/7',
            'Análisis avanzados y reportes',
            'Acceso anticipado a nuevas funciones'
          ],
          limits: {
            consultations: -1,
            visionAnalysis: -1,
            prioritySupport: true,
            advancedAnalytics: true,
            customPersonalities: true,
            premiumContent: true
          },
          popular: true,
          color: 'from-medical-500 to-medical-600',
          icon: '⭐'
        },
        {
          id: 'family',
          name: 'Familiar',
          description: 'Perfecto para familias que cuidan su salud juntas',
          price: 699,
          currency: 'MXN',
          interval: 'monthly',
          features: [
            'Consultas AI ilimitadas para 4 usuarios',
            'Análisis de imagen ilimitados',
            'Perfiles familiares separados',
            'Monitoreo de salud familiar',
            'Recordatorios personalizados',
            'Soporte prioritario familiar',
            'Descuentos en farmacias afiliadas'
          ],
          limits: {
            consultations: -1,
            visionAnalysis: -1,
            prioritySupport: true,
            advancedAnalytics: true,
            customPersonalities: true,
            premiumContent: true
          },
          color: 'from-green-500 to-green-600',
          icon: '👨‍👩‍👧‍👦'
        }
      ];

      setPlans(mockPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar planes de suscripción');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    if (onPlanSelect) {
      onPlanSelect(plan);
    }
  };

  const calculateSavings = (plan) => {
    if (plan.id === 'free') return 0;
    
    const payPerUseCost = 79;
    const monthlyConsultations = plan.limits.consultations === -1 ? 20 : plan.limits.consultations;
    
    if (plan.limits.consultations === -1) {
      return 0;
    }

    const payPerUseTotal = monthlyConsultations * payPerUseCost;
    const savings = payPerUseTotal - plan.price;
    
    return Math.max(0, savings);
  };

  const getFeatureIcon = (feature) => {
    if (feature.includes('consultas')) return '🩺';
    if (feature.includes('análisis')) return '🔬';
    if (feature.includes('personalidades')) return '👥';
    if (feature.includes('soporte')) return '🎧';
    if (feature.includes('análisis avanzados')) return '📊';
    if (feature.includes('contenido premium')) return '⭐';
    if (feature.includes('trivia')) return '🧠';
    if (feature.includes('logros')) return '🏆';
    return '✓';
  };

  if (loading) {
    return (
      <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    
    </Layout>
  );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Elige tu Plan de Suscripción
        </h2>
        <p className="text-gray-600 text-lg mb-6">
          Accede a todas las funciones de Doctor.mx con nuestros planes premium
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${billingInterval === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Mensual
          </span>
          <button
            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-medical-500 focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingInterval === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingInterval === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
            Anual
          </span>
          {billingInterval === 'yearly' && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              Ahorra 20%
            </span>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan?.id === plan.id;
          const savings = calculateSavings(plan);
          const yearlyPrice = billingInterval === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price * 12;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${
                plan.popular
                  ? 'border-medical-500 shadow-medical-200'
                  : isCurrentPlan
                  ? 'border-green-500 shadow-green-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-medical-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Más Popular
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Plan Actual
                  </span>
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-r ${plan.color} rounded-t-2xl p-6 text-white`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">{plan.icon}</div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-white/90 text-sm">{plan.description}</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    ${billingInterval === 'yearly' ? yearlyPrice : plan.price}
                    <span className="text-lg text-gray-500">/{billingInterval === 'yearly' ? 'año' : 'mes'}</span>
                  </div>
                  {savings > 0 && (
                    <div className="text-sm text-green-600 font-medium">
                      Ahorras ${savings} vs pagar por uso
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-lg">{getFeatureIcon(feature)}</span>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isCurrentPlan}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-medical-500 text-white hover:bg-medical-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isCurrentPlan ? 'Plan Actual' : 'Seleccionar Plan'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-12 bg-gradient-to-r from-medical-50 to-blue-50 rounded-2xl p-8 border border-medical-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          ¿Por qué elegir Doctor.mx?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-medical-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">IA Médica Avanzada</h4>
            <p className="text-sm text-gray-600">Powered by GPT-4o-mini para consultas precisas y confiables</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Precios Accesibles</h4>
            <p className="text-sm text-gray-600">Planes desde $0 hasta $699 MXN para todos los presupuestos</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Soporte 24/7</h4>
            <p className="text-sm text-gray-600">Atención al cliente disponible cuando la necesites</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Preguntas Frecuentes
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">¿Puedo cambiar de plan en cualquier momento?</h4>
            <p className="text-sm text-gray-600">Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplicarán en tu próximo ciclo de facturación.</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">¿Qué pasa si excedo mi límite de consultas?</h4>
            <p className="text-sm text-gray-600">Te notificaremos cuando te acerques a tu límite. Puedes actualizar tu plan o esperar hasta el próximo mes.</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">¿Ofrecen reembolsos?</h4>
            <p className="text-sm text-gray-600">Ofrecemos reembolso completo dentro de los primeros 7 días de tu suscripción.</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">¿Los planes incluyen análisis de imágenes?</h4>
            <p className="text-sm text-gray-600">Sí, todos los planes incluyen análisis de imágenes médicas con IA avanzada.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
