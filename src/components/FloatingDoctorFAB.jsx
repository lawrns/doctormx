import { motion } from 'framer-motion';
import { MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingDoctorFAB({ recommendedSpecialty = null, doctorCount = 0 }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (recommendedSpecialty) {
      navigate(`/doctors?specialty=${encodeURIComponent(recommendedSpecialty)}`);
    } else {
      navigate('/doctors');
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      style={{
        background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)'
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Pulsing background on specialty match */}
      {recommendedSpecialty && (
        <motion.div
          className="absolute inset-0 rounded-full bg-brand-500/30"
          animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Icon container */}
      <div className="relative flex items-center gap-2 text-white">
        <MapPin className="w-5 h-5" />
        <Users className="w-5 h-5" />
        
        {/* Doctor count badge */}
        {doctorCount > 0 && (
          <motion.span
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
            animate={{ scale: [0.9, 1.05] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
          >
            {doctorCount > 99 ? '99+' : doctorCount}
          </motion.span>
        )}
      </div>

      {/* Tooltip */}
      <motion.div
        className="absolute bottom-full right-0 mb-3 w-max bg-ink-primary text-white text-xs font-medium px-3 py-2 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ opacity: 0, y: 5 }}
        whileHover={{ opacity: 1, y: -5 }}
      >
        {recommendedSpecialty
          ? `Especialistas en ${recommendedSpecialty}`
          : 'Buscar doctores'}
        <span className="absolute top-full right-3 w-2 h-2 bg-ink-primary transform rotate-45" />
      </motion.div>
    </motion.button>
  );
}
