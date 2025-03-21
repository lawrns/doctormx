import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/doctor/EnhancedDashboardLayout';
import { 
  Card, 
  Button, 
  Input, 
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../../components/ui';
import { 
  Upload, 
  Image, 
  Save, 
  CheckCircle, 
  Palette, 
  Layout, 
  Type, 
  Link, 
  Share2, 
  Copy, 
  Globe, 
  Home, 
  Camera,
  Trash,
  Info,
  Undo,
  AlertCircle
} from 'lucide-react';

interface BrandingSettings {
  logo: string | null;
  favicon: string | null;
  coverImage: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontPrimary: string;
  fontSecondary: string;
  customDomain: string | null;
  subdomain: string;
  siteTitle: string;
  siteDescription: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    linkedin: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string;
  };
}

const BrandingSettingsPage: React.FC = () => {
  const { doctorId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings | null>(null);
  const [activeTab, setActiveTab] = useState('appearance');
  const [previewMode, setPreviewMode] = useState(false);
  
  // Color pickers
  const [showPrimaryColorPicker, setShowPrimaryColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  const [showAccentColorPicker, setShowAccentColorPicker] = useState(false);
  
  // Fetch branding settings
  useEffect(() => {
    const fetchBrandingSettings = async () => {
      try {
        if (!doctorId) return;
        
        // In a real implementation, fetch from Supabase
        // For now, use mock data
        setTimeout(() => {
          const mockBrandingSettings: BrandingSettings = {
            logo: null,
            favicon: null,
            coverImage: null,
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            accentColor: '#F97316',
            fontPrimary: 'Montserrat',
            fontSecondary: 'Open Sans',
            customDomain: null,
            subdomain: 'dr-carlos-mendez',
            siteTitle: 'Dr. Carlos Méndez | Médico Familiar en CDMX',
            siteDescription: 'Consulta médica familiar personalizada. Atención integral para toda la familia con enfoque preventivo.',
            socialLinks: {
              facebook: 'https://facebook.com/drmendez',
              instagram: 'https://instagram.com/dr.mendez',
              twitter: '',
              linkedin: 'https://linkedin.com/in/dr-mendez'
            },
            seoSettings: {
              metaTitle: 'Dr. Carlos Méndez | Consulta de Medicina Familiar en CDMX',
              metaDescription: 'El Dr. Carlos Méndez ofrece atención médica familiar en CDMX. Especialista en prevención y control de enfermedades crónicas.',
              keywords: 'médico familiar, medicina general, consulta médica, CDMX, enfermedades crónicas, prevención'
            }
          };
          
          setBrandingSettings(mockBrandingSettings);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching branding settings:', error);
        setLoading(false);
      }
    };
    
    fetchBrandingSettings();
  }, [doctorId]);
  
  // Save branding settings
  const saveBrandingSettings = async () => {
    if (!brandingSettings) return;
    
    try {
      setSaving(true);
      
      // In a real implementation, save to Supabase
      
      // For now, just simulate an API call
      setTimeout(() => {
        setSaving(false);
        alert('Configuración de marca guardada exitosamente');
      }, 1000);
    } catch (error) {
      console.error('Error saving branding settings:', error);
      setSaving(false);
      alert('Error al guardar los cambios. Por favor intenta de nuevo.');
    }
  };
  
  // Reset branding settings to default
  const resetBrandingSettings = () => {
    if (!brandingSettings) return;
    
    const confirmation = window.confirm('¿Estás seguro de que deseas restablecer la configuración a los valores predeterminados? Esta acción no se puede deshacer.');
    
    if (confirmation) {
      setBrandingSettings({
        ...brandingSettings,
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        accentColor: '#F97316',
        fontPrimary: 'Montserrat',
        fontSecondary: 'Open Sans'
      });
    }
  };
  
  // Update social link
  const updateSocialLink = (platform: keyof BrandingSettings['socialLinks'], value: string) => {
    if (!brandingSettings) return;
    
    setBrandingSettings({
      ...brandingSettings,
      socialLinks: {
        ...brandingSettings.socialLinks,
        [platform]: value
      }
    });
  };
  
  // Update SEO setting
  const updateSeoSetting = (field: keyof BrandingSettings['seoSettings'], value: string) => {
    if (!brandingSettings) return;
    
    setBrandingSettings({
      ...brandingSettings,
      seoSettings: {
        ...brandingSettings.seoSettings,
        [field]: value
      }
    });
  };
  
  // Copy site URL to clipboard
  const copySiteUrl = () => {
    const siteUrl = brandingSettings?.customDomain || `https://${brandingSettings?.subdomain}.doctormx.com`;
    navigator.clipboard.writeText(siteUrl);
    alert('URL copiada al portapapeles');
  };
  
  return (
    <DashboardLayout title="Configuración de Marca" loading={loading}>
      {brandingSettings && (
        <>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configuración de Marca</h1>
              <p className="text-gray-500">Personaliza la apariencia y el branding de tu sitio médico</p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                icon={<Globe size={16} />}
                onClick={() => window.open('https://doctor-site-preview.com', '_blank')}
              >
                Ver sitio
              </Button>
              
              <Button
                variant="primary"
                icon={saving ? undefined : <Save size={16} />}
                onClick={saveBrandingSettings}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="appearance">
                    <Palette size={16} className="mr-2" />
                    Apariencia
                  </TabsTrigger>
                  <TabsTrigger value="domain">
                    <Globe size={16} className="mr-2" />
                    Dominio
                  </TabsTrigger>
                  <TabsTrigger value="seo">
                    <Layout size={16} className="mr-2" />
                    SEO
                  </TabsTrigger>
                  <TabsTrigger value="social">
                    <Share2 size={16} className="mr-2" />
                    Redes Sociales
                  </TabsTrigger>
                </TabsList>
                
                {/* Appearance Tab */}
                <TabsContent value="appearance">
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Logos e Imágenes</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Logo principal</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {brandingSettings.logo ? (
                            <div className="relative">
                              <img 
                                src={brandingSettings.logo} 
                                alt="Logo" 
                                className="max-h-32 mx-auto"
                              />
                              <button 
                                className="absolute top-0 right-0 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                                onClick={() => setBrandingSettings({...brandingSettings, logo: null})}
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Image size={36} className="text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-3">
                                Arrastra y suelta tu logo aquí o
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Upload size={14} />}
                              >
                                Subir logo
                              </Button>
                              <p className="text-xs text-gray-400 mt-2">
                                PNG, JPG o SVG (300x100px recomendado)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Favicon</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {brandingSettings.favicon ? (
                            <div className="relative">
                              <img 
                                src={brandingSettings.favicon} 
                                alt="Favicon" 
                                className="h-16 w-16 mx-auto"
                              />
                              <button 
                                className="absolute top-0 right-0 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                                onClick={() => setBrandingSettings({...brandingSettings, favicon: null})}
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Image size={36} className="text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-3">
                                Sube un favicon para la pestaña del navegador
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Upload size={14} />}
                              >
                                Subir favicon
                              </Button>
                              <p className="text-xs text-gray-400 mt-2">
                                PNG, ICO (32x32px recomendado)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-900 mb-3">Imagen de portada</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {brandingSettings.coverImage ? (
                            <div className="relative">
                              <img 
                                src={brandingSettings.coverImage} 
                                alt="Cover" 
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              <button 
                                className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                                onClick={() => setBrandingSettings({...brandingSettings, coverImage: null})}
                              >
                                <Trash size={14} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center py-6">
                              <Camera size={36} className="text-gray-400 mb-2" />
                              <p className="text-sm text-gray-500 mb-3">
                                Agrega una imagen de portada para tu sitio web
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={<Upload size={14} />}
                              >
                                Subir imagen
                              </Button>
                              <p className="text-xs text-gray-400 mt-2">
                                PNG, JPG (1200x400px recomendado)
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Colores</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Color primario</h3>
                        <div className="relative">
                          <div 
                            className="h-12 rounded-lg cursor-pointer flex justify-center items-center text-white"
                            style={{ backgroundColor: brandingSettings.primaryColor }}
                            onClick={() => setShowPrimaryColorPicker(!showPrimaryColorPicker)}
                          >
                            {brandingSettings.primaryColor}
                          </div>
                          
                          <input
                            type="color"
                            value={brandingSettings.primaryColor}
                            onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Utilizado para botones, enlaces y elementos destacados
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Color secundario</h3>
                        <div className="relative">
                          <div 
                            className="h-12 rounded-lg cursor-pointer flex justify-center items-center text-white"
                            style={{ backgroundColor: brandingSettings.secondaryColor }}
                            onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
                          >
                            {brandingSettings.secondaryColor}
                          </div>
                          
                          <input
                            type="color"
                            value={brandingSettings.secondaryColor}
                            onChange={(e) => setBrandingSettings({...brandingSettings, secondaryColor: e.target.value})}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Utilizado para encabezados y secciones secundarias
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Color de acento</h3>
                        <div className="relative">
                          <div 
                            className="h-12 rounded-lg cursor-pointer flex justify-center items-center text-white"
                            style={{ backgroundColor: brandingSettings.accentColor }}
                            onClick={() => setShowAccentColorPicker(!showAccentColorPicker)}
                          >
                            {brandingSettings.accentColor}
                          </div>
                          
                          <input
                            type="color"
                            value={brandingSettings.accentColor}
                            onChange={(e) => setBrandingSettings({...brandingSettings, accentColor: e.target.value})}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Utilizado para elementos destacados y llamadas a la acción
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Undo size={14} />}
                        onClick={resetBrandingSettings}
                      >
                        Restablecer a colores predeterminados
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Tipografía</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Fuente principal</h3>
                        <select
                          value={brandingSettings.fontPrimary}
                          onChange={(e) => setBrandingSettings({...brandingSettings, fontPrimary: e.target.value})}
                          className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="Montserrat">Montserrat</option>
                          <option value="Open Sans">Open Sans</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Lato">Lato</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Raleway">Raleway</option>
                          <option value="Work Sans">Work Sans</option>
                          <option value="Nunito">Nunito</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Utilizada para encabezados y textos destacados
                        </p>
                        
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p style={{ fontFamily: brandingSettings.fontPrimary, fontSize: '24px' }}>
                            Encabezado de muestra
                          </p>
                          <p style={{ fontFamily: brandingSettings.fontPrimary, fontSize: '16px' }}>
                            Este es un ejemplo de texto con la fuente principal seleccionada.
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Fuente secundaria</h3>
                        <select
                          value={brandingSettings.fontSecondary}
                          onChange={(e) => setBrandingSettings({...brandingSettings, fontSecondary: e.target.value})}
                          className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="Open Sans">Open Sans</option>
                          <option value="Roboto">Roboto</option>
                          <option value="Lato">Lato</option>
                          <option value="Montserrat">Montserrat</option>
                          <option value="Poppins">Poppins</option>
                          <option value="Raleway">Raleway</option>
                          <option value="Work Sans">Work Sans</option>
                          <option value="Nunito">Nunito</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Utilizada para el cuerpo del texto y párrafos
                        </p>
                        
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p style={{ fontFamily: brandingSettings.fontSecondary, fontSize: '16px' }}>
                            Este es un ejemplo de párrafo con la fuente secundaria seleccionada.
                            La fuente secundaria se utiliza principalmente para el contenido y textos largos en su sitio web.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Domain Tab */}
                <TabsContent value="domain">
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Configuración de Dominio</h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Subdominio <span className="text-green-600 text-xs">(Activo)</span></h3>
                        <div className="flex">
                          <Input
                            value={brandingSettings.subdomain}
                            onChange={(e) => setBrandingSettings({...brandingSettings, subdomain: e.target.value})}
                            className="rounded-r-none"
                          />
                          <div className="flex items-center bg-gray-100 px-3 rounded-r-md border border-l-0 border-gray-300">
                            .doctormx.com
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Tu sitio médico está disponible en: 
                          <button 
                            className="text-blue-600 hover:underline ml-1 inline-flex items-center"
                            onClick={copySiteUrl}
                          >
                            https://{brandingSettings.subdomain}.doctormx.com
                            <Copy size={12} className="ml-1" />
                          </button>
                        </p>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="font-medium text-gray-900 mb-3">Dominio personalizado <span className="text-gray-500 text-xs">(Opcional)</span></h3>
                        <Input
                          value={brandingSettings.customDomain || ''}
                          onChange={(e) => setBrandingSettings({...brandingSettings, customDomain: e.target.value})}
                          placeholder="www.tudominio.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Configura tu propio dominio para tu sitio médico.
                        </p>
                        
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                          <div className="flex items-start">
                            <AlertCircle size={16} className="text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm text-yellow-800 font-medium">Instrucciones para configurar tu dominio personalizado:</p>
                              <ol className="text-sm text-yellow-700 mt-2 ml-4 list-decimal">
                                <li className="mb-1">Adquiere un dominio en un proveedor de dominios como GoDaddy, Namecheap, Google Domains, etc.</li>
                                <li className="mb-1">Configura tu DNS para que apunte a nuestros servidores.</li>
                                <li className="mb-1">Agrega un registro CNAME para www que apunte a <code className="bg-yellow-100 px-1 py-0.5 rounded">cname.doctormx.com</code></li>
                                <li className="mb-1">Una vez que hayas configurado el DNS, ingresa tu dominio arriba y haz clic en "Guardar cambios".</li>
                                <li>La verificación y activación de tu dominio puede tardar hasta 24 horas.</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Información del Sitio</h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título del sitio
                        </label>
                        <Input
                          value={brandingSettings.siteTitle}
                          onChange={(e) => setBrandingSettings({...brandingSettings, siteTitle: e.target.value})}
                          placeholder="Dr. Juan Pérez | Especialidad en Ciudad"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          El título que aparecerá en la pestaña del navegador y como título principal en tu sitio web.
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción del sitio
                        </label>
                        <Textarea
                          value={brandingSettings.siteDescription}
                          onChange={(e) => setBrandingSettings({...brandingSettings, siteDescription: e.target.value})}
                          placeholder="Breve descripción de tu práctica médica..."
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Una breve descripción que aparecerá en la página principal de tu sitio web.
                        </p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* SEO Tab */}
                <TabsContent value="seo">
                  <Card className="p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">Optimización para Motores de Búsqueda (SEO)</h2>
                        <p className="text-gray-500 text-sm">
                          Mejora la visibilidad de tu sitio en los motores de búsqueda como Google.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título meta (meta title)
                        </label>
                        <Input
                          value={brandingSettings.seoSettings.metaTitle}
                          onChange={(e) => updateSeoSetting('metaTitle', e.target.value)}
                          placeholder="Dr. Juan Pérez | Especialidad en Ciudad"
                        />
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-500">
                            Aparecerá en los resultados de búsqueda
                          </span>
                          <span className={`${brandingSettings.seoSettings.metaTitle.length > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                            {brandingSettings.seoSettings.metaTitle.length}/60 caracteres
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción meta (meta description)
                        </label>
                        <Textarea
                          value={brandingSettings.seoSettings.metaDescription}
                          onChange={(e) => updateSeoSetting('metaDescription', e.target.value)}
                          placeholder="Breve descripción de tu práctica médica para resultados de búsqueda..."
                          rows={3}
                        />
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-gray-500">
                            Breve descripción mostrada en los resultados de búsqueda
                          </span>
                          <span className={`${brandingSettings.seoSettings.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                            {brandingSettings.seoSettings.metaDescription.length}/160 caracteres
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Palabras clave (keywords)
                        </label>
                        <Textarea
                          value={brandingSettings.seoSettings.keywords}
                          onChange={(e) => updateSeoSetting('keywords', e.target.value)}
                          placeholder="médico, especialidad, ciudad, tratamiento, consulta"
                          rows={2}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Separa las palabras clave con comas. Aunque no tienen tanto peso como antes, siguen siendo útiles para la optimización.
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Vista Previa en Búsqueda</h2>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="text-blue-800 text-lg font-medium mb-1 truncate">
                        {brandingSettings.seoSettings.metaTitle || 'Título del sitio'}
                      </div>
                      <div className="text-green-700 text-sm mb-1">
                        {brandingSettings.customDomain || `${brandingSettings.subdomain}.doctormx.com`} › consulta › citas
                      </div>
                      <div className="text-gray-600 text-sm line-clamp-2">
                        {brandingSettings.seoSettings.metaDescription || 'Descripción del sitio que aparecerá en los resultados de búsqueda. Asegúrate de incluir información relevante sobre tu práctica médica.'}
                      </div>
                    </div>
                  </Card>
                </TabsContent>
                
                {/* Social Media Tab */}
                <TabsContent value="social">
                  <Card className="p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Redes Sociales</h2>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <svg className="w-5 h-5 text-blue-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </label>
                        <Input
                          value={brandingSettings.socialLinks.facebook}
                          onChange={(e) => updateSocialLink('facebook', e.target.value)}
                          placeholder="https://facebook.com/tuusuario"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <svg className="w-5 h-5 text-pink-600 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                          Instagram
                        </label>
                        <Input
                          value={brandingSettings.socialLinks.instagram}
                          onChange={(e) => updateSocialLink('instagram', e.target.value)}
                          placeholder="https://instagram.com/tuusuario"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <svg className="w-5 h-5 text-blue-400 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Twitter
                        </label>
                        <Input
                          value={brandingSettings.socialLinks.twitter}
                          onChange={(e) => updateSocialLink('twitter', e.target.value)}
                          placeholder="https://twitter.com/tuusuario"
                        />
                      </div>
                      
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                          <svg className="w-5 h-5 text-blue-700 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </label>
                        <Input
                          value={brandingSettings.socialLinks.linkedin}
                          onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/tuusuario"
                        />
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <div className="flex items-start">
                      <Info size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">Consejos para tus redes sociales</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                          <li className="flex items-start">
                            <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Mantén tus perfiles actualizados con información profesional.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Comparte contenido educativo relacionado con tu especialidad.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Responde a preguntas y comentarios para generar confianza.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Utiliza hashtags relevantes para aumentar la visibilidad.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Comparte testimonios de pacientes (con su consentimiento).</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Preview Card */}
            <div>
              <div className="sticky top-20">
                <Card className="p-6 mb-6">
                  <h2 className="font-semibold mb-4">Vista Previa</h2>
                  
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-200 h-32 flex items-center justify-center">
                      {brandingSettings.coverImage ? (
                        <img 
                          src={brandingSettings.coverImage} 
                          alt="Cover" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          <Camera size={24} className="mx-auto mb-1" />
                          <span className="text-xs">Imagen de portada</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4" style={{ 
                      backgroundColor: brandingSettings.primaryColor + '10'
                    }}>
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center mr-3">
                          {brandingSettings.logo ? (
                            <img 
                              src={brandingSettings.logo} 
                              alt="Logo" 
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <div style={{ color: brandingSettings.primaryColor }} className="font-bold">
                              DM
                            </div>
                          )}
                        </div>
                        
                        <h3 
                          className="font-medium"
                          style={{ 
                            fontFamily: brandingSettings.fontPrimary,
                            color: brandingSettings.secondaryColor
                          }}
                        >
                          Dr. Carlos Méndez
                        </h3>
                      </div>
                      
                      <h3 
                        className="text-lg font-bold mb-2"
                        style={{ 
                          fontFamily: brandingSettings.fontPrimary,
                          color: brandingSettings.primaryColor
                        }}
                      >
                        Medicina Familiar
                      </h3>
                      
                      <p 
                        className="text-sm mb-4"
                        style={{ 
                          fontFamily: brandingSettings.fontSecondary
                        }}
                      >
                        {brandingSettings.siteDescription.length > 100 
                          ? brandingSettings.siteDescription.substring(0, 100) + '...' 
                          : brandingSettings.siteDescription}
                      </p>
                      
                      <button 
                        className="w-full py-2 rounded-lg text-white text-sm font-medium"
                        style={{ 
                          backgroundColor: brandingSettings.accentColor
                        }}
                      >
                        Agendar Cita
                      </button>
                    </div>
                    
                    <div className="p-4 border-t border-gray-200 flex justify-around">
                      {brandingSettings.socialLinks.facebook && (
                        <a href="#" className="text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </a>
                      )}
                      
                      {brandingSettings.socialLinks.instagram && (
                        <a href="#" className="text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </a>
                      )}
                      
                      {brandingSettings.socialLinks.twitter && (
                        <a href="#" className="text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                        </a>
                      )}
                      
                      {brandingSettings.socialLinks.linkedin && (
                        <a href="#" className="text-gray-500 hover:text-gray-700">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-blue-50">
                  <div className="flex items-start">
                    <Info size={20} className="text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Consejos para tu sitio</h3>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start">
                          <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Utiliza colores que transmitan confianza y profesionalismo.</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Agrega fotos de calidad que reflejen tu consulta.</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Mantén la información siempre actualizada.</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Incluye palabras clave relevantes para tu especialidad.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default BrandingSettingsPage;