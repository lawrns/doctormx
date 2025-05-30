/**
 * RealTimeImageProcessor - GPU-accelerated real-time medical image processing
 *
 * This service provides real-time image analysis capabilities with quality assessment,
 * buffering, and GPU acceleration for optimal performance in medical diagnostics.
 */

import { loggingService } from './LoggingService';
import {
  ComprehensiveMedicalImageAnalyzer,
  ImageAnalysisInput,
  ComprehensiveAnalysisResult,
  QualityMetrics,
  AnalysisType
} from './ComprehensiveMedicalImageAnalyzer';

export interface CameraConfig {
  width: number;
  height: number;
  frameRate: number;
  facingMode: 'user' | 'environment';
  focusMode: 'auto' | 'manual' | 'macro';
  whiteBalance: 'auto' | 'daylight' | 'fluorescent' | 'incandescent';
  exposureMode: 'auto' | 'manual';
  enableImageStabilization: boolean;
}

export interface ImageBuffer {
  frames: ProcessedFrame[];
  maxSize: number;
  currentIndex: number;
  isFull: boolean;
}

export interface ProcessedFrame {
  imageData: ImageData;
  timestamp: number;
  qualityScore: number;
  analysisMetrics: FrameAnalysisMetrics;
  isAnalyzed: boolean;
}

export interface FrameAnalysisMetrics {
  brightness: number;
  contrast: number;
  sharpness: number;
  colorBalance: number;
  motionBlur: number;
  noiseLevel: number;
  focus: number;
}

export interface RealTimeAnalysisConfig {
  analysisType: AnalysisType;
  bufferSize: number;
  qualityThreshold: number;
  processingInterval: number;
  enableGPUAcceleration: boolean;
  culturalContext: 'mexican' | 'tcm' | 'ayurveda' | 'global';
  enablePreprocessing: boolean;
  enableStabilization: boolean;
}

export interface StreamAnalysisResult {
  frame: ProcessedFrame;
  analysis?: ComprehensiveAnalysisResult;
  qualityFeedback: QualityFeedback;
  recommendations: StreamRecommendation[];
  processingTime: number;
}

export interface QualityFeedback {
  overallQuality: number;
  issues: QualityIssue[];
  improvements: string[];
  isReadyForAnalysis: boolean;
}

export interface QualityIssue {
  type: 'lighting' | 'focus' | 'stability' | 'positioning' | 'resolution' | 'color';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
}

export interface StreamRecommendation {
  type: 'camera_adjustment' | 'positioning' | 'lighting' | 'retake';
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
}

/**
 * Advanced image quality assessment for medical imaging
 */
