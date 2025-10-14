import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';

export default function DoctorSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cedula: '',
    specialties: [],
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
      if (!formData.name || !formData.email || !formData.phone || !formData.cedula) {
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
          license_status: 'pending'
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

      toast.success('¡Registro exitoso! Revisa tu correo para verificar tu cuenta');
      navigate('/connect/verify');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <Link to="/" className="text-3xl font-bold text-medical-600">Doctor.mx</Link>
            <h1 className="text-3xl font-bold mt-4 mb-2 text-gray-900">Únete como médico</h1>
            <p className="text-gray-600">Comienza a atender pacientes por WhatsApp</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
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
                        ? 'bg-medical-500 border-medical-500 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-medical-300'
                    }`}
                  >
                    {specialty}
                  </button>
                ))}
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                placeholder="Ingresa código si te refirió alguien"
              />
            </div>

            {/* Terms */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                Al registrarte, aceptas nuestros{' '}
                <Link to="/legal/terms" className="text-medical-600 hover:underline">
                  Términos de Servicio
                </Link>{' '}
                y{' '}
                <Link to="/privacy" className="text-medical-600 hover:underline">
                  Aviso de Privacidad
                </Link>
                . Cumplimos con NOM-004 y NOM-024 para telemedicina.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-medical-500 to-medical-600 text-white font-bold rounded-lg hover:from-medical-600 hover:to-medical-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/connect/login" className="text-medical-600 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </motion.div>

        {/* Info cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-brand-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-gray-700">Verificación rápida</div>
            <div className="text-xs text-gray-500">En 24 horas</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-medical-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-medical-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-gray-700">$200+ por consulta</div>
            <div className="text-xs text-gray-500">Pago semanal</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-brand-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-gray-700">100% WhatsApp</div>
            <div className="text-xs text-gray-500">Sin apps extras</div>
          </div>
        </div>
      </div>
    </div>
  );
}
