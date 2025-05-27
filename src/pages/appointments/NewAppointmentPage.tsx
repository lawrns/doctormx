import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, MapPin, Star, Clock, Calendar, Video,
  Phone, Building, Filter, ChevronRight, User, Shield, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image?: string;
  rating: number;
  reviewCount: number;
  experience: number;
  education: string[];
  languages: string[];
  consultationFee: number;
  availability: {
    date: Date;
    slots: string[];
  }[];
  location: {
    name: string;
    address: string;
    distance: number;
  };
  acceptsInsurance: string[];
  consultationTypes: ('in-person' | 'video' | 'phone')[];
  nextAvailable: Date;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function NewAppointmentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'search' | 'doctor' | 'datetime' | 'confirm'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<'in-person' | 'video' | 'phone'>('in-person');
  const [appointmentReason, setAppointmentReason] = useState('');
  const [familyMember, setFamilyMember] = useState('self');
  
  // Mock doctors data
  const [doctors] = useState<Doctor[]>([
    {
      id: '1',
      name: 'Dra. María González',
      specialty: 'Cardiología',
      rating: 4.9,
      reviewCount: 234,
      experience: 15,
      education: ['UNAM - Medicina', 'Hospital General - Especialidad'],
      languages: ['Español', 'Inglés'],
      consultationFee: 800,
      availability: [
        {
          date: new Date('2024-03-20'),
          slots: ['10:00', '10:30', '11:00', '14:00', '14:30', '15:00']
        },
        {
          date: new Date('2024-03-21'),
          slots: ['09:00', '09:30', '10:00', '11:00', '11:30']
        }
      ],
      location: {
        name: 'Hospital Ángeles Pedregal',
        address: 'Av. Periférico Sur 123, CDMX',
        distance: 2.5
      },
      acceptsInsurance: ['IMSS', 'ISSSTE', 'Seguro Popular', 'GNP'],
      consultationTypes: ['in-person', 'video'],
      nextAvailable: new Date('2024-03-20')
    },
    {
      id: '2',
      name: 'Dr. Carlos Mendoza',
      specialty: 'Medicina General',
      rating: 4.7,
      reviewCount: 189,
      experience: 10,
      education: ['La Salle - Medicina'],
      languages: ['Español'],
      consultationFee: 500,
      availability: [
        {
          date: new Date('2024-03-20'),
          slots: ['16:00', '16:30', '17:00', '17:30', '18:00']
        }
      ],
      location: {
        name: 'Consultorio Médico Roma',
        address: 'Orizaba 123, Roma Norte, CDMX',
        distance: 1.2
      },
      acceptsInsurance: ['IMSS', 'Particular'],
      consultationTypes: ['in-person', 'video', 'phone'],
      nextAvailable: new Date('2024-03-20')
    }
  ]);

  const specialties = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Pediatría',
    'Psiquiatría',
    'Traumatología',
    'Endocrinología',
    'Neurología',
    'Oftalmología'
  ];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep('datetime');
  };

  const handleSelectDateTime = () => {
    if (!selectedDate || !selectedTime) {
      showToast('Por favor selecciona fecha y hora', 'error');
      return;
    }
    setStep('confirm');
  };

  const handleConfirmAppointment = async () => {
    if (!appointmentReason.trim()) {
      showToast('Por favor describe el motivo de tu consulta', 'error');
      return;
    }

    // Here you would make the API call to create the appointment
    showToast('¡Cita agendada exitosamente!', 'success');
    navigate('/appointments');
  };

  const getAvailableSlots = (date: Date): TimeSlot[] => {
    const availability = selectedDoctor?.availability.find(
      a => a.date.toDateString() === date.toDateString()
    );
    
    if (!availability) return [];
    
    return availability.slots.map(slot => ({
      time: slot,
      available: true // In real app, check if slot is already booked
    }));
  };

  return (
    <>
      <SEO 
        title="Agendar Cita - DoctorMX"
        description="Agenda tu cita médica con los mejores especialistas de México"
        keywords={['agendar cita médica', 'consulta doctor', 'cita online']}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button
                onClick={() => step === 'search' ? navigate('/appointments') : setStep('search')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Agendar Nueva Cita</h1>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 'search' ? 'bg-brand-jade-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Buscar Doctor</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  ['datetime', 'confirm'].includes(step) ? 'bg-brand-jade-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Fecha y Hora</span>
              </div>
              
              <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === 'confirm' ? 'bg-brand-jade-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium">Confirmar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Step 1: Search Doctors */}
          {step === 'search' && (
            <div>
              {/* Search and Filters */}
              <Card className="p-6 mb-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre o especialidad..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especialidad
                      </label>
                      <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                      >
                        <option value="all">Todas las especialidades</option>
                        {specialties.map(specialty => (
                          <option key={specialty} value={specialty}>{specialty}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de consulta
                      </label>
                      <select
                        value={consultationType}
                        onChange={(e) => setConsultationType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                      >
                        <option value="in-person">Presencial</option>
                        <option value="video">Videoconsulta</option>
                        <option value="phone">Telefónica</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Doctors List */}
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-10 h-10 text-gray-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{doctor.name}</h3>
                          <p className="text-gray-600">{doctor.specialty}</p>
                          
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                              <span className="ml-1 text-sm text-gray-500">({doctor.reviewCount})</span>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <Award className="w-4 h-4 mr-1" />
                              {doctor.experience} años
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              {doctor.location.distance} km
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              <Building className="w-4 h-4 inline mr-1" />
                              {doctor.location.name}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {doctor.consultationTypes.map(type => (
                              <Badge key={type} variant="secondary">
                                {type === 'in-person' ? 'Presencial' :
                                 type === 'video' ? 'Video' : 'Teléfono'}
                              </Badge>
                            ))}
                            {doctor.acceptsInsurance.slice(0, 3).map(insurance => (
                              <Badge key={insurance} className="bg-green-100 text-green-800">
                                {insurance}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${doctor.consultationFee}
                        </p>
                        <p className="text-sm text-gray-500">MXN</p>
                        
                        <Button
                          className="mt-3"
                          onClick={() => handleSelectDoctor(doctor)}
                        >
                          Seleccionar
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 'datetime' && selectedDoctor && (
            <div>
              <Card className="p-6 mb-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDoctor.name}</h3>
                    <p className="text-gray-600">{selectedDoctor.specialty}</p>
                  </div>
                </div>

                {/* Calendar */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Selecciona una fecha</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedDoctor.availability.map((availability) => (
                      <button
                        key={availability.date.toISOString()}
                        onClick={() => setSelectedDate(availability.date)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedDate?.toDateString() === availability.date.toDateString()
                            ? 'border-brand-jade-600 bg-brand-jade-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">
                          {availability.date.toLocaleDateString('es-MX', { weekday: 'short' })}
                        </p>
                        <p className="text-2xl font-bold">
                          {availability.date.getDate()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {availability.date.toLocaleDateString('es-MX', { month: 'short' })}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDate && (
                  <div>
                    <h4 className="font-medium mb-3">Horarios disponibles</h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {getAvailableSlots(selectedDate).map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedTime === slot.time
                              ? 'border-brand-jade-600 bg-brand-jade-50'
                              : slot.available
                              ? 'border-gray-200 hover:border-gray-300'
                              : 'border-gray-200 bg-gray-100 cursor-not-allowed'
                          }`}
                        >
                          <Clock className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                          <p className="text-sm font-medium">{slot.time}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSelectDateTime}
                    disabled={!selectedDate || !selectedTime}
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && selectedDoctor && selectedDate && selectedTime && (
            <div>
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Confirmar Cita</h3>
                
                {/* Appointment Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium">{selectedDoctor.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Especialidad:</span>
                      <span className="font-medium">{selectedDoctor.specialty}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">
                        {selectedDate.toLocaleDateString('es-MX', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="font-medium">
                        {consultationType === 'in-person' ? 'Presencial' :
                         consultationType === 'video' ? 'Videoconsulta' : 'Telefónica'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-medium text-lg">${selectedDoctor.consultationFee} MXN</span>
                    </div>
                  </div>
                </div>

                {/* Patient Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ¿Para quién es la cita?
                  </label>
                  <select
                    value={familyMember}
                    onChange={(e) => setFamilyMember(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                  >
                    <option value="self">Para mí</option>
                    <option value="family-1">María García (Esposa)</option>
                    <option value="family-2">Carlos García Jr. (Hijo)</option>
                  </select>
                </div>

                {/* Appointment Reason */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo de la consulta *
                  </label>
                  <textarea
                    value={appointmentReason}
                    onChange={(e) => setAppointmentReason(e.target.value)}
                    rows={4}
                    placeholder="Describe brevemente el motivo de tu consulta..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-jade-500"
                  />
                </div>

                {/* Terms */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    Al confirmar, aceptas que se te cobrará ${selectedDoctor.consultationFee} MXN. 
                    Las cancelaciones deben hacerse con al menos 24 horas de anticipación.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setStep('datetime')}
                  >
                    Regresar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleConfirmAppointment}
                    disabled={!appointmentReason.trim()}
                  >
                    Confirmar Cita
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}