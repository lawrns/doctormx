import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Calendar, AlertCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Checkbox from '../../components/ui/Checkbox';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  birthDate: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birthDate: '',
    acceptTerms: false,
    acceptPrivacy: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Por favor completa todos los campos requeridos');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      setError('Debes aceptar los términos y condiciones y la política de privacidad');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await register(formData.email, formData.password, {
        fullName: formData.fullName,
        phone: formData.phone,
        birthDate: formData.birthDate
      });
      
      showToast('¡Cuenta creada exitosamente! Revisa tu correo para verificar tu cuenta.', 'success');
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta. Por favor intenta de nuevo.');
      showToast('Error al crear la cuenta', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsLoading(true);

    try {
      await loginWithGoogle();
      // Google login will handle the redirect
    } catch (err: any) {
      setError(err.message || 'Error al registrarse con Google');
      showToast('Error al conectar con Google', 'error');
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-yellow-500';
    if (passwordStrength === 3) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Débil';
    if (passwordStrength === 2) return 'Regular';
    if (passwordStrength === 3) return 'Buena';
    return 'Excelente';
  };

  return (
    <>
      <SEO 
        title="Crear Cuenta - DoctorMX"
        description="Únete a DoctorMX y accede a consultas médicas virtuales, análisis de síntomas con IA y gestión completa de tu salud."
        keywords={['registro médico', 'crear cuenta salud', 'doctormx registro', 'consulta médica online']}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-brand-jade-50 to-blue-50 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/Doctorlogo.png" 
                alt="DoctorMX" 
                className="h-14 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Crea tu cuenta</h1>
            <p className="text-gray-600 mt-2">
              Comienza a cuidar tu salud con IA
            </p>
          </div>

          <Card className="p-6 shadow-xl">
            {/* Benefits */}
            <div className="mb-6 p-4 bg-brand-jade-50 rounded-lg">
              <p className="text-sm font-medium text-brand-jade-800 mb-2">Al crear tu cuenta obtienes:</p>
              <ul className="space-y-1">
                <li className="flex items-center text-sm text-brand-jade-700">
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  Consultas médicas 24/7 con IA
                </li>
                <li className="flex items-center text-sm text-brand-jade-700">
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  Historial médico seguro
                </li>
                <li className="flex items-center text-sm text-brand-jade-700">
                  <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                  Recordatorios de medicamentos
                </li>
              </ul>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Google Signup */}
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Registrarse con Google
            </button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O regístrate con email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Juan Pérez García"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="pl-10 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (opcional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-10 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de nacimiento (opcional)
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="pl-10 text-sm"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Seguridad:</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength <= 1 ? 'text-red-600' :
                        passwordStrength === 2 ? 'text-yellow-600' :
                        passwordStrength === 3 ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Terms and Privacy */}
              <div className="space-y-3">
                <div className="flex items-start">
                  <Checkbox
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-600">
                    Acepto los{' '}
                    <Link to="/terms" className="text-brand-jade-600 hover:underline">
                      términos y condiciones
                    </Link>
                  </label>
                </div>

                <div className="flex items-start">
                  <Checkbox
                    id="acceptPrivacy"
                    name="acceptPrivacy"
                    checked={formData.acceptPrivacy}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <label htmlFor="acceptPrivacy" className="ml-2 text-sm text-gray-600">
                    Acepto la{' '}
                    <Link to="/privacy" className="text-brand-jade-600 hover:underline">
                      política de privacidad
                    </Link>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !formData.acceptTerms || !formData.acceptPrivacy}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creando cuenta...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="font-medium text-brand-jade-600 hover:text-brand-jade-700"
              >
                Inicia sesión
              </Link>
            </p>
          </Card>

          {/* Security and Compliance Notes */}
          <div className="text-center text-xs text-gray-500 mt-4 space-y-1">
            <p>🔒 Tus datos están protegidos según NOM-004-SSA3-2012</p>
            <p>✅ Cumplimos con COFEPRIS y regulaciones mexicanas</p>
          </div>
        </div>
      </div>
    </>
  );
}