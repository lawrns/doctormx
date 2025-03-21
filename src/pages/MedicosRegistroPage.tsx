import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Check, AlertCircle, ChevronRight, Calendar, Users, Star, Shield, CreditCard } from 'lucide-react';
import ProgressSteps from '../components/ProgressSteps';
import ConnectBanner from '../components/connect/ConnectBanner';
import { useAuth } from '../contexts/AuthContext';
import { useSupabase } from '../contexts/SupabaseContext';
import { v4 as uuidv4 } from 'uuid';

// Define registration steps
const registrationSteps = [
  { id: 1, label: 'Información personal' },
  { id: 2, label: 'Información profesional' },
  { id: 3, label: 'Consultorio' },
  { id: 4, label: 'Plan' }
];

// Plan options
const plans = [
  {
    id: 'basic',
    name: 'Básico',
    price: 'Gratis',
    features: [
      'Perfil básico en Doctor.mx',
      'Hasta 10 citas mensuales',
      'Telemedicina básica (5 consultas/mes)',
      'Participación en Q&A',
      'Soporte por correo electrónico'
    ],
    recommended: false,
    badge: 'Sin cuotas mensuales'
  },
  {
    id: 'pro',
    name: 'Profesional',
    price: '$999/mes',
    features: [
      'Perfil destacado en búsquedas',
      'Citas ilimitadas',
      'Telemedicina ilimitada',
      'Recordatorios automáticos',
      'Herramientas de marketing básicas',
      'Soporte prioritario'
    ],
    recommended: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$1,999/mes',
    features: [
      'Todo lo de Profesional',
      'Posicionamiento premium',
      'Estadísticas avanzadas',
      'Integración con tu agenda',
      'Soporte dedicado 24/7',
      'Herramientas de marketing avanzadas'
    ],
    recommended: false
  }
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

function MedicosRegistroPage() {
  const [searchParams] = useSearchParams();
  const connectParam = searchParams.get('connect');
  const refParam = searchParams.get('ref');
  const [redirectToConnect, setRedirectToConnect] = useState(false);
  const { signUp } = useAuth();
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  
  useEffect(() => {
    // If this page was opened with connect=true param, redirect to the Connect registration page
    if (connectParam === 'true') {
      const redirectUrl = `/connect/registro${refParam ? `?ref=${refParam}` : ''}`;
      window.location.href = redirectUrl;
    }
  }, [connectParam, refParam]);
  const [step, setStep] = useState(1);
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
    
    // Plan selection
    selectedPlan: 'basic'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationComplete, setRegistrationComplete] = useState(false);
  
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
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await signUp(formData.email, formData.password);
      
      if (authError) {
        throw new Error(authError.message || 'Error al crear usuario');
      }
      
      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }
      
      // 2. Create doctor record
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .insert({
          name: formData.name,
          email: formData.email,
          specialty: formData.specialty,
          user_id: authData.user.id,
          is_premium: formData.selectedPlan !== 'basic',
          premium_until: formData.selectedPlan !== 'basic' ? 
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null, // 30 days from now
          bio: '',
          verification_status: 'pending',
          joined_via_referral: !!refParam,
          address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`,
          telemedicine_available: formData.offersTelemedicine,
          in_person_available: true,
          is_accepting_patients: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Add feature flags for better UI control
          feature_flags: {
            doctoraliaSync: {
              enabled: formData.selectedPlan !== 'basic'
            },
            customDomain: {
              enabled: formData.selectedPlan !== 'basic'
            }
          },
          // Set doctor's role explicitly
          role: 'doctor',
          subscription_plan: formData.selectedPlan
        })
        .select('id')
        .single();
      
      if (doctorError) {
        throw new Error(doctorError.message || 'Error al crear perfil de doctor');
      }
      
      // 3. Set user metadata to indicate doctor role
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          role: 'doctor',
          doctor_id: doctorData?.id
        }
      });
      
      if (metadataError) {
        console.error('Error setting user metadata:', metadataError);
        // Continue anyway - the doctor record has been created
      }
      
      // Success - registration complete
      setRegistrationComplete(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error during registration:', error);
      setErrors({
        submit: error.message || 'Ha ocurrido un error durante el registro. Por favor intenta de nuevo.'
      });
    }
  };
  
  const handleSelectPlan = (planId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPlan: planId
    }));
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Registro exitoso!</h1>
            <p className="text-gray-600 mb-6">
              Tu cuenta ha sido creada correctamente. Hemos enviado un correo de confirmación a {formData.email}.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximos pasos:</h2>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-blue-600 font-medium">1</span>
                  </div>
                  <p className="text-gray-700">
                    Completa tu perfil profesional con información detallada sobre tu práctica médica.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-blue-600 font-medium">2</span>
                  </div>
                  <p className="text-gray-700">
                    Configura tu disponibilidad y horarios de atención para comenzar a recibir citas.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                    <span className="text-blue-600 font-medium">3</span>
                  </div>
                  <p className="text-gray-700">
                    Personaliza tus preferencias de notificación y comunicación con pacientes.
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registro para profesionales de la salud</h1>
          <p className="mt-2 text-gray-600 mb-4">
            Únete a la red de especialistas de Doctor.mx y conecta con nuevos pacientes
          </p>
          
          {refParam && <ConnectBanner referralId={refParam} />}
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg inline-block text-left max-w-3xl">
            <p className="text-blue-700">
              <span className="font-medium">A diferencia de otras plataformas, en Doctor.mx puedes registrarte y comenzar sin cuotas mensuales obligatorias.</span> Nuestro plan Básico gratuito te permite conectar con pacientes sin barreras de entrada.
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {/* Progress steps */}
          <div className="p-4 border-b border-gray-200">
            <ProgressSteps steps={registrationSteps} currentStep={step} />
          </div>
          
          <div className="p-6">
            {/* Error message */}
            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <span>{errors.submit}</span>
              </div>
            )}
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
                  
                  <div className="md:col-span-2">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 rounded mt-1"
                        required
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Acepto los <Link to="/terminos" className="text-blue-600 hover:text-blue-800">términos y condiciones</Link> y la <Link to="/privacidad" className="text-blue-600 hover:text-blue-800">política de privacidad</Link>
                      </span>
                    </label>
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
                        Para garantizar la calidad de nuestra plataforma, verificamos las credenciales profesionales de todos los médicos. Este proceso puede tomar hasta 48 horas.
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
            
            {/* Step 4: Plan Selection */}
            {step === 4 && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Selecciona tu plan</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {plans.map((plan) => (
                    <div 
                      key={plan.id}
                      className={`border rounded-lg overflow-hidden transition-all ${
                        formData.selectedPlan === plan.id 
                          ? 'border-blue-600 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${plan.recommended ? 'relative' : ''}`}
                    >
                      {plan.recommended && (
                        <div className="absolute top-0 inset-x-0 bg-blue-600 text-white text-xs font-medium text-center py-1">
                          Recomendado
                        </div>
                      )}
                      
                      <div className={`p-6 ${plan.recommended ? 'pt-8' : ''}`}>
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                          {plan.badge && (
                            <div className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                              {plan.badge}
                            </div>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mb-4">{plan.price}</p>
                        
                        <ul className="space-y-2 mb-6">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <Check size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <button
                          type="button"
                          onClick={() => handleSelectPlan(plan.id)}
                          className={`w-full py-2 px-4 rounded-lg font-medium ${
                            formData.selectedPlan === plan.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                          }`}
                        >
                          {formData.selectedPlan === plan.id ? 'Seleccionado' : 'Seleccionar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Todos los planes incluyen:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                        <Users size={14} className="text-blue-600" />
                      </div>
                      <p className="text-gray-700 text-sm">
                        Perfil profesional visible para millones de pacientes potenciales
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                        <Calendar size={14} className="text-blue-600" />
                      </div>
                      <p className="text-gray-700 text-sm">
                        Sistema de gestión de citas y recordatorios automáticos
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                        <Star size={14} className="text-blue-600" />
                      </div>
                      <p className="text-gray-700 text-sm">
                        Reseñas y calificaciones de pacientes para mejorar tu reputación
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-3">
                        <CreditCard size={14} className="text-blue-600" />
                      </div>
                      <p className="text-gray-700 text-sm">
                        Procesamiento de pagos seguro y facturación automatizada
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className={`btn-outline ${step === 1 ? 'invisible' : ''}`}
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="btn-primary"
            >
              {step === 4 ? 'Completar registro' : 'Continuar'}
            </button>
          </div>
        </div>
        
        {/* Help section */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">¿Necesitas ayuda?</h2>
          <p className="text-gray-600 mb-4">
            Si tienes dudas sobre el proceso de registro o los planes disponibles, contáctanos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link to="/contacto" className="btn-outline">
              Contactar soporte
            </Link>
            <Link to="/medicos/planes" className="text-blue-600 hover:text-blue-800 font-medium">
              Ver detalles de planes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicosRegistroPage;