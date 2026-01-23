import React from 'react';
import { Star, Quote } from 'lucide-react';

const PatientTestimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: "María Elena Gutiérrez",
      location: "Ciudad de México",
      rating: 5,
      comment: "El Dr. Simeon me ayudó cuando más lo necesitaba. Su diagnóstico fue preciso y su trato muy humano. Recomiendo completamente sus servicios.",
      condition: "Diabetes tipo 2",
      avatar: "https://ui-avatars.com/api/?name=Maria+Elena+Gutierrez&background=10b981&color=fff&size=150"
    },
    {
      id: 2,
      name: "Carlos Ramírez López",
      location: "Guadalajara, Jalisco",
      rating: 5,
      comment: "Excelente atención médica desde mi casa. El doctor es muy profesional y me dio confianza desde el primer momento. Muy recomendado.",
      condition: "Hipertensión",
      avatar: "https://ui-avatars.com/api/?name=Carlos+Ramirez+Lopez&background=10b981&color=fff&size=150"
    },
    {
      id: 3,
      name: "Ana Sofía Morales",
      location: "Monterrey, Nuevo León",
      rating: 5,
      comment: "Me encanta poder consultar desde cualquier lugar. El Dr. Simeon siempre está disponible y sus consejos han mejorado mucho mi salud.",
      condition: "Ansiedad y estrés",
      avatar: "https://ui-avatars.com/api/?name=Ana+Sofia+Morales&background=10b981&color=fff&size=150"
    },
    {
      id: 4,
      name: "Roberto Hernández",
      location: "Puebla, Puebla",
      rating: 5,
      comment: "Un doctor que realmente escucha y entiende. Sus explicaciones son claras y siempre me siento en buenas manos con sus recomendaciones.",
      condition: "Problemas digestivos",
      avatar: "https://ui-avatars.com/api/?name=Roberto+Hernandez&background=10b981&color=fff&size=150"
    },
    {
      id: 5,
      name: "Lupita Fernández",
      location: "Tijuana, Baja California",
      rating: 5,
      comment: "Increíble servicio. El doctor me ayudó a entender mejor mi condición y ahora me siento mucho mejor. Gracias por la atención tan profesional.",
      condition: "Migrañas crónicas",
      avatar: "https://ui-avatars.com/api/?name=Lupita+Fernandez&background=10b981&color=fff&size=150"
    },
    {
      id: 6,
      name: "Javier Mendoza",
      location: "Mérida, Yucatán",
      rating: 5,
      comment: "La telemedicina nunca había sido tan efectiva. El Dr. Simeon es muy dedicado y siempre encuentra la solución a mis problemas de salud.",
      condition: "Alergias estacionales",
      avatar: "https://ui-avatars.com/api/?name=Javier+Mendoza&background=10b981&color=fff&size=150"
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Testimonios de Nuestros Pacientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Miles de mexicanos ya confían en DoctorMX para su atención médica. 
            Conoce sus experiencias reales.
          </p>
          <div className="mt-6 flex justify-center items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-2xl font-bold text-gray-900">4.9/5</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="text-gray-600">Basado en 2,847 reseñas</span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-emerald-200 mb-4" />
              
              {/* Rating */}
              <div className="mb-4">
                {renderStars(testimonial.rating)}
              </div>

              {/* Comment */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.comment}"
              </p>

              {/* Patient Info */}
              <div className="flex items-start space-x-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.location}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    Tratamiento: {testimonial.condition}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-md border border-emerald-100">
            <div className="text-3xl font-bold text-emerald-600 mb-2">10,000+</div>
            <div className="text-gray-600">Consultas realizadas</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-emerald-100">
            <div className="text-3xl font-bold text-emerald-600 mb-2">98%</div>
            <div className="text-gray-600">Satisfacción del paciente</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-emerald-100">
            <div className="text-3xl font-bold text-emerald-600 mb-2">24/7</div>
            <div className="text-gray-600">Disponibilidad</div>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md border border-emerald-100">
            <div className="text-3xl font-bold text-emerald-600 mb-2">5 min</div>
            <div className="text-gray-600">Tiempo de respuesta</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientTestimonials;