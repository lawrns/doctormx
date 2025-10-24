import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MobileSpacing from '../components/ui/MobileOptimized';

export default function DoctorSubscriptionSetup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Get verification token from URL
  const verificationToken = searchParams.get('token');
  const doctorId = searchParams.get('doctorId');

  useEffect(() => {
    if (!verificationToken || !doctorId) {
      setError('Enlace de verificación inválido');
      setLoading(false);
      return;
    }
    fetchDoctorData();
  }, [verificationToken, doctorId]);

  const fetchDoctorData = async () => {
    try {
      // Verify the verification token and get doctor data
      const { data: doctorData, error } = await supabase
        .from('doctors')
        .select(`
          *,
          users!inner(name, email)
        `)
        .eq('user_id', doctorId)
        .eq('license_status', 'verified')
        .single();

      if (error || !doctorData) {
        throw new Error('Doctor no encontrado o no verificado');
      }

      setDoctor(doctorData);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
      setError('Error al cargar información del doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionSetup = async () => {
    if (!doctor) return;

    setProcessing(true);
    setError(null);

    try {
      // Call backend to create subscription
      const response = await fetch('/api/doctors/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: doctor.user_id,
          subscriptionPlan: doctor.subscription_plan,
          verificationToken: verificationToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al configurar suscripción');
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else if (data.subscription) {
        // Subscription created successfully
        toast.success('¡Suscripción activada exitosamente!');
        navigate('/connect/dashboard', { 
          state: { 
            message: '¡Bienvenido! Tu suscripción ha sido activada. Ya puedes comenzar a recibir pacientes.' 
          }
        });
      }
    } catch (error) {
      console.error('Subscription setup error:', error);
      setError(error.message || 'Error al configurar suscripción');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout variant="marketing">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Cargando información...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout variant="marketing">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-6 text-center">
            <Icon name="exclamation-triangle" size="xl" className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/connect/login')} variant="primary">
              Volver al inicio de sesión
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!doctor) {
    return (
      <Layout variant="marketing">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-6 text-center">
            <Icon name="exclamation-triangle" size="xl" className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No autorizado</h2>
            <p className="text-gray-600 mb-4">No tienes acceso a esta página.</p>
            <Button onClick={() => navigate('/connect/login')} variant="primary">
              Volver al inicio de sesión
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout variant="marketing">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <MobileSpacing.Container className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="check-circle" size="xl" className="text-green-600" />
              </div>
              <MobileSpacing.Text variant="h1" className="mb-2 text-gray-900">
                ¡Verificación Exitosa!
              </MobileSpacing.Text>
              <MobileSpacing.Text variant="body" className="text-gray-600">
                Tu cédula profesional ha sido verificada. Ahora activa tu suscripción para comenzar a recibir pacientes.
              </MobileSpacing.Text>
            </div>

            {/* Doctor Info */}
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="user" size="md" className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {doctor.users?.name || 'Dr. Sin Nombre'}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700">Cédula Verificada</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Cédula: {doctor.cedula} • Especialidades: {doctor.specialties?.join(', ') || 'No especificadas'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Subscription Plan */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Plan Seleccionado</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {doctor.subscription_plan === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {doctor.subscription_plan === 'yearly' 
                          ? 'Facturación anual (2 meses gratis)'
                          : 'Facturación mensual'
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {doctor.subscription_plan === 'yearly' ? '$4,999' : '$499'}
                      </div>
                      <div className="text-sm text-gray-500">MXN</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Icon name="check-circle" size="sm" className="text-green-600" />
                      <span>7 días de prueba gratuita</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="check-circle" size="sm" className="text-green-600" />
                      <span>Cancela cuando quieras</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="check-circle" size="sm" className="text-green-600" />
                      <span>Acceso inmediato a pacientes referidos</span>
                    </div>
                    {doctor.subscription_plan === 'yearly' && (
                      <div className="flex items-center gap-2">
                        <Icon name="check-circle" size="sm" className="text-green-600" />
                        <span>Ahorra $998 MXN vs plan mensual</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Benefits */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Qué incluye tu suscripción?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Icon name="cpu-chip" size="sm" className="text-blue-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Referencias de IA</div>
                        <div className="text-sm text-gray-600">Pacientes calificados por nuestro sistema de IA médica</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Icon name="currency-dollar" size="sm" className="text-green-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">$200+ por consulta</div>
                        <div className="text-sm text-gray-600">70% de las ganancias van directamente a ti</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Icon name="video-camera" size="sm" className="text-purple-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Consultas en línea</div>
                        <div className="text-sm text-gray-600">Plataforma integrada para telemedicina</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Icon name="shield-check" size="sm" className="text-blue-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Cumplimiento legal</div>
                        <div className="text-sm text-gray-600">NOM-004 y NOM-024 para telemedicina</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Icon name="chart-bar" size="sm" className="text-orange-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Panel de control</div>
                        <div className="text-sm text-gray-600">Estadísticas y gestión de pacientes</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Icon name="phone" size="sm" className="text-green-600 mt-1" />
                      <div>
                        <div className="font-medium text-gray-900">Soporte 24/7</div>
                        <div className="text-sm text-gray-600">Asistencia técnica y médica</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Security */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Seguridad de pago</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Icon name="shield-check" size="sm" className="text-green-600" />
                    <span>Procesado por Stripe</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="lock-closed" size="sm" className="text-blue-600" />
                    <span>SSL encriptado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="credit-card" size="sm" className="text-purple-600" />
                    <span>Tarjetas aceptadas</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Tu información de pago está protegida con encriptación de grado bancario. 
                  No almacenamos datos de tarjetas de crédito en nuestros servidores.
                </p>
              </div>
            </Card>

            {/* Error Display */}
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <div className="p-6">
                  <div className="flex items-start gap-3">
                    <Icon name="exclamation-triangle" size="md" className="text-red-600 mt-1" />
                    <div>
                      <div className="font-semibold text-red-800">Error</div>
                      <div className="text-sm text-red-700 mt-1">{error}</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/connect/login')}
                variant="secondary"
                className="flex-1"
                disabled={processing}
              >
                <Icon name="arrow-left" size="sm" className="mr-2" />
                Cancelar
              </Button>
              
              <Button
                onClick={handleSubscriptionSetup}
                variant="primary"
                className="flex-1"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Icon name="credit-card" size="sm" className="mr-2" />
                    Activar Suscripción
                  </>
                )}
              </Button>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Al activar tu suscripción, aceptas nuestros{' '}
                <a href="/legal/terms" className="text-blue-600 hover:underline">
                  Términos de Servicio
                </a>{' '}
                y{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Aviso de Privacidad
                </a>
                . Puedes cancelar en cualquier momento.
              </p>
            </div>
          </motion.div>
        </MobileSpacing.Container>
      </div>
    </Layout>
  );
}



