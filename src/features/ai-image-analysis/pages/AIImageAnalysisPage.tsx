import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, FileImage, Brain, CheckCircle, AlertTriangle, Info, ArrowLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ImageAnalysisVisual from '../components/ImageAnalysisVisual';
import ConfidenceVisualizer from '../../ai-doctor/components/ConfidenceVisualizer';

type AnalysisStage = 'initial' | 'scanning' | 'identifying' | 'comparing' | 'concluding';

interface AnalysisResult {
  findings: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  recommendations: string[];
  suggestedSpecialty?: string;
}

const AIImageAnalysisPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [confidenceLevel, setConfidenceLevel] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const medicalReferences = [
    'Atlas de Dermatología Mexicana',
    'Base de datos IMSS',
    'Literatura médica internacional',
    'Estudios clínicos recientes',
    'Guías médicas oficiales'
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setAnalysisResult(null);
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisStage('initial');
    setConfidenceLevel(10);

    // Simulate analysis stages
    const stages: AnalysisStage[] = ['scanning', 'identifying', 'comparing', 'concluding'];
    
    for (let i = 0; i < stages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysisStage(stages[i]);
      setConfidenceLevel(20 + (i * 20));
    }

    // Simulate final result
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResult: AnalysisResult = {
      findings: "Se observa una lesión cutánea con características compatibles con dermatitis seborreica. La imagen muestra descamación y enrojecimiento en la zona afectada.",
      confidence: 87,
      severity: 'medium',
      recommendations: [
        "Consultar con dermatólogo para confirmación diagnóstica",
        "Mantener la zona limpia y seca",
        "Evitar productos irritantes",
        "Considerar tratamiento tópico con antifúngicos suaves"
      ],
      suggestedSpecialty: "Dermatología"
    };

    setAnalysisResult(mockResult);
    setConfidenceLevel(mockResult.confidence);
    setIsAnalyzing(false);
    setAnalysisStage(null);
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisStage(null);
    setConfidenceLevel(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Análisis de Imágenes Médicas con IA
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl">
            Sube una imagen médica y obtén un análisis preliminar usando inteligencia artificial. 
            Ideal para lesiones cutáneas, erupciones, y otras condiciones visibles.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Importante</h3>
              <p className="text-yellow-700 text-sm">
                Este análisis es solo informativo y no sustituye el diagnóstico médico profesional. 
                Siempre consulta con un médico para obtener un diagnóstico definitivo.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Subir Imagen Médica
              </h2>
              
              {!selectedImage ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-teal-600" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Haz clic para subir una imagen
                      </p>
                      <p className="text-gray-500 mt-1">
                        PNG, JPG, JPEG hasta 10MB
                      </p>
                    </div>
                    <div className="flex justify-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Camera className="w-4 h-4 mr-1" />
                        Foto directa
                      </div>
                      <div className="flex items-center">
                        <FileImage className="w-4 h-4 mr-1" />
                        Archivo guardado
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Imagen médica subida" 
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {!analysisResult && !isAnalyzing && (
                    <button
                      onClick={startAnalysis}
                      className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center"
                    >
                      <Brain className="w-5 h-5 mr-2" />
                      Iniciar Análisis con IA
                    </button>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Consejos para mejores resultados
              </h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>• Usa buena iluminación natural</li>
                <li>• Mantén la cámara estable</li>
                <li>• Enfoca claramente la zona afectada</li>
                <li>• Incluye una referencia de tamaño si es posible</li>
                <li>• Evita sombras o reflejos</li>
              </ul>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="space-y-6">
            {/* Analysis Progress */}
            {isAnalyzing && selectedImage && analysisStage && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Análisis en Progreso
                </h3>
                
                <ImageAnalysisVisual 
                  imageSrc={selectedImage} 
                  analysisStage={analysisStage}
                />
                
                <div className="mt-6">
                  <ConfidenceVisualizer 
                    confidence={confidenceLevel}
                    status="considering"
                    references={medicalReferences}
                  />
                </div>
              </motion.div>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Análisis Completado
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Confidence Score */}
                  <div>
                    <ConfidenceVisualizer 
                      confidence={analysisResult.confidence}
                      status="confident"
                      references={medicalReferences}
                    />
                  </div>

                  {/* Findings */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Hallazgos:</h4>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {analysisResult.findings}
                    </p>
                  </div>

                  {/* Severity */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Nivel de Atención:</h4>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      analysisResult.severity === 'low' ? 'bg-green-100 text-green-800' :
                      analysisResult.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analysisResult.severity === 'low' && 'Bajo - Monitoreo'}
                      {analysisResult.severity === 'medium' && 'Medio - Consulta recomendada'}
                      {analysisResult.severity === 'high' && 'Alto - Atención urgente'}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recomendaciones:</h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Specialty */}
                  {analysisResult.suggestedSpecialty && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Especialidad Sugerida:</h4>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <p className="text-teal-800 font-medium">{analysisResult.suggestedSpecialty}</p>
                        <Link 
                          to="/doctor" 
                          className="inline-flex items-center mt-2 text-teal-600 hover:text-teal-700 text-sm"
                        >
                          Buscar especialistas cercanos →
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={resetAnalysis}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Analizar otra imagen
                    </button>
                    <Link
                      to="/doctor"
                      className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-center"
                    >
                      Consultar con Dr. Simeon
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {!selectedImage && !isAnalyzing && !analysisResult && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Listo para analizar
                </h3>
                <p className="text-gray-500">
                  Sube una imagen médica para comenzar el análisis con IA
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImageAnalysisPage;