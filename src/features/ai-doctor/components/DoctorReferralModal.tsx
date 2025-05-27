import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Phone, Star, Calendar, User, Award, Shield, Video, MessageCircle, ChevronRight, Heart, Activity } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  subspecialties: string[];
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  experience: number;
  education: string[];
  languages: string[];
  image: string;
  phone: string;
  isAvailable: boolean;
  nextAvailable: string;
  consultationFee: number;
  acceptsInsurance: boolean;
  insuranceProviders: string[];
  hasTelemedicine: boolean;
  responseTime: string;
  patientCount: number;
  verificationBadges: string[];
  availableSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  type: 'in-person' | 'telemedicine';
  available: boolean;
}

interface DoctorReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedSpecialty?: string;
  userLocation?: { latitude: number; longitude: number };
}

// Mock data generator
const generateMockDoctors = (specialty?: string): Doctor[] => {
  const specialties = specialty ? [specialty] : [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Gastroenterología',
    'Neurología',
    'Pediatría',
    'Ginecología',
    'Traumatología'
  ];

  const doctorNames = [
    { name: 'Dra. María González Hernández', gender: 'F' },
    { name: 'Dr. Carlos Rodríguez López', gender: 'M' },
    { name: 'Dra. Ana Martínez Silva', gender: 'F' },
    { name: 'Dr. José Luis Pérez García', gender: 'M' },
    { name: 'Dra. Patricia Sánchez Ruiz', gender: 'F' },
    { name: 'Dr. Roberto Jiménez Morales', gender: 'M' },
    { name: 'Dra. Laura Díaz Torres', gender: 'F' },
    { name: 'Dr. Miguel Ángel Flores', gender: 'M' }
  ];

  const hospitals = [
    'Hospital Ángeles Pedregal',
    'Médica Sur',
    'Hospital ABC Santa Fe',
    'Centro Médico Nacional Siglo XXI',
    'Hospital Español',
    'Torre Médica Polanco',
    'Hospital San Ángel Inn',
    'Centro Médico ABC Observatorio'
  ];

  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      const dateStr = date.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' });
      
      const times = ['09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00'];
      
      times.forEach((time, idx) => {
        const isAvailable = Math.random() > 0.3;
        slots.push({
          id: `slot-${day}-${idx}`,
          date: dateStr,
          time,
          type: Math.random() > 0.5 ? 'in-person' : 'telemedicine',
          available: isAvailable && day > 0 // Today's slots are mostly taken
        });
      });
    }
    
    return slots;
  };

  return doctorNames.map((doc, index) => {
    const selectedSpecialty = specialty || specialties[index % specialties.length];
    
    return {
      id: `doctor-${index}`,
      name: doc.name,
      specialty: selectedSpecialty,
      subspecialties: [
        'Medicina Interna',
        'Urgencias Médicas',
        index % 2 === 0 ? 'Medicina del Deporte' : 'Medicina Preventiva'
      ],
      address: hospitals[index],
      distance: Number((Math.random() * 10 + 0.5).toFixed(1)),
      rating: Number((Math.random() * 0.8 + 4.2).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 500) + 50,
      experience: Math.floor(Math.random() * 20) + 5,
      education: [
        'UNAM - Facultad de Medicina',
        `Especialidad en ${selectedSpecialty} - Instituto Nacional`,
        'Fellowship en Mayo Clinic, USA'
      ],
      languages: ['Español', 'Inglés', index % 3 === 0 ? 'Francés' : ''],
      image: `/images/doctor-${doc.gender}-${(index % 4) + 1}.jpg`,
      phone: `55 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
      isAvailable: Math.random() > 0.3,
      nextAvailable: 'Mañana 10:00 AM',
      consultationFee: Math.floor(Math.random() * 1000) + 800,
      acceptsInsurance: Math.random() > 0.3,
      insuranceProviders: ['GNP', 'AXA', 'MetLife', 'Allianz', 'BUPA'],
      hasTelemedicine: Math.random() > 0.4,
      responseTime: '~15 min',
      patientCount: Math.floor(Math.random() * 5000) + 1000,
      verificationBadges: ['Cédula Verificada', 'CONAMEGE', 'Top Doctor 2024'],
      availableSlots: generateTimeSlots()
    };
  });
};

function DoctorReferralModal({ isOpen, onClose, suggestedSpecialty, userLocation }: DoctorReferralModalProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [bookingType, setBookingType] = useState<'consultation' | 'telemedicine'>('consultation');
  const [filter, setFilter] = useState<'all' | 'available' | 'telemedicine'>('all');

  const allDoctors = useMemo(() => 
    generateMockDoctors(suggestedSpecialty).sort((a, b) => {
      // Sort by availability first, then distance
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      return a.distance - b.distance;
    }),
    [suggestedSpecialty]
  );

  const doctors = useMemo(() => {
    return allDoctors.filter(doctor => {
      if (filter === 'available') return doctor.isAvailable;
      if (filter === 'telemedicine') return doctor.hasTelemedicine;
      return true;
    });
  }, [allDoctors, filter]);

  const handleBookAppointment = () => {
    if (selectedSlot) {
      setShowBookingConfirm(true);
    }
  };

  const confirmBooking = () => {
    // In a real app, this would send the booking to the backend
    alert(`¡Cita confirmada con ${selectedDoctor?.name} para el ${selectedSlot?.date} a las ${selectedSlot?.time}!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#006D77] to-[#005B66] text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <User className="mr-2" />
                    {suggestedSpecialty ? `Especialistas en ${suggestedSpecialty}` : 'Doctores Disponibles'}
                  </h2>
                  <p className="text-[#D0F0EF] mt-1">
                    {doctors.length} doctores encontrados cerca de ti
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all' 
                      ? 'bg-white text-[#006D77]' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'available' 
                      ? 'bg-white text-[#006D77]' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Disponibles Hoy
                </button>
                <button
                  onClick={() => setFilter('telemedicine')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'telemedicine' 
                      ? 'bg-white text-[#006D77]' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  Telemedicina
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-180px)]">
              {/* Doctor List */}
              <div className={`${selectedDoctor ? 'w-2/5' : 'w-full'} overflow-y-auto border-r border-gray-200 transition-all duration-300`}>
                {doctors.map((doctor) => (
                  <motion.div
                    key={doctor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedDoctor?.id === doctor.id ? 'bg-[#D0F0EF]/30' : ''
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center bg-[#006D77] text-white text-xl font-bold">
                          {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-[#006D77] font-medium">{doctor.specialty}</p>
                        <p className="text-sm text-gray-600">{doctor.address}</p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-1 text-[#006D77]" />
                            {doctor.distance} km
                          </span>
                          <span className="flex items-center text-gray-600">
                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                            {doctor.rating} ({doctor.reviewCount})
                          </span>
                          <span className="flex items-center text-gray-600">
                            <Award className="w-4 h-4 mr-1 text-[#006D77]" />
                            {doctor.experience} años
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 mt-2">
                          {doctor.isAvailable && (
                            <span className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              <Activity className="w-3 h-3 mr-1" />
                              Disponible hoy
                            </span>
                          )}
                          {doctor.hasTelemedicine && (
                            <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              <Video className="w-3 h-3 mr-1" />
                              Videoconsulta
                            </span>
                          )}
                          {doctor.acceptsInsurance && (
                            <span className="inline-flex items-center text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              <Shield className="w-3 h-3 mr-1" />
                              Acepta seguros
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Selected Doctor Details */}
              {selectedDoctor && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex-1 overflow-y-auto"
                >
                  <div className="p-6">
                    {/* Doctor Header */}
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center bg-[#006D77] text-white text-2xl font-bold">
                          {selectedDoctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800">{selectedDoctor.name}</h3>
                        <p className="text-lg text-[#006D77] font-medium">{selectedDoctor.specialty}</p>
                        <p className="text-gray-600">{selectedDoctor.address}</p>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {selectedDoctor.verificationBadges.map((badge, idx) => (
                            <span key={idx} className="inline-flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              <Shield className="w-3 h-3 mr-1" />
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#006D77]">${selectedDoctor.consultationFee}</p>
                        <p className="text-sm text-gray-600">por consulta</p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-gray-800">{selectedDoctor.patientCount}</p>
                        <p className="text-xs text-gray-600">Pacientes</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Award className="w-6 h-6 text-[#006D77] mx-auto mb-1" />
                        <p className="text-2xl font-bold text-gray-800">{selectedDoctor.experience}</p>
                        <p className="text-xs text-gray-600">Años exp.</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-gray-800">{selectedDoctor.rating}</p>
                        <p className="text-xs text-gray-600">Calificación</p>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-gray-800">{selectedDoctor.responseTime}</p>
                        <p className="text-xs text-gray-600">Respuesta</p>
                      </div>
                    </div>

                    {/* Education & Languages */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Educación</h4>
                        <ul className="space-y-1">
                          {selectedDoctor.education.map((edu, idx) => (
                            <li key={idx} className="text-sm text-gray-600">• {edu}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Idiomas</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDoctor.languages.filter(l => l).map((lang, idx) => (
                            <span key={idx} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Insurance */}
                    {selectedDoctor.acceptsInsurance && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Seguros Aceptados</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDoctor.insuranceProviders.map((provider, idx) => (
                            <span key={idx} className="text-sm bg-white text-blue-700 px-3 py-1 rounded">
                              {provider}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Slots */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4">Horarios Disponibles</h4>
                      
                      {/* Consultation Type Selector */}
                      <div className="flex space-x-2 mb-4">
                        <button
                          onClick={() => setBookingType('consultation')}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            bookingType === 'consultation'
                              ? 'bg-[#006D77] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Consulta Presencial
                        </button>
                        {selectedDoctor.hasTelemedicine && (
                          <button
                            onClick={() => setBookingType('telemedicine')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                              bookingType === 'telemedicine'
                                ? 'bg-[#006D77] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Videoconsulta
                          </button>
                        )}
                      </div>
                      
                      {/* Time Slots Grid */}
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {Object.entries(
                          selectedDoctor.availableSlots
                            .filter(slot => bookingType === 'consultation' || slot.type === 'telemedicine')
                            .reduce((acc, slot) => {
                              if (!acc[slot.date]) acc[slot.date] = [];
                              acc[slot.date].push(slot);
                              return acc;
                            }, {} as Record<string, TimeSlot[]>)
                        ).map(([date, slots]) => (
                          <div key={date}>
                            <p className="text-sm font-medium text-gray-700 mb-2">{date}</p>
                            <div className="grid grid-cols-4 gap-2">
                              {slots.map(slot => (
                                <button
                                  key={slot.id}
                                  disabled={!slot.available}
                                  onClick={() => slot.available && setSelectedSlot(slot)}
                                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedSlot?.id === slot.id
                                      ? 'bg-[#006D77] text-white'
                                      : slot.available
                                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  {slot.time}
                                  {slot.type === 'telemedicine' && (
                                    <Video className="w-3 h-3 mx-auto mt-1" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Book Button */}
                    <div className="mt-6">
                      <button
                        onClick={handleBookAppointment}
                        disabled={!selectedSlot}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                          selectedSlot
                            ? 'bg-[#006D77] text-white hover:bg-[#005B66]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {selectedSlot
                          ? `Agendar Cita - ${selectedSlot.date} a las ${selectedSlot.time}`
                          : 'Selecciona un horario para continuar'
                        }
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Booking Confirmation Modal */}
            <AnimatePresence>
              {showBookingConfirm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center p-6"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="bg-white rounded-xl p-6 max-w-md w-full"
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Confirmar Cita</h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Doctor</p>
                        <p className="font-medium">{selectedDoctor?.name}</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Fecha y Hora</p>
                        <p className="font-medium">{selectedSlot?.date} - {selectedSlot?.time}</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tipo de Consulta</p>
                        <p className="font-medium flex items-center">
                          {selectedSlot?.type === 'telemedicine' ? (
                            <>
                              <Video className="w-4 h-4 mr-1" />
                              Videoconsulta
                            </>
                          ) : (
                            <>
                              <User className="w-4 h-4 mr-1" />
                              Consulta Presencial
                            </>
                          )}
                        </p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">Costo</p>
                        <p className="font-medium">${selectedDoctor?.consultationFee} MXN</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => setShowBookingConfirm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmBooking}
                        className="flex-1 px-4 py-2 bg-[#006D77] text-white rounded-lg hover:bg-[#005B66]"
                      >
                        Confirmar Cita
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DoctorReferralModal;