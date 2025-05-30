/**
 * RealImageProcessor - Actual pixel-level image analysis
 * 
 * Replaces mock analysis with real computer vision algorithms
 * that process actual image data and generate dynamic results.
 */

import { loggingService } from './LoggingService';

export interface ImageAnalysisMetrics {
  brightness: number;           // 0-100
  contrast: number;            // 0-100  
  sharpness: number;          // 0-100
  colorProfile: ColorProfile;
  textureMetrics: TextureMetrics;
  qualityScore: number;       // Overall image quality 0-100
}

export interface ColorProfile {
  dominantColors: ColorInfo[];
  skinToneDetected: boolean;
  skinToneRange: HSVRange | null;
  redChannel: ChannelStats;
  greenChannel: ChannelStats;
  blueChannel: ChannelStats;
  saturation: number;         // 0-100
  warmth: number;            // -100 to 100 (cold to warm)
}

export interface ColorInfo {
  rgb: [number, number, number];
  hsv: [number, number, number];
  percentage: number;
  description: string;
}

export interface HSVRange {
  hMin: number; hMax: number;
  sMin: number; sMax: number;
  vMin: number; vMax: number;
}

export interface ChannelStats {
  mean: number;
  variance: number;
  skewness: number;
  range: number;
}

export interface TextureMetrics {
  roughness: number;          // 0-100
  uniformity: number;         // 0-100
  edgeDensity: number;       // 0-100
  localVariance: number;     // 0-100
  gradientMagnitude: number; // 0-100
}

export interface ImageRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  confidence: number;
}

export interface SkinRegion extends ImageRegion {
  skinType: 'face' | 'hand' | 'arm' | 'body' | 'unknown';
  averageColor: [number, number, number];
  textureScore: number;
  healthIndicators: SkinHealthIndicator[];
}

export interface SkinHealthIndicator {
  type: 'hydration' | 'inflammation' | 'pigmentation' | 'texture' | 'blemish';
  severity: 'low' | 'moderate' | 'high';
  confidence: number;
  location: { x: number; y: number; width: number; height: number };
  description: string;
}

/**
 * Real Image Processing Engine
 */
export class RealImageProcessor {
  private static instance: RealImageProcessor;

  static getInstance(): RealImageProcessor {
    if (!RealImageProcessor.instance) {
      RealImageProcessor.instance = new RealImageProcessor();
    }
    return RealImageProcessor.instance;
  }

  /**
   * Main analysis method - processes actual pixel data
   */
  async analyzePixelData(imageData: ImageData): Promise<ImageAnalysisMetrics> {
    loggingService.info('RealImageProcessor', 'Starting real pixel analysis', {
      width: imageData.width,
      height: imageData.height,
      pixelCount: imageData.data.length / 4
    });

    const startTime = performance.now();

    try {
      // Parallel analysis of different metrics
      const [
        brightness,
        contrast,
        sharpness,
        colorProfile,
        textureMetrics
      ] = await Promise.all([
        this.calculateBrightness(imageData.data),
        this.calculateContrast(imageData.data),
        this.detectSharpness(imageData),
        this.analyzeColorDistribution(imageData),
        this.analyzeTexture(imageData)
      ]);

      // Calculate overall quality score
      const qualityScore = this.calculateQualityScore({
        brightness, contrast, sharpness, colorProfile, textureMetrics
      });

      const duration = performance.now() - startTime;
      
      loggingService.info('RealImageProcessor', 'Pixel analysis completed', {
        duration: `${duration.toFixed(2)}ms`,
        qualityScore,
        brightness,
        contrast,
        sharpness
      });

      return {
        brightness,
        contrast,
        sharpness,
        colorProfile,
        textureMetrics,
        qualityScore
      };

    } catch (error) {
      loggingService.error('RealImageProcessor', 'Pixel analysis failed', error as Error);
      throw new Error(`Image analysis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate actual image brightness from pixel data
   */
  private async calculateBrightness(data: Uint8ClampedArray): Promise<number> {
    let totalBrightness = 0;
    const pixelCount = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
      // Use luminance formula for accurate brightness
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalBrightness += luminance;
    }

    return (totalBrightness / pixelCount) / 255 * 100;
  }

  /**
   * Calculate actual image contrast
   */
  private async calculateContrast(data: Uint8ClampedArray): Promise<number> {
    const pixelCount = data.length / 4;
    let luminanceValues: number[] = [];

    // Calculate luminance for each pixel
    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      luminanceValues.push(luminance);
    }

    // Calculate mean
    const mean = luminanceValues.reduce((sum, val) => sum + val, 0) / pixelCount;

    // Calculate variance
    const variance = luminanceValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pixelCount;

    // Convert to contrast percentage (0-100)
    const contrast = Math.sqrt(variance) / 255 * 100;
    return Math.min(contrast, 100);
  }

  /**
   * Detect image sharpness using edge detection
   */
  private async detectSharpness(imageData: ImageData): Promise<number> {
    const { data, width, height } = imageData;
    
    // Sobel edge detection
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    let totalGradient = 0;
    let edgePixels = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;

        // Apply Sobel kernels
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
            const gray = 0.299 * data[pixelIndex] + 0.587 * data[pixelIndex + 1] + 0.114 * data[pixelIndex + 2];
            
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            gx += gray * sobelX[kernelIndex];
            gy += gray * sobelY[kernelIndex];
          }
        }

        const gradient = Math.sqrt(gx * gx + gy * gy);
        totalGradient += gradient;
        edgePixels++;
      }
    }

    const averageGradient = totalGradient / edgePixels;
    return Math.min((averageGradient / 255) * 100, 100);
  }

  /**
   * Analyze color distribution and detect skin tones
   */
  private async analyzeColorDistribution(imageData: ImageData): Promise<ColorProfile> {
    const { data } = imageData;
    const colorMap = new Map<string, number>();
    const pixelCount = data.length / 4;

    let rSum = 0, gSum = 0, bSum = 0;
    let rVariance = 0, gVariance = 0, bVariance = 0;

    // First pass: collect color data
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      rSum += r;
      gSum += g;
      bSum += b;

      // Quantize colors for distribution analysis
      const quantizedColor = `${Math.floor(r/32)*32},${Math.floor(g/32)*32},${Math.floor(b/32)*32}`;
      colorMap.set(quantizedColor, (colorMap.get(quantizedColor) || 0) + 1);
    }

    const rMean = rSum / pixelCount;
    const gMean = gSum / pixelCount;
    const bMean = bSum / pixelCount;

    // Second pass: calculate variance
    for (let i = 0; i < data.length; i += 4) {
      rVariance += Math.pow(data[i] - rMean, 2);
      gVariance += Math.pow(data[i + 1] - gMean, 2);
      bVariance += Math.pow(data[i + 2] - bMean, 2);
    }

    // Get dominant colors
    const dominantColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color, count]) => {
        const [r, g, b] = color.split(',').map(Number);
        const hsv = this.rgbToHsv(r, g, b);
        return {
          rgb: [r, g, b] as [number, number, number],
          hsv: hsv as [number, number, number],
          percentage: (count / pixelCount) * 100,
          description: this.describeColor(r, g, b)
        };
      });

    // Detect skin tone
    const skinDetection = this.detectSkinTone(dominantColors);

    // Calculate saturation and warmth
    const saturation = this.calculateSaturation(dominantColors);
    const warmth = this.calculateWarmth(dominantColors);

    return {
      dominantColors,
      skinToneDetected: skinDetection.detected,
      skinToneRange: skinDetection.range,
      redChannel: {
        mean: rMean,
        variance: rVariance / pixelCount,
        skewness: 0, // Simplified for now
        range: 255
      },
      greenChannel: {
        mean: gMean,
        variance: gVariance / pixelCount,
        skewness: 0,
        range: 255
      },
      blueChannel: {
        mean: bMean,
        variance: bVariance / pixelCount,
        skewness: 0,
        range: 255
      },
      saturation,
      warmth
    };
  }

  /**
   * Analyze texture patterns
   */
  private async analyzeTexture(imageData: ImageData): Promise<TextureMetrics> {
    const { data, width, height } = imageData;
    
    // Convert to grayscale for texture analysis
    const grayData = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      grayData[i / 4] = gray;
    }

    const roughness = this.calculateRoughness(grayData, width, height);
    const uniformity = this.calculateUniformity(grayData);
    const edgeDensity = this.calculateEdgeDensity(grayData, width, height);
    const localVariance = this.calculateLocalVariance(grayData, width, height);
    const gradientMagnitude = this.calculateGradientMagnitude(grayData, width, height);

    return {
      roughness,
      uniformity,
      edgeDensity,
      localVariance,
      gradientMagnitude
    };
  }

  /**
   * Detect skin regions in the image
   */
  async detectSkinRegions(imageData: ImageData): Promise<SkinRegion[]> {
    const { data, width, height } = imageData;
    const skinRegions: SkinRegion[] = [];
    
    // Skin detection in HSV color space
    const skinPixels: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixelIndex = (y * width + x) * 4;
        const r = data[pixelIndex];
        const g = data[pixelIndex + 1];
        const b = data[pixelIndex + 2];
        
        if (this.isSkinColor(r, g, b)) {
          skinPixels[y][x] = true;
        }
      }
    }
    
    // Find connected components (skin regions)
    const visited: boolean[][] = Array(height).fill(null).map(() => Array(width).fill(false));
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (skinPixels[y][x] && !visited[y][x]) {
          const region = this.floodFillSkinRegion(skinPixels, visited, x, y, width, height);
          
          if (region.pixels.length > 100) { // Minimum region size
            const skinRegion = this.createSkinRegion(region, imageData);
            skinRegions.push(skinRegion);
          }
        }
      }
    }
    
    loggingService.info('RealImageProcessor', 'Skin regions detected', {
      regionCount: skinRegions.length,
      totalSkinPixels: skinRegions.reduce((sum, region) => sum + region.pixels.length / 4, 0)
    });
    
    return skinRegions;
  }

  // Helper methods
  private rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return [h, Math.round(s * 100), Math.round(v * 100)];
  }

  private isSkinColor(r: number, g: number, b: number): boolean {
    // Skin detection rules in RGB space
    const [h, s, v] = this.rgbToHsv(r, g, b);
    
    // HSV ranges for skin detection
    return (
      ((h >= 0 && h <= 25) || (h >= 335 && h <= 360)) && // Hue range
      (s >= 10 && s <= 70) && // Saturation range
      (v >= 20 && v <= 95)    // Value range
    ) && (
      r > 95 && g > 40 && b > 20 && // RGB constraints
      r > g && r > b && // More red than green/blue
      Math.abs(r - g) > 15 // Sufficient red-green difference
    );
  }

  private detectSkinTone(dominantColors: ColorInfo[]): { detected: boolean; range: HSVRange | null } {
    const skinColors = dominantColors.filter(color => 
      this.isSkinColor(color.rgb[0], color.rgb[1], color.rgb[2])
    );
    
    if (skinColors.length === 0) {
      return { detected: false, range: null };
    }
    
    // Calculate HSV range for detected skin tones
    const hValues = skinColors.map(c => c.hsv[0]);
    const sValues = skinColors.map(c => c.hsv[1]);
    const vValues = skinColors.map(c => c.hsv[2]);
    
    return {
      detected: true,
      range: {
        hMin: Math.min(...hValues),
        hMax: Math.max(...hValues),
        sMin: Math.min(...sValues),
        sMax: Math.max(...sValues),
        vMin: Math.min(...vValues),
        vMax: Math.max(...vValues)
      }
    };
  }

  private calculateSaturation(dominantColors: ColorInfo[]): number {
    const avgSaturation = dominantColors.reduce((sum, color) => sum + color.hsv[1], 0) / dominantColors.length;
    return avgSaturation;
  }

  private calculateWarmth(dominantColors: ColorInfo[]): number {
    // Calculate warmth based on color temperature
    let warmthScore = 0;
    
    dominantColors.forEach(color => {
      const [r, g, b] = color.rgb;
      const [h] = color.hsv;
      
      // Warm colors (reds, oranges, yellows)
      if (h >= 0 && h <= 60) {
        warmthScore += color.percentage * 2;
      }
      // Cool colors (blues, greens)
      else if (h >= 180 && h <= 300) {
        warmthScore -= color.percentage * 2;
      }
      
      // Red vs Blue balance
      warmthScore += ((r - b) / 255) * color.percentage;
    });
    
    return Math.max(-100, Math.min(100, warmthScore));
  }

  private describeColor(r: number, g: number, b: number): string {
    const [h, s, v] = this.rgbToHsv(r, g, b);
    
    if (v < 20) return 'very dark';
    if (v > 80 && s < 10) return 'light/white';
    if (s < 10) return 'gray';
    
    if (h >= 0 && h < 15) return 'red';
    if (h >= 15 && h < 45) return 'orange';
    if (h >= 45 && h < 75) return 'yellow';
    if (h >= 75 && h < 150) return 'green';
    if (h >= 150 && h < 210) return 'cyan';
    if (h >= 210 && h < 270) return 'blue';
    if (h >= 270 && h < 330) return 'purple';
    if (h >= 330) return 'pink/red';
    
    return 'unknown';
  }

  private calculateRoughness(grayData: Uint8Array, width: number, height: number): number {
    let totalVariation = 0;
    let count = 0;
    
    const windowSize = 3;
    for (let y = windowSize; y < height - windowSize; y++) {
      for (let x = windowSize; x < width - windowSize; x++) {
        let localVariation = 0;
        const centerValue = grayData[y * width + x];
        
        for (let dy = -windowSize; dy <= windowSize; dy++) {
          for (let dx = -windowSize; dx <= windowSize; dx++) {
            const neighborValue = grayData[(y + dy) * width + (x + dx)];
            localVariation += Math.abs(neighborValue - centerValue);
          }
        }
        
        totalVariation += localVariation;
        count++;
      }
    }
    
    const averageVariation = totalVariation / count;
    return (averageVariation / 255) * 100;
  }

  private calculateUniformity(grayData: Uint8Array): number {
    const histogram = new Array(256).fill(0);
    
    for (let i = 0; i < grayData.length; i++) {
      histogram[grayData[i]]++;
    }
    
    // Calculate entropy (inverse of uniformity)
    let entropy = 0;
    const total = grayData.length;
    
    for (let i = 0; i < 256; i++) {
      if (histogram[i] > 0) {
        const probability = histogram[i] / total;
        entropy -= probability * Math.log2(probability);
      }
    }
    
    // Convert entropy to uniformity percentage (higher entropy = lower uniformity)
    const maxEntropy = Math.log2(256);
    return (1 - entropy / maxEntropy) * 100;
  }

  private calculateEdgeDensity(grayData: Uint8Array, width: number, height: number): number {
    let edgeCount = 0;
    const threshold = 30; // Edge detection threshold
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = grayData[y * width + x];
        const right = grayData[y * width + (x + 1)];
        const bottom = grayData[(y + 1) * width + x];
        
        if (Math.abs(center - right) > threshold || Math.abs(center - bottom) > threshold) {
          edgeCount++;
        }
      }
    }
    
    const totalPixels = (width - 2) * (height - 2);
    return (edgeCount / totalPixels) * 100;
  }

  private calculateLocalVariance(grayData: Uint8Array, width: number, height: number): number {
    let totalVariance = 0;
    let count = 0;
    
    const windowSize = 5;
    for (let y = windowSize; y < height - windowSize; y += windowSize) {
      for (let x = windowSize; x < width - windowSize; x += windowSize) {
        let sum = 0;
        let sumSquared = 0;
        let pixelCount = 0;
        
        for (let dy = -windowSize; dy <= windowSize; dy++) {
          for (let dx = -windowSize; dx <= windowSize; dx++) {
            const value = grayData[(y + dy) * width + (x + dx)];
            sum += value;
            sumSquared += value * value;
            pixelCount++;
          }
        }
        
        const mean = sum / pixelCount;
        const variance = (sumSquared / pixelCount) - (mean * mean);
        totalVariance += variance;
        count++;
      }
    }
    
    const averageVariance = totalVariance / count;
    return (averageVariance / (255 * 255)) * 100;
  }

  private calculateGradientMagnitude(grayData: Uint8Array, width: number, height: number): number {
    let totalGradient = 0;
    let count = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = grayData[y * width + x];
        const right = grayData[y * width + (x + 1)];
        const left = grayData[y * width + (x - 1)];
        const top = grayData[(y - 1) * width + x];
        const bottom = grayData[(y + 1) * width + x];
        
        const gx = (right - left) / 2;
        const gy = (bottom - top) / 2;
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        totalGradient += magnitude;
        count++;
      }
    }
    
    const averageGradient = totalGradient / count;
    return (averageGradient / 255) * 100;
  }

  private calculateQualityScore(metrics: Omit<ImageAnalysisMetrics, 'qualityScore'>): number {
    const { brightness, contrast, sharpness, textureMetrics } = metrics;
    
    // Quality weights
    const brightnessWeight = 0.2;
    const contrastWeight = 0.3;
    const sharpnessWeight = 0.3;
    const textureWeight = 0.2;
    
    // Optimal ranges and scoring
    const brightnessScore = Math.max(0, 100 - Math.abs(brightness - 50) * 2); // Optimal around 50%
    const contrastScore = Math.min(contrast * 2, 100); // Higher contrast generally better
    const sharpnessScore = sharpness; // Higher sharpness better
    const textureScore = (textureMetrics.uniformity + textureMetrics.edgeDensity) / 2;
    
    const qualityScore = 
      brightnessScore * brightnessWeight +
      contrastScore * contrastWeight +
      sharpnessScore * sharpnessWeight +
      textureScore * textureWeight;
    
    return Math.round(qualityScore);
  }

  private floodFillSkinRegion(
    skinPixels: boolean[][], 
    visited: boolean[][], 
    startX: number, 
    startY: number, 
    width: number, 
    height: number
  ): { pixels: Array<{x: number, y: number}>, bounds: {minX: number, maxX: number, minY: number, maxY: number} } {
    const pixels: Array<{x: number, y: number}> = [];
    const stack: Array<{x: number, y: number}> = [{x: startX, y: startY}];
    
    let minX = startX, maxX = startX, minY = startY, maxY = startY;
    
    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited[y][x] || !skinPixels[y][x]) {
        continue;
      }
      
      visited[y][x] = true;
      pixels.push({x, y});
      
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      
      // Add neighboring pixels
      stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1});
    }
    
    return { pixels, bounds: {minX, maxX, minY, maxY} };
  }

  private createSkinRegion(regionData: any, imageData: ImageData): SkinRegion {
    const { pixels, bounds } = regionData;
    const { data, width } = imageData;
    
    // Extract pixel data for this region
    const regionPixels = new Uint8ClampedArray(pixels.length * 4);
    let rSum = 0, gSum = 0, bSum = 0;
    
    pixels.forEach((pixel: {x: number, y: number}, index: number) => {
      const dataIndex = (pixel.y * width + pixel.x) * 4;
      regionPixels[index * 4] = data[dataIndex];
      regionPixels[index * 4 + 1] = data[dataIndex + 1];
      regionPixels[index * 4 + 2] = data[dataIndex + 2];
      regionPixels[index * 4 + 3] = data[dataIndex + 3];
      
      rSum += data[dataIndex];
      gSum += data[dataIndex + 1];
      bSum += data[dataIndex + 2];
    });
    
    const avgR = rSum / pixels.length;
    const avgG = gSum / pixels.length;
    const avgB = bSum / pixels.length;
    
    // Analyze skin health indicators (simplified)
    const healthIndicators: SkinHealthIndicator[] = [];
    
    // Check for potential inflammation (high red values)
    if (avgR > avgG * 1.3 && avgR > avgB * 1.3) {
      healthIndicators.push({
        type: 'inflammation',
        severity: avgR > 180 ? 'high' : 'moderate',
        confidence: 0.7,
        location: bounds,
        description: 'Potential inflammation detected based on red color dominance'
      });
    }
    
    return {
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
      pixels: regionPixels,
      confidence: 0.8,
      skinType: this.classifySkinRegion(bounds, imageData.width, imageData.height),
      averageColor: [avgR, avgG, avgB],
      textureScore: this.calculateRegionTextureScore(regionPixels),
      healthIndicators
    };
  }

  private classifySkinRegion(bounds: any, imageWidth: number, imageHeight: number): 'face' | 'hand' | 'arm' | 'body' | 'unknown' {
    const regionArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
    const imageArea = imageWidth * imageHeight;
    const areaRatio = regionArea / imageArea;
    
    // Simple heuristics for region classification
    if (areaRatio > 0.3 && bounds.minY < imageHeight / 3) {
      return 'face';
    } else if (areaRatio < 0.1) {
      return 'hand';
    } else if (areaRatio > 0.15) {
      return 'body';
    } else {
      return 'arm';
    }
  }

  private calculateRegionTextureScore(pixels: Uint8ClampedArray): number {
    // Calculate simple texture score based on pixel variance
    let variance = 0;
    let mean = 0;
    const pixelCount = pixels.length / 4;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      mean += gray;
    }
    mean /= pixelCount;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
      variance += Math.pow(gray - mean, 2);
    }
    variance /= pixelCount;
    
    return Math.min((Math.sqrt(variance) / 255) * 100, 100);
  }
}