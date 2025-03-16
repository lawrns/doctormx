import { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Copy, CheckCircle, Share2, Globe, Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ReferralLink {
  id: string;
  code: string;
  name: string | null;
  usage_count: number;
  created_at: string;
  last_used_at: string | null;
}

const ReferralLinkGenerator = () => {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkName, setLinkName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<{ id: string } | null>(null);

  // Fetch user's doctor profile and referral links
  useEffect(() => {
    const fetchDoctorAndReferralLinks = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        // Get doctor profile
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (doctorError) {
          throw doctorError;
        }

        setDoctorProfile(doctorData);

        if (doctorData.id) {
          // Get referral links
          const { data: linksData, error: linksError } = await supabase
            .from('referral_links')
            .select('*')
            .eq('doctor_id', doctorData.id)
            .order('created_at', { ascending: false });

          if (linksError) {
            throw linksError;
          }

          setReferralLinks(linksData || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('No se pudieron cargar los enlaces de referidos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctorAndReferralLinks();
  }, [user, supabase]);

  const generateReferralLink = async () => {
    if (!doctorProfile) return;
    
    setIsGenerating(true);
    try {
      // Generate a unique code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create referral link
      const { data, error } = await supabase
        .from('referral_links')
        .insert({
          doctor_id: doctorProfile.id,
          code,
          name: linkName || null,
          created_at: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setReferralLinks([data, ...referralLinks]);
      setLinkName('');
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (err) {
      console.error('Error creating referral link:', err);
      setError('No se pudo crear el enlace. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (id: string, code: string) => {
    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}/connect/${code}`;
    
    navigator.clipboard.writeText(referralUrl)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 3000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };

  const shareReferralLink = (code: string) => {
    const baseUrl = window.location.origin;
    const referralUrl = `${baseUrl}/connect/${code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Doctor.mx Connect',
        text: 'Te invito a unirte a Doctor.mx con 6 meses de acceso Premium gratuito.',
        url: referralUrl
      })
      .catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      copyToClipboard(code, code);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 rounded col-span-2"></div>
                <div className="h-4 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Doctor.mx Connect</h2>
        <p className="text-gray-600 mb-6">
          Invita a otros médicos a unirse a Doctor.mx y ayúdales a obtener 6 meses de acceso Premium gratis.
        </p>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre para tu enlace (opcional)"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary px-6 py-2 flex items-center justify-center"
              onClick={generateReferralLink}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando...
                </>
              ) : (
                <>
                  Generar enlace
                </>
              )}
            </motion.button>
          </div>
          
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-green-600 flex items-center"
            >
              <CheckCircle size={16} className="mr-1" />
              Enlace generado exitosamente
            </motion.div>
          )}
        </div>
        
        {referralLinks.length > 0 ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tus enlaces de referidos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enlace
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último uso
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referralLinks.map((link) => {
                    const baseUrl = window.location.origin;
                    const referralUrl = `${baseUrl}/connect/${link.code}`;
                    
                    return (
                      <tr key={link.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Globe size={16} className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {link.name || "Enlace sin nombre"}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {referralUrl}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users size={16} className="text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900">{link.usage_count}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(link.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {link.last_used_at ? new Date(link.last_used_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => copyToClipboard(link.id, link.code)}
                              aria-label="Copiar enlace"
                            >
                              {copiedId === link.id ? (
                                <CheckCircle size={18} className="text-green-600" />
                              ) : (
                                <Copy size={18} />
                              )}
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => shareReferralLink(link.code)}
                              aria-label="Compartir enlace"
                            >
                              <Share2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center bg-gray-50 p-8 rounded-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes enlaces de referidos</h3>
            <p className="text-gray-600 mb-4">
              Genera tu primer enlace para invitar a otros médicos a unirse a Doctor.mx
            </p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Beneficios del programa Connect</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Para tus referidos</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>6 meses de acceso Premium gratis</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Sin tarjeta de crédito ni compromiso</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Registro prioritario y verificación acelerada</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Para ti</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>1 mes extra de Premium por cada referido</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Distintivo especial en tu perfil</span>
              </li>
              <li className="flex items-start">
                <CheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Posicionamiento preferente en búsquedas</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4">
          <Link 
            to="/connect"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Más información sobre Doctor.mx Connect
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReferralLinkGenerator;