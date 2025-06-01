/**
 * ComputerVisionAnalyzer - Basic computer vision algorithms for medical image analysis
 * 
 * Implements fundamental CV techniques including:
 * - Facial landmark detection
 * - Feature extraction
 * - Object detection
 * - Pattern recognition
 */

import { loggingService } from './LoggingService';

export interface FacialLandmarks {
  eyes: Array<{
    center: Point;
    corners: Point[];
    pupil?: Point;
    iris?: Circle;
    eyelids: Point[];
  }>;
  nose: {
    tip: Point;
    bridge: Point[];
    nostrils: Point[];
  };
  mouth: {
    corners: Point[];
    upperLip: Point[];
    lowerLip: Point[];
    center: Point;
  };
  face: {
    outline: Point[];
    chin: Point;
    forehead: Point[];
  };
  confidence: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Circle {
  center: Point;
  radius: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FeatureMap {
  edges: ImageData;
  corners: Point[];
  blobs: Circle[];
  lines: Line[];
  textures: TextureRegion[];
}

export interface Line {
  start: Point;
  end: Point;
  angle: number;
  strength: number;
}

export interface TextureRegion {
  bounds: Rectangle;
  pattern: 'smooth' | 'rough' | 'uniform' | 'irregular';
  orientation: number;
  strength: number;
}

export interface SymmetryAnalysis {
  facialSymmetry: number;    // 0-100
  leftRightBalance: number;  // 0-100
  verticalAlignment: number; // 0-100
  asymmetryAreas: Rectangle[];
  symmetryScore: number;     // Overall 0-100
}

export interface MotionAnalysis {
  stabilityScore: number;    // 0-100
  motionVectors: Point[];
  blurLevel: number;        // 0-100
  recommendations: string[];
}

/**
 * Computer Vision Analysis Engine
 */
export class ComputerVisionAnalyzer {
  private static instance: ComputerVisionAnalyzer;

  static getInstance(): ComputerVisionAnalyzer {
    if (!ComputerVisionAnalyzer.instance) {
      ComputerVisionAnalyzer.instance = new ComputerVisionAnalyzer();
    }
    return ComputerVisionAnalyzer.instance;
  }

  /**
   * Detect facial landmarks using template matching and feature detection
   */
  async detectFacialLandmarks(imageData: ImageData): Promise<FacialLandmarks> {
    loggingService.info('ComputerVisionAnalyzer', 'Starting facial landmark detection');

    try {
      const grayData = this.convertToGrayscale(imageData);
      
      // Detect face region first
      const faceRegion = await this.detectFaceRegion(grayData, imageData.width, imageData.height);
      
      if (!faceRegion) {
        throw new Error('No face detected in image');
      }

      // Detect individual features within face region
      const eyes = await this.detectEyes(grayData, faceRegion, imageData.width, imageData.height);
      const nose = await this.detectNose(grayData, faceRegion, imageData.width, imageData.height);
      const mouth = await this.detectMouth(grayData, faceRegion, imageData.width, imageData.height);
      const faceOutline = await this.detectFaceOutline(grayData, faceRegion, imageData.width, imageData.height);

      const landmarks: FacialLandmarks = {
        eyes,
        nose,
        mouth,
        face: faceOutline,
        confidence: this.calculateLandmarkConfidence(eyes, nose, mouth, faceOutline)
      };

      loggingService.info('ComputerVisionAnalyzer', 'Facial landmarks detected', {
        eyeCount: eyes.length,
        confidence: landmarks.confidence
      });

      return landmarks;

    } catch (error) {
      loggingService.error('ComputerVisionAnalyzer', 'Landmark detection failed', error as Error);
      return this.getDefaultLandmarks();
    }
  }

  /**
   * Extract comprehensive feature map from image
   */
  async extractFeatures(imageData: ImageData): Promise<FeatureMap> {
    loggingService.info('ComputerVisionAnalyzer', 'Extracting image features');

    const grayData = this.convertToGrayscale(imageData);
    
    // Parallel feature extraction
    const [edges, corners, blobs, lines, textures] = await Promise.all([
      this.detectEdges(grayData, imageData.width, imageData.height),
      this.detectCorners(grayData, imageData.width, imageData.height),
      this.detectBlobs(grayData, imageData.width, imageData.height),
      this.detectLines(grayData, imageData.width, imageData.height),
      this.analyzeTextures(grayData, imageData.width, imageData.height)
    ]);

    return { edges, corners, blobs, lines, textures };
  }

  /**
   * Analyze facial symmetry
   */
  async analyzeSymmetry(landmarks: FacialLandmarks, imageData: ImageData): Promise<SymmetryAnalysis> {
    loggingService.info('ComputerVisionAnalyzer', 'Analyzing facial symmetry');

    if (!landmarks.eyes || landmarks.eyes.length < 2) {
      return this.getDefaultSymmetryAnalysis();
    }

    const leftEye = landmarks.eyes[0];
    const rightEye = landmarks.eyes[1];
    
    // Calculate facial midline
    const faceMidline = this.calculateFacialMidline(landmarks);
    
    // Analyze left-right balance
    const leftRightBalance = this.calculateLeftRightBalance(landmarks, faceMidline);
    
    // Analyze vertical alignment
    const verticalAlignment = this.calculateVerticalAlignment(landmarks);
    
    // Detect asymmetry areas
    const asymmetryAreas = this.detectAsymmetryAreas(imageData, faceMidline);
    
    // Calculate overall facial symmetry
    const facialSymmetry = this.calculateFacialSymmetry(leftEye, rightEye, landmarks.nose, landmarks.mouth);
    
    const symmetryScore = (facialSymmetry + leftRightBalance + verticalAlignment) / 3;

    return {
      facialSymmetry,
      leftRightBalance,
      verticalAlignment,
      asymmetryAreas,
      symmetryScore
    };
  }

  /**
   * Analyze motion and stability
   */
  async analyzeMotion(imageData: ImageData): Promise<MotionAnalysis> {
    loggingService.info('ComputerVisionAnalyzer', 'Analyzing motion and stability');

    const grayData = this.convertToGrayscale(imageData);
    
    // Motion blur detection
    const blurLevel = this.detectMotionBlur(grayData, imageData.width, imageData.height);
    
    // Stability analysis (simplified - would need multiple frames for full analysis)
    const stabilityScore = 100 - blurLevel; // Higher blur = lower stability
    
    // Generate recommendations
    const recommendations = this.generateMotionRecommendations(blurLevel, stabilityScore);

    return {
      stabilityScore,
      motionVectors: [], // Would need frame sequence for real motion vectors
      blurLevel,
      recommendations
    };
  }

  // Helper Methods

  private convertToGrayscale(imageData: ImageData): Uint8Array {
    const { data, width, height } = imageData;
    const grayData = new Uint8Array(width * height);

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      grayData[i / 4] = gray;
    }

    return grayData;
  }

  private async detectFaceRegion(grayData: Uint8Array, width: number, height: number): Promise<Rectangle | null> {
    // Simplified face detection using Viola-Jones-like approach
    // In a real implementation, this would use cascade classifiers
    
    const minFaceSize = Math.min(width, height) * 0.1;
    const maxFaceSize = Math.min(width, height) * 0.8;
    
    // Look for face-like rectangular regions with appropriate aspect ratio
    for (let size = minFaceSize; size <= maxFaceSize; size += 10) {
      for (let y = 0; y < height - size; y += 5) {
        for (let x = 0; x < width - size; x += 5) {
          const score = this.evaluateFaceRegion(grayData, x, y, size, size, width, height);
          if (score > 0.7) {
            return { x, y, width: size, height: size };
          }
        }
      }
    }

    // Fallback: assume center region is face
    const faceSize = Math.min(width, height) * 0.6;
    return {
      x: (width - faceSize) / 2,
      y: (height - faceSize) / 2,
      width: faceSize,
      height: faceSize
    };
  }

  private evaluateFaceRegion(grayData: Uint8Array, x: number, y: number, w: number, h: number, imgWidth: number, imgHeight: number): number {
    // Simplified face evaluation based on intensity patterns
    let score = 0;
    
    // Check for eye regions (darker areas in upper third)
    const eyeY = y + h * 0.3;
    const leftEyeX = x + w * 0.25;
    const rightEyeX = x + w * 0.75;
    
    const leftEyeIntensity = this.getRegionIntensity(grayData, leftEyeX - 10, eyeY - 5, 20, 10, imgWidth, imgHeight);
    const rightEyeIntensity = this.getRegionIntensity(grayData, rightEyeX - 10, eyeY - 5, 20, 10, imgWidth, imgHeight);
    
    // Check for mouth region (variable intensity in lower third)
    const mouthY = y + h * 0.75;
    const mouthX = x + w * 0.5;
    const mouthIntensity = this.getRegionIntensity(grayData, mouthX - 15, mouthY - 5, 30, 10, imgWidth, imgHeight);
    
    // Face detection heuristics
    if (leftEyeIntensity < 100 && rightEyeIntensity < 100) score += 0.4; // Dark eye regions
    if (Math.abs(leftEyeIntensity - rightEyeIntensity) < 30) score += 0.3; // Similar eye intensities
    if (mouthIntensity > 80 && mouthIntensity < 180) score += 0.3; // Moderate mouth intensity
    
    return score;
  }

  private getRegionIntensity(grayData: Uint8Array, x: number, y: number, w: number, h: number, imgWidth: number, imgHeight: number): number {
    let total = 0;
    let count = 0;
    
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const px = Math.floor(x + dx);
        const py = Math.floor(y + dy);
        
        if (px >= 0 && px < imgWidth && py >= 0 && py < imgHeight) {
          total += grayData[py * imgWidth + px];
          count++;
        }
      }
    }
    
    return count > 0 ? total / count : 0;
  }

  private async detectEyes(grayData: Uint8Array, faceRegion: Rectangle, width: number, height: number): Promise<FacialLandmarks['eyes']> {
    const eyes: FacialLandmarks['eyes'] = [];
    
    // Search for eye regions in upper third of face
    const eyeSearchY = faceRegion.y + faceRegion.height * 0.25;
    const eyeSearchHeight = faceRegion.height * 0.3;
    
    // Left eye search region
    const leftEyeX = faceRegion.x + faceRegion.width * 0.15;
    const leftEyeW = faceRegion.width * 0.35;
    
    // Right eye search region
    const rightEyeX = faceRegion.x + faceRegion.width * 0.5;
    const rightEyeW = faceRegion.width * 0.35;
    
    // Detect left eye
    const leftEye = this.findEyeInRegion(grayData, leftEyeX, eyeSearchY, leftEyeW, eyeSearchHeight, width, height);
    if (leftEye) eyes.push(leftEye);
    
    // Detect right eye
    const rightEye = this.findEyeInRegion(grayData, rightEyeX, eyeSearchY, rightEyeW, eyeSearchHeight, width, height);
    if (rightEye) eyes.push(rightEye);
    
    return eyes;
  }

  private findEyeInRegion(grayData: Uint8Array, x: number, y: number, w: number, h: number, imgWidth: number, imgHeight: number): FacialLandmarks['eyes'][0] | null {
    // Find darkest region (likely pupil/iris)
    let minIntensity = 255;
    let eyeCenter: Point = { x: x + w/2, y: y + h/2 };
    
    for (let dy = 0; dy < h; dy += 2) {
      for (let dx = 0; dx < w; dx += 2) {
        const px = Math.floor(x + dx);
        const py = Math.floor(y + dy);
        
        if (px >= 0 && px < imgWidth && py >= 0 && py < imgHeight) {
          const intensity = grayData[py * imgWidth + px];
          if (intensity < minIntensity) {
            minIntensity = intensity;
            eyeCenter = { x: px, y: py };
          }
        }
      }
    }
    
    // Estimate eye features
    const eyeWidth = w * 0.3;
    const eyeHeight = h * 0.6;
    
    return {
      center: eyeCenter,
      corners: [
        { x: eyeCenter.x - eyeWidth/2, y: eyeCenter.y },
        { x: eyeCenter.x + eyeWidth/2, y: eyeCenter.y }
      ],
      pupil: eyeCenter,
      iris: {
        center: eyeCenter,
        radius: Math.min(eyeWidth, eyeHeight) * 0.4
      },
      eyelids: [
        { x: eyeCenter.x - eyeWidth/2, y: eyeCenter.y - eyeHeight/2 },
        { x: eyeCenter.x, y: eyeCenter.y - eyeHeight/2 },
        { x: eyeCenter.x + eyeWidth/2, y: eyeCenter.y - eyeHeight/2 },
        { x: eyeCenter.x + eyeWidth/2, y: eyeCenter.y + eyeHeight/2 },
        { x: eyeCenter.x, y: eyeCenter.y + eyeHeight/2 },
        { x: eyeCenter.x - eyeWidth/2, y: eyeCenter.y + eyeHeight/2 }
      ]
    };
  }

  private async detectNose(grayData: Uint8Array, faceRegion: Rectangle, width: number, height: number): Promise<FacialLandmarks['nose']> {
    // Nose is typically in center of face, middle third vertically
    const noseX = faceRegion.x + faceRegion.width * 0.5;
    const noseY = faceRegion.y + faceRegion.height * 0.5;
    
    return {
      tip: { x: noseX, y: noseY + faceRegion.height * 0.1 },
      bridge: [
        { x: noseX, y: noseY - faceRegion.height * 0.1 },
        { x: noseX, y: noseY },
        { x: noseX, y: noseY + faceRegion.height * 0.05 }
      ],
      nostrils: [
        { x: noseX - faceRegion.width * 0.04, y: noseY + faceRegion.height * 0.08 },
        { x: noseX + faceRegion.width * 0.04, y: noseY + faceRegion.height * 0.08 }
      ]
    };
  }

  private async detectMouth(grayData: Uint8Array, faceRegion: Rectangle, width: number, height: number): Promise<FacialLandmarks['mouth']> {
    // Mouth is in lower third of face
    const mouthY = faceRegion.y + faceRegion.height * 0.75;
    const mouthX = faceRegion.x + faceRegion.width * 0.5;
    const mouthWidth = faceRegion.width * 0.25;
    
    return {
      center: { x: mouthX, y: mouthY },
      corners: [
        { x: mouthX - mouthWidth/2, y: mouthY },
        { x: mouthX + mouthWidth/2, y: mouthY }
      ],
      upperLip: [
        { x: mouthX - mouthWidth/2, y: mouthY - 3 },
        { x: mouthX, y: mouthY - 5 },
        { x: mouthX + mouthWidth/2, y: mouthY - 3 }
      ],
      lowerLip: [
        { x: mouthX - mouthWidth/2, y: mouthY + 3 },
        { x: mouthX, y: mouthY + 8 },
        { x: mouthX + mouthWidth/2, y: mouthY + 3 }
      ]
    };
  }

  private async detectFaceOutline(grayData: Uint8Array, faceRegion: Rectangle, width: number, height: number): Promise<FacialLandmarks['face']> {
    // Simplified face outline based on detected region
    const { x, y, width: w, height: h } = faceRegion;
    
    return {
      outline: [
        { x: x + w * 0.1, y: y + h * 0.1 },    // Top left
        { x: x + w * 0.5, y: y },              // Top center
        { x: x + w * 0.9, y: y + h * 0.1 },    // Top right
        { x: x + w, y: y + h * 0.5 },          // Right center
        { x: x + w * 0.8, y: y + h * 0.9 },    // Bottom right
        { x: x + w * 0.5, y: y + h },          // Bottom center (chin)
        { x: x + w * 0.2, y: y + h * 0.9 },    // Bottom left
        { x: x, y: y + h * 0.5 }               // Left center
      ],
      chin: { x: x + w * 0.5, y: y + h },
      forehead: [
        { x: x + w * 0.2, y: y + h * 0.1 },
        { x: x + w * 0.5, y: y },
        { x: x + w * 0.8, y: y + h * 0.1 }
      ]
    };
  }

  private async detectEdges(grayData: Uint8Array, width: number, height: number): Promise<ImageData> {
    // Sobel edge detection
    const edgeData = new Uint8ClampedArray(width * height * 4);
    
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixelIndex = (y + ky) * width + (x + kx);
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            
            gx += grayData[pixelIndex] * sobelX[kernelIndex];
            gy += grayData[pixelIndex] * sobelY[kernelIndex];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const edgeIntensity = Math.min(255, magnitude);
        
        const outputIndex = (y * width + x) * 4;
        edgeData[outputIndex] = edgeIntensity;     // Red
        edgeData[outputIndex + 1] = edgeIntensity; // Green
        edgeData[outputIndex + 2] = edgeIntensity; // Blue
        edgeData[outputIndex + 3] = 255;           // Alpha
      }
    }
    
    return new ImageData(edgeData, width, height);
  }

  private async detectCorners(grayData: Uint8Array, width: number, height: number): Promise<Point[]> {
    // Harris corner detection (simplified)
    const corners: Point[] = [];
    const threshold = 1000000; // Corner response threshold
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const response = this.calculateCornerResponse(grayData, x, y, width, height);
        
        if (response > threshold) {
          corners.push({ x, y });
        }
      }
    }
    
    return this.nonMaxSuppression(corners, 10); // Remove nearby corners
  }

  private calculateCornerResponse(grayData: Uint8Array, x: number, y: number, width: number, height: number): number {
    // Simplified Harris corner response
    let ix = 0, iy = 0, ixy = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const x1 = Math.max(0, Math.min(width - 1, x + dx));
        const y1 = Math.max(0, Math.min(height - 1, y + dy));
        const x2 = Math.max(0, Math.min(width - 1, x + dx + 1));
        const y2 = Math.max(0, Math.min(height - 1, y + dy + 1));
        
        const gradX = grayData[y1 * width + x2] - grayData[y1 * width + x1];
        const gradY = grayData[y2 * width + x1] - grayData[y1 * width + x1];
        
        ix += gradX * gradX;
        iy += gradY * gradY;
        ixy += gradX * gradY;
      }
    }
    
    const det = ix * iy - ixy * ixy;
    const trace = ix + iy;
    const k = 0.04;
    
    return det - k * trace * trace;
  }

  private nonMaxSuppression(points: Point[], radius: number): Point[] {
    const suppressed: Point[] = [];
    
    for (const point of points) {
      let isMax = true;
      
      for (const other of points) {
        if (point !== other) {
          const distance = Math.sqrt(
            Math.pow(point.x - other.x, 2) + Math.pow(point.y - other.y, 2)
          );
          
          if (distance < radius) {
            isMax = false;
            break;
          }
        }
      }
      
      if (isMax) {
        suppressed.push(point);
      }
    }
    
    return suppressed;
  }

  private async detectBlobs(grayData: Uint8Array, width: number, height: number): Promise<Circle[]> {
    // Simplified blob detection using intensity thresholding
    const blobs: Circle[] = [];
    const visited = new Array(width * height).fill(false);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        
        if (!visited[index] && grayData[index] < 100) { // Dark blob threshold
          const blob = this.growBlob(grayData, visited, x, y, width, height);
          
          if (blob && blob.radius > 5) {
            blobs.push(blob);
          }
        }
      }
    }
    
    return blobs;
  }

  private growBlob(grayData: Uint8Array, visited: boolean[], startX: number, startY: number, width: number, height: number): Circle | null {
    const pixels: Point[] = [];
    const stack: Point[] = [{ x: startX, y: startY }];
    const threshold = 100;
    
    while (stack.length > 0) {
      const { x, y } = stack.pop()!;
      const index = y * width + x;
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited[index] || grayData[index] >= threshold) {
        continue;
      }
      
      visited[index] = true;
      pixels.push({ x, y });
      
      // Add neighbors
      stack.push(
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 }
      );
    }
    
    if (pixels.length < 10) return null;
    
    // Calculate centroid and average radius
    const centerX = pixels.reduce((sum, p) => sum + p.x, 0) / pixels.length;
    const centerY = pixels.reduce((sum, p) => sum + p.y, 0) / pixels.length;
    
    const avgRadius = pixels.reduce((sum, p) => {
      return sum + Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2));
    }, 0) / pixels.length;
    
    return {
      center: { x: centerX, y: centerY },
      radius: avgRadius
    };
  }

  private async detectLines(grayData: Uint8Array, width: number, height: number): Promise<Line[]> {
    // Simplified Hough transform for line detection
    const edges = await this.detectEdges(grayData, width, height);
    const lines: Line[] = [];
    
    // This is a simplified version - full Hough transform would be more complex
    // For now, detect strong horizontal and vertical features
    
    for (let y = 0; y < height - 20; y += 10) {
      let horizontalStrength = 0;
      for (let x = 0; x < width - 1; x++) {
        const edgeValue = edges.data[(y * width + x) * 4];
        horizontalStrength += edgeValue;
      }
      
      if (horizontalStrength > width * 50) { // Threshold for line detection
        lines.push({
          start: { x: 0, y },
          end: { x: width - 1, y },
          angle: 0,
          strength: horizontalStrength / (width * 255)
        });
      }
    }
    
    for (let x = 0; x < width - 20; x += 10) {
      let verticalStrength = 0;
      for (let y = 0; y < height - 1; y++) {
        const edgeValue = edges.data[(y * width + x) * 4];
        verticalStrength += edgeValue;
      }
      
      if (verticalStrength > height * 50) {
        lines.push({
          start: { x, y: 0 },
          end: { x, y: height - 1 },
          angle: 90,
          strength: verticalStrength / (height * 255)
        });
      }
    }
    
    return lines;
  }

  private async analyzeTextures(grayData: Uint8Array, width: number, height: number): Promise<TextureRegion[]> {
    const textures: TextureRegion[] = [];
    const windowSize = 32;
    
    for (let y = 0; y < height - windowSize; y += windowSize / 2) {
      for (let x = 0; x < width - windowSize; x += windowSize / 2) {
        const textureRegion = this.analyzeTextureWindow(grayData, x, y, windowSize, windowSize, width, height);
        
        if (textureRegion) {
          textures.push(textureRegion);
        }
      }
    }
    
    return textures;
  }

  private analyzeTextureWindow(grayData: Uint8Array, x: number, y: number, w: number, h: number, imgWidth: number, imgHeight: number): TextureRegion | null {
    let variance = 0;
    let mean = 0;
    let pixelCount = 0;
    
    // Calculate mean
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const px = x + dx;
        const py = y + dy;
        
        if (px < imgWidth && py < imgHeight) {
          mean += grayData[py * imgWidth + px];
          pixelCount++;
        }
      }
    }
    mean /= pixelCount;
    
    // Calculate variance
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const px = x + dx;
        const py = y + dy;
        
        if (px < imgWidth && py < imgHeight) {
          const value = grayData[py * imgWidth + px];
          variance += Math.pow(value - mean, 2);
        }
      }
    }
    variance /= pixelCount;
    
    const standardDev = Math.sqrt(variance);
    
    // Classify texture pattern
    let pattern: TextureRegion['pattern'];
    if (standardDev < 10) pattern = 'uniform';
    else if (standardDev < 25) pattern = 'smooth';
    else if (standardDev < 50) pattern = 'rough';
    else pattern = 'irregular';
    
    return {
      bounds: { x, y, width: w, height: h },
      pattern,
      orientation: 0, // Simplified
      strength: standardDev / 255
    };
  }

  // Additional helper methods for symmetry and motion analysis
  
  private calculateLandmarkConfidence(eyes: any[], nose: any, mouth: any, face: any): number {
    let confidence = 0.5; // Base confidence
    
    if (eyes.length >= 2) confidence += 0.3;
    if (nose && nose.tip) confidence += 0.1;
    if (mouth && mouth.center) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private getDefaultLandmarks(): FacialLandmarks {
    return {
      eyes: [],
      nose: {
        tip: { x: 0, y: 0 },
        bridge: [],
        nostrils: []
      },
      mouth: {
        corners: [],
        upperLip: [],
        lowerLip: [],
        center: { x: 0, y: 0 }
      },
      face: {
        outline: [],
        chin: { x: 0, y: 0 },
        forehead: []
      },
      confidence: 0.4
    };
  }

  private calculateFacialMidline(landmarks: FacialLandmarks): Line {
    // Calculate vertical midline of face
    const faceCenter = landmarks.face.chin;
    const foreheadCenter = landmarks.face.forehead.length > 0 ? 
      landmarks.face.forehead[Math.floor(landmarks.face.forehead.length / 2)] : 
      { x: faceCenter.x, y: faceCenter.y - 100 };
    
    return {
      start: foreheadCenter,
      end: faceCenter,
      angle: 90,
      strength: 1.0
    };
  }

  private calculateLeftRightBalance(landmarks: FacialLandmarks, midline: Line): number {
    if (landmarks.eyes.length < 2) return 50; // Default if eyes not detected
    
    const leftEye = landmarks.eyes[0];
    const rightEye = landmarks.eyes[1];
    const midlineX = midline.start.x;
    
    const leftDistance = Math.abs(leftEye.center.x - midlineX);
    const rightDistance = Math.abs(rightEye.center.x - midlineX);
    
    const balance = 1 - Math.abs(leftDistance - rightDistance) / Math.max(leftDistance, rightDistance);
    return balance * 100;
  }

  private calculateVerticalAlignment(landmarks: FacialLandmarks): number {
    if (landmarks.eyes.length < 2) return 50;
    
    const leftEye = landmarks.eyes[0];
    const rightEye = landmarks.eyes[1];
    
    const eyeHeightDiff = Math.abs(leftEye.center.y - rightEye.center.y);
    const eyeDistance = Math.abs(leftEye.center.x - rightEye.center.x);
    
    const alignment = 1 - Math.min(1, eyeHeightDiff / (eyeDistance * 0.1));
    return alignment * 100;
  }

  private calculateFacialSymmetry(leftEye: any, rightEye: any, nose: any, mouth: any): number {
    // Simplified symmetry calculation
    if (!leftEye || !rightEye) return 50;
    
    const eyeSymmetry = this.calculateLeftRightBalance({ eyes: [leftEye, rightEye] } as any, {
      start: { x: (leftEye.center.x + rightEye.center.x) / 2, y: 0 },
      end: { x: (leftEye.center.x + rightEye.center.x) / 2, y: 100 }
    } as Line);
    
    return eyeSymmetry;
  }

  private detectAsymmetryAreas(imageData: ImageData, midline: Line): Rectangle[] {
    // Simplified asymmetry detection
    // In a real implementation, this would compare left and right halves of the face
    return [];
  }

  private getDefaultSymmetryAnalysis(): SymmetryAnalysis {
    return {
      facialSymmetry: 50,
      leftRightBalance: 50,
      verticalAlignment: 50,
      asymmetryAreas: [],
      symmetryScore: 50
    };
  }

  private detectMotionBlur(grayData: Uint8Array, width: number, height: number): number {
    // Detect motion blur using variance of Laplacian
    let laplacianVariance = 0;
    let count = 0;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = grayData[y * width + x];
        const top = grayData[(y - 1) * width + x];
        const bottom = grayData[(y + 1) * width + x];
        const left = grayData[y * width + (x - 1)];
        const right = grayData[y * width + (x + 1)];
        
        const laplacian = -4 * center + top + bottom + left + right;
        laplacianVariance += laplacian * laplacian;
        count++;
      }
    }
    
    const variance = laplacianVariance / count;
    const blurThreshold = 100; // Threshold for determining blur
    
    return Math.max(0, Math.min(100, 100 - (variance / blurThreshold) * 100));
  }

  private generateMotionRecommendations(blurLevel: number, stabilityScore: number): string[] {
    const recommendations: string[] = [];
    
    if (blurLevel > 50) {
      recommendations.push('Reduce camera movement for clearer images');
      recommendations.push('Use a tripod or stabilize the device');
    }
    
    if (stabilityScore < 70) {
      recommendations.push('Ensure steady hands during capture');
      recommendations.push('Take multiple shots and select the clearest one');
    }
    
    if (blurLevel > 30) {
      recommendations.push('Improve lighting conditions to allow faster shutter speeds');
    }
    
    return recommendations;
  }

}