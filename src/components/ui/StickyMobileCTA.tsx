import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StickyMobileCTAProps {
  className?: string;
}

const StickyMobileCTA: React.FC<StickyMobileCTAProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [onlineDoctors, setOnlineDoctors] = useState(3);

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA when user scrolls down 300px
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Update available doctors count
    const timer = setInterval(() => {
      setOnlineDoctors(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        const newCount = prev + change;
        return Math.max(1, Math.min(8, newCount)); // Keep between 1-8
      });
    }, 15000);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 md:hidden ${className}`}
        >
          <div className="px-4 py-3">
            {/* Availability indicator */}
            <div className="flex items-center justify-center mb-2">
              <div className="flex items-center text-xs text-gray-600">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-2 h-2 bg-green-500 rounded-full mr-2"
                />
                <Users className="w-3 h-3 mr-1" />
                {onlineDoctors} médicos disponibles ahora
              </div>
            </div>

            {/* Main CTA Button */}
            <Link 
              to="/doctor"
              className="w-full cta-primary text-white px-6 py-4 text-lg font-semibold rounded-xl shadow-lg group inline-flex items-center justify-center min-h-[48px]"
              aria-label="Hablar con un médico ahora"
            >
              <MessageSquare className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              Habla con un médico ahora
            </Link>

            {/* Value props */}
            <div className="flex items-center justify-center mt-2 text-xs text-gray-500 space-x-4">
              <span>✓ Respuesta inmediata</span>
              <span>✓ Primera consulta gratis</span>
            </div>
          </div>

          {/* Safe area for iPhones */}
          <div className="safe-area-bottom bg-white"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMobileCTA;