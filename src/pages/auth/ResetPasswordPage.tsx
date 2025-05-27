import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
      showToast('Correo de recuperación enviado', 'success');
    } catch (err: any) {
      setError(err.message || 'Error al enviar el correo de recuperación. Verifica tu email.');
      showToast('Error al enviar correo', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <SEO 
          title="Correo Enviado - DoctorMX"
          description="Instrucciones para restablecer tu contraseña enviadas a tu correo."
        />
        
        <div className="min-h-screen bg-gradient-to-br from-brand-jade-50 to-blue-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="p-8 shadow-xl text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Correo enviado!
              </h1>
              
              <p className="text-gray-600 mb-6">
                Hemos enviado las instrucciones para restablecer tu contraseña a:
              </p>
              
              <p className="font-medium text-gray-900 mb-6">
                {email}
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El enlace expirará en 1 hora. Si no ves el correo, 
                  revisa tu carpeta de spam.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Ir a iniciar sesión
                </Button>
                
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                  }}
                  className="w-full text-sm text-brand-jade-600 hover:text-brand-jade-700"
                >
                  Enviar a otro correo
                </button>
              </div>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Recuperar Contraseña - DoctorMX"
        description="Recupera el acceso a tu cuenta de DoctorMX. Te enviaremos instrucciones a tu correo."
        keywords={['recuperar contraseña', 'olvidé contraseña', 'reset password', 'doctormx']}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-brand-jade-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <img 
                src="/Doctorlogo.png" 
                alt="DoctorMX" 
                className="h-16 w-auto mx-auto"
              />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Recuperar contraseña</h1>
            <p className="text-gray-600 mt-2">
              Te enviaremos un correo para restablecer tu contraseña
            </p>
          </div>

          <Card className="p-8 shadow-xl">
            {/* Back to Login */}
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-brand-jade-600 hover:text-brand-jade-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver a iniciar sesión
            </Link>

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico registrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Ingresa el correo asociado a tu cuenta de DoctorMX
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando instrucciones...
                  </>
                ) : (
                  'Enviar instrucciones'
                )}
              </Button>
            </form>

            {/* Additional Help */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                ¿Problemas para recuperar tu cuenta?
              </p>
              <p className="text-sm text-center mt-2">
                <a 
                  href="https://wa.me/526144792338?text=Hola,%20necesito%20ayuda%20para%20recuperar%20mi%20cuenta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-jade-600 hover:text-brand-jade-700 font-medium"
                >
                  Contáctanos por WhatsApp
                </a>
              </p>
            </div>
          </Card>

          {/* Security Note */}
          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 Por seguridad, el enlace de recuperación expirará en 1 hora
          </p>
        </div>
      </div>
    </>
  );
}