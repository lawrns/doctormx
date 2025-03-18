import { useState } from 'react';
import { motion } from 'framer-motion';
import { CustomIcons } from './icons/CustomIcons';

type AnimatedVerificationBadgeProps = {
  count?: number;
};

function AnimatedVerificationBadge({ count = 1250 }: AnimatedVerificationBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayCount, setDisplayCount] = useState(count - 50);

  // Simulate counter increasing periodically
  useState(() => {
    const interval = setInterval(() => {
      setDisplayCount(prev => {
        if (prev < count) return prev + 1;
        return Math.max(count - 50, prev - 50);
      });
    }, 5000);
    
    return () => clearInterval(interval);
  });

  return (
    <div className="relative">
      <motion.div
        className="flex items-center bg-blue-50 px-3 py-2 rounded-full cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1
          }}
          className="mr-2 text-blue-600"
        >
          <CustomIcons.CheckCircle size={20} />
        </motion.div>
        <span className="text-blue-800 font-medium text-sm">
          {displayCount} médicos verificados activos ahora
        </span>
      </motion.div>

      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full mt-2 left-0 bg-white p-4 rounded-lg shadow-lg z-10 w-72"
        >
          <div className="flex items-start mb-2">
            <CustomIcons.Shield className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" size={18} />
            <h3 className="font-medium text-gray-900">Proceso de verificación</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-medium">1</span>
              </div>
              <span>Validación de cédula profesional</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-medium">2</span>
              </div>
              <span>Verificación de credenciales académicas</span>
            </li>
            <li className="flex items-start">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-xs font-medium">3</span>
              </div>
              <span>Confirmación de experiencia profesional</span>
            </li>
          </ul>
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center text-xs text-gray-500">
            <CustomIcons.Info size={12} className="mr-1" />
            <span>Actualizado en tiempo real</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AnimatedVerificationBadge;