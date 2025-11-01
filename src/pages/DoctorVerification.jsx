import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import MobileSpacing from '../components/ui/MobileOptimized';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState('pending');
  const [documents, setDocuments] = useState([]);
  const [sepStatus, setSepStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    whatsapp: true
  });

  useEffect(() => {
    if (!user) return;

    // Fetch initial status
    fetchVerificationStatus();

    // Real-time subscription
    const subscription = supabase
      .channel('doctor-verification')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'doctors', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Verification status changed:', payload);
          fetchVerificationStatus();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user]);

  const fetchVerificationStatus = async () => {
    setLoading(true);
    try {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('verification_status, sep_verified, verification_date, verification_data')
        .eq('user_id', user.id)
        .single();

      if (doctor) {
        setStatus(doctor.verification_status || 'pending');
        setSepStatus(doctor.sep_verified ? 'verified' : 'pending');
      }

      // Fetch documents
      const { data: docs } = await supabase
        .from('doctor_documents')
        .select('*')
        .eq('doctor_id', user.id);

      setDocuments(docs || []);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('doctor-docs')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading document:', error);
    } else {
      // Save to database
      await supabase.from('doctor_documents').insert({
        doctor_id: user.id,
        file_path: data.path,
        type: file.type,
        name: file.name,
      });

      fetchVerificationStatus(); // Refresh
    }
  };

  const requestSEPVerification = async () => {
    // Trigger SEP verification
    const { error } = await supabase.rpc('trigger_sep_verification', { doctor_id: user.id });
    if (error) console.error('Error requesting SEP verification:', error);
  };

  const updateNotificationPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('doctors')
        .update({
          notification_preferences: notificationPreferences
        })
        .eq('user_id', user.id);

      toast.success('Preferencias de notificación actualizadas');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Error al actualizar preferencias');
    }
  };

  if (loading) {
    return (
      <Layout variant="marketing">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando información...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout variant="marketing">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
          <Card className="max-w-md mx-auto p-6 text-center">
            <Icon name="exclamation-triangle" size="xl" className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">No se pudo cargar la información del doctor.</p>
            <Button onClick={() => navigate('/connect/signup')} variant="primary">
              Volver al registro
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
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="clock" size="xl" className="text-blue-600" />
              </div>
              <MobileSpacing.Text variant="h1" className="mb-2 text-gray-900">
                Verificación en Proceso
              </MobileSpacing.Text>
              <MobileSpacing.Text variant="body" className="text-gray-600">
                Tu cuenta ha sido creada exitosamente. Estamos verificando tu cédula profesional.
              </MobileSpacing.Text>
            </div>

            {/* Status Card */}
            <Card className="mb-6">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="identification" size="md" className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cédula Profesional: {user.id}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium text-yellow-700">Verificación Pendiente</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Estamos verificando tu cédula profesional con la base de datos de la SEP. 
                      Este proceso normalmente toma hasta 24 horas.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Timeline */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Qué sigue?</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="check" size="sm" className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Cuenta creada</div>
                      <div className="text-sm text-gray-600">Tu información ha sido registrada correctamente</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="clock" size="sm" className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Verificación de cédula</div>
                      <div className="text-sm text-gray-600">Verificando con la SEP (hasta 24 horas)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="envelope" size="sm" className="text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-500">Notificación de aprobación</div>
                      <div className="text-sm text-gray-500">Te enviaremos un email con el enlace para activar tu suscripción</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="credit-card" size="sm" className="text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-500">Configuración de suscripción</div>
                      <div className="text-sm text-gray-500">Completa el pago y comienza a recibir pacientes</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Subscription Plan Info */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Plan Seleccionado</h3>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {user.subscription_plan === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {user.subscription_plan === 'yearly' 
                          ? '$4,999 MXN por año (2 meses gratis)'
                          : '$499 MXN por mes'
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {user.subscription_plan === 'yearly' ? '$4,999' : '$499'}
                      </div>
                      <div className="text-xs text-gray-500">MXN</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-600">
                    ✓ 7 días de prueba gratuita • ✓ Cancela cuando quieras
                  </div>
                </div>
              </div>
            </Card>

            {/* Notification Preferences */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias de Notificación</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Email</div>
                      <div className="text-sm text-gray-600">Recibir notificaciones por correo electrónico</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.email}
                        onChange={(e) => setNotificationPreferences({
                          ...notificationPreferences,
                          email: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">WhatsApp</div>
                      <div className="text-sm text-gray-600">Recibir notificaciones por WhatsApp</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPreferences.whatsapp}
                        onChange={(e) => setNotificationPreferences({
                          ...notificationPreferences,
                          whatsapp: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    onClick={updateNotificationPreferences}
                    variant="secondary"
                    size="sm"
                  >
                    Guardar preferencias
                  </Button>
                </div>
              </div>
            </Card>

            {/* Contact Info */}
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Necesitas ayuda?</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Icon name="envelope" size="sm" className="text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">Email de soporte</div>
                      <div className="text-sm text-gray-600">soporte@doctor.mx</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Icon name="phone" size="sm" className="text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">WhatsApp</div>
                      <div className="text-sm text-gray-600">+52 55 1234 5678</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Icon name="clock" size="sm" className="text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900">Horario de atención</div>
                      <div className="text-sm text-gray-600">Lunes a Viernes, 9:00 AM - 6:00 PM</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/connect/login')}
                variant="secondary"
                className="flex-1"
              >
                <Icon name="arrow-left" size="sm" className="mr-2" />
                Volver al inicio de sesión
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="primary"
                className="flex-1"
              >
                <Icon name="arrow-path" size="sm" className="mr-2" />
                Actualizar estado
              </Button>
            </div>
          </motion.div>
        </MobileSpacing.Container>
      </div>
    </Layout>
  );
}