
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  specialty: string;
  quote: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Dra. Ana García",
    specialty: "Cardióloga, Ciudad de México",
    quote: "La plataforma ha transformado por completo mi práctica. Las comunidades de pacientes y el sistema de difusión han mejorado significativamente la adherencia a los tratamientos y he visto un aumento del 40% en nuevos pacientes.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 2,
    name: "Dr. Carlos Rodríguez",
    specialty: "Endocrinólogo, Monterrey",
    quote: "Me uní a través del programa Connect y en solo 2 semanas ya estaba gestionando una comunidad activa de pacientes con diabetes. La plataforma es increíblemente intuitiva y el soporte que recibí durante la configuración fue excepcional.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80"
  },
  {
    id: 3,
    name: "Dra. Laura Méndez",
    specialty: "Pediatra, Guadalajara",
    quote: "El programa Connect ha sido un cambio transformador para mi consulta. Las herramientas de comunicación y seguimiento me permiten dar una atención mucho más personalizada, y mis pacientes lo notan y lo agradecen enormemente.",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80"
  }
];

const ConnectTestimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="my-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Lo que dicen nuestros médicos</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Historias reales de profesionales que ya disfrutan de Doctor.mx
        </p>
      </div>
      
      <div className="relative h-[400px] md:h-[300px]">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: activeIndex === index ? 1 : 0,
              scale: activeIndex === index ? 1 : 0.9,
              zIndex: activeIndex === index ? 20 : 10
            }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 w-full"
            style={{ display: activeIndex === index ? 'block' : 'none' }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg max-w-4xl mx-auto relative">
              <div className="absolute left-6 top-6 text-white opacity-10 text-8xl font-serif">"</div>
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                <div className="flex-shrink-0">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
                  />
                </div>
                <div>
                  <div className="flex space-x-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/90 text-lg font-light mb-6">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-blue-200">{testimonial.specialty}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Pagination dots */}
        <div className="absolute -bottom-10 left-0 right-0 flex justify-center space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                activeIndex === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              aria-label={`Ver testimonio ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConnectTestimonials;
