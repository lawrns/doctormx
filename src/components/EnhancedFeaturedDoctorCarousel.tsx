import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Featured doctors data
const featuredDoctors = [
  {
    id: '1',
    name: 'Dra. Ana García',
    specialty: 'Medicina General',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviews: 124,
    highlight: 'Especialista en medicina preventiva y atención integral',
    location: 'Ciudad de México'
  },
  {
    id: '2',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Pediatría',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    reviews: 98,
    highlight: 'Más de 10 años de experiencia en pediatría',
    location: 'Guadalajara'
  },
  {
    id: '3',
    name: 'Dra. Laura Sánchez',
    specialty: 'Ginecología',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: 4.7,
    reviews: 156,
    highlight: 'Especialista en salud reproductiva y ginecología',
    location: 'Monterrey'
  },
  {
    id: '4',
    name: 'Dr. Miguel Ángel Torres',
    specialty: 'Dermatología',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    reviews: 87,
    highlight: 'Especialista en tratamientos dermatológicos avanzados',
    location: 'Ciudad de México'
  }
];

function EnhancedFeaturedDoctorCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for right, -1 for left
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: false
  });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isPaused && inView) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredDoctors.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [isPaused, inView]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % featuredDoctors.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + featuredDoctors.length) % featuredDoctors.length);
  };

  // Handle mouse move for gradient effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    mousePosition.current = { x, y };
    
    // Update gradient position
    if (containerRef.current) {
      containerRef.current.style.background = `
        radial-gradient(
          circle at ${x * 100}% ${y * 100}%,
          rgba(37, 99, 235, 0.1) 0%,
          rgba(37, 99, 235, 0) 50%
        ),
        white
      `;
    }
  };

  // Variants for slide animations
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
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 20 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-lg shadow-md overflow-hidden bg-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      {/* Carousel slides */}
      <div className="relative h-[400px]">
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
            <div className="flex flex-col h-full">
              {/* Doctor image */}
              <div className="h-3/5 overflow-hidden">
                <motion.img
                  src={featuredDoctors[currentSlide].image}
                  alt={featuredDoctors[currentSlide].name}
                  className="w-full h-full object-cover object-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              {/* Doctor info */}
              <div className="h-2/5 p-4 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="flex text-yellow-400 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{featuredDoctors[currentSlide].rating} ({featuredDoctors[currentSlide].reviews})</span>
                  </div>
                  
                  <motion.h3 
                    className="text-lg font-bold text-gray-900"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {featuredDoctors[currentSlide].name}
                  </motion.h3>
                  <motion.p 
                    className="text-sm text-blue-600 mb-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {featuredDoctors[currentSlide].specialty}
                  </motion.p>
                  <motion.p 
                    className="text-xs text-gray-500 mb-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {featuredDoctors[currentSlide].location}
                  </motion.p>
                  <motion.p 
                    className="text-xs text-gray-600 line-clamp-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {featuredDoctors[currentSlide].highlight}
                  </motion.p>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link 
                    to={`/doctor/${featuredDoctors[currentSlide].id}`}
                    className="self-start text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
                  >
                    Ver perfil
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons - more subtle */}
      <motion.button
        onClick={prevSlide}
        className="absolute left-2 top-1/3 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 p-1.5 rounded-full shadow-sm transition-colors"
        aria-label="Anterior"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronLeft size={16} />
      </motion.button>
      <motion.button
        onClick={nextSlide}
        className="absolute right-2 top-1/3 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 p-1.5 rounded-full shadow-sm transition-colors"
        aria-label="Siguiente"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronRight size={16} />
      </motion.button>

      {/* Pagination dots - more subtle */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1.5">
        {featuredDoctors.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
            }`}
            aria-label={`Ir a slide ${index + 1}`}
            whileHover={{ scale: 1.5 }}
            animate={index === currentSlide ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default EnhancedFeaturedDoctorCarousel;