/**
 * ImageOptimizationService - Optimize medical images for scalable analysis
 */

import { loggingService } from './LoggingService';

export interface OptimizationConfig {
  maxDimension: number;
  quality: number;
  format: 'jpeg' | 'webp' | 'png';
  preserveMetadata: boolean;
  enableProgressive: boolean;
  targetFileSize?: number; // Target size in bytes
}

export interface OptimizationResult {
  optimizedDataUrl: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  dimensions: {
    original: { width: number; height: number };
    optimized: { width: number; height: number };
  };
  processingTime: number;
}

export interface ImageMetrics {
  width: number;
  height: number;
  fileSize: number;
  format: string;
  hasAlpha: boolean;
  colorDepth: number;
}

export class ImageOptimizationService {
  private static instance: ImageOptimizationService;
  private readonly defaultConfig: OptimizationConfig = {
    maxDimension: 1920,
    quality: 0.85,
    format: 'jpeg',
    preserveMetadata: false,
    enableProgressive: true
  };

  static getInstance(): ImageOptimizationService {
    if (!ImageOptimizationService.instance) {
      ImageOptimizationService.instance = new ImageOptimizationService();
    }
    return ImageOptimizationService.instance;
  }

  /**
   * Optimize image for medical analysis
   */
  async optimizeForAnalysis(
    imageDataUrl: string,
    analysisType: string,
    config?: Partial<OptimizationConfig>
  ): Promise<OptimizationResult> {
    const startTime = performance.now();
    
    try {
      // Get analysis-specific optimization config
      const optimizationConfig = this.getAnalysisOptimizationConfig(analysisType, config);
      
      // Load image
      const img = await this.loadImage(imageDataUrl);
      const originalMetrics = await this.getImageMetrics(imageDataUrl);
      
      // Calculate optimal dimensions
      const dimensions = this.calculateOptimalDimensions(
        img.width,
        img.height,
        optimizationConfig.maxDimension
      );
      
      // Create canvas for optimization
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', {
        alpha: optimizationConfig.format === 'png',
        desynchronized: true
      });
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      // Set canvas dimensions
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
      // Apply high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw and optimize
      ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
      
      // Apply medical image enhancements
      await this.applyMedicalImageEnhancements(ctx, canvas, analysisType);
      
      // Convert to optimized format
      let optimizedDataUrl = await this.convertToFormat(
        canvas,
        optimizationConfig.format,
        optimizationConfig.quality
      );
      
      // Further optimize if target file size is specified
      if (optimizationConfig.targetFileSize) {
        optimizedDataUrl = await this.optimizeToTargetSize(
          canvas,
          optimizationConfig
        );
      }
      
      // Get final metrics
      const optimizedSize = this.getDataUrlSize(optimizedDataUrl);
      const processingTime = performance.now() - startTime;
      
      const result: OptimizationResult = {
        optimizedDataUrl,
        originalSize: originalMetrics.fileSize,
        optimizedSize,
        compressionRatio: originalMetrics.fileSize / optimizedSize,
        dimensions: {
          original: { width: img.width, height: img.height },
          optimized: { width: dimensions.width, height: dimensions.height }
        },
        processingTime
      };
      
      loggingService.info('ImageOptimizationService', 'Image optimized successfully', {
        analysisType,
        compressionRatio: result.compressionRatio.toFixed(2),
        sizeSaved: `${((1 - 1/result.compressionRatio) * 100).toFixed(1)}%`,
        processingTime: `${processingTime.toFixed(0)}ms`
      });
      
      return result;
      
    } catch (error) {
      loggingService.error('ImageOptimizationService', 'Image optimization failed', error as Error);
      throw error;
    }
  }

  /**
   * Progressive image loading for better UX
   */
  async createProgressiveVersions(
    imageDataUrl: string,
    levels: number = 3
  ): Promise<string[]> {
    const img = await this.loadImage(imageDataUrl);
    const versions: string[] = [];
    
    for (let i = 0; i < levels; i++) {
      const scale = Math.pow(2, levels - i - 1);
      const width = Math.round(img.width / scale);
      const height = Math.round(img.height / scale);
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) continue;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Lower quality for initial versions
      const quality = 0.3 + (0.5 * i / (levels - 1));
      const version = canvas.toDataURL('image/jpeg', quality);
      versions.push(version);
    }
    
    return versions;
  }

  /**
   * Batch optimize multiple images
   */
  async batchOptimize(
    images: { dataUrl: string; analysisType: string }[],
    config?: Partial<OptimizationConfig>
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];
    
    // Process in parallel with concurrency limit
    const concurrencyLimit = 3;
    
    for (let i = 0; i < images.length; i += concurrencyLimit) {
      const batch = images.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(img => this.optimizeForAnalysis(img.dataUrl, img.analysisType, config))
      );
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * Get analysis-specific optimization config
   */
  private getAnalysisOptimizationConfig(
    analysisType: string,
    userConfig?: Partial<OptimizationConfig>
  ): OptimizationConfig {
    const baseConfig = { ...this.defaultConfig, ...userConfig };
    
    // Adjust based on analysis type
    switch (analysisType) {
      case 'eye_analysis':
      case 'skin_analysis':
        // High detail needed
        return {
          ...baseConfig,
          maxDimension: 2048,
          quality: 0.9,
          format: 'jpeg'
        };
        
      case 'facial_analysis':
        // Medium detail
        return {
          ...baseConfig,
          maxDimension: 1920,
          quality: 0.85,
          format: 'jpeg'
        };
        
      case 'posture_analysis':
      case 'body_scan':
        // Lower resolution acceptable
        return {
          ...baseConfig,
          maxDimension: 1280,
          quality: 0.8,
          format: 'jpeg'
        };
        
      default:
        return baseConfig;
    }
  }

  /**
   * Apply medical image enhancements
   */
  private async applyMedicalImageEnhancements(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    analysisType: string
  ): Promise<void> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    switch (analysisType) {
      case 'skin_analysis':
        // Enhance skin tones and texture
        this.enhanceContrast(data, 1.1);
        this.adjustSaturation(data, 1.05);
        break;
        
      case 'eye_analysis':
        // Enhance iris details
        this.sharpen(data, canvas.width, canvas.height, 0.5);
        this.enhanceContrast(data, 1.2);
        break;
        
      case 'tongue_diagnosis':
        // Enhance color accuracy
        this.adjustSaturation(data, 1.1);
        this.enhanceContrast(data, 1.05);
        break;
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Enhance contrast
   */
  private enhanceContrast(data: Uint8ClampedArray, factor: number): void {
    const contrast = (factor - 1) * 255;
    const factor2 = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor2 * (data[i] - 128) + 128;
      data[i + 1] = factor2 * (data[i + 1] - 128) + 128;
      data[i + 2] = factor2 * (data[i + 2] - 128) + 128;
    }
  }

  /**
   * Adjust saturation
   */
  private adjustSaturation(data: Uint8ClampedArray, factor: number): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;
      
      data[i] = gray + factor * (r - gray);
      data[i + 1] = gray + factor * (g - gray);
      data[i + 2] = gray + factor * (b - gray);
    }
  }

  /**
   * Apply sharpening filter
   */
  private sharpen(data: Uint8ClampedArray, width: number, height: number, strength: number): void {
    const kernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];
    
    const output = new Uint8ClampedArray(data);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              const kernelIdx = (ky + 1) * 3 + (kx + 1);
              sum += data[idx] * kernel[kernelIdx];
            }
          }
          
          const idx = (y * width + x) * 4 + c;
          output[idx] = data[idx] + strength * (sum - data[idx]);
        }
      }
    }
    
    data.set(output);
  }

  /**
   * Calculate optimal dimensions maintaining aspect ratio
   */
  private calculateOptimalDimensions(
    width: number,
    height: number,
    maxDimension: number
  ): { width: number; height: number } {
    if (width <= maxDimension && height <= maxDimension) {
      return { width, height };
    }
    
    const aspectRatio = width / height;
    
    if (width > height) {
      return {
        width: maxDimension,
        height: Math.round(maxDimension / aspectRatio)
      };
    } else {
      return {
        width: Math.round(maxDimension * aspectRatio),
        height: maxDimension
      };
    }
  }

  /**
   * Convert canvas to specified format
   */
  private async convertToFormat(
    canvas: HTMLCanvasElement,
    format: 'jpeg' | 'webp' | 'png',
    quality: number
  ): Promise<string> {
    const mimeType = `image/${format}`;
    
    // Try to use toBlob for better performance
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert canvas to blob'));
            return;
          }
          
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Optimize to target file size
   */
  private async optimizeToTargetSize(
    canvas: HTMLCanvasElement,
    config: OptimizationConfig
  ): Promise<string> {
    let quality = config.quality;
    let result = await this.convertToFormat(canvas, config.format, quality);
    let size = this.getDataUrlSize(result);
    
    // Binary search for optimal quality
    let minQuality = 0.1;
    let maxQuality = quality;
    
    while (size > config.targetFileSize! && quality > minQuality) {
      if (size > config.targetFileSize! * 1.1) {
        // Far from target, aggressive reduction
        quality *= 0.8;
      } else {
        // Close to target, fine-tune
        maxQuality = quality;
        quality = (minQuality + maxQuality) / 2;
      }
      
      result = await this.convertToFormat(canvas, config.format, quality);
      size = this.getDataUrlSize(result);
      
      if (Math.abs(size - config.targetFileSize!) < config.targetFileSize! * 0.05) {
        // Within 5% of target
        break;
      }
    }
    
    return result;
  }

  /**
   * Load image from data URL
   */
  private loadImage(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * Get image metrics
   */
  private async getImageMetrics(dataUrl: string): Promise<ImageMetrics> {
    const img = await this.loadImage(dataUrl);
    const size = this.getDataUrlSize(dataUrl);
    const format = dataUrl.substring(5, dataUrl.indexOf(';')).split('/')[1];
    
    return {
      width: img.width,
      height: img.height,
      fileSize: size,
      format,
      hasAlpha: format === 'png' || format === 'webp',
      colorDepth: 24 // Assuming standard RGB
    };
  }

  /**
   * Calculate data URL size in bytes
   */
  private getDataUrlSize(dataUrl: string): number {
    const base64 = dataUrl.split(',')[1];
    return Math.round(base64.length * 0.75);
  }

  /**
   * Check if optimization is needed
   */
  shouldOptimize(imageDataUrl: string, threshold = 1024 * 1024): boolean {
    const size = this.getDataUrlSize(imageDataUrl);
    return size > threshold;
  }
}

export const imageOptimizationService = ImageOptimizationService.getInstance();