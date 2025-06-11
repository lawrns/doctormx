import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Brain, Heart, Activity, TrendingUp, 
  Family, Globe, Dna, Calendar, Camera, Edit2, 
  Save, AlertTriangle, CheckCircle, Award, Target,
  Pill, Stethoscope, Users, MapPin, Clock, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/seo/SEO';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import SimpleTabs from '../../components/ui/SimpleTabs';
import PersonalizedHealthService, { HealthProfile, PersonalizedRecommendations } from '../../services/health/PersonalizedHealthService';

// Lazy load heavy components
const BiometricAuth = React.lazy(() => import('../../components/auth/BiometricAuth'));
const DigitalHealthID = React.lazy(() => import('../../components/health/DigitalHealthID'));
const FamilyHealthTree = React.lazy(() => import('../../components/family/FamilyHealthTree'));
const GenomicInsights = React.lazy(() => import('../../components/genomics/GenomicInsights'));
const SocialHealthFactors = React.lazy(() => import('../../components/social/SocialHealthFactors'));
const PredictiveHealthAnalytics = React.lazy(() => import('../../components/analytics/PredictiveHealthAnalytics'));
const HealthGoalsTracker = React.lazy(() => import('../../components/goals/HealthGoalsTracker'));
const CulturalHealthBeliefs = React.lazy(() => import('../../components/cultural/CulturalHealthBeliefs'));

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface RiskFactor {
  condition: string;
  currentRisk: number;
  projectedRisk: number;
  timeframe: string;
  modifiable: boolean;
  interventions: string[];
}

const HEALTH_METRICS: HealthMetric[] = [
  {
    id: 'health_score',
    name: 'Puntuación de Salud',
    value: 85,
    unit: '/100',
    status: 'good',
    trend: 'up',
    lastUpdated: new Date()
  },
  {
    id: 'cardiovascular_risk',
    name: 'Riesgo Cardiovascular',
    value: 12,
    unit: '%',
    status: 'good',
    trend: 'stable',
    lastUpdated: new Date()
  },
  {
    id: 'diabetes_risk',
    name: 'Riesgo de Diabetes',
    value: 18,
    unit: '%',
    status: 'warning',
    trend: 'up',
    lastUpdated: new Date()
  },
  {
    id: 'mental_wellbeing',
    name: 'Bienestar Mental',
    value: 78,
    unit: '/100',
    status: 'good',
    trend: 'stable',
    lastUpdated: new Date()
  }
];

const RISK_FACTORS: RiskFactor[] = [
  {
    condition: 'Diabetes Tipo 2',
    currentRisk: 15,
    projectedRisk: 25,
    timeframe: '10 años',
    modifiable: true,
    interventions: ['Ejercicio regular', 'Dieta mediterránea', 'Control de peso']
  },
  {
    condition: 'Hipertensión',
    currentRisk: 22,
    projectedRisk: 18,
    timeframe: '5 años',
    modifiable: true,
    interventions: ['Reducir sodio', 'Actividad física', 'Manejo de estrés']
  },
  {
    condition: 'Enfermedad Cardíaca',
    currentRisk: 8,
    projectedRisk: 12,
    timeframe: '15 años',
    modifiable: true,
    interventions: ['No fumar', 'Ejercicio cardiovascular', 'Dieta saludable']
  }
];

export default function ComprehensiveHealthProfile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [profileData, setProfileData] = useState({
    personalInfo: {
      fullName: user?.user_metadata?.fullName || '',
      birthDate: user?.user_metadata?.birthDate || '',
      gender: user?.user_metadata?.gender || '',
      bloodType: user?.user_metadata?.bloodType || '',
      phone: user?.user_metadata?.phone || '',
      occupation: user?.user_metadata?.occupation || '',
      education: user?.user_metadata?.education || ''
    },
    medicalInfo: {
      chronicConditions: user?.user_metadata?.chronicConditions || [],
      medications: user?.user_metadata?.medications || [],
      allergies: user?.user_metadata?.allergies || [],
      surgeries: user?.user_metadata?.surgeries || [],
      familyHistory: user?.user_metadata?.familyHistory || []
    },
    lifestyle: {
      diet: user?.user_metadata?.diet || '',
      exercise: user?.user_metadata?.exercise || '',
      smoking: user?.user_metadata?.smoking || false,
      alcohol: user?.user_metadata?.alcohol || '',
      sleep: user?.user_metadata?.sleep || 8,
      stress: user?.user_metadata?.stress || ''
    },
    cultural: {
      traditionalMedicine: user?.user_metadata?.traditionalMedicine || false,
      religiousConsiderations: user?.user_metadata?.religiousConsiderations || [],
      familyDecisionMaking: user?.user_metadata?.familyDecisionMaking || true,
      healthBeliefs: user?.user_metadata?.healthBeliefs || []
    }
  });

  useEffect(() => {
    loadHealthProfile();
  }, [user]);

  const loadHealthProfile = async () => {
    try {
      setIsLoading(true);
      
      if (user) {
        const healthService = PersonalizedHealthService.getInstance();
        
        // Create health profile from user data
        const profile: HealthProfile = {
          userId: user.id,
          demographics: {
            age: calculateAge(profileData.personalInfo.birthDate),
            gender: profileData.personalInfo.gender,
            ethnicity: 'mexican',
            location: {
              state: 'CDMX',
              city: 'Ciudad de México',
              coordinates: { lat: 19.4326, lng: -99.1332 }
            },
            socioeconomicStatus: 'medium',
            education: profileData.personalInfo.education,
            occupation: profileData.personalInfo.occupation
          },
          familyHistory: {
            conditions: profileData.medicalInfo.familyHistory,
            geneticRisks: [],
            longevityFactors: []
          },
          lifestyle: {
            diet: profileData.lifestyle.diet,
            exercise: profileData.lifestyle.exercise,
            smoking: profileData.lifestyle.smoking,
            alcohol: profileData.lifestyle.alcohol,
            sleep: profileData.lifestyle.sleep,
            stress: profileData.lifestyle.stress
          },
          currentHealth: {
            chronicConditions: profileData.medicalInfo.chronicConditions,
            medications: profileData.medicalInfo.medications,
            allergies: profileData.medicalInfo.allergies,
            recentSymptoms: [],
            vitalSigns: {
              bloodPressure: { systolic: 120, diastolic: 80 },
              heartRate: 72,
              weight: 70,
              height: 170,
              bmi: 24.2
            }
          },
          culturalFactors: {
            traditionalMedicineUse: profileData.cultural.traditionalMedicine,
            religiousConsiderations: profileData.cultural.religiousConsiderations,
            familyHealthDecisionMaking: profileData.cultural.familyDecisionMaking,
            languagePreference: 'es-MX',
            healthBeliefs: profileData.cultural.healthBeliefs
          }
        };

        setHealthProfile(profile);
        
        // Generate personalized recommendations
        const recs = await healthService.generatePersonalizedRecommendations(profile);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Error loading health profile:', error);
      showToast('Error cargando perfil de salud', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 30; // Default
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update user profile in Supabase
      await updateProfile({
        ...profileData.personalInfo,
        ...profileData.medicalInfo,
        ...profileData.lifestyle,
        ...profileData.cultural
      });

      // Reload health profile with updated data
      await loadHealthProfile();
      
      setIsEditing(false);
      showToast('Perfil actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('Error guardando perfil', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen General', icon: User },
    { id: 'predictive', label: 'Análisis Predictivo', icon: Brain },
    { id: 'genomics', label: 'Genómica', icon: Dna },
    { id: 'family', label: 'Salud Familiar', icon: Users },
    { id: 'social', label: 'Factores Sociales', icon: Globe },
    { id: 'cultural', label: 'Contexto Cultural', icon: Heart }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando tu perfil de salud integral...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Perfil de Salud Integral | Análisis predictivo y genómica personalizada"
        description="Tu perfil de salud completo con análisis predictivo, genómica, factores sociales y contexto cultural mexicano para medicina personalizada."
        canonical="/profile/comprehensive"
        keywords="perfil salud integral, análisis predictivo salud, genómica personalizada, medicina familiar, factores sociales salud"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profileData.personalInfo.fullName || 'Tu Perfil de Salud'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Plataforma de Salud Personalizada con IA
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Suspense fallback={<div className="w-10 h-6 bg-gray-200 rounded animate-pulse"></div>}>
                  <BiometricAuth 
                    onAuth={(success) => {
                      if (success) {
                        showToast('Autenticación biométrica exitosa', 'success');
                      }
                    }}
                  />
                </Suspense>

                {isEditing ? (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Health Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {HEALTH_METRICS.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-4 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                      {metric.status === 'optimal' && '🎯'}
                      {metric.status === 'good' && '✅'}
                      {metric.status === 'warning' && '⚠️'}
                      {metric.status === 'critical' && '🚨'}
                      <span className="ml-1 capitalize">{metric.status}</span>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {metric.name}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Actualizado: {metric.lastUpdated.toLocaleDateString()}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content with Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <SimpleTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              className="border-b border-gray-200 dark:border-gray-700"
            />

            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Información Personal
                      </h3>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre Completo
                          </label>
                          {isEditing ? (
                            <Input
                              value={profileData.personalInfo.fullName}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                              }))}
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              {profileData.personalInfo.fullName || 'No especificado'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha de Nacimiento
                          </label>
                          {isEditing ? (
                            <Input
                              type="date"
                              value={profileData.personalInfo.birthDate}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, birthDate: e.target.value }
                              }))}
                            />
                          ) : (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              {profileData.personalInfo.birthDate 
                                ? new Date(profileData.personalInfo.birthDate).toLocaleDateString()
                                : 'No especificado'
                              }
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tipo de Sangre
                          </label>
                          {isEditing ? (
                            <select
                              value={profileData.personalInfo.bloodType}
                              onChange={(e) => setProfileData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, bloodType: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="">Seleccionar</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          ) : (
                            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              {profileData.personalInfo.bloodType || 'No especificado'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors Analysis */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                        Análisis de Factores de Riesgo
                      </h3>
                      
                      <div className="space-y-4">
                        {RISK_FACTORS.map((risk, index) => (
                          <div key={risk.condition} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {risk.condition}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant={risk.modifiable ? 'success' : 'secondary'}>
                                  {risk.modifiable ? 'Modificable' : 'No Modificable'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Riesgo Actual</div>
                                <div className="text-xl font-bold text-orange-600">{risk.currentRisk}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Proyección ({risk.timeframe})</div>
                                <div className={`text-xl font-bold ${
                                  risk.projectedRisk > risk.currentRisk ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {risk.projectedRisk}%
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Intervenciones</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {risk.interventions.slice(0, 2).map((intervention, i) => (
                                    <Badge key={i} variant="outline" size="sm">
                                      {intervention}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Personalized Recommendations */}
                    {recommendations && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-green-600" />
                          Recomendaciones Personalizadas
                        </h3>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                          <Card className="p-4 border-red-200 bg-red-50 dark:bg-red-900/10">
                            <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center">
                              <Zap className="w-4 h-4 mr-1" />
                              Inmediatas
                            </h4>
                            <ul className="space-y-1 text-sm text-red-800 dark:text-red-200">
                              {recommendations.immediate.actions.slice(0, 3).map((action, i) => (
                                <li key={i} className="flex items-start">
                                  <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </Card>

                          <Card className="p-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                            <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Corto Plazo
                            </h4>
                            <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                              {recommendations.shortTerm.goals.slice(0, 3).map((goal, i) => (
                                <li key={i} className="flex items-start">
                                  <Target className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </Card>

                          <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-900/10">
                            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center">
                              <Shield className="w-4 h-4 mr-1" />
                              Largo Plazo
                            </h4>
                            <ul className="space-y-1 text-sm text-green-800 dark:text-green-200">
                              {recommendations.longTerm.prevention.slice(0, 3).map((prevention, i) => (
                                <li key={i} className="flex items-start">
                                  <Heart className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                                  {prevention}
                                </li>
                              ))}
                            </ul>
                          </Card>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'predictive' && (
                  <motion.div
                    key="predictive"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse"></div>}>
                      <PredictiveHealthAnalytics 
                        healthProfile={healthProfile}
                        onPredictionUpdate={(prediction) => {
                          console.log('Prediction updated:', prediction);
                        }}
                      />
                    </Suspense>
                  </motion.div>
                )}

                {activeTab === 'genomics' && (
                  <motion.div
                    key="genomics"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse"></div>}>
                      <GenomicInsights 
                        userId={user?.id}
                        ethnicity="mexican"
                        onGenomicUpdate={(data) => {
                          console.log('Genomic data updated:', data);
                        }}
                      />
                    </Suspense>
                  </motion.div>
                )}

                {activeTab === 'family' && (
                  <motion.div
                    key="family"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse"></div>}>
                      <FamilyHealthTree 
                        userId={user?.id}
                        onFamilyUpdate={(familyData) => {
                          console.log('Family health updated:', familyData);
                        }}
                      />
                    </Suspense>
                  </motion.div>
                )}

                {activeTab === 'social' && (
                  <motion.div
                    key="social"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse"></div>}>
                      <SocialHealthFactors 
                        userId={user?.id}
                        location={healthProfile?.demographics.location}
                        onSocialUpdate={(socialData) => {
                          console.log('Social health updated:', socialData);
                        }}
                      />
                    </Suspense>
                  </motion.div>
                )}

                {activeTab === 'cultural' && (
                  <motion.div
                    key="cultural"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Suspense fallback={<div className="h-64 bg-gray-200 rounded animate-pulse"></div>}>
                      <CulturalHealthBeliefs 
                        userId={user?.id}
                        culturalContext={healthProfile?.culturalFactors}
                        onCulturalUpdate={(culturalData) => {
                          console.log('Cultural health updated:', culturalData);
                        }}
                      />
                    </Suspense>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Digital Health ID */}
          <div className="mt-8">
            <Suspense fallback={<div className="h-32 bg-gray-200 rounded animate-pulse"></div>}>
              <DigitalHealthID 
                userId={user?.id}
                healthProfile={healthProfile}
                onIDUpdate={(idData) => {
                  console.log('Digital health ID updated:', idData);
                }}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}