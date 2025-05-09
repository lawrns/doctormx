import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Image, Upload, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import AIService from '../services/ai/AIService';
import EncryptionService from '../services/security/EncryptionService';
import SEO from '../components/seo/SEO';

function AIImageAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      setError('Por favor, sube únicamente archivos de imagen.');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      const scrubbedFile = await EncryptionService.scrubImageMetadata(file);
      
      const imageUrl = URL.createObjectURL(scrubbedFile);
      setSelectedImage(imageUrl);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Hubo un error al procesar la imagen. Por favor, intenta nuevamente.');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await AIService.analyzeImage(selectedImage, symptoms);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setError('Hubo un error al analizar la imagen. Por favor, intenta nuevamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
    setSymptoms('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Análisis de Imágenes Médicas | Doctor IA" 
        description="Sube imágenes de condiciones médicas visibles para recibir un análisis preliminar y recomendaciones de especialistas."
        canonical="/ai-doctor/image-analysis"
        keywords="análisis de imágenes médicas, diagnóstico por imagen, dermatología, erupciones cutáneas, lesiones, inteligencia artificial médica"
      />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link to="/ai-doctor" className="text-blue-600 hover:text-blue-800 mr-4">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Análisis de Imágenes Médicas</h1>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Security Notice */}
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Seguridad y Privacidad</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Todas las imágenes son procesadas con encriptación de extremo a extremo y los metadatos son eliminados para proteger tu privacidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {!analysisResult ? (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Sube una imagen para análisis médico
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Esta herramienta puede analizar imágenes de condiciones visibles como erupciones cutáneas, 
                  lesiones, inflamaciones y otras manifestaciones físicas para proporcionar una evaluación preliminar.
                </p>
                
                {/* Image Upload Area */}
                <div className="mb-6">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center ${
                      selectedImage ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedImage ? (
                      <div>
                        <img 
                          src={selectedImage} 
                          alt="Imagen para análisis" 
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <p className="mt-2 text-sm text-blue-600">Haz clic para cambiar la imagen</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm font-medium text-gray-900">
                          Haz clic para seleccionar una imagen
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          PNG, JPG, GIF hasta 10MB
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  {error && (
                    <div className="mt-2 text-sm text-red-600">
                      <AlertCircle className="inline-block h-4 w-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>
                
                {/* Symptoms Description */}
                <div className="mb-6">
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                    Describe tus síntomas (opcional)
                  </label>
                  <textarea
                    id="symptoms"
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe cualquier síntoma relacionado con la imagen para un análisis más preciso..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                  />
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Reiniciar
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyzeImage}
                    disabled={!selectedImage || isAnalyzing}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      !selectedImage || isAnalyzing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isAnalyzing ? 'Analizando...' : 'Analizar Imagen'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Resultados del Análisis
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <img 
                      src={selectedImage!} 
                      alt="Imagen analizada" 
                      className="rounded-lg max-h-64"
                    />
                  </div>
                  
                  <div>
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <h3 className="font-medium text-blue-800 mb-2">Hallazgos</h3>
                      <p className="text-gray-800">{analysisResult.imageAnalysis?.findings || analysisResult.text}</p>
                      
                      {analysisResult.imageAnalysis?.confidence && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Nivel de confianza</span>
                            <span>{Math.round(analysisResult.imageAnalysis.confidence * 100)}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600" 
                              style={{ width: `${Math.round(analysisResult.imageAnalysis.confidence * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {analysisResult.suggestedSpecialty && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="font-medium text-green-800 mb-2">Especialidad Recomendada</h3>
                        <p className="text-gray-800">{analysisResult.suggestedSpecialty}</p>
                        
                        <Link
                          to={`/buscar-doctor?specialty=${encodeURIComponent(analysisResult.suggestedSpecialty)}`}
                          className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Buscar especialistas
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Disclaimer */}
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Aviso Importante</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Este análisis es preliminar y no constituye un diagnóstico médico. 
                          Siempre consulta con un profesional de la salud para una evaluación completa.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Analizar otra imagen
                  </button>
                  <Link
                    to="/ai-doctor"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Volver al Doctor IA
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">¿Qué condiciones puede analizar?</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Erupciones cutáneas</li>
              <li>• Lesiones en la piel</li>
              <li>• Inflamaciones</li>
              <li>• Cambios de coloración</li>
              <li>• Patrones anormales</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Cómo obtener mejores resultados</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Usa buena iluminación</li>
              <li>• Mantén la cámara estable</li>
              <li>• Toma la foto a una distancia adecuada</li>
              <li>• Incluye detalles en la descripción</li>
              <li>• Proporciona múltiples ángulos si es posible</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Limitaciones</h3>
            <p className="text-gray-600 mb-4">
              Esta herramienta tiene limitaciones y no puede diagnosticar todas las condiciones. 
              Algunas condiciones requieren pruebas adicionales o evaluación física por un médico.
            </p>
            <Link
              to="/ai-doctor"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Consultar con Doctor IA
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AIImageAnalysisPage;
