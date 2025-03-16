
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Badge } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  isPopular?: boolean;
  buttonText: string;
  buttonLink: string;
}

const plans: PricingPlan[] = [
  {
    name: "Standard",
    price: "$899",
    period: "por mes",
    features: [
      { text: "Perfil profesional mejorado" },
      { text: "1 Comunidad especializada" },
      { text: "Sistema de comunicación básico" },
      { text: "Panel de análisis esencial" },
      { text: "Soporte por email" }
    ],
    buttonText: "Seleccionar Plan",
    buttonLink: "/connect/registro"
  },
  {
    name: "Premium",
    price: "$1,999",
    period: "por mes",
    features: [
      { text: "Todo lo del plan Standard" },
      { text: "Comunidades ilimitadas" },
      { text: "Sistema de difusión avanzado" },
      { text: "Plataforma completa de contenido" },
      { text: "Flujos pre/post consulta" },
      { text: "Analytics detallados y reportes" },
      { text: "Soporte prioritario 24/7" }
    ],
    isPopular: true,
    buttonText: "Seleccionar Plan",
    buttonLink: "/connect/registro"
  }
];

const ConnectPricingPlans = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  return (
    <div className="my-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Planes Flexibles para su Práctica</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Después de sus 6 meses gratuitos con el programa Connect, elija el plan que mejor se adapte a sus necesidades
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8 justify-center">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            className={`w-full lg:max-w-md bg-white rounded-xl shadow-md overflow-hidden border ${
              plan.isPopular ? 'border-blue-400 relative lg:transform lg:scale-105 z-10' : 'border-gray-200'
            }`}
            onMouseEnter={() => setHoveredPlan(index)}
            onMouseLeave={() => setHoveredPlan(null)}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {plan.isPopular && (
              <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <Badge size={12} className="mr-1" />
                Más Popular
              </div>
            )}
            
            <div className={`p-6 text-center ${plan.isPopular ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' : 'bg-blue-500 text-white'}`}>
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <div className="text-4xl font-bold my-2">{plan.price}</div>
              <p className={`${plan.isPopular ? 'text-blue-100' : 'text-blue-100'}`}>{plan.period}</p>
            </div>
            
            <div className="p-6">
              <ul className="space-y-4 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check size={18} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                to={plan.buttonLink}
                className={`block w-full py-3 px-4 text-center rounded-lg font-medium text-white transition-colors ${
                  plan.isPopular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-10 p-5 bg-gray-50 border border-gray-200 rounded-lg text-center max-w-3xl mx-auto">
        <p className="font-semibold text-gray-800 mb-2">¿Es una clínica o grupo médico grande?</p>
        <p className="text-gray-600">
          Contáctenos para conocer nuestras soluciones empresariales con características personalizadas, integración con sistemas existentes y precios a medida.
        </p>
        <Link to="/contacto" className="inline-block mt-4 text-blue-600 font-medium hover:text-blue-800">
          Solicitar información
        </Link>
      </div>
    </div>
  );
};

export default ConnectPricingPlans;
