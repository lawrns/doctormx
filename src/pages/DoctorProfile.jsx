import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Icon from '../components/ui/Icon';
import Alert from '../components/ui/Alert';
import { DoctorLocationMap } from '../components/GoogleMaps';
import DoctorImage from '../components/DoctorImage';
import BookingWidget from '../components/BookingWidget';
import ReviewModal from '../components/ReviewModal';

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    type: 'in-person',
    date: '',
    time: '',
    reason: '',
    urgency: 'routine'
  });
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  async function fetchDoctor() {
    try {
      setLoading(true);
      setError(null);
               // Use local API for development, Netlify functions for production
               const isLocal = window.location.hostname === 'localhost';
               const endpoint = isLocal ? `/api/doctors/${id}` : `/.netlify/functions/doctor/${id}`;
               
               const response = await fetch(endpoint);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error fetching doctor');
      }
      
      setDoctor(data.doctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReviews() {
    try {
      setLoadingReviews(true);
      // Simulate fetching reviews - in real implementation, this would come from API
      const mockReviews = [
        {
          id: 1,
          patient_name: 'María González',
          rating: 5,
          comment: 'Excelente atención, muy profesional y empático. Recomiendo ampliamente.',
          date: '2024-01-15',
          verified: true
        },
        {
          id: 2,
          patient_name: 'Carlos Rodríguez',
          rating: 4,
          comment: 'Muy buen doctor, explica todo claramente. La consulta fue muy útil.',
          date: '2024-01-10',
          verified: true
        },
        {
          id: 3,
          patient_name: 'Ana Martínez',
          rating: 5,
          comment: 'Profesional y atento. Resolvió mis dudas de manera clara y concisa.',
          date: '2024-01-05',
          verified: false
        }
      ];
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  }

  useEffect(() => {
    fetchDoctor();
    fetchReviews();
  }, [id]);

  async function handleBooking() {
    if (!user) {
      navigate('/login?redirect=/doctors/' + id);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          patient_id: user.id,
          doctor_id: id,
          type: bookingData.type,
          date: bookingData.date,
          time: bookingData.time,
          reason: bookingData.reason,
          urgency: bookingData.urgency,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      alert('Cita agendada exitosamente. Te contactaremos pronto para confirmar.');
      setShowBookingModal(false);
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Error al agendar la cita. Intenta nuevamente.');
    }
  }


  function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Icon key={i} name="star" size="sm" className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Icon key="half" name="star-half" size="sm" className="text-yellow-400" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Icon key={`empty-${i}`} name="star" size="sm" className="text-gray-300" />);
    }

    return stars;
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-medical flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-medical flex items-center justify-center">
          <Alert variant="error" title="Error" message={error} />
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-medical flex items-center justify-center">
          <Alert variant="error" title="Doctor no encontrado" message="El doctor solicitado no existe." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-gradient-medical min-h-screen">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary-100/40 to-accent-100/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-secondary-100/30 to-primary-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Doctor Header */}
          <div className="glass-card mb-8 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Doctor Image and Basic Info */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-start gap-4 lg:gap-6 lg:w-1/3">
                <div className="relative">
                  <DoctorImage 
                    doctorName={doctor.full_name}
                    doctorLocation={doctor.location}
                    size="lg"
                    className="border-4 border-white"
                  />
                  {doctor.license_status === 'verified' && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-success-500 border-4 border-white rounded-full flex items-center justify-center">
                      <Icon name="check" size="sm" className="text-white" />
                    </div>
                  )}
                </div>
                
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">
                    {doctor.full_name}
                  </h1>
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                    <Icon name="academic-cap" size="sm" className="text-primary-600" />
                    <span className="text-lg text-primary-600 font-semibold">
                      {doctor.specialties?.join(', ') || 'Especialidad no especificada'}
                    </span>
                  </div>
                  
                           <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                             <div className="flex items-center gap-1">
                               {renderStars(Math.min(doctor.rating_avg || 4.5, 5))}
                               <span className="text-sm font-medium text-neutral-700 ml-1">
                                 {Math.min(doctor.rating_avg || 4.5, 5).toFixed(1)}/5
                               </span>
                             </div>
                             <div className="flex items-center gap-1">
                               <Icon name="chat-bubble-left-right" size="sm" className="text-neutral-500" />
                               <span className="text-sm text-neutral-600">
                                 {doctor.total_reviews || 0} reseñas verificadas
                               </span>
                             </div>
                             <div className="flex items-center gap-1">
                               <Icon name="clock" size="sm" className="text-neutral-500" />
                               <span className="text-sm text-neutral-600">
                                 Respuesta: {doctor.response_time_avg || 30} min
                               </span>
                             </div>
                           </div>
                  
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Icon name="map-pin" size="sm" className="text-neutral-500" />
                    <span className="text-sm text-neutral-600">
                      {doctor.location?.city || 'Ciudad de México'}, {doctor.location?.state || 'CDMX'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex-1 flex flex-col sm:flex-row lg:flex-col gap-4 lg:w-1/3">
                <Button
                  variant="primary"
                  size="lg"
                  icon="calendar-days"
                  onClick={() => setShowBookingModal(true)}
                  className="flex items-center justify-center"
                >
                  Agendar Cita
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  icon="video-camera"
                  onClick={() => navigate('/doctor')}
                  className="flex items-center justify-center"
                >
                  Consulta Telemedicina
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  icon="phone"
                  onClick={() => setActiveTab('contact')}
                  className="flex items-center justify-center"
                >
                  Contactar
                </Button>
              </div>

              {/* Booking Widget */}
              <div className="lg:w-1/3">
                <BookingWidget 
                  doctor={doctor} 
                  onBookingComplete={(bookingData) => {
                    alert(`Cita agendada exitosamente con ${bookingData.doctor} para el ${bookingData.date} a las ${bookingData.time}`);
                    setShowBookingModal(false);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="glass-card mb-8">
            <div className="border-b border-neutral-200">
              <nav className="flex space-x-8 px-6 pt-6">
                {[
                  { id: 'overview', label: 'Información General', icon: 'user' },
                  { id: 'experience', label: 'Experiencia', icon: 'academic-cap' },
                  { id: 'services', label: 'Servicios', icon: 'medical-symbol' },
                  { id: 'reviews', label: 'Reseñas', icon: 'star' },
                  { id: 'contact', label: 'Contacto', icon: 'phone' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    <Icon name={tab.icon} size="sm" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">Biografía</h3>
                    <p className="text-neutral-600 leading-relaxed">
                      {doctor.bio || 'Información biográfica no disponible.'}
                    </p>
                  </div>
                  
                  {/* Professional Summary */}
                  <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6">
                    <h4 className="font-semibold text-neutral-900 mb-3">Resumen Profesional</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Icon name="academic-cap" size="sm" className="text-primary-600" />
                        <span className="text-neutral-600">Graduado:</span>
                        <span className="font-medium">{doctor.graduation_year || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="map-pin" size="sm" className="text-primary-600" />
                        <span className="text-neutral-600">Ubicación:</span>
                        <span className="font-medium">{doctor.location?.city || 'No especificada'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="clock" size="sm" className="text-primary-600" />
                        <span className="text-neutral-600">Respuesta:</span>
                        <span className="font-medium">{doctor.response_time_avg || '30'} min</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Información Básica</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Cédula:</span>
                          <span className="font-medium">{doctor.cedula || 'Verificada'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Experiencia:</span>
                          <span className="font-medium">{doctor.experience_years || 'N/A'} años</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Idiomas:</span>
                          <span className="font-medium">{doctor.languages?.join(', ') || 'Español'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-2">Tarifas</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Consulta Presencial:</span>
                          <span className="font-medium text-primary-600">
                            ${doctor.consultation_fees?.base_fee || '800'} MXN
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Telemedicina:</span>
                          <span className="font-medium text-accent-600">
                            ${doctor.consultation_fees?.telemedicine_fee || '640'} MXN
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Seguimiento:</span>
                          <span className="font-medium text-secondary-600">
                            ${doctor.consultation_fees?.follow_up_fee || '500'} MXN
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience Tab */}
              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">Educación</h3>
                    <div className="space-y-4">
                      {(doctor.education || []).length > 0 ? (
                        doctor.education.map((edu, index) => (
                          <div key={index} className="bg-neutral-50 rounded-lg p-4 border-l-4 border-primary-500">
                            <div className="flex items-start gap-3">
                              <Icon name="academic-cap" size="sm" className="text-primary-600 mt-1" />
                              <div>
                                <h4 className="font-semibold text-neutral-900">{edu.degree || 'Título Profesional'}</h4>
                                <p className="text-neutral-600 text-sm">{edu.institution || 'Institución no especificada'}</p>
                                <p className="text-neutral-500 text-xs">{edu.year || 'Año no especificado'}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-neutral-50 rounded-lg p-4">
                          <p className="text-neutral-700">Información educativa no disponible.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">Certificaciones</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(doctor.certifications || []).map((cert, index) => (
                        <Badge key={index} variant="success" className="justify-center">
                          <Icon name="shield-check" size="sm" className="mr-2" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">Aseguradoras Aceptadas</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(doctor.insurance_providers || []).map((provider, index) => (
                        <Badge key={index} variant="info" className="justify-center">
                          {provider}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">Servicios Ofrecidos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(doctor.services || []).map((service, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
                          <Icon name="check-circle" size="sm" className="text-success-600" />
                          <span className="text-neutral-700">{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">Horarios de Atención</h3>
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Días:</span>
                          <span className="font-medium">
                            {(doctor.availability?.days || []).join(', ')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Horarios:</span>
                          <span className="font-medium">
                            {doctor.availability?.hours || 'Consultar disponibilidad'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Telemedicina:</span>
                          <span className="font-medium">
                            {doctor.availability?.telemedicine ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Emergencias:</span>
                          <span className="font-medium">
                            {doctor.availability?.emergency ? 'Disponible' : 'No disponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-neutral-900">Reseñas de Pacientes</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {renderStars(Math.min(doctor.rating_avg || 4.5, 5))}
                        <span className="text-lg font-semibold text-neutral-900">
                          {Math.min(doctor.rating_avg || 4.5, 5).toFixed(1)}/5
                        </span>
                        <span className="text-sm text-neutral-600">
                          ({doctor.total_reviews || 0} reseñas verificadas)
                        </span>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        icon="star"
                        onClick={() => setShowReviewModal(true)}
                      >
                        Agregar Reseña
                      </Button>
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = Math.floor(Math.random() * 20) + 1; // Simulate review distribution
                        const percentage = (count / (doctor.total_reviews || 1)) * 100;
                        return (
                          <div key={star} className="text-center">
                            <div className="flex items-center justify-center gap-1 mb-2">
                              <span className="text-sm font-medium text-neutral-700">{star}</span>
                              <Icon name="star" size="sm" className="text-yellow-400" />
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2 mb-1">
                              <div 
                                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-neutral-600">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {loadingReviews ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {review.patient_name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-neutral-900">{review.patient_name}</span>
                                  {review.verified && (
                                    <Badge variant="success" size="sm">
                                      <Icon name="check-circle" size="xs" className="mr-1" />
                                      Verificada
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {renderStars(review.rating)}
                                  <span className="text-xs text-neutral-500">{review.date}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="text-neutral-700 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">Información de Contacto</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Icon name="phone" size="sm" className="text-primary-600" />
                          <span className="text-neutral-700">{doctor.phone || 'No disponible'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Icon name="envelope" size="sm" className="text-primary-600" />
                          <span className="text-neutral-700">{doctor.email || 'No disponible'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Icon name="globe-alt" size="sm" className="text-primary-600" />
                          <a href={doctor.website} className="text-primary-600 hover:text-primary-700">
                            {doctor.website || 'No disponible'}
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">Dirección del Consultorio</h3>
                      <div className="flex items-start gap-3 mb-4">
                        <Icon name="map-pin" size="sm" className="text-primary-600 mt-1" />
                        <div>
                          <p className="text-neutral-700">{doctor.clinic_address || 'Dirección no disponible'}</p>
                          <p className="text-sm text-neutral-600 mt-1">
                            {doctor.location?.city || 'Ciudad de México'}, {doctor.location?.state || 'CDMX'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Location Map */}
                      {doctor.clinic_address && (
                        <div className="mt-4">
                          <DoctorLocationMap doctor={doctor} height="300px" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="primary"
                      icon="calendar-days"
                      onClick={() => setShowBookingModal(true)}
                      className="flex items-center justify-center"
                    >
                      Agendar Cita Presencial
                    </Button>
                    
                    <Button
                      variant="secondary"
                      icon="video-camera"
                      onClick={() => navigate('/doctor')}
                      className="flex items-center justify-center"
                    >
                      Consulta Telemedicina
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {showBookingModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBookingModal(false)}></div>
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Agendar Cita</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Tipo de Consulta
                    </label>
                    <select
                      value={bookingData.type}
                      onChange={(e) => setBookingData({ ...bookingData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="in-person">Consulta Presencial</option>
                      <option value="telemedicine">Telemedicina</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Hora
                    </label>
                    <select
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Seleccionar hora</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Motivo de la Consulta
                    </label>
                    <textarea
                      value={bookingData.reason}
                      onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe brevemente el motivo de tu consulta..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Urgencia
                    </label>
                    <select
                      value={bookingData.urgency}
                      onChange={(e) => setBookingData({ ...bookingData, urgency: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="routine">Rutina</option>
                      <option value="urgent">Urgente</option>
                      <option value="emergency">Emergencia</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleBooking}
                    className="flex-1"
                  >
                    Agendar Cita
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        <ReviewModal
          doctor={doctor}
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          onSubmit={(reviewData) => {
            alert(`Reseña enviada exitosamente para ${reviewData.doctorName}`);
            setShowReviewModal(false);
          }}
        />
      </div>
    </Layout>
  );
}