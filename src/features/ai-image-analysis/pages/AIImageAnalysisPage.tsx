import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertCircle, ArrowLeft, Camera, Image as ImageIcon } from 'lucide-react';
import AIService from '../../../core/services/ai/AIService';
import EncryptionService from '../../../core/services/security/EncryptionService';
import SEO from '../../../core/components/SEO';
import { typography } from '../../../styles/typography';

function AIImageAnalysisPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };
  
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
    setSymptoms('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-jade-50 to-white">
      <SEO 
        title="Análisis de Imágenes Médicas | DoctorMX"
        description="Sube imágenes médicas para recibir un análisis preliminar basado en inteligencia artificial."
        keywords="análisis de imágenes médicas, IA médica, diagnóstico por imagen"
      />
      
      {/* Hero section with gradient background */}
      <div className="bg-gradient-to-r from-brand-jade-600 to-brand-jade-800 relative overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        {/* Enhanced Animated Gradient Orbs with multi-layered effect */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-jade-500 filter blur-3xl opacity-20"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-jade-400 filter blur-3xl opacity-20"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        {/* Additional smaller orbs for layered effect */}
        <motion.div 
          className="absolute top-1/3 right-1/3 w-32 h-32 rounded-full bg-brand-jade-400 filter blur-2xl opacity-15"
          animate={{
            x: [0, 50, 0],
            y: [0, -20, 0],
            opacity: [0.15, 0.2, 0.15]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-48 h-48 rounded-full bg-brand-jade-300 filter blur-2xl opacity-15"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link to="/" className="text-white hover:text-brand-jade-100 flex items-center transition-colors">
              <ArrowLeft size={16} className="mr-1" />
              Volver al inicio
            </Link>
          </motion.div>
          
          <div className="md:flex md:items-center md:space-x-12">
            <motion.div 
              className="md:w-1/2 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1 
                className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4" 
                style={typography.textStyles.h1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                Análisis de{' '}
                <motion.span 
                  className="text-white opacity-90 bg-gradient-to-r from-blue-300 to-blue-100 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  Imágenes Médicas
                </motion.span>
              </motion.h1>
              
              <motion.p
                className="text-white/90 text-lg max-w-3xl mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Nuestro sistema de IA puede analizar imágenes médicas como lesiones cutáneas, 
                radiografías simples y otros tipos de imágenes para proporcionar una 
                evaluación preliminar.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start"
              >
                <a 
                  href="#upload-section" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Subir imagen
                  <Upload size={18} className="ml-2" />
                </a>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 mt-10 md:mt-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-blue-700/30 rounded-xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <ImageIcon size={20} className="text-white" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-white font-semibold">Análisis de Imágenes</h3>
                        <p className="text-blue-100 text-sm">Diagnóstico preliminar</p>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 backdrop-blur-sm">
                      <p className="text-blue-100 text-sm mb-2">Sube imágenes de:</p>
                      <ul className="text-white text-sm space-y-1">
                        <li className="flex items-center">
                          <CheckCircle size={14} className="text-green-400 mr-2" />
                          Lesiones cutáneas
                        </li>
                        <li className="flex items-center">
                          <CheckCircle size={14} className="text-green-400 mr-2" />
                          Radiografías simples
                        </li>
                        <li className="flex items-center">
                          <CheckCircle size={14} className="text-green-400 mr-2" />
                          Imágenes dermatológicas
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" id="upload-section">
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-700"></div>
          
          <motion.h2 
            className="text-2xl font-semibold text-gray-800 mb-4" 
            style={typography.textStyles.h2}
            variants={itemVariants}
          >
            <Camera size={24} className="inline-block mr-2 text-blue-500" />
            Sube una imagen para análisis
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 mb-6"
            variants={itemVariants}
          >
            Nuestro sistema de IA puede analizar imágenes médicas para proporcionar una 
            evaluación preliminar. Esta herramienta no reemplaza el diagnóstico profesional.
          </motion.p>
          
          {error && (
            <motion.div 
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center">
                <AlertCircle size={20} className="text-red-500 mr-2 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            </motion.div>
          )}
          
          {!selectedImage && !analysisResult && (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: isUploading ? 1 : 1.01, boxShadow: isUploading ? 'none' : '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              {isUploading ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-700">Procesando imagen...</p>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 hover:bg-gray-100"
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                  <Upload size={48} className="mx-auto text-blue-500 mb-4" />
                  <p className="text-gray-700 mb-2 font-medium">Haz clic para seleccionar una imagen o arrastra y suelta aquí</p>
                  <p className="text-gray-500 text-sm">Formatos soportados: JPG, PNG, WEBP</p>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageSelect}
                    disabled={isUploading}
                  />
                </div>
              )}
            </motion.div>
          )}
          
          {selectedImage && !analysisResult && (
            <>
              <motion.div 
                className="rounded-lg p-6 mb-6 border border-gray-200 bg-gray-50"
                variants={itemVariants}
              >
                <img 
                  src={selectedImage} 
                  alt="Imagen para análisis" 
                  className="max-h-64 mx-auto rounded-lg"
                />
                <p className="mt-2 text-sm text-blue-600 text-center">Haz clic para cambiar la imagen</p>
              </motion.div>
              
              <motion.div 
                className="mb-6"
                variants={itemVariants}
              >
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
              </motion.div>
              
              <motion.div 
                className="flex justify-end"
                variants={itemVariants}
              >
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
                  disabled={isAnalyzing}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    isAnalyzing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isAnalyzing ? 'Analizando...' : 'Analizar Imagen'}
                </button>
              </motion.div>
            </>
          )}
          
          {analysisResult && (
            <motion.div 
              className="mt-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg"
                variants={itemVariants}
              >
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-blue-500 mr-2 flex-shrink-0" />
                  <p className="text-blue-700 font-medium">Análisis completado con éxito</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                variants={itemVariants}
              >
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Imagen analizada</h3>
                  <img 
                    src={selectedImage!} 
                    alt="Imagen analizada" 
                    className="rounded-lg max-h-64 border border-gray-200"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resultados</h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Hallazgos</p>
                      <p className="font-medium">{analysisResult.imageAnalysis?.findings || 'No se encontraron hallazgos específicos'}</p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Nivel de confianza</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${(analysisResult.imageAnalysis?.confidence || 0) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round((analysisResult.imageAnalysis?.confidence || 0) * 100)}% de confianza
                      </p>
                    </div>
                    
                    {analysisResult.severity && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Severidad estimada</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                          <div 
                            className={`h-2.5 rounded-full ${
                              analysisResult.severity < 30 ? 'bg-green-500' : 
                              analysisResult.severity < 60 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}
                            style={{ width: `${analysisResult.severity}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {analysisResult.severity < 30 ? 'Baja' : 
                           analysisResult.severity < 60 ? 'Moderada' : 
                           'Alta'}
                        </p>
                      </div>
                    )}
                    
                    {analysisResult.suggestedSpecialty && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Especialidad sugerida</p>
                        <p className="font-medium">{analysisResult.suggestedSpecialty}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-white rounded-lg border border-gray-200 p-4 mb-6"
                variants={itemVariants}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis detallado</h3>
                <p className="text-gray-700">{analysisResult.text}</p>
              </motion.div>
              
              <motion.div 
                className="flex justify-end"
                variants={itemVariants}
              >
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Analizar otra imagen
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Security notice */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-start">
            <CheckCircle className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">Seguridad y Privacidad</h3>
              <p className="mt-2 text-gray-600">
                Todas las imágenes son procesadas con encriptación de extremo a extremo y los metadatos 
                son eliminados para proteger tu privacidad. Ninguna imagen se almacena permanentemente 
                en nuestros servidores.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AIImageAnalysisPage;
