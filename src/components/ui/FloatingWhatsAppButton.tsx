import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

interface FloatingWhatsAppButtonProps {
  className?: string;
}

const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show button after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show tooltip briefly after button appears
    if (isVisible) {
      const tooltipTimer = setTimeout(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }, 1000);

      return () => clearTimeout(tooltipTimer);
    }
  }, [isVisible]);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent("Hola, necesito una consulta médica");
    const whatsappUrl = `https://wa.me/525512345678?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            className="absolute right-16 bottom-2 bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap"
          >
            <div className="text-sm font-medium">¡Habla por WhatsApp!</div>
            <div className="text-xs text-gray-600">Respuesta inmediata</div>
            <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleWhatsAppClick}
        className="w-16 h-16 whatsapp-btn text-white rounded-full shadow-lg flex items-center justify-center group relative"
        aria-label="Consultar por WhatsApp"
      >
        <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
        
        {/* Pulse animation */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 bg-[#25D366] rounded-full"
        />
        
        {/* Online indicator */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2 h-2 bg-white rounded-full"
          />
        </div>
      </motion.button>
    </div>
  );
};

export default FloatingWhatsAppButton;