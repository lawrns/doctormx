import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, AlertCircle, ChevronRight, Calendar, Users, Star, Shield, CreditCard, Zap, Bug } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressSteps from '../../components/ProgressSteps';
import { useSupabase } from '../../contexts/SupabaseContext';
import DirectRegistrationHelper from './DirectRegistrationHelper';

// Define registration steps
const registrationSteps = [
  { id: 1, label: 'Información personal' },
  { id: 2, label: 'Información profesional' },
  { id: 3, label: 'Consultorio' },
  { id: 4, label: 'Confirmación' }
];

// Specialty options
const specialties = [
  { value: 'medicina-general', label: 'Medicina General' },
  { value: 'pediatria', label: 'Pediatría' },
  { value: 'ginecologia', label: 'Ginecología' },
  { value: 'dermatologia', label: 'Dermatología' },
  { value: 'psicologia', label: 'Psicología' },
  { value: 'cardiologia', label: 'Cardiología' },
  { value: 'oftalmologia', label: 'Oftalmología' },
  { value: 'neurologia', label: 'Neurología' },
  { value: 'odontologia', label: 'Odontología' },
  { value: 'nutricion', label: 'Nutrición' },
  { value: 'terapia-lenguaje', label: 'Terapia de Lenguaje' },
  { value: 'medicina-alternativa', label: 'Medicina Alternativa' }
];

