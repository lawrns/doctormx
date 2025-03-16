import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, HelpCircle, ChevronDown, ChevronUp, Shield, Users, Star } from 'lucide-react';

// Plan features
const planFeatures = [
  {
    id: 'profile',
    name: 'Perfil profesional',
    basic: 'Perfil básico',
    pro: 'Perfil destacado',
    premium: 'Perfil premium con posicionamiento prioritario'
  },
  {
    id: 'appointments',
    name: 'Citas mensuales',
    basic: 'Hasta 10 citas',
    pro: 'Ilimitadas',
    premium: 'Ilimitadas'
  },
  {
    id: 'telemedicine',
    name: 'Telemedicina',
    basic: 'Básica (5 consultas/mes)',
    pro: <Check size={20} className="text-green-500 mx-auto" />,
    premium: <Check size={20} className="text-green-500 mx-auto" />
  },
  {
    id: 'reminders',
    name: 'Recordatorios automáticos',
    basic: <Check size={20} className="text-green-500 mx-auto" />,
    pro: <Check size={20} className="text-green-500 mx-auto" />,
    premium: <Check size={20} className="text-green-500 mx-auto" />
  },
  {
    id: 'calendar',
    name: 'Integración con agenda',
    basic: <X size={20} className="text-red-500 mx-auto" />,
    pro: <X size={20} className="text-red-500 mx-auto" />,
    premium: <Check size={20} className="text-green-500 mx-auto" />
  },
  {
    id: 'analytics',
    name: 'Estadísticas y reportes',
    basic: 'Básicas',
    pro: 'Avanzadas',
    premium: 'Premium con insights personalizados'
  },
  {
    id: 'support',
    name: 'Soporte',
    basic: 'Por correo electrónico',
    pro: 'Prioritario',
    premium: 'Dedicado 24/7'
  },
  {
    id: 'marketing',
    name: 'Herramientas de marketing',
    basic: <X size={20} className="text-red-500 mx-auto" />,
    pro: 'Básicas',
    premium: <Check size={20} className="text-green-500 mx-auto" />
  },
  {
    id: 'qa',
    name: 'Participación en Q&A',
    basic: <Check size={20} className="text-green-500 mx-auto" />,
    pro: <Check size={20} className="text-green-500 mx-auto" />,
    premium: <Check size={20} className="text-green-500 mx-auto" />
  }
];

// FAQ items
const faqItems = [
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento desde tu panel de control. Los cambios se aplicarán inmediatamente y se ajustará el cobro de forma proporcional.'
  },
  {
    question: '¿Hay algún contrato de permanencia?',
    answer: 'No, nuestros planes son flexibles y puedes cancelar en cualquier momento. No hay contratos de permanencia ni penalizaciones por cancelación.'
  },
  {
    question: '¿Cómo funciona el proceso de verificación?',
    answer: 'Para garantizar la calidad de nuestra plataforma, verificamos las credenciales profesionales de todos los médicos. Este proceso incluye la validación de tu cédula profesional y puede tomar hasta 48 horas hábiles.'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express), así como transferencias bancarias para pagos anuales.'
  },
  {
    question: '¿Ofrecen descuentos por pago anual?',
    answer: 'Sí, ofrecemos un 15% de descuento en todos nuestros planes al elegir la facturación anual en lugar de mensual.'
  },
  {
    question: '¿Puedo probar la plataforma antes de pagar?',
    answer: 'Sí, puedes comenzar con nuestro plan Básico gratuito para familiarizarte con la plataforma. También ofrecemos una prueba gratuita de 14 días de nuestros planes Pro y Premium.'
  },
  {
    question: '¿En qué se diferencia Doctor.mx de otras plataformas?',
    answer: 'A diferencia de otras plataformas que requieren pagos mensuales obligatorios, Doctor.mx permite a los profesionales de la salud registrarse y usar funciones básicas sin costo. Esto significa más opciones para los pacientes y una barrera de entrada más baja para los médicos, especialmente aquellos que están comenzando su práctica privada o trabajan en áreas menos pobladas.'
  }
];

// Success stories
const successStories = [
  {
    name: "Dra. Claudia Ramírez",
    specialty: "Nutrióloga",
    location: "Puebla",
    quote: "Doctor.mx me ayudó a lanzar mi práctica privada sin costos iniciales. En mi primer mes, recibí 8 pacientes nuevos a través de la plataforma.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Dr. Alejandro Herrera",
    specialty: "Medicina Alternativa",
    location: "Guadalajara",
    quote: "Gracias al modelo sin cuotas obligatorias, pude probar la plataforma sin riesgo. Ahora el 30% de mis pacientes vienen de Doctor.mx.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80"
  }
];

function MedicosPlanes() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  
  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Planes y precios para profesionales</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Elige el plan que mejor se adapte a tus necesidades y haz crecer tu consulta con Doctor.mx
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg inline-block text-left max-w-3xl">
            <p className="text-blue-700 font-medium">
              A diferencia de otras plataformas, en Doctor.mx puedes registrarte y comenzar <span className="font-bold">sin cuotas mensuales obligatorias</span>. Nuestro plan Básico gratuito te permite conectar con pacientes sin barreras de entrada.
            </p>
          </div>
        </div>
        
        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                billingPeriod === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                billingPeriod === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Anual <span className="text-xs font-normal text-green-500 ml-1">15% descuento</span>
            </button>
          </div>
        </div>
        
        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Basic plan */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:border-gray-300 transition-all">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Básico</h2>
                  <p className="text-3xl font-bold text-blue-600 mb-1">Gratis</p>
                  <p className="text-gray-500 text-sm mb-6">Para comenzar</p>
                </div>
                <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                  Sin cuotas mensuales
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Perfil básico en Doctor.mx</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Hasta 10 citas mensuales</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Telemedicina básica (5 consultas/mes)</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Participación en Q&A</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Soporte por correo electrónico</span>
                </li>
              </ul>
              
              <Link 
                to="/medicos/registro"
                className="block w-full py-2 px-4 bg-white border border-blue-600 text-blue-600 font-medium rounded-lg text-center hover:bg-blue-50 transition-colors"
              >
                Comenzar gratis
              </Link>
            </div>
          </div>
          
          {/* Pro plan */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-600 transform scale-105 z-10 relative">
            <div className="absolute top-0 inset-x-0 bg-blue-600 text-white text-sm font-medium text-center py-1">
              Recomendado
            </div>
            <div className="p-6 pt-9">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Profesional</h2>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {billingPeriod === 'monthly' ? '$999' : '$849'}
                </p>
                <span className="text-gray-500 ml-1">/ mes</span>
              </div>
              {billingPeriod === 'annual' && (
                <p className="text-green-600 text-sm mb-1">Facturación anual</p>
              )}
              <p className="text-gray-500 text-sm mb-6">Para médicos establecidos</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Todo lo del plan Básico</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Perfil destacado en búsquedas</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Citas ilimitadas</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Telemedicina ilimitada</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Herramientas de marketing básicas</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Soporte prioritario</span>
                </li>
              </ul>
              
              <Link 
                to="/medicos/registro"
                className="block w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg text-center hover:bg-blue-700 transition-colors"
              >
                Elegir plan Pro
              </Link>
            </div>
          </div>
          
          {/* Premium plan */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:border-gray-300 transition-all">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Premium</h2>
              <div className="flex items-baseline">
                <p className="text-3xl font-bold text-blue-600 mb-1">
                  {billingPeriod === 'monthly' ? '$1,999' : '$1,699'}
                </p>
                <span className="text-gray-500 ml-1">/ mes</span>
              </div>
              {billingPeriod === 'annual' && (
                <p className="text-green-600 text-sm mb-1">Facturación anual</p>
              )}
              <p className="text-gray-500 text-sm mb-6">Para clínicas y especialistas premium</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Todo lo de Profesional</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Posicionamiento premium</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Integración con tu agenda</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Herramientas de marketing avanzadas</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Estadísticas y reportes personalizados</span>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Soporte dedicado 24/7</span>
                </li>
              </ul>
              
              <Link 
                to="/medicos/registro"
                className="block w-full py-2 px-4 bg-white border border-blue-600 text-blue-600 font-medium rounded-lg text-center hover:bg-blue-50 transition-colors"
              >
                Elegir plan Premium
              </Link>
            </div>
          </div>
        </div>
        
        {/* Success stories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Historias de éxito</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
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
                    <p className="text-sm text-gray-600">{story.specialty}, {story.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Feature comparison */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-16">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Comparación de características</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Característica</th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Básico</th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-blue-600 uppercase tracking-wider">Profesional</th>
                  <th className="py-4 px-6 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {planFeatures.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">{feature.name}</td>
                    <td className="py-4 px-6 text-sm text-gray-500 text-center">
                      {typeof feature.basic === 'string' ? feature.basic : feature.basic}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-center bg-blue-50">
                      {typeof feature.pro === 'string' ? feature.pro : feature.pro}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 text-center">
                      {typeof feature.premium === 'string' ? feature.premium : feature.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Comparison with competitors */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-16">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">¿Por qué elegir Doctor.mx?</h2>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Característica</th>
                    <th className="py-4 px-6 text-center text-sm font-medium text-blue-600 uppercase tracking-wider">Doctor.mx</th>
                    <th className="py-4 px-6 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">Otras plataformas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">Registro gratuito</td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-center bg-blue-50">
                      <Check size={20} className="text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 text-center">
                      <X size={20} className="text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">Plan sin cuotas mensuales</td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-center bg-blue-50">
                      <Check size={20} className="text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 text-center">
                      <X size={20} className="text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">Telemedicina en plan básico</td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-center bg-blue-50">
                      <Check size={20} className="text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 text-center">
                      <X size={20} className="text-red-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">Cancelación sin penalización</td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-center bg-blue-50">
                      <Check size={20} className="text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 text-center">
                      Varía
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">Participación en Q&A</td>
                    <td className="py-4 px-6 text-sm text-gray-900 text-center bg-blue-50">
                      Todos los planes
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 text-center">
                      Solo planes pagados
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* FAQ section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Preguntas frecuentes</h2>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  className="w-full text-left p-6 flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={expandedFaq === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <div className="flex items-start">
                    <HelpCircle size={20} className="text-blue-600 mr-3 flex-shrink-0" />
                    <h3 className="font-medium text-gray-900">{item.question}</h3>
                  </div>
                  {expandedFaq === index ? (
                    <ChevronUp size={20} className="text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500 flex-shrink-0" />
                  )}
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedFaq === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="p-6 pt-0 border-t border-gray-200">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA section */}
        <div className="bg-blue-600 rounded-lg shadow-sm p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿Listo para hacer crecer tu consulta?</h2>
          <p className="text-xl mb-6 max-w-3xl mx-auto text-blue-100">
            Únete a miles de profesionales de la salud que confían en Doctor.mx para gestionar su práctica médica y conectar con nuevos pacientes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/medicos/registro"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
            >
              Registrarme gratis
            </Link>
            <Link 
              to="/contacto"
              className="px-6 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contactar con ventas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicosPlanes;