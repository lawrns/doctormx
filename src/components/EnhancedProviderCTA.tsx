import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, BarChart2, Calendar, Star, Users, TrendingUp, Check, DollarSign } from 'lucide-react';

function EnhancedProviderCTA() {
  const [activeTab, setActiveTab] = useState('earnings');
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false
  });
  
  // ROI Calculator state
  const [patientCount, setPatientCount] = useState(20);
  const [averagePrice, setAveragePrice] = useState(800);
  const monthlyRevenue = patientCount * averagePrice;
  const yearlyRevenue = monthlyRevenue * 12;
  
  // Variants for animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  return (
    <section ref={ref} className="bg-gradient-to-r from-blue-50 to-teal-50 py-16 my-12 rounded-xl overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              ¿Eres profesional de la salud? Potencia tu práctica médica
            </h2>
            
            <ul className="space-y-4 mb-8">
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                  <Users size={14} className="text-blue-600" />
                </div>
                <p className="text-gray-700">
                  Nuestra plataforma recibe más de 11 millones de visitas cada mes, hazte visible para todos esos pacientes potenciales.
                </p>
              </motion.li>
              
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                  <Calendar size={14} className="text-blue-600" />
                </div>
                <p className="text-gray-700">
                  Permite que agenden contigo 24/7 sin depender del horario laboral o el teléfono.
                </p>
              </motion.li>
              
              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                  <Star size={14} className="text-blue-600" />
                </div>
                <p className="text-gray-700">
                  Impulsa tu reputación en línea mostrando las opiniones de tus pacientes.
                </p>
              </motion.li>

              <motion.li 
                className="flex items-start"
                variants={itemVariants}
              >
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                  <Check size={14} className="text-blue-600" />
                </div>
                <p className="text-gray-700">
                  <strong>Regístrate gratis sin cuotas mensuales obligatorias</strong> y accede a funciones básicas para comenzar a crecer.
                </p>
              </motion.li>
            </ul>
            
            <motion.div 
              className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4"
              variants={itemVariants}
            >
              <Link 
                to="/medicos/registro"
                className="btn-primary flex items-center justify-center"
              >
                Regístrate gratis
                <ArrowRight size={18} className="ml-2" />
              </Link>
              <Link 
                to="/medicos/planes"
                className="btn-outline flex items-center justify-center"
              >
                Conocer planes premium
              </Link>
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            {activeTab === 'earnings' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Calculadora de ingresos</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pacientes nuevos por mes
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={patientCount}
                      onChange={(e) => setPatientCount(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-3 w-12 text-center font-medium">{patientCount}</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio promedio por consulta
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="500"
                      max="2000"
                      step="100"
                      value={averagePrice}
                      onChange={(e) => setAveragePrice(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="ml-3 w-16 text-center font-medium">${averagePrice}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Ingresos mensuales estimados:</span>
                    <motion.span 
                      className="text-xl font-bold text-blue-600"
                      key={monthlyRevenue}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      ${monthlyRevenue.toLocaleString()}
                    </motion.span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Ingresos anuales estimados:</span>
                    <motion.span 
                      className="text-xl font-bold text-blue-600"
                      key={yearlyRevenue}
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      ${yearlyRevenue.toLocaleString()}
                    </motion.span>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="text-blue-600 font-medium hover:text-blue-800"
                  >
                    Ver cómo se verá tu perfil →
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-blue-600 text-white p-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
                      DR
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Dr. Roberto Díaz</h3>
                      <p>Cardiología</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-gray-600">4.9 (87 opiniones)</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    Especialista en cardiología con más de 10 años de experiencia...
                  </p>
                  
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-500">Precio de consulta</span>
                    <span className="font-bold text-gray-900">${averagePrice}</span>
                  </div>
                  
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium">
                    Agendar cita
                  </button>
                </div>
                
                <div className="mt-4 text-center p-4 border-t border-gray-200">
                  <button 
                    onClick={() => setActiveTab('earnings')}
                    className="text-blue-600 font-medium hover:text-blue-800"
                  >
                    ← Volver a la calculadora
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full opacity-20 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-teal-100 rounded-full opacity-30 -ml-20 -mb-20"></div>
    </section>
  );
}

export default EnhancedProviderCTA;