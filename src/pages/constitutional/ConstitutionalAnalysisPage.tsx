/**
 * ConstitutionalAnalysisPage - Ayurvedic constitutional analysis page
 * Provides complete constitutional assessment and personalized recommendations
 */

import React, { useState } from 'react';
import { Leaf, User, Heart, Brain, Info, ArrowLeft } from 'lucide-react';
import ConstitutionalQuestionnaire from '../../components/constitutional/ConstitutionalQuestionnaire';
import { loggingService } from '@svc/LoggingService';

interface ConstitutionalResult {
  primaryConstitution: 'vata' | 'pitta' | 'kapha';
  secondaryConstitution?: 'vata' | 'pitta' | 'kapha';
  scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  percentages: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  personalizedRecommendations: {
    herbs: string[];
    lifestyle: string[];
    diet: string[];
    exercise: string[];
    dailyRoutine: string[];
  };
  seasonalAdjustments: {
    current: string[];
    upcoming: string[];
  };
  mexicanContextAdaptations: string[];
  confidence: number;
}

export default function ConstitutionalAnalysisPage() {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [result, setResult] = useState<ConstitutionalResult | null>(null);
  const [patientInfo, setPatientInfo] = useState({
    age: undefined as number | undefined,
    gender: '',
    location: '',
    currentConditions: [] as string[]
  });

  const handleQuestionnaireComplete = (analysisResult: ConstitutionalResult) => {
    setResult(analysisResult);
    loggingService.info('ConstitutionalAnalysisPage', 'Analysis completed', {
      primaryConstitution: analysisResult.primaryConstitution,
      confidence: analysisResult.confidence
    });
  };

  const startQuestionnaire = () => {
    setShowQuestionnaire(true);
    loggingService.info('ConstitutionalAnalysisPage', 'Questionnaire started');
  };

  const goBack = () => {
    setShowQuestionnaire(false);
    setResult(null);
  };

  if (showQuestionnaire) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <button
            onClick={goBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </button>

          <ConstitutionalQuestionnaire 
            onComplete={handleQuestionnaireComplete}
            patientInfo={patientInfo}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Leaf className="w-12 h-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Análisis Constitucional Ayurvédico</h1>
            </div>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Descubre tu tipo constitucional único y recibe recomendaciones personalizadas de hierbas, 
              alimentación y estilo de vida adaptadas al contexto mexicano
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>Análisis Personalizado</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                <span>Base Científica</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                <span>Medicina Tradicional</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        
        {/* What is Constitutional Analysis */}
        <section className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600" />
            ¿Qué es el Análisis Constitucional Ayurvédico?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">💨</span>
              </div>
              <h3 className="text-lg font-semibold text-blue-800">Vata (Aire)</h3>
              <p className="text-gray-600 text-sm">
                Personas ligeras, creativas y móviles. Tendencia a la ansiedad y digestión irregular. 
                Necesitan rutina y calor.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🔥</span>
              </div>
              <h3 className="text-lg font-semibold text-red-800">Pitta (Fuego)</h3>
              <p className="text-gray-600 text-sm">
                Personas intensas, analíticas y enfocadas. Tendencia a la irritabilidad y sobrecalentamiento. 
                Necesitan frescura y moderación.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-green-800">Kapha (Tierra)</h3>
              <p className="text-gray-600 text-sm">
                Personas estables, fuertes y tranquilas. Tendencia al letargo y aumento de peso. 
                Necesitan estimulación y movimiento.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Beneficios del Análisis Constitucional</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-800">🌿 Recomendaciones Personalizadas</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Hierbas mexicanas específicas para tu constitución</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Alimentación adaptada a productos locales</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Rutinas de ejercicio según tu energía natural</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800">🇲🇽 Contexto Mexicano</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Adaptación a la altitud y clima mexicano</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Integración con medicina tradicional mexicana</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Consideraciones estacionales y regionales</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Patient Information */}
        <section className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Opcional (Para Personalizar el Análisis)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad (opcional)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={patientInfo.age || ''}
                onChange={(e) => setPatientInfo(prev => ({ 
                  ...prev, 
                  age: e.target.value ? parseInt(e.target.value) : undefined 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 35"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género (opcional)
              </label>
              <select
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicación (opcional)
              </label>
              <input
                type="text"
                value={patientInfo.location}
                onChange={(e) => setPatientInfo(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: CDMX, Guadalajara, etc."
              />
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Esta información nos ayuda a proporcionar recomendaciones más específicas y culturalmente relevantes.
          </p>
        </section>

        {/* How it works */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">¿Cómo Funciona el Cuestionario?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-yellow-800">1</span>
              </div>
              <h3 className="font-semibold">12 Preguntas</h3>
              <p className="text-sm text-gray-600">
                Preguntas sobre tu físico, digestión, energía y mente
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-yellow-800">2</span>
              </div>
              <h3 className="font-semibold">Análisis</h3>
              <p className="text-sm text-gray-600">
                Procesamos tus respuestas con algoritmos ayurvédicos
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-yellow-800">3</span>
              </div>
              <h3 className="font-semibold">Resultados</h3>
              <p className="text-sm text-gray-600">
                Descubres tu constitución primaria y secundaria
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-yellow-800">4</span>
              </div>
              <h3 className="font-semibold">Recomendaciones</h3>
              <p className="text-sm text-gray-600">
                Recibes un plan personalizado de bienestar
              </p>
            </div>
          </div>
        </section>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={startQuestionnaire}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors shadow-lg"
          >
            Comenzar Análisis Constitucional
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Tiempo estimado: 5-8 minutos
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Importante</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Este análisis constitucional se basa en principios tradicionales del Ayurveda adaptados al contexto mexicano. 
            Las recomendaciones son de carácter informativo y complementario. No sustituyen el consejo médico profesional. 
            Siempre consulte con un profesional de la salud antes de hacer cambios significativos en su dieta, 
            estilo de vida o antes de usar hierbas medicinales.
          </p>
        </div>
      </div>
    </div>
  );
}