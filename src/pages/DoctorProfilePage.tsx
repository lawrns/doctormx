import { Calendar as CalendarIcon, Video as VideoIcon, Users as UsersIcon, MessageSquare as MessageSquareIcon, Share2 as Share2Icon, Phone as PhoneIcon, Mail as MailIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DoctorActionButtonsSimple from '../components/doctor/DoctorActionButtonsSimple';
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
  Users 
} from '../components/icons';

// Import enhanced SEO components
import DoctorSEO from '../components/seo/DoctorSEO';
import { generateDoctorSchema } from '../lib/schemaGenerators';
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
  availableToday: true,
  telemedicine: true,
  languages: ['Español', 'Inglés'],
  education: [
    { degree: 'Médico Cirujano', institution: 'Universidad Nacional Autónoma de México', year: '2008' },
    { degree: 'Especialidad en Medicina Familiar', institution: 'Instituto Mexicano del Seguro Social', year: '2012' }
  ],
  experience: 12,
  about: 'Soy médico general con más de 12 años de experiencia en atención primaria. Me especializo en medicina preventiva, control de enfermedades crónicas y atención integral a la familia. Mi enfoque es brindar una atención personalizada, escuchando las necesidades de cada paciente para ofrecer el mejor tratamiento posible.',
  services: [
    'Consulta general',
    'Control de enfermedades crónicas',
    'Chequeo médico preventivo',
    'Certificados médicos',
    'Telemedicina'
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
    }
  ]
};

function DoctorProfilePage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState(null);

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
        <Link to="/buscar" className="btn-primary">
          Buscar otros médicos
        </Link>
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

  // Generate enhanced schema markup for the doctor
  const schema = doctor ? {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    'name': doctor.name,
    'image': doctor.image,
    'description': doctor.about,
    'medicalSpecialty': doctor.specialty,
    'url': `https://doctor.mx/doctor/${id}`,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://doctor.mx/doctor/${id}`
    },
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
    'currenciesAccepted': 'MXN',
    'paymentAccepted': 'Cash, Credit Card, Debit Card',
    'openingHoursSpecification': Object.entries(doctor.schedule)
      .filter(([_, hours]) => hours !== null)
      .map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': `https://schema.org/${day.charAt(0).toUpperCase() + day.slice(1)}`,
        'opens': hours.start,
        'closes': hours.end
      })),
    'availableService': doctor.services.map(service => ({
      '@type': 'MedicalProcedure',
      'name': service
    })),
    'healthInsuranceAccepted': doctor.insurances.join(', '),
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': doctor.rating,
      'reviewCount': doctor.reviewCount,
      'bestRating': '5',
      'worstRating': '1'
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
        'bestRating': '5',
        'worstRating': '1'
      },
      'reviewBody': review.comment
    })),
    'hasCredential': doctor.education.map(edu => ({
      '@type': 'EducationalOccupationalCredential',
      'credentialCategory': 'degree',
      'name': edu.degree,
      'recognizedBy': {
        '@type': 'Organization',
        'name': edu.institution
      },
      'dateCreated': edu.year
    })),
    'workLocation': {
      '@type': 'MedicalClinic',
      'name': `Consultorio Dr. ${doctor.name.split(' ')[1]}`,
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': doctor.address,
        'addressLocality': doctor.location,
        'addressRegion': 'México',
        'addressCountry': 'MX'
      }
    },
    'memberOf': doctor.insurances.map(insurance => ({
      '@type': 'Organization',
      'name': insurance
    }))
  } : null;

  return (
    <div className="bg-gray-50 py-8">
      {/* Add enhanced DoctorSEO component */}
      {doctor && (
        <DoctorSEO
          doctor={doctor}
          url={`/doctor/${id}`}
        />
      )}
      {/* Enhanced DoctorSEO component added above */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {/* Doctor header */}
          <div className="p-6 md:p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/4 flex justify-center mb-6 md:mb-0">
                <img 
                  src={doctor.image} 
                  alt={doctor.name} 
                  className="w-40 h-40 rounded-full object-cover"
                />
              </div>
              
              <div className="md:w-2/4 md:pl-6">
                <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
                <p className="text-blue-600 font-medium text-lg">{doctor.specialty}</p>
                
                {doctor.isPremium && (
                  <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block mt-2">
                    <CheckCircle size={16} className="mr-1" />
                    Perfil verificado por Doctor.mx
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
                  <span className="ml-2 text-gray-600">{doctor.rating}</span>
                  <span className="ml-1 text-gray-500">({doctor.reviewCount} opiniones)</span>
                </div>
                
                <div className="mt-4 flex items-start">
                  <MapPin size={18} className="text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-600">{doctor.address}</span>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {doctor.availableToday && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CalendarIcon size={14} className="mr-1" />
                      Disponible hoy
                    </span>
                  )}
                  
                  {doctor.telemedicine && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <VideoIcon size={14} className="mr-1" />
                      Telemedicina
                    </span>
                  )}
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
                    <UsersIcon size={14} className="text-amber-500 mr-1" />
                    <span className="text-amber-600 font-medium">
                      Alta demanda para este médico
                    </span>
                  </div>
                )}
                
                <div className="mt-4 space-y-3">
                  <Link 
                    to={`/reservar/${doctor.id}`}
                    className="btn-primary w-full md:w-auto text-center block"
                  >
                    Agendar cita
                  </Link>
                  
                  <DoctorActionButtonsSimple 
                    doctorId={doctor.id} 
                    supportsTelehealth={doctor.telemedicine}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Doctor details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 md:p-8">
            <div className="md:col-span-2">
              {/* About section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Acerca de</h2>
                <p className="text-gray-600">{doctor.about}</p>
              </section>
              
              {/* Services section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Servicios</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {doctor.services.map((service, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                      {service}
                    </li>
                  ))}
                </ul>
              </section>
              
              {/* Education section */}
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
              
              {/* Insurance section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Seguros aceptados</h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.insurances.map((insurance, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">
                      {insurance}
                    </span>
                  ))}
                </div>
              </section>
              
              {/* FAQ section */}
              <section className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Preguntas frecuentes</h2>
                
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
              </section>
              
              {/* Reviews section */}
              <section>
                <div className="flex justify-between items-center mb-4">
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
                    <span className="text-gray-600">{doctor.rating}</span>
                    <span className="ml-1 text-gray-500">({doctor.reviewCount})</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {(showAllReviews ? doctor.reviews : doctor.reviews.slice(0, 2)).map((review) => (
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
                    </div>
                  ))}
                  
                  {doctor.reviews.length > 2 && (
                    <button 
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="text-blue-600 font-medium flex items-center"
                    >
                      {showAllReviews ? (
                        <>
                          <ChevronUp size={16} className="mr-1" />
                          Ver menos opiniones
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} className="mr-1" />
                          Ver todas las opiniones ({doctor.reviews.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </section>
              
              {/* Share Buttons */}
              <section className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Compartir este perfil</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Te recomiendo consultar con ${doctor.name}, ${doctor.specialty}. ${window.location.href}`)}`)} 
                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
                    aria-label="Compartir en WhatsApp"
                  >
                    <MessageSquareIcon size={20} />
                  </button>
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)} 
                    className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                    aria-label="Compartir en Facebook"
                  >
                    <Facebook size={20} />
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Te recomiendo consultar con ${doctor.name}, ${doctor.specialty}.`)}&url=${encodeURIComponent(window.location.href)}`)} 
                    className="w-10 h-10 rounded-full bg-blue-100 text-blue-400 flex items-center justify-center hover:bg-blue-200"
                    aria-label="Compartir en Twitter"
                  >
                    <Twitter size={20} />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('¡Enlace copiado al portapapeles!');
                    }} 
                    className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
                    aria-label="Copiar enlace"
                  >
                    <Share2Icon size={20} />
                  </button>
                </div>
              </section>
            </div>
            
            <div>
              {/* Contact info */}
              <section className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Información de contacto</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <MapPin size={18} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{doctor.address}</span>
                  </li>
                  <li className="flex items-center">
                    <PhoneIcon size={18} className="text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">+52 55 1234 5678</span>
                  </li>
                  <li className="flex items-center">
                    <MailIcon size={18} className="text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">contacto@doctor.mx</span>
                  </li>
                  <li className="flex items-center">
                    <Globe size={18} className="text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">www.doctor.mx</span>
                  </li>
                  <li className="flex items-center">
                    <Languages size={18} className="text-blue-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{doctor.languages.join(', ')}</span>
                  </li>
                </ul>
              </section>
              
              {/* Schedule */}
              <section className="bg-gray-50 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Horario de atención</h2>
                <ul className="space-y-2">
                  {Object.entries(doctor.schedule).map(([day, hours]) => (
                    <li key={day} className="flex justify-between">
                      <span className="text-gray-600">{formatDayName(day)}</span>
                      <span className="font-medium text-gray-900">
                        {hours ? `${hours.start} - ${hours.end}` : 'Cerrado'}
                      </span>
                    </li>
                  ))}
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
                
                <Link 
                  to={`/reservar/${doctor.id}`}
                  className="mt-4 btn-primary w-full text-center"
                >
                  Ver todos los horarios
                </Link>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfilePage;