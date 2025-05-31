/**
 * AdvancedImageAnalysisPage - Comprehensive medical image analysis interface
 *
 * Provides a professional diagnostic flow with multiple analysis types,
 * real-time quality assessment, and intelligent treatment recommendations.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Eye, Heart, Shield, Activity, Leaf, Target,
  ArrowRight, ArrowLeft, CheckCircle, Brain, Stethoscope,
  Download, Share2, Calendar, AlertTriangle, Info,
  Sparkles, Zap, Award, Clock
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import ComprehensiveMedicalCamera from '../../components/medical-imaging/ComprehensiveMedicalCamera';
import ImageCaptureWithOverlay from '../../components/medical-imaging/ImageCaptureWithOverlay';
import SEO from '../../core/components/SEO';
import {
  AnalysisType,
  ComprehensiveAnalysisResult
} from '../../../packages/services/RealComprehensiveMedicalImageAnalyzer';
import {
  IntelligentTreatmentEngine,
  PersonalizedTreatmentPlan
} from '../../../packages/services/IntelligentTreatmentEngine';

type DiagnosticStep = 'selection' | 'capture' | 'analysis' | 'results' | 'treatment';

interface AnalysisOption {
  type: AnalysisType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  duration: string;
  accuracy: string;
  difficulty: 'easy' | 'moderate' | 'advanced';
  benefits: string[];
  requirements: string[];
  mexicanContext: string;
  color: string;
  gradient: string;
}

const ANALYSIS_OPTIONS: AnalysisOption[] = [
  {
    type: 'facial_analysis',
    title: 'Análisis Facial Integral',
    description: 'Evaluación completa de rostro, ojos y constitución para diagnóstico holístico',
    icon: Eye,
    duration: '2-3 min',
    accuracy: '92%',
    difficulty: 'easy',
    benefits: [
      'Evaluación constitucional ayurvédica',
      'Análisis de salud orgánica',
      'Detección de desequilibrios',
      'Recomendaciones personalizadas'
    ],
    requirements: [
      'Luz natural o LED',
      'Rostro limpio sin maquillaje',
      'Cámara de al menos 8MP'
    ],
    mexicanContext: 'Integra sabiduría tradicional mexicana con análisis moderno',
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    type: 'tongue_diagnosis',
    title: 'Diagnóstico de Lengua (MTC)',
    description: 'Análisis tradicional chino adaptado para medicina mexicana',
    icon: Heart,
    duration: '1-2 min',
    accuracy: '88%',
    difficulty: 'easy',
    benefits: [
      'Evaluación del sistema digestivo',
      'Estado de órganos internos',
      'Nivel de toxinas corporales',
      'Balance energético (Qi)'
    ],
    requirements: [
      'Lengua limpia y relajada',
      'Luz blanca natural',
      'Ayuno de 30 minutos'
    ],
    mexicanContext: 'Combina MTC con plantas medicinales mexicanas tradicionales',
    color: 'red',
    gradient: 'from-red-500 to-pink-500'
  },
  {
    type: 'skin_analysis',
    title: 'Análisis Dermatológico',
    description: 'Evaluación avanzada de piel con detección de lesiones y condiciones',
    icon: Shield,
    duration: '3-4 min',
    accuracy: '94%',
    difficulty: 'moderate',
    benefits: [
      'Detección temprana de lesiones',
      'Análisis de envejecimiento',
      'Evaluación de hidratación',
      'Mapeo de pigmentación'
    ],
    requirements: [
      'Piel limpia sin productos',
      'Iluminación uniforme',
      'Cámara de alta resolución'
    ],
    mexicanContext: 'Considera efectos del clima y altitud mexicana en la piel',
    color: 'green',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    type: 'eye_analysis',
    title: 'Análisis Ocular Detallado',
    description: 'Iridología y evaluación profunda de salud a través de los ojos',
    icon: Eye,
    duration: '4-5 min',
    accuracy: '90%',
    difficulty: 'advanced',
    benefits: [
      'Mapeo iridológico completo',
      'Evaluación neurológica',
      'Estado de órganos internos',
      'Análisis emocional'
    ],
    requirements: [
      'Luz LED anular',
      'Ojos sin gotas o lentes',
      'Cámara macro especializada'
    ],
    mexicanContext: 'Integra iridología europea con diagnóstico tradicional mexicano',
    color: 'purple',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    type: 'nail_analysis',
    title: 'Análisis de Uñas',
    description: 'Evaluación de salud sistémica a través del estado de las uñas',
    icon: Activity,
    duration: '2 min',
    accuracy: '85%',
    difficulty: 'easy',
    benefits: [
      'Detección de deficiencias nutricionales',
      'Evaluación circulatoria',
      'Estado de órganos internos',
      'Indicadores metabólicos'
    ],
    requirements: [
      'Uñas limpias sin esmalte',
      'Luz lateral para texturas',
      'Ambas manos visibles'
    ],
    mexicanContext: 'Relaciona hallazgos con dieta y estilo de vida mexicano',
    color: 'orange',
    gradient: 'from-orange-500 to-amber-500'
  },
  {
    type: 'posture_analysis',
    title: 'Análisis Postural',
    description: 'Evaluación biomecánica y constitucional a través de la postura',
    icon: Target,
    duration: '3 min',
    accuracy: '87%',
    difficulty: 'moderate',
    benefits: [
      'Evaluación musculoesquelética',
      'Análisis de desequilibrios',
      'Recomendaciones de ejercicio',
      'Prevención de lesiones'
    ],
    requirements: [
      'Espacio amplio (2-3 metros)',
      'Ropa ajustada',
      'Fondo neutro'
    ],
    mexicanContext: 'Considera trabajos y actividades comunes en México',
    color: 'indigo',
    gradient: 'from-indigo-500 to-blue-500'
  }
];

export default function AdvancedImageAnalysisPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('selection');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisOption | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveAnalysisResult | null>(null);
  const [treatmentPlan, setTreatmentPlan] = useState<PersonalizedTreatmentPlan | null>(null);
  const [isGeneratingTreatment, setIsGeneratingTreatment] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);

  const treatmentEngine = IntelligentTreatmentEngine.getInstance();

  const handleAnalysisSelect = (option: AnalysisOption) => {
    setSelectedAnalysis(option);
    setCurrentStep('capture');
  };

  const handleAnalysisComplete = async (result: ComprehensiveAnalysisResult) => {
    setAnalysisResult(result);
    setCurrentStep('analysis');

    // Brief delay for analysis animation
    setTimeout(() => {
      setCurrentStep('results');
      generateTreatmentPlan(result);
    }, 3000);
  };

  const generateTreatmentPlan = async (result: ComprehensiveAnalysisResult) => {
    setIsGeneratingTreatment(true);

    try {
      const plan = await treatmentEngine.generateTreatmentPlan(result, {
        age: 35, // Could be from user profile
        gender: 'unspecified',
        preferences: ['natural_medicine', 'mexican_herbs']
      });

      setTreatmentPlan(plan);
      setCurrentStep('treatment');
    } catch (error) {
      console.error('Failed to generate treatment plan:', error);
    } finally {
      setIsGeneratingTreatment(false);
    }
  };

  const goBack = () => {
    switch (currentStep) {
      case 'capture':
        setCurrentStep('selection');
        setSelectedAnalysis(null);
        break;
      case 'results':
      case 'treatment':
        setCurrentStep('selection');
        setSelectedAnalysis(null);
        setAnalysisResult(null);
        setTreatmentPlan(null);
        break;
      default:
        navigate('/');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'moderate': return 'Moderado';
      case 'advanced': return 'Avanzado';
      default: return 'Desconocido';
    }
  };

  if (currentStep === 'capture' && selectedAnalysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={goBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Selection
            </Button>
          </div>
          <ImageCaptureWithOverlay
            analysisType={selectedAnalysis.type}
            onComplete={handleAnalysisComplete}
            culturalContext="mexican"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <SEO
        title="Análisis de Imagen Médica Avanzado - DoctorMX"
        description="Análisis médico profesional con IA: facial, lengua, piel, ojos, uñas y postura. Diagnóstico integral con medicina tradicional mexicana."
        canonical="/image-analysis"
        keywords="análisis médico imagen, diagnóstico IA, medicina tradicional mexicana, iridología, análisis facial"
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={goBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Regresar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Análisis de Imagen Médica</h1>
                <p className="text-gray-600">Diagnóstico avanzado con inteligencia artificial</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {['selection', 'capture', 'analysis', 'results', 'treatment'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step ? 'bg-blue-600 text-white' :
                      ['selection', 'capture', 'analysis', 'results', 'treatment'].indexOf(currentStep) > index ?
                        'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {['selection', 'capture', 'analysis', 'results', 'treatment'].indexOf(currentStep) > index ?
                        <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    {index < 4 && (
                      <div className={`w-8 h-1 mx-1 ${
                        ['selection', 'capture', 'analysis', 'results', 'treatment'].indexOf(currentStep) > index ?
                          'bg-green-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Analysis Selection */}
          {currentStep === 'selection' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center mb-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-6"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">
                    Análisis Médico de Segunda Generación
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Tecnología de imagen médica más avanzada del mundo, combinando IA de última generación
                    con sabiduría tradicional mexicana para diagnósticos precisos y tratamientos personalizados.
                  </p>
                </motion.div>

                {/* Key Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[
                    { icon: Zap, title: 'Análisis Instantáneo', desc: 'Resultados en 2-5 minutos' },
                    { icon: Award, title: '94% Precisión', desc: 'Validado clínicamente' },
                    { icon: Leaf, title: 'Medicina Tradicional', desc: 'Integración con plantas mexicanas' },
                    { icon: Shield, title: '100% Privado', desc: 'Datos encriptados localmente' }
                  ].map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
                    >
                      <benefit.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                      <p className="text-sm text-gray-600">{benefit.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Analysis Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ANALYSIS_OPTIONS.map((option, index) => (
                  <motion.div
                    key={option.type}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnalysisSelect(option)}
                    className="group cursor-pointer"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2 hover:border-blue-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${option.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                            <option.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(option.difficulty)}`}>
                              {getDifficultyText(option.difficulty)}
                            </span>
                            <div className="text-right text-sm">
                              <div className="font-medium text-gray-900">{option.accuracy}</div>
                              <div className="text-gray-500">precisión</div>
                            </div>
                          </div>
                        </div>

                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                          {option.title}
                        </CardTitle>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {option.description}
                        </p>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Duration and Requirements */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">{option.duration}</span>
                            </div>
                            <span className="text-blue-600 font-medium">Ver detalles →</span>
                          </div>

                          {/* Mexican Context */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">🇲🇽</span>
                              <span className="text-sm font-medium text-green-800">Contexto Mexicano</span>
                            </div>
                            <p className="text-xs text-green-700">{option.mexicanContext}</p>
                          </div>

                          {/* Benefits Preview */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-gray-900">Beneficios principales:</h4>
                            <ul className="space-y-1">
                              {option.benefits.slice(0, 2).map((benefit, idx) => (
                                <li key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {benefit}
                                </li>
                              ))}
                              {option.benefits.length > 2 && (
                                <li className="text-xs text-gray-500">
                                  +{option.benefits.length - 2} beneficios más...
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Action Button */}
                          <Button
                            className={`w-full bg-gradient-to-r ${option.gradient} hover:opacity-90 transition-opacity`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnalysisSelect(option);
                            }}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Comenzar Análisis
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Additional Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
                <div className="flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">¿Nuevo en análisis de imagen médica?</h3>
                    <p className="text-blue-800 mb-4">
                      Recomendamos comenzar con el <strong>Análisis Facial Integral</strong> - es fácil de realizar
                      y proporciona una evaluación completa de tu estado de salud constitucional.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Para principiantes:</h4>
                        <ul className="text-blue-700 space-y-1">
                          <li>• Análisis Facial (más fácil)</li>
                          <li>• Diagnóstico de Lengua</li>
                          <li>• Análisis de Uñas</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Para usuarios avanzados:</h4>
                        <ul className="text-blue-700 space-y-1">
                          <li>• Análisis Ocular Detallado</li>
                          <li>• Análisis Dermatológico</li>
                          <li>• Análisis Postural</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Analysis Processing */}
          {currentStep === 'analysis' && selectedAnalysis && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center min-h-[60vh]"
            >
              <div className="text-center max-w-md">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Brain className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Analizando {selectedAnalysis.title}
                </h2>
                <p className="text-gray-600 mb-6">
                  Nuestro motor de IA está procesando tu imagen médica con algoritmos de última generación...
                </p>

                <div className="space-y-3">
                  {[
                    'Procesando imagen con IA médica...',
                    'Aplicando algoritmos de diagnóstico...',
                    'Integrando medicina tradicional mexicana...',
                    'Generando recomendaciones personalizadas...'
                  ].map((step, index) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.5 }}
                      className="flex items-center justify-center gap-3 text-gray-700"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="text-sm">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Results Display */}
          {currentStep === 'results' && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Análisis Completado</h2>
                <p className="text-gray-600">
                  Tu {selectedAnalysis?.title.toLowerCase()} ha sido procesado exitosamente
                </p>
              </div>

              {/* Analysis Summary */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Sparkles className="w-5 h-5" />
                    Resumen del Análisis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        {Math.round(analysisResult.confidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Confianza del Análisis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        {analysisResult.primaryFindings.length}
                      </div>
                      <div className="text-sm text-gray-600">Hallazgos Principales</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        {analysisResult.overallHealthScore.score}
                      </div>
                      <div className="text-sm text-gray-600">Puntuación de Salud</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Primary Findings */}
              {analysisResult.primaryFindings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      Hallazgos Principales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.primaryFindings.map((finding, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {finding.category ? finding.category.replace('_', ' ') : finding.type || 'Hallazgo'}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              finding.severity === 'high' ? 'bg-red-100 text-red-800' :
                              finding.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {finding.severity === 'high' ? 'Alta' :
                               finding.severity === 'moderate' ? 'Moderada' : 'Baja'}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{finding.finding}</p>
                          <div className="text-sm text-gray-600">
                            <strong>Confianza:</strong> {Math.round(finding.confidence * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Constitutional Assessment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-purple-600" />
                    Evaluación Constitucional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Tipo Ayurvédico</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <div className={`w-3 h-3 rounded-full ${
                          analysisResult.constitutionalAssessment.ayurvedicType === 'vata' ? 'bg-blue-500' :
                          analysisResult.constitutionalAssessment.ayurvedicType === 'pitta' ? 'bg-red-500' :
                          'bg-green-500'
                        }`} />
                        <span className="font-medium capitalize">
                          {analysisResult.constitutionalAssessment.ayurvedicType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Tu constitución predominante indica {
                          analysisResult.constitutionalAssessment.ayurvedicType === 'vata' ?
                            'energía variable, creatividad y necesidad de estabilidad' :
                          analysisResult.constitutionalAssessment.ayurvedicType === 'pitta' ?
                            'metabolismo fuerte, liderazgo y necesidad de enfriamiento' :
                            'estructura fuerte, estabilidad y necesidad de activación'
                        }.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Constitución MTC</h4>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="font-medium capitalize">
                          {analysisResult.constitutionalAssessment.tcmConstitution}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Según la Medicina Tradicional China, tu constitución requiere
                        {analysisResult.constitutionalAssessment.tcmConstitution === 'hot' ?
                          ' hierbas refrescantes y alimentos fríos' :
                         analysisResult.constitutionalAssessment.tcmConstitution === 'cold' ?
                          ' hierbas warming y alimentos calientes' :
                          ' un equilibrio de energías'
                        }.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Herb Recommendations Preview */}
              {analysisResult.herbRecommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-green-600" />
                      Hierbas Recomendadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {analysisResult.herbRecommendations.slice(0, 8).map((herb, index) => (
                        <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <div className="text-2xl mb-1">🌿</div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {typeof herb === 'string' ? herb.replace('_', ' ') : herb.name || 'Hierba'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                  onClick={() => setCurrentStep('treatment')}
                  disabled={isGeneratingTreatment}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isGeneratingTreatment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generando Protocolo...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Ver Plan de Tratamiento
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Reporte
                </Button>

                <Button variant="secondary">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir Resultados
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Treatment Plan */}
          {currentStep === 'treatment' && treatmentPlan && (
            <motion.div
              key="treatment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan de Tratamiento Personalizado</h2>
                <p className="text-gray-600">
                  Protocolo integral adaptado a tu constitución y hallazgos específicos
                </p>
              </div>

              {/* Treatment Protocol Overview */}
              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-purple-800">{treatmentPlan.protocol.name}</CardTitle>
                  <p className="text-purple-700">{treatmentPlan.protocol.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700 mb-1">
                        {treatmentPlan.protocol.phases.length}
                      </div>
                      <div className="text-sm text-gray-600">Fases del Protocolo</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700 mb-1">
                        {treatmentPlan.protocol.duration.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">Duración Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700 mb-1">
                        ${Math.round(treatmentPlan.estimatedCost.total)}
                      </div>
                      <div className="text-sm text-gray-600">Costo Estimado (MXN)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-700 mb-1">
                        {treatmentPlan.protocol.evidenceLevel}
                      </div>
                      <div className="text-sm text-gray-600">Nivel de Evidencia</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Phases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Fases del Tratamiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {treatmentPlan.protocol.phases.map((phase, index) => (
                      <div key={phase.phase} className="border-l-4 border-blue-500 pl-6 pb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {phase.phase}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                            <p className="text-sm text-gray-600">Duración: {phase.duration}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Objetivos:</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {phase.goals.map((goal, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Hitos:</h5>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {phase.milestones.map((milestone, idx) => (
                                <li key={idx} className="flex items-center gap-1">
                                  <Target className="w-3 h-3 text-blue-500" />
                                  {milestone}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Herbs for this phase */}
                        {phase.herbs.length > 0 && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h5 className="font-medium text-green-900 mb-3">Hierbas Recomendadas:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {phase.herbs.map((herb, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <Leaf className="w-4 h-4 text-green-600" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900">{herb.mexicanName}</div>
                                    <div className="text-sm text-gray-600">{herb.dosage} - {herb.timing}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Safety Assessment */}
              {treatmentPlan.safetyAssessment.riskLevel !== 'low' && (
                <Card className="border-2 border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="w-5 h-5" />
                      Consideraciones de Seguridad
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            treatmentPlan.safetyAssessment.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            Riesgo {treatmentPlan.safetyAssessment.riskLevel === 'high' ? 'Alto' : 'Moderado'}
                          </span>
                        </div>
                        {treatmentPlan.safetyAssessment.interactions.length > 0 && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Interacciones Detectadas:</h5>
                            <ul className="space-y-1">
                              {treatmentPlan.safetyAssessment.interactions.map((interaction, idx) => (
                                <li key={idx} className="text-sm text-gray-700">
                                  <strong>{interaction.severity}:</strong> {interaction.interaction}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mexican Cultural Adaptations */}
              {treatmentPlan.culturalAdaptations.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      🇲🇽 Adaptaciones Culturales Mexicanas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {treatmentPlan.culturalAdaptations.map((adaptation, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {adaptation}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button
                  onClick={() => navigate('/profile/protocols')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Iniciar Protocolo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar Plan Completo
                </Button>

                <Button variant="secondary">
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartir con Médico
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}