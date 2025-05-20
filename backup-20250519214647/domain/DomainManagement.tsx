import React, { useState, useEffect } from 'react';
import { Globe, Check, AlertCircle, Copy, ExternalLink, ChevronRight, X, Clipboard, ClipboardCheck } from 'lucide-react';
import DomainService from '../../services/domain/DomainService';
import DomainVerificationService from '../../services/domain/DomainVerificationService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert } from '../ui';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useToast } from '../../contexts/ToastContext';

/**
 * Enhanced component for managing doctor domains and subdomains
 */
const DomainManagement: React.FC<{ doctorId: string }> = ({ doctorId }) => {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubdomainForm, setShowSubdomainForm] = useState(false);
  const [showCustomDomainForm, setShowCustomDomainForm] = useState(false);
  const [subdomainPrefix, setSubdomainPrefix] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'subdomains' | 'custom-domains'>('subdomains');
  const [verificationInstructions, setVerificationInstructions] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [clipboardState, setClipboardState] = useState<Record<string, boolean>>({});

  // Get toast notification context
  const { showToast } = useToast();

  // Fetch domains on load
  useEffect(() => {
    fetchDomains();
  }, [doctorId]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const domains = await DomainService.getDoctorDomains(doctorId);
      setDomains(domains);
      setError(null);
    } catch (err) {
      setError('Failed to load domains. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubdomain = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Validate subdomain
      if (!subdomainPrefix.trim()) {
        setError('El subdominio no puede estar vacío');
        return;
      }
      
      // Create subdomain
      await DomainService.createSubdomain(doctorId, subdomainPrefix);
      
      // Reset form and refresh domains
      setSubdomainPrefix('');
      setShowSubdomainForm(false);
      setError(null);
      
      await fetchDomains();

      // Show success toast
      showToast({
        title: 'Subdominio creado',
        description: `Tu subdominio ${subdomainPrefix}.doctor.mx ha sido creado exitosamente.`,
        variant: 'success',
      });
    } catch (err) {
      setError(err.message || 'Failed to create subdomain. Please try again.');
      console.error(err);
      
      // Show error toast
      showToast({
        title: 'Error al crear subdominio',
        description: err.message || 'Ha ocurrido un error al crear el subdominio.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterCustomDomain = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Validate domain
      const validation = DomainVerificationService.validateDomain(customDomain);
      
      if (!validation.isValid) {
        setError(validation.errors.join('. '));
        return;
      }
      
      // Register domain
      const domain = await DomainService.registerCustomDomain(doctorId, validation.domain);
      
      // Get verification instructions
      const instructions = DomainVerificationService.getDNSSetupInstructions(
        validation.domain,
        domain.verification_code
      );
      
      setVerificationInstructions(instructions);
      
      // Reset form and refresh domains
      setCustomDomain('');
      setShowCustomDomainForm(false);
      setError(null);
      
      await fetchDomains();

      // Show success toast
      showToast({
        title: 'Dominio registrado',
        description: `Tu dominio ${validation.domain} ha sido registrado. Sigue las instrucciones para verificarlo.`,
        variant: 'success',
      });
    } catch (err) {
      setError(err.message || 'Failed to register domain. Please try again.');
      console.error(err);
      
      // Show error toast
      showToast({
        title: 'Error al registrar dominio',
        description: err.message || 'Ha ocurrido un error al registrar el dominio.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyDomain = async (domainId) => {
    try {
      setVerificationStatus('checking');
      
      // Get domain record
      const domain = domains.find(d => d.id === domainId);
      
      if (!domain) {
        throw new Error('Domain record not found');
      }
      
      // Verify domain
      const isVerified = await DomainVerificationService.verifyDNSTXTRecord(
        domain.custom_domain,
        domain.verification_code
      );
      
      if (isVerified) {
        // Update domain status
        await DomainService.verifyDomainOwnership(domainId);
        setVerificationStatus('success');
        
        // Request SSL certificate
        await DomainVerificationService.requestSSLCertificate(domain.custom_domain);
        
        // Refresh domains
        await fetchDomains();

        // Show success toast
        showToast({
          title: 'Dominio verificado',
          description: 'Tu dominio ha sido verificado correctamente. Se está configurando el certificado SSL.',
          variant: 'success',
        });
      } else {
        setVerificationStatus('error');
        setError('DNS verification failed. Please check your DNS records and try again.');
        
        // Show error toast
        showToast({
          title: 'Error de verificación',
          description: 'No se han encontrado los registros DNS necesarios. Verifica tu configuración.',
          variant: 'error',
        });
      }
    } catch (err) {
      setVerificationStatus('error');
      setError(err.message || 'Verification failed. Please try again.');
      console.error(err);
      
      // Show error toast
      showToast({
        title: 'Error de verificación',
        description: err.message || 'Ha ocurrido un error durante la verificación.',
        variant: 'error',
      });
    }
  };

  const handleDeleteDomain = async (domainId) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar este dominio?')) {
      return;
    }
    
    try {
      await DomainService.deleteDomain(domainId);
      
      // Refresh domains
      await fetchDomains();

      // Show success toast
      showToast({
        title: 'Dominio eliminado',
        description: 'El dominio ha sido eliminado correctamente.',
        variant: 'info',
      });
    } catch (err) {
      setError(err.message || 'Failed to delete domain. Please try again.');
      console.error(err);
      
      // Show error toast
      showToast({
        title: 'Error al eliminar dominio',
        description: err.message || 'Ha ocurrido un error al eliminar el dominio.',
        variant: 'error',
      });
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setClipboardState({ ...clipboardState, [id]: true });
    
    // Reset clipboard state after 2 seconds
    setTimeout(() => {
      setClipboardState({ ...clipboardState, [id]: false });
    }, 2000);
    
    // Show toast
    showToast({
      title: 'Copiado al portapapeles',
      description: 'El texto ha sido copiado al portapapeles.',
      variant: 'info',
      duration: 2000,
    });
  };

  const renderSubdomainsTab = () => {
    const subdomains = domains.filter(d => d.subdomain_prefix);
    
    return (
      <div className="space-y-4">
        {subdomains.length === 0 && !showSubdomainForm ? (
          <Card className="bg-gray-50">
            <CardContent className="pt-6 text-center">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <CardTitle className="mt-2 text-gray-900">No tienes subdominios</CardTitle>
              <CardDescription className="mt-1">
                Crea un subdominio personalizado para tu perfil de Doctor.mx
              </CardDescription>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => setShowSubdomainForm(true)}
                  icon={<ChevronRight size={16} />}
                  iconPosition="right"
                >
                  Crear subdominio
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        
        {subdomains.map(domain => (
          <Card key={domain.id} className="overflow-hidden transform transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-0">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <span className="text-blue-600">{domain.subdomain_url}</span>
                    <Badge className="ml-2" variant="success" size="sm">Activo</Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Creado el {new Date(domain.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<ExternalLink size={16} />}
                    iconPosition="left"
                    onClick={() => window.open(`https://${domain.subdomain_url}`, '_blank')}
                  >
                    Visitar
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<X size={16} />}
                    iconPosition="left"
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {showSubdomainForm && (
          <Card className="mt-5 border-blue-200 shadow-md animate-fadeIn">
            <CardHeader>
              <CardTitle>Crear nuevo subdominio</CardTitle>
              <CardDescription>
                Tu dirección personalizada en Doctor.mx
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSubdomain}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                      Subdominio
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="subdomain"
                        id="subdomain"
                        value={subdomainPrefix}
                        onChange={(e) => setSubdomainPrefix(e.target.value)}
                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md sm:text-sm border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="tunombre"
                        disabled={submitting}
                      />
                      <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        .doctor.mx
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      El subdominio debe contener solo letras, números y guiones.
                    </p>
                  </div>
                </div>
                
                <div className="mt-5 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSubdomainForm(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    icon={<Check size={16} />}
                    iconPosition="left"
                  >
                    {submitting ? 'Creando...' : 'Crear subdominio'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {subdomains.length > 0 && !showSubdomainForm && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowSubdomainForm(true)}
              icon={<ChevronRight size={16} />}
              iconPosition="right"
            >
              Crear otro subdominio
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderCustomDomainsTab = () => {
    const customDomains = domains.filter(d => d.custom_domain);
    
    return (
      <div className="space-y-4">
        {customDomains.length === 0 && !showCustomDomainForm ? (
          <Card className="bg-gray-50">
            <CardContent className="pt-6 text-center">
              <Globe className="mx-auto h-12 w-12 text-gray-400" />
              <CardTitle className="mt-2 text-gray-900">No tienes dominios personalizados</CardTitle>
              <CardDescription className="mt-1">
                Usa tu propio dominio para tu perfil de Doctor.mx
              </CardDescription>
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => setShowCustomDomainForm(true)}
                  icon={<ChevronRight size={16} />}
                  iconPosition="right"
                >
                  Registrar dominio
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
        
        {customDomains.map(domain => (
          <Card key={domain.id} className="overflow-hidden transform transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-0">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <span>{domain.custom_domain}</span>
                    <Badge 
                      className="ml-2" 
                      variant={
                        domain.verification_status === 'verified' ? 'success' :
                        domain.verification_status === 'failed' ? 'danger' : 'warning'
                      } 
                      size="sm"
                    >
                      {domain.verification_status === 'verified'
                        ? 'Verificado'
                        : domain.verification_status === 'failed'
                        ? 'Verificación fallida'
                        : 'Pendiente de verificación'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Registrado el {new Date(domain.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {domain.verification_status === 'verified' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ExternalLink size={16} />}
                      iconPosition="left"
                      onClick={() => window.open(`https://${domain.custom_domain}`, '_blank')}
                    >
                      Visitar
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Check size={16} />}
                      iconPosition="left"
                      onClick={() => handleVerifyDomain(domain.id)}
                      loading={verificationStatus === 'checking'}
                      disabled={verificationStatus === 'checking'}
                    >
                      {verificationStatus === 'checking' ? 'Verificando...' : 'Verificar'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<X size={16} />}
                    iconPosition="left"
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardContent>
            
            {domain.verification_status !== 'verified' && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h4 className="text-sm font-medium text-gray-500">Instrucciones de verificación</h4>
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Verifica la propiedad de tu dominio
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Añade el siguiente registro TXT a la configuración DNS de tu dominio:
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="bg-yellow-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>Tipo:</strong> TXT, <strong>Nombre:</strong> @, <strong>Valor:</strong> {domain.verification_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(domain.verification_code, `txt-${domain.id}`)}
                          className="ml-2 text-yellow-700 hover:text-yellow-500 transition-colors duration-200"
                        >
                          {clipboardState[`txt-${domain.id}`] ? 
                            <ClipboardCheck size={16} className="text-green-500" /> : 
                            <Clipboard size={16} />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-yellow-700">
                      También necesitas añadir un registro CNAME para dirigir el tráfico a Doctor.mx:
                    </p>
                    <div className="mt-2 bg-yellow-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>Tipo:</strong> CNAME, <strong>Nombre:</strong> www, <strong>Valor:</strong> proxy.doctor.mx
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText('proxy.doctor.mx', `cname-${domain.id}`)}
                          className="ml-2 text-yellow-700 hover:text-yellow-500 transition-colors duration-200"
                        >
                          {clipboardState[`cname-${domain.id}`] ? 
                            <ClipboardCheck size={16} className="text-green-500" /> : 
                            <Clipboard size={16} />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-yellow-700">
                      Si estás usando un dominio apex (sin www), añade también este registro A:
                    </p>
                    <div className="mt-2 bg-yellow-100 rounded-md p-3 font-mono text-sm overflow-x-auto">
                      <div className="flex justify-between items-center">
                        <span>
                          <strong>Tipo:</strong> A, <strong>Nombre:</strong> @, <strong>Valor:</strong> 76.76.21.21
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText('76.76.21.21', `a-${domain.id}`)}
                          className="ml-2 text-yellow-700 hover:text-yellow-500 transition-colors duration-200"
                        >
                          {clipboardState[`a-${domain.id}`] ? 
                            <ClipboardCheck size={16} className="text-green-500" /> : 
                            <Clipboard size={16} />
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-yellow-700">
                    <p>
                      Los cambios DNS pueden tardar hasta 48 horas en propagarse. Una vez que hayas añadido los registros, haz clic en "Verificar".
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {domain.verification_status === 'verified' && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Dominio verificado correctamente
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Tu dominio está correctamente configurado y ya puedes usarlo.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-md p-3 transition-all duration-300 hover:shadow-md">
                    <h4 className="text-xs font-medium text-gray-500 uppercase">Estado SSL</h4>
                    <p className={`mt-1 text-sm font-medium ${
                      domain.ssl_status === 'issued' 
                        ? 'text-green-600' 
                        : domain.ssl_status === 'error'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}>
                      {domain.ssl_status === 'issued'
                        ? 'Certificado SSL activo'
                        : domain.ssl_status === 'error'
                        ? 'Error con el certificado SSL'
                        : 'Certificado SSL en proceso'}
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-md p-3 transition-all duration-300 hover:shadow-md">
                    <h4 className="text-xs font-medium text-gray-500 uppercase">Última verificación</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {domain.verified_at ? new Date(domain.verified_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
        
        {showCustomDomainForm && (
          <Card className="mt-5 border-blue-200 shadow-md animate-fadeIn">
            <CardHeader>
              <CardTitle>Registrar dominio personalizado</CardTitle>
              <CardDescription>
                Configura tu propio dominio para tu perfil médico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterCustomDomain}>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                      Dominio personalizado
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="domain"
                        id="domain"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-200"
                        placeholder="tusitio.com"
                        disabled={submitting}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Ingresa el dominio que ya posees y deseas usar para tu perfil.
                    </p>
                  </div>
                </div>
                
                <div className="mt-5 flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomDomainForm(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    icon={<Check size={16} />}
                    iconPosition="left"
                  >
                    {submitting ? 'Registrando...' : 'Registrar dominio'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        
        {customDomains.length > 0 && !showCustomDomainForm && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowCustomDomainForm(true)}
              icon={<ChevronRight size={16} />}
              iconPosition="right"
            >
              Registrar otro dominio
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Gestión de dominios</CardTitle>
              <CardDescription>
                Personaliza cómo los pacientes acceden a tu perfil profesional
              </CardDescription>
            </div>
          </div>
          
          <div className="border-b border-gray-200 mt-4 -mb-px">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('subdomains')}
                className={`${
                  activeTab === 'subdomains'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Subdominios Doctor.mx
              </button>
              
              <button
                onClick={() => setActiveTab('custom-domains')}
                className={`${
                  activeTab === 'custom-domains'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Dominios personalizados
              </button>
            </nav>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          ) : (
            <>
              {error && (
                <Alert 
                  variant="error" 
                  className="mb-4"
                  onDismiss={() => setError(null)}
                >
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 transition-all duration-300">
                {activeTab === 'subdomains' ? renderSubdomainsTab() : renderCustomDomainsTab()}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainManagement;