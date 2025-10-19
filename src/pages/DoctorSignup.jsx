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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-600 text-white shadow-lg transition-all duration-200 group-hover:shadow-blue-500/25 group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M10 4h4a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2H6a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V6a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900 transition-colors duration-200 group-hover:text-blue-600">doctor.mx</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/connect" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Volver
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto py-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Únete como médico</h1>
            <p className="text-gray-600 mb-4">Recibe pacientes referidos por IA médica</p>
            
            {/* Pricing Highlight */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$499 MXN/mes</div>
                <div className="text-sm text-gray-600">Suscripción mensual • $200+ por consulta</div>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            <p className="text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link to="/connect/login" className="text-blue-600 font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </motion.div>

        {/* Info cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-gray-200">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-gray-700">Verificación rápida</div>
            <div className="text-xs text-gray-500">En 24 horas</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-gray-200">
            <div className="w-10 h-10 mx-auto mb-2 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-gray-700">$200+ por consulta</div>
            <div className="text-xs text-gray-500">70% para ti</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm text-center border border-gray-200">
            <div className="w-10 h-10 mx-auto mb-2 bg-teal-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="text-sm font-semibold text-gray-700">Referencias IA</div>
            <div className="text-xs text-gray-500">Pacientes calificados</div>
          </div>
        </div>
      </div>
    </div>
  );
}
