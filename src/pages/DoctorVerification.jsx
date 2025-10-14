import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { toast } from '../lib/toast';

export default function DoctorVerification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [doctorData, setDoctorData] = useState(null);
  const [documents, setDocuments] = useState({
    cedula_front: null,
    cedula_back: null,
    ine_front: null
  });

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/connect/signup');
        return;
      }

      const { data: doctor, error } = await supabase
        .from('doctors')
        .select('*, users!inner(*)')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setDoctorData(doctor);
      setVerificationStatus(doctor.license_status);

      if (doctor.license_status === 'verified') {
        navigate('/connect/dashboard');
      }
    } catch (error) {
      console.error('Error loading doctor data:', error);
      toast.error('Error al cargar datos');
    }
  };

  const handleFileChange = (field, file) => {
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error('El archivo no debe superar 5MB');
      return;
    }

    if (file && !['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
      toast.error('Solo se aceptan imágenes (JPG, PNG) o PDF');
      return;
    }

    setDocuments(prev => ({ ...prev, [field]: file }));
  };

  const uploadDocument = async (file, path) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}_${Date.now()}.${fileExt}`;
    const filePath = `doctor-docs/${doctorData.user_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      if (!documents.cedula_front || !documents.cedula_back) {
        toast.error('Por favor sube ambos lados de tu cédula profesional');
        return;
      }

      const urls = {};
      let progress = 0;

      // Upload cedula front
      if (documents.cedula_front) {
        urls.cedula_front = await uploadDocument(documents.cedula_front, 'cedula_front');
        progress += 33;
        setUploadProgress(progress);
      }

      // Upload cedula back
      if (documents.cedula_back) {
        urls.cedula_back = await uploadDocument(documents.cedula_back, 'cedula_back');
        progress += 33;
        setUploadProgress(progress);
      }

      // Upload INE (optional)
      if (documents.ine_front) {
        urls.ine_front = await uploadDocument(documents.ine_front, 'ine_front');
        progress += 34;
        setUploadProgress(progress);
      }

      // Update doctor record with document URLs
      const { error: updateError } = await supabase
        .from('doctors')
        .update({
          kpis: {
            ...doctorData.kpis,
            documents: urls,
            submitted_at: new Date().toISOString()
          }
        })
        .eq('user_id', doctorData.user_id);

      if (updateError) throw updateError;

      // Log audit trail
      await supabase.from('audit_trail').insert({
        actor_user_id: doctorData.user_id,
        entity: 'doctors',
        entity_id: doctorData.user_id,
        action: 'verification_submitted',
        diff: { documents: Object.keys(urls) }
      });

      toast.success('¡Documentos enviados! Te notificaremos cuando se complete la verificación');
      setVerificationStatus('pending');

    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Error al enviar documentos');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  if (!doctorData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-medical-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Verificación de documentos</h1>
            <p className="text-gray-600">Sube tus documentos para completar tu registro</p>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
              verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {verificationStatus === 'pending' && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificación pendiente
                </span>
              )}
              {verificationStatus === 'verified' && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verificado
                </span>
              )}
              {verificationStatus === 'rejected' && (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Verificación rechazada
                </span>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cédula Front */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cédula Profesional (Frente) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-medical-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('cedula_front', e.target.files[0])}
                  className="hidden"
                  id="cedula_front"
                  required
                />
                <label htmlFor="cedula_front" className="cursor-pointer">
                  <div className="text-4xl mb-2">📄</div>
                  {documents.cedula_front ? (
                    <p className="text-sm font-medium text-gray-700">{documents.cedula_front.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">Haz clic para subir</p>
                      <p className="text-xs text-gray-500">JPG, PNG o PDF (máx. 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Cédula Back */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cédula Profesional (Reverso) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-medical-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('cedula_back', e.target.files[0])}
                  className="hidden"
                  id="cedula_back"
                  required
                />
                <label htmlFor="cedula_back" className="cursor-pointer">
                  <div className="text-4xl mb-2">📄</div>
                  {documents.cedula_back ? (
                    <p className="text-sm font-medium text-gray-700">{documents.cedula_back.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">Haz clic para subir</p>
                      <p className="text-xs text-gray-500">JPG, PNG o PDF (máx. 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* INE (optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                INE / Identificación oficial (opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-medical-400 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange('ine_front', e.target.files[0])}
                  className="hidden"
                  id="ine_front"
                />
                <label htmlFor="ine_front" className="cursor-pointer">
                  <div className="text-4xl mb-2">🪪</div>
                  {documents.ine_front ? (
                    <p className="text-sm font-medium text-gray-700">{documents.ine_front.name}</p>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700">Haz clic para subir</p>
                      <p className="text-xs text-gray-500">Ayuda a acelerar la verificación</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Progress Bar */}
            {uploadProgress > 0 && (
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-medical-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Proceso de verificación</span>
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Verificamos tu cédula con la base de datos de la SEP</li>
                <li>• El proceso toma 24-48 horas hábiles</li>
                <li>• Te notificaremos por email y WhatsApp</li>
                <li>• Una vez verificado, podrás empezar a atender pacientes</li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || verificationStatus === 'verified'}
              className="w-full py-4 bg-gradient-to-r from-medical-500 to-medical-600 text-white font-bold rounded-lg hover:from-medical-600 hover:to-medical-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Subiendo documentos...' : 'Enviar para verificación'}
            </button>
          </form>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Necesitas ayuda?{' '}
              <a href="mailto:verify@doctor.mx" className="text-medical-600 hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