function MedicosRegistroConnectPage() {
  const [searchParams] = useSearchParams();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const referralId = searchParams.get('ref');
  const [step, setStep] = useState(1);
  const [referrerInfo, setReferrerInfo] = useState<{ name?: string; specialty?: string; } | null>(null);
  const [formData, setFormData] = useState({
    // Personal info
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Professional info
    specialty: '',
    licenseNumber: '',
    university: '',
    graduationYear: '',
    experience: '',
    
    // Practice info
    practiceName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    offersTelemedicine: false,
    
    // Connect program
    referralId: referralId || '',
    acceptedTerms: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get referrer info if referral ID is provided
  useEffect(() => {
    if (referralId) {
      const getReferrer = async () => {
        try {
          const { data, error } = await supabase
            .from('referral_links')
            .select('doctors(name, specialty)')
            .eq('id', referralId)
            .single();

          if (error) throw error;
          
          if (data?.doctors) {
            setReferrerInfo({
              name: data.doctors.name,
              specialty: data.doctors.specialty
            });
          }
        } catch (error) {
          console.error('Error fetching referrer info:', error);
        }
      };

      getReferrer();
    }
  }, [referralId, supabase]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name) newErrors.name = 'El nombre es requerido';
      if (!formData.email) newErrors.email = 'El correo electrónico es requerido';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Correo electrónico inválido';
      
      if (!formData.phone) newErrors.phone = 'El teléfono es requerido';
      else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Teléfono inválido (10 dígitos)';
      
      if (!formData.password) newErrors.password = 'La contraseña es requerida';
      else if (formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (step === 2) {
      if (!formData.specialty) newErrors.specialty = 'La especialidad es requerida';
      if (!formData.licenseNumber) newErrors.licenseNumber = 'La cédula profesional es requerida';
      if (!formData.university) newErrors.university = 'La universidad es requerida';
      if (!formData.graduationYear) newErrors.graduationYear = 'El año de graduación es requerido';
      else if (!/^\d{4}$/.test(formData.graduationYear)) newErrors.graduationYear = 'Año inválido';
      
      if (!formData.experience) newErrors.experience = 'Los años de experiencia son requeridos';
      else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
        newErrors.experience = 'Valor inválido';
      }
    }
    
    if (step === 3) {
      if (!formData.practiceName) newErrors.practiceName = 'El nombre del consultorio es requerido';
      if (!formData.address) newErrors.address = 'La dirección es requerida';
      if (!formData.city) newErrors.city = 'La ciudad es requerida';
      if (!formData.state) newErrors.state = 'El estado es requerido';
      if (!formData.zipCode) newErrors.zipCode = 'El código postal es requerido';
      else if (!/^\d{5}$/.test(formData.zipCode)) newErrors.zipCode = 'Código postal inválido';
    }
    
    if (step === 4) {
      if (!formData.acceptedTerms) newErrors.acceptedTerms = 'Debes aceptar los términos y condiciones';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleContinue = () => {
    if (validateStep()) {
      if (step < 4) {
        setStep(step + 1);
        window.scrollTo(0, 0);
      } else {
        // Submit form
        handleSubmit();
      }
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: formData.phone,
            is_doctor: true
          }
        }
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        setErrors(prev => ({
          ...prev,
          submit: `Error de autenticación: ${authError.message}`
        }));
        throw authError;
      }
      
      console.log('User created successfully:', authData.user?.id);
      
      // 2. Create doctor profile
      if (authData.user) {
        // First try with only the required fields
        const minimalDoctorData = {
          user_id: authData.user.id,
          name: formData.name,
          specialty: formData.specialty
        };
        
        console.log('Trying with minimal doctor data first:', minimalDoctorData);
        
        try {
          const { error: minimalProfileError } = await supabase
            .from('doctors')
            .insert(minimalDoctorData);
            
          if (minimalProfileError) {
            console.error('Minimal profile creation error:', minimalProfileError);
            // If minimal profile fails, we'll show the error but continue with the full profile attempt
            console.log('Falling back to complete profile data');
          } else {
            console.log('Minimal doctor profile created successfully!');
            // If minimal profile succeeds, we update with all the additional data
            const { error: updateError } = await supabase
              .from('doctors')
              .update({
                email: formData.email,
                license_number: formData.licenseNumber,
                university: formData.university,
                graduation_year: formData.graduationYear,
                years_experience: parseInt(formData.experience),
                practice_name: formData.practiceName,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zipCode,
                offers_telemedicine: formData.offersTelemedicine,
                verification_status: 'pending',
                joined_via_referral: !!formData.referralId,
                referral_id: formData.referralId || null,
                is_premium: true,
                premium_until: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString()
              })
              .eq('user_id', authData.user.id);
              
            if (updateError) {
              console.error('Profile update error:', updateError);
              // Even if update fails, continue as the minimal profile is created
            } else {
              console.log('Full doctor profile updated successfully');
            }
            
            // If we got this far with minimal profile, we're good to go
            setRegistrationComplete(true);
            window.scrollTo(0, 0);
            
            // 3. If there was a referral, update referral stats
            if (formData.referralId) {
              await supabase
                .from('referral_links')
                .update({ 
                  usage_count: supabase.rpc('increment', { row_id: formData.referralId, increment_amount: 1 }),
                  last_used_at: new Date().toISOString()
                })
                .eq('id', formData.referralId);
            }
            
            return; // Exit early, we're done
          }
        } catch (minimalError: any) {
          console.error('Error with minimal profile approach:', minimalError);
          // Continue with full profile attempt
        }
        
        // If we get here, minimal approach failed - try the full profile insertion
        const fullDoctorData = {
          user_id: authData.user.id,
          name: formData.name,
          email: formData.email,
          specialty: formData.specialty,
          license_number: formData.licenseNumber,
          university: formData.university,
          graduation_year: formData.graduationYear,
          years_experience: parseInt(formData.experience),
          practice_name: formData.practiceName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          offers_telemedicine: formData.offersTelemedicine,
          verification_status: 'pending',
          joined_via_referral: !!formData.referralId,
          referral_id: formData.referralId || null,
          is_premium: true,
          premium_until: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        };
        
        console.log('Trying full doctor profile data:', fullDoctorData);
        
        const { error: profileError } = await supabase
          .from('doctors')
          .insert(fullDoctorData);
          
        if (profileError) {
          console.error('Full profile creation error:', profileError);
          setErrors(prev => ({
            ...prev,
            submit: `Error al crear perfil médico: ${profileError.message} (Código: ${profileError.code})`
          }));
          throw profileError;
        }
        
        console.log('Doctor profile created successfully');
        
        // 3. If there was a referral, update referral stats
        if (formData.referralId) {
          await supabase
            .from('referral_links')
            .update({ 
              usage_count: supabase.rpc('increment', { row_id: formData.referralId, increment_amount: 1 }),
              last_used_at: new Date().toISOString()
            })
            .eq('id', formData.referralId);
        }
      }
      
      setRegistrationComplete(true);
      window.scrollTo(0, 0);
    } catch (error: any) {
      console.error('Registration error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message ? `Error: ${error.message}` : 'Ocurrió un error al registrarte. Por favor, intenta de nuevo más tarde.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={32} className="text-green-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenido al programa Connect!</h1>
            <p className="text-gray-600 mb-6">
              Tu cuenta ha sido creada correctamente con 6 meses de acceso Premium. Hemos enviado un correo de confirmación a {formData.email}.
            </p>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Tu membresía Premium incluye:</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check size={18} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-blue-800">
                    Perfil verificado con badge Premium
                  </p>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-blue-800">
                    Sistema de citas avanzado con recordatorios automáticos
                  </p>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-blue-800">
                    Comunicación directa con pacientes a través de la plataforma
                  </p>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-blue-800">
                    Análisis de rendimiento y estadísticas detalladas
                  </p>
                </li>
                <li className="flex items-start">
                  <Check size={18} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-blue-800">
                    Posicionamiento preferente en resultados de búsqueda
                  </p>
                </li>
              </ul>
              <p className="mt-4 text-sm text-blue-700">
                Tu membresía Premium estará activa por 6 meses hasta {new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos pasos:</h2>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-blue-600 font-medium">1</span>
                  </div>
                  <p className="text-gray-700">
                    Verifica tu correo electrónico para activar tu cuenta.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-blue-600 font-medium">2</span>
                  </div>
                  <p className="text-gray-700">
                    Completa tu perfil profesional con información detallada y fotos.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-blue-600 font-medium">3</span>
                  </div>
                  <p className="text-gray-700">
                    Configura tu disponibilidad y horarios de atención.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-blue-600 font-medium">4</span>
                  </div>
                  <p className="text-gray-700">
                    Invita a tus colegas al programa Connect y obtén beneficios adicionales.
                  </p>
                </li>
              </ol>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/dashboard"
                className="btn-primary"
              >
                Ir a mi cuenta
              </Link>
              <Link 
                to="/"
                className="btn-outline"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/connect" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ChevronRight size={16} className="rotate-180 mr-1" />
            Volver a Doctor.mx Connect
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Activa tu acceso Premium por 6 meses</h1>
          <p className="text-xl text-gray-600 mb-4">
            {referrerInfo ? (
              <>Has sido invitado por <span className="font-semibold">{referrerInfo.name}</span> para unirte al programa Doctor.mx Connect.</>
            ) : (
              <>Estás a pocos pasos de unirte a la comunidad médica líder en México.</>
            )}
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg text-left max-w-3xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-blue-700">
                  <span className="font-medium">Programa exclusivo por invitación:</span> Acceso completo a todas las funciones Premium durante 6 meses, sin tarjeta de crédito ni compromiso de permanencia.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {/* Progress steps */}
          <div className="p-4 border-b border-gray-200">
            <ProgressSteps steps={registrationSteps} currentStep={step} />
          </div>
          
          <div className="p-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Información personal</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.name}
                      onChange={handleChange}
                      aria-describedby="name-error"
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                      aria-describedby="email-error"
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className={`input-field ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10 dígitos"
                      aria-describedby="phone-error"
                    />
                    {errors.phone && (
                      <p id="phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contraseña</h3>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`input-field ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                      aria-describedby="password-error"
                    />
                    {errors.password ? (
                      <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">Mínimo 8 caracteres</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar contraseña <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      aria-describedby="confirmPassword-error"
                    />
                    {errors.confirmPassword && (
                      <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Professional Information */}
            {step === 2 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Información profesional</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                      Especialidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="specialty"
                      name="specialty"
                      className={`input-field ${errors.specialty ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.specialty}
                      onChange={handleChange}
                      aria-describedby="specialty-error"
                    >
                      <option value="">Selecciona una especialidad</option>
                      {specialties.map(specialty => (
                        <option key={specialty.value} value={specialty.value}>
                          {specialty.label}
                        </option>
                      ))}
                    </select>
                    {errors.specialty && (
                      <p id="specialty-error" className="mt-1 text-sm text-red-600">{errors.specialty}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Cédula profesional <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      className={`input-field ${errors.licenseNumber ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      aria-describedby="licenseNumber-error"
                    />
                    {errors.licenseNumber && (
                      <p id="licenseNumber-error" className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                      Universidad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      className={`input-field ${errors.university ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.university}
                      onChange={handleChange}
                      aria-describedby="university-error"
                    />
                    {errors.university && (
                      <p id="university-error" className="mt-1 text-sm text-red-600">{errors.university}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700 mb-1">
                      Año de graduación <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="graduationYear"
                      name="graduationYear"
                      className={`input-field ${errors.graduationYear ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.graduationYear}
                      onChange={handleChange}
                      placeholder="AAAA"
                      aria-describedby="graduationYear-error"
                    />
                    {errors.graduationYear && (
                      <p id="graduationYear-error" className="mt-1 text-sm text-red-600">{errors.graduationYear}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                      Años de experiencia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="experience"
                      name="experience"
                      min="0"
                      className={`input-field ${errors.experience ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.experience}
                      onChange={handleChange}
                      aria-describedby="experience-error"
                    />
                    {errors.experience && (
                      <p id="experience-error" className="mt-1 text-sm text-red-600">{errors.experience}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Verificación de credenciales</h3>
                      <p className="mt-2 text-sm text-blue-700">
                        Para mantener la calidad de nuestra plataforma, verificamos las credenciales profesionales de todos los médicos. Los miembros del programa Connect reciben verificación prioritaria.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Practice Information */}
            {step === 3 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Información del consultorio</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="practiceName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del consultorio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="practiceName"
                      name="practiceName"
                      className={`input-field ${errors.practiceName ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.practiceName}
                      onChange={handleChange}
                      aria-describedby="practiceName-error"
                    />
                    {errors.practiceName && (
                      <p id="practiceName-error" className="mt-1 text-sm text-red-600">{errors.practiceName}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className={`input-field ${errors.address ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Calle, número, colonia"
                      aria-describedby="address-error"
                    />
                    {errors.address && (
                      <p id="address-error" className="mt-1 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      className={`input-field ${errors.city ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.city}
                      onChange={handleChange}
                      aria-describedby="city-error"
                    />
                    {errors.city && (
                      <p id="city-error" className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      className={`input-field ${errors.state ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.state}
                      onChange={handleChange}
                      aria-describedby="state-error"
                    />
                    {errors.state && (
                      <p id="state-error" className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código postal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      className={`input-field ${errors.zipCode ? 'border-red-500 focus:ring-red-500' : ''}`}
                      value={formData.zipCode}
                      onChange={handleChange}
                      maxLength={5}
                      aria-describedby="zipCode-error"
                    />
                    {errors.zipCode && (
                      <p id="zipCode-error" className="mt-1 text-sm text-red-600">{errors.zipCode}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="offersTelemedicine"
                        className="h-4 w-4 text-blue-600 rounded mt-1"
                        checked={formData.offersTelemedicine}
                        onChange={handleChange}
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Ofrezco consultas por telemedicina
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: Confirmation */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Confirma tus detalles</h2>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="mr-4 p-2 bg-blue-600 text-white rounded-full">
                      <Star size={16} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900">Plan Premium - 6 meses gratis</h3>
                      <p className="text-blue-700">A través del programa Doctor.mx Connect</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 pl-10">
                    <p className="text-sm text-blue-700 mb-2">
                      <strong>Valor:</strong> $999/mes × 6 meses = $5,994 MXN
                    </p>
                    <p className="text-sm text-blue-700 font-bold">
                      <strong>Tu precio:</strong> ¡GRATIS!
                    </p>
                  </div>
                  
                  <ul className="space-y-2 pl-10">
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-700 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-blue-700 text-sm">Perfil verificado con badge Premium</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-700 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-blue-700 text-sm">Posicionamiento preferente en búsquedas</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-700 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-blue-700 text-sm">Sistema de citas avanzado con recordatorios</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-700 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-blue-700 text-sm">Herramientas de marketing y promoción</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={16} className="text-blue-700 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-blue-700 text-sm">Análisis y estadísticas avanzadas</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Información personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm text-gray-500">Nombre:</span>
                        <p className="text-gray-900">{formData.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Correo electrónico:</span>
                        <p className="text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Teléfono:</span>
                        <p className="text-gray-900">{formData.phone}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Información profesional</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm text-gray-500">Especialidad:</span>
                        <p className="text-gray-900">{specialties.find(s => s.value === formData.specialty)?.label || formData.specialty}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Cédula profesional:</span>
                        <p className="text-gray-900">{formData.licenseNumber}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Universidad:</span>
                        <p className="text-gray-900">{formData.university}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Años de experiencia:</span>
                        <p className="text-gray-900">{formData.experience}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Información del consultorio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="md:col-span-2">
                        <span className="text-sm text-gray-500">Nombre del consultorio:</span>
                        <p className="text-gray-900">{formData.practiceName}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm text-gray-500">Dirección:</span>
                        <p className="text-gray-900">{formData.address}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Ciudad:</span>
                        <p className="text-gray-900">{formData.city}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Estado:</span>
                        <p className="text-gray-900">{formData.state}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Código postal:</span>
                        <p className="text-gray-900">{formData.zipCode}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Telemedicina:</span>
                        <p className="text-gray-900">{formData.offersTelemedicine ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className={`flex items-start ${errors.acceptedTerms ? 'text-red-600' : ''}`}>
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      className={`h-4 w-4 rounded mt-1 ${errors.acceptedTerms ? 'text-red-600 border-red-600' : 'text-blue-600'}`}
                      checked={formData.acceptedTerms}
                      onChange={handleChange}
                      aria-describedby="acceptedTerms-error"
                    />
                    <span className="ml-2 text-sm">
                      Acepto los <Link to="/terminos" className="text-blue-600 hover:text-blue-800">términos y condiciones</Link> y la <Link to="/privacidad" className="text-blue-600 hover:text-blue-800">política de privacidad</Link> de Doctor.mx
                    </span>
                  </label>
                  {errors.acceptedTerms && (
                    <p id="acceptedTerms-error" className="mt-1 text-sm text-red-600 ml-6">{errors.acceptedTerms}</p>
                  )}
                </div>
                
                {errors.submit && (
                  <>
                    <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{errors.submit}</p>
                        </div>
                      </div>
                    </div>
                    
                    <DirectRegistrationHelper 
                      formData={formData} 
                      onSuccess={() => {
                        setRegistrationComplete(true);
                        window.scrollTo(0, 0);
                      }}
                      onError={(error) => console.error('Alternative registration failed:', error)}
                    />
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className={`btn-outline ${step === 1 ? 'invisible' : ''}`}
              disabled={isSubmitting}
            >
              Atrás
            </button>
            <motion.button
              type="button"
              onClick={handleContinue}
              className="btn-primary min-w-32"
              disabled={isSubmitting}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : step === 4 ? (
                'Activar cuenta Premium'
              ) : (
                'Continuar'
              )}
            </motion.button>
          </div>
        </div>
        
        {/* Help section */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h2>
          <p className="text-gray-600 mb-4">
            Si tienes dudas sobre el programa Connect o el proceso de registro, contáctanos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/contacto" className="btn-outline">
              Contactar soporte
            </Link>
            <Link to="/connect" className="text-blue-600 hover:text-blue-800 font-medium">
              Más información sobre Connect
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicosRegistroConnectPage;