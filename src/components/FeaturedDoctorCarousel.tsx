import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, ChevronLeft, ChevronRight, Calendar, Video, Clock, Award, 
  Languages, Heart, Sparkles, MessageCircle, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Featured doctors data with enhanced information
const featuredDoctors = [
  {
    id: '1',
    name: 'Dra. Nicelina Garcia',
    specialty: 'Odontología',
    specialtyDetail: 'Especialista en prótesis y rehabilitación oral',
    specialtyIcon: '🦷',
    image: 'https://oxlbametpfubwnrmrbsv.supabase.co/storage/v1/object/sign/Photos/Screenshot%202025-03-04%20at%205.15.28%20p.m..png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJQaG90b3MvU2NyZWVuc2hvdCAyMDI1LTAzLTA0IGF0IDUuMTUuMjggcC5tLi5wbmciLCJpYXQiOjE3NDExMzAyMzksImV4cCI6MTc3MjY2NjIzOX0.uSbPgoPNrQff-LDP1oKfnBtx2gMQVL5NH1g0Ph_1cAc',
    rating: 4.9,
    reviews: 156,
    highlight: 'Especialista en prótesis y rehabilitación oral',
    location: 'Chihuahua',
    isOnline: true,
    availableToday: true,
    nextAvailable: '14:30',
    acceptsTelemedicine: true,
    testimonial: '"Excelente profesional, muy dedicada y atenta"',
    languages: ['Español', 'English'],
    specialties: ['Odontología Estética', 'Rehabilitación Oral'],
    achievements: ['10+ años de experiencia', 'Certificación Internacional'],
    personalTags: ['Amable con niños', 'Explicaciones claras'],
    beforeAfterGallery: [
      {
        before: 'https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=200&q=80',
        after: 'https://images.unsplash.com/photo-1601628828688-632f38a5a7d0?w=200&q=80'
      }
    ],
    accent: '#4F46E5'
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Pediatría',
    specialtyIcon: '👶',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviews: 98,
    highlight: 'Más de 10 años de experiencia en pediatría',
    location: 'Guadalajara',
    isOnline: false,
    availableToday: true,
    nextAvailable: '16:00',
    acceptsTelemedicine: true,
    testimonial: '"Muy buen trato con los niños, totalmente recomendado"',
    languages: ['Español'],
    specialties: ['Pediatría General', 'Desarrollo Infantil'],
    achievements: ['Especialista en desarrollo', 'Premio al mérito'],
    personalTags: ['Paciente', 'Juguetón'],
    accent: '#2563EB'
  },
  {
    id: '3',
    name: 'Dra. Laura Sánchez',
    specialty: 'Ginecología',
    specialtyIcon: '👩‍⚕️',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    reviews: 156,
    highlight: 'Especialista en salud reproductiva y ginecología',
    location: 'Monterrey',
    isOnline: true,
    availableToday: false,
    nextAvailable: '10:00',
    acceptsTelemedicine: true,
    testimonial: '"Gran profesional, me ayudó mucho con mi tratamiento"',
    languages: ['Español', 'English', 'Français'],
    specialties: ['Ginecología', 'Obstetricia'],
    achievements: ['Doctorado en Francia', 'Investigadora'],
    personalTags: ['Empática', 'Profesional'],
    accent: '#DB2777'
  }
];

function FeaturedDoctorCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);
  const [showGallery, setShowGallery] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    if (!isPaused) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredDoctors.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isPaused]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % featuredDoctors.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + featuredDoctors.length) % featuredDoctors.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    })
  };

  return (
    <motion.div 
      ref={containerRef}
      className="relative rounded-lg shadow-lg overflow-hidden bg-white max-w-[300px] mx-auto hover:shadow-xl transition-shadow duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        borderColor: featuredDoctors[currentSlide].accent,
        borderWidth: '2px'
      }}
    >
      <div className="relative h-[450px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <div className="relative h-3/5 overflow-hidden group">
              <div className="absolute top-4 left-4 z-10 space-y-2">
                {featuredDoctors[currentSlide].isOnline && (
                  <motion.div 
                    className="flex items-center bg-green-100 px-2 py-1 rounded-full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    <span className="text-xs text-green-700 font-medium">En línea</span>
                  </motion.div>
                )}
                
                {featuredDoctors[currentSlide].availableToday && (
                  <motion.div 
                    className="flex items-center bg-blue-100 px-2 py-1 rounded-full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Clock size={12} className="text-blue-600 mr-1" />
                    <span className="text-xs text-blue-700 font-medium">
                      Hoy {featuredDoctors[currentSlide].nextAvailable}
                    </span>
                  </motion.div>
                )}
              </div>

              <motion.div 
                className="absolute top-4 right-4 z-10 text-2xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                {featuredDoctors[currentSlide].specialtyIcon}
              </motion.div>

              <motion.div
                className="relative w-full h-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <motion.img
                  src={featuredDoctors[currentSlide].image}
                  alt={featuredDoctors[currentSlide].name}
                  className="w-full h-full object-cover object-top"
                />
                
                <motion.div 
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                  transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4"
                >
                  {featuredDoctors[currentSlide].achievements.map((achievement, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Award size={16} className="mr-2" />
                      <span className="text-sm">{achievement}</span>
                    </motion.div>
                  ))}
                  
                  <motion.div 
                    className="flex items-center mt-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Languages size={16} className="mr-2" />
                    <span className="text-sm">
                      {featuredDoctors[currentSlide].languages.join(', ')}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
                <motion.div 
                  className="flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    to={`/reservar/${featuredDoctors[currentSlide].id}`}
                    className="block w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg 
                    text-center hover:bg-blue-700 transition-colors"
                  >
                    Agendar cita
                  </Link>
                </motion.div>
                
                {featuredDoctors[currentSlide].beforeAfterGallery && (
                  <motion.button
                    onClick={() => setShowGallery(!showGallery)}
                    className="bg-white/90 p-2 rounded-lg hover:bg-white transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Sparkles size={20} className="text-blue-600" />
                  </motion.button>
                )}
              </div>
            </div>
            
            <div className="h-2/5 p-4 bg-white">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {featuredDoctors[currentSlide].rating} ({featuredDoctors[currentSlide].reviews})
                    </span>
                  </div>
                  {featuredDoctors[currentSlide].acceptsTelemedicine && (
                    <div className="flex items-center text-blue-600">
                      <Video size={16} className="mr-1" />
                      <span className="text-xs">Telemedicina</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900">{featuredDoctors[currentSlide].name}</h3>
                  <p className="text-sm text-blue-600">{featuredDoctors[currentSlide].specialty}</p>
                  <p className="text-xs text-gray-500">{featuredDoctors[currentSlide].specialtyDetail}</p>
                </div>

                <div className="flex items-start">
                  <MapPin size={16} className="text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{featuredDoctors[currentSlide].location}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {featuredDoctors[currentSlide].personalTags.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/3 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 p-1.5 rounded-full shadow-sm transition-colors"
        aria-label="Anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/3 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 p-1.5 rounded-full shadow-sm transition-colors"
        aria-label="Siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </motion.div>
  );
}

export default FeaturedDoctorCarousel;