import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, Copy, ExternalLink, Globe, RefreshCw, X } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { supabase } from '../../lib/supabase';

interface DomainManagementProps {
  doctorId: string | number;
}

interface Domain {
  id: string;
  domain: string;
  status: 'pending' | 'active' | 'error';
  errorMessage?: string;
  createdAt: string;
}

const DomainManagement: React.FC<DomainManagementProps> = ({ doctorId }) => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [customDomainEnabled, setCustomDomainEnabled] = useState(false);
  const [domainNamespace, setDomainNamespace] = useState('');
  
  // Fetch domains associated with this doctor
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        
        // Fetch doctor to check if custom domain is enabled
        const { data: doctor, error: doctorError } = await supabase
          .from('doctors')
          .select('feature_flags')
          .eq('id', doctorId)
          .single();
        
        if (doctorError) throw doctorError;
        
        // Check if custom domain feature is enabled
        const enabled = doctor?.feature_flags?.customDomain?.enabled || false;
        setCustomDomainEnabled(enabled);
        
        // If custom domain is not enabled, set loading to false and return
        if (!enabled) {
          setLoading(false);
          return;
        }
        
        // Fetch domains for this doctor
        const { data: fetchedDomains, error: domainsError } = await supabase
          .from('doctor_domains')
          .select('*')
          .eq('doctor_id', doctorId)
          .order('created_at', { ascending: false });
        
        if (domainsError) throw domainsError;
        
        // Generate domain namespace from doctor id and name
        const doctorNameResult = await supabase
          .from('doctors')
          .select('name')
          .eq('id', doctorId)
          .single();
        
        if (doctorNameResult.error) throw doctorNameResult.error;
        
        const doctorName = doctorNameResult.data?.name || '';
        const namespace = generateDomainNamespace(doctorName);
        setDomainNamespace(namespace);
        
        // Set domains
        setDomains(fetchedDomains || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching domains:', err);
        setLoading(false);
      }
    };
    
    fetchDomains();
  }, [doctorId]);
  
  // Generate a domain namespace from doctor name
  const generateDomainNamespace = (name: string): string => {
    const cleanName = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]/g, ''); // Remove special characters
    
    // Combine with doctor ID to ensure uniqueness
    return `${cleanName}${doctorId}`;
  };
  
  // Add a new custom domain
  const handleAddDomain = async () => {
    try {
      // Validate domain
      if (!newDomain) {
        setError('El dominio no puede estar vacío');
        return;
      }
      
      // Basic domain format validation
      const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
      if (!domainRegex.test(newDomain)) {
        setError('Formato de dominio inválido');
        return;
      }
      
      setAdding(true);
      setError('');
      
      // Check if domain already exists for this doctor
      const { data: existingDomain } = await supabase
        .from('doctor_domains')
        .select('id')
        .eq('domain', newDomain)
        .eq('doctor_id', doctorId)
        .single();
      
      if (existingDomain) {
        setError('Este dominio ya está registrado para este médico');
        setAdding(false);
        return;
      }
      
      // Add domain to the database
      const { data: newDomainData, error: addError } = await supabase
        .from('doctor_domains')
        .insert({
          doctor_id: doctorId,
          domain: newDomain,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (addError) throw addError;
      
      // Add the new domain to the state
      setDomains(prev => [newDomainData, ...prev]);
      setNewDomain('');
      setAdding(false);
    } catch (err) {
      console.error('Error adding domain:', err);
      setError('Error al agregar el dominio. Por favor intenta de nuevo.');
      setAdding(false);
    }
  };
  
  // Verify domain DNS settings
  const handleVerifyDomain = async (domainId: string) => {
    try {
      setVerifying(true);
      
      // In a real implementation, this would check the DNS records
      // For now, just simulate verification
      setTimeout(async () => {
        // Update domain status
        const { error: updateError } = await supabase
          .from('doctor_domains')
          .update({ status: 'active' })
          .eq('id', domainId);
        
        if (updateError) throw updateError;
        
        // Update local state
        setDomains(prev => 
          prev.map(domain => 
            domain.id === domainId 
              ? { ...domain, status: 'active' } 
              : domain
          )
        );
        
        setVerifying(false);
      }, 2000);
    } catch (err) {
      console.error('Error verifying domain:', err);
      setVerifying(false);
    }
  };
  
  // Delete a domain
  const handleDeleteDomain = async (domainId: string) => {
    try {
      // Delete domain from the database
      const { error: deleteError } = await supabase
        .from('doctor_domains')
        .delete()
        .eq('id', domainId);
      
      if (deleteError) throw deleteError;
      
      // Remove domain from state
      setDomains(prev => prev.filter(domain => domain.id !== domainId));
    } catch (err) {
      console.error('Error deleting domain:', err);
    }
  };
  
  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  // If custom domain feature is not enabled
  if (!customDomainEnabled) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-gray-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dominios personalizados</h2>
          
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Esta función solo está disponible en planes premium. Actualice su plan para poder configurar un dominio personalizado para su perfil médico.
          </p>
          
          <Button 
            variant="primary"
            onClick={() => window.location.href = '/doctor-dashboard/subscription'}
          >
            Actualizar plan
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <div>
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Dominio personalizado</h2>
        
        <p className="text-gray-600 mb-6">
          Puedes configurar un dominio personalizado para tu perfil médico. Esto permitirá a tus pacientes acceder a tu perfil a través de un dominio propio, como <strong>www.tudominio.com</strong>.
        </p>
        
        <h3 className="font-medium text-gray-900 mb-2">Subdominio gratuito</h3>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Ya tienes un subdominio gratuito de Doctor.mx que puedes compartir con tus pacientes:
          </p>
          
          <div className="flex items-center">
            <code className="bg-gray-50 px-3 py-2 rounded-lg text-gray-800 flex-1">
              https://{domainNamespace}.doctor.mx
            </code>
            
            <Button 
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => copyToClipboard(`https://${domainNamespace}.doctor.mx`)}
              icon={<Copy size={16} />}
            >
              Copiar
            </Button>
            
            <Button 
              variant="ghost"
              size="sm"
              className="ml-2"
              onClick={() => window.open(`https://${domainNamespace}.doctor.mx`, '_blank')}
              icon={<ExternalLink size={16} />}
            >
              Visitar
            </Button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-medium text-gray-900 mb-3">Agregar dominio personalizado</h3>
          
          <div className="mb-1">
            <p className="text-gray-600 text-sm mb-4">
              Ingresa el dominio que deseas utilizar para tu perfil médico. Deberás configurar los registros DNS para que apunten a nuestros servidores.
            </p>
            
            <div className="flex items-start">
              <div className="flex-1">
                <Input
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    setError('');
                  }}
                  placeholder="www.tudominio.com"
                  className={`w-full ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
              </div>
              
              <Button 
                variant="primary"
                className="ml-3"
                onClick={handleAddDomain}
                loading={adding}
                disabled={!newDomain || adding}
              >
                Agregar
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {domains.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dominios configurados</h2>
          
          <div className="space-y-4">
            {domains.map((domain) => (
              <div 
                key={domain.id} 
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      {domain.status === 'active' ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5 mr-2" />
                      ) : domain.status === 'pending' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                      )}
                      
                      <div>
                        <h3 className="font-medium text-gray-900">{domain.domain}</h3>
                        
                        <p className={`text-sm ${
                          domain.status === 'active' 
                            ? 'text-green-600' 
                            : domain.status === 'pending' 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                        }`}>
                          {domain.status === 'active' 
                            ? 'Activo' 
                            : domain.status === 'pending' 
                              ? 'Pendiente de verificación' 
                              : 'Error de configuración'}
                        </p>
                        
                        {domain.errorMessage && (
                          <p className="text-sm text-red-600 mt-1">{domain.errorMessage}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex">
                      {domain.status === 'active' ? (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                          icon={<ExternalLink size={16} />}
                        >
                          Visitar
                        </Button>
                      ) : domain.status === 'pending' ? (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDomain(domain.id)}
                          loading={verifying}
                          icon={<RefreshCw size={16} />}
                        >
                          Verificar
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyDomain(domain.id)}
                          icon={<RefreshCw size={16} />}
                        >
                          Reintentar
                        </Button>
                      )}
                      
                      <Button 
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-gray-400 hover:text-red-600"
                        onClick={() => handleDeleteDomain(domain.id)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  {domain.status === 'pending' && (
                    <div className="mt-4 bg-yellow-50 p-4 rounded-md">
                      <h4 className="font-medium text-yellow-800 mb-2">Instrucciones de configuración DNS</h4>
                      
                      <p className="text-sm text-yellow-700 mb-3">
                        Para activar tu dominio, configura los siguientes registros DNS en tu proveedor de dominios:
                      </p>
                      
                      <div className="bg-white rounded p-3 border border-yellow-200 overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr>
                              <th className="text-left font-medium text-yellow-800 pr-4">Tipo</th>
                              <th className="text-left font-medium text-yellow-800 pr-4">Nombre</th>
                              <th className="text-left font-medium text-yellow-800 pr-4">Valor</th>
                              <th className="text-left font-medium text-yellow-800">TTL</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="pr-4 py-2">CNAME</td>
                              <td className="pr-4 py-2">{domain.domain.startsWith('www.') ? 'www' : '@'}</td>
                              <td className="pr-4 py-2">custom.doctor.mx</td>
                              <td className="py-2">3600</td>
                            </tr>
                            <tr>
                              <td className="pr-4 py-2">TXT</td>
                              <td className="pr-4 py-2">_doctormx-verify</td>
                              <td className="pr-4 py-2">doctormx-verify={doctorId}</td>
                              <td className="py-2">3600</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <p className="text-sm text-yellow-700 mt-3">
                        Los cambios de DNS pueden tardar hasta 48 horas en propagarse. Una vez configurados, haz clic en "Verificar" para activar tu dominio.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DomainManagement;