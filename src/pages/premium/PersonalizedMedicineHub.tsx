import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { 
  Dna, Pill, Target, Brain, Heart, Activity, 
  TestTube, Microscope, Award, Shield, Zap,
  TrendingUp, Calendar, User, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

// Lazy load heavy components
const DNAAnalysis = React.lazy(() => import('../../components/genomics/DNAAnalysis'));
const PharmacogenomicTesting = React.lazy(() => import('../../components/genomics/PharmacogenomicTesting'));
const PrecisionMedicineRecommendations = React.lazy(() => import('../../components/medicine/PrecisionMedicineRecommendations'));
const CustomMedicationDosing = React.lazy(() => import('../../components/medicine/CustomMedicationDosing'));
const TherapyOptimization = React.lazy(() => import('../../components/therapy/TherapyOptimization'));
const PrecisionNutrition = React.lazy(() => import('../../components/nutrition/PrecisionNutrition'));
const PersonalizedExercise = React.lazy(() => import('../../components/exercise/PersonalizedExercise'));

interface GenomicProfile {
  hasDNAData: boolean;
  ancestry: {
    mexican: number;
    indigenous: number;
    european: number;
    other: number;
  };
  healthPredispositions: Array<{
    condition: string;
    risk: 'low' | 'moderate' | 'high';
    confidence: number;
    geneVariants: string[];
  }>;
  pharmacogenomics: Array<{
    medication: string;
    metabolism: 'poor' | 'intermediate' | 'normal' | 'rapid' | 'ultrarapid';
    recommendation: string;
    confidence: number;
  }>;
  nutritionalNeeds: {
    vitaminD: 'low' | 'normal' | 'high';
    folate: 'low' | 'normal' | 'high';
    caffeine: 'slow' | 'normal' | 'fast';
    lactose: 'tolerant' | 'intolerant';
  };
}

const PERSONALIZED_MEDICINE_FEATURES = [
  {
    id: 'genomic_analysis',
    title: 'Análisis Genómico Completo',
    description: 'Secuenciación de ADN enfocada en salud con ancestría mexicana',
    icon: Dna,
    color: 'from-purple-500 to-indigo-500',
    benefits: [
      'Predisposición a enfermedades',
      'Respuesta a medicamentos',
      'Requerimientos nutricionales',
      'Planificación familiar'
    ],
    status: 'available',
    price: '$2,500 MXN'
  },
  {
    id: 'pharmacogenomics',
    title: 'Farmacogenómica Personalizada',
    description: 'Optimización de medicamentos basada en tu genética',
    icon: Pill,
    color: 'from-green-500 to-teal-500',
    benefits: [
      'Dosis personalizadas',
      'Evitar efectos adversos',
      'Máxima eficacia',
      'Monitoreo continuo'
    ],
    status: 'available',
    price: '$1,800 MXN'
  },
  {
    id: 'precision_nutrition',
    title: 'Nutrición de Precisión',
    description: 'Plan nutricional basado en genética y microbioma',
    icon: Target,
    color: 'from-orange-500 to-red-500',
    benefits: [
      'Metabolismo personalizado',
      'Intolerancias genéticas',
      'Suplementos específicos',
      'Objetivos de peso'
    ],
    status: 'available',
    price: '$1,200 MXN'
  },
  {
    id: 'precision_exercise',
    title: 'Ejercicio Personalizado',
    description: 'Rutinas optimizadas según tu genética y fisiología',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
    benefits: [
      'Tipo de fibra muscular',
      'Recuperación óptima',
      'Riesgo de lesiones',
      'Rendimiento máximo'
    ],
    status: 'available',
    price: '$900 MXN'
  },
  {
    id: 'therapy_optimization',
    title: 'Optimización Terapéutica',
    description: 'Tratamientos personalizados con IA y genómica',
    icon: Brain,
    color: 'from-pink-500 to-rose-500',
    benefits: [
      'Terapias dirigidas',
      'Predicción de respuesta',
      'Combinaciones óptimas',
      'Seguimiento inteligente'
    ],
    status: 'coming_soon',
    price: '$3,200 MXN'
  },
  {
    id: 'biomarker_monitoring',
    title: 'Monitoreo de Biomarcadores',
    description: 'Seguimiento continuo de marcadores de salud',
    icon: TestTube,
    color: 'from-yellow-500 to-amber-500',
    benefits: [
      'Análisis periódicos',
      'Tendencias de salud',
      'Alertas tempranas',
      'Ajustes dinámicos'
    ],
    status: 'beta',
    price: '$800 MXN/mes'
  }
];

const GENOMIC_INSIGHTS = {
  ancestry: {
    mexican: 65,
    indigenous: 25,
    european: 8,
    other: 2
  },
  healthPredispositions: [
    {
      condition: 'Diabetes Tipo 2',
      risk: 'moderate' as const,
      confidence: 89,
      geneVariants: ['TCF7L2', 'PPARG', 'KCNJ11']
    },
    {
      condition: 'Enfermedad Cardiovascular',
      risk: 'low' as const,
      confidence: 76,
      geneVariants: ['APOE', 'LPA']
    },
    {
      condition: 'Hipertensión',
      risk: 'high' as const,
      confidence: 92,
      geneVariants: ['AGT', 'CYP11B2', 'ADD1']
    }
  ],
  pharmacogenomics: [
    {
      medication: 'Warfarina',
      metabolism: 'intermediate' as const,
      recommendation: 'Dosis reducida con monitoreo frecuente',
      confidence: 95
    },
    {
      medication: 'Clopidogrel',
      metabolism: 'poor' as const,
      recommendation: 'Considerar alternativa (Prasugrel)',
      confidence: 88
    },
    {
      medication: 'Metformina',
      metabolism: 'normal' as const,
      recommendation: 'Dosis estándar apropiada',
      confidence: 91
    }
  ]
};

export default function PersonalizedMedicineHub() {
  const { user } = useAuth();
  const [genomicProfile, setGenomicProfile] = useState<GenomicProfile | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGenomicProfile();
  }, [user]);

  const loadGenomicProfile = async () => {
    try {
      setIsLoading(true);
      
      // Simulate loading genomic data
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGenomicProfile({
        hasDNAData: true,
        ancestry: GENOMIC_INSIGHTS.ancestry,
        healthPredispositions: GENOMIC_INSIGHTS.healthPredispositions,
        pharmacogenomics: GENOMIC_INSIGHTS.pharmacogenomics,
        nutritionalNeeds: {
          vitaminD: 'low',
          folate: 'high',
          caffeine: 'slow',
          lactose: 'intolerant'
        }
      });
    } catch (error) {
      console.error('Error loading genomic profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMetabolismColor = (metabolism: string) => {
    switch (metabolism) {
      case 'poor': return 'text-red-600 bg-red-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'normal': return 'text-green-600 bg-green-100';
      case 'rapid': return 'text-blue-600 bg-blue-100';
      case 'ultrarapid': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Disponible</Badge>;
      case 'beta':
        return <Badge variant="warning">Beta</Badge>;
      case 'coming_soon':
        return <Badge variant="secondary">Próximamente</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando tu perfil de medicina personalizada...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Medicina Personalizada | Genómica y terapias de precisión"
        description="Plataforma de medicina personalizada con análisis genómico, farmacogenómica, nutrición de precisión y terapias optimizadas para tu perfil único."
        canonical="/personalized-medicine"
        keywords="medicina personalizada, genómica, farmacogenómica, nutrición precisión, terapias dirigidas, análisis ADN"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6"
            >
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
                  Medicina
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {" "}Personalizada
                  </span>
                </h1>
              </div>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Revoluciona tu salud con terapias de precisión basadas en tu código genético único, 
                optimizadas para la población mexicana.
              </p>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Certificado COFEPRIS</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Estándares Internacionales</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  <span>Contexto Cultural Mexicano</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Genomic Overview */}
          {genomicProfile && (
            <section className="mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Tu Perfil Genómico
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Insights personalizados basados en tu ancestría mexicana
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Ancestry */}
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-purple-600" />
                    Ancestría Genética
                  </h3>
                  
                  <div className="space-y-3">
                    {Object.entries(genomicProfile.ancestry).map(([ancestry, percentage]) => (
                      <div key={ancestry} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                          {ancestry === 'mexican' ? 'Mexicana' : 
                           ancestry === 'indigenous' ? 'Indígena' :
                           ancestry === 'european' ? 'Europea' : 'Otra'}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Health Predispositions */}
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TestTube className="w-5 h-5 mr-2 text-blue-600" />
                    Predisposiciones
                  </h3>
                  
                  <div className="space-y-3">
                    {genomicProfile.healthPredispositions.map((predisposition, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {predisposition.condition}
                          </span>
                          <Badge className={getRiskColor(predisposition.risk)}>
                            {predisposition.risk === 'low' ? 'Bajo' :
                             predisposition.risk === 'moderate' ? 'Moderado' : 'Alto'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Confianza: {predisposition.confidence}% • Genes: {predisposition.geneVariants.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Pharmacogenomics */}
                <Card className="p-6 bg-white dark:bg-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Pill className="w-5 h-5 mr-2 text-green-600" />
                    Farmacogenómica
                  </h3>
                  
                  <div className="space-y-3">
                    {genomicProfile.pharmacogenomics.map((pharma, index) => (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {pharma.medication}
                          </span>
                          <Badge className={getMetabolismColor(pharma.metabolism)}>
                            {pharma.metabolism === 'poor' ? 'Lento' :
                             pharma.metabolism === 'intermediate' ? 'Intermedio' :
                             pharma.metabolism === 'normal' ? 'Normal' :
                             pharma.metabolism === 'rapid' ? 'Rápido' : 'Muy Rápido'}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {pharma.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>
          )}

          {/* Personalized Medicine Features */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Servicios de Medicina Personalizada
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Terapias de precisión diseñadas específicamente para ti
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {PERSONALIZED_MEDICINE_FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                  className="group"
                >
                  <Card className="p-6 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
                        onClick={() => setSelectedFeature(feature.id)}>
                    <div className="space-y-4">
                      {/* Icon and Status */}
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                          <feature.icon className="w-6 h-6 text-white" />
                        </div>
                        {getStatusBadge(feature.status)}
                      </div>

                      {/* Title and Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {feature.description}
                        </p>
                      </div>

                      {/* Benefits */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Beneficios:
                        </h4>
                        <ul className="space-y-1">
                          {feature.benefits.slice(0, 3).map((benefit, i) => (
                            <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Price and Action */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-lg font-bold text-purple-600">
                          {feature.price}
                        </div>
                        <Button
                          size="sm"
                          className={`${feature.status === 'available' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'} text-white`}
                          disabled={feature.status !== 'available'}
                        >
                          {feature.status === 'available' ? 'Solicitar' : 
                           feature.status === 'beta' ? 'Beta' : 'Próximamente'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Feature Details Modal/Section */}
          {selectedFeature && (
            <section className="mt-16">
              <Card className="p-8 bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Detalles del Servicio
                  </h3>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFeature(null)}
                  >
                    Cerrar
                  </Button>
                </div>

                <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse"></div>}>
                  {selectedFeature === 'genomic_analysis' && <DNAAnalysis />}
                  {selectedFeature === 'pharmacogenomics' && <PharmacogenomicTesting />}
                  {selectedFeature === 'precision_nutrition' && <PrecisionNutrition />}
                  {selectedFeature === 'precision_exercise' && <PersonalizedExercise />}
                  {selectedFeature === 'therapy_optimization' && <TherapyOptimization />}
                </Suspense>
              </Card>
            </section>
          )}
        </div>
      </div>
    </>
  );
}