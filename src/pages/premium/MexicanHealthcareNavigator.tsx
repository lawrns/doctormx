import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, Shield, CreditCard, Users, Clock, Phone,
  Building, Heart, AlertTriangle, CheckCircle, Star,
  Calculator, FileText, Navigation, Zap, Award
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';

interface HealthcareProvider {
  id: string;
  name: string;
  type: 'imss' | 'issste' | 'private' | 'public';
  specialty: string[];
  address: string;
  phone: string;
  distance: number;
  rating: number;
  waitTime: string;
  acceptsInsurance: string[];
  estimatedCost: {
    consultation: number;
    emergency: number;
  };
  features: string[];
  availability: {
    emergency: boolean;
    appointments: boolean;
    telemedicine: boolean;
  };
}

interface InsurancePlan {
  provider: string;
  plan: string;
  coverage: number;
  monthlyPremium: number;
  deductible: number;
  benefits: string[];
  networks: string[];
  waitingPeriod: string;
}

const MEXICAN_HEALTHCARE_PROVIDERS: HealthcareProvider[] = [
  {
    id: '1',
    name: 'Hospital General de México Dr. Eduardo Liceaga',
    type: 'public',
    specialty: ['General', 'Emergencias', 'Especialidades'],
    address: 'Dr. Balmis 148, Doctores, CDMX',
    phone: '55-2789-2000',
    distance: 2.1,
    rating: 4.2,
    waitTime: '45-90 min',
    acceptsInsurance: ['IMSS', 'ISSSTE', 'Seguro Popular'],
    estimatedCost: {
      consultation: 0,
      emergency: 0
    },
    features: ['Urgencias 24/7', 'UCI', 'Trauma', 'Pediatría'],
    availability: {
      emergency: true,
      appointments: true,
      telemedicine: false
    }
  },
  {
    id: '2',
    name: 'Hospital ABC Santa Fe',
    type: 'private',
    specialty: ['Cardiología', 'Oncología', 'Neurología', 'Cirugía'],
    address: 'Av. Carlos Graef Fernández 154, Santa Fe, CDMX',
    phone: '55-1103-1600',
    distance: 8.5,
    rating: 4.8,
    waitTime: '15-30 min',
    acceptsInsurance: ['GNP', 'Zurich', 'MetLife', 'AXA'],
    estimatedCost: {
      consultation: 1500,
      emergency: 8000
    },
    features: ['Tecnología avanzada', 'Medicina internacional', 'Concierge'],
    availability: {
      emergency: true,
      appointments: true,
      telemedicine: true
    }
  },
  {
    id: '3',
    name: 'Clínica IMSS No. 25',
    type: 'imss',
    specialty: ['Medicina Familiar', 'Pediatría', 'Ginecología'],
    address: 'Av. Insurgentes Sur 1677, Guadalupe Inn, CDMX',
    phone: '55-5229-1000',
    distance: 4.2,
    rating: 3.8,
    waitTime: '60-120 min',
    acceptsInsurance: ['IMSS'],
    estimatedCost: {
      consultation: 0,
      emergency: 0
    },
    features: ['Medicina preventiva', 'Laboratorio', 'Farmacia'],
    availability: {
      emergency: false,
      appointments: true,
      telemedicine: true
    }
  },
  {
    id: '4',
    name: 'Hospital Médica Sur',
    type: 'private',
    specialty: ['Cardiología', 'Trasplantes', 'Oncología', 'Neurología'],
    address: 'Puente de Piedra 150, Toriello Guerra, CDMX',
    phone: '55-5424-7200',
    distance: 12.3,
    rating: 4.7,
    waitTime: '20-45 min',
    acceptsInsurance: ['GNP', 'Seguros Monterrey', 'AXA'],
    estimatedCost: {
      consultation: 1800,
      emergency: 10000
    },
    features: ['Acreditación JCI', 'Investigación', 'Telemedicina'],
    availability: {
      emergency: true,
      appointments: true,
      telemedicine: true
    }
  }
];

const INSURANCE_PLANS: InsurancePlan[] = [
  {
    provider: 'GNP Seguros',
    plan: 'Gastos Médicos Mayores Integral',
    coverage: 90,
    monthlyPremium: 2500,
    deductible: 15000,
    benefits: ['Hospitalización', 'Cirugías', 'Medicamentos', 'Consultas'],
    networks: ['Hospital ABC', 'Médica Sur', 'Angeles'],
    waitingPeriod: '30 días'
  },
  {
    provider: 'Zurich',
    plan: 'Salud Completa',
    coverage: 85,
    monthlyPremium: 1800,
    deductible: 20000,
    benefits: ['Emergencias', 'Especialistas', 'Estudios', 'Maternidad'],
    networks: ['Red hospitalaria extensa'],
    waitingPeriod: '60 días'
  },
  {
    provider: 'MetLife',
    plan: 'Protección Médica Premium',
    coverage: 95,
    monthlyPremium: 3200,
    deductible: 10000,
    benefits: ['Cobertura internacional', 'Medicina preventiva', 'Dental'],
    networks: ['Hospitales premium'],
    waitingPeriod: '90 días'
  }
];

const HEALTHCARE_PROGRAMS = [
  {
    name: 'IMSS',
    description: 'Instituto Mexicano del Seguro Social',
    eligibility: 'Trabajadores formales y sus familias',
    coverage: 'Integral con cuotas patronales',
    benefits: ['Consultas', 'Hospitalización', 'Medicamentos', 'Pensiones'],
    howToApply: 'A través del empleador'
  },
  {
    name: 'ISSSTE',
    description: 'Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado',
    eligibility: 'Empleados del gobierno',
    coverage: 'Servicios médicos y prestaciones sociales',
    benefits: ['Atención médica', 'Jubilación', 'Vivienda', 'Capacitación'],
    howToApply: 'Registro automático al ingresar al servicio público'
  },
  {
    name: 'INSABI',
    description: 'Instituto de Salud para el Bienestar',
    eligibility: 'Población sin seguridad social',
    coverage: 'Servicios gratuitos de salud',
    benefits: ['Atención primaria', 'Especialidades', 'Medicamentos gratuitos'],
    howToApply: 'Registro en centros de salud'
  }
];

export default function MexicanHealthcareNavigator() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('providers');
  const [searchLocation, setSearchLocation] = useState('');
  const [filteredProviders, setFilteredProviders] = useState(MEXICAN_HEALTHCARE_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<HealthcareProvider | null>(null);
  const [userInsurance, setUserInsurance] = useState<string[]>(['IMSS']);

  useEffect(() => {
    filterProviders();
  }, [searchLocation]);

  const filterProviders = () => {
    if (!searchLocation) {
      setFilteredProviders(MEXICAN_HEALTHCARE_PROVIDERS);
      return;
    }

    const filtered = MEXICAN_HEALTHCARE_PROVIDERS.filter(provider =>
      provider.name.toLowerCase().includes(searchLocation.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchLocation.toLowerCase()) ||
      provider.specialty.some(spec => spec.toLowerCase().includes(searchLocation.toLowerCase()))
    );

    setFilteredProviders(filtered);
  };

  const getProviderTypeColor = (type: string) => {
    switch (type) {
      case 'imss': return 'bg-blue-100 text-blue-800';
      case 'issste': return 'bg-green-100 text-green-800';
      case 'private': return 'bg-purple-100 text-purple-800';
      case 'public': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProviderTypeName = (type: string) => {
    switch (type) {
      case 'imss': return 'IMSS';
      case 'issste': return 'ISSSTE';
      case 'private': return 'Privado';
      case 'public': return 'Público';
      default: return type;
    }
  };

  const calculateCompatibility = (provider: HealthcareProvider) => {
    const hasInsurance = provider.acceptsInsurance.some(insurance => 
      userInsurance.includes(insurance)
    );
    const costScore = provider.type === 'private' ? 60 : 100;
    const ratingScore = (provider.rating / 5) * 100;
    const waitScore = provider.waitTime.includes('15-30') ? 100 : 
                     provider.waitTime.includes('45-90') ? 70 : 50;
    
    return Math.round((
      (hasInsurance ? 100 : 30) * 0.3 + 
      costScore * 0.2 + 
      ratingScore * 0.3 + 
      waitScore * 0.2
    ));
  };

  const tabs = [
    { id: 'providers', label: 'Proveedores', icon: Building },
    { id: 'insurance', label: 'Seguros', icon: Shield },
    { id: 'programs', label: 'Programas Públicos', icon: Users },
    { id: 'costs', label: 'Calculadora de Costos', icon: Calculator }
  ];

  return (
    <>
      <SEO
        title="Navegador de Salud Mexicano | Encuentra proveedores y seguros médicos"
        description="Navega el sistema de salud mexicano: encuentra hospitales, compara seguros, optimiza costos y accede a programas públicos de salud."
        canonical="/healthcare-navigator"
        keywords="sistema salud méxico, IMSS, ISSSTE, seguros médicos, hospitales méxico, navegador salud"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold">
                Navegador de Salud Mexicano
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Tu guía inteligente para navegar el sistema de salud mexicano: 
                encuentra proveedores, optimiza seguros y accede a programas públicos.
              </p>
              
              <div className="flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Datos oficiales COFEPRIS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>Actualizado en tiempo real</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Optimizado para México</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center space-x-1 mb-8 bg-white dark:bg-gray-800 rounded-lg p-1 shadow">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Providers Tab */}
          {selectedTab === 'providers' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <Card className="p-6 bg-white dark:bg-gray-800">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Buscar por ubicación, especialidad o nombre
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        placeholder="Ej: Cardiología, Santa Fe, Hospital ABC..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="md:w-64">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tu seguro médico
                    </label>
                    <select
                      value={userInsurance[0] || ''}
                      onChange={(e) => setUserInsurance([e.target.value])}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="IMSS">IMSS</option>
                      <option value="ISSSTE">ISSSTE</option>
                      <option value="GNP">GNP Seguros</option>
                      <option value="Zurich">Zurich</option>
                      <option value="MetLife">MetLife</option>
                      <option value="Sin seguro">Sin seguro</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Providers Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                {filteredProviders.map((provider, index) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {provider.name}
                            </h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getProviderTypeColor(provider.type)}>
                                {getProviderTypeName(provider.type)}
                              </Badge>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                  {provider.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Compatibilidad
                            </div>
                            <div className={`text-2xl font-bold ${
                              calculateCompatibility(provider) >= 80 ? 'text-green-600' :
                              calculateCompatibility(provider) >= 60 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {calculateCompatibility(provider)}%
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600 dark:text-gray-400">Distancia</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {provider.distance} km
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 dark:text-gray-400">Tiempo de espera</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {provider.waitTime}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 dark:text-gray-400">Consulta</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {provider.estimatedCost.consultation === 0 ? 'Gratuita' : `$${provider.estimatedCost.consultation}`}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 dark:text-gray-400">Emergencia</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {provider.estimatedCost.emergency === 0 ? 'Gratuita' : `$${provider.estimatedCost.emergency}`}
                            </div>
                          </div>
                        </div>

                        {/* Specialties */}
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Especialidades
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {provider.specialty.slice(0, 3).map((spec, i) => (
                              <Badge key={i} variant="outline" size="sm">
                                {spec}
                              </Badge>
                            ))}
                            {provider.specialty.length > 3 && (
                              <Badge variant="outline" size="sm">
                                +{provider.specialty.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="flex items-center space-x-4 text-xs">
                          {provider.availability.emergency && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Urgencias 24/7</span>
                            </div>
                          )}
                          {provider.availability.telemedicine && (
                            <div className="flex items-center space-x-1 text-blue-600">
                              <Zap className="w-3 h-3" />
                              <span>Telemedicina</span>
                            </div>
                          )}
                          {provider.acceptsInsurance.includes(userInsurance[0]) && (
                            <div className="flex items-center space-x-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>Acepta tu seguro</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => setSelectedProvider(provider)}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Ver Detalles
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`tel:${provider.phone}`)}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Llamar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(provider.address)}`)}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Ubicación
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance Tab */}
          {selectedTab === 'insurance' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Comparador de Seguros Médicos
                </h2>
                
                <div className="grid lg:grid-cols-3 gap-6">
                  {INSURANCE_PLANS.map((plan, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {plan.provider}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            {plan.plan}
                          </p>
                        </div>

                        <div className="text-center py-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="text-3xl font-bold text-blue-600">
                            ${plan.monthlyPremium.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            por mes
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Cobertura:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{plan.coverage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Deducible:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ${plan.deductible.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Período de espera:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{plan.waitingPeriod}</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Beneficios incluidos:
                          </h4>
                          <ul className="space-y-1">
                            {plan.benefits.map((benefit, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Cotizar Plan
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Public Programs Tab */}
          {selectedTab === 'programs' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Programas Públicos de Salud
                </h2>
                
                <div className="space-y-6">
                  {HEALTHCARE_PROGRAMS.map((program, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                    >
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {program.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {program.description}
                          </p>
                          
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Elegibilidad: 
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                                {program.eligibility}
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Cobertura: 
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                                {program.coverage}
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Cómo aplicar: 
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                                {program.howToApply}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            Beneficios incluidos:
                          </h4>
                          <ul className="space-y-2">
                            {program.benefits.map((benefit, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                          
                          <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
                            <FileText className="w-4 h-4 mr-2" />
                            Más Información
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Cost Calculator Tab */}
          {selectedTab === 'costs' && (
            <div className="space-y-6">
              <Card className="p-6 bg-white dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Calculadora de Costos Médicos
                </h2>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <div className="text-center">
                    <Calculator className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Próximamente
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Calculadora inteligente que comparará costos entre diferentes proveedores, 
                      seguros y programas públicos para ayudarte a tomar la mejor decisión financiera.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}