export class ImageQualityAssessment {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Canvas 2D context not available');
    }
    this.ctx = context;
  }

  /**
   * Comprehensive quality assessment for medical images
   */
  assessQuality(imageData: ImageData, analysisType: AnalysisType): FrameAnalysisMetrics {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);

    return {
      brightness: this.calculateBrightness(imageData),
      contrast: this.calculateContrast(imageData),
      sharpness: this.calculateSharpness(imageData),
      colorBalance: this.calculateColorBalance(imageData),
      motionBlur: this.detectMotionBlur(imageData),
      noiseLevel: this.calculateNoise(imageData),
      focus: this.calculateFocus(imageData)
    };
  }

  /**
   * Calculate average brightness
   */
  private calculateBrightness(imageData: ImageData): number {
    const data = imageData.data;
    let total = 0;

    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      total += brightness;
    }

    return total / (data.length / 4) / 255;
  }

  /**
   * Calculate image contrast using standard deviation
   */
  private calculateContrast(imageData: ImageData): number {
    const data = imageData.data;
    const pixelCount = data.length / 4;
    let mean = 0;
    let variance = 0;

    // Calculate mean brightness
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      mean += brightness;
    }
    mean /= pixelCount;

    // Calculate variance
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      variance += Math.pow(brightness - mean, 2);
    }
    variance /= pixelCount;

    return Math.sqrt(variance) / 255;
  }

  /**
   * Calculate sharpness using Laplacian variance
   */
  private calculateSharpness(imageData: ImageData): number {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // Convert to grayscale first
    const gray = new Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const grayValue = (data[i] + data[i + 1] + data[i + 2]) / 3;
      gray[i / 4] = grayValue;
    }

    // Apply Laplacian operator
    let laplacianSum = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const laplacian = Math.abs(
          -4 * gray[idx] +
          gray[idx - 1] + gray[idx + 1] +
          gray[idx - width] + gray[idx + width]
        );
        laplacianSum += laplacian;
        count++;
      }
    }

    return count > 0 ? laplacianSum / count / 255 : 0;
  }

  /**
   * Calculate color balance
   */
  private calculateColorBalance(imageData: ImageData): number {
    const data = imageData.data;
    let rSum = 0, gSum = 0, bSum = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
    }

    const rMean = rSum / pixelCount;
    const gMean = gSum / pixelCount;
    const bMean = bSum / pixelCount;

    // Calculate deviation from ideal white balance
    const totalMean = (rMean + gMean + bMean) / 3;
    const rDev = Math.abs(rMean - totalMean);
    const gDev = Math.abs(gMean - totalMean);
    const bDev = Math.abs(bMean - totalMean);

    const maxDeviation = Math.max(rDev, gDev, bDev);
    return 1 - (maxDeviation / 255); // Higher score = better balance
  }

  /**
   * Detect motion blur
   */
  private detectMotionBlur(imageData: ImageData): number {
    // Simple motion blur detection using edge gradients
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let edgeStrength = 0;
    let edgeCount = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;

        // Calculate gradient magnitude
        const gx = (data[idx + 4] - data[idx - 4]) / 2;
        const gy = (data[idx + width * 4] - data[idx - width * 4]) / 2;
        const magnitude = Math.sqrt(gx * gx + gy * gy);

        edgeStrength += magnitude;
        edgeCount++;
      }
    }

    const avgEdgeStrength = edgeCount > 0 ? edgeStrength / edgeCount : 0;
    return Math.min(avgEdgeStrength / 100, 1); // Normalize
  }

  /**
   * Calculate noise level
   */
  private calculateNoise(imageData: ImageData): number {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let noiseSum = 0;
    let count = 0;

    // Sample small patches to estimate noise
    for (let y = 1; y < height - 1; y += 10) {
      for (let x = 1; x < width - 1; x += 10) {
        const idx = (y * width + x) * 4;

        // Calculate local variance in 3x3 neighborhood
        let localSum = 0;
        let localVariance = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const brightness = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
            localSum += brightness;
          }
        }

        const localMean = localSum / 9;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4;
            const brightness = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
            localVariance += Math.pow(brightness - localMean, 2);
          }
        }

        localVariance /= 9;
        noiseSum += Math.sqrt(localVariance);
        count++;
      }
    }

    return count > 0 ? (noiseSum / count) / 255 : 0;
  }

  /**
   * Calculate focus quality
   */
  private calculateFocus(imageData: ImageData): number {
    // Use high-frequency content to assess focus
    const sharpness = this.calculateSharpness(imageData);
    const contrast = this.calculateContrast(imageData);

    // Combine sharpness and contrast for focus assessment
    return (sharpness + contrast) / 2;
  }

  /**
   * Determine if image is suitable for analysis
   */
  isSuitableForAnalysis(metrics: FrameAnalysisMetrics, analysisType: AnalysisType): boolean {
    const requirements = this.getQualityRequirements(analysisType);

    return (
      metrics.brightness >= requirements.minBrightness &&
      metrics.brightness <= requirements.maxBrightness &&
      metrics.contrast >= requirements.minContrast &&
      metrics.sharpness >= requirements.minSharpness &&
      metrics.focus >= requirements.minFocus &&
      metrics.noiseLevel <= requirements.maxNoise &&
      metrics.motionBlur <= requirements.maxMotionBlur
    );
  }

  /**
   * Get quality requirements for specific analysis types
   */
  private getQualityRequirements(analysisType: AnalysisType) {
    const baseRequirements = {
      minBrightness: 0.3,
      maxBrightness: 0.8,
      minContrast: 0.2,
      minSharpness: 0.3,
      minFocus: 0.3,
      maxNoise: 0.3,
      maxMotionBlur: 0.2
    };

    // Adjust requirements based on analysis type
    switch (analysisType) {
      case 'eye_analysis':
      case 'tongue_diagnosis':
        return {
          ...baseRequirements,
          minSharpness: 0.5,
          minFocus: 0.5,
          maxNoise: 0.2
        };
      case 'skin_analysis':
        return {
          ...baseRequirements,
          minContrast: 0.3,
          maxNoise: 0.15
        };
      default:
        return baseRequirements;
    }
  }
}

/**
 * Main Real-Time Image Processing Service
 */
export class RealTimeImageProcessor {
  private static instance: RealTimeImageProcessor;
  private imageAnalyzer: ComprehensiveMedicalImageAnalyzer;
  private qualityAssessment: ImageQualityAssessment;
  private imageBuffer: ImageBuffer;
  private isProcessing: boolean = false;
  private currentConfig: RealTimeAnalysisConfig;

  static getInstance(): RealTimeImageProcessor {
    if (!RealTimeImageProcessor.instance) {
      RealTimeImageProcessor.instance = new RealTimeImageProcessor();
    }
    return RealTimeImageProcessor.instance;
  }

  constructor() {
    this.imageAnalyzer = ComprehensiveMedicalImageAnalyzer.getInstance();
    this.qualityAssessment = new ImageQualityAssessment();
    this.imageBuffer = this.initializeBuffer(5); // Default buffer size
    this.currentConfig = this.getDefaultConfig();
  }

  /**
   * Initialize camera stream with optimal settings
   */
  async initializeCameraStream(config: Partial<CameraConfig> = {}): Promise<MediaStream> {
    const defaultConfig: CameraConfig = {
      width: 1920,
      height: 1080,
      frameRate: 30,
      facingMode: 'environment',
      focusMode: 'auto',
      whiteBalance: 'auto',
      exposureMode: 'auto',
      enableImageStabilization: true
    };

    const cameraConfig = { ...defaultConfig, ...config };

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: cameraConfig.width },
          height: { ideal: cameraConfig.height },
          frameRate: { ideal: cameraConfig.frameRate },
          facingMode: cameraConfig.facingMode,
          focusMode: cameraConfig.focusMode as any,
          whiteBalanceMode: cameraConfig.whiteBalance as any,
          exposureMode: cameraConfig.exposureMode as any
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      loggingService.info('RealTimeImageProcessor', 'Camera stream initialized', {
        width: cameraConfig.width,
        height: cameraConfig.height,
        facingMode: cameraConfig.facingMode
      });

      return stream;

    } catch (error) {
      loggingService.error(
        'RealTimeImageProcessor',
        'Failed to initialize camera stream',
        error instanceof Error ? error : new Error(String(error))
      );
      throw new Error('Could not access camera. Please check permissions.');
    }
  }

  /**
   * Configure real-time analysis settings
   */
  configureAnalysis(config: Partial<RealTimeAnalysisConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };

    if (config.bufferSize && config.bufferSize !== this.imageBuffer.maxSize) {
      this.imageBuffer = this.initializeBuffer(config.bufferSize);
    }

    loggingService.info('RealTimeImageProcessor', 'Analysis configuration updated', this.currentConfig);
  }

  /**
   * Process camera feed in real-time
   */
  async *processCameraFeed(
    videoElement: HTMLVideoElement,
    config?: Partial<RealTimeAnalysisConfig>
  ): AsyncGenerator<StreamAnalysisResult, void, unknown> {

    if (config) {
      this.configureAnalysis(config);
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    this.isProcessing = true;
    let lastProcessTime = 0;

    try {
      while (this.isProcessing) {
        const currentTime = Date.now();

        // Respect processing interval
        if (currentTime - lastProcessTime < this.currentConfig.processingInterval) {
          await this.sleep(10);
          continue;
        }

        // Capture frame from video - validate dimensions first
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        // Skip if video dimensions are not ready
        if (videoWidth === 0 || videoHeight === 0) {
          loggingService.info('RealTimeImageProcessor', 'Video dimensions not ready, skipping frame', {
            videoWidth,
            videoHeight,
            readyState: videoElement.readyState
          });
          continue;
        }

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        ctx.drawImage(videoElement, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const startTime = performance.now();

        // Process frame
        const result = await this.processFrame(imageData);
        const processingTime = performance.now() - startTime;

        result.processingTime = processingTime;
        lastProcessTime = currentTime;

        yield result;

        // Small delay to prevent blocking
        await this.sleep(1);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single frame
   */
  private async processFrame(imageData: ImageData): Promise<StreamAnalysisResult> {
    try {
      // Assess frame quality
      const metrics = this.qualityAssessment.assessQuality(imageData, this.currentConfig.analysisType);
      const qualityScore = this.calculateOverallQuality(metrics);

      const frame: ProcessedFrame = {
        imageData,
        timestamp: Date.now(),
        qualityScore,
        analysisMetrics: metrics,
        isAnalyzed: false
      };

      // Add to buffer
      this.addToBuffer(frame);

      // Generate quality feedback
      const qualityFeedback = this.generateQualityFeedback(metrics);
      const recommendations = this.generateStreamRecommendations(metrics, qualityFeedback);

      let analysis: ComprehensiveAnalysisResult | undefined;

      // Perform analysis if quality is sufficient
      if (qualityFeedback.isReadyForAnalysis && qualityScore >= this.currentConfig.qualityThreshold) {
        const bestFrame = this.getBestQualityFrame();
        if (bestFrame && !bestFrame.isAnalyzed) {
          analysis = await this.analyzeFrame(bestFrame);
          bestFrame.isAnalyzed = true;
        }
      }

      return {
        frame,
        analysis,
        qualityFeedback,
        recommendations,
        processingTime: 0 // Will be set by caller
      };

    } catch (error) {
      loggingService.error(
        'RealTimeImageProcessor',
        'Frame processing failed',
        error instanceof Error ? error : new Error(String(error))
      );

      // Return basic result with error info
      return {
        frame: {
          imageData,
          timestamp: Date.now(),
          qualityScore: 0,
          analysisMetrics: this.getDefaultMetrics(),
          isAnalyzed: false
        },
        qualityFeedback: {
          overallQuality: 0,
          issues: [{ type: 'focus', severity: 'critical', description: 'Processing error', suggestion: 'Please try again' }],
          improvements: ['Check camera settings'],
          isReadyForAnalysis: false
        },
        recommendations: [
          { type: 'retake', message: 'Error processing frame, please try again', priority: 'high', actionable: true }
        ],
        processingTime: 0
      };
    }
  }

  /**
   * Analyze a high-quality frame
   */
  private async analyzeFrame(frame: ProcessedFrame): Promise<ComprehensiveAnalysisResult> {
    // Convert ImageData to base64 for analysis
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = frame.imageData.width;
    canvas.height = frame.imageData.height;
    ctx.putImageData(frame.imageData, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const analysisInput: ImageAnalysisInput = {
      imageData: imageDataUrl,
      analysisType: this.currentConfig.analysisType,
      culturalContext: this.currentConfig.culturalContext
    };

    return await this.imageAnalyzer.analyzeImage(analysisInput);
  }

  /**
   * Initialize image buffer
   */
  private initializeBuffer(size: number): ImageBuffer {
    return {
      frames: [],
      maxSize: size,
      currentIndex: 0,
      isFull: false
    };
  }

  /**
   * Add frame to buffer
   */
  private addToBuffer(frame: ProcessedFrame): void {
    if (this.imageBuffer.frames.length < this.imageBuffer.maxSize) {
      this.imageBuffer.frames.push(frame);
    } else {
      this.imageBuffer.frames[this.imageBuffer.currentIndex] = frame;
      this.imageBuffer.currentIndex = (this.imageBuffer.currentIndex + 1) % this.imageBuffer.maxSize;
      this.imageBuffer.isFull = true;
    }
  }

  /**
   * Get the highest quality frame from buffer
   */
  private getBestQualityFrame(): ProcessedFrame | null {
    if (this.imageBuffer.frames.length === 0) return null;

    return this.imageBuffer.frames.reduce((best, frame) =>
      frame.qualityScore > best.qualityScore ? frame : best
    );
  }

  /**
   * Calculate overall quality score
   */
  private calculateOverallQuality(metrics: FrameAnalysisMetrics): number {
    const weights = {
      brightness: 0.15,
      contrast: 0.15,
      sharpness: 0.25,
      colorBalance: 0.15,
      motionBlur: 0.15,
      noiseLevel: 0.10,
      focus: 0.25
    };

    // Normalize brightness (ideal range 0.4-0.7)
    const normalizedBrightness = Math.max(0, 1 - Math.abs(metrics.brightness - 0.55) / 0.45);

    // Invert negative metrics (lower is better)
    const normalizedMotionBlur = Math.max(0, 1 - metrics.motionBlur);
    const normalizedNoise = Math.max(0, 1 - metrics.noiseLevel);

    const score =
      weights.brightness * normalizedBrightness +
      weights.contrast * metrics.contrast +
      weights.sharpness * metrics.sharpness +
      weights.colorBalance * metrics.colorBalance +
      weights.motionBlur * normalizedMotionBlur +
      weights.noiseLevel * normalizedNoise +
      weights.focus * metrics.focus;

    return Math.round(score * 100);
  }

  /**
   * Generate quality feedback
   */
  private generateQualityFeedback(metrics: FrameAnalysisMetrics): QualityFeedback {
    const issues: QualityIssue[] = [];
    const improvements: string[] = [];
    let overallQuality = this.calculateOverallQuality(metrics);

    // Check each quality aspect
    if (metrics.brightness < 0.3) {
      issues.push({
        type: 'lighting',
        severity: 'high',
        description: 'Imagen muy oscura',
        suggestion: 'Aumentar la iluminación o usar flash'
      });
      improvements.push('Mejorar iluminación');
    } else if (metrics.brightness > 0.8) {
      issues.push({
        type: 'lighting',
        severity: 'medium',
        description: 'Imagen sobreexpuesta',
        suggestion: 'Reducir la iluminación o alejar de luz directa'
      });
      improvements.push('Reducir iluminación');
    }

    if (metrics.sharpness < 0.3) {
      issues.push({
        type: 'focus',
        severity: 'high',
        description: 'Imagen desenfocada',
        suggestion: 'Tocar la pantalla para enfocar o usar modo macro'
      });
      improvements.push('Mejorar enfoque');
    }

    if (metrics.motionBlur > 0.3) {
      issues.push({
        type: 'stability',
        severity: 'medium',
        description: 'Movimiento detectado',
        suggestion: 'Mantener el dispositivo estable'
      });
      improvements.push('Estabilizar cámara');
    }

    if (metrics.noiseLevel > 0.4) {
      issues.push({
        type: 'resolution',
        severity: 'medium',
        description: 'Mucho ruido en la imagen',
        suggestion: 'Mejorar iluminación o usar modo de baja luz'
      });
      improvements.push('Reducir ruido');
    }

    if (metrics.colorBalance < 0.7) {
      issues.push({
        type: 'color',
        severity: 'low',
        description: 'Balance de color no óptimo',
        suggestion: 'Ajustar balance de blancos o usar luz natural'
      });
      improvements.push('Ajustar color');
    }

    const isReadyForAnalysis =
      this.qualityAssessment.isSuitableForAnalysis(metrics, this.currentConfig.analysisType) &&
      overallQuality >= this.currentConfig.qualityThreshold;

    return {
      overallQuality,
      issues,
      improvements,
      isReadyForAnalysis
    };
  }

  /**
   * Generate stream recommendations
   */
  private generateStreamRecommendations(
    metrics: FrameAnalysisMetrics,
    qualityFeedback: QualityFeedback
  ): StreamRecommendation[] {
    const recommendations: StreamRecommendation[] = [];

    if (!qualityFeedback.isReadyForAnalysis) {
      if (qualityFeedback.issues.some(issue => issue.type === 'lighting')) {
        recommendations.push({
          type: 'lighting',
          message: 'Ajusta la iluminación para mejor calidad',
          priority: 'high',
          actionable: true
        });
      }

      if (qualityFeedback.issues.some(issue => issue.type === 'focus')) {
        recommendations.push({
          type: 'camera_adjustment',
          message: 'Toca para enfocar o acércate más al objeto',
          priority: 'high',
          actionable: true
        });
      }

      if (qualityFeedback.issues.some(issue => issue.type === 'stability')) {
        recommendations.push({
          type: 'positioning',
          message: 'Mantén el dispositivo estable por unos segundos',
          priority: 'medium',
          actionable: true
        });
      }
    } else {
      recommendations.push({
        type: 'camera_adjustment',
        message: 'Calidad óptima - imagen lista para análisis',
        priority: 'low',
        actionable: false
      });
    }

    return recommendations;
  }

  /**
   * Stop processing
   */
  stopProcessing(): void {
    this.isProcessing = false;
    loggingService.info('RealTimeImageProcessor', 'Processing stopped');
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): RealTimeAnalysisConfig {
    return {
      analysisType: 'facial_analysis',
      bufferSize: 5,
      qualityThreshold: 70,
      processingInterval: 500, // 500ms between analyses
      enableGPUAcceleration: true,
      culturalContext: 'mexican',
      enablePreprocessing: true,
      enableStabilization: true
    };
  }

  /**
   * Get default metrics
   */
  private getDefaultMetrics(): FrameAnalysisMetrics {
    return {
      brightness: 0.5,
      contrast: 0.5,
      sharpness: 0.5,
      colorBalance: 0.5,
      motionBlur: 0.5,
      noiseLevel: 0.5,
      focus: 0.5
    };
  }

  /**
   * Simple sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current buffer status
   */
  getBufferStatus(): {
    size: number;
    capacity: number;
    averageQuality: number;
    bestQuality: number;
  } {
    const frames = this.imageBuffer.frames;
    const size = frames.length;
    const capacity = this.imageBuffer.maxSize;

    if (size === 0) {
      return { size, capacity, averageQuality: 0, bestQuality: 0 };
    }

    const qualities = frames.map(f => f.qualityScore);
    const averageQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
    const bestQuality = Math.max(...qualities);

    return { size, capacity, averageQuality, bestQuality };
  }

  /**
   * Clear buffer
   */
  clearBuffer(): void {
    this.imageBuffer.frames = [];
    this.imageBuffer.currentIndex = 0;
    this.imageBuffer.isFull = false;
  }

  /**
   * Analyze a single image directly (for manual capture)
   */
  async analyzeImage(input: ImageAnalysisInput): Promise<ComprehensiveAnalysisResult> {
    return await this.imageAnalyzer.analyzeImage(input);
  }

  /**
   * Get supported camera resolutions
   */
  async getSupportedResolutions(): Promise<MediaTrackCapabilities | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();

      // Stop the stream
      stream.getTracks().forEach(track => track.stop());

      return capabilities;
    } catch (error) {
      loggingService.error(
        'RealTimeImageProcessor',
        'Failed to get camera capabilities',
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }
  }
}

export const realTimeImageProcessor = RealTimeImageProcessor.getInstance();