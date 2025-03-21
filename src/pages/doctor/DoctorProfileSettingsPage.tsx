import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  Button,
  Input,
  Textarea
} from '../../components/ui';
import { Award, Calendar, Check, Clock, CreditCard, FileText, Globe, Image, Languages, Mail, MapPin, Phone, Plus, User, Video, X } from 'lucide-react';
import DashboardLayout from '../../components/doctor/DashboardLayout';
import DoctoraliaIntegration from '../../components/doctor/DoctoraliaIntegration';
import DomainManagement from '../../components/doctor/DomainManagement';
import SubscriptionManagement from '../../components/doctor/SubscriptionManagement';

interface ProfileInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  error?: string;
}

const ProfileInput: React.FC<ProfileInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  rows = 3,
  required = false,
  error
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    
    {multiline ? (
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`w-full ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
      />
    ) : (
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
      />
    )}
    
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
);

const DoctorProfileSettingsPage: React.FC = () => {
  const { doctorId: paramDoctorId } = useParams();
  const { doctorId: authDoctorId, isDoctor } = useAuth();
  const navigate = useNavigate();
  
  // Use the authenticated doctor ID if available, otherwise use the URL parameter
  const effectiveDoctorId = isDoctor ? authDoctorId : paramDoctorId;
  
  const [activeTab, setActiveTab] = useState('profile');
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalSuccess, setGeneralSuccess] = useState(false);
  
  // For education/credentials
  const [newEducation, setNewEducation] = useState({ degree: '', institution: '', year: '' });
  const [showAddEducation, setShowAddEducation] = useState(false);
  
  // For languages
  const [newLanguage, setNewLanguage] = useState('');
  
  // Fetch doctor on load
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        
        if (effectiveDoctorId) {
          const { data, error } = await supabase
            .from('doctors')
            .select('*')
            .eq('id', effectiveDoctorId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setDoctor({
              id: data.id,
              name: data.name || '',
              specialty: data.specialty || '',
              bio: data.bio || '',
              address: data.address || '',
              location: data.location || '',
              email: data.email || '',
              phone: '',
              website: '',
              telemedicine_available: data.telemedicine_available,
              in_person_available: data.in_person_available,
              is_accepting_patients: data.is_accepting_patients,
              languages: data.languages || [],
              education: data.education || [],
              credentials: data.credentials || [],
              consultation_fee: data.consultation_fee || '',
              feature_flags: data.feature_flags || {
                doctoraliaSync: {
                  enabled: false
                },
                customDomain: {
                  enabled: false
                }
              }
            });
          } else {
            throw new Error('No doctor found');
          }
        } else {
          throw new Error('No doctor ID provided');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [effectiveDoctorId]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctor(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear success message when field is edited
    if (generalSuccess) {
      setGeneralSuccess(false);
    }
  };
  
  // Handle toggle change
  const handleToggleChange = (field: string) => {
    setDoctor(prev => ({ ...prev, [field]: !prev[field] }));
    
    // Clear success message when field is edited
    if (generalSuccess) {
      setGeneralSuccess(false);
    }
  };
  
  // Handle education add
  const handleAddEducation = () => {
    if (!newEducation.degree || !newEducation.institution || !newEducation.year) {
      return;
    }
    
    setDoctor(prev => ({
      ...prev,
      education: [...(prev.education || []), { ...newEducation }]
    }));
    
    setNewEducation({ degree: '', institution: '', year: '' });
    setShowAddEducation(false);
    
    // Clear success message when field is edited
    if (generalSuccess) {
      setGeneralSuccess(false);
    }
  };
  
  // Handle education remove
  const handleRemoveEducation = (index: number) => {
    setDoctor(prev => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index)
    }));
    
    // Clear success message when field is edited
    if (generalSuccess) {
      setGeneralSuccess(false);
    }
  };
  
  // Handle language add
  const handleAddLanguage = () => {
    if (!newLanguage) return;
    
    setDoctor(prev => ({
      ...prev,
      languages: [...(prev.languages || []), newLanguage]
    }));
    
    setNewLanguage('');
    
    // Clear success message when field is edited
    if (generalSuccess) {
      setGeneralSuccess(false);
    }
  };
  
  // Handle language remove
  const handleRemoveLanguage = (index: number) => {
    setDoctor(prev => ({
      ...prev,
      languages: prev.languages.filter((_: any, i: number) => i !== index)
    }));
    
    // Clear success message when field is edited
    if (generalSuccess) {
      setGeneralSuccess(false);
    }
  };
  
  // Save profile changes
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      const newErrors: Record<string, string> = {};
      
      if (!doctor.name) {
        newErrors.name = 'El nombre es requerido';
      }
      
      if (!doctor.specialty) {
        newErrors.specialty = 'La especialidad es requerida';
      }
      
      if (!doctor.email) {
        newErrors.email = 'El email es requerido';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setSaving(false);
        return;
      }
      
      // Save changes to Supabase
      const { error } = await supabase
        .from('doctors')
        .update({
          name: doctor.name,
          specialty: doctor.specialty,
          bio: doctor.bio,
          address: doctor.address,
          location: doctor.location,
          email: doctor.email,
          telemedicine_available: doctor.telemedicine_available,
          in_person_available: doctor.in_person_available,
          is_accepting_patients: doctor.is_accepting_patients,
          languages: doctor.languages,
          education: doctor.education,
          credentials: doctor.credentials,
          consultation_fee: doctor.consultation_fee,
          updated_at: new Date().toISOString()
        })
        .eq('id', effectiveDoctorId);
      
      if (error) throw error;
      
      // Show success message
      setGeneralSuccess(true);
      
      // Reset errors
      setErrors({});
      
      setSaving(false);
    } catch (err) {
      console.error('Error saving doctor profile:', err);
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout title="Configuración de Perfil" loading={true}>
        <div></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Configuración de Perfil" loading={false}>
      <div className="mb-6">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="profile" 
              className="flex items-center gap-2 data-[state=active]:text-blue-700 data-[state=active]:shadow-md"
            >
              <User size={16} />
              <span>Perfil</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="domains" 
              className="flex items-center gap-2 data-[state=active]:text-blue-700 data-[state=active]:shadow-md"
            >
              <Globe size={16} />
              <span>Dominio</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="calendar" 
              className="flex items-center gap-2 data-[state=active]:text-blue-700 data-[state=active]:shadow-md"
            >
              <Calendar size={16} />
              <span>Agenda</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="subscription" 
              className="flex items-center gap-2 data-[state=active]:text-blue-700 data-[state=active]:shadow-md"
            >
              <CreditCard size={16} />
              <span>Suscripción</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="pt-6 animate-in fade-in-50 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>
                  
                  {generalSuccess && (
                    <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-md flex items-start">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                      <p>Los cambios se guardaron correctamente</p>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileInput
                        label="Nombre completo"
                        value={doctor.name}
                        onChange={handleInputChange}
                        placeholder="Dr. Juan García"
                        name="name"
                        required
                        error={errors.name}
                      />
                      
                      <ProfileInput
                        label="Especialidad"
                        value={doctor.specialty}
                        onChange={handleInputChange}
                        placeholder="Cardiología"
                        name="specialty"
                        required
                        error={errors.specialty}
                      />
                    </div>
                    
                    <ProfileInput
                      label="Biografía profesional"
                      value={doctor.bio}
                      onChange={handleInputChange}
                      placeholder="Describe tu experiencia profesional, formación y especialidades..."
                      name="bio"
                      multiline
                      rows={5}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileInput
                        label="Dirección del consultorio"
                        value={doctor.address}
                        onChange={handleInputChange}
                        placeholder="Av. Insurgentes Sur 1234, Col. Del Valle"
                        name="address"
                      />
                      
                      <ProfileInput
                        label="Ciudad"
                        value={doctor.location}
                        onChange={handleInputChange}
                        placeholder="Ciudad de México"
                        name="location"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileInput
                        label="Correo electrónico"
                        value={doctor.email}
                        onChange={handleInputChange}
                        placeholder="doctor@example.com"
                        name="email"
                        type="email"
                        required
                        error={errors.email}
                      />
                      
                      <ProfileInput
                        label="Teléfono"
                        value={doctor.phone}
                        onChange={handleInputChange}
                        placeholder="+52 55 1234 5678"
                        name="phone"
                      />
                    </div>
                    
                    <ProfileInput
                      label="Sitio web"
                      value={doctor.website}
                      onChange={handleInputChange}
                      placeholder="https://www.misitio.com"
                      name="website"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ProfileInput
                        label="Precio de consulta (MXN)"
                        value={doctor.consultation_fee}
                        onChange={handleInputChange}
                        placeholder="800"
                        name="consultation_fee"
                        type="number"
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="telemedicine_available"
                          checked={doctor.telemedicine_available}
                          onChange={() => handleToggleChange('telemedicine_available')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="telemedicine_available" className="ml-2 block text-sm text-gray-900">
                          Ofrezco consultas por telemedicina
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="in_person_available"
                          checked={doctor.in_person_available}
                          onChange={() => handleToggleChange('in_person_available')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="in_person_available" className="ml-2 block text-sm text-gray-900">
                          Ofrezco consultas presenciales
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_accepting_patients"
                          checked={doctor.is_accepting_patients}
                          onChange={() => handleToggleChange('is_accepting_patients')}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="is_accepting_patients" className="ml-2 block text-sm text-gray-900">
                          Estoy aceptando nuevos pacientes
                        </label>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Educación</h2>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<Plus size={16} />}
                      onClick={() => setShowAddEducation(true)}
                    >
                      Agregar educación
                    </Button>
                  </div>
                  
                  {showAddEducation && (
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-4">Agregar educación</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <ProfileInput
                          label="Título/Grado"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                          placeholder="Médico Cirujano"
                          name="degree"
                          required
                        />
                        
                        <ProfileInput
                          label="Institución"
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                          placeholder="Universidad Nacional Autónoma de México"
                          name="institution"
                          required
                        />
                        
                        <ProfileInput
                          label="Año"
                          value={newEducation.year}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, year: e.target.value }))}
                          placeholder="2010"
                          name="year"
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowAddEducation(false);
                            setNewEducation({ degree: '', institution: '', year: '' });
                          }}
                        >
                          Cancelar
                        </Button>
                        
                        <Button 
                          variant="primary" 
                          onClick={handleAddEducation}
                          disabled={!newEducation.degree || !newEducation.institution || !newEducation.year}
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {doctor.education && doctor.education.length > 0 ? (
                    <div className="space-y-4">
                      {doctor.education.map((edu: any, index: number) => (
                        <div key={index} className="flex justify-between items-start p-4 border border-gray-200 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                            <p className="text-gray-500">{edu.institution}, {edu.year}</p>
                          </div>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() => handleRemoveEducation(index)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No hay información de educación. Agrega tu educación para mejorar tu perfil.
                    </div>
                  )}
                </Card>
                
                <Card className="p-6 mt-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Idiomas</h2>
                  </div>
                  
                  <div className="flex mb-4">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Agregar idioma (ej. Español, Inglés)"
                      className="mr-2"
                    />
                    
                    <Button 
                      variant="outline" 
                      onClick={handleAddLanguage}
                      disabled={!newLanguage}
                    >
                      Agregar
                    </Button>
                  </div>
                  
                  {doctor.languages && doctor.languages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang: string, index: number) => (
                        <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-gray-800">{lang}</span>
                          <button 
                            className="ml-2 text-gray-400 hover:text-red-600"
                            onClick={() => handleRemoveLanguage(index)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No hay idiomas agregados. Agrega los idiomas que hablas.
                    </div>
                  )}
                </Card>
                
                <div className="flex justify-end mt-6">
                  <Button 
                    variant="primary"
                    onClick={handleSaveProfile}
                    loading={saving}
                  >
                    Guardar cambios
                  </Button>
                </div>
              </div>
              
              <div>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Vista previa</h2>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-white p-6">
                      <div className="flex items-center mb-4">
                        <img 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name || 'Doctor')}&background=0D8ABC&color=fff`}
                          alt={doctor.name}
                          className="w-16 h-16 rounded-full"
                        />
                        
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-900">{doctor.name || 'Tu nombre'}</h3>
                          <p className="text-blue-600">{doctor.specialty || 'Tu especialidad'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-500 mb-2">
                        <MapPin size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                        <span>{doctor.address ? `${doctor.address}, ${doctor.location}` : 'Tu dirección'}</span>
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-500 mb-2">
                        <Phone size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                        <span>{doctor.phone || 'Tu teléfono'}</span>
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-500 mb-2">
                        <Mail size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                        <span>{doctor.email || 'Tu email'}</span>
                      </div>
                      
                      <div className="flex items-start text-sm text-gray-500 mb-4">
                        <Globe size={16} className="mt-0.5 mr-2 flex-shrink-0" />
                        <span>{doctor.website || 'Tu sitio web'}</span>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-4 mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Acerca de</h4>
                        <p className="text-sm text-gray-600">{doctor.bio || 'Tu biografía aparecerá aquí.'}</p>
                      </div>
                      
                      {doctor.languages && doctor.languages.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Idiomas</h4>
                          <div className="flex flex-wrap gap-2">
                            {doctor.languages.map((lang: string, index: number) => (
                              <div key={index} className="bg-blue-50 text-blue-700 text-xs rounded-full px-2 py-1">
                                {lang}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-4">
                        <div>
                          {doctor.telemedicine_available && (
                            <span className="inline-flex items-center bg-blue-50 text-blue-700 text-xs rounded-full px-2 py-1 mr-2">
                              <Video size={12} className="mr-1" />
                              Telemedicina
                            </span>
                          )}
                          
                          {doctor.in_person_available && (
                            <span className="inline-flex items-center bg-green-50 text-green-700 text-xs rounded-full px-2 py-1">
                              <MapPin size={12} className="mr-1" />
                              Presencial
                            </span>
                          )}
                        </div>
                        
                        {doctor.consultation_fee && (
                          <span className="text-lg font-semibold text-gray-900">
                            ${doctor.consultation_fee}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`/doctor/${doctor.id}`, '_blank')}
                    >
                      Ver perfil público
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="domains" className="pt-6 animate-in fade-in-50 duration-300">
            <DomainManagement doctorId={doctor.id} />
          </TabsContent>
          
          <TabsContent value="calendar" className="pt-6 animate-in fade-in-50 duration-300">
            <DoctoraliaIntegration doctorId={doctor.id} />
          </TabsContent>
          
          <TabsContent value="subscription" className="pt-6 animate-in fade-in-50 duration-300">
            <SubscriptionManagement doctorId={doctor.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfileSettingsPage;