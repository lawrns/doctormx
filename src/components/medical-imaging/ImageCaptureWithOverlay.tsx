/**
 * ImageCaptureWithOverlay - Complete visual workflow for image capture, analysis overlay, and results
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { realTimeImageProcessor } from '../../../packages/services/RealTimeImageProcessor';
import { ComprehensiveAnalysisResult, AnalysisType } from '../../../packages/services/RealComprehensiveMedicalImageAnalyzer';
import { imageAnalysisErrorHandler } from '../../../packages/services/ImageAnalysisErrorHandler';
import { imageOptimizationService } from '../../../packages/services/ImageOptimizationService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ImageCaptureWithOverlayProps {
  analysisType: AnalysisType;
  onComplete?: (result: ComprehensiveAnalysisResult, imageUrl?: string) => void;
  culturalContext?: 'mexican' | 'tcm' | 'ayurveda' | 'global';
}

interface CapturedPhoto {
  imageData: ImageData;
  dataUrl: string;
  timestamp: number;
}

interface AnalysisOverlay {
  landmarks?: Array<{ x: number; y: number; type: string; confidence: number }>;
  regions?: Array<{ x: number; y: number; width: number; height: number; label: string }>;
  qualityMetrics?: {
    overall: number;
    lighting: number;
    focus: number;
    stability: number;
  };
}

const ImageCaptureWithOverlay: React.FC<ImageCaptureWithOverlayProps> = ({
  analysisType,
  onComplete,
  culturalContext = 'mexican'
}) => {
  const [currentStep, setCurrentStep] = useState<'camera' | 'captured' | 'analyzing' | 'results'>('camera');
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ComprehensiveAnalysisResult | null>(null);
  const [analysisOverlay, setAnalysisOverlay] = useState<AnalysisOverlay | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [recoverySuggestions, setRecoverySuggestions] = useState<string[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera with retry logic
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const stream = await imageAnalysisErrorHandler.executeWithRetry(
          async () => {
            return await realTimeImageProcessor.initializeCameraStream({
              width: 1280,
              height: 720,
              facingMode: 'environment'
            });
          },
          'camera_initialization',
          { maxRetries: 3, initialDelay: 1000 }
        );
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setError(null);
        setRecoverySuggestions([]);
      } catch (err) {
        const errorMessage = imageAnalysisErrorHandler.getUserFriendlyMessage(err);
        const suggestions = imageAnalysisErrorHandler.getRecoverySuggestions(err);
        setError(errorMessage);
        setRecoverySuggestions(suggestions);
      }
    };

    if (currentStep === 'camera') {
      initializeCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentStep]);

  // Capture photo with visual feedback
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      setError('Canvas context not available');
      return;
    }

    try {
      // Visual feedback - flash effect
      setCaptureSuccess(false);
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Optimize image if needed
      if (imageOptimizationService.shouldOptimize(dataUrl)) {
        const optimizationResult = await imageOptimizationService.optimizeForAnalysis(
          dataUrl,
          analysisType,
          { maxDimension: 1920, quality: 0.85 }
        );
        dataUrl = optimizationResult.optimizedDataUrl;
      }
      
      const photo: CapturedPhoto = {
        imageData,
        dataUrl,
        timestamp: Date.now()
      };
      
      setCapturedPhoto(photo);
      setCaptureSuccess(true);
      
      // Show success animation
      setTimeout(() => {
        setCurrentStep('captured');
        setCaptureSuccess(false);
      }, 500);
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    } catch (error) {
      const errorMessage = imageAnalysisErrorHandler.getUserFriendlyMessage(error);
      setError(errorMessage);
    }
  }, [analysisType]);

  // Progress tracking for analysis
  const updateProgress = useCallback((progress: number, message: string) => {
    setAnalysisProgress(progress);
    setProgressMessage(message);
  }, []);

  // Analyze captured photo with retry and progress
  const analyzePhoto = useCallback(async () => {
    if (!capturedPhoto) return;

    setIsAnalyzing(true);
    setCurrentStep('analyzing');
    setError(null);
    setRetryCount(0);
    setAnalysisProgress(0);

    try {
      // Progress stages
      const progressStages = [
        { progress: 10, message: 'Preparando imagen para análisis...' },
        { progress: 30, message: 'Detectando características médicas...' },
        { progress: 50, message: 'Analizando patrones y condiciones...' },
        { progress: 70, message: 'Generando diagnóstico preliminar...' },
        { progress: 90, message: 'Preparando recomendaciones personalizadas...' }
      ];

      // Simulate progress updates
      let stageIndex = 0;
      const progressInterval = setInterval(() => {
        if (stageIndex < progressStages.length) {
          updateProgress(progressStages[stageIndex].progress, progressStages[stageIndex].message);
          stageIndex++;
        }
      }, 800);

      // Generate analysis overlay data
      const overlay = generateAnalysisOverlay(capturedPhoto.imageData, analysisType);
      setAnalysisOverlay(overlay);
      
      // Draw overlay on captured image
      drawAnalysisOverlay(capturedPhoto.imageData, overlay);
      
      // Perform actual analysis with retry
      const result = await imageAnalysisErrorHandler.executeWithRetry(
        async () => {
          return await realTimeImageProcessor.analyzeImage({
            imageData: capturedPhoto.dataUrl,
            analysisType,
            culturalContext
          });
        },
        'image_analysis',
        { maxRetries: 3, initialDelay: 1000 }
      );
      
      clearInterval(progressInterval);
      updateProgress(100, 'Análisis completado exitosamente');
      
      setAnalysisResult(result);
      
      // Short delay to show completion
      setTimeout(() => {
        setCurrentStep('results');
        setAnalysisProgress(0);
        setProgressMessage('');
      }, 500);
      
      if (onComplete) {
        onComplete(result, capturedPhoto.dataUrl);
      }
    } catch (err) {
      const errorMessage = imageAnalysisErrorHandler.getUserFriendlyMessage(err);
      const suggestions = imageAnalysisErrorHandler.getRecoverySuggestions(err);
      setError(errorMessage);
      setRecoverySuggestions(suggestions);
      setCurrentStep('captured');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsAnalyzing(false);
    }
  }, [capturedPhoto, analysisType, culturalContext, onComplete, updateProgress]);

  // Generate overlay data based on analysis type
  const generateAnalysisOverlay = (imageData: ImageData, type: AnalysisType): AnalysisOverlay => {
    const { width, height } = imageData;
    
    switch (type) {
      case 'facial_analysis':
        return {
          landmarks: [
            { x: width * 0.3, y: height * 0.35, type: 'left_eye', confidence: 0.9 },
            { x: width * 0.7, y: height * 0.35, type: 'right_eye', confidence: 0.9 },
            { x: width * 0.5, y: height * 0.5, type: 'nose', confidence: 0.85 },
            { x: width * 0.5, y: height * 0.7, type: 'mouth', confidence: 0.8 }
          ],
          regions: [
            { x: width * 0.2, y: height * 0.15, width: width * 0.6, height: height * 0.7, label: 'Face Region' }
          ]
        };
      
      case 'skin_analysis':
        return {
          regions: [
            { x: width * 0.1, y: height * 0.1, width: width * 0.3, height: width * 0.3, label: 'Texture Analysis' },
            { x: width * 0.6, y: height * 0.1, width: width * 0.3, height: width * 0.3, label: 'Pigmentation' },
            { x: width * 0.1, y: height * 0.6, width: width * 0.3, height: width * 0.3, label: 'Hydration' },
            { x: width * 0.6, y: height * 0.6, width: width * 0.3, height: width * 0.3, label: 'Inflammation' }
          ]
        };
      
      case 'eye_analysis':
        return {
          landmarks: [
            { x: width * 0.25, y: height * 0.4, type: 'left_pupil', confidence: 0.95 },
            { x: width * 0.75, y: height * 0.4, type: 'right_pupil', confidence: 0.95 }
          ],
          regions: [
            { x: width * 0.15, y: height * 0.25, width: width * 0.2, height: width * 0.15, label: 'Left Eye' },
            { x: width * 0.65, y: height * 0.25, width: width * 0.2, height: width * 0.15, label: 'Right Eye' }
          ]
        };
      
      default:
        return {
          regions: [
            { x: width * 0.2, y: height * 0.2, width: width * 0.6, height: height * 0.6, label: 'Analysis Region' }
          ]
        };
    }
  };

  // Draw analysis overlay
  const drawAnalysisOverlay = (imageData: ImageData, overlay: AnalysisOverlay) => {
    if (!overlayCanvasRef.current || !canvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const ctx = overlayCanvas.getContext('2d');
    if (!ctx) return;

    overlayCanvas.width = imageData.width;
    overlayCanvas.height = imageData.height;
    
    // Clear previous overlay
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    
    // Draw regions
    if (overlay.regions) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#00ff00';
      
      overlay.regions.forEach(region => {
        ctx.strokeRect(region.x, region.y, region.width, region.height);
        ctx.fillText(region.label, region.x, region.y - 5);
      });
    }
    
    // Draw landmarks
    if (overlay.landmarks) {
      overlay.landmarks.forEach(landmark => {
        const radius = 5;
        const color = landmark.confidence > 0.8 ? '#00ff00' : '#ffff00';
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(landmark.x, landmark.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw label
        ctx.fillStyle = color;
        ctx.font = '12px Arial';
        ctx.fillText(
          `${landmark.type} (${Math.round(landmark.confidence * 100)}%)`,
          landmark.x + 10,
          landmark.y - 10
        );
      });
    }
  };

  // Restart process
  const restart = () => {
    setCapturedPhoto(null);
    setAnalysisResult(null);
    setAnalysisOverlay(null);
    setError(null);
    setCurrentStep('camera');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-center space-x-4 mb-6">
        {['camera', 'captured', 'analyzing', 'results'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step
                  ? 'bg-blue-600 text-white'
                  : index < ['camera', 'captured', 'analyzing', 'results'].indexOf(currentStep)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            {index < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  index < ['camera', 'captured', 'analyzing', 'results'].indexOf(currentStep)
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Error Display with Recovery Suggestions */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start space-x-2">
              <span className="text-red-600 text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-600 font-medium">{error}</p>
                {retryCount > 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    Intento {retryCount} de 3
                  </p>
                )}
              </div>
            </div>
            
            {recoverySuggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-gray-700">Sugerencias:</p>
                <ul className="list-disc list-inside space-y-1">
                  {recoverySuggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-gray-600">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex space-x-2 mt-4">
              <Button onClick={restart} variant="outline" className="flex-1">
                🔄 Intentar de nuevo
              </Button>
              {currentStep === 'captured' && capturedPhoto && (
                <Button 
                  onClick={analyzePhoto} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={retryCount >= 3}
                >
                  🔍 Reintentar análisis
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera View */}
      {currentStep === 'camera' && (
        <Card>
          <CardHeader>
            <CardTitle>Capture Image for {analysisType.replace('_', ' ').toUpperCase()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute inset-0 flex items-end justify-center p-4">
                <Button
                  onClick={capturePhoto}
                  className={`px-8 py-3 rounded-full transform transition-all duration-300 ${
                    captureSuccess 
                      ? 'bg-green-600 scale-110' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                  } text-white`}
                  size="lg"
                >
                  {captureSuccess ? '✅ ¡Capturado!' : '📸 Tomar Foto'}
                </Button>
              </div>
              
              {/* Flash effect overlay */}
              {captureSuccess && (
                <div className="absolute inset-0 bg-white opacity-0 animate-flash pointer-events-none" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Captured Photo View */}
      {currentStep === 'captured' && capturedPhoto && (
        <Card>
          <CardHeader>
            <CardTitle>Review Captured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <img
                src={capturedPhoto.dataUrl}
                alt="Captured"
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute inset-0 flex items-end justify-center p-4 space-x-4">
                <Button onClick={restart} variant="outline">
                  Retake Photo
                </Button>
                <Button
                  onClick={analyzePhoto}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  🔍 Analyze Image
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis in Progress */}
      {currentStep === 'analyzing' && capturedPhoto && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Image...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-lg"
                style={{ display: 'none' }}
              />
              <img
                src={capturedPhoto.dataUrl}
                alt="Analyzing"
                className="w-full h-auto rounded-lg"
              />
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 w-full h-full rounded-lg"
                style={{ mixBlendMode: 'overlay' }}
              />
              
              {/* Enhanced Analysis Progress */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg text-center max-w-sm w-full mx-4">
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{analysisProgress}%</span>
                    </div>
                  </div>
                  
                  <p className="text-lg font-medium mb-2">Analizando imagen médica</p>
                  <p className="text-sm text-gray-600 mb-4">{progressMessage}</p>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-500 ease-out"
                      style={{ width: `${analysisProgress}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-4">
                    Por favor no cierres esta ventana
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {currentStep === 'results' && analysisResult && capturedPhoto && (
        <div className="space-y-6">
          {/* Image with Overlay */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  src={capturedPhoto.dataUrl}
                  alt="Analyzed"
                  className="w-full h-auto rounded-lg"
                />
                <canvas
                  ref={overlayCanvasRef}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  style={{ mixBlendMode: 'overlay' }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis Results</CardTitle>
              <Badge variant={analysisResult.overallHealthScore.score > 70 ? 'default' : 'destructive'}>
                Health Score: {analysisResult.overallHealthScore.score}/100
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Findings */}
              <div>
                <h3 className="font-semibold mb-2">Primary Findings:</h3>
                <div className="space-y-2">
                  {analysisResult.primaryFindings.map((finding, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{finding.finding}</span>
                        <Badge variant={finding.severity === 'high' ? 'destructive' : finding.severity === 'moderate' ? 'secondary' : 'default'}>
                          {finding.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Confidence: {Math.round(finding.confidence * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Constitutional Assessment */}
              <div>
                <h3 className="font-semibold mb-2">Constitutional Type:</h3>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p><strong>Ayurvedic:</strong> {analysisResult.constitutionalAssessment.ayurvedicType}</p>
                  <p><strong>TCM:</strong> {analysisResult.constitutionalAssessment.tcmConstitution}</p>
                  <p><strong>Metabolic:</strong> {analysisResult.constitutionalAssessment.metabolicType}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Treatment Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysisResult.treatmentRecommendations.map((treatment, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium capitalize">{treatment.category.replace('_', ' ')}</h4>
                    <Badge variant={treatment.urgency === 'urgent' ? 'destructive' : 'default'}>
                      {treatment.urgency}
                    </Badge>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {treatment.recommendations.map((rec, recIndex) => (
                      <li key={recIndex} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                  {treatment.mexicanHerbs && treatment.mexicanHerbs.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Mexican Herbs:</p>
                      <p className="text-sm text-gray-600">{treatment.mexicanHerbs.join(', ')}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Follow-up: {treatment.followUp}</p>
                </div>
              ))}

              {/* Herb Recommendations */}
              {analysisResult.herbRecommendations.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Recommended Herbs:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.herbRecommendations.map((herb, index) => (
                      <Badge key={index} variant="outline">{herb}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up Schedule */}
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-medium">Next Follow-up:</h4>
                <p className="text-sm">{analysisResult.followUpSchedule}</p>
              </div>

              <div className="flex space-x-4">
                <Button onClick={restart} variant="outline">
                  New Analysis
                </Button>
                <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700">
                  📄 Print Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageCaptureWithOverlay;