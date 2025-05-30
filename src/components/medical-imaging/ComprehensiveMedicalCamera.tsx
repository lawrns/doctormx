/**
 * ComprehensiveMedicalCamera - Advanced medical imaging interface
 *
 * Provides a professional-grade camera interface for medical image capture
 * with real-time quality assessment, guided positioning, and instant analysis.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, RotateCcw, Zap, Target, CheckCircle, AlertTriangle,
  Eye, Lightbulb, Focus, Smartphone, RefreshCw, Download,
  Brain, Heart, Leaf, Activity, Shield, Clock
} from 'lucide-react';
import { Button } from '../ui/Button';
import {
  RealTimeImageProcessor,
  CameraConfig,
  RealTimeAnalysisConfig,
  StreamAnalysisResult,
  QualityFeedback,
  StreamRecommendation
} from '../../../packages/services/RealTimeImageProcessor';
import {
  AnalysisType,
  ComprehensiveAnalysisResult
} from '../../../packages/services/ComprehensiveMedicalImageAnalyzer';

interface Props {
  analysisType: AnalysisType;
  onAnalysisComplete: (result: ComprehensiveAnalysisResult) => void;
  onClose: () => void;
  culturalContext?: 'mexican' | 'tcm' | 'ayurveda' | 'global';
  enableGuidance?: boolean;
  enableRealTimeAnalysis?: boolean;
}

interface CameraState {
  isInitializing: boolean;
  isActive: boolean;
  stream: MediaStream | null;
  error: string | null;
  qualityFeedback: QualityFeedback | null;
  recommendations: StreamRecommendation[];
  lastAnalysis: ComprehensiveAnalysisResult | null;
  isAnalyzing: boolean;
  capturedImage: string | null;
}

const ANALYSIS_TYPE_CONFIG = {
  facial_analysis: {
    title: 'Análisis Facial Integral',
    description: 'Análisis completo de rostro, ojos y constitución',
    icon: Eye,
    guidance: [
      'Coloca el rostro centrado en el marco',
      'Asegúrate de tener buena iluminación natural',
      'Mantén una expresión neutral',
      'Evita sombras en el rostro'
    ],
    requirements: {
      distance: '30-50 cm de la cámara',
      lighting: 'Luz natural o LED frontal',
      position: 'Rostro centrado y derecho'
    }
  },
  eye_analysis: {
    title: 'Análisis Ocular Detallado',
    description: 'Evaluación profesional de iris, esclerótica y pupilas',
    icon: Eye,
    guidance: [
      'Acércate para capturar ambos ojos claramente',
      'Usa una luz LED anular si es posible',
      'Mantén los ojos abiertos y relajados',
      'Evita el uso de flash directo'
    ],
    requirements: {
      distance: '15-25 cm de la cámara',
      lighting: 'LED anular o luz lateral suave',
      position: 'Ojos centrados en el marco'
    }
  },
  tongue_diagnosis: {
    title: 'Diagnóstico de Lengua (MTC)',
    description: 'Análisis tradicional chino de lengua y constitución',
    icon: Heart,
    guidance: [
      'Saca la lengua completamente',
      'Usa luz blanca natural para colores precisos',
      'Relaja la lengua sin tensión',
      'Mantén la cámara estable'
    ],
    requirements: {
      distance: '20-30 cm de la cámara',
      lighting: 'Luz blanca natural (5500K)',
      position: 'Lengua centrada y extendida'
    }
  },
  skin_analysis: {
    title: 'Análisis Dermatológico',
    description: 'Evaluación avanzada de piel y lesiones',
    icon: Shield,
    guidance: [
      'Limpia la zona a analizar',
      'Usa iluminación uniforme',
      'Mantén la piel tensa pero natural',
      'Evita productos cosméticos'
    ],
    requirements: {
      distance: '10-20 cm de la zona',
      lighting: 'Luz uniforme sin sombras',
      position: 'Zona de piel centrada'
    }
  },
  nail_analysis: {
    title: 'Análisis de Uñas',
    description: 'Evaluación de salud a través de las uñas',
    icon: Activity,
    guidance: [
      'Limpia las uñas sin esmalte',
      'Extiende los dedos naturalmente',
      'Usa luz lateral para ver texturas',
      'Incluye cutículas en la imagen'
    ],
    requirements: {
      distance: '10-15 cm de las uñas',
      lighting: 'Luz lateral o anular',
      position: 'Uñas extendidas y visibles'
    }
  },
  hair_scalp_analysis: {
    title: 'Análisis Capilar',
    description: 'Evaluación de cabello y cuero cabelludo',
    icon: Leaf,
    guidance: [
      'Separa el cabello para ver el cuero cabelludo',
      'Usa luz directa pero suave',
      'Enfoca en las raíces y folículos',
      'Incluye diferentes áreas del cuero cabelludo'
    ],
    requirements: {
      distance: '5-15 cm del cuero cabelludo',
      lighting: 'Luz directa suave',
      position: 'Cuero cabelludo visible'
    }
  },
  posture_analysis: {
    title: 'Análisis Postural',
    description: 'Evaluación de alineación corporal',
    icon: Target,
    guidance: [
      'Ponte de pie naturalmente',
      'Usa ropa ajustada o mínima',
      'Mantén una posición relajada',
      'Incluye cuerpo completo en el marco'
    ],
    requirements: {
      distance: '2-3 metros de la cámara',
      lighting: 'Luz uniforme del ambiente',
      position: 'Cuerpo completo visible de perfil'
    }
  }
};

export default function ComprehensiveMedicalCamera({
  analysisType,
  onAnalysisComplete,
  onClose,
  culturalContext = 'mexican',
  enableGuidance = true,
  enableRealTimeAnalysis = true
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processorRef = useRef<RealTimeImageProcessor | null>(null);
  const streamGeneratorRef = useRef<AsyncGenerator<StreamAnalysisResult, void, unknown> | null>(null);

  const [cameraState, setCameraState] = useState<CameraState>({
    isInitializing: true,
    isActive: false,
    stream: null,
    error: null,
    qualityFeedback: null,
    recommendations: [],
    lastAnalysis: null,
    isAnalyzing: false,
    capturedImage: null
  });

  const [showGuidance, setShowGuidance] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [captureMode, setCaptureMode] = useState<'auto' | 'manual'>('auto');

  const config = ANALYSIS_TYPE_CONFIG[analysisType];
  const IconComponent = config.icon;

  // Initialize camera and processor
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanup();
    };
  }, []);

  // Start real-time processing when camera is active
  useEffect(() => {
    if (cameraState.isActive && videoRef.current && enableRealTimeAnalysis) {
      startRealTimeProcessing();
    }
    return () => {
      stopRealTimeProcessing();
    };
  }, [cameraState.isActive, enableRealTimeAnalysis]);

  const initializeCamera = async () => {
    try {
      setCameraState(prev => ({ ...prev, isInitializing: true, error: null }));

      if (!processorRef.current) {
        processorRef.current = RealTimeImageProcessor.getInstance();
      }

      const cameraConfig: Partial<CameraConfig> = {
        facingMode: 'environment',
        width: analysisType === 'posture_analysis' ? 1920 : 1440,
        height: analysisType === 'posture_analysis' ? 1080 : 1080,
        focusMode: analysisType.includes('eye') || analysisType.includes('nail') ? 'macro' : 'auto'
      };

      const stream = await processorRef.current.initializeCameraStream(cameraConfig);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const analysisConfig: Partial<RealTimeAnalysisConfig> = {
        analysisType,
        culturalContext,
        qualityThreshold: 70,
        bufferSize: 5,
        processingInterval: captureMode === 'auto' ? 1000 : 2000
      };

      processorRef.current.configureAnalysis(analysisConfig);

      setCameraState(prev => ({
        ...prev,
        isInitializing: false,
        isActive: true,
        stream,
        error: null
      }));

    } catch (error) {
      setCameraState(prev => ({
        ...prev,
        isInitializing: false,
        isActive: false,
        error: error instanceof Error ? error.message : 'Error al acceder a la cámara'
      }));
    }
  };

  const startRealTimeProcessing = async () => {
    if (!processorRef.current || !videoRef.current) return;

    // Wait for video to be ready with proper dimensions
    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready for processing, waiting...');

      // Wait for video metadata to load
      await new Promise<void>((resolve) => {
        const checkReady = () => {
          if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
      });
    }

    try {
      streamGeneratorRef.current = processorRef.current.processCameraFeed(videoRef.current);

      for await (const result of streamGeneratorRef.current) {
        setCameraState(prev => ({
          ...prev,
          qualityFeedback: result.qualityFeedback,
          recommendations: result.recommendations,
          lastAnalysis: result.analysis || prev.lastAnalysis
        }));

        // Auto-capture when quality is optimal
        if (captureMode === 'auto' &&
            result.qualityFeedback.isReadyForAnalysis &&
            result.qualityFeedback.overallQuality >= 85 &&
            result.analysis) {

          await handleAutoCapture(result.analysis);
          break;
        }
      }
    } catch (error) {
      console.error('Real-time processing error:', error);
    }
  };

  const stopRealTimeProcessing = () => {
    if (processorRef.current) {
      processorRef.current.stopProcessing();
    }
    streamGeneratorRef.current = null;
  };

  const handleAutoCapture = async (analysis: ComprehensiveAnalysisResult) => {
    const capturedImage = await captureImage();
    if (capturedImage) {
      setCameraState(prev => ({
        ...prev,
        capturedImage,
        lastAnalysis: analysis,
        isAnalyzing: false
      }));

      // Brief delay for user to see the capture
      setTimeout(() => {
        onAnalysisComplete(analysis);
      }, 1500);
    }
  };

  const handleManualCapture = async () => {
    setCameraState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const capturedImage = await captureImage();
      if (capturedImage && processorRef.current) {
        // Perform single image analysis
        const analysisInput = {
          imageData: capturedImage,
          analysisType,
          culturalContext
        };

        const analysis = await processorRef.current.imageAnalyzer.analyzeImage(analysisInput);

        setCameraState(prev => ({
          ...prev,
          capturedImage,
          lastAnalysis: analysis,
          isAnalyzing: false
        }));

        onAnalysisComplete(analysis);
      }
    } catch (error) {
      setCameraState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: 'Error al procesar la imagen'
      }));
    }
  };

  const captureImage = async (): Promise<string | null> => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const retakePhoto = () => {
    setCameraState(prev => ({
      ...prev,
      capturedImage: null,
      lastAnalysis: null,
      isAnalyzing: false
    }));

    if (enableRealTimeAnalysis) {
      startRealTimeProcessing();
    }
  };

  const switchCamera = async () => {
    cleanup();
    await initializeCamera();
  };

  const cleanup = () => {
    stopRealTimeProcessing();

    if (cameraState.stream) {
      cameraState.stream.getTracks().forEach(track => track.stop());
    }

    setCameraState(prev => ({
      ...prev,
      isActive: false,
      stream: null,
      qualityFeedback: null,
      recommendations: []
    }));
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-green-600';
    if (quality >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityIcon = (quality: number) => {
    if (quality >= 80) return CheckCircle;
    if (quality >= 60) return AlertTriangle;
    return AlertTriangle;
  };

  if (cameraState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error de Cámara</h3>
          <p className="text-gray-600 mb-6">{cameraState.error}</p>
          <div className="space-y-3">
            <Button onClick={initializeCamera} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button variant="secondary" onClick={onClose} className="w-full">
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-white font-semibold">{config.title}</h1>
              <p className="text-white/80 text-sm">{config.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={switchCamera}
              className="bg-white/20 text-white border-white/30"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="bg-white/20 text-white border-white/30"
            >
              ✕
            </Button>
          </div>
        </div>
      </div>

      {/* Main Camera Interface */}
      <div className="relative h-screen flex items-center justify-center">
        {cameraState.isInitializing ? (
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg">Iniciando cámara...</p>
            <p className="text-white/80 text-sm">Configurando para {config.title.toLowerCase()}</p>
          </div>
        ) : (
          <>
            {/* Video Feed */}
            <video
              ref={videoRef}
              className="max-w-full max-h-full object-contain"
              playsInline
              muted
              style={{
                transform: analysisType === 'posture_analysis' ? 'none' : 'scaleX(-1)'
              }}
            />

            {/* Canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Captured Image Overlay */}
            <AnimatePresence>
              {cameraState.capturedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/90 flex items-center justify-center z-30"
                >
                  <div className="text-center text-white">
                    <img
                      src={cameraState.capturedImage}
                      alt="Captured"
                      className="max-w-sm max-h-96 object-contain rounded-lg mb-4 mx-auto"
                    />
                    <div className="flex gap-3 justify-center">
                      <Button onClick={retakePhoto} variant="secondary">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Repetir
                      </Button>
                      {cameraState.lastAnalysis && (
                        <Button onClick={() => onAnalysisComplete(cameraState.lastAnalysis!)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Continuar
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guidance Overlay */}
            {showGuidance && enableGuidance && !cameraState.capturedImage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-20 left-4 right-4 z-10"
              >
                <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Instrucciones de Captura</h3>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowGuidance(false)}
                      className="bg-white/20 text-white border-white/30"
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    {config.guidance.map((instruction, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-white/10 rounded-lg">
                    <h4 className="font-medium mb-2">Requisitos:</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div><strong>Distancia:</strong> {config.requirements.distance}</div>
                      <div><strong>Iluminación:</strong> {config.requirements.lighting}</div>
                      <div><strong>Posición:</strong> {config.requirements.position}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      {cameraState.isActive && !cameraState.capturedImage && (
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-6">
          {/* Quality Feedback */}
          {cameraState.qualityFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/60 backdrop-blur-sm rounded-xl p-4 mb-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {React.createElement(
                    getQualityIcon(cameraState.qualityFeedback.overallQuality),
                    {
                      className: `w-5 h-5 ${getQualityColor(cameraState.qualityFeedback.overallQuality)}`
                    }
                  )}
                  <span className="text-white font-medium">
                    Calidad: {cameraState.qualityFeedback.overallQuality}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex h-2 w-20 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        cameraState.qualityFeedback.overallQuality >= 80 ? 'bg-green-500' :
                        cameraState.qualityFeedback.overallQuality >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cameraState.qualityFeedback.overallQuality}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {cameraState.recommendations.length > 0 && (
                <div className="space-y-2">
                  {cameraState.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/90 text-sm">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span>{rec.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Capture Controls */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={captureMode === 'auto' ? 'default' : 'secondary'}
                onClick={() => setCaptureMode('auto')}
                className={captureMode === 'auto' ? 'bg-green-600' : 'bg-white/20 text-white'}
              >
                <Zap className="w-4 h-4 mr-1" />
                Auto
              </Button>
              <Button
                size="sm"
                variant={captureMode === 'manual' ? 'default' : 'secondary'}
                onClick={() => setCaptureMode('manual')}
                className={captureMode === 'manual' ? 'bg-blue-600' : 'bg-white/20 text-white'}
              >
                <Camera className="w-4 h-4 mr-1" />
                Manual
              </Button>
            </div>

            {/* Capture Button */}
            {captureMode === 'manual' && (
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  onClick={handleManualCapture}
                  disabled={cameraState.isAnalyzing}
                  className="w-16 h-16 rounded-full bg-white text-gray-900 hover:bg-gray-100 border-4 border-white/50"
                >
                  {cameraState.isAnalyzing ? (
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-gray-900 rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6" />
                  )}
                </Button>

                {cameraState.qualityFeedback?.isReadyForAnalysis && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -inset-2 border-2 border-green-400 rounded-full"
                  />
                )}
              </motion.div>
            )}

            {captureMode === 'auto' && (
              <div className="text-center text-white">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm">Captura automática activada</span>
                </div>
                <p className="text-xs text-white/70">
                  Se capturará cuando la calidad sea óptima
                </p>
              </div>
            )}
          </div>

          {/* Analysis Status */}
          {cameraState.isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-white"
            >
              <div className="flex items-center justify-center gap-2">
                <Brain className="w-5 h-5 animate-pulse text-blue-400" />
                <span>Analizando imagen médica...</span>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Instructions Toggle Button */}
      {!showGuidance && enableGuidance && !cameraState.capturedImage && (
        <Button
          onClick={() => setShowGuidance(true)}
          className="absolute top-24 right-4 z-10 bg-white/20 text-white border-white/30"
          size="sm"
        >
          <Target className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}