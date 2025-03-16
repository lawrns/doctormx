import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Specialty data with seasonal recommendations
const specialties = [
  { name: 'Medicina General', icon: '👨‍⚕️', slug: 'medicina-general', seasonal: false },
  { name: 'Pediatría', icon: '👶', slug: 'pediatria', seasonal: false },
  { name: 'Ginecología', icon: '👩‍⚕️', slug: 'ginecologia', seasonal: false },
  { name: 'Dermatología', icon: '🧴', slug: 'dermatologia', seasonal: true, season: 'summer' },
  { name: 'Psicología', icon: '🧠', slug: 'psicologia', seasonal: false },
  { name: 'Nutrición', icon: '🥗', slug: 'nutricion', seasonal: false },
  { name: 'Odontología', icon: '🦷', slug: 'odontologia', seasonal: false },
  { name: 'Cardiología', icon: '❤️', slug: 'cardiologia', seasonal: false }
];

// Get current season
const getCurrentSeason = () => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

function EnhancedSpecialtySection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [currentSeason] = useState(getCurrentSeason());
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  // Variants for container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Variants for item animation
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

  // Sort specialties to show seasonal ones first
  const sortedSpecialties = [...specialties].sort((a, b) => {
    if (a.seasonal && a.season === currentSeason && (!b.seasonal || b.season !== currentSeason)) return -1;
    if (b.seasonal && b.season === currentSeason && (!a.seasonal || a.season !== currentSeason)) return 1;
    return 0;
  });

  return (
    <section className="py-16" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          {/* Mascot Image */}
          <div className="hidden lg:block w-1/4">
            <motion.img
              src="/mascot.png"
              alt="Doctor.mx Mascot"
              className="w-full max-w-[165px] opacity-80"
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 0.8, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>

          {/* Specialties Grid */}
          <div className="flex-1">
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900">Especialidades populares</h2>
              <p className="mt-2 text-gray-600">
                Encuentra especialistas en las áreas médicas más solicitadas
              </p>
              {currentSeason === 'spring' && (
                <div className="mt-3 inline-block bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  🌼 Temporada de alergias: Consulta con un alergólogo
                </div>
              )}
              {currentSeason === 'summer' && (
                <div className="mt-3 inline-block bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  ☀️ Temporada de verano: Cuida tu piel con un dermatólogo
                </div>
              )}
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
            >
              {sortedSpecialties.map((specialty, index) => (
                <motion.div
                  key={specialty.slug}
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                >
                  <Link 
                    to={`/buscar?especialidad=${specialty.slug}`}
                    className={`bg-white rounded-lg p-3 text-center block h-full transition-all ${
                      specialty.seasonal && specialty.season === currentSeason 
                        ? 'border-2 border-blue-400' 
                        : 'border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <motion.div 
                      className="text-2xl mb-1 inline-block"
                      animate={hoveredIndex === index ? { 
                        rotate: [0, 10, -10, 10, 0],
                        scale: [1, 1.2, 1.2, 1.2, 1],
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {specialty.icon}
                    </motion.div>
                    <h3 className="text-sm font-medium text-gray-900">{specialty.name}</h3>
                    {specialty.seasonal && specialty.season === currentSeason && (
                      <span className="text-xs text-blue-600 mt-1 block">Recomendado</span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Link 
                to="/especialidades"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                Ver todas las especialidades
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EnhancedSpecialtySection;