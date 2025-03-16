
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, X, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConnectBannerProps {
  referralId?: string;
}

const ConnectBanner = ({ referralId }: ConnectBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-5 text-white mb-6 relative shadow-md"
    >
      <button 
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-white/70 hover:text-white transition-colors"
        aria-label="Cerrar"
      >
        <X size={18} />
      </button>
      
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="sm:flex-1 mb-4 sm:mb-0">
          <div className="flex items-center mb-2">
            <Shield size={18} className="mr-2 text-yellow-300" />
            <h3 className="font-bold text-lg">Programa Doctor.mx/Connect</h3>
          </div>
          <p className="text-blue-100">
            Oferta exclusiva: <span className="font-bold text-white">6 meses de servicio Premium completamente gratis</span>
          </p>
        </div>
        
        <div>
          <Link 
            to={`/connect${referralId ? `/${referralId}` : ''}`}
            className="inline-flex items-center bg-white text-blue-600 font-medium text-sm py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
          >
            Activar ahora
            <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectBanner;
