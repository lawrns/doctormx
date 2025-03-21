import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Input, 
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../../components/ui';
import { AlertCircle, Award, Book, Briefcase, Calendar, Camera, CheckCircle, Clock, DollarSign, Edit, FileText, Globe, Link, Lock, Mail, MapPin, Paperclip, Phone, Plus, Save, Shield, Trash, Upload, User, Video } from 'lucide-react';

interface ProfileData {
  id: string;
  name: string;
  title: string;
  specialty: string;
  bio: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  profileImage?: string;
  coverImage?: string;
  education: {
    id: string;
    degree: string;
    institution: string;
    year: string;
  }[];
  experience: {
    id: string;
    position: string;
    institution: string;
    startYear: string;
    endYear: string | null;
    current: boolean;
  }[];
  languages: string[];
  specialties: string[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    year: string;
    file?: string;
  }[];
  appointmentSettings: {
    price: number;
    duration: number;
    serviceFee: number;
    allowTelemedicine: boolean;
    allowInPerson: boolean;
  };
  schedule: {
    [key: string]: {
      enabled: boolean;
      slots: {
        start: string;
        end: string;
      }[];
    };
  };
}

const weekdays = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const EnhancedDoctorProfilePage: React.FC = () => {
  const { doctorId, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // New education item
  const [newEducation, setNewEducation] = useState({
    degree: '',
    institution: '',
    year: ''
  });
  
  // New experience item
  const [newExperience, setNewExperience] = useState({
    position: '',
    institution: '',
    startYear: '',
    endYear: '',
    current: false
  });
  
  // New certification item
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    year: ''
  });
  
  // Fetch doctor profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          const mockProfileData: ProfileData = {
            id: doctorId,
            name: 'Dr. Carlos Méndez García',
            title: 'Médico Cirujano',
            specialty: 'Medicina Familiar',
            bio: 'Médico familiar con 10 años de experiencia, especializado en atención preventiva y manejo de enfermedades crónicas. Mi enfoque se centra en la atención integral del paciente y la promoción de hábitos de vida saludables.',
            email: 'dr.carlos@example.com',
            phone: '+52 55 1234 5678',
            address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
            licenseNumber: 'MED-12345',
            profileImage: '/doctor-profile.jpg',
            education: [
              {
                id: 'edu_1',
                degree: 'Licenciatura en Medicina',
                institution: 'Universidad Nacional Autónoma de México (UNAM)',
                year: '2010'
              },
              {
                id: 'edu_2',
                degree: 'Especialidad en Medicina Familiar',
                institution: 'Hospital General de México',
                year: '2013'
              }
            ],
            experience: [
              {
                id: 'exp_1',
                position: 'Médico Familiar',
                institution: 'Hospital Ángeles',
                startYear: '2013',
                endYear: '2018',
                current: false
              },
              {
                id: 'exp_2',
                position: 'Médico Familiar',
                institution: 'Consulta Privada',
                startYear: '2018',
                endYear: null,
                current: true
              }
            ],
            languages: ['Español', 'Inglés'],
            specialties: ['Medicina Familiar', 'Atención Preventiva', 'Manejo de Enfermedades Crónicas'],
            certifications: [
              {
                id: 'cert_1',
                name: 'Certificación del Consejo Mexicano de Medicina Familiar',
                issuer: 'Consejo Mexicano de Medicina Familiar',
                year: '2013'
              },
              {
                id: 'cert_2',
                name: 'Advanced Cardiovascular Life Support (ACLS)',
                issuer: 'American Heart Association',
                year: '2021'
              }
            ],
            appointmentSettings: {
              price: 800,
              duration: 30,
              serviceFee: 50,
              allowTelemedicine: true,
              allowInPerson: true
            },
            schedule: {
              monday: {
                enabled: true,
                slots: [
                  { start: '09:00', end: '13:00' },
                  { start: '15:00', end: '18:00' }
                ]
              },
              tuesday: {
                enabled: true,
                slots: [
                  { start: '09:00', end: '13:00' },
                  { start: '15:00', end: '18:00' }
                ]
              },
              wednesday: {
                enabled: true,
                slots: [
                  { start: '09:00', end: '13:00' },
                  { start: '15:00', end: '18:00' }
                ]
              },
              thursday: {
                enabled: true,
                slots: [
                  { start: '09:00', end: '13:00' },
                  { start: '15:00', end: '18:00' }
                ]
              },
              friday: {
                enabled: true,
                slots: [
                  { start: '09:00', end: '15:00' }
                ]
              },
              saturday: {
                enabled: false,
                slots: []
              },
              sunday: {
                enabled: false,
                slots: []
              }
            }
          };
          
          setProfileData(mockProfileData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [doctorId]);
  
  // Save profile data
  const saveProfileData = async () => {
    if (!profileData) return;
    
    try {
      setSaving(true);
      
      // In a real implementation, save to Supabase
      
      // For now, just simulate an API call
      setTimeout(() => {
        setSaving(false);
        setEditMode(false);
        alert('Perfil actualizado exitosamente');
      }, 1000);
    } catch (error) {
      console.error('Error saving profile data:', error);
      setSaving(false);
      alert('Error al guardar los cambios. Por favor intenta de nuevo.');
    }
  };
  
  // Add new education item
  const addEducation = () => {
    if (!profileData) return;
    if (!newEducation.degree || !newEducation.institution || !newEducation.year) return;
    
    const education = [
      ...profileData.education,
      {
        id: `edu_${Date.now()}`,
        ...newEducation
      }
    ];
    
    setProfileData({ ...profileData, education });
    setNewEducation({ degree: '', institution: '', year: '' });
  };
  
  // Remove education item
  const removeEducation = (id: string) => {
    if (!profileData) return;
    
    const education = profileData.education.filter(item => item.id !== id);
    setProfileData({ ...profileData, education });
  };
  
  // Add new experience item
  const addExperience = () => {
    if (!profileData) return;
    if (!newExperience.position || !newExperience.institution || !newExperience.startYear) return;
    
    const experience = [
      ...profileData.experience,
      {
        id: `exp_${Date.now()}`,
        ...newExperience,
        endYear: newExperience.current ? null : newExperience.endYear
      }
    ];
    
    setProfileData({ ...profileData, experience });
    setNewExperience({
      position: '',
      institution: '',
      startYear: '',
      endYear: '',
      current: false
    });
  };
  
  // Remove experience item
  const removeExperience = (id: string) => {
    if (!profileData) return;
    
    const experience = profileData.experience.filter(item => item.id !== id);
    setProfileData({ ...profileData, experience });
  };
  
  // Add new certification item
  const addCertification = () => {
    if (!profileData) return;
    if (!newCertification.name || !newCertification.issuer || !newCertification.year) return;
    
    const certifications = [
      ...profileData.certifications,
      {
        id: `cert_${Date.now()}`,
        ...newCertification
      }
    ];
    
    setProfileData({ ...profileData, certifications });
    setNewCertification({ name: '', issuer: '', year: '' });
  };
  
  // Remove certification item
  const removeCertification = (id: string) => {
    if (!profileData) return;
    
    const certifications = profileData.certifications.filter(item => item.id !== id);
    setProfileData({ ...profileData, certifications });
  };
  
  // Add language
  const addLanguage = (language: string) => {
    if (!profileData) return;
    if (!language || profileData.languages.includes(language)) return;
    
    const languages = [...profileData.languages, language];
    setProfileData({ ...profileData, languages });
  };
  
  // Remove language
  const removeLanguage = (language: string) => {
    if (!profileData) return;
    
    const languages = profileData.languages.filter(item => item !== language);
    setProfileData({ ...profileData, languages });
  };
  
  // Add specialty
  const addSpecialty = (specialty: string) => {
    if (!profileData) return;
    if (!specialty || profileData.specialties.includes(specialty)) return;
    
    const specialties = [...profileData.specialties, specialty];
    setProfileData({ ...profileData, specialties });
  };
  
  // Remove specialty
  const removeSpecialty = (specialty: string) => {
    if (!profileData) return;
    
    const specialties = profileData.specialties.filter(item => item !== specialty);
    setProfileData({ ...profileData, specialties });
  };
  
  // Add schedule slot
  const addScheduleSlot = (day: string) => {
    if (!profileData) return;
    
    const daySchedule = profileData.schedule[day];
    const updatedSlots = [...daySchedule.slots, { start: '09:00', end: '18:00' }];
    
    setProfileData({
      ...profileData,
      schedule: {
        ...profileData.schedule,
        [day]: {
          ...daySchedule,
          slots: updatedSlots
        }
      }
    });
  };
  
  // Remove schedule slot
  const removeScheduleSlot = (day: string, index: number) => {
    if (!profileData) return;
    
    const daySchedule = profileData.schedule[day];
    const updatedSlots = daySchedule.slots.filter((_, i) => i !== index);
    
    setProfileData({
      ...profileData,
      schedule: {
        ...profileData.schedule,
        [day]: {
          ...daySchedule,
          slots: updatedSlots
        }
      }
    });
  };
  
  // Update schedule slot
  const updateScheduleSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    if (!profileData) return;
    
    const daySchedule = profileData.schedule[day];
    const updatedSlots = daySchedule.slots.map((slot, i) => {
      if (i === index) {
        return { ...slot, [field]: value };
      }
      return slot;
    });
    
    setProfileData({
      ...profileData,
      schedule: {
        ...profileData.schedule,
        [day]: {
          ...daySchedule,
          slots: updatedSlots
        }
      }
    });
  };
  
  // Toggle day enabled
  const toggleDayEnabled = (day: string) => {
    if (!profileData) return;
    
    const daySchedule = profileData.schedule[day];
    
    setProfileData({
      ...profileData,
      schedule: {
        ...profileData.schedule,
        [day]: {
          ...daySchedule,
          enabled: !daySchedule.enabled
        }
      }
    });
  };
  
  // Update appointment settings
  const updateAppointmentSetting = (field: keyof ProfileData['appointmentSettings'], value: any) => {
    if (!profileData) return;
    
    setProfileData({
      ...profileData,
      appointmentSettings: {
        ...profileData.appointmentSettings,
        [field]: value
      }
    });
  };
  
  return (
    <DashboardLayout title="Perfil Profesional" loading={loading}>
      {profileData && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Perfil Profesional</h1>
              <p className="text-gray-500">Administra tu información profesional y configuración de consultas</p>
            </div>
            
            <div className="flex space-x-2">
              {editMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setEditMode(false)}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    variant="primary"
                    icon={saving ? undefined : <Save size={16} />}
                    onClick={saveProfileData}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  icon={<Edit size={16} />}
                  onClick={() => setEditMode(true)}
                >
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Profile Preview Card */}
            <div>
              <Card className="p-6 mb-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="h-28 w-28 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl mx-auto overflow-hidden">
                      {profileData.profileImage ? (
                        <img 
                          src={profileData.profileImage} 
                          alt={profileData.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        profileData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    
                    {editMode && (
                      <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg">
                        <Camera size={16} />
                      </button>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-semibold mt-4">{profileData.name}</h2>
                  <p className="text-gray-600">{profileData.specialty}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail size={16} className="text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Email</p>
                      <p className="font-medium">{profileData.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone size={16} className="text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Teléfono</p>
                      <p className="font-medium">{profileData.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin size={16} className="text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Dirección</p>
                      <p className="font-medium">{profileData.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FileText size={16} className="text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-sm">Cédula Profesional</p>
                      <p className="font-medium">{profileData.licenseNumber}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Visibilidad del perfil</h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        className="mr-2"
                        checked={true}
                      />
                      <span className="flex items-center">
                        <Globe size={14} className="mr-1" />
                        Público
                      </span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        className="mr-2"
                      />
                      <span className="flex items-center">
                        <Lock size={14} className="mr-1" />
                        Privado
                      </span>
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    La configuración pública permite que tu perfil sea visible para pacientes potenciales en el directorio médico.
                  </p>
                </div>
              </Card>
              
              <Card className="p-6">
                <h2 className="font-semibold mb-4">Horarios de consulta</h2>
                
                <div className="space-y-3">
                  {weekdays.map(({ key, label }) => (
                    <div 
                      key={key} 
                      className={`p-3 rounded-lg ${
                        profileData.schedule[key].enabled ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{label}</span>
                        
                        {editMode ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={profileData.schedule[key].enabled}
                              onChange={() => toggleDayEnabled(key)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        ) : (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            profileData.schedule[key].enabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {profileData.schedule[key].enabled ? 'Abierto' : 'Cerrado'}
                          </span>
                        )}
                      </div>
                      
                      {profileData.schedule[key].enabled && (
                        <div className="space-y-2">
                          {profileData.schedule[key].slots.map((slot, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <Clock size={14} className="text-gray-400 mr-1" />
                              <span>{slot.start} - {slot.end}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="basic">
                    Información Básica
                  </TabsTrigger>
                  <TabsTrigger value="professional">
                    Formación Profesional
                  </TabsTrigger>
                  <TabsTrigger value="appointments">
                    Configuración de Citas
                  </TabsTrigger>
                </TabsList>
                
                {/* Basic Information Tab */}
                <TabsContent value="basic">
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Información Personal</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre completo
                        </label>
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          disabled={!editMode}
                          placeholder="Dr. Juan Pérez"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título
                        </label>
                        <Input
                          value={profileData.title}
                          onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                          disabled={!editMode}
                          placeholder="Médico Cirujano"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Especialidad principal
                        </label>
                        <Input
                          value={profileData.specialty}
                          onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                          disabled={!editMode}
                          placeholder="Cardiología"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cédula profesional
                        </label>
                        <Input
                          value={profileData.licenseNumber}
                          onChange={(e) => setProfileData({ ...profileData, licenseNumber: e.target.value })}
                          disabled={!editMode}
                          placeholder="123456789"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Biografía profesional
                        </label>
                        <Textarea
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          disabled={!editMode}
                          placeholder="Breve descripción de tu experiencia profesional y enfoque médico..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Información de Contacto</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Correo electrónico
                        </label>
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          disabled={!editMode}
                          placeholder="tu@email.com"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          disabled={!editMode}
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dirección del consultorio
                        </label>
                        <Input
                          value={profileData.address}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          disabled={!editMode}
                          placeholder="Av. Ejemplo 123, Colonia, Ciudad"
                        />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Especialidades</h2>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profileData.specialties.map((specialty) => (
                        <div 
                          key={specialty}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                        >
                          <span>{specialty}</span>
                          
                          {editMode && (
                            <button
                              className="ml-2 text-blue-800 hover:text-blue-900"
                              onClick={() => removeSpecialty(specialty)}
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {editMode && (
                      <div className="flex">
                        <Input
                          placeholder="Agregar especialidad"
                          value={specialtyInput}
                          onChange={(e) => setSpecialtyInput(e.target.value)}
                          className="rounded-r-none"
                        />
                        <Button
                          className="rounded-l-none"
                          onClick={() => {
                            if (specialtyInput) {
                              addSpecialty(specialtyInput);
                              setSpecialtyInput('');
                            }
                          }}
                        >
                          Agregar
                        </Button>
                      </div>
                    )}
                  </Card>
                </TabsContent>
                
                {/* Professional Information Tab */}
                <TabsContent value="professional">
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Formación Académica</h2>
                    
                    <div className="space-y-4 mb-6">
                      {profileData.education.map((item) => (
                        <div 
                          key={item.id}
                          className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">{item.degree}</h3>
                            <p className="text-gray-600">{item.institution}</p>
                            <p className="text-gray-500 text-sm">{item.year}</p>
                          </div>
                          
                          {editMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 mt-2 sm:mt-0"
                              icon={<Trash size={16} />}
                              onClick={() => removeEducation(item.id)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {editMode && (
                      <>
                        <h3 className="font-medium text-gray-900 mb-3">Agregar formación académica</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Grado / Título
                            </label>
                            <Input
                              value={newEducation.degree}
                              onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                              placeholder="Ej: Licenciatura en Medicina"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Institución
                            </label>
                            <Input
                              value={newEducation.institution}
                              onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                              placeholder="Ej: Universidad Nacional Autónoma de México"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Año de graduación
                            </label>
                            <Input
                              value={newEducation.year}
                              onChange={(e) => setNewEducation({ ...newEducation, year: e.target.value })}
                              placeholder="Ej: 2010"
                            />
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          icon={<Plus size={16} />}
                          onClick={addEducation}
                          disabled={!newEducation.degree || !newEducation.institution || !newEducation.year}
                        >
                          Agregar educación
                        </Button>
                      </>
                    )}
                  </Card>
                  
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Experiencia Profesional</h2>
                    
                    <div className="space-y-4 mb-6">
                      {profileData.experience.map((item) => (
                        <div 
                          key={item.id}
                          className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">{item.position}</h3>
                            <p className="text-gray-600">{item.institution}</p>
                            <p className="text-gray-500 text-sm">
                              {item.startYear} - {item.current ? 'Presente' : item.endYear}
                            </p>
                          </div>
                          
                          {editMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 mt-2 sm:mt-0"
                              icon={<Trash size={16} />}
                              onClick={() => removeExperience(item.id)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {editMode && (
                      <>
                        <h3 className="font-medium text-gray-900 mb-3">Agregar experiencia profesional</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cargo / Posición
                            </label>
                            <Input
                              value={newExperience.position}
                              onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                              placeholder="Ej: Médico Familiar"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Institución / Empresa
                            </label>
                            <Input
                              value={newExperience.institution}
                              onChange={(e) => setNewExperience({ ...newExperience, institution: e.target.value })}
                              placeholder="Ej: Hospital General"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Año de inicio
                            </label>
                            <Input
                              value={newExperience.startYear}
                              onChange={(e) => setNewExperience({ ...newExperience, startYear: e.target.value })}
                              placeholder="Ej: 2015"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Año de finalización
                            </label>
                            <Input
                              value={newExperience.endYear}
                              onChange={(e) => setNewExperience({ ...newExperience, endYear: e.target.value })}
                              placeholder="Ej: 2020"
                              disabled={newExperience.current}
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newExperience.current}
                                onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })}
                                className="mr-2"
                              />
                              <span>Trabajo actual</span>
                            </label>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          icon={<Plus size={16} />}
                          onClick={addExperience}
                          disabled={
                            !newExperience.position || 
                            !newExperience.institution || 
                            !newExperience.startYear || 
                            (!newExperience.endYear && !newExperience.current)
                          }
                        >
                          Agregar experiencia
                        </Button>
                      </>
                    )}
                  </Card>
                  
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Certificaciones</h2>
                    
                    <div className="space-y-4 mb-6">
                      {profileData.certifications.map((item) => (
                        <div 
                          key={item.id}
                          className="p-4 border border-gray-200 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            <p className="text-gray-600">{item.issuer}</p>
                            <p className="text-gray-500 text-sm">{item.year}</p>
                          </div>
                          
                          {editMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 mt-2 sm:mt-0"
                              icon={<Trash size={16} />}
                              onClick={() => removeCertification(item.id)}
                            >
                              Eliminar
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {editMode && (
                      <>
                        <h3 className="font-medium text-gray-900 mb-3">Agregar certificación</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre de la certificación
                            </label>
                            <Input
                              value={newCertification.name}
                              onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                              placeholder="Ej: Certificación del Consejo de Cardiología"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Entidad emisora
                            </label>
                            <Input
                              value={newCertification.issuer}
                              onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                              placeholder="Ej: Consejo Mexicano de Cardiología"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Año de obtención
                            </label>
                            <Input
                              value={newCertification.year}
                              onChange={(e) => setNewCertification({ ...newCertification, year: e.target.value })}
                              placeholder="Ej: 2018"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Documento (opcional)
                            </label>
                            <div className="flex">
                              <Input
                                type="file"
                                className="rounded-r-none"
                                disabled
                              />
                              <Button
                                className="rounded-l-none"
                                icon={<Upload size={16} />}
                                disabled
                              >
                                Subir
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          icon={<Plus size={16} />}
                          onClick={addCertification}
                          disabled={!newCertification.name || !newCertification.issuer || !newCertification.year}
                        >
                          Agregar certificación
                        </Button>
                      </>
                    )}
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Idiomas</h2>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {profileData.languages.map((language) => (
                        <div 
                          key={language}
                          className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center"
                        >
                          <span>{language}</span>
                          
                          {editMode && (
                            <button
                              className="ml-2 text-purple-800 hover:text-purple-900"
                              onClick={() => removeLanguage(language)}
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {editMode && (
                      <div className="flex">
                        <select
                          value={languageInput}
                          onChange={(e) => setLanguageInput(e.target.value)}
                          className="flex-grow rounded-r-none border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Seleccionar idioma</option>
                          <option value="Español">Español</option>
                          <option value="Inglés">Inglés</option>
                          <option value="Francés">Francés</option>
                          <option value="Alemán">Alemán</option>
                          <option value="Italiano">Italiano</option>
                          <option value="Portugués">Portugués</option>
                          <option value="Chino">Chino</option>
                          <option value="Japonés">Japonés</option>
                          <option value="Coreano">Coreano</option>
                        </select>
                        <Button
                          className="rounded-l-none"
                          onClick={() => {
                            if (languageInput) {
                              addLanguage(languageInput);
                              setLanguageInput('');
                            }
                          }}
                        >
                          Agregar
                        </Button>
                      </div>
                    )}
                  </Card>
                </TabsContent>
                
                {/* Appointments Settings Tab */}
                <TabsContent value="appointments">
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Configuración de Citas</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio de consulta (MXN)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <DollarSign size={16} className="text-gray-400" />
                          </span>
                          <Input
                            type="number"
                            className="pl-10"
                            value={profileData.appointmentSettings.price}
                            onChange={(e) => updateAppointmentSetting('price', parseInt(e.target.value))}
                            disabled={!editMode}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Duración de consulta (minutos)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Clock size={16} className="text-gray-400" />
                          </span>
                          <Input
                            type="number"
                            className="pl-10"
                            value={profileData.appointmentSettings.duration}
                            onChange={(e) => updateAppointmentSetting('duration', parseInt(e.target.value))}
                            disabled={!editMode}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Comisión por servicio (MXN)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <DollarSign size={16} className="text-gray-400" />
                          </span>
                          <Input
                            type="number"
                            className="pl-10"
                            value={profileData.appointmentSettings.serviceFee}
                            onChange={(e) => updateAppointmentSetting('serviceFee', parseInt(e.target.value))}
                            disabled={!editMode}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Esta cantidad se cobrará por cada cita gestionada a través de la plataforma.
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-900 mb-3">Tipos de consulta</h3>
                        
                        <div className="space-y-3">
                          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <Video size={20} className="text-blue-500 mr-2" />
                              <div>
                                <p className="font-medium">Telemedicina</p>
                                <p className="text-sm text-gray-500">Consultas por videollamada</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={profileData.appointmentSettings.allowTelemedicine}
                              onChange={(e) => updateAppointmentSetting('allowTelemedicine', e.target.checked)}
                              disabled={!editMode}
                              className="h-5 w-5 text-blue-600 rounded"
                            />
                          </label>
                          
                          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <Briefcase size={20} className="text-green-500 mr-2" />
                              <div>
                                <p className="font-medium">Presencial</p>
                                <p className="text-sm text-gray-500">Consultas en consultorio</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={profileData.appointmentSettings.allowInPerson}
                              onChange={(e) => updateAppointmentSetting('allowInPerson', e.target.checked)}
                              disabled={!editMode}
                              className="h-5 w-5 text-blue-600 rounded"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Horario de Consultas</h2>
                    
                    <div className="space-y-6">
                      {weekdays.map(({ key, label }) => (
                        <div key={key} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-gray-900">{label}</h3>
                            
                            {editMode && (
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={profileData.schedule[key].enabled}
                                  onChange={() => toggleDayEnabled(key)}
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                  {profileData.schedule[key].enabled ? 'Habilitado' : 'Deshabilitado'}
                                </span>
                              </label>
                            )}
                          </div>
                          
                          {profileData.schedule[key].enabled && (
                            <div className="space-y-3">
                              {profileData.schedule[key].slots.map((slot, index) => (
                                <div key={index} className="flex flex-wrap items-center gap-2">
                                  <div className="flex flex-1 items-center">
                                    <Clock size={16} className="text-gray-400 mr-2" />
                                    <span className="mr-2">De</span>
                                    <Input
                                      type="time"
                                      value={slot.start}
                                      onChange={(e) => updateScheduleSlot(key, index, 'start', e.target.value)}
                                      disabled={!editMode}
                                      className="w-28"
                                    />
                                    <span className="mx-2">a</span>
                                    <Input
                                      type="time"
                                      value={slot.end}
                                      onChange={(e) => updateScheduleSlot(key, index, 'end', e.target.value)}
                                      disabled={!editMode}
                                      className="w-28"
                                    />
                                  </div>
                                  
                                  {editMode && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                      icon={<Trash size={16} />}
                                      onClick={() => removeScheduleSlot(key, index)}
                                    />
                                  )}
                                </div>
                              ))}
                              
                              {editMode && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  icon={<Plus size={16} />}
                                  onClick={() => addScheduleSlot(key)}
                                >
                                  Agregar horario
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default EnhancedDoctorProfilePage;