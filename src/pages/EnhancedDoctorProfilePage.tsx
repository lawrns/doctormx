import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Star, 
  Calendar, 
  Video, 
  Clock, 
  Award, 
  Languages, 
  Phone, 
  Mail, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Facebook, 
  Twitter, 
  Share2, 
  MessageSquare, 
  Users,
  ChevronRight,
  Heart,
  Shield,
  Info,
  ThumbsUp,
  MessageCircle,
  Camera
} from '../components/icons/IconProvider';

// Import our components
import Breadcrumbs from '../components/Breadcrumbs';
import { Button, Input, Checkbox } from '../components/ui';
import { Modal } from '../components/modal';
import SEO from '../components/seo/SEO';
import { getDoctorSchema } from '../lib/schemaGenerator';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data for a doctor
const mockDoctor = {
  id: '1',
  name: 'Dra. Ana García',
  specialty: 'Medicina General',
  location: 'Ciudad de México',
  address: 'Av. Insurgentes Sur 1234, Col. Del Valle',
  rating: 4.9,
  reviewCount: 124,
  price: 800,
  image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
  officeImages: [
    'https://images.unsplash.com/photo-1504439468489-c8920d796a29?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
  ],
  availableToday: true,
  telemedicine: true,
  languages: ['Español', 'Inglés'],
  education: [
    { degree: 'Médico Cirujano', institution: 'Universidad Nacional Autónoma de México', year: '2008' },
    { degree: 'Especialidad en Medicina Familiar', institution: 'Instituto Mexicano del Seguro Social', year: '2012' }
  ],
  certifications: [
    { title: 'Certificado por el Consejo Mexicano de Medicina Familiar', year: '2012' },
    { title: 'Diplomado en Diabetes y Obesidad', institution: 'UNAM', year: '2015' }
  ],
  experience: 12,
  about: 'Soy médico general con más de 12 años de experiencia en atención primaria. Me especializo en medicina preventiva, control de enfermedades crónicas y atención integral a la familia. Mi enfoque es brindar una atención personalizada, escuchando las necesidades de cada paciente para ofrecer el mejor tratamiento posible.\n\nA lo largo de mi carrera, he trabajado tanto en el sector público como privado, lo que me ha permitido desarrollar un enfoque integral de la salud. Estoy constantemente actualizándome con las últimas investigaciones y avances médicos para ofrecer los mejores tratamientos basados en evidencia científica.',
  services: [
    'Consulta general',
    'Control de enfermedades crónicas',
    'Chequeo médico preventivo',
    'Certificados médicos',
    'Telemedicina',
    'Consulta a domicilio',
    'Servicios de urgencia básicos'
  ],
  conditions: [
    'Hipertensión',
    'Diabetes',
    'Obesidad',
    'Asma',
    'Enfermedades respiratorias comunes',
    'Infecciones comunes',
    'Problemas gastrointestinales'
  ],
  insurances: [
    'GNP Seguros',
    'AXA Seguros',
    'Seguros Monterrey',
    'MetLife',
    'Allianz'
  ],
  schedule: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' },
    wednesday: { start: '09:00', end: '18:00' },
    thursday: { start: '09:00', end: '18:00' },
    friday: { start: '09:00', end: '14:00' },
    saturday: { start: '10:00', end: '14:00' },
    sunday: null
  },
  reviews: [
    {
      id: '1',
      patient: 'María Rodríguez',
      date: '2023-05-15',
      rating: 5,
      comment: 'Excelente doctora, muy profesional y amable. Me explicó todo detalladamente y resolvió todas mis dudas. Totalmente recomendada.'
    },
    {
      id: '2',
      patient: 'Juan Pérez',
      date: '2023-04-22',
      rating: 5,
      comment: 'La Dra. García es muy atenta y dedicada. La consulta fue muy completa y me dio un tratamiento que funcionó perfectamente.'
    },
    {
      id: '3',
      patient: 'Laura Sánchez',
      date: '2023-03-10',
      rating: 4,
      comment: 'Buena atención y diagnóstico acertado. El consultorio es cómodo y la espera fue mínima.'
    },
    {
      id: '4',
      patient: 'Roberto Méndez',
      date: '2023-02-05',
      rating: 5,
      comment: 'La doctora me atendió rápidamente para una urgencia. Muy profesional y eficiente. Resolvió mi problema de salud con un tratamiento adecuado.'
    },
    {
      id: '5',
      patient: 'Carmen Vázquez',
      date: '2023-01-18',
      rating: 4,
      comment: 'Consulta muy completa. La doctora es muy detallista y explica todo con claridad. El consultorio es limpio y bien equipado.'
    }
  ],
  averageWaitTime: 15, // in minutes
  isPremium: true,
  verificationDate: '2023-01-10'
};

function EnhancedDoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Ratings breakdown
  const [ratingBreakdown] = useState({
    5: 75,
    4: 15,
    3: 8,
    2: 1,
    1: 1
  });

  // Fetch doctor data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setDoctor(mockDoctor);
      setLoading(false);
    }, 500);
  }, [id]);

  // Generate mock available slots for the selected date
  useEffect(() => {
    if (!doctor) return;
    
    const dayOfWeek = format(selectedDate, 'EEEE', { locale: es });
    const scheduleKey = dayOfWeek.toLowerCase();
    
    if (!doctor.schedule[scheduleKey]) {
      setAvailableSlots([]);
      return;
    }
    
    const { start, end } = doctor.schedule[scheduleKey];
    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);
    
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      // Add two slots per hour (on the hour and half past)
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    
    // Randomly mark some slots as unavailable
    const availableSlots = slots.map(slot => ({
      time: slot,
      available: Math.random() > 0.3 // 70% chance of being available
    }));
    
    setAvailableSlots(availableSlots);
  }, [selectedDate, doctor]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Médico no encontrado</h1>
        <p className="text-gray-600 mb-6">Lo sentimos, no pudimos encontrar el médico que estás buscando.</p>
        <Button 
          as="link" 
          to="/buscar" 
          variant="primary"
        >
          Buscar otros médicos
        </Button>
      </div>
    );
  }

  // Format day names in Spanish
  const formatDayName = (day) => {
    const days = {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return days[day];
  };

  // Generate next 7 days for appointment selection
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  // Handle sharing the profile
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Te recomiendo consultar con ${doctor.name}, ${doctor.specialty}.`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`Recomendación: Dr. ${doctor.name}`)}&body=${encodeURIComponent(`${text} ${url}`)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('¡Enlace copiado al portapapeles!');
        break;
      default:
        break;
    }
    
    setShowShareModal(false);
  };

  // Generate schema markup for the doctor
  const schema = doctor ? {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    'name': doctor.name,
    'image': doctor.image,
    'description': doctor.about,
    'medicalSpecialty': doctor.specialty,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': doctor.address,
      'addressLocality': doctor.location,
      'addressRegion': 'México',
      'addressCountry': 'MX'
    },
    'telephone': '+52 55 1234 5678',
    'email': 'contacto@doctor.mx',
    'priceRange': `${doctor.price}`,
    'availableService': doctor.services.map(service => ({
      '@type': 'MedicalProcedure',
      'name': service
    })),
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': doctor.rating,
      'reviewCount': doctor.reviewCount
    },
    'review': doctor.reviews.map(review => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': review.patient
      },
      'datePublished': review.date,
      'reviewRating': {
        '@type': 'Rating',
        'ratingValue': review.rating,
        'bestRating': '5'
      },
      'reviewBody': review.comment
    }))
  } : null;

  // Tab content components for better organization
  const tabContent = {
    about: (
      <>
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Acerca de</h2>
          <div className="text-gray-600 space-y-4">
            {doctor.about.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Servicios</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doctor.services.map((service, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <CheckCircle size={18} className="text-blue-600 mr-2 flex-shrink-0" />
                {service}
              </li>
            ))}
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Condiciones tratadas</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doctor.conditions.map((condition, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                {condition}
              </li>
            ))}
          </ul>
        </section>
        
        {/* Office Gallery */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Galería del consultorio
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {doctor.officeImages.map((image, index) => (
              <div 
                key={index}
                className="relative h-24 md:h-32 lg:h-40 rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => {
                  setSelectedImage(index);
                  setShowGalleryModal(true);
                }}
              >
                <img
                  src={image}
                  alt={`Consultorio de ${doctor.name} ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
            ))}
            <div 
              className="relative h-24 md:h-32 lg:h-40 rounded-lg overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center group"
              onClick={() => {
                setSelectedImage(0);
                setShowGalleryModal(true);
              }}
            >
              <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-600 transition-colors">
                <Camera size={24} className="mb-1" />
                <span className="text-xs font-medium">Ver todas</span>
              </div>
            </div>
          </div>
        </section>
      </>
    ),
    
    credentials: (
      <>
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Educación</h2>
          <ul className="space-y-4">
            {doctor.education.map((edu, index) => (
              <li key={index} className="flex">
                <Award size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">{edu.degree}</p>
                  <p className="text-gray-600">{edu.institution}, {edu.year}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Certificaciones</h2>
          <ul className="space-y-4">
            {doctor.certifications.map((cert, index) => (
              <li key={index} className="flex">
                <Shield size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-medium text-gray-900">{cert.title}</p>
                  {cert.institution && <p className="text-gray-600">{cert.institution}, {cert.year}</p>}
                  {!cert.institution && <p className="text-gray-600">{cert.year}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Experiencia</h2>
          <div className="flex items-center bg-blue-50 p-4 rounded-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{doctor.experience} años</p>
              <p className="text-gray-700">de experiencia profesional</p>
            </div>
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Idiomas</h2>
          <div className="flex flex-wrap gap-2">
            {doctor.languages.map((language, index) => (
              <div key={index} className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 flex items-center">
                <Languages size={18} className="text-blue-600 mr-2" />
                {language}
              </div>
            ))}
          </div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Seguros aceptados</h2>
          <div className="flex flex-wrap gap-2">
            {doctor.insurances.map((insurance, index) => (
              <span key={index} className="px-3 py-1.5 bg-gray-100 rounded-full text-gray-700 text-sm">
                {insurance}
              </span>
            ))}
          </div>
        </section>
      </>
    ),
    
    reviews: (
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Opiniones de pacientes</h2>
          <div className="flex items-center">
            <div className="flex text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  fill={i < Math.floor(doctor.rating) ? "currentColor" : "none"}
                  className={i < Math.floor(doctor.rating) ? "" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-gray-600 font-bold">{doctor.rating}</span>
            <span className="ml-1 text-gray-500">({doctor.reviewCount})</span>
          </div>
        </div>
        
        {/* Rating Breakdown */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Desglose de calificaciones</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(stars => (
              <div key={stars} className="flex items-center">
                <span className="w-8 text-sm text-gray-600">{stars}</span>
                <div className="flex text-yellow-400 mx-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < stars ? "currentColor" : "none"}
                      className={i < stars ? "" : "text-gray-300"}
                    />
                  ))}
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${ratingBreakdown[stars]}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm text-gray-600">{ratingBreakdown[stars]}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {(showAllReviews ? doctor.reviews : doctor.reviews.slice(0, 3)).map((review) => (
            <div key={review.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{review.patient}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(review.date), 'dd MMMM yyyy', { locale: es })}
                  </p>
                </div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < review.rating ? "currentColor" : "none"}
                      className={i < review.rating ? "" : "text-gray-300"}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
              <div className="mt-2 flex justify-end">
                <button className="text-gray-500 hover:text-blue-600 text-sm flex items-center">
                  <ThumbsUp size={14} className="mr-1" />
                  Útil
                </button>
              </div>
            </div>
          ))}
          
          {doctor.reviews.length > 3 && (
            <Button 
              onClick={() => setShowAllReviews(!showAllReviews)}
              variant="outline"
              className="mt-2"
              icon={showAllReviews ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              iconPosition={showAllReviews ? "left" : "left"}
            >
              {showAllReviews ? "Ver menos opiniones" : `Ver todas las opiniones (${doctor.reviews.length})`}
            </Button>
          )}
        </div>
      </section>
    ),
    
    faq: (
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Preguntas frecuentes</h2>
        
        <div className="space-y-4">
          {[
            {
              id: 1,
              question: '¿Qué métodos de pago acepta?',
              answer: 'El Dr. acepta efectivo, tarjetas de crédito/débito y transferencias bancarias. Consulta directamente para opciones específicas.'
            },
            {
              id: 2,
              question: '¿Puedo cancelar o reprogramar mi cita?',
              answer: 'Sí, puedes cancelar o reprogramar hasta 24 horas antes de tu cita sin costo adicional. Cancela desde tu panel de usuario o contactando al consultorio.'
            },
            {
              id: 3,
              question: '¿Acepta seguros médicos?',
              answer: 'Sí, trabaja con las principales aseguradoras. Verifica los detalles específicos directamente con el consultorio antes de tu cita.'
            },
            {
              id: 4,
              question: '¿Qué debo llevar a mi primera cita?',
              answer: 'Identificación oficial, tarjeta del seguro médico (si aplica), historial médico relevante y lista de medicamentos actuales.'
            },
            {
              id: 5,
              question: '¿Cuánto dura una consulta?',
              answer: 'La primera consulta suele durar entre 30 y 45 minutos para permitir una evaluación completa. Las consultas de seguimiento generalmente duran unos 20-30 minutos.'
            },
            {
              id: 6,
              question: '¿Ofrece consultas a domicilio?',
              answer: 'Sí, ofrece consultas a domicilio en ciertas zonas. Contacta directamente para verificar disponibilidad y tarifas para tu ubicación.'
            }
          ].map(faq => (
            <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 text-left font-medium text-gray-900 flex justify-between items-center"
              >
                {faq.question}
                <ChevronDown
                  size={20}
                  className={`transform transition-transform ${expandedFaq === faq.id ? 'rotate-180' : ''}`}
                />
              </button>
              
              {expandedFaq === faq.id && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <Info size={20} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-gray-900">¿Tienes más preguntas?</h3>
              <p className="text-gray-600 mt-1">Puedes contactar directamente al consultorio o enviarnos tus preguntas y te responderemos lo antes posible.</p>
              <Button
                variant="outline"
                className="mt-3"
                icon={<MessageCircle size={16} />}
              >
                Enviar mensaje
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  };

  return (
    <div className="bg-gray-50 py-8">
      {/* Add SEO component */}
      {doctor && (
        <SEO
          title={`${doctor.name} - ${doctor.specialty} en ${doctor.location} | Doctor.mx`}
          description={`Consulta con ${doctor.name}, especialista en ${doctor.specialty} en ${doctor.location}. Reserva cita online o por telemedicina. ${doctor.about.substring(0, 100)}...`}
          canonical={`/doctor/${id}`}
          image={doctor.image}
          schema={schema}
          type="profile"
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          className="mb-6" 
          customPaths={{
            "doctor": "Perfil de Médico",
            [id]: doctor.name
          }}
        />
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {/* Doctor header */}
          <div className="p-6 md:p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <div className="relative">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name} 
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-md"
                  />
                  {doctor.isPremium && (
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Premium
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:w-2/4 md:pl-6">
                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                <p className="text-blue-600 font-medium text-lg">{doctor.specialty}</p>
                
                {doctor.isPremium && (
                  <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block mt-2">
                    <CheckCircle size={16} className="mr-1" />
                    Perfil verificado por Doctor.mx
                    <span className="text-xs text-green-600 ml-1">
                      {format(new Date(doctor.verificationDate), 'MMM yyyy', { locale: es })}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center mt-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={18} 
                        fill={i < Math.floor(doctor.rating) ? "currentColor" : "none"}
                        className={i < Math.floor(doctor.rating) ? "" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 font-medium">{doctor.rating}</span>
                  <span className="ml-1 text-gray-500">({doctor.reviewCount} opiniones)</span>
                  <button 
                    onClick={() => setActiveTab('reviews')} 
                    className="ml-2 text-sm text-blue-600 hover:underline"
                  >
                    Ver todas
                  </button>
                </div>
                
                <div className="mt-4 flex items-start">
                  <MapPin size={18} className="text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">{doctor.address}</span>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {doctor.availableToday && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Calendar size={14} className="mr-1" />
                      Disponible hoy
                    </span>
                  )}
                  
                  {doctor.telemedicine && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Video size={14} className="mr-1" />
                      Telemedicina
                    </span>
                  )}
                  
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    <Clock size={14} className="mr-1" />
                    Espera aprox. {doctor.averageWaitTime} min
                  </span>
                </div>
                
                <div className="mt-4 flex">
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="mr-3 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                    aria-label="Compartir perfil"
                  >
                    <Share2 size={16} className="mr-1" />
                    Compartir
                  </button>
                  
                  <button 
                    className="text-rose-600 hover:text-rose-800 flex items-center text-sm font-medium"
                    aria-label="Guardar en favoritos"
                    onClick={() => {
                      // In a real app, this would call an API to save the doctor
                      alert('Médico guardado en favoritos');
                    }}
                  >
                    <Heart size={16} className="mr-1" />
                    Guardar
                  </button>
                </div>
              </div>
              
              <div className="md:w-1/4 mt-6 md:mt-0 flex flex-col items-center md:items-end">
                <div className="text-right">
                  <p className="text-gray-500 text-sm">Precio de consulta</p>
                  <p className="text-2xl font-bold text-gray-900">${doctor.price}</p>
                </div>
                
                {/* Urgency indicators */}
                {doctor.availableToday && (
                  <div className="text-sm mt-2 text-center md:text-right">
                    <span className="text-green-600 font-medium">
                      {parseInt(doctor.id) % 5} {parseInt(doctor.id) % 5 === 1 ? 'horario disponible' : 'horarios disponibles'} hoy
                    </span>
                  </div>
                )}
                
                {parseInt(doctor.id) % 3 === 0 && (
                  <div className="text-sm mt-2 flex items-center justify-center md:justify-end">
                    <Users size={14} className="text-amber-500 mr-1" />
                    <span className="text-amber-600 font-medium">
                      Alta demanda para este médico
                    </span>
                  </div>
                )}
                
                <Button 
                  as="link"
                  to={`/reservar/${doctor.id}`}
                  variant="primary"
                  className="mt-4 w-full md:w-auto"
                >
                  Agendar cita
                </Button>
              </div>
            </div>
          </div>
          
          {/* Tabs navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['about', 'credentials', 'reviews', 'faq'].map((tab) => {
                const tabLabels = {
                  about: 'Información',
                  credentials: 'Credenciales',
                  reviews: 'Opiniones',
                  faq: 'Preguntas frecuentes'
                };
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab 
                        ? 'text-blue-600 border-b-2 border-blue-600' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tabLabels[tab]}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Tab content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8">
            <div className="md:col-span-2">
              {tabContent[activeTab]}
            </div>
            
            <div>
              {/* Quick appointment widget (always visible, sticky on desktop) */}
              <div className="md:sticky md:top-6 space-y-6">
                {/* Contact info */}
                <section className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Información de contacto</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <MapPin size={18} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{doctor.address}</span>
                    </li>
                    <li className="flex items-center">
                      <Phone size={18} className="text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">+52 55 1234 5678</span>
                    </li>
                    <li className="flex items-center">
                      <Mail size={18} className="text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">contacto@doctor.mx</span>
                    </li>
                    <li className="flex items-center">
                      <Globe size={18} className="text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">www.doctor.mx</span>
                    </li>
                  </ul>
                </section>
                
                {/* Schedule */}
                <section className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Horario de atención</h2>
                  <ul className="space-y-2">
                    {Object.entries(doctor.schedule).map(([day, hours]) => {
                      // Get current day name in Spanish
                      const currentDay = format(new Date(), 'EEEE', { locale: es }).toLowerCase();
                      const isToday = day === currentDay;
                      
                      return (
                        <li key={day} className="flex justify-between items-center">
                          <span className={`${isToday ? 'font-medium text-blue-600' : 'text-gray-600'}`}>
                            {formatDayName(day)}
                            {isToday && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Hoy</span>}
                          </span>
                          <span className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {hours ? `${hours.start} - ${hours.end}` : 'Cerrado'}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
                
                {/* Quick appointment */}
                <section className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Cita rápida</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selecciona una fecha
                    </label>
                    <div className="grid grid-cols-7 gap-1">
                      {next7Days.map((date, index) => {
                        const isSelected = selectedDate.toDateString() === date.toDateString();
                        const dayName = format(date, 'EEE', { locale: es });
                        const dayNumber = format(date, 'd');
                        
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedDate(date)}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                              isSelected 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                            aria-label={`Seleccionar ${format(date, 'EEEE dd MMMM', { locale: es })}`}
                            aria-pressed={isSelected}
                          >
                            <span className="text-xs uppercase">{dayName}</span>
                            <span className="font-medium">{dayNumber}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horarios disponibles
                    </label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot, index) => (
                          <button
                            key={index}
                            disabled={!slot.available}
                            className={`py-2 px-3 rounded-lg text-center text-sm ${
                              slot.available
                                ? 'bg-white hover:bg-gray-100 text-gray-700'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            aria-label={`Horario ${slot.time} ${slot.available ? 'disponible' : 'no disponible'}`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No hay horarios disponibles para esta fecha
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    as="link"
                    to={`/reservar/${doctor.id}`}
                    variant="primary"
                    className="mt-4 w-full"
                  >
                    Ver todos los horarios
                  </Button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gallery Modal */}
      <Modal
        isOpen={showGalleryModal}
        onClose={() => setShowGalleryModal(false)}
        title="Galería del consultorio"
        size="xl"
      >
        <div className="flex flex-col items-center">
          <div className="mb-4 w-full max-h-[60vh] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={doctor.officeImages[selectedImage]}
              alt={`Consultorio de ${doctor.name}`}
              className="w-full h-full object-contain"
            />
          </div>
          
          <div className="flex space-x-2 mt-2">
            {doctor.officeImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                  selectedImage === index ? 'border-blue-600' : 'border-transparent'
                }`}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </Modal>
      
      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Compartir perfil"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Comparte el perfil de {doctor.name} con amigos y familiares:
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('whatsapp')}
              className="flex items-center justify-center p-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
            >
              <MessageSquare size={18} className="mr-2" />
              WhatsApp
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center justify-center p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
            >
              <Facebook size={18} className="mr-2" />
              Facebook
            </button>
            
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center justify-center p-3 bg-blue-100 text-blue-500 rounded-lg hover:bg-blue-200"
            >
              <Twitter size={18} className="mr-2" />
              Twitter
            </button>
            
            <button
              onClick={() => handleShare('email')}
              className="flex items-center justify-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Mail size={18} className="mr-2" />
              Email
            </button>
          </div>
          
          <div className="border-t border-gray-200 pt-3 mt-4">
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center justify-center w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Share2 size={18} className="mr-2" />
              Copiar enlace
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default EnhancedDoctorProfilePage;