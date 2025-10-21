import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';
import Icon from '../components/ui/Icon';
import MobileSpacing from '../components/ui/MobileOptimized';

export default function DoctorSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cedula: '',
    specialties: [],
    subscriptionPlan: 'monthly',
    referralCode: ''
  });

  const availableSpecialties = [
    'Medicina General',
    'Dermatología',
    'Nutrición',
    'Psicología',
    'Pediatría',
    'Ginecología',
    'Medicina Interna',
    'Psiquiatría',
    'Cardiología',
    'Endocrinología'
  ];

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.email || !formData.phone || !formData.cedula || !formData.subscriptionPlan) {
        toast.error('Por favor completa todos los campos requeridos');
        return;
      }

      if (formData.specialties.length === 0) {
        toast.error('Selecciona al menos una especialidad');
        return;
      }

      // Format phone number
      let phone = formData.phone.replace(/\D/g, '');
      if (phone.startsWith('52')) {
        phone = '+' + phone;
      } else if (!phone.startsWith('+52')) {
        phone = '+52' + phone;
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: Math.random().toString(36).slice(-16),
        options: {
          data: {
            name: formData.name,
            phone: phone,
            role: 'doctor'
          }
        }
      });

      if (authError) throw authError;

      // Insert into users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: formData.name,
          email: formData.email,
          phone: phone,
          role: 'doctor'
        });

      if (userError) throw userError;

      // Insert into doctors table
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert({
          user_id: authData.user.id,
          cedula: formData.cedula,
          specialties: formData.specialties,
          license_status: 'pending',
          verification_status: 'pending',
          subscription_status: 'pending_verification',
          subscription_plan: formData.subscriptionPlan
        });

      if (doctorError) throw doctorError;

      // Track referral if provided
      if (formData.referralCode) {
        await supabase.from('referrals').insert({
          source: 'doctor',
          source_id: formData.referralCode,
          patient_id: authData.user.id,
          ref_code: formData.referralCode
        });
      }

      // Track onboarding event
      await supabase
        .from('onboarding_analytics')
        .insert({
          doctor_id: authData.user.id,
          event_type: 'signup_completed',
          event_data: {
            subscription_plan: formData.subscriptionPlan,
            specialties: formData.specialties,
            has_referral: !!formData.referralCode
          }
        });

      toast.success('¡Registro exitoso! Verificaremos tu cédula en 24 horas y te contactaremos para activar tu suscripción.');
      navigate('/connect/verify');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout variant="marketing">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
        <MobileSpacing.Container className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8"
        >
          <div className="text-center mb-6 sm:mb-8">
            <MobileSpacing.Text variant="h1" className="mb-2 text-gray-900">
              Únete como médico
            </MobileSpacing.Text>
            <MobileSpacing.Text variant="body" className="text-gray-600 mb-4">
              Recibe pacientes referidos por IA médica
            </MobileSpacing.Text>
            
            {/* Pricing Highlight */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$499 MXN/mes</div>
                <div className="text-sm text-gray-600">Suscripción mensual • $200+ por consulta</div>
                <div className="mt-2 text-xs text-gray-500">
                  ✓ 7 días de prueba gratuita • ✓ Cancela cuando quieras
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Dr./Dra. [Nombre] [Apellido]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                WhatsApp / Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+52 555 123 4567"
              />
              <p className="text-xs text-gray-500 mt-1">
                Usaremos este número para enviarte consultas
              </p>
            </div>

            {/* Cédula */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cédula Profesional *
              </label>
              <input
                type="text"
                required
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="12345678"
              />
              <p className="text-xs text-gray-500 mt-1">
                Verificaremos tu cédula con la base de datos de la SEP
              </p>
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Especialidades * (selecciona al menos una)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableSpecialties.map((specialty) => (
                  <button
                    key={specialty}
                    type="button"
                    onClick={() => handleSpecialtyToggle(specialty)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      formData.specialties.includes(specialty)
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscription Plan Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Plan de Suscripción *
              </label>
              <div className="grid md:grid-cols-2 gap-4">
                <label className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.subscriptionPlan === 'monthly' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="subscriptionPlan"
                    value="monthly"
                    checked={formData.subscriptionPlan === 'monthly'}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Plan Mensual</span>
                    <span className="text-lg font-bold text-blue-600">$499 MXN</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">por mes</div>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center gap-1">
                      <Icon name="check-circle" size="sm" color="success" />
                      <span>7 días de prueba gratuita</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="check-circle" size="sm" color="success" />
                      <span>Cancela cuando quieras</span>
                    </div>
                  </div>
                </label>

                <label className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.subscriptionPlan === 'yearly' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Más Popular
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="subscriptionPlan"
                    value="yearly"
                    checked={formData.subscriptionPlan === 'yearly'}
                    onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">Plan Anual</span>
                    <span className="text-lg font-bold text-green-600">$4999 MXN</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">por año (2 meses gratis)</div>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex items-center gap-1">
                      <Icon name="check-circle" size="sm" color="success" />
                      <span>Ahorra $998 MXN</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon name="check-circle" size="sm" color="success" />
                      <span>Prioridad en referencias</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Código de referido (opcional)
              </label>
              <input
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa código si te refirió alguien"
              />
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Al registrarte, aceptas nuestros{' '}
                <Link to="/legal/terms" className="text-blue-600 hover:underline">
                  Términos de Servicio
                </Link>{' '}
                y{' '}
                <Link to="/privacy" className="text-blue-600 hover:underline">
                  Aviso de Privacidad
                </Link>
                . Cumplimos con NOM-004 y NOM-024 para telemedicina.
              </p>
            </div>

            {/* Submit */}
            <MobileSpacing.Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              size="lg"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta y continuar'}
            </MobileSpacing.Button>
            
            {/* Verification Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Icon name="information-circle" size="md" color="primary" />
                <div>
                  <div className="font-semibold text-blue-800">Próximo paso: Verificación</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Después de crear tu cuenta, verificaremos tu cédula profesional en 24 horas. 
                    Una vez verificada, te contactaremos para activar tu suscripción y comenzar a recibir pacientes.
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/connect/login" className="text-blue-600 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </motion.div>

        {/* Info cards */}
        <MobileSpacing.Grid 
          cols={{ mobile: 1, tablet: 2, desktop: 3 }}
          className="mt-6 sm:mt-8"
        >
          <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-gray-200">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="bolt" size="md" color="primary" />
            </div>
            <div className="text-sm font-semibold text-gray-700">Verificación rápida</div>
            <div className="text-xs text-gray-500">En 24 horas</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-gray-200">
            <div className="w-10 h-10 mx-auto mb-2 bg-green-50 rounded-lg flex items-center justify-center">
              <Icon name="currency-dollar" size="md" color="success" />
            </div>
            <div className="text-sm font-semibold text-gray-700">$200+ por consulta</div>
            <div className="text-xs text-gray-500">70% para ti</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-gray-200">
            <div className="w-10 h-10 mx-auto mb-2 bg-teal-50 rounded-lg flex items-center justify-center">
              <Icon name="cpu-chip" size="md" color="secondary" />
            </div>
            <div className="text-sm font-semibold text-gray-700">Referencias IA</div>
            <div className="text-xs text-gray-500">Pacientes calificados</div>
          </div>
        </MobileSpacing.Grid>
        </MobileSpacing.Container>
      </div>
    </Layout>
  );
}
