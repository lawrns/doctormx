
import { motion } from 'framer-motion';
import { ArrowRight, Shield, CheckCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConnectHeroSectionProps {
  referralId?: string;
  referrerInfo?: {
    name?: string;
    specialty?: string;
  } | null;
  doctorsJoined: number;
}

const ConnectHeroSection = ({ referralId, referrerInfo, doctorsJoined }: ConnectHeroSectionProps) => {
  const navigate = useNavigate();
  
  const handleRegisterClick = () => {
    navigate('/medicos/registro?connect=true' + (referralId ? `&ref=${referralId}` : ''));
  };
  
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="#0D47A1" />
              <circle cx="0" cy="0" r="2" fill="#0D47A1" />
              <circle cx="0" cy="100" r="2" fill="#0D47A1" />
              <circle cx="100" cy="0" r="2" fill="#0D47A1" />
              <circle cx="100" cy="100" r="2" fill="#0D47A1" />
              <line x1="50" y1="50" x2="0" y2="0" stroke="#0D47A1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="0" y2="100" stroke="#0D47A1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="100" y2="0" stroke="#0D47A1" strokeWidth="0.5" />
              <line x1="50" y1="50" x2="100" y2="100" stroke="#0D47A1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <div className="mb-8">
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-3"
              >
                <Shield size={16} className="mr-1" /> 
                {referrerInfo ? 'Invitación exclusiva' : 'Programa exclusivo por invitación'}
              </motion.div>
            </div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Revolucione su Atención Médica <span className="text-blue-600">con 6 Meses Gratis</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-gray-600 mb-6"
            >
              {referrerInfo 
                ? `Has sido invitado por ${referrerInfo.name} para unirte a la comunidad médica líder en México con 6 meses de acceso Premium gratuito.`
                : 'Únase a nuestra red de élite a través del programa Doctor.mx/Connect y disfrute de 6 meses de servicio premium completamente gratuito.'}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 space-y-4 sm:space-y-0 sm:flex sm:gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 text-lg rounded-lg flex items-center justify-center"
                onClick={handleRegisterClick}
              >
                Activar 6 meses Premium 
                <ArrowRight size={20} className="ml-2" />
              </motion.button>

              <div className="text-sm text-gray-500 flex items-center">
                Sin tarjeta de crédito requerida
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 bg-white rounded-lg p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center">
                <div className="mr-4 flex-shrink-0 text-blue-600">
                  <CheckCheck size={24} />
                </div>
                <p className="text-gray-600">
                  <span className="font-medium">{doctorsJoined}+ médicos</span> ya se han unido a través de este programa
                </p>
              </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:w-1/3"
          >
            <img 
              src="/connect/doctorconnect_hero.png" 
              alt="Doctor.mx Connect" 
              className="w-full h-auto mx-auto"
              style={{ maxWidth: '100%', display: 'block' }}
            />
            
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                ))}
              </div>
            </div>
            <div className="text-center text-blue-600 font-semibold mt-2">Premium por 6 meses</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConnectHeroSection;
