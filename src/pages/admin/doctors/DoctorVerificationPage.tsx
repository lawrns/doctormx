import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Shield, Check, X, AlertCircle, FileText, 
  MapPin, Phone, Mail, Globe, Calendar,
  Download, Upload, ExternalLink
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

function DoctorVerificationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch doctor details
  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          specialties (name),
          locations (city, state),
          documents (id, type, url, verified),
          education (institution, degree, year),
          certifications (name, issuer, year)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  const handleVerification = async (status: 'verified' | 'rejected') => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('doctors')
        .update({
          verification_status: status,
          verification_notes: verificationNotes,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      // Create audit log
      await supabase
        .from('admin_audit_logs')
        .insert({
          action: `doctor_${status}`,
          entity_type: 'doctors',
          entity_id: id,
          changes: {
            status,
            notes: verificationNotes
          }
        });

      navigate('/admin/doctors');
    } catch (err) {
      console.error('Error updating verification status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando información del médico...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="text-red-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error al cargar la información</h3>
            <p className="text-red-600">No se pudo cargar la información del médico.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Verificación de Médico</h1>
            <p className="text-gray-600">Revisa y verifica la información del médico</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleVerification('rejected')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center"
            >
              <X size={20} className="mr-2" />
              Rechazar
            </button>
            <button
              onClick={() => handleVerification('verified')}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center"
            >
              <Check size={20} className="mr-2" />
              Verificar
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">Nombre completo</label>
                <p className="mt-1 text-gray-900">{doctor.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Especialidad</label>
                <p className="mt-1 text-gray-900">{doctor.specialty}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Correo electrónico</label>
                <p className="mt-1 text-gray-900">{doctor.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Teléfono</label>
                <p className="mt-1 text-gray-900">{doctor.phone}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Dirección</label>
                <p className="mt-1 text-gray-900">{doctor.address}</p>
              </div>
            </div>
          </div>

          {/* Education & Certifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Educación y Certificaciones</h2>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Educación</h3>
              <div className="space-y-4">
                {doctor.education?.map((edu, index) => (
                  <div key={index} className="flex items-start">
                    <Calendar size={20} className="text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{edu.degree}</p>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Certificaciones</h3>
              <div className="space-y-4">
                {doctor.certifications?.map((cert, index) => (
                  <div key={index} className="flex items-start">
                    <Shield size={20} className="text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{cert.name}</p>
                      <p className="text-gray-600">{cert.issuer}</p>
                      <p className="text-sm text-gray-500">{cert.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h2>
            
            <div className="space-y-4">
              {doctor.documents?.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <FileText size={20} className="text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.type}</p>
                      <p className="text-sm text-gray-500">
                        {doc.verified ? (
                          <span className="text-green-600">Verificado</span>
                        ) : (
                          <span className="text-yellow-600">Pendiente de verificación</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <ExternalLink size={20} />
                    </a>
                    <a
                      href={doc.url}
                      download
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de verificación</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas de verificación
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="Agrega notas sobre la verificación..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">Estado actual</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  doctor.verification_status === 'verified'
                    ? 'bg-green-100 text-green-800'
                    : doctor.verification_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {doctor.verification_status === 'verified' && <Check size={12} className="mr-1" />}
                  {doctor.verification_status === 'pending' && <AlertCircle size={12} className="mr-1" />}
                  {doctor.verification_status === 'rejected' && <X size={12} className="mr-1" />}
                  {doctor.verification_status === 'verified' ? 'Verificado' :
                   doctor.verification_status === 'pending' ? 'Pendiente' : 'Rechazado'}
                </span>
              </div>

              {doctor.verified_at && (
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Verificado el</span>
                  <span className="text-sm text-gray-900">
                    {new Date(doctor.verified_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de contacto</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin size={20} className="text-gray-400 mr-3" />
                <span className="text-gray-600">{doctor.address}</span>
              </div>
              <div className="flex items-center">
                <Phone size={20} className="text-gray-400 mr-3" />
                <span className="text-gray-600">{doctor.phone}</span>
              </div>
              <div className="flex items-center">
                <Mail size={20} className="text-gray-400 mr-3" />
                <span className="text-gray-600">{doctor.email}</span>
              </div>
              {doctor.website && (
                <div className="flex items-center">
                  <Globe size={20} className="text-gray-400 mr-3" />
                  <a 
                    href={doctor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {doctor.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorVerificationPage;